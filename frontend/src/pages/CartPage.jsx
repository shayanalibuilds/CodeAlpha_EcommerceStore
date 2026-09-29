import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import Icon from '../components/Icon.jsx';

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

  if (loading) return <PageLoader label="Loading your bag…" />;

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <EmptyState
          icon="shopping_bag"
          title="Your bag is empty"
          action={
            <Link to="/products" className="btn-primary">
              Browse the catalog
            </Link>
          }
        >
          Add a book or a notebook — your picks will wait for you here.
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 pb-20 md:px-8">
      {/* Header strip */}
      <div className="flex flex-col justify-between gap-4 border-b border-border-grid pb-6 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-label-md font-semibold uppercase tracking-widest text-accent-pine">
              Carry Tray
            </span>
            <span className="text-outline" aria-hidden="true">/</span>
            <span className="font-label-md uppercase tracking-widest text-on-surface-variant">
              Pre-Checkout Review
            </span>
          </div>
          <h1 className="font-headline-lg tracking-tight text-on-surface">Your Bag</h1>
          <p className="mt-1 font-body-sm text-text-muted">
            {count} {count === 1 ? 'item' : 'items'} reserved for review — stock is not held until checkout.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-border-grid bg-white px-4 py-2">
          <span className="font-label-md text-on-surface-variant">BAG MANIFEST:</span>
          <span className="font-label-md font-semibold text-accent-pine">{count} / UNITS</span>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Line items */}
        <ul className="flex flex-col">
          {items.map((item, idx) => (
            <li
              key={item.productId}
              className={`flex gap-4 py-space-md ${idx > 0 ? 'border-t border-border-grid' : ''}`}
            >
              <Link to={`/products/${item.productId}`} className="shrink-0">
                <div className="flex h-24 w-24 items-center justify-center border border-border-grid bg-surface-container-low sm:h-28 sm:w-28">
                  <img
                    src={item.imageUrl || '/images/products/placeholder.svg'}
                    alt={item.title}
                    className="h-full w-full object-cover grayscale-[15%]"
                  />
                </div>
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-headline-sm tracking-tight text-on-surface hover:text-accent-pine"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 font-body-sm text-text-muted">
                      <Price cents={item.priceCents} /> each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.productId)}
                    disabled={pendingId === item.productId}
                    className="btn-ghost !px-1.5 hover:!text-error"
                  >
                    <Icon name="delete" className="text-base" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <QtyStepper
                    qty={item.qty}
                    max={Math.min(item.stock, 99)}
                    disabled={pendingId === item.productId}
                    onDecrement={() => changeQty(item.productId, item.qty, -1)}
                    onIncrement={() => changeQty(item.productId, item.qty, 1)}
                  />
                  <Price cents={item.qty * item.priceCents} className="font-mono text-base font-bold text-on-surface" />
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary rail */}
        <aside className="h-fit border border-border-grid bg-white lg:sticky lg:top-24">
          <div className="border-b border-border-grid bg-surface-paper px-space-md py-3">
            <h2 className="meta-label font-semibold text-on-surface">Order Summary</h2>
          </div>
          <div className="flex flex-col gap-4 p-space-md">
            <dl className="flex flex-col gap-2 font-body-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted uppercase tracking-wider font-label-md">Subtotal</dt>
                <dd className="font-semibold text-on-surface">
                  <Price cents={subtotalCents} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted uppercase tracking-wider font-label-md">Dispatch</dt>
                <dd className="font-semibold text-accent-pine uppercase font-label-md tracking-wider">Complimentary</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between border-t border-border-grid pt-3">
              <span className="font-label-md uppercase tracking-widest text-text-muted">Total</span>
              <Price cents={subtotalCents} className="font-mono text-xl font-bold text-on-surface" />
            </div>
            <button type="button" className="btn-pine w-full" onClick={() => navigate('/checkout')}>
              <span>Continue to checkout</span>
              <Icon name="arrow_forward" className="text-sm" />
            </button>
            <p className="flex items-start gap-2 border border-border-grid bg-surface-paper p-2.5 font-label-sm uppercase tracking-wide text-text-muted">
              <Icon name="info" className="shrink-0 text-sm" />
              <span>Taxes &amp; shipping are out of scope for this demo.</span>
            </p>
            {!user && (
              <p className="font-body-sm leading-relaxed text-text-muted">
                You're browsing as a guest — you'll sign in at checkout to finish your order. Your
                bag stays saved in this browser.
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
