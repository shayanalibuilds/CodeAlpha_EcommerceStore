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
  timeAgo,
} from '../components/orderMeta.js';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'placed', label: 'Placed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TILE_TONES = [
  'bg-brand-100 text-brand-800',
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-800',
];

function ItemTiles({ items }) {
  return (
    <span className="flex" aria-hidden="true">
      {items.slice(0, 3).map((item, idx) => (
        <span
          key={idx}
          className={`-ml-2 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white first:ml-0 ${
            TILE_TONES[idx % TILE_TONES.length]
          }`}
        >
          {item.title.charAt(0).toUpperCase()}
        </span>
      ))}
    </span>
  );
}

function downloadCsv(orders) {
  const rows = [['order', 'date', 'customer', 'email', 'items', 'total_usd', 'status']];
  for (const o of orders) {
    rows.push([
      orderNumber(o.id),
      formatDate(o.createdAt),
      o.user?.name || '',
      o.user?.email || '',
      String(o.items.reduce((s, i) => s + i.qty, 0)),
      (o.totalCents / 100).toFixed(2),
      STATUS_LABELS[o.status] || o.status,
    ]);
  }
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'northwind-orders.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const { data, loading, error, retry } = useApi(() => listOrders('all'), []);
  const [filter, setFilter] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState('');
  const [notice, setNotice] = useState('');

  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const all = data?.orders || [];
  const orders = all.filter((o) => !filter || o.status === filter);
  const countFor = (value) => (value ? all.filter((o) => o.status === value).length : all.length);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-900">
            Orders
            <span className="chip bg-violet-100 text-violet-700 ring-violet-200">Admin</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Mark orders as packed or shipped, or cancel them (items return to stock).
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary !px-3"
          onClick={() => downloadCsv(all)}
          aria-label="Export orders as CSV"
          title="Export orders as CSV"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" />
          </svg>
          Export CSV
        </button>
      </div>

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

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter orders by status">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`chip ${
              filter === f.value
                ? 'bg-brand-700 text-white ring-brand-700'
                : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-100'
            }`}
          >
            {f.label} ({countFor(f.value)})
          </button>
        ))}
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Placed</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((o) => (
              <tr key={o.id} className={o.status === 'cancelled' ? 'opacity-70' : ''}>
                <td className="px-4 py-3">
                  <Link to={`/orders/${o.id}`} className="font-medium text-stone-900 hover:text-brand-700 hover:underline">
                    {orderNumber(o.id)}
                  </Link>
                  <p className="text-xs text-stone-500">{formatDate(o.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-stone-900">{o.user?.name || '—'}</p>
                  <p className="text-xs text-stone-500">{o.user?.email || ''}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ItemTiles items={o.items} />
                    <span className="text-stone-600">{o.items.reduce((s, i) => s + i.qty, 0)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Price cents={o.totalCents} className="font-medium text-stone-900" />
                </td>
                <td className="px-4 py-3 text-stone-600" title={formatDate(o.createdAt)}>
                  {timeAgo(o.createdAt)}
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
                        className="btn-danger !px-2.5 !py-1 text-xs"
                        disabled={busyId === o.id}
                        onClick={() =>
                          setStatus(o, 'cancelled', 'Cancel this order? Items will return to stock.')
                        }
                      >
                        Cancel order
                      </button>
                    )}
                    {(o.status === 'shipped' || o.status === 'cancelled') && (
                      <span className="text-xs text-stone-400">No actions</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center text-stone-500">
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
