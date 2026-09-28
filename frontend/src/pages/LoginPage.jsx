import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Customer demo', email: 'customer@example.com', password: 'password-customer-12' },
  { label: 'Admin demo', email: 'admin@example.com', password: 'password-admin-12' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.next || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setFields({});
    try {
      await login(form.email, form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in. Try again.');
      setFields(err.fields || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-700">Sign in</h1>
      <p className="mt-1 text-sm text-brand-700/70">
        Welcome back. Your cart and orders are waiting.
      </p>

      <form onSubmit={onSubmit} className="card mt-6 p-6" noValidate>
        {error && <Alert>{error}</Alert>}

        <Field id="email" label="Email" error={fields.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            required
          />
        </Field>

        <Field id="password" label="Password" error={fields.password}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input"
            placeholder="Your password"
            value={form.password}
            onChange={set('password')}
            required
          />
        </Field>

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-4 text-center text-sm text-brand-700/70">
          New here?{' '}
          <Link to="/register" state={{ next }} className="font-semibold text-brand-600 underline">
            Create an account
          </Link>
        </p>
      </form>

      <div className="card mt-4 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700/60">
          Demo accounts (seeded)
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <div key={acc.email} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-brand-700/80">
                <span className="font-semibold">{acc.label}:</span> {acc.email} / {acc.password}
              </span>
              <button
                type="button"
                className="btn-secondary shrink-0 !px-2 !py-1 text-xs"
                onClick={() => setForm({ email: acc.email, password: acc.password })}
              >
                Fill
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
