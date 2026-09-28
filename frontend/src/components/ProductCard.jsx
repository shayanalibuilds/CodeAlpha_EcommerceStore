import { Link } from 'react-router-dom';
import Price from './Price.jsx';
import { CATEGORY_LABELS } from './categories.js';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="card group flex flex-col transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-brand-50">
        <img
          src={product.imageUrl || '/images/products/placeholder.svg'}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <span className="chip w-fit bg-brand-50 text-brand-700 ring-brand-100">
          {CATEGORY_LABELS[product.category] || product.category}
        </span>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-brand-900">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Price cents={product.priceCents} className="font-bold text-brand-700" />
          {product.stock === 0 ? (
            <span className="text-xs font-semibold text-red-600">Out of stock</span>
          ) : (
            <span className="text-xs text-brand-700/60">
              {product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
