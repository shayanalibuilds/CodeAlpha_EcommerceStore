import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <div className="card p-10">
        <span
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-3xl"
        >
          🔒
        </span>
        <h1 className="mt-4 text-xl font-bold text-stone-900">Admins only</h1>
        <p className="mt-2 text-sm text-stone-500">
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
