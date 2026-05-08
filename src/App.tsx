import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import Goals from "./pages/Goals.tsx";
import Nutrients from "./pages/Nutrients.tsx";
import Science from "./pages/Science.tsx";
import LabReports from "./pages/LabReports.tsx";
import Offers from "./pages/Offers.tsx";
import StackFinder from "./pages/StackFinder.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/nutrients" element={<Nutrients />} />
          <Route path="/science" element={<Science />} />
          <Route path="/lab-reports" element={<LabReports />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/stack-finder" element={<StackFinder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
