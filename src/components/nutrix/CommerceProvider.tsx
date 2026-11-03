import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { publicApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { LabReportRecord, OfferRecord, ProductRecord, PromoRecord, SiteConfigRecord, UserCartItem, UserStatePayload } from "@/lib/types";

type CommerceUser = {
  userId: string;
  email: string;
  name: string;
};

type CommerceContextValue = {
  products: ProductRecord[];
  offers: OfferRecord[];
  labReports: LabReportRecord[];
  promos: PromoRecord[];
  siteConfig: SiteConfigRecord | null;
  user: CommerceUser | null;
  loading: boolean;
  cart: UserCartItem[];
  wishlist: string[];
  cartCount: number;
  cartTotal: number;
  signOut: () => void;
  addToCart: (product: ProductRecord, qty?: number) => void;
  addProductsToCart: (products: ProductRecord[]) => boolean;
  updateCartQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlistItem: (productId: string) => void;
  saveCouponCode: (code: string) => void;
  couponCode: string;
  requireAuth: () => boolean;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

const storageKeyFor = (prefix: string, userId: string) => `${prefix}:${userId}`;

const readUserState = (userId: string): UserStatePayload | null => {
  const raw = localStorage.getItem(storageKeyFor("nutrix:user-state", userId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserStatePayload;
  } catch {
    return null;
  }
};

const writeUserState = (userId: string, state: UserStatePayload) => {
  localStorage.setItem(storageKeyFor("nutrix:user-state", userId), JSON.stringify(state));
};

const guestStateKey = "nutrix:guest-state";

const readGuestState = (): Pick<UserStatePayload, "cart" | "wishlist"> => {
  const raw = localStorage.getItem(guestStateKey);
  if (!raw) return { cart: [], wishlist: [] };

  try {
    return JSON.parse(raw) as Pick<UserStatePayload, "cart" | "wishlist">;
  } catch {
    return { cart: [], wishlist: [] };
  }
};

const writeGuestState = (cart: UserCartItem[], wishlist: string[]) => {
  localStorage.setItem(guestStateKey, JSON.stringify({ cart, wishlist }));
};

export const CommerceProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, signOut: authSignOut } = useAuth();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [labReports, setLabReports] = useState<LabReportRecord[]>([]);
  const [promos, setPromos] = useState<PromoRecord[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfigRecord | null>(null);
  const [cart, setCart] = useState<UserCartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Single source of truth for commerce user derived directly from AuthContext
  const user: CommerceUser | null = useMemo(() => {
    if (!authUser) return null;
    return {
      userId: authUser.id,
      email: authUser.email,
      name: authUser.name,
    };
  }, [authUser]);

  // Load catalog data once on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [siteConfigPayload, promosPayload, offersPayload, productsPayload, labReportsPayload] = await Promise.all([
          publicApi.getSiteConfig(),
          publicApi.getPromos(),
          publicApi.getOffers(),
          publicApi.getProducts({ status: "active" }),
          publicApi.getLabReports(),
        ]);

        if (!active) return;
        setSiteConfig(siteConfigPayload);
        setPromos(promosPayload);
        setOffers(offersPayload);
        setProducts(productsPayload);
        setLabReports(labReportsPayload);
      } catch (error) {
        console.error("Failed to load catalog data:", error);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // When authUser changes: load that user's cart & wishlist (or guest state if unauthenticated)
  useEffect(() => {
    let active = true;

    if (!user) {
      const guestState = readGuestState();
      setCart(guestState.cart ?? []);
      setWishlist(guestState.wishlist ?? []);
      setHydrated(true);
      return;
    }

    // Authenticated user: load from local cache first, then sync with backend
    const cachedState = readUserState(user.userId);
    if (cachedState) {
      setCart(cachedState.cart ?? []);
      setWishlist(cachedState.wishlist ?? []);
    }

    (async () => {
      try {
        const state = await publicApi.getUserState(user.userId);
        if (active && state) {
          setCart(state.cart ?? []);
          setWishlist(state.wishlist ?? []);
          writeUserState(user.userId, state);
        }
      } catch (error) {
        // If 403 or network issue, fallback to cached or empty
        console.error("Failed to fetch user state:", error);
      } finally {
        if (active) setHydrated(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  // Sync cart & wishlist changes to persistence
  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      writeGuestState(cart, wishlist);
      return;
    }

    const nextState: UserStatePayload = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      cart,
      wishlist,
    };
    writeUserState(user.userId, nextState);
    publicApi.saveUserState(user.userId, nextState).catch((error) => console.error("Failed to save user state:", error));
  }, [cart, wishlist, hydrated, user]);

  const syncCart = (nextCart: UserCartItem[] | ((currentCart: UserCartItem[]) => UserCartItem[])) => {
    setCart((currentCart) => (typeof nextCart === "function" ? nextCart(currentCart) : nextCart));
  };

  const mergeProductIntoCart = (currentCart: UserCartItem[], product: ProductRecord, qty = 1) => {
    const existing = currentCart.find((item) => item.productId === product.id);
    if (existing) {
      return currentCart.map((item) =>
        item.productId === product.id ? { ...item, qty: item.qty + qty } : item
      );
    }

    return [
      ...currentCart,
      {
        productId: product.id,
        productName: product.name,
        price: product.price,
        qty,
        imageKey: product.imageKey,
      },
    ];
  };

  const syncWishlist = (nextWishlist: string[]) => {
    setWishlist(nextWishlist);
  };

  const addToCart = (product: ProductRecord, qty = 1) => {
    syncCart((currentCart) => mergeProductIntoCart(currentCart, product, qty));
    toast.success(`${product.name} added to cart`);
  };

  const addProductsToCart = (productsToAdd: ProductRecord[]) => {
    if (!productsToAdd.length) {
      return false;
    }

    syncCart((currentCart) => productsToAdd.reduce((nextCart, product) => mergeProductIntoCart(nextCart, product), currentCart));
    toast.success(`${productsToAdd.length} items added to cart`);
    return true;
  };

  const updateCartQty = (productId: string, delta: number) => {
    syncCart((currentCart) =>
      currentCart
        .map((item) => (item.productId === productId ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    syncCart((currentCart) => currentCart.filter((item) => item.productId !== productId));
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      syncWishlist(wishlist.filter((item) => item !== productId));
      return;
    }

    syncWishlist([...wishlist, productId]);
  };

  const clearWishlistItem = (productId: string) => {
    syncWishlist(wishlist.filter((item) => item !== productId));
  };

  const signOut = () => {
    authSignOut();
    const guestState = readGuestState();
    setCart(guestState.cart ?? []);
    setWishlist(guestState.wishlist ?? []);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const requireAuth = () => {
    if (user) return true;
    toast.error("Please sign in to continue.");
    return false;
  };

  const value = useMemo<CommerceContextValue>(
    () => ({
      products,
      offers,
      labReports,
      promos,
      siteConfig,
      user,
      loading,
      cart,
      wishlist,
      cartCount,
      cartTotal,
      signOut,
      addToCart,
      addProductsToCart,
      updateCartQty,
      removeFromCart,
      toggleWishlist,
      isWishlisted,
      clearWishlistItem,
      saveCouponCode: setCouponCode,
      couponCode,
      requireAuth,
    }),
    [
      addProductsToCart,
      addToCart,
      cart,
      cartCount,
      cartTotal,
      clearWishlistItem,
      couponCode,
      isWishlisted,
      labReports,
      loading,
      offers,
      promos,
      products,
      removeFromCart,
      requireAuth,
      signOut,
      siteConfig,
      toggleWishlist,
      updateCartQty,
      user,
      wishlist,
    ]
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error("useCommerce must be used within a CommerceProvider");
  }

  return context;
};