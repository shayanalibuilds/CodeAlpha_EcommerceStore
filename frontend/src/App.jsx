import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForbiddenPage from './pages/ForbiddenPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
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
