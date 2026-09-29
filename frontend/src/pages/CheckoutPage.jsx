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
import Icon from '../components/Icon.jsx';

const PAYMENT_METHODS = [
  { value: 'card', label: 'Card (mock)', icon: 'credit_card', hint: 'Demo checkout — no real card is charged.' },
  { value: 'upi', label: 'UPI (mock)', icon: 'smartphone', hint: 'Demo checkout — no real UPI is debited.' },
  { value: 'cash', label: 'Cash on delivery', icon: 'payments', hint: 'Pay when the parcel arrives.' },
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
          icon="shopping_bag"
          title="Your bag is empty"
          action={
            <Link to="/products" className="btn-primary">
              Browse the catalog
            </Link>
          }
        >
          Add something to your bag first — checkout will be waiting.
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
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 pb-20 md:px-8">
      {/* Header strip */}
      <div className="flex flex-col justify-between gap-4 border-b border-border-grid pb-6 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-label-md font-semibold uppercase tracking-widest text-accent-pine">
              Secure Gateway
            </span>
            <span className="text-outline" aria-hidden="true">/</span>
            <span className="font-label-md uppercase tracking-widest text-on-surface-variant">
              Mocked Ledger
            </span>
          </div>
          <h1 className="font-headline-lg tracking-tight text-on-surface">Checkout</h1>
          <p className="mt-1 font-body-sm text-text-muted">
            Signed in as {user?.email} — payments here are mocked, nothing is charged.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-accent-pine/40 bg-accent-pine/5 px-4 py-2">
          <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
          <span className="font-label-md font-semibold uppercase tracking-wider text-tertiary">
            STATUS: NOMINAL
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
          {/* SEC 01 — Delivery address */}
          <section className="border border-border-grid bg-white">
            <header className="flex items-center justify-between border-b border-border-grid bg-surface-paper px-space-md py-3">
              <h2 className="font-label-lg uppercase tracking-wider text-on-surface">
                <span className="mr-2 font-mono text-accent-pine">SEC 01</span> Delivery Address
              </h2>
              <Icon name="local_shipping" className="text-lg text-text-muted" />
            </header>
            <div className="grid gap-x-4 gap-y-4 p-space-md sm:grid-cols-2">
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
          </section>

          {/* SEC 02 — Payment method */}
          <section className="border border-border-grid bg-white">
            <header className="flex items-center justify-between border-b border-border-grid bg-surface-paper px-space-md py-3">
              <h2 className="font-label-lg uppercase tracking-wider text-on-surface">
                <span className="mr-2 font-mono text-accent-pine">SEC 02</span> Payment Method
              </h2>
              <span className="chip bg-white font-label-sm uppercase text-on-surface-variant">Mock Ledger</span>
            </header>
            <div className="p-space-md">
              <p className="mb-3 font-body-sm text-text-muted">
                This store has no real payment processing — every method below is a mock.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex cursor-pointer flex-col border p-3 transition-colors ${
                      paymentMethod === pm.value
                        ? 'border-accent-pine bg-accent-pine/5'
                        : 'border-border-grid bg-white hover:border-border-strong'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-label-md font-semibold uppercase tracking-wider text-on-surface">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)}
                        className="accent-[#047857]"
                      />
                      <Icon name={pm.icon} className="text-base" />
                      {pm.label}
                    </span>
                    <span className="mt-1 pl-6 font-body-sm text-text-muted">{pm.hint}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Commit dock */}
          <div className="sticky bottom-4 flex flex-col items-center justify-between gap-3 border border-border-grid bg-white px-space-md py-3 sm:flex-row">
            <p className="flex items-center gap-2 font-label-sm uppercase tracking-wider text-text-muted">
              <Icon name="verified_user" className="text-base text-accent-pine" />
              Prices are re-checked on the server when you place the order.
            </p>
            <button type="submit" className="btn-pine w-full sm:w-auto sm:px-10" disabled={busy}>
              {busy ? 'Placing order…' : 'Place order'}
              <Icon name="arrow_forward" className="text-sm" />
            </button>
          </div>
        </form>

        {/* Summary rail */}
        <aside className="h-fit border border-border-grid bg-white lg:sticky lg:top-24">
          <div className="border-b border-border-grid bg-surface-paper px-space-md py-3">
            <h2 className="meta-label font-semibold text-on-surface">
              Manifest · {count} {count === 1 ? 'item' : 'items'}
            </h2>
          </div>
          <ul className="divide-y divide-border-grid">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3 px-space-md py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border-grid bg-surface-container-low font-mono text-xs font-semibold text-on-surface">
                  ×{i.qty}
                </span>
                <span className="min-w-0 flex-1 truncate font-body-sm text-on-surface">{i.title}</span>
                <Price cents={i.qty * i.priceCents} className="shrink-0 font-mono text-sm font-semibold text-on-surface" />
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border-grid px-space-md py-3">
            <span className="font-label-md uppercase tracking-widest text-text-muted">Total</span>
            <Price cents={subtotalCents} className="font-mono text-xl font-bold text-on-surface" />
          </div>
        </aside>
      </div>
    </main>
  );
}
