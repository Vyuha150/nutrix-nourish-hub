import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart, ResponsiveContainer, Cell, Pie, PieChart } from "recharts";
import { kpis, revenueSeries, channelMix, products, orders, inr } from "@/lib/adminMockData";
import { Download } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--leaf))", "hsl(var(--forest))", "hsl(var(--mist))", "hsl(var(--muted-foreground))"];

const Dashboard = () => {
  useEffect(() => { document.title = "Dashboard · Nutrix Admin"; }, []);
  const recent = orders.slice(0, 6);
  const top = [...products].sort((a, b) => b.sold30d - a.sold30d).slice(0, 5);

  return (
    <AdminLayout
      title="Dashboard"
      description="Last 30 days overview · all stores"
      actions={<Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" /> Export</Button>}
    >
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="Revenue" value={inr(kpis.revenue.value)} delta={kpis.revenue.delta} hint="vs prev 30d" />
        <StatCard label="Orders" value={kpis.orders.value.toLocaleString()} delta={kpis.orders.delta} />
        <StatCard label="Customers" value={kpis.customers.value.toLocaleString()} delta={kpis.customers.delta} />
        <StatCard label="AOV" value={inr(kpis.aov.value)} delta={kpis.aov.delta} />
        <StatCard label="Conv. rate" value={`${kpis.conversion.value}%`} delta={kpis.conversion.delta} />
        <StatCard label="Refund rate" value={`${kpis.refundRate.value}%`} delta={kpis.refundRate.delta} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Revenue trend</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--leaf))" } }} className="h-[280px] w-full">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--leaf))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--leaf))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="d" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--leaf))" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Traffic sources</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={channelMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {channelMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ul className="mt-3 space-y-1.5">
              {channelMix.map((c, i) => (
                <li key={c.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />{c.name}</span>
                  <span className="text-muted-foreground">{c.value}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Button variant="ghost" size="sm" asChild><a href="/admin/orders">View all</a></Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{o.date}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{o.status}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{inr(o.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Top products (30d)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ sold30d: { label: "Units", color: "hsl(var(--primary))" } }} className="h-[260px] w-full">
              <BarChart data={top} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sold30d" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
