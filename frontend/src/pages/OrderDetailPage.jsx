import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrder } from '../api/orders.js';
import { useApi } from '../hooks/useApi.js';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import Icon from '../components/Icon.jsx';
import {
  STATUS_LABELS,
  STATUS_CHIP,
  STATUS_ICON,
  PAYMENT_LABELS,
  orderNumber,
  formatDate,
} from '../components/orderMeta.js';

const TIMELINE = ['placed', 'packed', 'shipped'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const justOrdered = Boolean(location.state?.justOrdered);

  const { data, loading, error, retry } = useApi(() => getOrder(id), [id]);

  if (loading) return <PageLoader label="Loading your receipt…" />;

  if (error) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <div className="flex flex-col items-center justify-center border border-border-grid bg-white px-6 py-space-xl text-center">
          <div className="mb-space-md flex h-14 w-14 items-center justify-center border border-border-grid bg-surface-container-low text-text-muted">
            <Icon name={error.status === 404 ? 'search_off' : 'report'} className="text-2xl" />
          </div>
          {error.status === 404 ? (
            <>
              <h1 className="font-headline-sm font-semibold uppercase tracking-tight text-on-surface">
                Order not found
              </h1>
              <p className="mt-space-xs font-body-sm text-body-sm text-text-muted">
                This order does not exist or belongs to another account.
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
            <Link to="/orders" className="btn-primary">
              Back to my orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const order = data.order;
  const cancelled = order.status === 'cancelled';
  const currentStep = TIMELINE.indexOf(order.status);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 pb-20 md:px-8">
      {justOrdered && (
        <div
          className="mb-6 flex items-start gap-2 border border-accent-pine/40 bg-accent-pine/5 px-space-md py-3 font-body-sm text-tertiary"
          role="status"
        >
          <Icon name="check_circle" className="mt-0.5 shrink-0 text-base text-accent-pine" />
          <span>
            Order placed — thank you! A receipt is below. (Payments in this demo are mocked, nothing
            was charged.)
          </span>
        </div>
      )}

      {/* Receipt frame */}
      <article className="border border-border-grid bg-white">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border-grid bg-surface-paper px-space-md py-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
              <span className="meta-label">Dispatch Receipt</span>
            </div>
            <h1 className="font-mono font-headline-md text-xl font-semibold tracking-tight text-on-surface">
              {orderNumber(order.id)}
            </h1>
            <p className="mt-0.5 font-body-sm text-text-muted">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`chip px-2.5 py-1 ${STATUS_CHIP[order.status]}`}>
            <Icon name={STATUS_ICON[order.status]} className="text-sm" />
            {STATUS_LABELS[order.status]}
          </span>
        </header>

        {/* Architectural progress timeline */}
        <div className="border-b border-border-grid px-space-md py-6">
          {cancelled ? (
            <div className="flex items-center gap-3 border border-error/40 bg-error-container/20 px-space-md py-3">
              <Icon name="cancel" className="text-xl text-error" />
              <div>
                <p className="font-label-md font-semibold uppercase tracking-wider text-error">Order cancelled</p>
                <p className="font-body-sm text-text-muted">All items were returned to stock automatically.</p>
              </div>
            </div>
          ) : (
            <ol className="flex items-stretch">
              {TIMELINE.map((step, i) => {
                const done = i <= currentStep;
                return (
                  <li key={step} className={`flex flex-1 flex-col ${i > 0 ? 'border-l border-border-grid' : ''}`}>
                    <div className="flex items-center gap-2 px-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center border font-mono text-xs font-semibold ${
                          done
                            ? 'border-accent-pine bg-accent-pine text-white'
                            : 'border-border-grid bg-white text-text-muted'
                        }`}
                      >
                        {done ? '✓' : `0${i + 1}`}
                      </span>
                      <span
                        className={`font-label-md uppercase tracking-wider ${done ? 'font-semibold text-on-surface' : 'text-text-muted'}`}
                      >
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                    <div className={`mt-2 mx-3 h-1 ${done ? 'bg-accent-pine' : 'bg-surface-container-highest'}`} />
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Items manifest */}
        <ul className="divide-y divide-border-grid px-space-md">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-body-md font-medium text-on-surface">{item.title}</p>
                <p className="font-body-sm text-text-muted">
                  {item.qty} × <Price cents={item.priceCents} /> each
                </p>
              </div>
              <Price cents={item.qty * item.priceCents} className="shrink-0 font-mono font-semibold text-on-surface" />
            </li>
          ))}
        </ul>

        <div className="mx-space-md flex items-center justify-between border-t border-border-grid py-4">
          <span className="font-label-md uppercase tracking-widest text-text-muted">Total</span>
          <Price cents={order.totalCents} className="font-mono text-xl font-bold text-on-surface" />
        </div>

        {/* Delivery & payment spec bay */}
        <div className="grid gap-px border-t border-border-grid bg-border-grid sm:grid-cols-2">
          <div className="bg-white p-space-md">
            <h2 className="meta-label mb-2 font-semibold text-on-surface">Delivery To</h2>
            <p className="font-body-sm leading-relaxed text-on-surface-variant">
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
          <div className="bg-white p-space-md">
            <h2 className="meta-label mb-2 font-semibold text-on-surface">Payment</h2>
            <p className="flex items-center gap-2 font-body-sm text-on-surface-variant">
              <Icon name="payments" className="text-base text-accent-pine" />
              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
            </p>
            <p className="mt-1 font-body-sm text-text-muted">Mock payment — nothing was charged.</p>
          </div>
        </div>
      </article>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/orders" className="btn-outline">
          Back to my orders
        </Link>
        <Link to="/products" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
