import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { RoleBasedDashboard } from "@/components/layout/RoleBasedDashboard";
import { BottomNav } from "@/components/layout/BottomNav";
import { HelmetProvider } from 'react-helmet-async';
import { CookieConsent } from "@/components/seo/CookieConsent";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

// Eager load critical pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better mobile performance
const ForSellers = lazy(() => import("./pages/Sellers/ForSellers"));
const SmartLadder = lazy(() => import("./pages/Admin/SmartLadder"));
const DataRoom = lazy(() => import("./pages/Investors/DataRoom"));
const Register = lazy(() => import("./pages/Auth/Register"));
const AdminRegister = lazy(() => import("./pages/Auth/AdminRegister"));
const AdminLogin = lazy(() => import("./pages/Auth/AdminLogin"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const UpdatePassword = lazy(() => import("./pages/Auth/UpdatePassword"));
const UserProfile = lazy(() => import("./pages/Profile/UserProfile"));
const ProductList = lazy(() => import("./pages/Products/ProductList"));
const AddProduct = lazy(() => import("./pages/Products/AddProduct"));
const ProductDetail = lazy(() => import("./pages/Products/ProductDetail"));
const CategoriesPage = lazy(() => import("./pages/Categories/CategoriesPage"));
const BuyerDashboard = lazy(() => import("./pages/Dashboard/BuyerDashboard"));
const SellerDashboard = lazy(() => import("./pages/Dashboard/SellerDashboard"));
const CourierDashboard = lazy(() => import("./pages/Dashboard/CourierDashboard"));
const CreateShop = lazy(() => import("./pages/Shop/CreateShop"));
const MyShop = lazy(() => import("./pages/Shop/MyShop"));
const PublicShop = lazy(() => import("./pages/Shop/PublicShop"));
const ShopsList = lazy(() => import("./pages/Shop/ShopsList"));
const MyOrders = lazy(() => import("./pages/Orders/MyOrders"));
const SellerOrders = lazy(() => import("./pages/Orders/SellerOrders"));
const MyDeliveries = lazy(() => import("./pages/Deliveries/MyDeliveries"));
const NotificationPage = lazy(() => import("./pages/Notifications/NotificationPage"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminShopsList = lazy(() => import("./pages/Admin/ShopsList"));
const ShopDetail = lazy(() => import("./pages/Admin/ShopDetail"));
const AdminUsersList = lazy(() => import("./pages/Admin/UsersList"));
const AdminProductsList = lazy(() => import("./pages/Admin/ProductsList"));
const AdminOrdersList = lazy(() => import("./pages/Admin/OrdersList"));
const AdminCouriersList = lazy(() => import("./pages/Admin/CouriersList"));
const AdminDeliveriesList = lazy(() => import("./pages/Admin/DeliveriesList"));
const AdminPaymentsList = lazy(() => import("./pages/Admin/PaymentsList"));
const About = lazy(() => import("./pages/Legal/About"));
const Contact = lazy(() => import("./pages/Legal/Contact"));
const Terms = lazy(() => import("./pages/Legal/Terms"));
const Privacy = lazy(() => import("./pages/Legal/Privacy"));
const LegalNotice = lazy(() => import("./pages/Legal/LegalNotice"));
const Messages = lazy(() => import("./pages/Messages/Messages"));
const Cart = lazy(() => import("./pages/Cart/Cart"));
const PaymentConfirmation = lazy(() => import("./pages/Orders/PaymentConfirmation"));
const TrackDelivery = lazy(() => import("./pages/Tracking/TrackDelivery"));
const StartLive = lazy(() => import("./pages/Live/StartLive"));
const WatchLive = lazy(() => import("./pages/Live/WatchLive"));
const BlogList = lazy(() => import("./pages/Blog/BlogList"));
const BlogPost = lazy(() => import("./pages/Blog/BlogPost"));
const DemoPage = lazy(() => import("./pages/Demo/DemoPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Breadcrumbs />
            <div className="pb-16 md:pb-0">
              <Suspense fallback={<LoadingFallback />}>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/pour-vendeurs" element={<ForSellers />} />
              <Route path="/smart-ladder" element={<SmartLadder />} />
              <Route path="/data-room" element={<DataRoom />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/secure-admin-registration-2024" element={<AdminRegister />} />
              <Route path="/secure-admin-login-2024" element={<AdminLogin />} />
              <Route path="/mot-de-passe-oublie" element={<ResetPassword />} />
              <Route path="/nouveau-mot-de-passe" element={<UpdatePassword />} />
              <Route path="/produits" element={<ProductList />} />
              <Route path="/produit/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/boutiques" element={<ShopsList />} />
              <Route path="/boutique/:id" element={<PublicShop />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mentions-legales" element={<LegalNotice />} />
              <Route path="/cgu" element={<Terms />} />
              <Route path="/politique-confidentialite" element={<Privacy />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/panier" element={<Cart />} />
              <Route path="/confirmation-paiement" element={<PaymentConfirmation />} />
              <Route path="/suivi-livraison/:id" element={<TrackDelivery />} />
              <Route path="/demo" element={<DemoPage />} />

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
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminUsersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminProductsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminOrdersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/couriers"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminCouriersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/deliveries"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminDeliveriesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminPaymentsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lancer-live"
                element={
                  <ProtectedRoute requireRole="vendeur">
                    <StartLive />
                  </ProtectedRoute>
                }
              />
              <Route path="/live/:id" element={<WatchLive />} />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            <BottomNav />
            <CookieConsent />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
