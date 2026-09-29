import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import MobileTabBar from './components/MobileTabBar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminProductsPage from './pages/AdminProductsPage.jsx';
import AdminOrdersPage from './pages/AdminOrdersPage.jsx';
import ForbiddenPage from './pages/ForbiddenPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { RequireAuth, RequireAdmin } from './components/ProtectedRoute.jsx';

export default function App() {
  const { pathname } = useLocation();

  // Auth gateway pages render standalone (no global chrome) — see AuthLayout.
  const isAuthPage = pathname === '/login' || pathname === '/register';
  // Admin pages carry their own operations-console sidebar & top bar.
  const isAdminPage = pathname.startsWith('/admin');

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminPage && <Navbar />}
      <div className={`flex-1 ${isAdminPage ? '' : 'pb-16 md:pb-0'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <OrdersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RequireAuth>
                <OrderDetailPage />
              </RequireAuth>
            }
          />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route
            path="/admin/products"
            element={
              <RequireAdmin>
                <AdminProductsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RequireAdmin>
                <AdminOrdersPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <MobileTabBar />}
    </div>
  );
}
