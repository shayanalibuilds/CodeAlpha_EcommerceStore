import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listProducts } from '../api/products.js';
import { useApi } from '../hooks/useApi.js';
import ProductCard from '../components/ProductCard.jsx';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';
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
    <main className="w-full bg-surface-pure">
      {/* Top reassurance banner */}
      <section className="w-full border-b border-border-grid bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2.5 md:px-8">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="h-1.5 w-1.5 flex-shrink-0 bg-accent-pine" aria-hidden="true" />
            <span className="truncate font-label-sm text-label-sm uppercase tracking-widest text-on-surface">
              Family-safe study staples · Mindfully packaged · Payments are mocked
            </span>
          </div>
          <div className="hidden flex-shrink-0 items-center gap-2 text-text-muted sm:flex">
            <Icon name="inventory" className="text-xs" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Live stock counts</span>
          </div>
        </div>
      </section>

      {/* Catalog header & control bar */}
      <section className="mx-auto w-full max-w-[1440px] px-4 pt-10 pb-6 md:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-border-grid pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-label-md font-semibold uppercase tracking-widest text-accent-pine">
                Selected Catalog
              </span>
              <span className="text-outline" aria-hidden="true">
                /
              </span>
              <span className="font-label-md uppercase tracking-widest text-on-surface-variant">
                Student-Run Market
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl tracking-tight text-on-surface">
              {q ? `Results for “${q}”` : 'Study Desk Staples'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
            {/* Count metric pill */}
            <div className="flex items-center gap-2 border border-border-grid bg-white px-4 py-2">
              <span className="font-label-md text-on-surface-variant">CATALOG REPERTOIRE:</span>
              <span className="font-label-md font-semibold text-accent-pine">
                {loading ? '—' : items.length} / ITEMS AVAILABLE
              </span>
            </div>
            {/* Sort */}
            <label className="flex items-center gap-2 border border-border-grid bg-white px-4 py-2 transition-colors hover:border-border-strong">
              <Icon name="tune" className="text-base text-on-surface" />
              <span className="sr-only">Sort products</span>
              <select
                className="cursor-pointer bg-transparent font-label-md uppercase tracking-wider text-on-surface focus:outline-none"
                value={sort}
                onChange={(e) => setParam('sort', e.target.value === 'newest' ? '' : e.target.value)}
                aria-label="Sort products"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price">Sort: Price</option>
              </select>
              <Icon name="expand_more" className="text-sm text-outline" />
            </label>
          </div>
        </div>

        {/* Tactile segmented filters */}
        <div className="flex items-center gap-0 overflow-x-auto border-b border-border-grid pt-4">
          <button
            type="button"
            onClick={() => setParam('category', '')}
            className={`-mb-px flex items-center gap-2 border-b-2 px-6 py-2.5 font-label-md transition-colors ${
              !category
                ? 'border-border-strong bg-text-primary text-white'
                : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <span>All Pieces</span>
            <span className="font-label-sm text-label-sm opacity-60">({items.length})</span>
          </button>
          {CHIPS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setParam('category', category === key ? '' : key)}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-2.5 font-label-md transition-colors ${
                category === key
                  ? 'border-border-strong bg-text-primary text-white'
                  : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-6 pb-16 md:px-8">
        {error && (
          <div className="mb-6">
            <Alert onRetry={retry}>Could not load the catalog: {error.message}</Alert>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border-grid bg-white p-space-md">
                <div className="mb-space-md aspect-[4/3] animate-pulse bg-surface-container-low" />
                <div className="mb-2 h-3 w-24 animate-pulse bg-surface-container-low" />
                <div className="mb-2 h-4 w-3/4 animate-pulse bg-surface-container-low" />
                <div className="h-3 w-1/2 animate-pulse bg-surface-container-low" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-border-grid bg-white px-6 py-space-xl text-center">
            <div className="mb-space-md flex h-14 w-14 items-center justify-center border border-border-grid bg-surface-container-low text-text-muted">
              <Icon name="search_off" className="text-2xl" />
            </div>
            <h2 className="font-headline-sm font-semibold uppercase tracking-tight text-on-surface">
              No products match
            </h2>
            <p className="mt-space-xs max-w-md font-body-sm text-body-sm text-text-muted">
              Try a different search term or clear the filters to see the full archive.
            </p>
            {hasFilters && (
              <button
                type="button"
                className="btn-outline mt-space-lg"
                onClick={() => {
                  setSearch('');
                  setParams({});
                }}
              >
                Clear search &amp; filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
