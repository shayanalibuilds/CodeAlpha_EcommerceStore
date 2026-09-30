import { Link } from 'react-router-dom';
import { CATEGORY_LABELS, CATEGORY_KEYS } from './categories.js';
import Icon from './Icon.jsx';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border-grid bg-white">
      <div className="mx-auto max-w-[1440px] px-4 pt-16 pb-12 md:px-8">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand & manifesto */}
          <div className="flex flex-col items-start lg:col-span-4">
            <div className="mb-6 flex items-center">
              <img src="/brand/logo-tile.svg" alt="Northwind Market" className="h-8 w-8 object-contain" />
            </div>
            <p className="mb-6 font-body-sm leading-relaxed text-text-muted">
              A student-run market for quietly useful study goods — books, stationery, bags, audio,
              and desk instruments, curated with deliberate restraint.
            </p>
            <div className="chip px-3 py-1 font-mono text-text-primary">
              <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
              Student-Run · CodeAlpha Demo
            </div>
          </div>

          {/* Curated categories */}
          <div className="flex flex-col lg:col-span-3">
            <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
              Curated Categories
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs uppercase tracking-wider text-text-muted">
              {CATEGORY_KEYS.map((key) => (
                <li key={key}>
                  <Link to={`/products?category=${key}`} className="transition-colors hover:text-text-primary">
                    {CATEGORY_LABELS[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer care */}
          <div className="flex flex-col lg:col-span-3">
            <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
              Customer Care
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs uppercase tracking-wider text-text-muted">
              <li>
                <Link to="/orders" className="transition-colors hover:text-text-primary">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition-colors hover:text-text-primary">
                  Your Bag
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-text-primary">
                  Create An Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Material standard */}
          <div className="flex flex-col lg:col-span-2">
            <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
              Payment Standard
            </h3>
            <div className="border border-border-grid bg-white p-4">
              <p className="flex items-start gap-2 font-body-sm leading-relaxed text-text-muted">
                <Icon name="verified_user" className="mt-0.5 shrink-0 text-base text-accent-pine" />
                <span>Payments are mocked. No real card is charged.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Legal strip */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border-grid pt-6 font-mono text-[11px] uppercase tracking-wider text-text-muted sm:flex-row">
          <span>© 2026 Northwind Market. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
            Student-run demo · Payments are mocked
          </span>
        </div>
      </div>
    </footer>
  );
}
