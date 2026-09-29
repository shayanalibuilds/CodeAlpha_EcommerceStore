import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Icon from './Icon.jsx';

function linkClass({ isActive }) {
  return `px-4 py-2 font-label-md uppercase tracking-wider transition-colors ${
    isActive
      ? 'bg-text-primary text-white'
      : 'text-text-muted hover:text-text-primary hover:bg-surface-container-low'
  }`;
}

export default function Navbar() {
  const { user, ready, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const links = [
    { to: '/products', label: 'Catalog' },
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

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  const navLinks = links.map((l) => (
    <NavLink key={l.to} to={l.to} className={linkClass} end={false} onClick={() => setOpen(false)}>
      {l.label}
    </NavLink>
  ));

  const cartBadge =
    count > 0 ? (
      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center bg-accent-pine px-1 text-[10px] font-semibold text-white">
        {count > 99 ? '99+' : count}
      </span>
    ) : null;

  const cartLink = (
    <NavLink
      to="/cart"
      className={({ isActive }) =>
        `relative flex h-10 w-10 items-center justify-center border transition-colors ${
          isActive ? 'border-border-strong bg-surface-container-low' : 'border-border-grid bg-white hover:border-border-strong'
        }`
      }
      onClick={() => setOpen(false)}
      aria-label={`Cart, ${count} items`}
    >
      <Icon name="shopping_bag" className="text-base" />
      {cartBadge}
    </NavLink>
  );

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  const authArea = !ready ? null : user ? (
    <div className="flex items-center gap-3">
      <span className="hidden border border-border-grid px-2.5 py-1.5 font-label-md uppercase tracking-wider text-text-primary lg:block">
        {initials} · {user.name.split(' ')[0]}
      </span>
      <button type="button" className="btn-outline !px-4 !py-2" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link to="/register" className="btn-outline !px-4 !py-2" onClick={() => setOpen(false)}>
        Create account
      </Link>
      <Link to="/login" className="btn-primary !px-4 !py-2" onClick={() => setOpen(false)}>
        Sign in
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border-grid bg-white/95">
      <nav
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 md:px-8"
        aria-label="Main navigation"
      >
        {/* Brand lockup */}
        <Link to="/" className="flex flex-shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <img src="/brand/logo-compact.svg" alt="Northwind Market" className="h-6 w-auto object-contain" />
          <span className="hidden text-sm font-bold uppercase tracking-wider text-text-primary sm:inline">
            Northwind Market
          </span>
        </Link>

        {/* Architectural search */}
        <form onSubmit={submitSearch} className="hidden max-w-sm flex-1 lg:block">
          <div className="flex items-center border border-border-grid bg-white px-3 py-1.5 transition-colors focus-within:border-border-strong">
            <Icon name="search" className="mr-2 text-base text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-xs uppercase tracking-wider text-text-primary placeholder:text-text-muted focus:outline-none"
              placeholder="Search books, bags, desk…"
              aria-label="Search products"
            />
            <kbd className="hidden items-center border border-border-grid bg-surface-container-low px-1.5 py-0.5 text-[10px] tracking-tighter text-text-muted sm:inline-flex">
              ENTER
            </kbd>
          </div>
        </form>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 font-label-md md:flex">
          {ready && navLinks}
          {cartLink}
          {authArea}
        </div>

        {/* Mobile utilities */}
        <div className="flex items-center gap-2 md:hidden">
          {cartLink}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center border border-border-grid bg-white text-text-primary hover:border-border-strong"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} className="text-base" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border-grid bg-white px-4 py-3 md:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <div className="flex items-center border border-border-grid px-3 py-2 focus-within:border-border-strong">
              <Icon name="search" className="mr-2 text-base text-text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-xs uppercase tracking-wider focus:outline-none"
                placeholder="Search the archive…"
                aria-label="Search products"
              />
            </div>
          </form>
          <div className="flex flex-col gap-1">{ready && navLinks}</div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-grid pt-3">
            {user ? (
              <>
                <span className="font-label-md uppercase tracking-wider text-text-muted">
                  {user.name.split(' ')[0]}
                </span>
                <button type="button" className="btn-outline !px-4 !py-2" onClick={onSignOut}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-outline flex-1 !px-4 !py-2" onClick={() => setOpen(false)}>
                  Create account
                </Link>
                <Link to="/login" className="btn-primary flex-1 !px-4 !py-2" onClick={() => setOpen(false)}>
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
