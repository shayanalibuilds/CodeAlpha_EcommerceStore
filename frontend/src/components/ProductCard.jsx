import { useState } from 'react';
import { Link } from 'react-router-dom';
import Price from './Price.jsx';
import { CATEGORY_LABELS } from './categories.js';
import { useCart } from '../context/CartContext.jsx';
import Icon from './Icon.jsx';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [state, setState] = useState({ status: 'idle', message: '' }); // idle | busy | added | error

  const onAdd = async () => {
    setState({ status: 'busy', message: '' });
    try {
      await add(product, 1);
      setState({ status: 'added', message: '' });
      setTimeout(() => setState({ status: 'idle', message: '' }), 1500);
    } catch (err) {
      setState({ status: 'error', message: err.fields?.qty || err.message });
      setTimeout(() => setState({ status: 'idle', message: '' }), 3000);
    }
  };

  const out = product.stock === 0;
  const low = !out && product.stock <= 5;

  return (
    <article
      className={`group flex flex-col justify-between border border-border-grid bg-white p-space-md transition-colors duration-200 hover:border-border-strong ${
        out ? 'opacity-80' : ''
      }`}
    >
      <div>
        {/* Recessed image well */}
        <Link to={`/products/${product.id}`} className="block" aria-label={product.title}>
          <div className="relative mb-space-md flex aspect-[4/3] w-full items-center justify-center overflow-hidden border border-border-grid bg-surface-container-low">
            <img
              src={product.imageUrl || '/images/products/placeholder.svg'}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {/* Category tag */}
            <span className="absolute left-2 top-2 z-10 border border-border-grid bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-on-surface">
              {CATEGORY_LABELS[product.category] || product.category}
            </span>
            {/* Stock jewels */}
            {out ? (
              <span className="absolute right-2 top-2 z-10 flex items-center gap-1.5 border border-border-grid bg-surface-container-highest px-2 py-0.5 font-label-sm uppercase tracking-wider text-secondary">
                <span className="h-1.5 w-1.5 bg-secondary" aria-hidden="true" />
                Archived / Sold Out
              </span>
            ) : low ? (
              <span className="absolute right-2 top-2 z-10 flex items-center gap-1.5 border border-border-grid bg-white px-2 py-0.5 font-label-sm text-error">
                <span className="h-1.5 w-1.5 bg-error" aria-hidden="true" />
                <span className="font-semibold">Only {product.stock} Left</span>
              </span>
            ) : (
              <span className="absolute right-2 top-2 z-10 flex items-center gap-1.5 border border-border-grid bg-white px-2 py-0.5 font-label-sm uppercase text-on-surface-variant">
                <span className="h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
                In Stock
              </span>
            )}
          </div>
        </Link>

        {/* Meta tray */}
        <div className="mb-space-xs flex items-start justify-between gap-space-sm">
          <div className="min-w-0">
            <h3 className="mt-0.5 font-headline-sm text-headline-sm tracking-tight text-on-surface">
              <Link to={`/products/${product.id}`} className="hover:text-accent-pine">
                {product.title}
              </Link>
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <Price cents={product.priceCents} className="font-headline-sm font-semibold tracking-tight text-on-surface" />
            <span className="block font-label-sm text-label-sm text-outline">USD</span>
          </div>
        </div>
        <p className="mb-space-md line-clamp-2 font-body-sm leading-relaxed text-on-surface-variant">
          {product.description}
        </p>
      </div>

      {/* Purchase row */}
      <div className="flex items-center gap-2 border-t border-border-grid pt-space-sm">
        {out ? (
          <button
            type="button"
            disabled
            className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 border border-border-grid bg-surface-container-low px-space-md py-2.5 font-label-md uppercase tracking-wider text-outline"
          >
            <Icon name="block" className="text-base" />
            <span>Sold Out</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            disabled={state.status === 'busy'}
            className="flex flex-1 items-center justify-center gap-2 bg-accent-pine px-space-md py-2.5 font-label-md uppercase tracking-wider text-white transition-colors duration-150 hover:bg-accent-pine-hover disabled:opacity-50"
          >
            <Icon name="shopping_bag" className="text-base" />
            <span>{state.status === 'busy' ? 'Adding…' : state.status === 'added' ? 'Added ✓' : 'Add to bag'}</span>
          </button>
        )}
        <Link
          to={`/products/${product.id}`}
          aria-label={`View ${product.title}`}
          className={`border border-border-grid p-2.5 transition-colors ${
            out ? 'pointer-events-none text-outline' : 'text-on-surface-variant hover:border-border-strong hover:text-on-surface'
          }`}
        >
          <Icon name="arrow_outward" className="text-base" />
        </Link>
      </div>
      {state.status === 'error' && (
        <p className="mt-1 font-label-md uppercase tracking-wider text-error" role="alert">
          {state.message}
        </p>
      )}
    </article>
  );
}
