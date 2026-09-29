import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct, listProducts } from '../api/products.js';
import { useApi } from '../hooks/useApi.js';
import { useCart } from '../context/CartContext.jsx';
import Price from '../components/Price.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import Icon from '../components/Icon.jsx';
import { CATEGORY_LABELS } from '../components/categories.js';

function StockBadge({ stock }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-border-grid bg-surface-container-highest px-2 py-0.5 font-label-sm uppercase tracking-wider text-secondary">
        <span className="h-1.5 w-1.5 bg-secondary" aria-hidden="true" />
        Archived / Sold Out
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-error/30 bg-error-container/30 px-2 py-0.5 font-label-sm text-error">
        <span className="h-1.5 w-1.5 bg-error" aria-hidden="true" />
        <span className="font-semibold">Only {stock} left in stock</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 border border-accent-pine/30 bg-accent-pine/5 px-2 py-0.5 font-label-sm text-accent-pine">
      <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
      <span className="font-semibold">In stock · {stock} available</span>
    </span>
  );
}

/* Architectural compass-grid stage backdrop (from the design's CAD orbit plate). */
function CompassGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
      <svg className="stroke-on-surface" fill="none" height="420" viewBox="0 0 100 100" width="420">
        <circle cx="50" cy="50" r="45" strokeDasharray="2 2" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="15" strokeDasharray="1 1" strokeWidth="0.5" />
        <line strokeWidth="0.5" x1="50" x2="50" y1="0" y2="100" />
        <line strokeWidth="0.5" x1="0" x2="100" y1="50" y2="50" />
      </svg>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data, loading, error, retry } = useApi(() => getProduct(id), [id]);
  const product = data?.product;

  // Related pieces from the same category
  const { data: relData } = useApi(
    () => (product ? listProducts({ category: product.category }) : Promise.resolve(null)),
    [product?.id, product?.category]
  );
  const related = (relData?.items || []).filter((p) => p.id !== product?.id).slice(0, 4);

  if (loading) return <PageLoader label="Loading product…" />;

  if (error) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-16">
        <div className="flex flex-col items-center justify-center border border-border-grid bg-white px-6 py-space-xl text-center">
          <div className="mb-space-md flex h-14 w-14 items-center justify-center border border-border-grid bg-surface-container-low text-text-muted">
            <Icon name={error.status === 404 ? 'search_off' : 'report'} className="text-2xl" />
          </div>
          {error.status === 404 ? (
            <>
              <h1 className="font-headline-sm font-semibold uppercase tracking-tight text-on-surface">
                Product not found
              </h1>
              <p className="mt-space-xs font-body-sm text-body-sm text-text-muted">
                It may have been archived or is no longer available in the catalog.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-headline-sm font-semibold uppercase tracking-tight text-on-surface">
                Something went wrong
              </h1>
              <p className="mt-space-xs font-body-sm text-body-sm text-text-muted">{error.message}</p>
              <button type="button" onClick={retry} className="btn-outline mt-space-lg">
                Try again
              </button>
            </>
          )}
          <div className="mt-space-lg">
            <Link to="/products" className="btn-primary">
              Back to catalog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const out = product.stock === 0;

  return (
    <main className="w-full bg-surface-pure pb-16">
      {/* Breadcrumb & context bar */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-border-grid px-4 pt-6 pb-3 md:px-8"
      >
        <ol className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <li>
            <Link to="/products" className="transition-colors hover:text-accent-pine">
              Catalog
            </Link>
          </li>
          <li className="text-outline" aria-hidden="true">
            /
          </li>
          <li>
            <Link
              to={`/products?category=${product.category}`}
              className="transition-colors hover:text-accent-pine"
            >
              {CATEGORY_LABELS[product.category] || product.category}
            </Link>
          </li>
          <li className="text-outline" aria-hidden="true">
            /
          </li>
          <li className="max-w-[160px] truncate font-semibold text-on-surface sm:max-w-none">
            {product.title}
          </li>
        </ol>
        <div className="flex items-center gap-3">
          <span className="chip bg-surface-container-low text-tertiary">
            <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
            Ref. {product.slug.toUpperCase()}
          </span>
          <span className="hidden font-label-sm uppercase tracking-wider text-outline sm:inline">
            Northwind Market Series
          </span>
        </div>
      </nav>

      {/* Product canvas */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">
          {/* LEFT: gallery frame */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="relative flex w-full flex-col items-center border border-border-grid bg-surface p-4 sm:p-6">
              {/* Utility rail */}
              <div className="flex w-full items-center justify-between">
                <span className="inline-flex items-center gap-1.5 border border-border-grid bg-surface px-2 py-1 font-label-sm font-semibold uppercase tracking-wider text-tertiary">
                  <Icon name="eco" className="text-xs text-accent-pine" />
                  Family-Safe Selection
                </span>
                <span className="chip bg-surface font-label-sm uppercase text-on-surface-variant">
                  {CATEGORY_LABELS[product.category] || product.category}
                </span>
              </div>

              {/* Centerpiece stage */}
              <div className="group relative mt-4 mb-6 flex w-full items-center justify-center overflow-hidden border border-border-grid bg-surface-container-low p-6 sm:p-10">
                <CompassGrid />
                <img
                  src={product.imageUrl || '/images/products/placeholder.svg'}
                  alt={product.title}
                  className="relative z-10 max-h-[480px] w-full max-w-[420px] object-contain py-2 transition-transform duration-300 ease-out group-hover:scale-[1.01]"
                />
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 border border-border-grid bg-surface px-2 py-1 font-label-sm text-on-surface-variant">
                  <Icon name="360" className="text-sm" />
                  <span>Static Studio Plate</span>
                </div>
              </div>

              {/* Moniker & spatial chips */}
              <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-border-grid pt-4 sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="font-label-md font-semibold uppercase tracking-tight text-on-surface">
                    {product.title}
                  </p>
                  <span className="font-body-sm text-outline">
                    Ref. {product.slug.toUpperCase()} · Northwind Market Catalog
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip bg-surface px-4 py-1 font-label-md font-semibold normal-case text-on-surface">
                    <Icon name="inventory" className="text-sm text-outline" />
                    {product.stock} units on hand
                  </span>
                  <span className="chip bg-surface px-4 py-1 font-label-md font-semibold text-on-surface">
                    <Icon name="payments" className="text-sm text-outline" />
                    Mocked checkout
                  </span>
                </div>
              </div>
            </div>

            {/* Sustainability guarantee unit */}
            <div className="flex items-start gap-4 border border-border-grid bg-surface p-4 sm:p-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-border-grid bg-surface-container-low text-accent-pine">
                <Icon name="recycling" className="text-xl" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">Earth-Kind Craftsmanship</h4>
                  <span className="chip bg-surface-container-low font-label-sm font-semibold uppercase text-tertiary">
                    Live Inventory
                  </span>
                </div>
                <p className="font-body-sm leading-relaxed text-on-surface-variant">
                  Every order reserves real stock atomically — quantities update the moment a peer
                  checks out. Cancelled orders return their units to the shelf automatically.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: buy box */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="flex flex-col gap-6 border border-border-grid bg-surface p-6 sm:p-8">
              {/* Eyebrow & live stock */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm font-semibold uppercase tracking-widest text-tertiary">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </span>
                  <span className="chip uppercase text-on-surface-variant">Family Safe</span>
                </div>
                <StockBadge stock={product.stock} />
              </div>

              {/* Title & price */}
              <div className="flex flex-col gap-2">
                <h1 className="font-headline-lg font-semibold tracking-tight text-on-surface">
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-4 border-y border-border-grid py-2">
                  <Price cents={product.priceCents} className="font-headline-md font-bold tracking-tight text-on-surface" />
                  <span className="font-label-sm uppercase tracking-wider text-outline">USD · VAT Inc.</span>
                </div>
              </div>

              {/* Anatomy paragraph */}
              <p className="font-body-md leading-relaxed text-on-surface-variant">{product.description}</p>

              {/* 2x2 feature bento */}
              <div className="grid grid-cols-2 gap-px border border-border-grid bg-border-grid">
                {[
                  { icon: 'inventory_2', k: 'Stock', v: product.stock > 0 ? `${product.stock} units` : 'Sold out' },
                  { icon: 'verified_user', k: 'Checkout', v: 'Mocked · Secure' },
                  { icon: 'local_shipping', k: 'Dispatch', v: 'Ships in 24h' },
                  { icon: 'published_with_changes', k: 'Returns', v: '14-day window' },
                ].map((f) => (
                  <div key={f.k} className="flex items-center gap-2 bg-surface p-2">
                    <Icon name={f.icon} className="text-xl text-accent-pine" />
                    <div className="flex flex-col">
                      <span className="font-label-sm uppercase text-outline">{f.k}</span>
                      <span className="font-label-md font-semibold text-on-surface">{f.v}</span>
                    </div>
                  </div>
                ))}
              </div>

              <AddToCart product={product} out={out} />

              {/* Trust & dispatch strip */}
              <div className="flex flex-col gap-2 border-t border-border-grid pt-4">
                <p className="flex items-center gap-2 font-body-sm text-on-surface">
                  <Icon name="local_shipping" className="text-lg text-accent-pine" />
                  <span>
                    Stock is <strong>verified live</strong> — quantities are reserved at checkout.
                  </span>
                </p>
                <p className="flex items-center gap-2 font-body-sm text-on-surface">
                  <Icon name="shield" className="text-lg text-accent-pine" />
                  <span>
                    <strong>Payments are mocked.</strong> No real card is charged.
                  </span>
                </p>
              </div>
            </div>

            {/* Origin & circularity pass row */}
            <div className="flex cursor-default items-center justify-between border border-border-grid bg-surface p-4">
              <div className="flex items-center gap-4">
                <Icon name="qr_code_2" className="text-tertiary" />
                <div className="flex flex-col">
                  <span className="font-label-md font-semibold uppercase tracking-wider text-on-surface">
                    Origin &amp; Stock Pass
                  </span>
                  <span className="font-body-sm text-outline">Listed {new Date(product.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <Icon name="arrow_forward" className="text-on-surface-variant" />
            </div>
          </div>
        </div>
      </section>

      {/* Field notes section */}
      <section className="mx-auto mt-8 w-full max-w-[1440px] border-t border-border-grid px-4 pt-10 md:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <span className="font-label-sm font-semibold uppercase tracking-widest text-tertiary">
              STORE NOTES &amp; STANDARDS
            </span>
            <h2 className="font-headline-lg font-semibold tracking-tight text-on-surface">
              Built for Calm Study
            </h2>
          </div>
          <p className="max-w-md font-body-sm text-on-surface-variant">
            Every piece in the Northwind archive is selected for durability, safety, and quiet
            everyday utility.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: 'spa',
              title: 'Non-Toxic & Family Safe',
              body: 'Water-based inks, BPA-free vessels, and lacquer-free finishes — chosen to be safe around children and shared study spaces.',
              meta: 'FAMILY-SAFE STANDARD',
              value: 'CHECKED',
            },
            {
              icon: 'balance',
              title: 'Calm Utility',
              body: 'Restrained palettes and honest materials. No noisy branding, no dark patterns — just tools that keep desks quiet and clear.',
              meta: 'DESIGN LANGUAGE',
              value: 'MINIMAL',
            },
            {
              icon: 'workspace_premium',
              title: 'Honest Stock Counts',
              body: 'Low-stock warnings on this page reflect the real database. When an item sells out, it archives until the next restock.',
              meta: 'INVENTORY LEDGER',
              value: 'LIVE',
            },
          ].map((c) => (
            <div key={c.title} className="flex flex-col justify-between border border-border-grid bg-surface p-6">
              <div className="flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-border-grid bg-surface-container-low text-accent-pine">
                  <Icon name={c.icon} className="text-xl" />
                </div>
                <h3 className="font-headline-sm font-semibold text-on-surface">{c.title}</h3>
                <p className="font-body-md leading-relaxed text-on-surface-variant">{c.body}</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border-grid pt-4 font-label-sm text-outline">
                <span>{c.meta}</span>
                <span className="font-semibold text-tertiary">{c.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pairings */}
      {related.length > 0 && (
        <section className="mx-auto mt-10 w-full max-w-[1440px] border-t border-border-grid px-4 pt-10 md:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm font-semibold uppercase tracking-wider text-outline">
                PAIRINGS &amp; EXTENSIONS
              </span>
              <h2 className="font-headline-md font-semibold text-on-surface">
                Complete the Study System
              </h2>
            </div>
            <Link
              to={`/products?category=${product.category}`}
              className="btn-outline !px-4 !py-2"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
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
    <div className="flex flex-col gap-4">
      <div className="flex items-stretch gap-3">
        <QtyStepper qty={qty} min={1} max={out ? 1 : Math.min(product.stock, 99)} disabled={out || busy} onDecrement={() => setQty((q) => Math.max(1, q - 1))} onIncrement={() => setQty((q) => Math.min(product.stock, 99, q + 1))} />
        <button
          type="button"
          onClick={onAdd}
          disabled={out || busy}
          className="flex h-12 flex-1 items-center justify-center gap-2 bg-accent-pine px-6 text-white transition-colors hover:bg-accent-pine-hover disabled:opacity-40"
        >
          <Icon name="shopping_cart" className="text-xl" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            {out ? 'Sold out' : busy ? 'Working…' : 'Add to cart'}
          </span>
        </button>
      </div>
      <button
        type="button"
        onClick={onBuyNow}
        disabled={out || busy}
        className="flex h-12 w-full items-center justify-center gap-2 border border-border-strong bg-surface font-headline-sm font-semibold text-on-surface transition-colors hover:bg-on-surface hover:text-surface disabled:opacity-40"
      >
        <Icon name="bolt" className="text-xl" />
        <span className="text-sm font-semibold uppercase tracking-wider">Buy now</span>
      </button>
      {feedback?.type === 'added' && (
        <p className="flex items-center gap-1.5 font-label-md uppercase tracking-wider text-tertiary" role="status">
          <Icon name="check_circle" className="text-base text-accent-pine" /> Added to your bag
        </p>
      )}
      {feedback?.type === 'error' && (
        <p className="font-label-md uppercase tracking-wider text-error" role="alert">
          {feedback.msg}
        </p>
      )}
    </div>
  );
}
