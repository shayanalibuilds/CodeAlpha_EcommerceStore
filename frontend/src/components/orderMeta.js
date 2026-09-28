// Shared labels/chips/formatters for orders.
export const STATUS_LABELS = {
  placed: 'Placed',
  packed: 'Packed',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
};

export const STATUS_CHIP = {
  placed: 'bg-amber-50 text-amber-700 ring-amber-200',
  packed: 'bg-violet-50 text-violet-700 ring-violet-200',
  shipped: 'bg-sky-50 text-sky-700 ring-sky-200',
  cancelled: 'bg-stone-100 text-stone-600 ring-stone-200',
};

export const PAYMENT_LABELS = {
  card: 'Card (mock)',
  upi: 'UPI (mock)',
  cash: 'Cash on delivery',
};

export function orderNumber(id) {
  return `#NW-${id.slice(-6).toUpperCase()}`;
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
