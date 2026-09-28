import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <div className="card p-10">
        <p className="text-4xl" aria-hidden="true">
          🔒
        </p>
        <h1 className="mt-3 text-2xl font-bold text-brand-700">Admins only</h1>
        <p className="mt-2 text-sm text-brand-700/70">
          This area is limited to store admins. If you believe you should have access, sign
          in with an admin account.
        </p>
        <Link to="/" className="btn-primary mt-6">
          Back to shop
        </Link>
      </div>
    </main>
  );
}
