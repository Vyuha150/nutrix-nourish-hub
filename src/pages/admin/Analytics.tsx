import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { inr } from "@/lib/format";
import { getAdminAnalytics } from "@/lib/api";
import { Download, Loader2 } from "lucide-react";
import { exportAnalyticsToCsv } from "@/lib/exportAnalyticsCsv";

const Analytics = () => {
  useEffect(() => { document.title = "Analytics · Nutrix Admin"; }, []);
  const [kpis, setKpis] = useState<any>(null);
  const [revenueSeries, setRevenueSeries] = useState<any[]>([]);
  const [trafficByPage, setTrafficByPage] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportAnalyticsToCsv();
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdminAnalytics();
        setKpis(data.kpis);
        setRevenueSeries(data.revenueSeries || []);
        setTrafficByPage(data.trafficByPage || []);
        setProducts(data.products || []);
        setCustomers(data.customers || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const productPerf = [...products].sort((a, b) => (b.sold30d || 0) - (a.sold30d || 0)).slice(0, 8);
  const topCustomers = [...customers].sort((a, b) => (b.ltv || 0) - (a.ltv || 0)).slice(0, 8);

  return (
    <AdminLayout
      title="Analytics"
      description="Sales, traffic, product, and customer intelligence"
      actions={
        <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-1.5" />
          )}
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      }
    >
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Revenue 30d" value={inr(kpis?.revenue?.value ?? 0)} delta={kpis?.revenue?.delta ?? 0} />
            <StatCard label="Orders 30d" value={(kpis?.orders?.value ?? 0).toLocaleString()} delta={kpis?.orders?.delta ?? 0} />
            <StatCard label="AOV" value={inr(kpis?.aov?.value ?? 0)} delta={kpis?.aov?.delta ?? 0} />
            <StatCard label="Conversion" value={`${kpis?.conversion?.value ?? 0}%`} delta={kpis?.conversion?.delta ?? 0} />
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Revenue & orders</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--leaf))" }, orders: { label: "Orders", color: "hsl(var(--primary))" } }} className="h-[320px] w-full">
                <AreaChart data={revenueSeries}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="d" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--leaf))" fill="hsl(var(--leaf) / 0.18)" strokeWidth={2} />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Pageviews & conversion by page</CardTitle></CardHeader>
            <CardContent>
              {trafficByPage.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">
                  No page traffic data recorded yet.
                </div>
              ) : (
                <ChartContainer config={{ views: { label: "Views", color: "hsl(var(--primary))" } }} className="h-[300px] w-full">
                  <BarChart data={trafficByPage}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="page" tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Page</TableHead><TableHead className="text-right">Views</TableHead><TableHead className="text-right">Conv. rate</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {trafficByPage.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-sm text-muted-foreground">
                        No traffic data recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    trafficByPage.map((p) => (
                      <TableRow key={p.page}>
                        <TableCell className="font-mono text-xs">{p.page}</TableCell>
                        <TableCell className="text-right">{p.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{p.conv}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Top sellers (30d)</CardTitle></CardHeader>
            <CardContent>
              {productPerf.every((p) => !p.sold30d) ? (
                <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">
                  No product sales recorded yet.
                </div>
              ) : (
                <ChartContainer config={{ sold30d: { label: "Units", color: "hsl(var(--leaf))" } }} className="h-[300px] w-full">
                  <BarChart data={productPerf.filter((p) => (p.sold30d || 0) > 0)}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-[10px]" interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis tickLine={false} axisLine={false} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sold30d" fill="hsl(var(--leaf))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead><TableHead>Category</TableHead>
                    <TableHead className="text-right">Sold 30d</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productPerf.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.category}</TableCell>
                      <TableCell className="text-right">{p.sold30d}</TableCell>
                      <TableCell className="text-right">{inr(p.sold30d * p.price)}</TableCell>
                      <TableCell className="text-right">{p.stock}</TableCell>
                      <TableCell className="text-right">{p.rating} ★</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">New customers trend</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ orders: { label: "New", color: "hsl(var(--forest))" } }} className="h-[280px] w-full">
                <LineChart data={revenueSeries}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="d" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--forest))" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Top customers by LTV</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Customer</TableHead><TableHead>Segment</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">LTV</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">
                        No customer profiles found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    topCustomers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></TableCell>
                        <TableCell>{c.segment}</TableCell>
                        <TableCell className="text-right">{c.orders}</TableCell>
                        <TableCell className="text-right font-medium">{inr(c.ltv)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Analytics;
