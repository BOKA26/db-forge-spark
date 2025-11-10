import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleBasedDashboard } from "@/components/layout/RoleBasedDashboard";

// Pages
import Home from "./pages/Home";
import ForSellers from "./pages/Sellers/ForSellers";
import SmartLadder from "./pages/Admin/SmartLadder";
import DataRoom from "./pages/Investors/DataRoom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AdminRegister from "./pages/Auth/AdminRegister";
import ResetPassword from "./pages/Auth/ResetPassword";
import UpdatePassword from "./pages/Auth/UpdatePassword";
import UserProfile from "./pages/Profile/UserProfile";
import ProductList from "./pages/Products/ProductList";
import AddProduct from "./pages/Products/AddProduct";
import ProductDetail from "./pages/Products/ProductDetail";
import BuyerDashboard from "./pages/Dashboard/BuyerDashboard";
import SellerDashboard from "./pages/Dashboard/SellerDashboard";
import CourierDashboard from "./pages/Dashboard/CourierDashboard";
import CreateShop from "./pages/Shop/CreateShop";
import MyShop from "./pages/Shop/MyShop";
import PublicShop from "./pages/Shop/PublicShop";
import ShopsList from "./pages/Shop/ShopsList";
import MyOrders from "./pages/Orders/MyOrders";
import SellerOrders from "./pages/Orders/SellerOrders";
import MyDeliveries from "./pages/Deliveries/MyDeliveries";
import NotificationPage from "./pages/Notifications/NotificationPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminShopsList from "./pages/Admin/ShopsList";
import ShopDetail from "./pages/Admin/ShopDetail";
import About from "./pages/Legal/About";
import Contact from "./pages/Legal/Contact";
import Terms from "./pages/Legal/Terms";
import Privacy from "./pages/Legal/Privacy";
import LegalNotice from "./pages/Legal/LegalNotice";
import NotFound from "./pages/NotFound";
import Messages from "./pages/Messages/Messages";
import Cart from "./pages/Cart/Cart";
import PaymentConfirmation from "./pages/Orders/PaymentConfirmation";
import TrackDelivery from "./pages/Tracking/TrackDelivery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="pb-14 md:pb-0">
            <Routes>
            {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/pour-vendeurs" element={<ForSellers />} />
          <Route path="/smart-ladder" element={<SmartLadder />} />
          <Route path="/data-room" element={<DataRoom />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
            <Route path="/inscription/admin" element={<AdminRegister />} />
            <Route path="/mot-de-passe-oublie" element={<ResetPassword />} />
            <Route path="/nouveau-mot-de-passe" element={<UpdatePassword />} />
            <Route path="/produits" element={<ProductList />} />
            <Route path="/produit/:id" element={<ProductDetail />} />
            <Route path="/boutiques" element={<ShopsList />} />
            <Route path="/boutique/:id" element={<PublicShop />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="/cgu" element={<Terms />} />
            <Route path="/politique-confidentialite" element={<Privacy />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/confirmation-paiement" element={<PaymentConfirmation />} />
            <Route path="/suivi-livraison/:id" element={<TrackDelivery />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
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
            <Route
              path="/ajouter-produit"
              element={
                <ProtectedRoute requireRole="vendeur">
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mes-commandes"
              element={
                <ProtectedRoute requireRole="acheteur">
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commandes"
              element={
                <ProtectedRoute requireRole="vendeur">
                  <SellerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mes-livraisons"
              element={
                <ProtectedRoute requireRole="livreur">
                  <MyDeliveries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/boutiques"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminShopsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/boutique/:id"
              element={
                <ProtectedRoute requireRole="admin">
                  <ShopDetail />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
