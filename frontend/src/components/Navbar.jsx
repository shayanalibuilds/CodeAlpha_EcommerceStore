import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import BrandLogo from './BrandLogo.jsx';

function linkClass({ isActive }) {
  return `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-100 text-brand-700'
      : 'text-brand-700/80 hover:bg-brand-50 hover:text-brand-700'
  }`;
}

export function BagIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

export default function Navbar() {
  const { user, ready, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Shop' },
    ...(user ? [{ to: '/orders', label: 'My orders' }] : []),
    ...(user?.role === 'admin'
      ? [
          { to: '/admin/products', label: 'Admin products' },
          { to: '/admin/orders', label: 'Admin orders' },
        ]
      : []),
  ];

  const closeAnd = (fn) => () => {
    setOpen(false);
    fn?.();
  };

  const onSignOut = closeAnd(async () => {
    await logout();
    navigate('/');
  });

  const navLinks = links.map((l) => (
    <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'} onClick={() => setOpen(false)}>
      {l.label}
    </NavLink>
  ));

  const cartLink = (
    <NavLink to="/cart" className={linkClass} onClick={() => setOpen(false)} aria-label={`Cart, ${count} items`}>
      <span className="flex items-center gap-1.5">
        <span className="relative">
          <BagIcon className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </span>
        <span className="hidden lg:inline">Cart</span>
      </span>
    </NavLink>
  );

  const authArea = !ready ? null : user ? (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-brand-700/70 sm:inline">
        Hi, {user.name.split(' ')[0]}
      </span>
      <button type="button" className="btn-secondary !px-3 !py-1.5" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link to="/register" className="btn-secondary !px-3 !py-1.5" onClick={() => setOpen(false)}>
        Create account
      </Link>
      <Link to="/login" className="btn-primary !px-3 !py-1.5" onClick={() => setOpen(false)}>
        Sign in
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4" aria-label="Main navigation">
        <Link to="/" className="flex items-center" aria-label="Northwind Market home" onClick={() => setOpen(false)}>
          <BrandLogo className="h-9 w-auto" />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks}
          {cartLink}
          {authArea}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          {cartLink}
          <button
            type="button"
            className="rounded-md p-2 text-brand-700 hover:bg-brand-50"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-brand-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">{navLinks}</div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-brand-50 pt-3">
            {user ? (
              <>
                <span className="text-sm text-brand-700/70">Hi, {user.name.split(' ')[0]}</span>
                <button type="button" className="btn-secondary !px-3 !py-1.5" onClick={onSignOut}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-secondary flex-1 !px-3 !py-1.5" onClick={() => setOpen(false)}>
                  Create account
                </Link>
                <Link to="/login" className="btn-primary flex-1 !px-3 !py-1.5" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
