import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ProductList from "./pages/Products/ProductList";
import BuyerDashboard from "./pages/Dashboard/BuyerDashboard";
import SellerDashboard from "./pages/Dashboard/SellerDashboard";
import CourierDashboard from "./pages/Dashboard/CourierDashboard";
import CreateShop from "./pages/Shop/CreateShop";
import MyShop from "./pages/Shop/MyShop";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/produits" element={<ProductList />} />

            {/* Protected routes */}
            <Route
              path="/dashboard-acheteur"
              element={
                <ProtectedRoute requireRole="acheteur">
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-vendeur"
              element={
                <ProtectedRoute requireRole="vendeur">
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-livreur"
              element={
                <ProtectedRoute requireRole="livreur">
                  <CourierDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creer-boutique"
              element={
                <ProtectedRoute requireRole="vendeur">
                  <CreateShop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ma-boutique"
              element={
                <ProtectedRoute requireRole="vendeur">
                  <MyShop />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
