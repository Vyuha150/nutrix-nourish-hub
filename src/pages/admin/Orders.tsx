import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle, RefreshCw, Truck, MapPin, Calendar } from "lucide-react";
import { inr } from "@/lib/format";
import { getOrders, updateOrder, confirmOrderPayment, updateOrderShipment } from "@/lib/api";
import type { OrderRecord, ShipmentStatus } from "@/lib/types";
import { toast } from "sonner";

const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "Order Placed",
  "Order Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Reached Nearest Hub",
  "Out for Delivery",
  "Delivered",
  "Delivery Attempt Failed",
  "Returned",
];

const statusVariant: Record<OrderRecord["status"], "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "outline",
  refunded: "destructive",
};

const Orders = () => {
  useEffect(() => {
    document.title = "Orders · Nutrix Admin";
  }, []);

  const [items, setItems] = useState<OrderRecord[]>([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [view, setView] = useState<OrderRecord | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
    }, 280);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark as Paid dialog state
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Mark as Failed dialog state
  const [failDialogOpen, setFailDialogOpen] = useState(false);
  const [failReason, setFailReason] = useState("");
  const [submittingFail, setSubmittingFail] = useState(false);

  // Shipment update form state
  const [shipStatus, setShipStatus] = useState<ShipmentStatus>("Order Placed");
  const [shipLocation, setShipLocation] = useState("");
  const [shipDistrict, setShipDistrict] = useState("");
  const [shipNearestHub, setShipNearestHub] = useState("");
  const [shipCarrier, setShipCarrier] = useState("");
  const [shipTrackingNo, setShipTrackingNo] = useState("");
  const [shipEstDelivery, setShipEstDelivery] = useState("");
  const [shipNotes, setShipNotes] = useState("");
  const [updatingShipment, setUpdatingShipment] = useState(false);

  useEffect(() => {
    if (view) {
      setShipStatus(view.shipmentStatus || "Order Placed");
      setShipLocation(view.shipmentLocation || "");
      setShipDistrict(view.shipmentDistrict || "");
      setShipNearestHub(view.shipmentNearestHub || "");
      setShipCarrier(view.shipmentCarrier || "");
      setShipTrackingNo(view.shipmentTrackingNumber || "");
      setShipEstDelivery(view.estimatedDeliveryDate || "");
      setShipNotes("");
    }
  }, [view]);

  const handleUpdateShipment = async () => {
    if (!view) return;
    try {
      setUpdatingShipment(true);
      const updated = await updateOrderShipment(view.id, {
        status: shipStatus,
        location: shipLocation.trim() || undefined,
        district: shipDistrict.trim() || undefined,
        nearestHub: shipNearestHub.trim() || undefined,
        carrier: shipCarrier.trim() || undefined,
        trackingNumber: shipTrackingNo.trim() || undefined,
        estimatedDeliveryDate: shipEstDelivery.trim() || undefined,
        notes: shipNotes.trim() || undefined,
      });

      setView(updated);
      setItems((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setShipNotes("");
      toast.success(`Shipment updated to "${shipStatus}" for order ${updated.id}`);
    } catch (err: any) {
      console.error("Failed to update shipment:", err);
      toast.error(err?.message || "Failed to update shipment details");
    } finally {
      setUpdatingShipment(false);
    }
  };

  const loadData = async () => {
    try {
      const data = await getOrders();
      setItems(data as OrderRecord[]);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const n = debouncedQ.toLowerCase().trim();
    return items.filter((o) => {
      const matchesFulfillment = filter === "all" || o.status === filter;
      const matchesPayment = paymentFilter === "all" || o.payment === paymentFilter;
      const matchesQuery =
        !n ||
        o.id.toLowerCase().includes(n) ||
        o.customer.toLowerCase().includes(n) ||
        o.email.toLowerCase().includes(n) ||
        (o.phone && o.phone.toLowerCase().includes(n)) ||
        (o.paymentReference && o.paymentReference.toLowerCase().includes(n));

      return matchesFulfillment && matchesPayment && matchesQuery;
    });
  }, [items, debouncedQ, filter, paymentFilter]);

  const suggestions = useMemo(() => {
    const n = q.toLowerCase().trim();
    if (!n) return [];
    return items
      .filter((o) =>
        o.id.toLowerCase().includes(n) ||
        o.customer.toLowerCase().includes(n) ||
        o.email.toLowerCase().includes(n) ||
        (o.paymentReference && o.paymentReference.toLowerCase().includes(n))
      )
      .slice(0, 6);
  }, [items, q]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[activeIndex];
      setQ(selected.id);
      setDebouncedQ(selected.id);
      setIsDropdownOpen(false);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  const updateStatus = async (id: string, status: OrderRecord["status"]) => {
    try {
      const updated = await updateOrder(id, { status });
      setItems((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      if (view?.id === id) {
        setView((prev) => (prev ? { ...prev, ...updated } : null));
      }
      toast.success(`Order ${id} fulfillment status updated to ${status}`);
    } catch (err: any) {
      toast.error(err.message || String(err));
    }
  };

  const handleOpenMarkPaid = () => {
    setPaymentRef("");
    setPaymentNote("");
    setPaymentConfirmed(false);
    setPayDialogOpen(true);
  };

  const handleConfirmPaid = async () => {
    if (!view) return;
    if (!paymentRef.trim()) {
      toast.error("Offline payment reference / transaction number is required.");
      return;
    }
    if (!paymentConfirmed) {
      toast.error("Please confirm that payment has been independently verified.");
      return;
    }

    try {
      setSubmittingPayment(true);
      const updated = await confirmOrderPayment(view.id, {
        action: "mark_paid",
        paymentReference: paymentRef.trim(),
        confirmed: true,
        note: paymentNote.trim() || undefined,
      });

      setItems((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
      setView(updated);
      setPayDialogOpen(false);
      toast.success(`Payment confirmed as Paid for order ${updated.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to confirm payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleOpenMarkFailed = () => {
    setFailReason("");
    setFailDialogOpen(true);
  };

  const handleConfirmFailed = async () => {
    if (!view) return;
    if (!failReason.trim()) {
      toast.error("A reason or note is required to mark payment as failed.");
      return;
    }

    try {
      setSubmittingFail(true);
      const updated = await confirmOrderPayment(view.id, {
        action: "mark_failed",
        note: failReason.trim(),
      });

      setItems((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
      setView(updated);
      setFailDialogOpen(false);
      toast.success(`Payment marked as Failed for order ${updated.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update payment status");
    } finally {
      setSubmittingFail(false);
    }
  };

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
    <AdminLayout
      title="Orders"
      description={`${items.length} total orders · ${inr(
        items.filter((o) => o.payment === "paid").reduce((s, o) => s + o.total, 0)
      )} verified paid volume`}
      actions={
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </Button>
      }
    >
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div ref={searchBoxRef} className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID, customer, email, ref…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIsDropdownOpen(true);
                  setActiveIndex(-1);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                className="pl-8 h-9"
              />
              {isDropdownOpen && q.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 rounded-lg border bg-popover text-popover-foreground shadow-md z-30 overflow-hidden text-xs max-h-72 overflow-y-auto divide-y">
                  {suggestions.map((o, idx) => (
                    <div
                      key={o.id}
                      onClick={() => {
                        setQ(o.id);
                        setDebouncedQ(o.id);
                        setIsDropdownOpen(false);
                        setView(o);
                      }}
                      className={`p-2.5 px-3 hover:bg-muted/60 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                        idx === activeIndex ? "bg-muted" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{o.id}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold border">
                            {o.payment}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {o.customer} · {o.email}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold">{inr(o.total)}</div>
                        <div className="text-[10px] text-muted-foreground capitalize">{o.status}</div>
                      </div>
                    </div>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="p-3 text-center text-muted-foreground">No matching orders found</div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Fulfillment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"].map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                      No orders found matching filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs font-semibold">{o.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{o.customer}</div>
                        <div className="text-xs text-muted-foreground">{o.email}</div>
                        {o.phone && <div className="text-[11px] text-muted-foreground/80">{o.phone}</div>}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{o.date}</TableCell>
                      <TableCell className="text-xs">
                        <div className="max-w-[200px] truncate" title={o.lineItems?.map((li) => `${li.productName} (x${li.qty})`).join(", ")}>
                          {o.lineItems?.map((li) => `${li.productName} (x${li.qty})`).join(", ") || `${o.items} items`}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm whitespace-nowrap">{inr(o.total)}</TableCell>
                      <TableCell>{renderPaymentBadge(o.payment)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[o.status]} className="capitalize">
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView(o)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Sheet */}
      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {view && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between pr-6">
                  <SheetTitle className="font-mono text-xl">{view.id}</SheetTitle>
                  {renderPaymentBadge(view.payment)}
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Customer & Delivery Information */}
                <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-2 text-sm">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Customer & Shipping Details</p>
                  <div>
                    <p className="font-semibold text-primary">{view.customer}</p>
                    <p className="text-muted-foreground text-xs">{view.email}</p>
                    {view.phone && <p className="text-muted-foreground text-xs">Phone: {view.phone}</p>}
                  </div>
                  {view.shippingAddress && (
                    <div className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">
                      <span className="font-medium text-primary">Delivery Address: </span>
                      {view.shippingAddress.address}, {view.shippingAddress.city}{" "}
                      {view.shippingAddress.state} {view.shippingAddress.postalCode}
                    </div>
                  )}
                </div>

                {/* Ordered Items Table */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Ordered Products</p>
                  <div className="border rounded-xl divide-y divide-border overflow-hidden text-xs">
                    {view.lineItems?.map((li, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-primary truncate">{li.productName}</p>
                          <p className="text-muted-foreground mt-0.5">
                            {inr(li.price)} × {li.qty}
                          </p>
                        </div>
                        <div className="font-semibold text-primary">{inr(li.price * li.qty)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold pt-1 px-1">
                    <span>Order Total:</span>
                    <span className="font-serif text-lg text-primary">{inr(view.total)}</span>
                  </div>
                </div>

                {/* Payment Information & Admin Confirmation Actions */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Payment Verification</p>
                    {renderPaymentBadge(view.payment)}
                  </div>

                  {view.payment === "paid" && (
                    <div className="space-y-1.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200">
                      <p>
                        <span className="font-semibold">Reference #:</span>{" "}
                        <span className="font-mono">{view.paymentReference || "—"}</span>
                      </p>
                      {view.paymentConfirmedBy && (
                        <p>
                          <span className="font-semibold">Confirmed By:</span> {view.paymentConfirmedBy}
                        </p>
                      )}
                      {view.paymentConfirmedAt && (
                        <p>
                          <span className="font-semibold">Confirmed At:</span>{" "}
                          {new Date(view.paymentConfirmedAt).toLocaleString()}
                        </p>
                      )}
                      {view.paymentNote && (
                        <p>
                          <span className="font-semibold">Note:</span> {view.paymentNote}
                        </p>
                      )}
                    </div>
                  )}

                  {view.payment === "failed" && (
                    <div className="space-y-1.5 text-xs text-red-800 dark:text-red-300 bg-red-50/60 dark:bg-red-950/20 p-3 rounded-lg border border-red-200">
                      <p>
                        <span className="font-semibold">Failure Reason:</span> {view.paymentNote || "No reason given"}
                      </p>
                      {view.paymentFailedBy && (
                        <p>
                          <span className="font-semibold">Marked By:</span> {view.paymentFailedBy}
                        </p>
                      )}
                      {view.paymentFailedAt && (
                        <p>
                          <span className="font-semibold">Timestamp:</span>{" "}
                          {new Date(view.paymentFailedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {view.payment === "pending" && (
                    <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>This order has an offline payment pending verification.</span>
                    </div>
                  )}

                  {/* Actions to update payment status */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {view.payment !== "paid" && (
                      <Button
                        size="sm"
                        onClick={handleOpenMarkPaid}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                      </Button>
                    )}
                    {view.payment !== "failed" && (
                      <Button size="sm" variant="outline" onClick={handleOpenMarkFailed} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
                        <XCircle className="w-4 h-4" /> Mark as Failed
                      </Button>
                    )}
                  </div>
                </div>

                {/* Fulfillment Status Section (Strictly Separate from Payment) */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Order Fulfillment</p>
                  <p className="text-xs text-muted-foreground">Update shipping and delivery progress independently of payment:</p>
                  <Select
                    value={view.status}
                    onValueChange={(v: OrderRecord["status"]) => {
                      updateStatus(view.id, v);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const).map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Shipment Tracking & Updates Management */}
                <div className="rounded-xl border border-border p-4 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-leaf" />
                      <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Shipment Management</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {view.shipmentStatus || "Order Placed"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Shipment Status *</Label>
                      <Select value={shipStatus} onValueChange={(v: ShipmentStatus) => setShipStatus(v)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SHIPMENT_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Current Location</Label>
                      <Input
                        value={shipLocation}
                        onChange={(e) => setShipLocation(e.target.value)}
                        placeholder="e.g. Bengaluru Central Hub"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">District</Label>
                      <Input
                        value={shipDistrict}
                        onChange={(e) => setShipDistrict(e.target.value)}
                        placeholder="e.g. Bengaluru Urban"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Delivery / Nearest Hub</Label>
                      <Input
                        value={shipNearestHub}
                        onChange={(e) => setShipNearestHub(e.target.value)}
                        placeholder="e.g. Indiranagar Hub"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Carrier / Transport</Label>
                      <Input
                        value={shipCarrier}
                        onChange={(e) => setShipCarrier(e.target.value)}
                        placeholder="e.g. Blue Dart / Delhivery"
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Tracking Number (AWB)</Label>
                      <Input
                        value={shipTrackingNo}
                        onChange={(e) => setShipTrackingNo(e.target.value)}
                        placeholder="e.g. BD-892182910"
                        className="h-9 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Estimated Delivery Date</Label>
                      <Input
                        type="date"
                        value={shipEstDelivery}
                        onChange={(e) => setShipEstDelivery(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Shipment Notes / Update Reason</Label>
                      <Input
                        value={shipNotes}
                        onChange={(e) => setShipNotes(e.target.value)}
                        placeholder="e.g. Dispatched from fulfillment center via express transport"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleUpdateShipment}
                    disabled={updatingShipment}
                    className="w-full gap-1.5 bg-primary text-primary-foreground hover:bg-forest mt-1"
                  >
                    <Truck className="w-4 h-4" />
                    {updatingShipment ? "Updating Shipment..." : "Update Shipment Details"}
                  </Button>

                  {/* History List */}
                  {view.shipmentHistory && view.shipmentHistory.length > 0 && (
                    <div className="pt-2 border-t border-border/60 space-y-2">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Chronological History ({view.shipmentHistory.length})
                      </span>
                      <div className="divide-y divide-border border rounded-lg bg-muted/20 max-h-48 overflow-y-auto">
                        {view.shipmentHistory.map((h, i) => (
                          <div key={h.id || i} className="p-2.5 text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-primary">{h.status}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {h.timestamp ? new Date(h.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—"}
                              </span>
                            </div>
                            {h.location && (
                              <p className="text-muted-foreground text-[11px]">📍 {h.location}</p>
                            )}
                            {h.notes && (
                              <p className="text-muted-foreground text-[11px] italic">"{h.notes}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Mark as Paid Confirmation Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary font-serif">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Confirm Offline Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please enter the verified offline transaction or reference number for order {view?.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="paymentRef">Payment Reference / Transaction Number *</Label>
              <Input
                id="paymentRef"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. UPI-TXN-894729103 or NEFT-83921"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentNote">Verification Note (Optional)</Label>
              <Input
                id="paymentNote"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="e.g. Verified in HDFC bank account on Nov 3"
              />
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="verifyCheck"
                checked={paymentConfirmed}
                onChange={(e) => setPaymentConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="verifyCheck" className="text-xs font-normal cursor-pointer leading-relaxed">
                I independently confirm that the offline payment for this order has been received and verified.
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setPayDialogOpen(false)} disabled={submittingPayment}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPaid}
              disabled={submittingPayment || !paymentRef.trim() || !paymentConfirmed}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {submittingPayment ? "Confirming…" : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Failed Dialog */}
      <Dialog open={failDialogOpen} onOpenChange={setFailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-serif">
              <XCircle className="w-5 h-5 text-destructive" /> Mark Payment as Failed
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide a reason or note explaining why this payment failed. The order will be preserved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="failReason">Reason / Failure Note *</Label>
              <Input
                id="failReason"
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                placeholder="e.g. Transaction declined by bank / Invalid reference"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setFailDialogOpen(false)} disabled={submittingFail}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmFailed}
              disabled={submittingFail || !failReason.trim()}
            >
              {submittingFail ? "Saving…" : "Mark as Failed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Orders;
