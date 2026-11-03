import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Mail,
  Phone,
  Truck,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Layout } from "@/components/nutrix/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getMyOrders } from "@/lib/api";
import { inr } from "@/lib/format";
import type { OrderRecord, ShipmentStatus } from "@/lib/types";
import { toast } from "sonner";

const fulfillmentBadgeVariant: Record<OrderRecord["status"], "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "outline",
  refunded: "destructive",
};

const STANDARD_STAGES: ShipmentStatus[] = [
  "Order Placed",
  "Order Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Reached Nearest Hub",
  "Out for Delivery",
  "Delivered",
];

const getStageIndex = (status?: ShipmentStatus): number => {
  if (!status) return 0;
  if (status === "Delivery Attempt Failed") return 6; // Around Out for Delivery
  if (status === "Returned") return 7;
  const idx = STANDARD_STAGES.indexOf(status);
  return idx >= 0 ? idx : 0;
};

const Orders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = "My Orders · The Nature's Way";
  }, []);

  const toggleHistory = (orderId: string) => {
    setExpandedHistory((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
    } catch (err: any) {
      console.error("Failed to load customer orders:", err);
      toast.error(err?.message || "Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/signin", { state: { from: { pathname: "/orders" } } });
      } else {
        fetchOrders();
      }
    }
  }, [authLoading, isAuthenticated]);

  const renderPaymentBadge = (payment: OrderRecord["payment"]) => {
    switch (payment) {
      case "paid":
        return (
          <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-600/30 gap-1 capitalize">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1 capitalize">
            <XCircle className="w-3 h-3" /> Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="outline" className="text-destructive border-destructive/30 gap-1 capitalize">
            Refunded
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 capitalize">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <Layout>
      <section className="py-12 md:py-16 bg-background min-h-[70vh]">
        <div className="container-tight space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-leaf">Account Activity</p>
              <h1 className="font-serif text-3xl md:text-4xl text-primary mt-1">My Orders</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track your order fulfillment, review purchased formulas, and view verified payment statuses.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={loading}
                className="gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh Status
              </Button>
              <Button asChild size="sm" className="gap-1.5">
                <Link to="/shop">
                  <ShoppingBag className="w-3.5 h-3.5" /> Shop More
                </Link>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-leaf animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading your order history…</p>
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-mist text-muted-foreground grid place-items-center mx-auto">
                  <Package className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl text-primary">No orders placed yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    When you order wellness formulas, you will find their real-time fulfillment and payment status here.
                  </p>
                </div>
                <Button asChild className="gap-2">
                  <Link to="/shop">
                    Explore Formulas <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const currentStatus = order.shipmentStatus || "Order Placed";
                const currentIndex = getStageIndex(currentStatus);
                const isFailedOrReturned = currentStatus === "Delivery Attempt Failed" || currentStatus === "Returned";

                return (
                  <Card key={order.id} className="overflow-hidden border border-border hover:shadow-soft transition-all">
                    <CardHeader className="bg-muted/30 border-b border-border py-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-semibold text-primary text-base">{order.id}</span>
                          <Badge variant={fulfillmentBadgeVariant[order.status]} className="capitalize text-[11px]">
                            Fulfillment: {order.status}
                          </Badge>
                          {renderPaymentBadge(order.payment)}
                        </div>
                        <p className="text-xs text-muted-foreground">Placed on {order.date}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Order Total</p>
                        <p className="font-serif text-xl font-bold text-primary">{inr(order.total)}</p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* Payment Status Banners */}
                      {order.payment === "pending" && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                          <div className="flex items-center gap-2 font-semibold">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>Payment Status: Pending Verification</span>
                          </div>
                          <p className="leading-relaxed">
                            Our online payment gateway is currently in integration. Please contact our support team with your order number{" "}
                            <span className="font-mono font-semibold">{order.id}</span> to complete payment.
                          </p>
                          <div className="flex flex-wrap items-center gap-4 pt-1 font-medium">
                            <a href="mailto:support@thenaturesway.com" className="flex items-center gap-1.5 hover:underline">
                              <Mail className="w-3.5 h-3.5" /> support@thenaturesway.com
                            </a>
                            <a href="tel:+918045678900" className="flex items-center gap-1.5 hover:underline">
                              <Phone className="w-3.5 h-3.5" /> +91 80 4567 8900
                            </a>
                          </div>
                        </div>
                      )}

                      {order.payment === "paid" && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-4 text-xs text-emerald-800 dark:text-emerald-300 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-semibold">Payment Status: Paid & Confirmed</span>
                          </div>
                          {order.paymentReference && (
                            <div className="font-mono text-xs bg-emerald-100/80 dark:bg-emerald-900/50 px-2.5 py-1 rounded-md">
                              Ref / Transaction #: <span className="font-semibold">{order.paymentReference}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {order.payment === "failed" && (
                        <div className="rounded-xl border border-red-200 bg-red-50/70 dark:bg-red-950/20 dark:border-red-900/40 p-4 text-xs text-red-800 dark:text-red-300 space-y-1">
                          <div className="flex items-center gap-2 font-semibold">
                            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Payment Status: Failed</span>
                          </div>
                          <p className="leading-relaxed">
                            {order.paymentNote
                              ? `Note from support: ${order.paymentNote}`
                              : "Your payment could not be verified. Please reach out to customer support to retry payment."}
                          </p>
                        </div>
                      )}

                      {/* Shipment Tracking Section */}
                      <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-leaf/20 text-leaf flex items-center justify-center shrink-0">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Live Shipment Tracking</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-semibold text-primary text-sm">{currentStatus}</span>
                                {isFailedOrReturned && (
                                  <Badge variant="destructive" className="text-[10px]">Attention</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {order.shipmentLocation && (
                              <div className="flex items-center gap-1 text-primary">
                                <MapPin className="w-3.5 h-3.5 text-leaf" />
                                <span>{order.shipmentLocation}</span>
                              </div>
                            )}
                            {order.estimatedDeliveryDate && (
                              <div className="flex items-center gap-1 text-forest">
                                <Calendar className="w-3.5 h-3.5 text-leaf" />
                                <span>Est. Delivery: {order.estimatedDeliveryDate}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Visual Step-by-Step Progress Bar */}
                        <div className="pt-2 pb-1 overflow-x-auto">
                          <div className="min-w-[620px] flex items-center justify-between relative">
                            {STANDARD_STAGES.map((stage, idx) => {
                              const isCompleted = idx <= currentIndex;
                              const isCurrent = idx === currentIndex;

                              return (
                                <div key={stage} className="flex-1 flex flex-col items-center relative text-center group">
                                  {/* Connector Line */}
                                  {idx > 0 && (
                                    <div
                                      className={`absolute top-3.5 right-1/2 left-[-50%] h-[2px] -z-0 transition-colors ${
                                        idx <= currentIndex ? "bg-leaf" : "bg-border"
                                      }`}
                                    />
                                  )}

                                  {/* Step Circle */}
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-all ${
                                      isCurrent
                                        ? "bg-leaf text-white ring-4 ring-leaf/20 shadow-sm"
                                        : isCompleted
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground border border-border"
                                    }`}
                                  >
                                    {isCompleted && !isCurrent ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      idx + 1
                                    )}
                                  </div>

                                  {/* Step Label */}
                                  <span
                                    className={`text-[10px] sm:text-[11px] mt-2 font-medium tracking-tight px-1 ${
                                      isCurrent
                                        ? "text-primary font-bold"
                                        : isCompleted
                                        ? "text-foreground"
                                        : "text-muted-foreground/70"
                                    }`}
                                  >
                                    {stage}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Carrier & Tracking Number Details */}
                        {(order.shipmentCarrier || order.shipmentTrackingNumber || order.shipmentNearestHub) && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-card border border-border text-xs">
                            {order.shipmentCarrier && (
                              <div>
                                <span className="text-muted-foreground block text-[10px] uppercase">Transport Carrier</span>
                                <span className="font-semibold text-primary">{order.shipmentCarrier}</span>
                              </div>
                            )}
                            {order.shipmentTrackingNumber && (
                              <div>
                                <span className="text-muted-foreground block text-[10px] uppercase">Tracking Number / AWB</span>
                                <span className="font-mono font-semibold text-primary">{order.shipmentTrackingNumber}</span>
                              </div>
                            )}
                            {order.shipmentNearestHub && (
                              <div>
                                <span className="text-muted-foreground block text-[10px] uppercase">Delivery / Nearest Hub</span>
                                <span className="font-semibold text-primary">{order.shipmentNearestHub}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Chronological History Toggle */}
                        {order.shipmentHistory && order.shipmentHistory.length > 0 && (
                          <div className="pt-2">
                            <button
                              onClick={() => toggleHistory(order.id)}
                              className="text-xs font-medium text-leaf hover:text-forest flex items-center gap-1 transition-colors"
                            >
                              <span>{expandedHistory[order.id] ? "Hide" : "View"} Complete Shipment History ({order.shipmentHistory.length} events)</span>
                              {expandedHistory[order.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {expandedHistory[order.id] && (
                              <div className="mt-3 divide-y divide-border/60 border rounded-xl overflow-hidden bg-card text-xs animate-fade-in">
                                {order.shipmentHistory.map((event, idx) => (
                                  <div key={event.id || idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-primary">{event.status}</span>
                                        {event.location && (
                                          <span className="text-muted-foreground">· {event.location}</span>
                                        )}
                                      </div>
                                      {event.notes && (
                                        <p className="text-muted-foreground text-[11px]">{event.notes}</p>
                                      )}
                                    </div>
                                    <span className="text-muted-foreground text-[11px] shrink-0">
                                      {event.timestamp ? new Date(event.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Ordered Products Table */}
                      <div className="space-y-3">
                        <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                          Ordered Formulas ({order.lineItems?.length || 0})
                        </h4>
                        <div className="divide-y divide-border border rounded-xl overflow-hidden bg-card">
                          {order.lineItems?.map((item, idx) => (
                            <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-3 text-sm">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-primary truncate">{item.productName}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {inr(item.price)} × {item.qty} {item.qty > 1 ? "units" : "unit"}
                                </p>
                              </div>
                              <div className="text-right font-semibold text-primary shrink-0">
                                {inr(item.price * item.qty)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery & Summary footer */}
                      {order.shippingAddress && (
                        <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2">
                          <div>
                            <span className="font-semibold text-primary">Shipping to: </span>
                            <span>
                              {order.shippingAddress.fullName || order.customer} · {order.shippingAddress.address},{" "}
                              {order.shippingAddress.city} {order.shippingAddress.postalCode}
                            </span>
                          </div>
                          {order.phone && <div>Contact: {order.phone}</div>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Orders;
