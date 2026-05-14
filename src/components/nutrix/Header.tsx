import { useState } from "react";
import { Logo } from "./Logo";
import { Search, Heart, ShoppingBag, User, Trash2, Plus, Minus, ArrowRight, LayoutDashboard } from "lucide-react";
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
import { toast } from "@/components/ui/sonner";

type CartItem = { name: string; price: number; qty: number };

export const Header = () => {
  const [accountOpen, setAccountOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Demo state — replace with real cart/wishlist when backend is wired
  const [wishlist, setWishlist] = useState<string[]>([
    "Vitamin D3 + K2 (MK-7)",
    "Omega-3 Algal Softgel",
  ]);
  const [cart, setCart] = useState<CartItem[]>([
    { name: "Complete Daily Foundation", price: 1499, qty: 1 },
    { name: "Multivitamin (Adults)", price: 549, qty: 2 },
  ]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const updateQty = (name: string, delta: number) =>
    setCart((c) =>
      c
        .map((i) => (i.name === name ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );

  const removeWish = (name: string) =>
    setWishlist((w) => w.filter((n) => n !== name));

  const moveWishToCart = (name: string) => {
    setCart((c) =>
      c.find((i) => i.name === name)
        ? c.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { name, price: 499, qty: 1 }]
    );
    removeWish(name);
    toast.success(`${name} added to cart`);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(authMode === "signin" ? "Welcome back" : "Account created");
    setAccountOpen(false);
  };

  const checkout = () => {
    toast.success("Redirecting to secure checkout…");
    setCartOpen(false);
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
              {authMode === "signin" ? "Welcome back" : "Create your account"}
            </DialogTitle>
            <DialogDescription>
              {authMode === "signin"
                ? "Sign in to access your stacks, orders and wishlist."
                : "Join Nutrix for personalised stacks and member pricing."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required placeholder="Jane Doe" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@nutrix.in" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required placeholder="••••••••" />
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button type="submit" className="w-full">
                {authMode === "signin" ? "Sign in" : "Create account"}
              </Button>
              <button
                type="button"
                onClick={() =>
                  setAuthMode((m) => (m === "signin" ? "signup" : "signin"))
                }
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {authMode === "signin"
                  ? "New here? Create an account"
                  : "Already a member? Sign in"}
              </button>
            </DialogFooter>
          </form>
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
            {wishlist.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 bg-card"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-leaf/15 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-leaf" />
                  </div>
                  <p className="font-serif text-sm text-primary truncate">
                    {name}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveWishToCart(name)}
                  >
                    Add
                  </Button>
                  <button
                    onClick={() => removeWish(name)}
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
            {cart.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 bg-card"
              >
                <div className="min-w-0">
                  <p className="font-serif text-sm text-primary truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ₹{item.price} each
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded-full border border-border">
                    <button
                      onClick={() => updateQty(item.name, -1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-l-full"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.name, 1)}
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
