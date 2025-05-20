
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminApplicants from "./admin/pages/AdminApplicants";
import AdminPayments from "./admin/pages/AdminPayments";
import AdminDonorFeed from "./admin/pages/AdminDonorFeed";
import AdminSupportNetwork from "./admin/pages/AdminSupportNetwork";
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminAuth from "./admin/pages/AdminAuth";
import AuthProvider from "./admin/context/AuthContext";
import LandingPage from "./landing/Index";
import Subscribe from "./pages/Subscribe";
import SubscribeSuccess from "./pages/SubscribeSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Landing Page Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/subscribe/success" element={<SubscribeSuccess />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminAuth />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="applicants" element={<AdminApplicants />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="donor-feed" element={<AdminDonorFeed />} />
              <Route path="support-network" element={<AdminSupportNetwork />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
