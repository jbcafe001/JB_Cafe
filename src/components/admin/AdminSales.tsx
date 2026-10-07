import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order } from '../../types';
import {
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  Calendar,
  Filter,
  ArrowDownUp,
  Download,
} from 'lucide-react';

type DateFilter = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Custom Date';

export const AdminSales: React.FC = () => {
  const { filteredOrders: orders, menuItems, currentRole } = useCafe();
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>('Today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [brandFilter, setBrandFilter] = useState<'All' | 'JB Cafe' | 'KUNAFA'>('All');

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Filter completed orders according to selection
  const filteredOrders = useMemo(() => {
    const completed = orders.filter((o) => o.status === 'completed');

    // 'This Week' or 'This Month'
    let finalOrders = selectedFilter === 'This Week' || selectedFilter === 'This Month' ? completed : completed;

    if (selectedFilter === 'Today') {
      finalOrders = completed.filter((o) => !o.createdAt.includes('-') || o.createdAt.startsWith(todayStr));
    } else if (selectedFilter === 'Yesterday') {
      finalOrders = completed.filter((o) => o.createdAt.includes(yesterdayStr));
    } else if (selectedFilter === 'Custom Date') {
      finalOrders = completed.filter((o) => o.createdAt.includes(customDate));
    }

    if (brandFilter !== 'All') {
      const kunafaItemNames = new Set(menuItems.filter(m => m.brand === 'KUNAFA').map(m => m.name));
      finalOrders = finalOrders.filter(o => {
        const hasKunafa = o.items.some(i => kunafaItemNames.has(i.name));
        return brandFilter === 'KUNAFA' ? hasKunafa : !hasKunafa;
      });
    }

    return finalOrders;
  }, [orders, selectedFilter, customDate, todayStr, yesterdayStr, brandFilter, menuItems])
  .sort((a, b) => {
    const numA = parseInt(a.orderNumber.replace(/[^0-9]/g, ''), 10) || 0;
    const numB = parseInt(b.orderNumber.replace(/[^0-9]/g, ''), 10) || 0;
    return numB - numA;
  });

  // Aggregations
  const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  const cashSales = filteredOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  const upiSales = filteredOrders
    .filter((o) => o.paymentMethod === 'upi')
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = filteredOrders
    .filter((o) => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Header & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">SALES OVERVIEW</h2>
          <p className="text-xs text-stone-500">Revenue, payment channels, and audit records</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
            {(['Today', 'Yesterday', 'This Week', 'This Month', 'Custom Date'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilter === filter
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Brand Filter */}
          {currentRole !== 'admin_kunafa' && (
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
          )}
        </div>
      </div>

      {/* If custom date is picked */}
      {selectedFilter === 'Custom Date' && (
        <div className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-stone-200 w-fit">
          <Calendar className="w-4 h-4 text-stone-400" />
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="text-xs font-medium text-stone-800 focus:outline-hidden"
          />
        </div>
      )}

      {/* 6 Summary Cards (Section 11) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Sales */}
        <div className="col-span-2 sm:col-span-1 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
            Total Sales
          </span>
          <div className="text-2xl font-black text-amber-950">₹{totalSales.toLocaleString()}</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Total Orders
          </span>
          <div className="text-2xl font-black text-stone-900">{totalOrders}</div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Avg Value
          </span>
          <div className="text-2xl font-black text-stone-900">₹{avgOrderValue}</div>
        </div>

        {/* Cash Sales */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center space-x-1 text-stone-500 mb-1">
            <Banknote className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Cash</span>
          </div>
          <div className="text-xl font-bold text-stone-900">₹{cashSales.toLocaleString()}</div>
        </div>

        {/* UPI Sales */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center space-x-1 text-stone-500 mb-1">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">UPI</span>
          </div>
          <div className="text-xl font-bold text-stone-900">₹{upiSales.toLocaleString()}</div>
        </div>

        {/* Card Sales */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center space-x-1 text-stone-500 mb-1">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Card</span>
          </div>
          <div className="text-xl font-bold text-stone-900">₹{cardSales.toLocaleString()}</div>
        </div>
      </div>

      {/* Simple Sales Table (Section 11) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">Sales Receipts</h3>
            <p className="text-xs text-stone-400">
              Showing {filteredOrders.length} completed transactions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="pb-2.5">Order</th>
                {currentRole !== 'admin_kunafa' && <th className="pb-2.5">Brand</th>}
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Time</th>
                <th className="pb-2.5">Table</th>
                <th className="pb-2.5">Waiter</th>
                <th className="pb-2.5">Payment</th>
                <th className="pb-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filteredOrders.map((ord) => {
                const dateDisplay = ord.date
                  ? new Date(ord.date).toLocaleDateString('en-GB')
                  : new Date().toLocaleDateString('en-GB');
                const timeDisplay = ord.completedAt || ord.createdAt;

                return (
                  <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                    {currentRole !== 'admin_kunafa' && (
                      <td className="py-3 font-semibold text-stone-700">
                        {(() => {
                          const kunafaItemNames = new Set(menuItems.filter(m => m.brand === 'KUNAFA').map(m => m.name));
                          const isKunafa = ord.items.some(i => kunafaItemNames.has(i.name));
                          return (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                              isKunafa
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}>
                              {isKunafa ? 'KUNAFA' : 'JB Cafe'}
                            </span>
                          );
                        })()}
                      </td>
                    )}
                    <td className="py-3 text-stone-500">{dateDisplay}</td>
                    <td className="py-3 text-stone-500">{timeDisplay}</td>
                    <td className="py-3 font-semibold">{ord.tableNumber}</td>
                    <td className="py-3 text-stone-600">{ord.waiterName}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          ord.paymentMethod === 'upi'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ord.paymentMethod === 'card'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-stone-100 text-stone-800 border-stone-200'
                        }`}
                      >
                        {ord.paymentMethod === 'upi' && <QrCode className="w-3 h-3 text-emerald-600" />}
                        {ord.paymentMethod === 'card' && <CreditCard className="w-3 h-3 text-blue-600" />}
                        {ord.paymentMethod === 'cash' && <Banknote className="w-3 h-3 text-stone-600" />}
                        <span>{ord.paymentMethod || 'UPI'}</span>
                      </span>
                    </td>
                    <td className="py-3 font-extrabold text-stone-900 text-right">
                      ₹{ord.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
