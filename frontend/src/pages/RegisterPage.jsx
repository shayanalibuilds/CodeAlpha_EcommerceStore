import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.next || '/';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setFields({});
    try {
      await register(form.name, form.email, form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create the account. Try again.');
      setFields(err.fields || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout active="register">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {error && <Alert>{error}</Alert>}

        <Field id="name" label="Curator Name" error={fields.name}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="input"
            placeholder="e.g. V. Sterling"
            value={form.name}
            onChange={set('name')}
            required
          />
        </Field>

        <Field id="email" label="Verified Email" error={fields.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="curator@institution.arch"
            value={form.email}
            onChange={set('email')}
            required
          />
        </Field>

        <Field
          id="password"
          label="Create Root Passphrase"
          error={fields.password}
          hint="Use at least 8 characters."
        >
          <div className="relative">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              className="input pr-14"
              placeholder="Min. 8 characters / mixed entropy"
              value={form.password}
              onChange={set('password')}
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

        <button
          type="submit"
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 border border-border-strong bg-border-strong font-label-lg uppercase tracking-widest text-surface-pure transition-colors hover:bg-on-surface-variant disabled:opacity-50"
          disabled={busy}
        >
          <span>{busy ? 'Submitting…' : 'Submit Application'}</span>
          <Icon name="verified_user" className="text-base" />
        </button>

        <p className="text-center font-body-sm text-text-muted">
          Already registered?{' '}
          <Link to="/login" state={{ next }} className="font-semibold text-accent-pine underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
