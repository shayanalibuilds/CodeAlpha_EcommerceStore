import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrder } from '../api/orders.js';
import { useApi } from '../hooks/useApi.js';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import {
  STATUS_LABELS,
  STATUS_CHIP,
  PAYMENT_LABELS,
  orderNumber,
  formatDate,
} from '../components/orderMeta.js';

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const justOrdered = Boolean(location.state?.justOrdered);

  const { data, loading, error, retry } = useApi(() => getOrder(id), [id]);

  if (loading) return <PageLoader label="Loading your receipt…" />;

  if (error) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <div className="card p-10 text-center">
          {error.status === 404 ? (
            <>
              <p className="text-4xl" aria-hidden="true">
                🔍
              </p>
              <h1 className="mt-3 text-xl font-bold text-brand-700">Order not found</h1>
              <p className="mt-2 text-sm text-brand-700/70">
                This order does not exist or belongs to another account.
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
            <Link to="/orders" className="btn-primary mt-6">
              Back to my orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const order = data.order;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      {justOrdered && (
        <div className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200" role="status">
          Order placed — thank you! A receipt is below. (Payments in this demo are mocked, nothing was charged.)
        </div>
      )}

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-900">Receipt {orderNumber(order.id)}</h1>
            <p className="mt-0.5 text-sm text-brand-700/60">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`chip ${STATUS_CHIP[order.status]}`}>{STATUS_LABELS[order.status]}</span>
        </div>

        <ul className="mt-6 divide-y divide-brand-50">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-900">{item.title}</p>
                <p className="text-xs text-brand-700/60">
                  {item.qty} × <Price cents={item.priceCents} /> each
                </p>
              </div>
              <Price cents={item.qty * item.priceCents} className="shrink-0 font-semibold text-brand-900" />
            </li>
          ))}
        </ul>

        <div className="mt-2 flex justify-between border-t border-brand-100 pt-3">
          <span className="font-semibold text-brand-700">Total</span>
          <Price cents={order.totalCents} className="text-lg font-bold text-brand-700" />
        </div>

        <div className="mt-6 grid gap-4 border-t border-brand-50 pt-4 text-sm sm:grid-cols-2">
          <div>
            <h2 className="font-semibold text-brand-700">Delivery to</h2>
            <p className="mt-1 text-brand-900/80">
              {order.address.fullName}
              <br />
              {order.address.line1}
              <br />
              {order.address.city} {order.address.postalCode}
              <br />
              {order.address.country}
              <br />
              {order.address.phone}
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-brand-700">Payment</h2>
            <p className="mt-1 text-brand-900/80">
              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              <br />
              <span className="text-xs text-brand-700/60">Mock payment — nothing was charged.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/orders" className="btn-secondary">
          Back to my orders
        </Link>
        <Link to="/" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
