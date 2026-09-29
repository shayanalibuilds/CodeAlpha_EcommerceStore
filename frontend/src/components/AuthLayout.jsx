import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

/**
 * Auth page shell — brand frame around the real email/password forms.
 * Renders standalone: App.jsx skips the global Navbar/Footer on /login and
 * /register. Only elements backed by real functionality appear here.
 */
export default function AuthLayout({ active, children }) {
  const isSignIn = active === 'signin';

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-surface px-4 py-8 md:py-12">
      <div className="flex w-full max-w-xl flex-col border border-border-grid bg-surface-pure">
        {/* Top meta status strip */}
        <div className="flex items-center justify-between border-b border-border-grid bg-surface-paper px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
            <span className="font-label-sm uppercase tracking-widest text-on-surface-variant">
              Northwind Market // Student-Run Demo
            </span>
          </div>
          <div className="hidden items-center gap-4 text-text-muted sm:flex">
            <span className="font-label-sm font-semibold uppercase tracking-widest text-accent-pine">
              Payments: Mocked
            </span>
          </div>
        </div>

        {/* Brand header */}
        <div className="border-b border-border-grid px-6 pb-5 pt-6 md:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <div className="mb-2 flex items-center gap-3">
                <img src="/brand/logo-mark.svg" alt="" className="h-8 w-8 object-contain" />
                <span className="font-label-lg uppercase tracking-widest text-text-primary">
                  Northwind Market
                </span>
              </div>
              <p className="font-headline-sm font-medium tracking-tight text-text-primary">
                {isSignIn ? 'WELCOME BACK' : 'JOIN THE MARKET'}
              </p>
            </div>
          </div>
          <p className="mt-2 font-body-sm text-text-muted">
            Sign in with your email and password to browse the catalog, keep a bag, and place
            orders — a student-run market demo.
          </p>
        </div>

        {/* Segmented mode tabs */}
        <div className="grid grid-cols-2 border-b border-border-grid bg-surface-paper" role="tablist">
          <Link
            to="/login"
            role="tab"
            aria-selected={isSignIn}
            className={`flex items-center justify-center gap-2 border-r border-border-grid py-3 px-4 font-label-lg uppercase tracking-wider transition-colors ${
              isSignIn ? 'bg-surface-pure text-text-primary' : 'text-text-muted hover:bg-surface-pure hover:text-text-primary'
            }`}
          >
            <span className={`inline-block h-1.5 w-1.5 ${isSignIn ? 'bg-accent-pine' : 'bg-transparent'}`} aria-hidden="true" />
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            role="tab"
            aria-selected={!isSignIn}
            className={`flex items-center justify-center gap-2 py-3 px-4 font-label-lg uppercase tracking-wider transition-colors ${
              !isSignIn ? 'bg-surface-pure text-text-primary' : 'text-text-muted hover:bg-surface-pure hover:text-text-primary'
            }`}
          >
            <span className={`inline-block h-1.5 w-1.5 ${!isSignIn ? 'bg-accent-pine' : 'bg-transparent'}`} aria-hidden="true" />
            <span>Create Account</span>
          </Link>
        </div>

        {/* Form container */}
        <div className="flex flex-col gap-6 p-6 md:p-8">{children}</div>

        {/* Compliance footer */}
        <div className="flex flex-col gap-3 border-t border-border-grid bg-surface-paper p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 font-label-sm uppercase text-text-muted">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
              <span>Email &amp; password sign-in</span>
            </span>
            <span>MOCK LEDGER · ZERO CHARGES</span>
          </div>
          <p className="font-body-sm leading-relaxed text-text-muted">
            Payments are mocked — no real card is ever charged, and seeded demo accounts are safe
            to explore.
          </p>
        </div>
      </div>

      <Link
        to="/products"
        className="mt-6 flex items-center gap-2 font-label-md uppercase tracking-wider text-text-muted transition-colors hover:text-text-primary"
      >
        <Icon name="arrow_back" className="text-base" />
        Back to the market
      </Link>
    </main>
  );
}
