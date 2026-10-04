import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.ts';
import LoadingSpinner from './components/ui/LoadingSpinner.tsx';

// Layouts
import MainLayout from './layouts/MainLayout.tsx';
import DashboardLayout from './layouts/DashboardLayout.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';

// Public Pages
import HomePage from './pages/HomePage.tsx';
import ShopPage from './pages/ShopPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import NewArrivalsPage from './pages/NewArrivalsPage.tsx';
import BestSellersPage from './pages/BestSellersPage.tsx';
import CollectionsPage from './pages/CollectionsPage.tsx';
import FlashSalesPage from './pages/FlashSalesPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import FAQPage from './pages/FAQPage.tsx';
import BlogPage from './pages/BlogPage.tsx';
import PolicyPages from './pages/PolicyPages.tsx';
import CartPage from './pages/CartPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import OTPVerificationPage from './pages/OTPVerificationPage.tsx';
import OrderTrackingPage from './pages/OrderTrackingPage.tsx';
import WishlistPage from './pages/WishlistPage.tsx';
import GeneralStorePage from './pages/GeneralStorePage.tsx';

// Protected Dashboard Pages
import ProfilePage from './pages/dashboard/ProfilePage.tsx';
import OrdersPage from './pages/dashboard/OrdersPage.tsx';
import OrderDetailPage from './pages/dashboard/OrderDetailPage.tsx';
import AddressesPage from './pages/dashboard/AddressesPage.tsx';
import NotificationsPage from './pages/dashboard/NotificationsPage.tsx';
import LoyaltyPage from './pages/dashboard/LoyaltyPage.tsx';
import SecurityPage from './pages/dashboard/SecurityPage.tsx';

// Protected Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AdminProducts from './pages/admin/AdminProducts.tsx';
import AdminOrders from './pages/admin/AdminOrders.tsx';
import AdminCustomers from './pages/admin/AdminCustomers.tsx';
import AdminReturns from './pages/admin/AdminReturns.tsx';
import AdminCategories from './pages/admin/AdminCategories.tsx';
import AdminCollections from './pages/admin/AdminCollections.tsx';
import AdminMessages from './pages/admin/AdminMessages.tsx';
import AdminSettings from './pages/admin/AdminSettings.tsx';
import AdminPromotions from './pages/admin/AdminPromotions.tsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.tsx';
import PromotionalPopup from './components/ui/PromotionalPopup.tsx';

// Authentication Guard Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-background dark:bg-dark-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <>
      <PromotionalPopup />
      <Routes>
        {/* 1. Main Website Route Tree */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="shop/:slug" element={<ProductDetailPage />} />
          <Route path="new-arrivals" element={<NewArrivalsPage />} />
          <Route path="best-sellers" element={<BestSellersPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="flash-sales" element={<FlashSalesPage />} />
          <Route path="general-store" element={<GeneralStorePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="blog" element={<BlogPage />} />
          
          {/* Policies */}
          <Route path="privacy-policy" element={<PolicyPages />} />
          <Route path="terms" element={<PolicyPages />} />
          <Route path="shipping-policy" element={<PolicyPages />} />
          <Route path="return-policy" element={<PolicyPages />} />
          <Route path="refund-policy" element={<PolicyPages />} />
          
          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="order-tracking" element={<OrderTrackingPage />} />

          {/* Direct WhatsApp Checkout */}
          <Route path="checkout" element={<CheckoutPage />} />

          {/* Auth Forms */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="verify-otp" element={<OTPVerificationPage />} />

          {/* 2. Customer Dashboard Route Tree */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfilePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="loyalty" element={<LoyaltyPage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>
        </Route>

        {/* Dedicated Admin Login */}
        <Route path="admin/login" element={<AdminLoginPage />} />

        {/* 3. Administration Console Route Tree */}
        <Route
          path="admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
