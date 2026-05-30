import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Search, Heart, ShoppingBag, User, Trash2, Plus, Minus, ArrowRight, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCommerce } from "./CommerceProvider";
import { resolveProductImage } from "@/lib/productMedia";

export const Header = () => {
  const navigate = useNavigate();
  const {
    products,
    user,
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
    signInWithGoogle,
    signOut,
  } = useCommerce();
  const [accountOpen, setAccountOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
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
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
              <input
                type="search"
                placeholder="Search formulas, nutrients, goals…"
                className="w-full h-11 rounded-full bg-dew text-primary placeholder:text-primary/50 pl-11 pr-5 text-sm outline-none focus:ring-2 focus:ring-leaf transition-all"
              />
            </div>
          </div>
          <div className="col-span-3 flex items-center justify-end gap-5">
            <a
              href="/admin"
              aria-label="Admin panel"
              title="Admin panel"
              className="relative group inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-leaf/15 hover:bg-leaf/25 text-primary-foreground transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-semibold uppercase tracking-wider hidden lg:inline">Admin</span>
            </a>
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
      </header>

      {/* Account Dialog */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {user ? "Your account" : "Sign in with Google"}
            </DialogTitle>
            <DialogDescription>
              {user
                ? "Manage your saved cart, wishlist and checkout preferences."
                : "Use Google to keep your cart and wishlist tied to your account."}
            </DialogDescription>
          </DialogHeader>
          {user ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-leaf/15 grid place-items-center shrink-0">
                  <Sparkles className="w-5 h-5 text-leaf" />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-lg text-primary truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <button type="button" onClick={() => setWishlistOpen(true)} className="rounded-xl border border-border p-3 text-left hover:bg-dew transition-colors">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Wishlist</div>
                  <div className="font-semibold text-primary mt-1">{wishlist.length} items</div>
                </button>
                <button type="button" onClick={() => setCartOpen(true)} className="rounded-xl border border-border p-3 text-left hover:bg-dew transition-colors">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Cart</div>
                  <div className="font-semibold text-primary mt-1">{cartCount} items</div>
                </button>
              </div>
              <DialogFooter className="sm:justify-between gap-2">
                <Button variant="secondary" onClick={signOut} className="w-full gap-2">
                  <LogOut className="w-4 h-4" /> Sign out
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-dew p-4 text-sm text-forest">
                One Google account keeps your wishlist and cart in sync across visits.
              </div>
              <Button type="button" onClick={async () => { await signInWithGoogle(); setAccountOpen(false); }} className="w-full">
                Continue with Google
              </Button>
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
