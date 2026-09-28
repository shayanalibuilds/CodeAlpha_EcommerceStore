import { useState } from 'react';
import { Link } from 'react-router-dom';
import Price from './Price.jsx';
import { CATEGORY_LABELS } from './categories.js';
import { useCart } from '../context/CartContext.jsx';

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
    <div className="card flex flex-col transition-shadow hover:shadow-md">
      <Link to={`/products/${product.id}`} className="group block" aria-label={product.title}>
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <img
            src={product.imageUrl || '/images/products/placeholder.svg'}
            alt={product.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03] ${
              out ? 'opacity-60' : ''
            }`}
          />
          {out && (
            <span className="chip absolute left-2 top-2 bg-stone-900/80 text-white ring-0">
              Out of stock
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
          {CATEGORY_LABELS[product.category] || product.category}
        </p>
        <Link to={`/products/${product.id}`} className="mt-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <Price cents={product.priceCents} className="font-bold text-stone-900" />
          {out ? (
            <span className="text-xs font-medium text-stone-400">Out of stock</span>
          ) : low ? (
            <span className="chip bg-amber-50 text-amber-700 ring-amber-200">
              Only {product.stock} left
            </span>
          ) : (
            <span className="text-xs text-stone-500">In stock</span>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={out || state.status === 'busy'}
          className={`mt-3 w-full ${out ? 'btn bg-stone-200 text-stone-500' : 'btn-primary'}`}
        >
          {out
            ? 'Out of stock'
            : state.status === 'busy'
              ? 'Adding…'
              : state.status === 'added'
                ? 'Added ✓'
                : 'Add to cart'}
        </button>
        {state.status === 'error' && (
          <p className="mt-1 text-xs font-medium text-red-600" role="alert">
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
