import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import AdminAuthGuard from "./components/AdminAuthGuard";
import Index from "./pages/Index";
import EventPage from "./pages/EventPage";
import VendorApplication from "./pages/VendorApplication";
import PastEvents from "./pages/PastEvents";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import AdminLogin from "./pages/AdminLogin";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import CheckInPage from "./pages/CheckInPage";
import Unsubscribe from "./pages/Unsubscribe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/event/:eventId" element={<EventPage />} />
          <Route path="/vendor-application" element={<VendorApplication />} />
          <Route path="/past-events" element={<PastEvents />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/reset-password" element={<AdminResetPassword />} />
          <Route 
            path="/admin" 
            element={
              <AdminAuthGuard>
                <AdminDashboard />
              </AdminAuthGuard>
            } 
          />
          <Route 
            path="/admin/check-in" 
            element={
              <AdminAuthGuard>
                <CheckInPage />
              </AdminAuthGuard>
            } 
          />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
