// Shared labels/chips/formatters for orders — architectural chip styles.
export const STATUS_LABELS = {
  placed: 'Placed',
  packed: 'Packed',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
};

// Square status tags (border + tint), per the admin telemetry design.
export const STATUS_CHIP = {
  placed: 'border-border-grid bg-surface-container-low text-on-surface',
  packed: 'border-border-grid bg-surface-container-highest text-on-surface',
  shipped: 'border-accent-pine bg-accent-pine text-white',
  cancelled: 'border-error bg-white text-error',
};

export const STATUS_ICON = {
  placed: 'schedule',
  packed: 'inventory',
  shipped: 'local_shipping',
  cancelled: 'close',
};

export const PAYMENT_LABELS = {
  card: 'Card (mock)',
  upi: 'UPI (mock)',
  cash: 'Cash on delivery',
};

export function orderNumber(id) {
  return `NW-${id.slice(-6).toUpperCase()}`;
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
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  } catch {
    return '';
  }
}
