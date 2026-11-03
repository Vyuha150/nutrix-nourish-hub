import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Search, Heart, ShoppingBag, User, Trash2, Plus, Minus, ArrowRight, LayoutDashboard, LogOut, Sparkles, LogIn, UserPlus, Package } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCommerce } from "./CommerceProvider";
import { useAuth } from "@/context/AuthContext";
import { resolveProductImage } from "@/lib/productMedia";
import { CustomerSearchAutocomplete } from "./CustomerSearchAutocomplete";

export const Header = () => {
  const navigate = useNavigate();
  const { user: authUser, isAdmin, signOut: authSignOut } = useAuth();
  const {
    products,
    user: commerceUser,
    cart,
    wishlist,
    cartCount,
    cartTotal,
    addToCart,
    updateCartQty,
    removeFromCart,
    toggleWishlist,
    isWishlisted,
    clearWishlistItem,
    signOut: commerceSignOut,
  } = useCommerce();

  // Combine auth user and fallback commerce user
  const currentUser = authUser
    ? { name: authUser.name, email: authUser.email, role: authUser.role }
    : commerceUser
    ? { name: commerceUser.name, email: commerceUser.email, role: "customer" }
    : null;

  const [accountOpen, setAccountOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const productLookup = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products]);
  const cartItems = useMemo(
    () => cart.map((item) => ({ ...item, product: productLookup[item.productId] })),
    [cart, productLookup]
  );
  const wishlistItems = useMemo(
    () => wishlist.map((productId) => productLookup[productId]).filter(Boolean),
    [wishlist, productLookup]
  );

  const checkout = () => {
    setCartOpen(false);
    navigate("/checkout");
  };

  const buttons: Array<{
    label: string;
    Icon: typeof User;
    onClick: () => void;
    badge?: number;
  }> = [
    { label: "Account", Icon: User, onClick: () => setAccountOpen(true) },
    {
      label: "Wishlist",
      Icon: Heart,
      onClick: () => setWishlistOpen(true),
      badge: wishlist.length,
    },
    {
      label: "Cart",
      Icon: ShoppingBag,
      onClick: () => setCartOpen(true),
      badge: cartCount,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="container-tight h-20 grid grid-cols-12 items-center gap-6">
          <a href="/" className="col-span-3 flex items-center">
            <Logo size={36} variant="dark" />
          </a>
          <div className="col-span-6 hidden md:block">
            <CustomerSearchAutocomplete />
          </div>
          <div className="col-span-9 md:col-span-3 flex items-center justify-end gap-3 sm:gap-5">
            {/* Mobile search toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Toggle search"
              className="md:hidden relative group p-1"
            >
              <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                aria-label="Admin panel"
                title="Admin panel"
                className="relative group inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-leaf/15 hover:bg-leaf/25 text-primary-foreground transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-semibold uppercase tracking-wider hidden lg:inline">Admin</span>
              </Link>
            )}
            {buttons.map(({ label, Icon, onClick, badge }) => (
              <button
                key={label}
                onClick={onClick}
                aria-label={label}
                className="relative group"
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                {badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-leaf text-[10px] font-semibold text-leaf-foreground flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden container-tight pb-3 animate-fade-in">
            <CustomerSearchAutocomplete
              autoFocus
              onSelectProduct={() => setMobileSearchOpen(false)}
            />
          </div>
        )}
      </header>

      {/* Account Dialog */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {currentUser ? "Your account" : "Welcome to Nutrix"}
            </DialogTitle>
            <DialogDescription>
              {currentUser
                ? "Manage your saved cart, wishlist and checkout preferences."
                : "Sign in to keep your cart and personalized health goals synchronized."}
            </DialogDescription>
          </DialogHeader>
          {currentUser ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-leaf/15 grid place-items-center shrink-0">
                  <Sparkles className="w-5 h-5 text-leaf" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-serif text-lg text-primary truncate">{currentUser.name}</p>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-leaf/20 text-leaf text-[10px] font-bold uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{currentUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <button type="button" onClick={() => { setAccountOpen(false); setWishlistOpen(true); }} className="rounded-xl border border-border p-3 text-left hover:bg-dew transition-colors">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Wishlist</div>
                  <div className="font-semibold text-primary mt-1">{wishlist.length} items</div>
                </button>
                <button type="button" onClick={() => { setAccountOpen(false); setCartOpen(true); }} className="rounded-xl border border-border p-3 text-left hover:bg-dew transition-colors">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Cart</div>
                  <div className="font-semibold text-primary mt-1">{cartCount} items</div>
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setAccountOpen(false);
                  navigate("/orders");
                }}
                className="w-full gap-2 border-primary/20 hover:bg-mist/40 text-primary"
              >
                <Package className="w-4 h-4 text-leaf" /> My Orders
              </Button>

              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/admin");
                  }}
                  className="w-full gap-2 border-leaf/30 text-leaf hover:bg-leaf/10"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Admin Dashboard
                </Button>
              )}

              <DialogFooter className="sm:justify-between gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    authSignOut();
                    commerceSignOut();
                    setAccountOpen(false);
                  }}
                  className="w-full gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-dew p-4 text-sm text-forest leading-relaxed">
                Sign in with your email to keep your cart, custom stacks, and orders synchronized.
              </div>
              <div className="flex flex-col gap-2.5">
                <Button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/signin");
                  }}
                  className="w-full gap-2 h-11 rounded-full bg-primary hover:bg-forest text-primary-foreground font-medium shadow-soft"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate("/signup");
                  }}
                  className="w-full gap-2 h-11 rounded-full border-primary/20 text-primary hover:bg-mist/40"
                >
                  <UserPlus className="w-4 h-4" /> Create an Account
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Wishlist Sheet */}
      <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">Your wishlist</SheetTitle>
            <SheetDescription>
              {wishlist.length
                ? `${wishlist.length} saved item${wishlist.length > 1 ? "s" : ""}.`
                : "Save formulas you love for later."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {wishlistItems.map((product) => product && (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 bg-card"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-mist">
                    <img src={resolveProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-serif text-sm text-primary truncate">
                    {product.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addToCart(product)}
                  >
                    Add
                  </Button>
                  <button
                    onClick={() => clearWishlistItem(product.id)}
                    className="w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {!wishlist.length && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Your wishlist is empty.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">Your cart</SheetTitle>
            <SheetDescription>
              {cartCount
                ? `${cartCount} item${cartCount > 1 ? "s" : ""} ready to ship.`
                : "Your cart is empty."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 bg-card"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-mist shrink-0">
                    <img src={item.product ? resolveProductImage(item.product) : undefined} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                  <p className="font-serif text-sm text-primary truncate">
                      {item.productName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                      ₹{item.price} each
                  </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      onClick={() => updateCartQty(item.productId, -1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-l-full"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.productId, 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-r-full"
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!cart.length && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Add a formula to get started.
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <SheetFooter className="border-t border-border pt-4 sm:flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <button type="button" onClick={() => setWishlistOpen(true)} className="hover:text-primary">View wishlist</button>
                <span>·</span>
                <button type="button" onClick={() => setCartOpen(false)} className="hover:text-primary">Continue shopping</button>
              </div>
              <div className="w-full flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-serif text-2xl text-primary">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <Button onClick={checkout} className="w-full gap-2">
                Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
