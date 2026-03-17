import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "@/context/BookingContext";
import { AuthProvider } from "@/context/AuthContext";
import { WaitlistProvider } from "@/context/WaitlistContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import HostLogin from "./pages/HostLogin";
import HostDashboard from "./pages/HostDashboard";
import GuestDashboard from "./pages/GuestDashboard";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";
import ConciergeChatBubble from "@/components/ConciergeChatBubble";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BookingProvider>
            <WaitlistProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/property/:id" element={<PropertyDetail />} />
                  <Route path="/host/login" element={<HostLogin />} />
                  <Route path="/host/dashboard" element={<HostDashboard />} />
                  <Route path="/guest/dashboard/:bookingId" element={<GuestDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
                <ConciergeChatBubble />
              </BrowserRouter>
            </WaitlistProvider>
          </BookingProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
