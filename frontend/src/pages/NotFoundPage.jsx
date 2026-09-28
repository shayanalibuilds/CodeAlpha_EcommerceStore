import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <div className="card p-10">
        <p className="text-5xl font-bold text-stone-900" aria-hidden="true">
          404
        </p>
        <h1 className="mt-3 text-xl font-bold text-stone-900">This page doesn't exist</h1>
        <p className="mt-2 text-sm text-stone-500">
          The page you were looking for does not exist or may have moved.
        </p>
        <Link to="/" className="btn-primary mt-6">
          Back to shop
        </Link>
      </div>
    </main>
  );
}
