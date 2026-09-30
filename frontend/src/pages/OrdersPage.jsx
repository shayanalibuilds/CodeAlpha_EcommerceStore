import { Link } from 'react-router-dom';
import { listOrders } from '../api/orders.js';
import { useApi } from '../hooks/useApi.js';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import Icon from '../components/Icon.jsx';
import {
  STATUS_LABELS,
  STATUS_CHIP,
  STATUS_ICON,
  orderNumber,
  formatDate,
  timeAgo,
} from '../components/orderMeta.js';

export default function OrdersPage() {
  const { data, loading, error, retry } = useApi(() => listOrders(), []);

  if (loading) return <PageLoader label="Loading your orders…" />;

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <Alert onRetry={retry}>Could not load your orders: {error.message}</Alert>
      </main>
    );
  }

  const orders = data?.orders || [];

  if (orders.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <EmptyState
          icon="package_2"
          title="No orders yet"
          action={
            <Link to="/products" className="btn-primary">
              Browse the catalog
            </Link>
          }
        >
          When you place an order, its receipt will show up here.
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 pb-20 md:px-8">
      {/* Header strip */}
      <div className="flex flex-col justify-between gap-4 border-b border-border-grid pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-label-md font-semibold uppercase tracking-widest text-accent-pine">
              Client Ledger
            </span>
            <span className="text-outline" aria-hidden="true">/</span>
            <span className="font-label-md uppercase tracking-widest text-on-surface-variant">
              Order History
            </span>
          </div>
          <h1 className="font-headline-lg tracking-tight text-on-surface">My Orders</h1>
          <p className="mt-1 font-body-sm text-text-muted">Your order history and dispatch receipts.</p>
        </div>
        <div className="flex items-center gap-2 border border-border-grid bg-white px-4 py-2">
          <span className="font-label-md text-on-surface-variant">RECORDS:</span>
          <span className="font-label-md font-semibold text-accent-pine">{orders.length}</span>
        </div>
      </div>

      {/* Order card ledger */}
      <ul className="mt-8 flex flex-col">
        {orders.map((o, idx) => (
          <li key={o.id} className={idx > 0 ? 'border-t border-border-grid' : ''}>
            <Link
              to={`/orders/${o.id}`}
              className="group flex flex-wrap items-center justify-between gap-4 py-4 transition-colors hover:bg-surface-container-low/60"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center border border-border-grid bg-white text-text-muted transition-colors group-hover:border-border-strong group-hover:text-on-surface">
                  <Icon name={STATUS_ICON[o.status]} className="text-lg" />
                </span>
                <div>
                  <p className="font-mono font-label-lg font-semibold uppercase text-on-surface group-hover:text-accent-pine">
                    {orderNumber(o.id)}
                  </p>
                  <p className="mt-0.5 font-body-sm text-text-muted">
                    {formatDate(o.createdAt)} · {timeAgo(o.createdAt)} ·{' '}
                    {o.items.reduce((s, i) => s + i.qty, 0)} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`chip px-2.5 py-1 ${STATUS_CHIP[o.status]}`}>
                  <Icon name={STATUS_ICON[o.status]} className="text-sm" />
                  {STATUS_LABELS[o.status]}
                </span>
                <Price cents={o.totalCents} className="font-mono text-base font-bold text-on-surface" />
                <Icon name="arrow_forward" className="text-text-muted transition-colors group-hover:text-on-surface" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
