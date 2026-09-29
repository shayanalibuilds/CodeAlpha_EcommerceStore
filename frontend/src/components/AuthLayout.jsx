import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

/**
 * Authentication Gateway shell — "SYS_AUTH.V4 // ENCRYPTED NODE" bay
 * from the designer mockups (06-auth / 12-auth). Renders standalone:
 * App.jsx skips the global Navbar/Footer on /login and /register.
 */
export default function AuthLayout({ active, right, children }) {
  const isSignIn = active === 'signin';

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-surface px-4 py-8 md:py-12">
      <div className="flex w-full max-w-xl flex-col border border-border-grid bg-surface-pure">
        {/* Top meta status strip */}
        <div className="flex items-center justify-between border-b border-border-grid bg-surface-paper px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
            <span className="font-label-sm uppercase tracking-widest text-on-surface-variant">
              SYS_AUTH.V4 // ENCRYPTED NODE
            </span>
          </div>
          <div className="hidden items-center gap-4 text-text-muted sm:flex">
            <span className="font-label-sm uppercase tracking-widest">GATEWAY: 01-B</span>
            <span className="font-label-sm font-semibold uppercase tracking-widest text-accent-pine">
              STATUS: NOMINAL
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
                AUTHENTICATION GATEWAY
              </p>
            </div>
            <span className="border border-border-grid px-2 py-1 font-label-sm uppercase text-text-muted">
              REV. 2026.04
            </span>
          </div>
          <p className="mt-2 font-body-sm text-text-muted">
            Study staples, archival consignments, and mocked settlement — a student-run market demo.
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

        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="w-full border-t border-border-grid" aria-hidden="true" />
          <span className="absolute bg-surface-pure px-3 font-label-sm uppercase tracking-widest text-text-muted">
            Enterprise Directory &amp; Protocols
          </span>
        </div>

        {/* SSO + hardware token rails (decorative in this demo) */}
        <div className="grid grid-cols-1 gap-2.5 px-6 pb-6 md:px-8">
          <div
            className="flex h-11 select-none items-center justify-between border border-border-grid bg-surface-paper px-4 opacity-60"
            title="Not wired in this demo build"
          >
            <span className="flex items-center gap-3">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.24 10.285V13.4h6.887C18.2 16.27 15.65 18.28 12.24 18.28c-3.47 0-6.28-2.81-6.28-6.28s2.81-6.28 6.28-6.28c1.56 0 2.97.57 4.07 1.5l2.4-2.4C17.27 3.39 14.92 2.5 12.24 2.5 6.98 2.5 2.72 6.76 2.72 12s4.26 9.5 9.52 9.5c5.5 0 9.15-3.86 9.15-9.32 0-.63-.06-1.25-.17-1.89h-8.98z" />
              </svg>
              <span className="font-label-md uppercase tracking-wider text-on-surface-variant">
                Continue with Google Workspace
              </span>
            </span>
            <span className="font-label-sm uppercase text-text-muted">SSO // OIDC</span>
          </div>
          <div
            className="flex h-11 select-none items-center justify-between border border-border-grid bg-surface-paper px-4 opacity-60"
            title="Not wired in this demo build"
          >
            <span className="flex items-center gap-3">
              <Icon name="passkey" className="text-lg text-text-primary" />
              <span className="font-label-md uppercase tracking-wider text-on-surface-variant">
                FIDO2 / Hardware Security Key
              </span>
            </span>
            <span className="font-label-sm uppercase text-text-muted">YUBIKEY // PKI</span>
          </div>
        </div>

        {/* Compliance footer */}
        <div className="flex flex-col gap-3 border-t border-border-grid bg-surface-paper p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 font-label-sm uppercase text-text-muted">
            <span className="flex items-center gap-2">
              <Icon name="verified" className="text-sm text-accent-pine" />
              <span>{right || 'Verified curator & administrative access'}</span>
            </span>
            <span>MOCK LEDGER · ZERO CHARGES</span>
          </div>
          <p className="font-body-sm leading-relaxed text-text-muted">
            Access is monitored for demo integrity. Payments are mocked — no real card is ever
            charged, and seeded demo accounts are safe to explore.
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
