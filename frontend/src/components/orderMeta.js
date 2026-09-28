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
  upi: 'Mobile wallet (mock)',
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

export function timeAgo(iso) {
  try {
    const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return '';
  }
}
