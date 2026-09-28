import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders } from '../api/orders.js';
import { useApi } from '../hooks/useApi.js';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { STATUS_LABELS, STATUS_CHIP, orderNumber, formatDate } from '../components/orderMeta.js';

const TILE_TONES = [
  'bg-brand-100 text-brand-800',
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-800',
];

// Small round tiles with product initials (order items carry no image URLs).
function ItemTiles({ items }) {
  return (
    <span className="flex" aria-hidden="true">
      {items.slice(0, 3).map((item, idx) => (
        <span
          key={idx}
          className={`-ml-2 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-white first:ml-0 ${
            TILE_TONES[idx % TILE_TONES.length]
          }`}
        >
          {item.title.charAt(0).toUpperCase()}
        </span>
      ))}
    </span>
  );
}

const FILTERS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function OrdersPage() {
  const { data, loading, error, retry } = useApi(() => listOrders(), []);
  const [filter, setFilter] = useState('');

  if (loading) return <PageLoader label="Loading your orders…" />;

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Alert onRetry={retry}>Could not load your orders: {error.message}</Alert>
      </main>
    );
  }

  const orders = data?.orders || [];
  const visible = orders.filter((o) => !filter || o.status === filter);

  if (orders.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <EmptyState
          icon="📦"
          title="No orders yet"
          action={
            <Link to="/" className="btn-primary">
              Start shopping
            </Link>
          }
        >
          When you place an order, its receipt will show up here.
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My orders</h1>
          <p className="mt-1 text-sm text-stone-500">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} in your history.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-500">
          <select
            className="input !w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter orders by status"
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-6 space-y-3">
        {visible.map((o) => (
          <li key={o.id}>
            <Link
              to={`/orders/${o.id}`}
              className={`card flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md ${
                o.status === 'cancelled' ? 'opacity-70' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-stone-900">{orderNumber(o.id)}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} items
                </p>
                <p className="mt-1 text-xs font-medium text-brand-700">View details</p>
              </div>
              <div className="flex items-center gap-3">
                <ItemTiles items={o.items} />
                <span className={`chip ${STATUS_CHIP[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                <Price cents={o.totalCents} className="font-bold text-stone-900" />
                <svg className="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              </div>
            </Link>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="card p-8 text-center text-sm text-stone-500">
            No orders with status "{filter}".
          </li>
        )}
      </ul>
    </main>
  );
}
