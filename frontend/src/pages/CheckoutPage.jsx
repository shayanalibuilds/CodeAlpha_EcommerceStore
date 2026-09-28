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
  { value: 'card', label: 'Card (mock)', hint: 'Demo checkout — no real card is charged.' },
  { value: 'upi', label: 'UPI (mock)', hint: 'Demo checkout — no real UPI is debited.' },
  { value: 'cash', label: 'Cash on delivery', hint: 'Pay when the parcel arrives.' },
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
              Browse catalog
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
      <h1 className="text-2xl font-bold text-brand-700">Checkout</h1>
      <p className="mt-1 text-sm text-brand-700/70">
        Signed in as {user?.email} — payments here are mocked, nothing is charged.
      </p>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={onSubmit} className="card p-5 sm:p-6" noValidate>
          <h2 className="font-semibold text-brand-700">Delivery address</h2>
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

          <h2 className="mt-8 font-semibold text-brand-700">Payment method</h2>
          <p className="mt-1 text-xs text-brand-700/60">
            This store has no real payment processing — every method below is a mock.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {PAYMENT_METHODS.map((pm) => (
              <label
                key={pm.value}
                className={`flex cursor-pointer flex-col rounded-lg p-3 ring-1 transition-colors ${
                  paymentMethod === pm.value
                    ? 'bg-brand-50 ring-2 ring-brand-600'
                    : 'bg-white ring-brand-100 hover:bg-brand-50/60'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-brand-900">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.value}
                    checked={paymentMethod === pm.value}
                    onChange={() => setPaymentMethod(pm.value)}
                    className="accent-brand-600"
                  />
                  {pm.label}
                </span>
                <span className="mt-1 pl-6 text-xs text-brand-700/60">{pm.hint}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="btn-primary mt-8 w-full sm:w-auto sm:px-10" disabled={busy}>
            {busy ? 'Placing order…' : 'Place order'}
          </button>
        </form>

        <aside className="card h-fit p-5 lg:sticky lg:top-20">
          <h2 className="font-semibold text-brand-700">
            Order summary ({count} {count === 1 ? 'item' : 'items'})
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-brand-700/80">
                  {i.qty} × {i.title}
                </span>
                <Price cents={i.qty * i.priceCents} className="shrink-0 font-medium text-brand-900" />
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-brand-50 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-700/70">Total</span>
              <Price cents={subtotalCents} className="text-lg font-bold text-brand-700" />
            </div>
          </div>
          <p className="mt-2 text-xs text-brand-700/60">
            Prices are re-checked on the server when you place the order.
          </p>
        </aside>
      </div>
    </main>
  );
}
