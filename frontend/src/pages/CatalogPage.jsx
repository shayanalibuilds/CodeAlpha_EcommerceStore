import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listProducts } from '../api/products.js';
import { useApi } from '../hooks/useApi.js';
import ProductCard from '../components/ProductCard.jsx';
import Alert from '../components/Alert.jsx';
import { CATEGORY_LABELS } from '../components/categories.js';

const CHIPS = Object.entries(CATEGORY_LABELS);

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';

  const [search, setSearch] = useState(q);

  // Keep the input in sync if the URL changes (back/forward).
  useEffect(() => {
    setSearch(q);
  }, [q]);

  // Debounce typing into ?q= so the list updates without a fetch per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      if (search === q) return;
      const next = new URLSearchParams(params);
      if (search) next.set('q', search);
      else next.delete('q');
      setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
      <section className="rounded-2xl bg-brand-700 px-6 py-8 text-white shadow-sm sm:px-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Everything for your study desk</h1>
        <p className="mt-2 max-w-xl text-sm text-white/85">
          Books, stationery, bags, audio and desk picks chosen for curious minds. Family-safe,
          student-friendly prices.
        </p>
      </section>

      <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            className="input !pl-9"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>
        <label className="flex items-center justify-between gap-2 text-sm text-brand-700/70 sm:justify-end">
          Sort by
          <select
            className="input !w-auto"
            value={sort}
            onChange={(e) => setParam('sort', e.target.value === 'newest' ? '' : e.target.value)}
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="price">Price: low to high</option>
          </select>
        </label>
      </section>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => setParam('category', '')}
          className={`chip ${
            !category
              ? 'bg-brand-700 text-white ring-brand-700'
              : 'bg-white text-brand-700 ring-brand-200 hover:bg-brand-50'
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
                : 'bg-white text-brand-700 ring-brand-200 hover:bg-brand-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6">
          <Alert onRetry={retry}>Could not load the catalog: {error.message}</Alert>
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-0">
              <div className="aspect-[4/3] animate-pulse bg-brand-100/60" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-16 animate-pulse rounded bg-brand-100/60" />
                <div className="h-4 w-full animate-pulse rounded bg-brand-100/60" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-brand-100/60" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-3xl" aria-hidden="true">
            🧺
          </p>
          <h2 className="mt-2 font-semibold text-brand-700">No products match</h2>
          <p className="mt-1 text-sm text-brand-700/70">
            Try a different search term or clear the filters.
          </p>
          {hasFilters && (
            <button
              type="button"
              className="btn-secondary mt-4"
              onClick={() => {
                setSearch('');
                setParams({});
              }}
            >
              Clear search & filters
            </button>
          )}
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
