import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function ForbiddenPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <div className="flex flex-col items-center border border-border-grid bg-white px-6 py-space-xl">
        <div className="mb-space-md flex h-14 w-14 items-center justify-center border border-border-grid bg-surface-container-low text-text-muted">
          <Icon name="lock" className="text-2xl" />
        </div>
        <span className="mb-2 font-mono text-xs uppercase tracking-widest text-accent-pine">
          ERROR 403 // RESTRICTED NODE
        </span>
        <h1 className="font-headline-md uppercase tracking-tight text-on-surface">Admins only</h1>
        <p className="mt-space-xs max-w-sm font-body-sm leading-relaxed text-text-muted">
          This area is limited to store admins. If you believe you should have access, sign in
          with an admin account.
        </p>
        <Link to="/" className="btn-primary mt-space-lg">
          Back to the market
        </Link>
      </div>
    </main>
  );
}
