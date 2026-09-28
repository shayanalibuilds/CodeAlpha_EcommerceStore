import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orders.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';
import Price from '../components/Price.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';

const PAYMENT_METHODS = [
  {
    value: 'card',
    label: 'Card (mock)',
    hint: 'Demo checkout — no real card is charged.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
        <path strokeLinecap="round" d="M2.5 10h19" />
        <path strokeLinecap="round" d="M6 14.5h4" />
      </svg>
    ),
  },
  {
    value: 'upi',
    label: 'Mobile wallet (mock)',
    hint: 'Demo checkout — no real wallet is debited.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path strokeLinecap="round" d="M11 18.5h2" />
      </svg>
    ),
  },
  {
    value: 'cash',
    label: 'Cash on delivery',
    hint: 'Pay when the parcel arrives.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
        <circle cx="12" cy="12" r="2.75" />
        <path strokeLinecap="round" d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
];

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  line1: '',
  city: '',
  postalCode: '',
  country: '',
};

export default function CheckoutPage() {
  const { items, subtotalCents, count, loading, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (loading) return <PageLoader label="Preparing checkout…" />;

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          action={
            <Link to="/" className="btn-primary">
              Browse products
            </Link>
          }
        >
          Add something to your cart first — checkout will be waiting.
        </EmptyState>
      </main>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setFields({});
    try {
      const data = await createOrder(form, paymentMethod);
      await refresh(); // server emptied the cart — resync badge & local state
      navigate(`/orders/${data.order.id}`, { state: { justOrdered: true }, replace: true });
    } catch (err) {
      setFields(err.fields || {});
      setError(err.fields?.cart || err.message || 'Could not place the order. Try again.');
      if (err.status === 409) await refresh(); // cart contents may have gone stale
    } finally {
      setBusy(false);
    }
  };

  const addrField = (key) => fields[`address.${key}`] || fields[key];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900">Checkout</h1>
      <p className="mt-1 text-sm text-stone-500">Signed in as {user?.email}.</p>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={onSubmit} className="card p-5 sm:p-6" noValidate>
          <h2 className="font-semibold text-stone-900">Contact & delivery</h2>
          <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
            <Field id="fullName" label="Full name" error={addrField('fullName')}>
              <input id="fullName" className="input" autoComplete="name" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
            </Field>
            <Field id="phone" label="Phone" error={addrField('phone')} hint="So the courier can reach you.">
              <input id="phone" className="input" type="tel" autoComplete="tel" placeholder="03xx xxxxxxx" value={form.phone} onChange={set('phone')} required />
            </Field>
            <div className="sm:col-span-2">
              <Field id="line1" label="Street address" error={addrField('line1')}>
                <input id="line1" className="input" autoComplete="street-address" placeholder="House, street, block" value={form.line1} onChange={set('line1')} required />
              </Field>
            </div>
            <Field id="city" label="City" error={addrField('city')}>
              <input id="city" className="input" autoComplete="address-level2" placeholder="City" value={form.city} onChange={set('city')} required />
            </Field>
            <Field id="postalCode" label="Postal code" error={addrField('postalCode')}>
              <input id="postalCode" className="input" autoComplete="postal-code" placeholder="e.g. 75500" value={form.postalCode} onChange={set('postalCode')} required />
            </Field>
            <div className="sm:col-span-2">
              <Field id="country" label="Country" error={addrField('country')}>
                <input id="country" className="input" autoComplete="country-name" placeholder="Country" value={form.country} onChange={set('country')} required />
              </Field>
            </div>
          </div>

          <h2 className="mt-8 font-semibold text-stone-900">Payment method</h2>
          <div
            className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800 ring-1 ring-amber-200"
            role="note"
          >
            <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 8h.01M12 11v5" />
            </svg>
            <span>
              <strong className="font-semibold">Payments are mocked.</strong> No real card is charged.
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {PAYMENT_METHODS.map((pm) => (
              <label
                key={pm.value}
                className={`flex cursor-pointer flex-col rounded-xl p-3 ring-1 transition-colors ${
                  paymentMethod === pm.value
                    ? 'bg-brand-50 ring-2 ring-brand-700'
                    : 'bg-white ring-stone-200 hover:bg-stone-50'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.value}
                    checked={paymentMethod === pm.value}
                    onChange={() => setPaymentMethod(pm.value)}
                    className="accent-brand-700"
                  />
                  <span className="text-stone-700">{pm.icon}</span>
                  {pm.label}
                </span>
                <span className="mt-1 pl-6 text-xs text-stone-500">{pm.hint}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="btn-primary mt-8 w-full sm:w-auto sm:px-10" disabled={busy}>
            {busy ? 'Placing order…' : 'Place order'}
          </button>
        </form>

        <aside className="card h-fit p-5 lg:sticky lg:top-20">
          <h2 className="font-semibold text-stone-900">
            Order summary ({count} {count === 1 ? 'item' : 'items'})
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3">
                <img
                  src={i.imageUrl || '/images/products/placeholder.svg'}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 shrink-0 rounded-lg bg-stone-100 object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-stone-600">
                  {i.qty} × {i.title}
                </span>
                <Price cents={i.qty * i.priceCents} className="shrink-0 font-medium text-stone-900" />
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-stone-200 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Subtotal</dt>
              <dd className="font-semibold text-stone-900">
                <Price cents={subtotalCents} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Shipping</dt>
              <dd className="font-semibold text-emerald-600">Free</dd>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-2">
              <dt className="font-semibold text-stone-900">Total</dt>
              <dd>
                <Price cents={subtotalCents} className="text-lg font-bold text-stone-900" />
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-stone-400">
            Prices are re-checked on the server when you place the order.
          </p>
        </aside>
      </div>
    </main>
  );
}
