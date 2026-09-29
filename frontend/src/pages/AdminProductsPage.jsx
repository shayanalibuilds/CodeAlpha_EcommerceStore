import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProducts, createProduct, updateProduct } from '../api/products.js';
import { useApi } from '../hooks/useApi.js';
import AdminLayout from '../components/AdminLayout.jsx';
import ArchiveModal from '../components/ArchiveModal.jsx';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import Field from '../components/Field.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import Icon from '../components/Icon.jsx';
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
    <form onSubmit={onSubmit} noValidate className="flex flex-col">
      {/* Form header */}
      <header className="flex flex-col justify-between gap-space-md border-b border-border-grid pb-space-md lg:flex-row lg:items-end">
        <div>
          <div className="mb-1 flex items-center gap-space-xs">
            <span className="inline-block h-2 w-2 bg-accent-pine" aria-hidden="true" />
            <span className="font-label-sm uppercase tracking-widest text-text-muted">
              {isEdit ? `NODE // EDIT — ${initial.slug.toUpperCase()}` : 'NODE // NEW ARTIFACT'}
            </span>
          </div>
          <h2 className="font-headline-md uppercase tracking-tight text-text-primary">
            {isEdit ? `Edit — ${initial.title}` : 'Register New Artifact'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-outline" onClick={onCancel}>
            <Icon name="undo" className="text-[16px]" />
            Revert Draft
          </button>
          <button type="submit" className="btn-pine" disabled={busy}>
            <Icon name="sync" className="text-[16px]" />
            {busy ? 'Syncing…' : 'Commit & Sync'}
          </button>
        </div>
      </header>

      {error && (
        <div className="mt-space-md">
          <Alert>{error}</Alert>
        </div>
      )}

      {/* SEC 01 — Identity */}
      <section className="mt-space-lg border border-border-grid bg-surface-pure">
        <header className="flex items-center justify-between border-b border-border-grid bg-surface-paper px-space-md py-2.5">
          <h3 className="font-label-lg uppercase tracking-wider text-text-primary">
            <span className="mr-2 font-mono text-accent-pine">SEC 01</span> Identity
          </h3>
          <Icon name="badge" className="text-base text-text-muted" />
        </header>
        <div className="grid gap-4 p-space-md sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="p-title" label="Artifact Nomenclature [Title]" error={fields.title}>
              <input id="p-title" className="input" value={form.title} onChange={set('title')} placeholder="e.g. Sunrise Spiral Notebook, 3-Pack" required />
            </Field>
          </div>
          <Field id="p-category" label="Category Node" error={fields.category}>
            <select id="p-category" className="input" value={form.category} onChange={set('category')}>
              {CATEGORY_KEYS.map((k) => (
                <option key={k} value={k}>
                  {CATEGORY_LABELS[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="p-image" label="Plate URL [Image]" error={fields.imageUrl} hint="Leave blank for placeholder art.">
            <input id="p-image" className="input" value={form.imageUrl} onChange={set('imageUrl')} placeholder="/images/products/placeholder.svg" />
          </Field>
        </div>
      </section>

      {/* SEC 02 — Ledger */}
      <section className="mt-space-md border border-border-grid bg-surface-pure">
        <header className="flex items-center justify-between border-b border-border-grid bg-surface-paper px-space-md py-2.5">
          <h3 className="font-label-lg uppercase tracking-wider text-text-primary">
            <span className="mr-2 font-mono text-accent-pine">SEC 02</span> Curatorial Ledger
          </h3>
          <Icon name="description" className="text-base text-text-muted" />
        </header>
        <div className="p-space-md">
          <Field id="p-desc" label="Markdown Specification [Description]" error={fields.description}>
            <textarea id="p-desc" className="input min-h-24" value={form.description} onChange={set('description')} placeholder="A short, family-safe description (at least 10 characters)." required />
          </Field>
        </div>
      </section>

      {/* SEC 03 — Pricing & Inventory */}
      <section className="mt-space-md border border-border-grid bg-surface-pure">
        <header className="flex items-center justify-between border-b border-border-grid bg-surface-paper px-space-md py-2.5">
          <h3 className="font-label-lg uppercase tracking-wider text-text-primary">
            <span className="mr-2 font-mono text-accent-pine">SEC 03</span> Pricing &amp; Depot
          </h3>
          <Icon name="payments" className="text-base text-text-muted" />
        </header>
        <div className="grid gap-4 p-space-md sm:grid-cols-2">
          <Field id="p-price" label="Base Price (USD)" error={fields.priceCents || fields.price} hint="Stored as integer cents — displayed as USD.">
            <input id="p-price" className="input" inputMode="decimal" value={form.price} onChange={set('price')} placeholder="12.99" required />
          </Field>
          <Field id="p-stock" label="Depot Units [Stock]" error={fields.stock}>
            <input id="p-stock" className="input" inputMode="numeric" value={form.stock} onChange={set('stock')} placeholder="25" required />
          </Field>
        </div>
      </section>

      {/* Sticky commit dock */}
      <div className="sticky bottom-4 mt-space-lg flex flex-col items-center justify-between gap-space-sm border border-border-grid bg-surface-pure px-space-lg py-space-md sm:flex-row">
        <p className="flex items-center gap-2 font-label-sm uppercase text-text-muted">
          <span className="h-2 w-2 bg-accent-pine" aria-hidden="true" />
          Draft staged — {isEdit ? 'updates apply immediately on commit' : 'a new SKU joins the catalog on commit'}
        </p>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button type="button" className="btn-outline flex-1 sm:flex-none" onClick={onCancel}>
            Revert Draft
          </button>
          <button type="submit" className="btn-pine flex-1 sm:flex-none" disabled={busy}>
            <Icon name="sync" className="text-[16px]" />
            {busy ? 'Syncing…' : 'Commit & Sync'}
          </button>
        </div>
      </div>
    </form>
  );
}

function StatusChip({ archived }) {
  return archived ? (
    <span className="chip border-border-grid bg-surface-container-highest text-secondary">
      <span className="h-1.5 w-1.5 bg-secondary" aria-hidden="true" />
      Archived
    </span>
  ) : (
    <span className="chip border-accent-pine text-accent-pine">
      <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
      Active
    </span>
  );
}

export default function AdminProductsPage() {
  // force refetch after mutations
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const { data, loading, error, retry } = useApi(() => listProducts({ includeArchived: '1' }), [tick]);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [confirming, setConfirming] = useState(null); // { product, mode }
  const [rowBusy, setRowBusy] = useState(null);
  const [rowError, setRowError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');

  const items = data?.items || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || (CATEGORY_LABELS[p.category] || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((p) => !p.archived);
    const low = active.filter((p) => p.stock > 0 && p.stock <= 5);
    const value = active.reduce((s, p) => s + p.priceCents * p.stock, 0) / 100;
    return {
      total,
      activeCount: active.length,
      archived: total - active.length,
      inStock: active.filter((p) => p.stock > 0).length,
      low: low.length,
      value,
    };
  }, [items]);

  const requestArchive = (product) => setConfirming({ product, mode: 'archive' });
  const requestRestore = (product) => setConfirming({ product, mode: 'restore' });

  const onConfirmArchive = async () => {
    const { product } = confirming;
    setRowBusy(product.id);
    setRowError('');
    setNotice('');
    try {
      await updateProduct(product.id, { archived: !product.archived });
      setConfirming(null);
      setNotice(
        product.archived
          ? `"${product.title}" restored to the public catalog.`
          : `"${product.title}" archived — customers can no longer see it.`
      );
      refresh();
    } catch (err) {
      setRowError(err.message);
    } finally {
      setRowBusy(null);
    }
  };

  if (loading && tick === 0)
    return (
      <AdminLayout section="Products">
        <PageLoader label="Loading artifacts…" />
      </AdminLayout>
    );

  return (
    <AdminLayout section="Products">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-space-md py-space-lg md:px-space-lg">
        {/* Top spec bar */}
        <header>
          <div className="flex items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="inline-block h-2 w-2 bg-accent-pine" aria-hidden="true" />
              <span className="font-label-sm uppercase tracking-widest text-text-muted">
                INDEX // NODE 04 : ARCHIVE &amp; TELEMETRY
              </span>
            </div>
            <span className="hidden font-label-sm uppercase text-text-muted md:inline">
              LAST SYNC: {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC
            </span>
          </div>
          <div className="mt-space-sm flex flex-col justify-between gap-space-lg lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h1 className="font-headline-lg uppercase tracking-tight text-text-primary">
                Product Repertoire
              </h1>
              <p className="mt-space-xs font-body-md text-text-muted">
                Curated catalog records, live stock verification, and SKU telemetry across the
                student-run depot.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-xs">
              {editing === null && (
                <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
                  <Icon name="add" className="text-[18px]" />
                  New Artifact
                </button>
              )}
            </div>
          </div>
        </header>

        {/* KPI strip */}
        <section className="mt-space-lg grid grid-cols-1 gap-px border border-border-grid bg-border-grid sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col justify-between bg-surface-pure p-space-md">
            <div className="font-label-sm uppercase tracking-wider text-text-muted">Total Artifacts</div>
            <div className="mt-space-xs flex items-baseline justify-between">
              <span className="font-headline-md font-semibold text-text-primary">{stats.total}</span>
              <span className="font-label-sm uppercase tracking-widest text-accent-pine">
                {stats.activeCount} active
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-between bg-surface-pure p-space-md">
            <div className="font-label-sm uppercase tracking-wider text-text-muted">Catalog Fill Ratio</div>
            <div className="mt-space-xs flex items-baseline justify-between">
              <span className="font-headline-md font-semibold text-text-primary">
                {stats.total ? Math.round((stats.inStock / stats.total) * 100) : 0}%
              </span>
              <span className="font-label-sm uppercase tracking-widest text-text-muted">In stock</span>
            </div>
          </div>
          <div className="flex flex-col justify-between bg-surface-pure p-space-md">
            <div className="font-label-sm uppercase tracking-wider text-text-muted">Critical Low Stock</div>
            <div className="mt-space-xs flex items-baseline justify-between">
              <span className={`font-headline-md font-semibold ${stats.low ? 'text-error' : 'text-text-primary'}`}>
                {String(stats.low).padStart(2, '0')}
              </span>
              <span className="font-label-sm uppercase tracking-widest text-text-muted">≤ 5 units</span>
            </div>
          </div>
          <div className="flex flex-col justify-between bg-surface-pure p-space-md">
            <div className="font-label-sm uppercase tracking-wider text-text-muted">Depot Value</div>
            <div className="mt-space-xs flex items-baseline justify-between">
              <span className="font-headline-md font-semibold text-text-primary">
                ${stats.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="font-label-sm uppercase tracking-widest text-text-muted">{stats.archived} archived</span>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-space-md">
            <Alert onRetry={retry}>Could not load products: {error.message}</Alert>
          </div>
        )}
        {notice && (
          <div className="mt-space-md">
            <Alert tone="success">{notice}</Alert>
          </div>
        )}
        {rowError && (
          <div className="mt-space-md">
            <Alert>{rowError}</Alert>
          </div>
        )}

        {/* Edit / create form */}
        {editing !== null && (
          <div className="mt-space-lg">
            <ProductForm
              initial={editing === 'new' ? null : editing}
              onSaved={() => {
                setEditing(null);
                setNotice('Artifact committed & synced.');
                refresh();
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {/* Toolbar + table */}
        {editing === null && (
          <>
            <div className="mt-space-lg flex flex-col justify-between gap-space-sm border border-border-grid bg-surface-paper p-space-md md:flex-row md:items-center">
              <div className="flex w-full max-w-xl items-center gap-space-sm">
                <div className="relative w-full">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-muted" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-full border border-border-grid bg-surface-pure pl-9 pr-3 font-body-sm text-text-primary placeholder:text-text-muted focus:border-accent-pine focus:outline-none"
                    placeholder="FILTER BY ARTIFACT, REF OR CATEGORY..."
                    aria-label="Filter artifacts"
                  />
                </div>
              </div>
              <span className="flex items-center gap-3 font-label-sm uppercase text-text-muted">
                Rendering {filtered.length} of {items.length} records
                <span className="h-4 w-px bg-border-grid" aria-hidden="true" />
                <span className="font-semibold text-text-primary">Auto-Sync: Realtime</span>
              </span>
            </div>

            <div className="mt-space-md w-full overflow-x-auto border border-border-grid bg-surface-pure">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-strong bg-surface-paper font-label-md uppercase tracking-widest text-text-muted">
                    <th className="w-[30%] px-space-md py-3.5 font-medium">Artifact / SKU</th>
                    <th className="px-space-md py-3.5 font-medium">Category</th>
                    <th className="px-space-md py-3.5 text-right font-medium">Retail Price</th>
                    <th className="px-space-md py-3.5 font-medium">Stock &amp; Status</th>
                    <th className="px-space-md py-3.5 text-right font-medium">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-grid font-body-sm text-text-primary">
                  {filtered.map((p) => (
                    <tr key={p.id} className={`transition-colors group hover:bg-surface-container-low/75 ${p.archived ? 'opacity-70' : ''}`}>
                      <td className="px-space-md py-4 align-middle">
                        <div className="flex items-center gap-space-md">
                          <img
                            src={p.imageUrl || '/images/products/placeholder.svg'}
                            alt=""
                            className="h-10 w-10 border border-border-grid object-cover"
                          />
                          <div className="flex min-w-0 flex-col">
                            <div className="flex items-center gap-space-xs">
                              <Link
                                to={`/products/${p.id}`}
                                className="truncate text-[15px] font-medium text-text-primary transition-colors group-hover:text-accent-pine"
                              >
                                {p.title}
                              </Link>
                            </div>
                            <span className="truncate font-mono text-[11px] uppercase tracking-tight text-text-muted">
                              // {p.slug.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-space-md py-4 align-middle font-label-sm uppercase tracking-wider text-text-muted">
                        {CATEGORY_LABELS[p.category] || p.category}
                      </td>
                      <td className="px-space-md py-4 text-right align-middle font-medium">
                        <Price cents={p.priceCents} />
                      </td>
                      <td className="px-space-md py-4 align-middle">
                        <div className="flex flex-col">
                          <span className={p.stock === 0 ? 'text-text-muted' : p.stock <= 5 ? 'font-medium text-error' : 'text-text-primary'}>
                            {p.stock} units {p.stock === 0 ? '' : p.stock <= 5 ? '· low' : 'available'}
                          </span>
                          <div className="mt-1">
                            <StatusChip archived={p.archived} />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-space-md py-4 text-right align-middle">
                        <div className="inline-flex items-center gap-1.5 font-label-sm uppercase tracking-wider text-text-muted">
                          <button type="button" onClick={() => setEditing(p)} className="px-1 transition-colors hover:text-text-primary hover:underline">
                            Edit
                          </button>
                          <span className="opacity-40" aria-hidden="true">/</span>
                          {p.archived ? (
                            <button
                              type="button"
                              onClick={() => requestRestore(p)}
                              disabled={rowBusy === p.id}
                              className="px-1 transition-colors hover:text-accent-pine hover:underline"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => requestArchive(p)}
                              disabled={rowBusy === p.id}
                              className="px-1 transition-colors hover:text-error hover:underline"
                            >
                              De-list
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-space-md py-10 text-center font-label-md uppercase tracking-wider text-text-muted">
                        {items.length === 0 ? 'No artifacts yet — register the first one.' : 'No artifacts match the filter.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Archive / restore confirmation */}
      {confirming && (
        <ArchiveModal
          product={confirming.product}
          mode={confirming.mode}
          busy={rowBusy === confirming.product.id}
          onConfirm={onConfirmArchive}
          onClose={() => setConfirming(null)}
        />
      )}
    </AdminLayout>
  );
}
