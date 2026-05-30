import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommerceProvider } from "@/components/nutrix/CommerceProvider";
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import Goals from "./pages/Goals.tsx";
import Nutrients from "./pages/Nutrients.tsx";
import Science from "./pages/Science.tsx";
import LabReports from "./pages/LabReports.tsx";
import Offers from "./pages/Offers.tsx";
import Checkout from "./pages/Checkout.tsx";
import StackFinder from "./pages/StackFinder.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminAnalytics from "./pages/admin/Analytics.tsx";
import AdminProducts from "./pages/admin/Products.tsx";
import AdminOffers from "./pages/admin/Offers.tsx";
import AdminLabReports from "./pages/admin/LabReports.tsx";
import AdminOrders from "./pages/admin/Orders.tsx";
import AdminCustomers from "./pages/admin/Customers.tsx";
import AdminContent from "./pages/admin/Content.tsx";
import AdminMarketing from "./pages/admin/Marketing.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CommerceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/nutrients" element={<Nutrients />} />
            <Route path="/science" element={<Science />} />
            <Route path="/lab-reports" element={<LabReports />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/stack-finder" element={<StackFinder />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/offers" element={<AdminOffers />} />
            <Route path="/admin/lab-reports" element={<AdminLabReports />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/marketing" element={<AdminMarketing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CommerceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
