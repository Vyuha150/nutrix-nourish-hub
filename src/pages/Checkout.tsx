import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Minus, Plus, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { Layout } from "@/components/nutrix/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommerce } from "@/components/nutrix/CommerceProvider";
import { publicApi } from "@/lib/api";
import { resolveProductImage } from "@/lib/productMedia";
import { inr } from "@/lib/format";
import { toast } from "sonner";

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
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      image?: string;
      handler: (response: { razorpay_payment_id: string }) => void;
      prefill?: { name?: string; email?: string };
      theme?: { color?: string };
    }) => { open: () => void };
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const {
    products,
    promos,
    user,
    cart,
    cartTotal,
    updateCartQty,
    removeFromCart,
    signInWithGoogle,
    saveCouponCode,
    couponCode,
  } = useCommerce();
  const [selectedCoupon, setSelectedCoupon] = useState(couponCode || "none");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Checkout · Nutrix";
  }, []);

  const activeCoupons = useMemo(() => promos.filter((promo) => promo.active), [promos]);
  const subtotal = cartTotal;
  const coupon = activeCoupons.find((promo) => promo.code === selectedCoupon);
  const discount = coupon ? Math.round(subtotal * (Number(coupon.discount.replace(/[^\d.]/g, "")) || 0) / 100) : 0;
  const shipping = subtotal > 999 ? 0 : cart.length ? 99 : 0;
  const grandTotal = Math.max(subtotal - discount + shipping, 0);
  const productLookup = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products]);

  const pay = async () => {
    if (!cart.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!user) {
      await signInWithGoogle();
      return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
      toast.error("Razorpay key is not configured");
      return;
    }

    try {
      setLoading(true);
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable");
      }

      const instance = new window.Razorpay({
        key,
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        name: "Nutrix",
        description: "Secure checkout for your Nutrix cart",
        handler: async ({ razorpay_payment_id }) => {
          try {
            await publicApi.createOrder({
              customerId: user.userId,
              customer: user.name,
              email: user.email,
              total: grandTotal,
              items: cart.reduce((sum, item) => sum + item.qty, 0),
              status: "confirmed",
              payment: "paid",
              couponCode: coupon?.code ?? "",
              paymentId: razorpay_payment_id,
              lineItems: cart.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                qty: item.qty,
                price: item.price,
                imageKey: item.imageKey,
              })),
            });
            toast.success(`Payment confirmed: ${razorpay_payment_id}`);
            cart.forEach((item) => removeFromCart(item.productId));
            saveCouponCode("");
            setSelectedCoupon("none");
            navigate("/");
          } catch (error) {
            console.error(error);
            toast.error("Payment succeeded, but the order could not be recorded.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#173629" },
      });

      instance.open();
    } catch (error) {
      console.error(error);
      toast.error("Unable to start payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-12 md:py-16 bg-background">
        <div className="container-tight grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-leaf">Secure checkout</p>
              <h1 className="font-serif text-4xl md:text-5xl text-primary mt-2">Confirm your cart and pay securely.</h1>
              <p className="text-muted-foreground mt-3 max-w-2xl">
                Choose an active coupon from the admin panel, confirm the final total, and complete payment through Razorpay.
              </p>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Payment protection</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border p-4">
                  <ShieldCheck className="w-5 h-5 text-leaf mb-2" />
                  Razorpay handles the payment session.
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <CheckCircle2 className="w-5 h-5 text-leaf mb-2" />
                  Active coupons are pulled from admin-managed promos.
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <Sparkles className="w-5 h-5 text-leaf mb-2" />
                  Your cart stays tied to your signed-in Google profile.
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {cart.map((item) => {
                const product = productLookup[item.productId];
                return (
                  <Card key={item.productId}>
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-mist shrink-0">
                        <img src={product ? resolveProductImage(product) : undefined} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg text-primary truncate">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground">{inr(item.price)} each</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => updateCartQty(item.productId, -1)}>
                            <Minus />
                          </Button>
                          <span className="w-10 text-center text-sm font-semibold">{item.qty}</span>
                          <Button variant="outline" size="sm" onClick={() => updateCartQty(item.productId, 1)}>
                            <Plus />
                          </Button>
                          <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => removeFromCart(item.productId)}>
                            <Trash2 className="w-4 h-4" /> Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {!cart.length && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">Your cart is empty.</CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Coupon</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Active coupon</Label>
                  <Select value={selectedCoupon} onValueChange={(value) => { setSelectedCoupon(value); saveCouponCode(value === "none" ? "" : value); }}>
                    <SelectTrigger><SelectValue placeholder="Choose a coupon" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No coupon</SelectItem>
                      {activeCoupons.map((promo) => (
                        <SelectItem key={promo.code} value={promo.code}>
                          {promo.code} - {promo.discount}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Or enter a code</Label>
                  <Input value={selectedCoupon === "none" ? "" : selectedCoupon} onChange={(event) => { const next = event.target.value.toUpperCase(); setSelectedCoupon(next || "none"); saveCouponCode(next); }} placeholder="WELCOME10" />
                </div>
                {coupon && <p className="text-xs text-muted-foreground">{coupon.description} · expires {coupon.expires}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Order summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Discount</span><span>- {inr(discount)}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping ? inr(shipping) : "Free"}</span></div>
                <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{inr(grandTotal)}</span></div>
                <Button className="w-full" onClick={pay} disabled={loading}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? "Opening payment…" : user ? "Pay securely with Razorpay" : "Sign in to pay"}
                </Button>
                {!user && <p className="text-xs text-muted-foreground">You can finish sign-in inside the payment flow first.</p>}
                {!user && <p className="text-xs text-muted-foreground">You can finish sign-in before placing the order.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;