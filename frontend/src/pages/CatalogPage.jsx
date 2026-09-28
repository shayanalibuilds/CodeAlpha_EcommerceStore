import { useSearchParams } from 'react-router-dom';
import { listProducts } from '../api/products.js';
import { useApi } from '../hooks/useApi.js';
import ProductCard from '../components/ProductCard.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CATEGORY_LABELS } from '../components/categories.js';

const CHIPS = Object.entries(CATEGORY_LABELS);

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const { data, loading, error, retry } = useApi(
    () => listProducts({ q, category: category || undefined, sort: sort === 'price' ? 'price' : undefined }),
    [q, category, sort]
  );

  const items = data?.items || [];
  const hasFilters = Boolean(q || category);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <p className="text-2xl font-bold text-stone-900">Shop everything</p>

      <div className="mt-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
        Free shipping on every order — payments are mocked, no real card is charged.
      </div>

      <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setParam('category', '')}
            className={`chip ${
              !category
                ? 'bg-brand-700 text-white ring-brand-700'
                : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-100'
            }`}
          >
            All
          </button>
          {CHIPS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setParam('category', category === key ? '' : key)}
              className={`chip ${
                category === key
                  ? 'bg-brand-700 text-white ring-brand-700'
                  : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex items-center justify-between gap-2 text-sm text-stone-500 sm:justify-end">
          Sort by
          <select
            className="input !w-auto"
            value={sort}
            onChange={(e) => setParam('sort', e.target.value === 'newest' ? '' : e.target.value)}
            aria-label="Sort products"
          >
            <option value="newest">Newest first</option>
            <option value="price">Price: low to high</option>
          </select>
        </label>
      </section>

      {q && (
        <p className="mt-4 text-sm text-stone-500" role="status">
          Showing results for <span className="font-semibold text-stone-900">“{q}”</span>
        </p>
      )}

      {error && (
        <div className="mt-6">
          <Alert onRetry={retry}>Could not load the catalog: {error.message}</Alert>
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-0">
              <div className="aspect-[4/3] animate-pulse bg-stone-200/70" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-16 animate-pulse rounded bg-stone-200/70" />
                <div className="h-4 w-full animate-pulse rounded bg-stone-200/70" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200/70" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="🧺"
            title="No products match"
            action={
              hasFilters ? (
                <button type="button" className="btn-secondary" onClick={() => setParams({})}>
                  Clear search & filters
                </button>
              ) : null
            }
          >
            Try a different search term or clear the filters.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
