import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrder } from '../api/orders.js';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import Price from '../components/Price.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import {
  STATUS_LABELS,
  STATUS_CHIP,
  PAYMENT_LABELS,
  orderNumber,
  formatDate,
} from '../components/orderMeta.js';

// Progress timeline for the fulfilment states of this demo.
// Cancelled orders show a truthful notice instead of a timeline.
function StatusTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <p className="mt-5 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600 ring-1 ring-stone-200">
        This order was cancelled — its items were returned to stock.
      </p>
    );
  }

  const steps = ['placed', 'packed', 'shipped', 'delivered'];
  const currentIdx = steps.indexOf(status);

  return (
    <ol className="mt-6 flex items-start" aria-label="Order progress">
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <li key={step} className={`flex items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-2 ${
                  done
                    ? 'bg-brand-700 text-white ring-brand-700'
                    : active
                      ? 'bg-brand-100 text-brand-800 ring-brand-700'
                      : 'bg-white text-stone-400 ring-stone-300'
                }`}
              >
                {done ? '✓' : idx + 1}
              </span>
              <span
                className={`text-xs font-medium ${
                  done || active ? 'text-stone-900' : 'text-stone-400'
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`mx-2 mb-6 h-0.5 flex-1 rounded ${done ? 'bg-brand-700' : 'bg-stone-300'}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
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
              <h1 className="mt-3 text-xl font-bold text-stone-900">Order not found</h1>
              <p className="mt-2 text-sm text-stone-500">
                This order does not exist or belongs to another account.
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
            <Link to="/orders" className="btn-primary mt-6">
              Back to my orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const order = data.order;
  const subtotal = order.items.reduce((sum, i) => sum + i.qty * i.priceCents, 0);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      {justOrdered && (
        <div className="mb-6 text-center" role="status">
          <span
            aria-hidden="true"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white"
          >
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h1 className="mt-3 text-2xl font-bold text-stone-900">
            Order {orderNumber(order.id)} confirmed
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Thanks {user?.name?.split(' ')[0] || 'there'}! We'll start packing your items right
            away. (Payments in this demo are mocked, nothing was charged.)
          </p>
        </div>
      )}

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Receipt {orderNumber(order.id)}</h2>
            <p className="mt-0.5 text-sm text-stone-500">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`chip ${STATUS_CHIP[order.status]}`}>{STATUS_LABELS[order.status]}</span>
        </div>

        <StatusTimeline status={order.status} />

        <ul className="mt-6 divide-y divide-stone-100">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">{item.title}</p>
                <p className="text-xs text-stone-500">
                  {item.qty} × <Price cents={item.priceCents} /> each
                </p>
              </div>
              <Price cents={item.qty * item.priceCents} className="shrink-0 font-semibold text-stone-900" />
            </li>
          ))}
        </ul>

        <dl className="mt-2 space-y-2 border-t border-stone-200 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Subtotal</dt>
            <dd className="font-semibold text-stone-900">
              <Price cents={subtotal} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Shipping</dt>
            <dd className="font-semibold text-emerald-600">Free</dd>
          </div>
          <div className="flex justify-between border-t border-stone-100 pt-2">
            <dt className="font-semibold text-stone-900">Total</dt>
            <dd>
              <Price cents={order.totalCents} className="text-lg font-bold text-stone-900" />
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-4 border-t border-stone-200 pt-4 text-sm sm:grid-cols-2">
          <div>
            <h2 className="font-semibold text-stone-900">Delivery to</h2>
            <p className="mt-1 text-stone-600">
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
            <h2 className="font-semibold text-stone-900">Payment</h2>
            <p className="mt-1 text-stone-600">
              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              <br />
              <span className="text-xs text-stone-500">Mock payment — nothing was charged.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/orders" className="btn-primary">
          View my orders
        </Link>
        <Link to="/" className="btn-secondary">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
