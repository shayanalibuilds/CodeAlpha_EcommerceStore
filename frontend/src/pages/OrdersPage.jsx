import { Link } from 'react-router-dom';
import { listOrders } from '../api/orders.js';
import { useApi } from '../hooks/useApi.js';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { STATUS_LABELS, STATUS_CHIP, orderNumber, formatDate } from '../components/orderMeta.js';

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
          icon="📦"
          title="No orders yet"
          action={
            <Link to="/" className="btn-primary">
              Browse catalog
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
      <h1 className="text-2xl font-bold text-brand-700">My orders</h1>
      <p className="mt-1 text-sm text-brand-700/70">Your order history and receipts.</p>

      <ul className="mt-6 space-y-3">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              to={`/orders/${o.id}`}
              className="card flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md"
            >
              <div>
                <p className="font-semibold text-brand-900">{orderNumber(o.id)}</p>
                <p className="mt-0.5 text-xs text-brand-700/60">
                  {formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} items
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`chip ${STATUS_CHIP[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                <Price cents={o.totalCents} className="font-bold text-brand-700" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
