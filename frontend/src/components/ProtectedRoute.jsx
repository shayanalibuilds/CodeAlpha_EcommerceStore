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

// Where to send someone after sign-in: router state first, then ?next=,
// else home. Only same-site paths are honored (no "//evil.com" redirects).
export function nextPath(location) {
  const candidate = location.state?.next || new URLSearchParams(location.search).get('next') || '/';
  return typeof candidate === 'string' && candidate.startsWith('/') && !candidate.startsWith('//')
    ? candidate
    : '/';
}

// /login and /register are for guests only — signed-in users go home (or ?next).
export function GuestOnly({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <PageLoader label="Checking your session…" />;
  if (user) return <Navigate to={nextPath(location)} replace />;
  return children;
}
