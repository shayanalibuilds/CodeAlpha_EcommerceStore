import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Field from '../components/Field.jsx';
import Alert from '../components/Alert.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.next || '/';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-700">Create account</h1>
      <p className="mt-1 text-sm text-brand-700/70">
        One quick form and you can start collecting study picks.
      </p>

      <form onSubmit={onSubmit} className="card mt-6 p-6" noValidate>
        {error && <Alert>{error}</Alert>}

        <Field id="name" label="Name" error={fields.name}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="input"
            placeholder="Your name"
            value={form.name}
            onChange={set('name')}
            required
          />
        </Field>

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

        <Field
          id="password"
          label="Password"
          error={fields.password}
          hint="Use at least 8 characters."
        >
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="input"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={set('password')}
            required
          />
        </Field>

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-4 text-center text-sm text-brand-700/70">
          Already have an account?{' '}
          <Link to="/login" state={{ next }} className="font-semibold text-brand-600 underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
