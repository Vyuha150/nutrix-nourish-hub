import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { revenueSeries, trafficByPage, products, customers, kpis, inr } from "@/lib/adminMockData";

const Analytics = () => {
  useEffect(() => { document.title = "Analytics · Nutrix Admin"; }, []);
  const productPerf = [...products].sort((a, b) => b.sold30d - a.sold30d).slice(0, 8);
  const topCustomers = [...customers].sort((a, b) => b.ltv - a.ltv).slice(0, 8);

  return (
    <AdminLayout title="Analytics" description="Sales, traffic, product, and customer intelligence">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Revenue 30d" value={inr(kpis.revenue.value)} delta={kpis.revenue.delta} />
            <StatCard label="Orders 30d" value={kpis.orders.value.toLocaleString()} delta={kpis.orders.delta} />
            <StatCard label="AOV" value={inr(kpis.aov.value)} delta={kpis.aov.delta} />
            <StatCard label="Conversion" value={`${kpis.conversion.value}%`} delta={kpis.conversion.delta} />
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
              <ChartContainer config={{ views: { label: "Views", color: "hsl(var(--primary))" } }} className="h-[300px] w-full">
                <BarChart data={trafficByPage}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="page" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Page</TableHead><TableHead className="text-right">Views</TableHead><TableHead className="text-right">Conv. rate</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {trafficByPage.map((p) => (
                    <TableRow key={p.page}>
                      <TableCell className="font-mono text-xs">{p.page}</TableCell>
                      <TableCell className="text-right">{p.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{p.conv}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Top sellers (30d)</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ sold30d: { label: "Units", color: "hsl(var(--leaf))" } }} className="h-[300px] w-full">
                <BarChart data={productPerf}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-[10px]" interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sold30d" fill="hsl(var(--leaf))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
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
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Customer</TableHead><TableHead>Segment</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">LTV</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></TableCell>
                      <TableCell>{c.segment}</TableCell>
                      <TableCell className="text-right">{c.orders}</TableCell>
                      <TableCell className="text-right font-medium">{inr(c.ltv)}</TableCell>
                    </TableRow>
                  ))}
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
