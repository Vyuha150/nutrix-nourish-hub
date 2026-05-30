import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Eye } from "lucide-react";
import { inr } from "@/lib/format";
import { getOrders, updateOrder } from "@/lib/api";
import type { OrderRecord } from "@/lib/types";
import { toast } from "sonner";

const statusVariant: Record<OrderRecord["status"], "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary", confirmed: "default", processing: "secondary", shipped: "default",
  delivered: "default", cancelled: "outline", refunded: "destructive",
};

const Orders = () => {
  useEffect(() => { document.title = "Orders · Nutrix Admin"; }, []);
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<OrderRecord | null>(null);

  const filtered = useMemo(() => {
    const n = q.toLowerCase().trim();
    return items.filter((o) =>
      (filter === "all" || o.status === filter) &&
      (!n || o.id.toLowerCase().includes(n) || o.customer.toLowerCase().includes(n) || o.email.toLowerCase().includes(n))
    );
  }, [items, q, filter]);

  const updateStatus = async (id: string, status: OrderRecord["status"]) => {
    try {
      const updated = await updateOrder(id, { status });
      setItems((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast.success(`Order ${id} → ${status}`);
    } catch (err: any) {
      toast.error(err.message || String(err));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getOrders();
        setItems(data as any[]);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <AdminLayout title="Orders" description={`${items.length} orders · ${inr(items.reduce((s, o) => s + o.total, 0))} total volume`}>
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by ID, customer, email…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead>
                  <TableHead className="text-right">Items</TableHead><TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment</TableHead><TableHead>Status</TableHead><TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell><div className="font-medium">{o.customer}</div><div className="text-xs text-muted-foreground">{o.email}</div></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{o.date}</TableCell>
                    <TableCell className="text-right">{o.items}</TableCell>
                    <TableCell className="text-right font-medium">{inr(o.total)}</TableCell>
                    <TableCell><Badge variant={o.payment === "paid" ? "default" : o.payment === "pending" ? "secondary" : "destructive"} className="capitalize">{o.payment}</Badge></TableCell>
                    <TableCell><Badge variant={statusVariant[o.status]} className="capitalize">{o.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView(o)}><Eye className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {view && (
            <>
              <SheetHeader><SheetTitle>Order {view.id}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Customer</p>
                  <p className="font-medium mt-0.5">{view.customer}</p>
                  <p className="text-sm text-muted-foreground">{view.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Items</p><p className="font-medium mt-0.5">{view.items}</p></div>
                  <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p><p className="font-medium mt-0.5">{inr(view.total)}</p></div>
                  <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Payment</p><Badge variant="secondary" className="mt-1 capitalize">{view.payment}</Badge></div>
                  <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p><p className="text-sm mt-0.5">{view.date}</p></div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Update status</p>
                  <Select value={view.status} onValueChange={(v: OrderRecord["status"]) => { updateStatus(view.id, v); setView({ ...view, status: v }); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const).map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default Orders;
