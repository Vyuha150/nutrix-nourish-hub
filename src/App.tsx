import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CommerceProvider } from "@/components/nutrix/CommerceProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import Goals from "./pages/Goals.tsx";
import Nutrients from "./pages/Nutrients.tsx";
import Science from "./pages/Science.tsx";
import LabReports from "./pages/LabReports.tsx";
import Offers from "./pages/Offers.tsx";
import Checkout from "./pages/Checkout.tsx";
import Orders from "./pages/Orders.tsx";
import StackFinder from "./pages/StackFinder.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
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
      <AuthProvider>
        <CommerceProvider>
          <BrowserRouter>
            <Routes>
              {/* Storefront Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/nutrients" element={<Nutrients />} />
              <Route path="/science" element={<Science />} />
              <Route path="/lab-reports" element={<LabReports />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/my-orders" element={<Orders />} />
              <Route path="/stack-finder" element={<StackFinder />} />

              {/* Authentication Routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/offers"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOffers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/lab-reports"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLabReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminCustomers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/content"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminContent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/marketing"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminMarketing />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CommerceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
