import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
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
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
      <footer className="border-t border-brand-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-brand-700/60">
          Northwind Market — a CodeAlpha Task 1 internship demo. Payments are mocked; no real
          card is charged.
        </div>
      </footer>
    </div>
  );
}
