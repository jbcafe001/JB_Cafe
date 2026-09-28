import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order, OrderStatus } from '../../types';
import { Search, Filter, Clock, CheckCircle2, Flame, RefreshCcw } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders } = useCafe();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.waiterName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">ORDER AUDIT LOG</h2>
          <p className="text-xs text-stone-500">Live order queue, kitchen tickets, and billing histories</p>
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
        </div>
      </div>

      {/* Status Filter Chips */}
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

      {/* Orders Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-100">
              <tr>
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Table</th>
                <th className="px-5 py-3">Waiter</th>
                <th className="px-5 py-3">Items Summary</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                  <td className="px-5 py-4 font-semibold text-stone-700">{ord.tableNumber}</td>
                  <td className="px-5 py-4 text-stone-600">{ord.waiterName}</td>
                  <td className="px-5 py-4 text-stone-500 max-w-xs truncate">
                    {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="px-5 py-4">
                    {ord.status === 'completed' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 uppercase">
                        Done
                      </span>
                    )}
                    {ord.status === 'served' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                        Served
                      </span>
                    )}
                    {ord.status === 'ready' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                        Ready
                      </span>
                    )}
                    {ord.status === 'preparing' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 uppercase">
                        Preparing
                      </span>
                    )}
                    {ord.status === 'new' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                        New
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 uppercase text-[11px] font-mono text-stone-500">
                    {ord.paymentMethod || 'Cash'}
                  </td>
                  <td className="px-5 py-4 font-bold text-stone-900 font-mono text-right">
                    ₹{ord.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
