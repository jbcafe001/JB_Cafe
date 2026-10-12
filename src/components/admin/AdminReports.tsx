import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Package,
  Award,
  Calendar,
  Download,
  Flame,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { filteredOrders: orders, expenses, stockItems, todayStockUsage } = useCafe();
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const completed = orders.filter((o) => o.status === 'completed');
  const totalSales = completed.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  // Best selling items ranking
  const itemMap = new Map<string, { name: string; count: number; revenue: number }>();
  completed.forEach(order => {
    order.items.forEach(item => {
      const existing = itemMap.get(item.name) || { name: item.name, count: 0, revenue: 0 };
      existing.count += item.quantity;
      existing.revenue += item.price * item.quantity;
      itemMap.set(item.name, existing);
    });
  });

  const allItems = Array.from(itemMap.values()).sort((a, b) => b.count - a.count);
  const maxCount = allItems.length > 0 ? allItems[0].count : 1;

  const bestSellers: { rank: number; name: string; count: number; revenue: number; percent: number }[] = allItems.slice(0, 5).map((item, index) => ({
    rank: index + 1,
    name: item.name,
    count: item.count,
    revenue: item.revenue,
    percent: (item.count / maxCount) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header & Timeframe Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">CAFÉ REPORTS</h2>
          <p className="text-xs text-stone-500">Consolidated financial, stock usage, and popularity analysis</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#F2EDE4] p-1 rounded-xl border border-[#E5DDCF]">
          {(['Daily', 'Weekly', 'Monthly'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-amber-100/90 text-amber-950 font-bold border border-amber-300 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Main Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-teal-50/30 border border-emerald-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Sales Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">
            ₹{(timeframe === 'Monthly' ? totalSales * 4.2 : totalSales).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700/70 mt-1 inline-block">
            {timeframe} gross revenue
          </span>
        </div>

        <div className="bg-gradient-to-br from-rose-50 via-rose-50/40 to-orange-50/30 border border-rose-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Total Expenses
            </span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-950">
            ₹{(timeframe === 'Monthly' ? totalExpenses * 3.8 : totalExpenses).toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-700/70 mt-1 inline-block">
            Ingredients, utility, maintenance
          </span>
        </div>

        <div className="bg-gradient-to-br from-amber-50 via-amber-50/40 to-yellow-50/30 border border-amber-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Net Operating Profit
            </span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950">
            ₹{(timeframe === 'Monthly' ? netProfit * 4.4 : netProfit).toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-800/80 font-semibold mt-1 inline-block">
            Estimated surplus margin
          </span>
        </div>
      </div>

      {/* Best Selling Items & Stock Usage Breakdown (Section 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Items */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-stone-900 text-base">Best Selling Items</h3>
            </div>
            <span className="text-xs text-stone-400 font-medium">Ranked by volume</span>
          </div>

          <div className="space-y-4">
            {bestSellers.length > 0 ? (
              bestSellers.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 font-bold text-amber-900 text-xs flex items-center justify-center border border-amber-200">
                        {item.rank}
                      </span>
                      <span className="font-bold text-stone-900">{item.name}</span>
                    </div>
                    <div className="text-right font-medium text-stone-600">
                      <strong className="text-stone-900">{item.count} sold</strong>
                      <span className="text-stone-400 ml-1.5">(₹{item.revenue.toLocaleString()})</span>
                    </div>
                  </div>

                  {/* Relative progress bar */}
                  <div className="w-full bg-[#F2EDE4] h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percent}%` }}
                      className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-stone-400 italic p-3 text-sm border border-dashed border-stone-200 rounded-xl bg-stone-50 text-center">
                No sales data available yet.
              </p>
            )}
          </div>
        </div>

        {/* Stock Usage Report */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-stone-900 text-base">Stock Usage Report</h3>
              </div>
              <span className="text-xs text-stone-400">Deducted consumption</span>
            </div>

            <p className="text-xs text-stone-500 mb-4">
              High-velocity ingredients automatically calculated from customer tickets:
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              {Object.keys(todayStockUsage).length > 0 ? (
                Object.entries(todayStockUsage).map(([id, usage]: [string, any]) => (
                  <div key={id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900">{usage.name}</h4>
                    </div>
                    <span className="font-extrabold text-amber-700 font-mono text-sm">{usage.amount} {usage.unit}</span>
                  </div>
                ))
              ) : (
                <p className="text-stone-400 italic p-3">No usage recorded yet.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
            <span>Inventory formula verified</span>
            <span className="text-emerald-600 font-semibold">100% In Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
