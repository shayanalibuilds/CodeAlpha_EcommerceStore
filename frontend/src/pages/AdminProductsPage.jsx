import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listProducts, createProduct, updateProduct } from '../api/products.js';
import { useApi } from '../hooks/useApi.js';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import Field from '../components/Field.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { CATEGORY_LABELS, CATEGORY_KEYS } from '../components/categories.js';

const EMPTY_FORM = {
  title: '',
  category: 'books',
  price: '',
  stock: '',
  imageUrl: '',
  description: '',
};

// dollars string -> integer cents
function toCents(priceStr) {
  const n = Number.parseFloat(priceStr);
  if (Number.isNaN(n)) return NaN;
  return Math.round(n * 100);
}

function ProductForm({ initial, onSaved, onCancel }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState(
    initial
      ? {
          title: initial.title,
          category: initial.category,
          price: (initial.priceCents / 100).toFixed(2),
          stock: String(initial.stock),
          imageUrl: initial.imageUrl || '',
          description: initial.description,
        }
      : EMPTY_FORM
  );
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setFields({});

    const priceCents = toCents(form.price);
    const body = {
      title: form.title,
      category: form.category,
      description: form.description,
      priceCents,
      stock: Number.parseInt(form.stock, 10),
      imageUrl: form.imageUrl || '/images/products/placeholder.svg',
    };

    try {
      if (Number.isNaN(priceCents)) {
        throw Object.assign(new Error('Please fix the highlighted fields.'), {
          fields: { priceCents: 'Enter the price in dollars, like 12.99.' },
        });
      }
      if (Number.isNaN(body.stock)) {
        throw Object.assign(new Error('Please fix the highlighted fields.'), {
          fields: { stock: 'Enter the stock as a whole number, like 25.' },
        });
      }
      if (isEdit) await updateProduct(initial.id, body);
      else await createProduct(body);
      onSaved();
    } catch (err) {
      setFields(err.fields || {});
      setError(err.message || 'Could not save the product.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card mb-6 p-5" noValidate>
      <h2 className="font-semibold text-stone-900">
        {isEdit ? `Edit — ${initial.title}` : 'Add product'}
      </h2>
      {error && (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field id="p-title" label="Title" error={fields.title}>
            <input id="p-title" className="input" value={form.title} onChange={set('title')} placeholder="e.g. Sunrise Spiral Notebook, 3-Pack" required />
          </Field>
        </div>
        <Field id="p-category" label="Category" error={fields.category}>
          <select id="p-category" className="input" value={form.category} onChange={set('category')}>
            {CATEGORY_KEYS.map((k) => (
              <option key={k} value={k}>
                {CATEGORY_LABELS[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field id="p-price" label="Price (USD)" error={fields.priceCents || fields.price} hint="Stored as integer cents — displayed as USD.">
          <input id="p-price" className="input" inputMode="decimal" value={form.price} onChange={set('price')} placeholder="12.99" required />
        </Field>
        <Field id="p-stock" label="Stock" error={fields.stock}>
          <input id="p-stock" className="input" inputMode="numeric" value={form.stock} onChange={set('stock')} placeholder="25" required />
        </Field>
        <Field id="p-image" label="Image URL" error={fields.imageUrl} hint="Leave blank for the placeholder art.">
          <input id="p-image" className="input" value={form.imageUrl} onChange={set('imageUrl')} placeholder="/images/products/placeholder.svg" />
        </Field>
        <div className="sm:col-span-2">
          <Field id="p-desc" label="Description" error={fields.description}>
            <textarea id="p-desc" className="input min-h-20" value={form.description} onChange={set('description')} placeholder="A short, family-safe description (at least 10 characters)." required />
          </Field>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminProductsPage() {
  const { data, loading, error, retry } = useApi(() => listProducts({ includeArchived: '1' }), []);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [rowBusy, setRowBusy] = useState(null);
  const [rowError, setRowError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  // force refetch after mutations
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const items = (data?.items || [])
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !category || p.category === category)
    .filter((p) => !status || (status === 'archived' ? p.archived : !p.archived));

  const toggleArchive = async (product) => {
    setRowBusy(product.id);
    setRowError('');
    setNotice('');
    try {
      await updateProduct(product.id, { archived: !product.archived });
      setNotice(product.archived ? `"${product.title}" restored.` : `"${product.title}" archived — customers can no longer see it.`);
      refresh();
    } catch (err) {
      setRowError(err.message);
    } finally {
      setRowBusy(null);
    }
  };

  if (loading && tick === 0) return <PageLoader label="Loading products…" />;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-900">
            Products
            <span className="chip bg-violet-100 text-violet-700 ring-violet-200">Admin</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500">Create, edit, archive, and restore catalog items.</p>
        </div>
        {editing === null && (
          <button
            type="button"
            className="btn rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-800 disabled:opacity-50"
            onClick={() => setEditing('new')}
          >
            Add product
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4">
          <Alert onRetry={retry}>Could not load products: {error.message}</Alert>
        </div>
      )}
      {notice && (
        <div className="mt-4">
          <Alert tone="success">{notice}</Alert>
        </div>
      )}
      {rowError && (
        <div className="mt-4">
          <Alert>{rowError}</Alert>
        </div>
      )}

      {editing !== null && (
        <div className="mt-4">
          <ProductForm
            initial={editing === 'new' ? null : editing}
            onSaved={() => {
              setEditing(null);
              setNotice('Saved.');
              refresh();
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="search"
          className="input !w-auto min-w-[12rem] flex-1"
          placeholder="Search products…"
          aria-label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input !w-auto"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORY_KEYS.map((k) => (
            <option key={k} value={k}>
              {CATEGORY_LABELS[k]}
            </option>
          ))}
        </select>
        <select
          className="input !w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((p) => (
              <tr key={p.id} className={p.archived ? 'opacity-60' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl || '/images/products/placeholder.svg'} alt="" className="h-10 w-10 rounded-lg bg-stone-100 object-cover" />
                    <Link to={`/products/${p.id}`} className="font-medium text-stone-900 hover:text-brand-700 hover:underline">
                      {p.title}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="chip bg-stone-100 text-stone-600 ring-stone-200">
                    {CATEGORY_LABELS[p.category] || p.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Price cents={p.priceCents} className="font-medium text-stone-900" />
                </td>
                <td className={`px-4 py-3 ${p.stock <= 5 ? 'font-semibold text-amber-700' : 'text-stone-600'}`}>
                  {p.stock}
                </td>
                <td className="px-4 py-3">
                  <span className={`chip ${p.archived ? 'bg-stone-100 text-stone-500 ring-stone-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>
                    {p.archived ? 'Archived' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" className="btn-secondary !px-2.5 !py-1 text-xs" onClick={() => setEditing(p)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-secondary !px-2.5 !py-1 text-xs"
                      onClick={() => toggleArchive(p)}
                      disabled={rowBusy === p.id}
                    >
                      {rowBusy === p.id ? 'Working…' : p.archived ? 'Restore' : 'Archive'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-stone-500">
                  No products match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
