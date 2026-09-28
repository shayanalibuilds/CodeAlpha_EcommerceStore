import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders, updateOrderStatus } from '../api/orders.js';
import { useApi } from '../hooks/useApi.js';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import {
  STATUS_LABELS,
  STATUS_CHIP,
  orderNumber,
  formatDate,
} from '../components/orderMeta.js';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'placed', label: 'Placed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const { data, loading, error, retry } = useApi(() => listOrders('all'), []);
  const [filter, setFilter] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState('');
  const [notice, setNotice] = useState('');

  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const orders = (data?.orders || []).filter((o) => !filter || o.status === filter);

  const setStatus = async (order, status, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusyId(order.id);
    setRowError('');
    setNotice('');
    try {
      await updateOrderStatus(order.id, status);
      setNotice(`Order ${orderNumber(order.id)} is now ${STATUS_LABELS[status].toLowerCase()}.`);
      refresh();
    } catch (err) {
      setRowError(err.fields?.status || err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading && tick === 0) return <PageLoader label="Loading orders…" />;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-700">
        Manage orders
        <span className="chip bg-violet-100 text-violet-700 ring-violet-200">Admin</span>
      </h1>
      <p className="mt-1 text-sm text-brand-700/70">
        Mark orders as packed or shipped, or cancel them (items return to stock).
      </p>

      {error && (
        <div className="mt-4">
          <Alert onRetry={retry}>Could not load orders: {error.message}</Alert>
        </div>
      )}
      {notice && (
        <div className="mt-4">
          <Alert tone="success">{notice}</Alert>
        </div>
      )}
      {rowError && (
        <div className="mt-4">
          <Alert>{rowError}</Alert>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`chip ${
              filter === f.value
                ? 'bg-brand-700 text-white ring-brand-700'
                : 'bg-white text-brand-700 ring-brand-200 hover:bg-brand-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-700/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3">
                  <Link to={`/orders/${o.id}`} className="font-medium text-brand-900 hover:underline">
                    {orderNumber(o.id)}
                  </Link>
                  <p className="text-xs text-brand-700/60">{formatDate(o.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-brand-900">{o.user?.name || '—'}</p>
                  <p className="text-xs text-brand-700/60">{o.user?.email || ''}</p>
                </td>
                <td className="px-4 py-3 text-brand-700/80">
                  {o.items.reduce((s, i) => s + i.qty, 0)}
                </td>
                <td className="px-4 py-3">
                  <Price cents={o.totalCents} className="font-medium text-brand-900" />
                </td>
                <td className="px-4 py-3">
                  <span className={`chip ${STATUS_CHIP[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {o.status === 'placed' && (
                      <button
                        type="button"
                        className="btn-primary !px-2.5 !py-1 text-xs"
                        disabled={busyId === o.id}
                        onClick={() => setStatus(o, 'packed')}
                      >
                        Mark packed
                      </button>
                    )}
                    {o.status === 'packed' && (
                      <button
                        type="button"
                        className="btn-primary !px-2.5 !py-1 text-xs"
                        disabled={busyId === o.id}
                        onClick={() => setStatus(o, 'shipped')}
                      >
                        Mark shipped
                      </button>
                    )}
                    {(o.status === 'placed' || o.status === 'packed') && (
                      <button
                        type="button"
                        className="btn-secondary !px-2.5 !py-1 text-xs !text-red-600"
                        disabled={busyId === o.id}
                        onClick={() =>
                          setStatus(o, 'cancelled', 'Cancel this order? Items will return to stock.')
                        }
                      >
                        Cancel order
                      </button>
                    )}
                    {(o.status === 'shipped' || o.status === 'cancelled') && (
                      <span className="text-xs text-brand-700/50">No actions</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-brand-700/60">
                  No orders {filter ? `with status "${filter}"` : 'yet'}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
