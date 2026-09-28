import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <div className="card p-10">
        <span
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl"
        >
          🧭
        </span>
        <h1 className="mt-4 text-2xl font-bold text-brand-700">Page not found</h1>
        <p className="mt-2 text-sm text-brand-700/70">
          The page you were looking for does not exist or may have moved.
        </p>
        <Link to="/" className="btn-primary mt-6">
          Back to shop
        </Link>
      </div>
    </main>
  );
}
