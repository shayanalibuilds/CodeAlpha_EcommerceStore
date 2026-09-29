import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';

/**
 * Operations console chrome — fixed w-64 sidebar + top bar with breadcrumb,
 * per the admin mockups (04 / 07 / 08). Pages render inside <main>.
 */

const NAV_SECTIONS = [
  {
    label: 'Catalogue & Ops',
    items: [
      { to: '/admin/products', label: 'Products', icon: 'inventory_2' },
      { to: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Inventory', icon: 'warehouse', soon: true },
      { label: 'Customers', icon: 'group', soon: true },
      { label: 'Analytics', icon: 'analytics', soon: true },
      { label: 'Settings', icon: 'settings', soon: true },
    ],
  },
];

export default function AdminLayout({ section = 'Console', children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OP';

  return (
    <div className="min-h-screen w-full bg-surface font-body-md text-on-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-border-grid bg-surface-pure md:flex">
        <div className="flex h-16 items-center justify-between border-b border-border-grid px-space-md">
          <Link to="/" className="flex items-center" aria-label="Northwind Market — storefront">
            <img src="/brand/logo-compact.svg" alt="Northwind Market" className="h-6 w-auto object-contain" />
          </Link>
          <span className="border border-border-grid px-space-xs py-0.5 font-label-sm text-text-muted">OPS</span>
        </div>
        <nav className="flex flex-1 flex-col py-space-sm" aria-label="Admin navigation">
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.label}>
              <div className="border-t border-border-grid px-space-md py-space-xs font-label-sm uppercase tracking-widest text-text-muted first:border-t-0">
                {sec.label}
              </div>
              {sec.items.map((item) =>
                item.soon ? (
                  <span
                    key={item.label}
                    className="flex cursor-not-allowed items-center gap-space-sm px-space-md py-space-sm font-label-lg uppercase text-on-surface-variant/40"
                    title="Planned — not part of this demo"
                  >
                    <Icon name={item.icon} className="text-[18px]" />
                    {item.label}
                    <span className="ml-auto border border-border-grid px-1 py-0.5 font-label-sm text-text-muted">SOON</span>
                  </span>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-space-sm px-space-md py-space-sm font-label-lg uppercase transition-colors ${
                        isActive
                          ? 'border-l-2 border-border-strong bg-accent-pine font-semibold text-white'
                          : 'border-l-2 border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`
                    }
                  >
                    <Icon name={item.icon} className="text-[18px]" />
                    {item.label}
                  </NavLink>
                )
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-border-grid p-space-md">
          <span className="flex items-center gap-space-sm font-label-sm uppercase text-text-muted">
            <span className="h-2 w-2 bg-accent-pine" aria-hidden="true" />
            Grid Sync: 100%
          </span>
          <span className="font-label-sm text-text-muted">v2.4</span>
        </div>
      </aside>

      <div className="md:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-grid bg-surface-pure px-space-md md:px-space-lg">
          <div className="flex items-center gap-space-md">
            <span className="flex items-center gap-2 font-label-sm uppercase text-text-muted">
              <Link to="/" className="hover:text-on-surface">
                Console
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-on-surface">{section}</span>
            </span>
            <span className="hidden items-center border border-border-grid bg-surface-paper px-3 py-1.5 font-body-sm text-text-muted lg:flex">
              <Icon name="folder_managed" className="mr-2 text-[16px]" />
              {pathname}
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <span className="hidden items-center gap-2 font-label-sm uppercase text-text-primary sm:flex">
              <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
              System Live
            </span>
            <span className="flex items-center gap-space-sm border-l border-border-grid pl-space-sm">
              <span className="flex h-8 w-8 items-center justify-center border border-border-grid bg-surface-paper font-label-sm font-semibold text-text-primary">
                {initials}
              </span>
              <span className="hidden flex-col lg:flex">
                <span className="font-label-sm uppercase leading-tight text-text-primary">{user?.name}</span>
                <span className="font-label-sm uppercase leading-tight text-text-muted">{user?.role || 'Operator'}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="flex items-center gap-1.5 border border-border-grid px-2.5 py-1.5 font-label-sm uppercase tracking-wider text-text-muted transition-colors hover:border-border-strong hover:text-text-primary"
            >
              <Icon name="logout" className="text-[16px]" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="w-full pb-16">{children}</main>
      </div>

      {/* Mobile admin switcher */}
      <nav
        className="fixed bottom-0 z-40 flex w-full items-stretch border-t border-border-grid bg-surface-pure md:hidden"
        aria-label="Admin navigation (mobile)"
      >
        {[
          { to: '/admin/products', label: 'Products', icon: 'inventory_2' },
          { to: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
          { to: '/', label: 'Storefront', icon: 'storefront' },
        ].map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 py-3 uppercase transition-colors ${
                isActive ? 'text-accent-pine' : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            <Icon name={t.icon} className="text-[20px]" />
            <span className="font-label-sm tracking-wider">{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
