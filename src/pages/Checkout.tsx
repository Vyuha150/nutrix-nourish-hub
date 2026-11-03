import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ShoppingBag, Minus, Plus, ShieldCheck, Sparkles, Trash2, Mail, Phone, Truck, AlertTriangle, MapPin, Check, Loader2 } from "lucide-react";
import { Layout } from "@/components/nutrix/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCommerce } from "@/components/nutrix/CommerceProvider";
import { publicApi } from "@/lib/api";
import { resolveProductImage, resolveProductFallbackImage } from "@/lib/productMedia";
import { inr } from "@/lib/format";
import type { OrderRecord } from "@/lib/types";
import { lookupPincode, validateIndianAddress, type AddressValidationResult } from "@/lib/pincodeValidator";
import { toast } from "sonner";

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
    saveCouponCode,
    couponCode,
  } = useCommerce();

  const [selectedCoupon, setSelectedCoupon] = useState(couponCode || "none");
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // Address & PIN Code State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    building: "",
    street: "",
    town: "",
    mandal: "",
    district: "",
    state: "",
    postalCode: "",
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeInfo, setPincodeInfo] = useState<{ state: string; district: string; postOffices: string[] } | null>(null);
  const [mismatchModalOpen, setMismatchModalOpen] = useState(false);
  const [mismatchDetails, setMismatchDetails] = useState<AddressValidationResult | null>(null);

  useEffect(() => {
    document.title = "Checkout · The Nature's Way";
  }, []);

  useEffect(() => {
    if (user?.name && !shippingAddress.fullName) {
      setShippingAddress((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [user?.name, shippingAddress.fullName]);

  // Handle PIN Code live verification and auto-population
  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setShippingAddress((prev) => ({ ...prev, postalCode: clean }));

    if (clean.length === 6) {
      setPincodeLoading(true);
      try {
        const lookup = await lookupPincode(clean);
        if (lookup.valid) {
          setPincodeInfo({
            state: lookup.state,
            district: lookup.district,
            postOffices: lookup.postOffices,
          });

          // Pre-fill state & district if empty or auto-suggest
          setShippingAddress((prev) => ({
            ...prev,
            state: prev.state || lookup.state,
            district: prev.district || lookup.district,
            town: prev.town || (lookup.postOffices[0] || ""),
          }));
        } else {
          setPincodeInfo(null);
          toast.error(lookup.error || "Invalid PIN code. Please check the 6 digits.");
        }
      } catch (err) {
        console.error("PIN lookup error:", err);
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeInfo(null);
    }
  };

  const activeCoupons = useMemo(() => promos.filter((promo) => promo.active), [promos]);
  const subtotal = cartTotal;
  const coupon = activeCoupons.find((promo) => promo.code === selectedCoupon);
  const discount = coupon ? Math.round(subtotal * (Number(coupon.discount.replace(/[^\d.]/g, "")) || 0) / 100) : 0;
  const shipping = subtotal > 999 ? 0 : cart.length ? 99 : 0;
  const grandTotal = Math.max(subtotal - discount + shipping, 0);
  const productLookup = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products]);

  const handlePlaceOrder = async () => {
    if (loading) return; // Prevent duplicate clicks

    if (!cart.length) {
      toast.error("Your cart is empty. Please add products to your cart.");
      return;
    }

    if (!user) {
      toast.error("Please sign in to proceed with checkout.");
      navigate("/signin", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    if (!shippingAddress.fullName.trim()) {
      toast.error("Please enter the recipient full name for delivery.");
      return;
    }
    if (!shippingAddress.phone.trim()) {
      toast.error("Please enter a contact phone number.");
      return;
    }
    if (!shippingAddress.building.trim() && !shippingAddress.street.trim()) {
      toast.error("Please enter your house/building and street address.");
      return;
    }
    if (!shippingAddress.postalCode.trim() || shippingAddress.postalCode.length !== 6) {
      toast.error("Please enter a valid 6-digit Indian PIN code.");
      return;
    }
    if (!shippingAddress.state.trim()) {
      toast.error("Please enter your State.");
      return;
    }
    if (!shippingAddress.district.trim() && !shippingAddress.town.trim()) {
      toast.error("Please enter your District or Town.");
      return;
    }

    // Client-side PIN code consistency verification before placing order
    try {
      setLoading(true);

      const validation = await validateIndianAddress(
        shippingAddress.postalCode.trim(),
        shippingAddress.state.trim(),
        shippingAddress.district.trim() || shippingAddress.town.trim(),
        shippingAddress.town.trim() || shippingAddress.street.trim()
      );

      if (!validation.valid) {
        toast.error(validation.errorMessage || "The PIN code entered is invalid in India.");
        setLoading(false);
        return;
      }

      if (validation.mismatch) {
        // Stop order placement and open Address Mismatch Dialog
        setMismatchDetails(validation);
        setMismatchModalOpen(true);
        setLoading(false);
        return;
      }

      const consolidatedAddress = [
        shippingAddress.building.trim(),
        shippingAddress.street.trim(),
        shippingAddress.mandal.trim() ? `Mandal: ${shippingAddress.mandal.trim()}` : "",
        shippingAddress.town.trim(),
        shippingAddress.district.trim(),
        shippingAddress.state.trim(),
        `PIN: ${shippingAddress.postalCode.trim()}`,
      ].filter(Boolean).join(", ");

      const orderPayload = {
        customerId: user.userId,
        customer: shippingAddress.fullName.trim(),
        email: user.email,
        phone: shippingAddress.phone.trim(),
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          building: shippingAddress.building.trim(),
          street: shippingAddress.street.trim(),
          town: shippingAddress.town.trim(),
          mandal: shippingAddress.mandal.trim(),
          district: shippingAddress.district.trim(),
          state: shippingAddress.state.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          address: consolidatedAddress,
          city: shippingAddress.town.trim() || shippingAddress.district.trim(),
        },
        total: grandTotal,
        items: cart.reduce((sum, item) => sum + item.qty, 0),
        status: "confirmed" as const,
        payment: "pending" as const,
        couponCode: coupon?.code ?? "",
        lineItems: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          qty: item.qty,
          price: item.price,
          imageKey: item.imageKey,
        })),
      };

      const orderResponse = await publicApi.createOrder(orderPayload);

      // Successfully saved in MongoDB: clear cart & coupon, open confirmation modal
      cart.forEach((item) => removeFromCart(item.productId));
      saveCouponCode("");
      setSelectedCoupon("none");

      setCreatedOrder(orderResponse);
      setConfirmationOpen(true);
      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("Order creation failed:", error);
      const errorMessage = error?.message || "Failed to place order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestedAddress = () => {
    if (mismatchDetails) {
      setShippingAddress((prev) => ({
        ...prev,
        state: mismatchDetails.expectedState,
        district: mismatchDetails.expectedDistrict,
        town: mismatchDetails.postOffices?.[0] || prev.town,
      }));
      setMismatchModalOpen(false);
      toast.success("Updated address with matching state and district. You can now place your order.");
    }
  };

  return (
    <Layout>
      <section className="py-12 md:py-16 bg-background">
        <div className="container-tight grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-leaf">Checkout</p>
              <h1 className="font-serif text-4xl md:text-5xl text-primary mt-2">Delivery & Order Review</h1>
              <p className="text-muted-foreground mt-3 max-w-2xl">
                Review your selected wellness formulas, enter your delivery address, and place your order.
              </p>
            </div>

            {/* Delivery Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4 text-leaf" /> Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      placeholder="e.g. Aanya Sharma"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="building">House / Flat / Building Details *</Label>
                    <Input
                      id="building"
                      value={shippingAddress.building}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, building: e.target.value })}
                      placeholder="Flat 402, Green Meadows Apartment"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="street">Street / Road / Locality *</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="5th Main, 2nd Cross, Indiranagar"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode">6-Digit Indian PIN Code *</Label>
                    <div className="relative">
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="e.g. 560038"
                        maxLength={6}
                        required
                        className="pr-8 font-mono"
                      />
                      {pincodeLoading && (
                        <Loader2 className="absolute right-2.5 top-2.5 w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                      {!pincodeLoading && pincodeInfo && (
                        <Check className="absolute right-2.5 top-2.5 w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="town">Town / Village *</Label>
                    <Input
                      id="town"
                      value={shippingAddress.town}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, town: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mandal">Mandal / Sub-District (Optional)</Label>
                    <Input
                      id="mandal"
                      value={shippingAddress.mandal}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, mandal: e.target.value })}
                      placeholder="e.g. Bangalore East"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      value={shippingAddress.district}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                      placeholder="e.g. Bengaluru Urban"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                      required
                    />
                  </div>
                </div>

                {pincodeInfo && pincodeInfo.postOffices?.length > 0 && (
                  <div className="p-3 rounded-xl border border-leaf/30 bg-leaf/10 text-xs text-forest space-y-1.5 animate-fade-in">
                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                      <MapPin className="w-3.5 h-3.5 text-leaf" />
                      Postal Area Verified: {pincodeInfo.district}, {pincodeInfo.state}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Covered Localities: {pincodeInfo.postOffices.slice(0, 6).join(", ")}
                      {pincodeInfo.postOffices.length > 6 && "..."}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Order Assurance</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border p-4">
                  <ShieldCheck className="w-5 h-5 text-leaf mb-2" />
                  Orders are processed and verified by our customer care team.
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <CheckCircle2 className="w-5 h-5 text-leaf mb-2" />
                  Active coupons are pulled from verified promotions.
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <Sparkles className="w-5 h-5 text-leaf mb-2" />
                  Your orders stay safely linked to your personal account.
                </div>
              </CardContent>
            </Card>

            {/* Cart Items */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl text-primary">Cart Items</h2>
              {cart.map((item) => {
                const product = productLookup[item.productId];
                return (
                  <Card key={item.productId}>
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-mist shrink-0">
                        <img
                          src={product ? resolveProductImage(product) : undefined}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (product) {
                              (e.currentTarget as HTMLImageElement).src = resolveProductFallbackImage(product);
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg text-primary truncate">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground">{inr(item.price)} each</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => updateCartQty(item.productId, -1)}>
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <span className="w-10 text-center text-sm font-semibold">{item.qty}</span>
                          <Button variant="outline" size="sm" onClick={() => updateCartQty(item.productId, 1)}>
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => removeFromCart(item.productId)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Remove
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
                <Button className="w-full h-11 text-base font-medium shadow-soft" onClick={handlePlaceOrder} disabled={loading || !cart.length}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {loading ? "Placing your order…" : user ? "Place Order" : "Sign in to place order"}
                </Button>
                {!user && <p className="text-xs text-muted-foreground text-center">You will be prompted to sign in before completing your order.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Confirmation Popup Modal */}
      <Dialog open={confirmationOpen} onOpenChange={(open) => {
        setConfirmationOpen(open);
        if (!open) {
          navigate("/orders");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <DialogTitle className="font-serif text-2xl text-center text-primary">
              Your Order Has Been Placed Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground mt-2 leading-relaxed">
              Your order has been successfully placed. However, our online payment gateway is not yet integrated. Please contact our customer support team to complete your payment. Once your payment is verified, we will proceed with processing your order.
            </DialogDescription>
          </DialogHeader>

          {createdOrder && (
            <div className="space-y-4 my-2">
              <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-mono font-semibold text-primary">{createdOrder.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-semibold text-primary">{inr(createdOrder.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium capitalize">
                    {createdOrder.payment}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-dew/60 p-4 space-y-2.5 text-sm text-forest">
                <p className="font-semibold text-primary">Customer Support Contacts:</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-leaf shrink-0" />
                  <span className="text-xs text-muted-foreground">Email:</span>
                  <a href="mailto:support@thenaturesway.com" className="font-medium text-primary hover:underline hover:text-leaf">
                    support@thenaturesway.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-leaf shrink-0" />
                  <span className="text-xs text-muted-foreground">Phone:</span>
                  <a href="tel:+918045678900" className="font-medium text-primary hover:underline hover:text-leaf">
                    +91 80 4567 8900
                  </a>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmationOpen(false);
                navigate("/shop");
              }}
              className="w-full sm:w-auto"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => {
                setConfirmationOpen(false);
                navigate("/orders");
              }}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-forest"
            >
              View My Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address & PIN Code Mismatch Modal */}
      <Dialog open={mismatchModalOpen} onOpenChange={setMismatchModalOpen}>
        <DialogContent className="sm:max-w-lg border-amber-300">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="font-serif text-2xl text-primary">
              Address and PIN Code Do Not Match
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/80 pt-1 leading-relaxed">
              The PIN code you entered does not appear to match your selected locality, district or state.
              Please verify your address and PIN code before placing your order.
            </DialogDescription>
          </DialogHeader>

          {mismatchDetails && (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-2 gap-3 text-sm p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                <div>
                  <span className="text-xs text-muted-foreground block">Entered State:</span>
                  <span className="font-medium text-destructive">{mismatchDetails.enteredState || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Expected State:</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">{mismatchDetails.expectedState}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Entered District:</span>
                  <span className="font-medium text-destructive">{mismatchDetails.enteredDistrict || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Expected District:</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">{mismatchDetails.expectedDistrict}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-amber-200/60">
                  <span className="text-xs text-muted-foreground block">Entered PIN Code:</span>
                  <span className="font-mono font-semibold text-primary">{mismatchDetails.pincode}</span>
                </div>
                {mismatchDetails.postOffices?.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground block mb-1">Suggested Matching Localities:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {mismatchDetails.postOffices.slice(0, 8).map((po) => (
                        <span key={po} className="text-xs px-2 py-0.5 rounded-full bg-background border border-border">
                          {po}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setMismatchModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Correct Address
            </Button>
            <Button
              onClick={applySuggestedAddress}
              className="w-full sm:w-auto bg-leaf text-leaf-foreground hover:bg-forest"
            >
              Apply Suggested Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Checkout;
