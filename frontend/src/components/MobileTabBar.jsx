import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Icon from './Icon.jsx';

/**
 * Mobile bottom tab bar (Index / Catalog / Bag / Client) — storefront only.
 * Hidden on admin screens (they render the ops sidebar instead) and auth gateway.
 */
export default function MobileTabBar() {
  const { user } = useAuth();
  const { count } = useCart();

  const client = user ? { to: '/orders', label: 'Orders' } : { to: '/login', label: 'Sign in' };

  const tabs = [
    { to: '/', label: 'Index', icon: 'grid_view', end: true },
    { to: '/products', label: 'Catalog', icon: 'category' },
    { to: '/cart', label: 'Bag', icon: 'shopping_bag', badge: count },
    { to: client.to, label: 'Client', icon: 'manage_accounts' },
  ];

  return (
    <nav
      className="fixed bottom-0 z-40 w-full border-t border-border-grid bg-white/95 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-stretch justify-around">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `relative flex min-w-14 flex-1 flex-col items-center justify-center gap-1 uppercase transition-colors ${
                isActive ? 'text-accent-pine' : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            <span className="relative">
              <Icon name={t.icon} className="text-[20px]" />
              {t.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center bg-accent-pine px-1 text-[10px] font-semibold text-white">
                  {t.badge > 99 ? '99+' : t.badge}
                </span>
              )}
            </span>
            <span className="font-label-sm tracking-wider">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
