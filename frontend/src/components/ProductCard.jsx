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

  return (
    <div className="card flex flex-col transition-shadow hover:shadow-md">
      <Link to={`/products/${product.id}`} className="group block" aria-label={product.title}>
        <div className="aspect-[4/3] overflow-hidden bg-brand-50">
          <img
            src={product.imageUrl || '/images/products/placeholder.svg'}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <span className="chip w-fit bg-brand-50 text-brand-700 ring-brand-100">
          {CATEGORY_LABELS[product.category] || product.category}
        </span>
        <Link to={`/products/${product.id}`} className="mt-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-brand-900">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2">
          <Price cents={product.priceCents} className="font-bold text-brand-700" />
          {out ? (
            <span className="text-xs font-semibold text-red-600">Out of stock</span>
          ) : (
            <span className="text-xs text-brand-700/60">
              {product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={out || state.status === 'busy'}
          className="btn-primary mt-3 w-full"
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
