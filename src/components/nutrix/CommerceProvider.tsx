import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { publicApi } from "@/lib/api";
import type { LabReportRecord, OfferRecord, ProductRecord, PromoRecord, SiteConfigRecord, UserCartItem, UserStatePayload } from "@/lib/types";

type AuthUser = {
  userId: string;
  email: string;
  name: string;
  picture?: string;
};

type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

type CommerceContextValue = {
  products: ProductRecord[];
  offers: OfferRecord[];
  labReports: LabReportRecord[];
  promos: PromoRecord[];
  siteConfig: SiteConfigRecord | null;
  user: AuthUser | null;
  loading: boolean;
  cart: UserCartItem[];
  wishlist: string[];
  cartCount: number;
  cartTotal: number;
  signInWithGoogle: () => Promise<void>;
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

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

const decodeJwtPayload = (credential: string) => {
  const part = credential.split(".")[1];
  if (!part) return null;

  try {
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json))) as { sub: string; email: string; name: string; picture?: string };
  } catch {
    return null;
  }
};

const applySignedInUser = (profile: GoogleProfile, setUser: (user: AuthUser) => void) => {
  const nextUser: AuthUser = {
    userId: profile.sub,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
  };

  setUser(nextUser);
  localStorage.setItem("nutrix:user", JSON.stringify(nextUser));
  toast.success(`Signed in as ${profile.name}`);
};

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
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [labReports, setLabReports] = useState<LabReportRecord[]>([]);
  const [promos, setPromos] = useState<PromoRecord[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfigRecord | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cart, setCart] = useState<UserCartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

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
        console.error(error);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("nutrix:user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as AuthUser);
      } catch {
        localStorage.removeItem("nutrix:user");
      }
    }

    const guestState = readGuestState();
    setCart(guestState.cart ?? []);
    setWishlist(guestState.wishlist ?? []);
    setHydrated(true);
  }, []);

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
    publicApi.saveUserState(user.userId, nextState).catch((error) => console.error(error));
  }, [cart, wishlist, hydrated, user]);

  useEffect(() => {
    if (!user || !hydrated) return;

    (async () => {
      try {
        const state = await publicApi.getUserState(user.userId);
        if (state) {
          setCart(state.cart ?? []);
          setWishlist(state.wishlist ?? []);
          writeUserState(user.userId, state);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [hydrated, user]);

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
    if (!user) {
      toast.error("Sign in with Google to add items to your cart.");
      void signInWithGoogle();
      return;
    }

    syncCart((currentCart) => mergeProductIntoCart(currentCart, product, qty));
    toast.success(`${product.name} added to cart`);
  };

  const addProductsToCart = (productsToAdd: ProductRecord[]) => {
    if (!user) {
      toast.error("Sign in with Google to add items to your cart.");
      void signInWithGoogle();
      return false;
    }

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

  const signInWithGoogle = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error("Google client ID is not configured");
      return;
    }

    try {
      await loadScript("https://accounts.google.com/gsi/client");
      const googleAccounts = window.google?.accounts?.id;
      const googleOauth = window.google?.accounts?.oauth2;
      if (!googleAccounts) {
        toast.error("Google sign-in is unavailable right now");
        return;
      }

      await new Promise<void>((resolve) => {
        let settled = false;
        let popupStarted = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          resolve();
        };

        const startPopupFallback = () => {
          if (popupStarted || settled) return;
          popupStarted = true;

          if (!googleOauth?.initTokenClient) {
            toast.error("Google popup login is unavailable right now");
            settle();
            return;
          }

          const tokenClient = googleOauth.initTokenClient({
            client_id: clientId,
            scope: "openid email profile",
            callback: async (tokenResponse: { access_token?: string; error?: string }) => {
              if (tokenResponse.error || !tokenResponse.access_token) {
                toast.error("Google popup login failed");
                settle();
                return;
              }

              try {
                const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });
                if (!response.ok) {
                  throw new Error("Unable to fetch Google profile");
                }

                const profile = (await response.json()) as GoogleProfile;
                if (!profile?.sub || !profile?.email || !profile?.name) {
                  throw new Error("Incomplete Google profile");
                }

                applySignedInUser(profile, setUser);
                settle();
              } catch (error) {
                console.error(error);
                toast.error("Unable to complete Google sign-in");
                settle();
              }
            },
          });

          tokenClient.requestAccessToken({ prompt: "select_account" });
        };

        const timeout = window.setTimeout(() => {
          startPopupFallback();
        }, 10000);

        googleAccounts.initialize({
          client_id: clientId,
          callback: (response) => {
            window.clearTimeout(timeout);
            const profile = decodeJwtPayload(response.credential);
            if (!profile) {
              toast.error("Unable to read Google profile");
              startPopupFallback();
              return;
            }

            applySignedInUser(profile, setUser);
            settle();
          },
        });

        googleAccounts.prompt((notification: any) => {
          if (settled) return;

          if (notification?.isNotDisplayed?.()) {
            window.clearTimeout(timeout);
            startPopupFallback();
            return;
          }

          if (notification?.isSkippedMoment?.()) {
            window.clearTimeout(timeout);
            startPopupFallback();
            return;
          }

          if (notification?.isDismissedMoment?.()) {
            window.clearTimeout(timeout);
            startPopupFallback();
          }
        });
      });
    } catch (error) {
      console.error(error);
      toast.error("Google sign-in failed to initialize");
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("nutrix:user");
    const guestState = readGuestState();
    setCart(guestState.cart ?? []);
    setWishlist(guestState.wishlist ?? []);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const requireAuth = () => {
    if (user) return true;
    toast.error("Sign in with Google to continue.");
    void signInWithGoogle();
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
      signInWithGoogle,
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
    [addProductsToCart, addToCart, cart, cartCount, cartTotal, clearWishlistItem, couponCode, isWishlisted, labReports, loading, offers, promos, products, removeFromCart, requireAuth, signInWithGoogle, signOut, siteConfig, toggleWishlist, updateCartQty, user, wishlist]
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

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (config?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}