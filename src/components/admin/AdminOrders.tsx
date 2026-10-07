import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order } from '../../types';
import {
  Search, X, CalendarX, Eye, Clock, User, CreditCard,
  UtensilsCrossed, Hash, Table, CheckCircle2, ChefHat,
  ShoppingBag, Banknote, Smartphone,
} from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';

// ─── Helpers ───────────────────────────────────────────────────────────────

const statusMeta: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  new:       { label: 'New',       bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  preparing: { label: 'Preparing', bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-500 animate-pulse' },
  ready:     { label: 'Ready',     bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-500 animate-ping' },
  served:    { label: 'Served',    bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-500' },
  completed: { label: 'Completed', bg: 'bg-stone-100',  text: 'text-stone-600',  dot: 'bg-stone-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-400' },
};

const paymentIcon: Record<string, React.ReactNode> = {
  upi:  <Smartphone className="w-4 h-4" />,
  cash: <Banknote className="w-4 h-4" />,
  card: <CreditCard className="w-4 h-4" />,
};

const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const meta = statusMeta[status] || statusMeta.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${meta.bg} ${meta.text} ${size === 'md' ? 'text-xs' : 'text-[10px]'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

// ─── Order Detail Modal ─────────────────────────────────────────────────────

const OrderDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const { menuItems } = useCafe();

  const dateStr = order.date
    ? new Date(order.date).toLocaleDateString('en-GB')
    : '—';

  const paymentKey = (order.paymentMethod || 'cash').toLowerCase();

  // Group items by batch
  const batches: Record<number, typeof order.items> = {};
  order.items.forEach(item => {
    const b = item.batch ?? 1;
    if (!batches[b]) batches[b] = [];
    batches[b].push(item);
  });
  const batchNums = Object.keys(batches).map(Number).sort((a, b) => a - b);

  useModalClose(onClose);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg max-h-[90vh] bg-[#FAFAF9] rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
          style={{ animation: 'slideUp 0.22s ease-out' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="overflow-y-auto flex-1">
            {/* Header band */}
            <div className="bg-gradient-to-br from-[#1C1917] to-[#292524] p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start justify-between pr-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Order Receipt</p>
                <h2 className="text-3xl font-black tracking-tight">{order.orderNumber}</h2>
                <p className="text-sm text-stone-400 mt-0.5">{dateStr} · {order.createdAt || '—'}</p>
              </div>
              <StatusBadge status={order.status} size="md" />
            </div>

            {/* Meta row */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { icon: <Table className="w-3.5 h-3.5" />, label: 'Table', value: order.tableNumber },
                { icon: <User className="w-3.5 h-3.5" />,  label: 'Waiter', value: order.waiterName },
                { icon: paymentIcon[paymentKey] || <Banknote className="w-3.5 h-3.5" />, label: 'Payment', value: (order.paymentMethod || 'Cash').toUpperCase() },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-white/8 rounded-2xl px-3 py-2.5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1">{icon}<span className="text-[9px] uppercase tracking-wider">{label}</span></div>
                  <p className="text-xs font-bold text-white truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 flex-1">

            {/* Items — grouped by batch */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5" /> Items Ordered
              </p>

              <div className="space-y-3">
                {batchNums.map((batchNum) => (
                  <div key={batchNum}>
                    {batchNum > 1 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-px flex-1 bg-amber-200" />
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider px-2 py-0.5 bg-amber-50 rounded-full border border-amber-200">
                          Addition {batchNum - 1}
                        </span>
                        <div className="h-px flex-1 bg-amber-200" />
                      </div>
                    )}
                    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                      {batches[batchNum].map((item, idx) => {
                        const menuData = menuItems.find(m => m.id === item.menuItemId || m.name === item.name);
                        const itemBrand = menuData?.brand || 'JB Cafe';

                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between px-4 py-3 ${idx < batches[batchNum].length - 1 ? 'border-b border-stone-50' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                                {item.quantity}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-stone-800">{item.name}</p>
                                  {itemBrand === 'KUNAFA' && (
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm border border-indigo-200">
                                      KUNAFA
                                    </span>
                                  )}
                                  {itemBrand === 'JB Cafe' && (
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200">
                                      JB CAFE
                                    </span>
                                  )}
                                </div>
                                {item.category && <p className="text-[10px] text-stone-400 mt-0.5">{item.category}</p>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-stone-900 font-mono">₹{item.price * item.quantity}</p>
                              {item.quantity > 1 && (
                                <p className="text-[10px] text-stone-400 font-mono">₹{item.price} each</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-amber-600 font-bold mb-1">Special Notes</p>
                <p className="text-sm text-amber-900">{order.notes}</p>
              </div>
            )}

            {/* Bill summary */}
            <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-50">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Bill Summary</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{order.subtotal}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Tax</span>
                    <span className="font-mono">₹{order.tax}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-100 flex justify-between text-base font-extrabold text-stone-900">
                  <span>Total</span>
                  <span className="font-mono text-amber-700">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Timeline
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Order Placed', time: order.createdAt, always: true },
                  { label: 'Kitchen Started', time: (order as any).preparingAt, always: false },
                  { label: 'Marked Ready', time: (order as any).readyAt, always: false },
                  { label: 'Served', time: (order as any).servedAt, always: false },
                  { label: 'Completed', time: (order as any).completedAt, always: false },
                ]
                  .filter(e => e.always || e.time)
                  .map((event, idx, arr) => (
                    <div key={event.label} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${event.time ? 'bg-amber-500' : 'bg-stone-200'}`} />
                        {idx < arr.length - 1 && <div className="w-px flex-1 bg-stone-200 my-1 min-h-[12px]" />}
                      </div>
                      <div className="pb-2">
                        <p className="text-xs font-semibold text-stone-700">{event.label}</p>
                        <p className="text-[10px] text-stone-400">{event.time || '—'}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-800 transition-colors"
            >
              Close
            </button>
          </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)     scale(1); }
        }
      `}</style>
    </>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────

export const AdminOrders: React.FC = () => {
  const { filteredOrders: orders, menuItems } = useCafe();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<'All' | 'JB Cafe' | 'KUNAFA'>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const hasActiveFilters = fromDate || toDate || search || statusFilter !== 'all';

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setSearch('');
    setStatusFilter('all');
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.waiterName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    let matchesDate = true;
    if (fromDate || toDate) {
      const orderDate = o.date || new Date().toISOString().split('T')[0];
      if (fromDate && orderDate < fromDate) matchesDate = false;
      if (toDate && orderDate > toDate) matchesDate = false;
    }

    let matchesBrand = true;
    if (brandFilter !== 'All') {
      const kunafaItemNames = new Set(menuItems.filter(m => m.brand === 'KUNAFA').map(m => m.name));
      const hasKunafa = o.items.some(i => kunafaItemNames.has(i.name));
      matchesBrand = brandFilter === 'KUNAFA' ? hasKunafa : !hasKunafa;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesBrand;
  }).sort((a, b) => {
    // Extract numerical part from orderNumber (e.g. #1044 -> 1044) to sort descending
    const numA = parseInt(a.orderNumber.replace(/[^0-9]/g, ''), 10) || 0;
    const numB = parseInt(b.orderNumber.replace(/[^0-9]/g, ''), 10) || 0;
    return numB - numA;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header + Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">ORDER AUDIT LOG</h2>
            <p className="text-xs text-stone-500">Live order queue, kitchen tickets, and billing histories</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Date Range + Clear */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-stone-200">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="text-xs text-stone-800 bg-transparent focus:outline-hidden w-full sm:w-[110px]"
                />
                <span className="text-xs text-stone-400">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="text-xs text-stone-800 bg-transparent focus:outline-hidden w-full sm:w-[110px]"
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  title="Clear all filters"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors whitespace-nowrap"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div className="flex bg-stone-100 p-1 rounded-xl w-full sm:w-auto">
              {(['All', 'JB Cafe', 'KUNAFA'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(b)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    brandFilter === b
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>


            {/* Search */}
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-stone-200 w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order, table, waiter..."
                className="text-xs text-stone-800 bg-transparent w-full focus:outline-hidden"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-stone-400 hover:text-stone-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status chips */}
        <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'new', 'preparing', 'ready', 'served', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-[#B45309] text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {st === 'all' ? `All Orders (${orders.length})` : st}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                <CalendarX className="w-8 h-8 text-stone-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-700">No Orders Found</h3>
                <p className="text-sm text-stone-400 mt-1 max-w-xs mx-auto">
                  {hasActiveFilters
                    ? 'No orders match your current filters. Try adjusting the date range or clearing the filters.'
                    : 'No orders have been placed yet. Orders will appear here once customers start ordering.'}
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-100">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Order #</th>
                    <th className="px-5 py-3">Table</th>
                    <th className="px-5 py-3">Waiter</th>
                    <th className="px-5 py-3">Items Summary</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 text-stone-600 font-medium whitespace-nowrap">
                        {ord.date 
                          ? new Date(ord.date).toLocaleDateString('en-GB') 
                          : new Date().toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                      <td className="px-5 py-4 font-semibold text-stone-700">{ord.tableNumber}</td>
                      <td className="px-5 py-4 text-stone-600">{ord.waiterName}</td>
                      <td className="px-5 py-4 text-stone-400 max-w-xs truncate text-xs">
                        {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className="px-5 py-4 uppercase text-[11px] font-mono text-stone-500">
                        {ord.paymentMethod || '—'}
                      </td>
                      <td className="px-5 py-4 font-bold text-stone-900 font-mono text-right">
                        ₹{ord.total}
                      </td>
                      <td className="px-4 py-4">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-amber-600 text-xs font-semibold whitespace-nowrap">
                          <Eye className="w-3.5 h-3.5" /> View
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
};
