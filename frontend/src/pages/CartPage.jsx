import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';

export default function CartPage() {
  const { items, subtotalCents, count, loading, updateQty, remove } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState(null);

  const changeQty = async (productId, current, delta) => {
    setError('');
    setPendingId(productId);
    try {
      await updateQty(productId, current + delta);
    } catch (err) {
      setError(err.fields?.qty || err.message);
    } finally {
      setPendingId(null);
    }
  };

  const onRemove = async (productId) => {
    setError('');
    setPendingId(productId);
    try {
      await remove(productId);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return <PageLoader label="Loading your cart…" />;

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          action={
            <Link to="/" className="btn-primary">
              Browse catalog
            </Link>
          }
        >
          Add a book or a notebook — your picks will wait for you here.
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-700">Your cart</h1>
      <p className="mt-1 text-sm text-brand-700/70">
        {count} {count === 1 ? 'item' : 'items'} ready to go.
      </p>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.productId} className="card flex gap-3 p-3 sm:gap-4 sm:p-4">
              <Link to={`/products/${item.productId}`} className="shrink-0">
                <img
                  src={item.imageUrl || '/images/products/placeholder.svg'}
                  alt={item.title}
                  className="h-20 w-20 rounded-md object-cover sm:h-24 sm:w-24"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-sm font-semibold text-brand-900 hover:underline"
                  >
                    {item.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(item.productId)}
                    disabled={pendingId === item.productId}
                    className="shrink-0 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-brand-700/60">
                  <Price cents={item.priceCents} /> each
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                  <QtyStepper
                    qty={item.qty}
                    max={Math.min(item.stock, 99)}
                    disabled={pendingId === item.productId}
                    onDecrement={() => changeQty(item.productId, item.qty, -1)}
                    onIncrement={() => changeQty(item.productId, item.qty, 1)}
                  />
                  <Price cents={item.qty * item.priceCents} className="font-bold text-brand-700" />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-5 lg:sticky lg:top-20">
          <h2 className="font-semibold text-brand-700">Summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-700/70">Subtotal</dt>
              <dd className="font-semibold text-brand-900">
                <Price cents={subtotalCents} />
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-brand-700/60">
            Taxes and shipping are out of scope for this demo.
          </p>
          <button type="button" className="btn-primary mt-4 w-full" onClick={() => navigate('/checkout')}>
            Go to checkout
          </button>
          {!user && (
            <p className="mt-3 text-xs text-brand-700/60">
              You're browsing as a guest — you'll sign in at checkout to finish your order. Your
              cart stays saved in this browser.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
