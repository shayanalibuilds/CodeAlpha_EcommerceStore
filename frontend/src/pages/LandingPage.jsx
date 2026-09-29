import { Link, useNavigate } from 'react-router-dom';
import { listProducts } from '../api/products.js';
import { useApi } from '../hooks/useApi.js';
import { useCart } from '../context/CartContext.jsx';
import Price from '../components/Price.jsx';
import Icon from '../components/Icon.jsx';
import { CATEGORY_LABELS, CATEGORY_KEYS } from '../components/categories.js';

const SHOWCASE_SLUGS = ['sprout-everyday-backpack-fern-green', 'glow-study-desk-lamp-warm-white', 'sunrise-spiral-notebook-3-pack'];

function pickShowcase(items) {
  const bySlug = new Map(items.map((p) => [p.slug, p]));
  const lead = SHOWCASE_SLUGS.map((s) => bySlug.get(s)).find(Boolean) || items[0];
  const rest = items.filter((p) => p.id !== lead?.id && !out(p));
  return { lead, rest };
}
const out = (p) => p?.stock === 0;

export default function LandingPage() {
  const navigate = useNavigate();
  const { add } = useCart();
  const { data, loading } = useApi(() => listProducts({}), []);
  const items = data?.items || [];
  const { lead, rest } = pickShowcase(items);
  const curated = rest.slice(0, 4);

  const quickAdd = async (product) => {
    try {
      await add(product, 1);
    } catch {
      /* card surfaces its own error state */
    }
  };

  return (
    <main className="w-full bg-surface-pure">
      {/* Dispatch ribbon */}
      <div className="w-full border-b border-border-grid bg-white px-4 py-2 md:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between text-[11px] font-medium uppercase tracking-widest text-text-muted">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
            <span>Student-run demo market — payments are mocked</span>
          </div>
          <span className="hidden font-mono sm:inline">Curated Nordic Study Goods</span>
          <span className="hidden lg:inline">AUTUMN / WINTER 2026 ARCHIVE</span>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1440px] border-b border-border-grid px-4 pt-12 pb-16 md:px-8 md:pt-16">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Editorial column */}
          <div className="flex flex-col items-start pt-2 lg:col-span-5">
            <div className="mb-8 inline-flex items-center gap-2 border border-border-grid bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-text-primary">
              <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
              Architectural Simplicity &amp; Study Essentials
            </div>
            <h1 className="mb-6 text-4xl font-bold uppercase leading-[1.05] tracking-tighter text-text-primary sm:text-5xl lg:text-6xl">
              Quietly
              <br />
              Crafted
              <br />
              <span className="font-serif lowercase italic font-normal text-accent-pine">Everyday</span> Goods.
            </h1>
            <p className="mb-10 max-w-md text-sm leading-relaxed text-text-muted md:text-base">
              Thoughtfully engineered staples for desk, dorm, and transit. Built with family-safe
              materials, honest prices, and enduring utility for curious minds.
            </p>
            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-3 bg-text-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-pine"
              >
                <span>Explore Catalog</span>
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-3 border border-border-grid bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-primary transition-colors hover:border-border-strong"
              >
                <span>Open An Account</span>
              </Link>
            </div>
            <div className="mt-14 flex w-full items-center justify-between border-t border-border-grid pt-6 text-xs text-text-muted">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-text-primary">{loading ? '—' : items.length} curated goods</span>
                <span className="text-border-grid">|</span>
                <span className="uppercase tracking-wider">Live stock &amp; orders in this demo</span>
              </div>
              <span className="font-mono text-[11px]">DEMO BUILD</span>
            </div>
          </div>

          {/* Product showcase grid */}
          <div className="divide-y divide-border-grid border border-border-grid bg-white lg:col-span-7">
            {loading && (
              <div className="p-8 font-label-md uppercase tracking-widest text-text-muted">
                Loading the archive…
              </div>
            )}
            {!loading && lead && (
              <>
                {/* Lead highlight */}
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
                    <Link to={`/products/${lead.id}`} className="md:col-span-6">
                      <div className="flex aspect-square items-center justify-center border border-border-grid bg-surface-container-low p-4">
                        <img
                          src={lead.imageUrl || '/images/products/placeholder.svg'}
                          alt={lead.title}
                          className="h-full w-full object-cover contrast-[105%] grayscale-[15%]"
                        />
                      </div>
                    </Link>
                    <div className="flex h-full flex-col justify-between md:col-span-6">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-text-muted">
                          <span className="font-mono">Ref. {lead.slug.toUpperCase()}</span>
                          <span className="text-xs font-bold uppercase tracking-widest text-accent-pine">
                            {CATEGORY_LABELS[lead.category] || lead.category}
                          </span>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold uppercase tracking-tight text-text-primary">
                          <Link to={`/products/${lead.id}`} className="hover:text-accent-pine">
                            {lead.title}
                          </Link>
                        </h3>
                        <p className="mb-6 text-xs font-normal leading-relaxed text-text-muted line-clamp-3">
                          {lead.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-border-grid pt-4">
                        <div>
                          <Price cents={lead.priceCents} className="font-mono text-xl font-bold text-text-primary" />
                          <div className="text-[10px] uppercase tracking-wider text-text-muted">
                            {lead.stock > 0 ? `In Stock · ${lead.stock} units` : 'Archived'}
                          </div>
                        </div>
                        <Link
                          to={`/products/${lead.id}`}
                          className="border border-border-grid bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-border-strong"
                        >
                          Quick View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Secondary split row */}
                <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-border-grid divide-y md:divide-y-0">
                  {rest.slice(0, 2).map((p) => (
                    <div key={p.id} className="flex flex-col justify-between p-6">
                      <div>
                        <Link to={`/products/${p.id}`} className="block">
                          <div className="mb-4 flex aspect-[4/3] items-center justify-center border border-border-grid bg-surface-container-low p-4">
                            <img
                              src={p.imageUrl || '/images/products/placeholder.svg'}
                              alt={p.title}
                              className="h-full w-full object-cover grayscale-[15%]"
                            />
                          </div>
                        </Link>
                        <div className="mb-1 flex items-baseline justify-between">
                          <h3 className="text-base font-bold uppercase tracking-tight text-text-primary">
                            <Link to={`/products/${p.id}`} className="hover:text-accent-pine">
                              {p.title}
                            </Link>
                          </h3>
                          <Price cents={p.priceCents} className="font-mono text-sm font-bold" />
                        </div>
                        <p className="mb-4 text-xs leading-relaxed text-text-muted line-clamp-2">{p.description}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-border-grid pt-4">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                          {CATEGORY_LABELS[p.category] || p.category}
                        </span>
                        <button
                          type="button"
                          aria-label={`Add ${p.title}`}
                          onClick={() => quickAdd(p)}
                          disabled={p.stock === 0}
                          className="flex h-8 w-8 items-center justify-center border border-border-grid bg-white text-text-primary transition-colors hover:border-border-strong hover:bg-text-primary hover:text-white disabled:opacity-40"
                        >
                          <Icon name="add" className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="mx-auto w-full max-w-[1440px] border-b border-border-grid px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 divide-y divide-border-grid border-y border-border-grid md:grid-cols-3 md:divide-y-0 md:divide-x">
          {[
            {
              icon: 'spa',
              no: 'Pillar // 01',
              title: 'Non-Toxic & Family Safe',
              body: 'Curated for study spaces and shared homes: BPA-free bottles, water-based inks, and materials chosen to be safe around children.',
              foot: 'Family-safe selection standard',
            },
            {
              icon: 'all_inclusive',
              no: 'Pillar // 02',
              title: 'Honest Circular Pricing',
              body: 'Student-friendly prices with no dark patterns. Stock counts are live and orders restock automatically when cancelled.',
              foot: 'Live stock verification',
            },
            {
              icon: 'balance',
              no: 'Pillar // 03',
              title: 'Calm Utility',
              body: 'Quiet, deliberate tools for deep work: restrained palettes, durable build choices, and zero cognitive friction at checkout.',
              foot: 'Mocked & secure checkout',
            },
          ].map((p) => (
            <div key={p.no} className="flex flex-col justify-between py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <div>
                <div className="mb-4 flex items-center gap-2 text-accent-pine">
                  <Icon name={p.icon} className="text-xl" />
                  <span className="font-mono text-xs uppercase tracking-widest">{p.no}</span>
                </div>
                <h2 className="mb-3 text-lg font-bold uppercase tracking-tight text-text-primary">{p.title}</h2>
                <p className="text-xs font-normal leading-relaxed text-text-muted md:text-sm">{p.body}</p>
              </div>
              <div className="mt-8 flex items-center gap-2 border-t border-border-grid pt-4 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
                {p.foot}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated essentials */}
      <section className="mx-auto w-full max-w-[1440px] border-b border-border-grid px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-border-grid pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-muted">
              <span className="font-semibold text-accent-pine">Seasonal Archive</span>
              <span>/</span>
              <span>Autumn Winter 2026</span>
            </div>
            <h2 className="text-3xl font-bold uppercase tracking-tight text-text-primary md:text-4xl">
              Curated Essentials for Study
            </h2>
          </div>
          {/* Filter bar → real catalog routes */}
          <div className="flex flex-wrap items-center border border-border-grid text-xs font-medium uppercase">
            <Link
              to="/products"
              className="px-4 py-2 transition-colors hover:bg-text-primary hover:text-white"
            >
              All Archive
            </Link>
            {CATEGORY_KEYS.slice(0, 4).map((key) => (
              <Link
                key={key}
                to={`/products?category=${key}`}
                className="border-l border-border-grid px-4 py-2 text-text-muted transition-colors hover:bg-surface-container-low hover:text-text-primary"
              >
                {CATEGORY_LABELS[key]}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading && (
            <div className="col-span-full py-10 text-center font-label-md uppercase tracking-widest text-text-muted">
              Loading curated pieces…
            </div>
          )}
          {!loading && curated.length === 0 && (
            <div className="col-span-full border border-border-grid p-10 text-center font-label-md uppercase tracking-widest text-text-muted">
              The archive is being restocked.
            </div>
          )}
          {curated.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col justify-between bg-white p-6 transition-colors hover:bg-surface-container-low/50"
            >
              <div>
                <Link to={`/products/${p.id}`} className="block">
                  <div className="relative mb-6 flex aspect-square items-center justify-center border border-border-grid bg-white p-4">
                    <img
                      src={p.imageUrl || '/images/products/placeholder.svg'}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale-[15%]"
                    />
                    <span className="absolute left-2 top-2 border border-border-grid bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                      {CATEGORY_LABELS[p.category] || p.category}
                    </span>
                  </div>
                </Link>
                <div className="mb-1 flex items-center justify-between font-mono text-xs text-text-muted">
                  <span>{p.stock > 0 && p.stock <= 5 ? `Only ${p.stock} left` : p.stock > 0 ? 'In stock' : 'Sold out'}</span>
                  <span>{CATEGORY_LABELS[p.category] || ''}</span>
                </div>
                <h3 className="mb-1 text-base font-bold uppercase tracking-tight text-text-primary">
                  <Link to={`/products/${p.id}`} className="hover:text-accent-pine">
                    {p.title}
                  </Link>
                </h3>
                <p className="mb-6 line-clamp-1 text-xs text-text-muted">{p.description}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border-grid pt-4">
                <Price cents={p.priceCents} className="font-mono text-base font-bold text-text-primary" />
                <button
                  type="button"
                  onClick={() => (p.stock === 0 ? navigate(`/products/${p.id}`) : quickAdd(p))}
                  className="inline-flex items-center gap-1.5 bg-text-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-pine"
                >
                  <Icon name="add" className="text-sm" />
                  <span>{p.stock === 0 ? 'View' : 'Quick Add'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Design philosophy quote */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-24 md:px-8">
        <div className="relative border-y border-border-grid bg-white px-6 py-16 text-center md:px-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <span className="mb-4 font-mono text-xs uppercase tracking-widest text-accent-pine">
              Design Philosophy
            </span>
            <blockquote className="mb-8 text-2xl font-bold uppercase leading-tight tracking-tight text-text-primary sm:text-4xl">
              “Simplicity is the deliberate elimination of the unnecessary.”
            </blockquote>
            <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-wider text-text-muted">
              <span className="h-px w-8 bg-border-grid" aria-hidden="true" />
              <span className="font-bold text-text-primary">O. Lindqvist</span>
              <span aria-hidden="true">//</span>
              <span>Head of Product Architecture</span>
              <span className="h-px w-8 bg-border-grid" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
