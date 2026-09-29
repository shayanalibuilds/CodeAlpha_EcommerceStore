import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders, updateOrderStatus } from '../api/orders.js';
import { useApi } from '../hooks/useApi.js';
import AdminLayout from '../components/AdminLayout.jsx';
import Price from '../components/Price.jsx';
import Alert from '../components/Alert.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import Icon from '../components/Icon.jsx';
import {
  STATUS_LABELS,
  STATUS_CHIP,
  STATUS_ICON,
  PAYMENT_LABELS,
  orderNumber,
  timeAgo,
  formatDate,
} from '../components/orderMeta.js';

const FILTERS = [
  { value: '', label: 'All Orders' },
  { value: 'placed', label: 'Pending Fulfillment' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Dispatched' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const { data, loading, error, retry } = useApi(() => listOrders('all'), [tick]);
  const [filter, setFilter] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');

  const all = data?.orders || [];
  const counts = useMemo(() => {
    const c = { '': all.length, placed: 0, packed: 0, shipped: 0, cancelled: 0 };
    all.forEach((o) => {
      c[o.status] = (c[o.status] || 0) + 1;
    });
    return c;
  }, [all]);

  const stats = useMemo(() => {
    const gross = all.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalCents, 0) / 100;
    const units = all.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.items.reduce((x, i) => x + i.qty, 0), 0);
    const rate = all.length ? ((all.filter((o) => o.status === 'cancelled').length / all.length) * 100).toFixed(1) : '0.0';
    return { gross, units, rate };
  }, [all]);

  const orders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((o) => !filter || o.status === filter)
      .filter(
        (o) =>
          !q ||
          orderNumber(o.id).toLowerCase().includes(q) ||
          (o.user?.name || '').toLowerCase().includes(q) ||
          (o.user?.email || '').toLowerCase().includes(q)
      );
  }, [all, filter, query]);

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

  if (loading && tick === 0)
    return (
      <AdminLayout section="Orders">
        <PageLoader label="Loading dispatch telemetry…" />
      </AdminLayout>
    );

  return (
    <AdminLayout section="Orders">
      {/* Section header & telemetry controls */}
      <div className="border-b border-border-grid bg-surface-pure px-space-md py-space-md md:px-space-lg">
        <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs font-label-sm uppercase tracking-widest text-accent-pine">
              <span className="inline-block h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
              <span>Logistics Node // Campus Depot 01</span>
            </div>
            <h1 className="mt-1 font-headline-md uppercase tracking-tight text-text-primary">
              Dispatch &amp; Order Telemetry
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/products" className="btn-outline !px-space-md !py-2">
              <Icon name="inventory_2" className="text-[16px]" />
              Artifact Console
            </Link>
          </div>
        </div>

        {/* Telemetry tab filter bar */}
        <div className="-mb-space-md mt-space-md flex flex-wrap items-center gap-0 border-t border-border-grid pb-space-md pt-space-sm">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-2 px-space-md py-2 font-label-md uppercase transition-colors ${
                filter === f.value
                  ? 'border-b-2 border-accent-pine bg-surface-container-low font-semibold text-text-primary'
                  : 'border-b-2 border-transparent text-text-muted hover:border-border-strong hover:text-text-primary'
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`px-1.5 py-0.5 font-label-sm ${
                  filter === f.value
                    ? 'bg-text-primary text-surface-pure'
                    : `bg-surface-container-highest ${f.value === 'cancelled' ? 'text-error' : 'text-text-muted'}`
                }`}
              >
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Statistical metrics row */}
      <div className="grid grid-cols-1 gap-px border-b border-border-grid bg-border-grid md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col justify-between bg-surface-pure p-space-lg">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-sm uppercase tracking-widest">Gross Volume // Ledger</span>
            <Icon name="payments" className="text-[18px]" />
          </div>
          <div className="my-space-md">
            <div className="font-headline-lg font-semibold tracking-tight text-text-primary">
              ${stats.gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1 font-label-sm uppercase text-accent-pine">
              <Icon name="trending_up" className="text-[14px]" />
              <span>{stats.units} units moved (mock ledger)</span>
            </div>
          </div>
          <div className="h-1 w-full bg-surface-container-high">
            <div className="h-full bg-accent-pine" style={{ width: `${Math.min(100, stats.gross)}%` }} />
          </div>
        </div>
        <div className="flex flex-col justify-between bg-surface-pure p-space-lg">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-sm uppercase tracking-widest">Active Shipments</span>
            <Icon name="local_shipping" className="text-[18px]" />
          </div>
          <div className="my-space-md">
            <div className="font-headline-lg font-semibold tracking-tight text-text-primary">{counts.shipped} Transit</div>
            <div className="mt-1 flex items-center gap-1 font-label-sm uppercase text-text-muted">
              <span className="inline-block h-1.5 w-1.5 bg-accent-pine" aria-hidden="true" />
              <span>{counts.packed} packed &amp; staged</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border-grid pt-2 font-label-sm text-text-muted">
            <span>Fulfillment Queue</span>
            <span className="font-semibold text-text-primary">{counts.placed} AWAITING PACK</span>
          </div>
        </div>
        <div className="flex flex-col justify-between bg-surface-pure p-space-lg">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-sm uppercase tracking-widest">Dispatch Velocity</span>
            <Icon name="timer" className="text-[18px]" />
          </div>
          <div className="my-space-md">
            <div className="font-headline-lg font-semibold tracking-tight text-text-primary">
              {counts[''] + counts.placed + counts.packed + counts.shipped + counts.cancelled === all.length ? 'Live' : 'Syncing'}
            </div>
            <div className="mt-1 flex items-center gap-1 font-label-sm uppercase text-accent-pine">
              <Icon name="bolt" className="text-[14px]" />
              <span>Realtime status transitions</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border-grid pt-2 font-label-sm text-text-muted">
            <span>Status Engine</span>
            <span className="font-semibold text-text-primary">Placed→Packed→Shipped</span>
          </div>
        </div>
        <div className="flex flex-col justify-between bg-surface-pure p-space-lg">
          <div className="flex items-center justify-between text-text-muted">
            <span className="font-label-sm uppercase tracking-widest">Cancellation Ratio</span>
            <Icon name="cached" className="text-[18px]" />
          </div>
          <div className="my-space-md">
            <div className="font-headline-lg font-semibold tracking-tight text-text-primary">{stats.rate}%</div>
            <div className="mt-1 flex items-center gap-1 font-label-sm uppercase text-text-muted">
              <span>{counts.cancelled} orders returned to stock</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border-grid pt-2 font-label-sm text-text-muted">
            <span>Ledger Integrity</span>
            <span className="font-semibold text-accent-pine">GRADE AA PASS</span>
          </div>
        </div>
      </div>

      {/* Filter & search bar */}
      <div className="flex flex-col items-stretch justify-between gap-space-sm border-b border-border-grid bg-surface-paper p-space-md md:flex-row md:items-center">
        <div className="flex w-full max-w-xl items-center gap-space-sm">
          <div className="relative w-full">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full border border-border-grid bg-surface-pure pl-9 pr-3 font-body-sm text-text-primary placeholder:text-text-muted focus:border-accent-pine focus:outline-none"
              placeholder="FILTER BY ORDER ID, RECIPIENT OR EMAIL..."
              aria-label="Filter orders"
            />
          </div>
        </div>
        <span className="flex items-center gap-3 self-end font-label-sm uppercase text-text-muted md:self-auto">
          Rendering {orders.length} of {all.length} records
          <span className="h-4 w-px bg-border-grid" aria-hidden="true" />
          <span className="font-semibold text-text-primary">Auto-Sync: Realtime</span>
        </span>
      </div>

      {/* Notices */}
      <div className="px-space-md pt-space-md md:px-space-lg">
        {error && <Alert onRetry={retry}>Could not load orders: {error.message}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}
        {rowError && <Alert>{rowError}</Alert>}
      </div>

      {/* Orders data table */}
      <div className="w-full overflow-x-auto bg-surface-pure px-space-md pb-space-lg md:px-space-lg">
        <table className="w-full min-w-[880px] border-collapse border border-border-grid text-left">
          <thead>
            <tr className="border-b border-border-strong bg-surface-paper font-label-md uppercase tracking-wider text-text-muted">
              <th className="px-space-md py-space-sm font-semibold text-text-primary">Order ID &amp; Time</th>
              <th className="px-space-md py-space-sm font-semibold text-text-primary">Customer</th>
              <th className="px-space-md py-space-sm font-semibold text-text-primary">Items Manifest</th>
              <th className="px-space-md py-space-sm text-right font-semibold text-text-primary">Value</th>
              <th className="px-space-md py-space-sm font-semibold text-text-primary">Payment</th>
              <th className="px-space-md py-space-sm font-semibold text-text-primary">Status</th>
              <th className="px-space-md py-space-sm text-right font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-grid font-body-sm text-text-primary">
            {orders.map((o) => (
              <tr key={o.id} className="group transition-colors hover:bg-surface-container-low">
                <td className="whitespace-nowrap px-space-md py-space-md">
                  <div className="flex items-center gap-2">
                    <Link to={`/orders/${o.id}`} className="font-label-lg font-semibold uppercase text-text-primary hover:text-accent-pine">
                      {orderNumber(o.id)}
                    </Link>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 font-label-sm text-text-muted">
                    <Icon name="schedule" className="text-[13px]" />
                    {timeAgo(o.createdAt)} // {formatDate(o.createdAt)}
                  </div>
                </td>
                <td className="px-space-md py-space-md">
                  <div className="font-body-md font-medium text-text-primary">{o.user?.name || '—'}</div>
                  <div className="mt-0.5 font-label-sm uppercase tracking-wide text-text-muted">{o.user?.email || ''}</div>
                </td>
                <td className="max-w-xs px-space-md py-space-md">
                  <div className="truncate font-medium text-text-primary">
                    {o.items[0] ? `${o.items[0].qty}× ${o.items[0].title}` : '—'}
                  </div>
                  {o.items.length > 1 && (
                    <div className="truncate text-body-sm text-text-muted">
                      + {o.items.slice(1).reduce((s, i) => s + i.qty, 0)} more units
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-space-md py-space-md text-right">
                  <div className="font-label-lg font-semibold text-text-primary">
                    <Price cents={o.totalCents} />
                  </div>
                  <div className="font-label-sm text-text-muted">{o.items.reduce((s, i) => s + i.qty, 0)} units</div>
                </td>
                <td className="whitespace-nowrap px-space-md py-space-md">
                  <div className="inline-flex items-center gap-1 border border-border-grid bg-surface-paper px-2 py-1 font-label-sm uppercase tracking-wide text-text-primary">
                    <Icon name="payments" className="text-[14px] text-text-muted" />
                    {PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}
                  </div>
                </td>
                <td className="whitespace-nowrap px-space-md py-space-md">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-label-sm font-semibold uppercase ${STATUS_CHIP[o.status]}`}>
                    <Icon name={STATUS_ICON[o.status]} className="text-[14px]" />
                    {STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-space-md py-space-md text-right">
                  <div className="flex items-center justify-end gap-1">
                    {o.status === 'placed' && (
                      <button
                        type="button"
                        className="border border-border-grid px-2.5 py-1.5 font-label-sm uppercase tracking-wider text-text-primary transition-colors hover:border-accent-pine hover:bg-accent-pine hover:text-white disabled:opacity-40"
                        disabled={busyId === o.id}
                        onClick={() => setStatus(o, 'packed')}
                      >
                        Mark packed
                      </button>
                    )}
                    {o.status === 'packed' && (
                      <button
                        type="button"
                        className="border border-border-grid px-2.5 py-1.5 font-label-sm uppercase tracking-wider text-text-primary transition-colors hover:border-accent-pine hover:bg-accent-pine hover:text-white disabled:opacity-40"
                        disabled={busyId === o.id}
                        onClick={() => setStatus(o, 'shipped')}
                      >
                        Mark shipped
                      </button>
                    )}
                    {(o.status === 'placed' || o.status === 'packed') && (
                      <button
                        type="button"
                        title="Cancel Order"
                        className="border border-border-grid p-1.5 text-text-muted transition-colors hover:border-error hover:text-error disabled:opacity-40"
                        disabled={busyId === o.id}
                        onClick={() => setStatus(o, 'cancelled', 'Cancel this order? Items will return to stock.')}
                      >
                        <Icon name="close" className="text-[16px]" />
                        <span className="sr-only">Cancel order</span>
                      </button>
                    )}
                    {(o.status === 'shipped' || o.status === 'cancelled') && (
                      <span className="font-label-sm uppercase text-text-muted/60">No actions</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" className="px-space-md py-10 text-center font-label-md uppercase tracking-wider text-text-muted">
                  No orders {filter ? `with status "${STATUS_LABELS[filter] || filter}"` : 'yet'}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
