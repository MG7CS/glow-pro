import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import UserLayout from "@/layouts/UserLayout";
import BizLayout from "@/layouts/BizLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import BusinessProfile from "./pages/BusinessProfile";
import BusinessOnboarding from "./pages/BusinessOnboarding";
import BusinessDashboard from "./pages/BusinessDashboard";
import BizLogin from "./pages/BizLogin";
import BizForgotPassword from "./pages/BizForgotPassword";
import JoinRedirect from "./pages/JoinRedirect";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import RecruiterLogin from "./pages/recruiter/RecruiterLogin";
import RecruiterSignup from "./pages/recruiter/RecruiterSignup";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";

const queryClient = new QueryClient();

const App = () => {
  const hostname = window.location.hostname;
  const isBiz = hostname.startsWith("biz.");
  const isAdmin = hostname.startsWith("admin.");
  const isRecruiter = hostname.startsWith("recruiter.");

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Admin />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (isBiz) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<BizLayout />}>
                <Route path="/join" element={<JoinRedirect />} />
                <Route path="/register" element={<BusinessOnboarding />} />
                <Route path="/" element={<BusinessOnboarding />} />
                <Route path="/login" element={<BizLogin />} />
                <Route path="/forgot-password" element={<BizForgotPassword />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<BusinessDashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (isRecruiter) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RecruiterLogin />} />
              <Route path="/signup" element={<RecruiterSignup />} />
              <Route path="/dashboard" element={<RecruiterDashboard />} />
              <Route path="/register-business" element={<BusinessOnboarding />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* User-facing routes — wrapped with Navbar + Footer */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/business/:id" element={<BusinessProfile />} />
            </Route>

            {/* Business routes — wrapped with BizNavbar */}
            <Route path="/biz" element={<BizLayout />}>
              <Route index element={<BusinessOnboarding />} />
              <Route path="login" element={<BizLogin />} />
              <Route path="forgot-password" element={<BizForgotPassword />} />
            </Route>

            {/* Dashboard — standalone, no BizNavbar */}
            <Route element={<ProtectedRoute />}>
              <Route path="/biz/dashboard" element={<BusinessDashboard />} />
            </Route>

            {/* Admin panel — password-gated client-side */}
            <Route path="/admin" element={<Admin />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
