import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageLoader } from './Spinner.jsx';

// Redirects guests to /login (preserving where they were heading).
export function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <PageLoader label="Checking your session…" />;
  if (!user) {
    return <Navigate to="/login" state={{ next: location.pathname + location.search }} replace />;
  }
  return children;
}

// Customers (and guests) never reach admin pages — server enforces this too.
export function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <PageLoader label="Checking your session…" />;
  if (!user) {
    return <Navigate to="/login" state={{ next: location.pathname + location.search }} replace />;
  }
  if (user.role !== 'admin') return <Navigate to="/forbidden" replace />;
  return children;
}
