import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct, listProducts } from '../api/products.js';
import { useApi } from '../hooks/useApi.js';
import { useCart } from '../context/CartContext.jsx';
import Price from '../components/Price.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { CATEGORY_LABELS } from '../components/categories.js';

function StockLine({ stock }) {
  if (stock === 0) return <p className="mt-2 text-sm font-semibold text-red-600">Out of stock</p>;
  if (stock <= 5) {
    return (
      <span className="chip mt-3 bg-amber-50 text-amber-700 ring-amber-200">
        Only {stock} left
      </span>
    );
  }
  return <p className="mt-2 text-sm font-semibold text-emerald-600">In stock ({stock} available)</p>;
}

const CHECKLIST = [
  'Ships in 1–2 days',
  'Free returns within 14 days',
  'Payments are mocked. No real card is charged.',
];

const CheckIcon = () => (
  <svg className="h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data, loading, error, retry } = useApi(() => getProduct(id), [id]);

  if (loading) return <PageLoader label="Loading product…" />;

  if (error) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-16">
        <div className="card p-10 text-center">
          {error.status === 404 ? (
            <>
              <p className="text-4xl" aria-hidden="true">
                🔍
              </p>
              <h1 className="mt-3 text-xl font-bold text-stone-900">Product not found</h1>
              <p className="mt-2 text-sm text-stone-500">
                It may have been removed or is no longer available.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-stone-900">Something went wrong</h1>
              <p className="mt-2 text-sm text-stone-500">{error.message}</p>
              <button type="button" onClick={retry} className="btn-secondary mt-4">
                Try again
              </button>
            </>
          )}
          <div>
            <Link to="/" className="btn-primary mt-6">
              Back to shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const product = data.product;
  const out = product.stock === 0;
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav className="text-sm text-stone-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-stone-900 hover:underline">
          Shop
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>{categoryLabel}</span>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="font-medium text-stone-900">{product.title}</span>
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="card overflow-hidden">
          <img
            src={product.imageUrl || '/images/products/placeholder.svg'}
            alt={product.title}
            className={`aspect-[4/3] w-full object-cover ${out ? 'opacity-60' : ''}`}
          />
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
            {categoryLabel}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">{product.title}</h1>
          <Price cents={product.priceCents} className="mt-3 block text-3xl font-bold text-stone-900" />
          <StockLine stock={product.stock} />
          <p className="mt-4 leading-relaxed text-stone-600">{product.description}</p>

          <AddToCart product={product} out={out} />

          <ul className="mt-6 space-y-2 border-t border-stone-200 pt-4 text-sm text-stone-600">
            {CHECKLIST.map((line) => (
              <li key={line} className="flex items-center gap-2">
                <CheckIcon />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <RelatedProducts category={product.category} excludeId={product.id} />
    </main>
  );
}

function AddToCart({ product, out }) {
  const { add } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'added' | 'error', msg? }

  const onAdd = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await add(product, qty);
      setFeedback({ type: 'added' });
      setTimeout(() => setFeedback(null), 2500);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.fields?.qty || err.message });
    } finally {
      setBusy(false);
    }
  };

  const onBuyNow = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await add(product, qty);
      navigate('/checkout');
    } catch (err) {
      setFeedback({ type: 'error', msg: err.fields?.qty || err.message });
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 border-t border-stone-200 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <QtyStepper
          qty={qty}
          max={Math.min(product.stock, 99)}
          disabled={out || busy}
          onDecrement={() => setQty((q) => Math.max(1, q - 1))}
          onIncrement={() => setQty((q) => Math.min(product.stock, 99, q + 1))}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={out || busy}
          className="btn-primary flex-1 sm:flex-none sm:px-10"
        >
          {out ? 'Out of stock' : busy ? 'Adding…' : 'Add to cart'}
        </button>
        <button type="button" onClick={onBuyNow} disabled={out || busy} className="btn-secondary">
          Buy now
        </button>
        {feedback?.type === 'added' && (
          <span className="text-sm font-semibold text-emerald-600" role="status">
            Added to cart ✓
          </span>
        )}
      </div>
      {feedback?.type === 'error' && (
        <p className="mt-2 text-sm font-medium text-red-600" role="alert">
          {feedback.msg}
        </p>
      )}
    </div>
  );
}

function MiniProductCard({ product }) {
  const { add } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onAdd = async () => {
    setBusy(true);
    setError('');
    try {
      await add(product, 1);
    } catch (err) {
      setError(err.fields?.qty || err.message);
    } finally {
      setBusy(false);
    }
  };

  const out = product.stock === 0;

  return (
    <div className="card flex flex-col transition-shadow hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block overflow-hidden bg-stone-100" aria-label={product.title}>
        <img
          src={product.imageUrl || '/images/products/placeholder.svg'}
          alt={product.title}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900">
            {product.title}
          </h3>
        </Link>
        <Price cents={product.priceCents} className="mt-1 font-bold text-stone-900" />
        <button
          type="button"
          onClick={onAdd}
          disabled={out || busy}
          className={`mt-2 w-full !px-3 !py-1.5 text-xs ${out ? 'btn bg-stone-200 text-stone-500' : 'btn-primary'}`}
        >
          {out ? 'Out of stock' : busy ? 'Adding…' : 'Add to cart'}
        </button>
        {error && (
          <p className="mt-1 text-xs font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function RelatedProducts({ category, excludeId }) {
  const { data } = useApi(() => listProducts({ category }), [category]);
  const items = (data?.items || []).filter((p) => p.id !== excludeId).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-stone-900">You might also like</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <MiniProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
