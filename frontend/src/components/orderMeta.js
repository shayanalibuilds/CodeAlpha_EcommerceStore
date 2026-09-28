// Shared labels/chips/formatters for orders.
export const STATUS_LABELS = {
  placed: 'Placed',
  packed: 'Packed',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
};

export const STATUS_CHIP = {
  placed: 'bg-sky-50 text-sky-700 ring-sky-200',
  packed: 'bg-amber-50 text-amber-700 ring-amber-200',
  shipped: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
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
