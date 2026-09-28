import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api/products.js';
import { useApi } from '../hooks/useApi.js';
import { useCart } from '../context/CartContext.jsx';
import Price from '../components/Price.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { CATEGORY_LABELS } from '../components/categories.js';

function StockLine({ stock }) {
  if (stock === 0) return <p className="mt-2 text-sm font-semibold text-red-600">Out of stock</p>;
  if (stock <= 5) {
    return <p className="mt-2 text-sm font-semibold text-amber-600">Only {stock} left in stock</p>;
  }
  return <p className="mt-2 text-sm font-semibold text-emerald-600">In stock ({stock} available)</p>;
}

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
              <h1 className="mt-3 text-xl font-bold text-brand-700">Product not found</h1>
              <p className="mt-2 text-sm text-brand-700/70">
                It may have been removed or is no longer available.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-brand-700">Something went wrong</h1>
              <p className="mt-2 text-sm text-brand-700/70">{error.message}</p>
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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav className="text-sm text-brand-700/60" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand-700 hover:underline">
          Shop
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-brand-900">{product.title}</span>
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="card overflow-hidden">
          <img
            src={product.imageUrl || '/images/products/placeholder.svg'}
            alt={product.title}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div>
          <span className="chip bg-brand-50 text-brand-700 ring-brand-100">
            {CATEGORY_LABELS[product.category] || product.category}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-brand-900 sm:text-3xl">{product.title}</h1>
          <Price cents={product.priceCents} className="mt-3 block text-3xl font-bold text-brand-700" />
          <StockLine stock={product.stock} />
          <p className="mt-4 leading-relaxed text-brand-900/80">{product.description}</p>

          <AddToCart product={product} out={out} />
        </div>
      </div>
    </main>
  );
}

function AddToCart({ product, out }) {
  const { add } = useCart();
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

  return (
    <div className="mt-6 border-t border-brand-50 pt-6">
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
