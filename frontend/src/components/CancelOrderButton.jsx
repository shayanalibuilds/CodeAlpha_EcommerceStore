import { useState } from 'react';
import { cancelOrder } from '../api/orders.js';
import { orderNumber } from './orderMeta.js';
import Icon from './Icon.jsx';

// Customer self-service cancel. Shown only while the order is "placed"
// (before it is packed or shipped); asks for confirmation first.
export default function CancelOrderButton({ order, onCancelled, className = '' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (order.status !== 'placed') return null;

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      `Cancel order ${orderNumber(order.id)}? The items go back on the shelf and this cannot be undone.`
    );
    if (!ok) return;
    setBusy(true);
    setError('');
    try {
      const { order: updated } = await cancelOrder(order.id);
      onCancelled?.(updated);
    } catch (err) {
      setError(err.message || 'Could not cancel the order. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button type="button" onClick={onClick} disabled={busy} className="btn-danger">
        <Icon name="cancel" className="text-base" />
        {busy ? 'Cancelling…' : 'Cancel order'}
      </button>
      {error && (
        <span role="alert" className="font-body-sm text-error">
          {error}
        </span>
      )}
    </span>
  );
}
