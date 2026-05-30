import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Eye, Mail } from "lucide-react";
import { inr } from "@/lib/format";
import { getCustomers, getOrders } from "@/lib/api";
import type { CustomerStats, OrderRecord } from "@/lib/types";

const segVariant: Record<CustomerStats["segment"], "default" | "secondary" | "outline" | "destructive"> = {
  VIP: "default", Regular: "secondary", New: "outline", "At-risk": "destructive",
};

const Customers = () => {
  useEffect(() => { document.title = "Customers · Nutrix Admin"; }, []);
  const [q, setQ] = useState("");
  const [view, setView] = useState<CustomerStats | null>(null);
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [c, o] = await Promise.all([getCustomers(), getOrders()]);
        setCustomers(c);
        setOrders(o);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const n = q.toLowerCase().trim();
    return n ? customers.filter((c) => c.name.toLowerCase().includes(n) || c.email.toLowerCase().includes(n)) : customers;
  }, [q, customers]);

  const totalLtv = customers.reduce((s, c) => s + (c.ltv || 0), 0);
  const vip = customers.filter((c) => c.segment === "VIP").length;
  const atRisk = customers.filter((c) => c.segment === "At-risk").length;

  const customerOrders = (email: string) => orders.filter((o) => o.email === email);

  return (
    <AdminLayout title="Customers" description={`${customers.length} customers · ${inr(totalLtv)} lifetime value`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total customers" value={customers.length.toString()} delta={6.2} />
        <StatCard label="Avg LTV" value={inr(Math.round(totalLtv / customers.length))} delta={4.1} />
        <StatCard label="VIP" value={vip.toString()} hint="High-value" />
        <StatCard label="At-risk" value={atRisk.toString()} hint="Re-engage" />
      </div>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="relative max-w-sm mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead><TableHead>Joined</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">LTV</TableHead>
                  <TableHead>Last order</TableHead><TableHead>Segment</TableHead><TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{c.joined}</TableCell>
                    <TableCell className="text-right">{c.orders}</TableCell>
                    <TableCell className="text-right font-medium">{inr(c.ltv)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{c.lastOrder}</TableCell>
                    <TableCell><Badge variant={segVariant[c.segment]}>{c.segment}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView(c)}><Eye className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {view && (
            <>
              <SheetHeader><SheetTitle>{view.name}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {view.email}</div>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Orders" value={view.orders.toString()} />
                  <StatCard label="LTV" value={inr(view.ltv)} />
                  <StatCard label="Segment" value={view.segment} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recent orders</p>
                  <div className="space-y-1.5">
                    {customerOrders(view.email).slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                        <span className="font-mono text-xs">{o.id}</span>
                        <Badge variant="secondary" className="capitalize text-[10px]">{o.status}</Badge>
                        <span className="font-medium">{inr(o.total)}</span>
                      </div>
                    ))}
                    {customerOrders(view.email).length === 0 && <p className="text-xs text-muted-foreground">No orders in current view.</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default Customers;
