import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Customer demo', email: 'customer@example.com', password: 'password-customer-12' },
  { label: 'Admin demo', email: 'admin@example.com', password: 'password-admin-12' },
];

function PasswordField({ id, label, error, value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="input pr-14"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 font-label-sm uppercase tracking-wider text-text-muted transition-colors hover:text-text-primary"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </Field>
  );
}

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
    <AuthLayout active="signin">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {error && <Alert>{error}</Alert>}

        <Field id="email" label="Curator Email Address" error={fields.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="curator@northwind.market"
            value={form.email}
            onChange={set('email')}
            required
          />
        </Field>

        <PasswordField
          id="password"
          label="Passphrase Credentials"
          error={fields.password}
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={form.password}
          onChange={set('password')}
        />

        <button
          type="submit"
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 border border-accent-pine bg-accent-pine font-label-lg uppercase tracking-widest text-white transition-colors hover:bg-accent-pine-hover disabled:opacity-50"
          disabled={busy}
        >
          <span>{busy ? 'Authenticating…' : 'Continue to Market'}</span>
          <Icon name="arrow_forward" className="text-base" />
        </button>

        <p className="text-center font-body-sm text-text-muted">
          New here?{' '}
          <Link to="/register" state={{ next }} className="font-semibold text-accent-pine underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </form>

      {/* Demo access protocols */}
      <div className="border border-border-grid bg-surface-paper p-4">
        <p className="flex items-center gap-2 font-label-sm uppercase tracking-widest text-text-muted">
          <Icon name="key" className="text-sm text-accent-pine" />
          Demo accounts (seeded)
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <div key={acc.email} className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-on-surface-variant">
                {acc.label}: {acc.email} / {acc.password}
              </span>
              <button
                type="button"
                className="btn-outline shrink-0 !px-2.5 !py-1"
                onClick={() => setForm({ email: acc.email, password: acc.password })}
              >
                Fill
              </button>
            </div>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
