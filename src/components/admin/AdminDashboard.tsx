import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  TrendingUp,
  ShoppingBag,
  Receipt,
  Wallet,
  Coins,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { filteredOrders: allOrders, menuItems, expenses, stockItems, tables, staffMembers, upaadRecords, salaryHistory, currentRole } = useCafe();

  const [brandFilter, setBrandFilter] = useState<'All' | 'JB Cafe' | 'KUNAFA'>('All');

  // Filter orders by brand
  const orders = React.useMemo(() => {
    if (brandFilter === 'All') return allOrders;
    const kunafaItemNames = new Set(menuItems.filter(m => m.brand === 'KUNAFA').map(m => m.name));
    return allOrders.filter(o => {
      const hasKunafa = o.items.some(i => kunafaItemNames.has(i.name));
      return brandFilter === 'KUNAFA' ? hasKunafa : !hasKunafa;
    });
  }, [allOrders, brandFilter, menuItems]);

  // Completed orders today
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const todaySales = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter(
    (o) => o.status === 'new' || o.status === 'preparing' || o.status === 'ready' || o.status === 'served'
  );
  const activeOrdersCount = activeOrders.length;
  const todayOrdersCount = completedOrders.length;
  const avgOrderValue = todayOrdersCount > 0 ? Math.round(todaySales / todayOrdersCount) : 0;

  // Today's expenses
  const todayExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedNet = todaySales - todayExpenses;

  // Low stock items
  const lowStockItems = stockItems.filter((s) => s.status === 'low' || s.status === 'out');

  // Staff Salary Calculations (Sections 16 & 17)
  const totalMonthlySalary = staffMembers.reduce((sum, s) => sum + s.monthlySalary, 0);
  let totalUpaadGiven = 0;
  let totalSalaryPaid = 0;
  let totalSalaryDue = 0;

  const staffPayables = staffMembers.map((staff) => {
    const upaad = upaadRecords
      .filter((u) => u.staffId === staff.id && u.salaryPeriod === staff.currentPeriod)
      .reduce((sum, u) => sum + u.amount, 0);
    totalUpaadGiven += upaad;

    const isPaid = salaryHistory.some(
      (s) => s.staffId === staff.id && s.month === staff.currentPeriod
    );
    const payable = Math.max(0, staff.monthlySalary - upaad);

    if (isPaid) {
      totalSalaryPaid += payable;
    } else {
      totalSalaryDue += payable;
    }

    return {
      ...staff,
      upaad,
      payable,
      isPaid,
    };
  });

  const upcomingSalaries = staffPayables.filter((s) => !s.isPaid).slice(0, 4);

  // Hourly Sales Data for Chart (10 AM to 8 PM)
  const hourlyLabels = [
    '10 AM',
    '11 AM',
    '12 PM',
    '1 PM',
    '2 PM',
    '3 PM',
    '4 PM',
    '5 PM',
    '6 PM',
    '7 PM',
    '8 PM',
  ];

  const hourlySales = new Array(11).fill(0);
  completedOrders.forEach((o) => {
    if (!o.completedAt && !o.createdAt) return;
    const d = new Date(o.completedAt || o.createdAt);
    const hour = d.getHours();
    if (hour >= 10 && hour <= 20) {
      hourlySales[hour - 10] += o.total;
    }
  });
  const maxSaleHour = Math.max(...hourlySales, 1);

  // Recent 6 orders
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Dashboard Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">DASHBOARD</h2>
          <p className="text-xs text-stone-500">Overview of today's cafe operations and metrics</p>
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
      </div>

      {/* Top Section: Clean Minimalism Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Today's Sales */}
        <div className="col-span-1 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Today's Sales</p>
          <p className="text-3xl font-bold mt-2 text-stone-900">₹{todaySales.toLocaleString()}</p>
          <p className="text-xs text-stone-500 font-medium mt-1">Based on completed orders</p>
        </div>

        {/* Active Orders */}
        <div className="col-span-1 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Orders</p>
          <p className="text-3xl font-bold mt-2 text-stone-900">{activeOrdersCount}</p>
          <p className="text-xs text-stone-500 font-medium mt-1">Orders in progress</p>
        </div>

        {/* Estimated Net Profit */}
        <div className="col-span-1 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Est. Net Profit</p>
          <p className={`text-3xl font-bold mt-2 ${estimatedNet < 0 ? 'text-red-600' : 'text-stone-900'}`}>
            {estimatedNet < 0 ? '-' : ''}₹{Math.abs(estimatedNet).toLocaleString()}
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1">Expenses: ₹{todayExpenses.toLocaleString()}</p>
        </div>

        {/* Stock Alert (With Left Accent Border) */}
        <div className={`col-span-1 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm border-l-4 ${lowStockItems.length > 0 ? 'border-l-orange-400' : 'border-l-green-400'}`}>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Stock Alert</p>
          <p className="text-3xl font-bold mt-2 text-stone-900">
            {lowStockItems.length} {lowStockItems.length === 1 ? 'Item' : 'Items'}
          </p>
          {lowStockItems.length > 0 ? (
            <p className="text-xs text-orange-600 font-medium mt-1">Action Required</p>
          ) : (
            <p className="text-xs text-green-600 font-medium mt-1">All Good</p>
          )}
        </div>
      </div>

      {/* Main Grid: Orders Table + Right Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Live Orders Table (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h2 className="font-bold text-stone-800">Recent Live Orders</h2>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-[#B45309] uppercase tracking-wider hover:underline"
            >
              View All Orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                <tr>
                  <th className="px-5 py-3">Order #</th>
                  {currentRole !== 'admin_kunafa' && <th className="px-5 py-3">Brand</th>}
                  <th className="px-5 py-3">Table</th>
                  <th className="px-5 py-3">Waiter</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {recentOrders.map((ord) => {
                  const summary = ord.items
                    .map((it) => `${it.quantity}x ${it.name}`)
                    .slice(0, 2)
                    .join(', ');
                  const hasMore = ord.items.length > 2;

                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-stone-900 font-mono">
                        {ord.orderNumber}
                      </td>
                      {currentRole !== 'admin_kunafa' && (
                        <td className="px-5 py-4 font-semibold text-stone-700">
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
                      <td className="px-5 py-4 text-stone-700">{ord.tableNumber}</td>
                      <td className="px-5 py-4 text-stone-600">{ord.waiterName}</td>
                      <td className="px-5 py-4 text-stone-600 max-w-[180px] truncate" title={summary}>
                        {summary}
                        {hasMore && '...'}
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone-900">₹{ord.total}</td>
                      <td className="px-5 py-4">
                        {ord.status === 'ready' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                            Ready
                          </span>
                        )}
                        {ord.status === 'served' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                            Served
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
                        {ord.status === 'completed' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 uppercase">
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Table Availability + Dark Stock Alert Card (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Table Availability Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-800">Table Availability</h2>
              <button
                onClick={() => onNavigate('tables')}
                className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider hover:underline"
              >
                Floor Plan
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {tables.slice(0, 6).map((tbl) => {
                const isReady = tbl.status === 'ready';
                const isServed = tbl.status === 'served';
                const isActive = tbl.status === 'occupied' || tbl.status === 'preparing';

                if (isReady) {
                  return (
                    <div
                      key={tbl.id}
                      className="aspect-square rounded-xl border border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center p-2"
                    >
                      <p className="text-[10px] font-bold text-emerald-800">{tbl.number}</p>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase mt-1">Ready</p>
                    </div>
                  );
                }

                if (isServed) {
                  return (
                    <div
                      key={tbl.id}
                      className="aspect-square rounded-xl border border-indigo-300 bg-indigo-50 flex flex-col items-center justify-center p-2"
                    >
                      <p className="text-[10px] font-bold text-indigo-900">{tbl.number}</p>
                      <p className="text-[10px] font-bold text-indigo-700 uppercase mt-1">Served</p>
                    </div>
                  );
                }

                if (isActive) {
                  return (
                    <div
                      key={tbl.id}
                      className="aspect-square rounded-xl border border-stone-200 bg-stone-900 text-white flex flex-col items-center justify-center p-2"
                    >
                      <p className="text-[10px] font-bold text-stone-400">{tbl.number}</p>
                      <p className="text-[10px] font-bold text-orange-400 uppercase mt-1">Active</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={tbl.id}
                    className="aspect-square rounded-xl border border-stone-100 bg-stone-50 flex flex-col items-center justify-center p-2"
                  >
                    <p className="text-[10px] font-bold text-stone-400">{tbl.number}</p>
                    <p className="text-[10px] font-bold text-green-600 uppercase mt-1">Free</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dark Stock Inventory Alert Card */}
          <div className="bg-stone-900 text-white p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white text-sm">Stock Inventory Alert</h2>
              <button
                onClick={() => onNavigate('stock')}
                className="text-[10px] font-bold text-amber-400 uppercase tracking-wider hover:underline"
              >
                Restock
              </button>
            </div>

            <div className="space-y-3">
              {stockItems.slice(0, 3).map((item) => {
                const ratio = Math.min(100, Math.round((item.available / item.targetStock) * 100));
                const isVeryLow = item.available <= item.minThreshold;

                return (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-300">{item.name} ({item.unit})</span>
                      <span className={`${isVeryLow ? 'text-red-400' : 'text-orange-400'} font-bold`}>
                        {item.available} / {item.targetStock}
                      </span>
                    </div>
                    <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${ratio}%` }}
                        className={`h-full ${isVeryLow ? 'bg-red-400' : 'bg-orange-400'} rounded-full transition-all duration-300`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 16. Staff Salary Summary Card (Section 16) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Staff Salary</h3>
                <p className="text-[11px] text-stone-400">Monthly payroll & advances</p>
              </div>
              <button
                id="view-staff-salary-summary-btn"
                onClick={() => onNavigate('salary')}
                className="text-[11px] font-bold text-[#B45309] hover:underline flex items-center space-x-1"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-stone-100">
              <div className="flex justify-between pt-1 text-stone-600">
                <span>Total Monthly Salary</span>
                <span className="font-bold text-stone-900">₹{totalMonthlySalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-amber-700">
                <span>Upaad Given</span>
                <span className="font-bold">₹{totalUpaadGiven.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-stone-700">
                <span>Salary Remaining</span>
                <span className="font-bold text-stone-900">₹{totalSalaryDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-emerald-700">
                <span>Salary Paid</span>
                <span className="font-bold">₹{totalSalaryPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1.5 font-bold text-amber-900">
                <span>Salary Pending</span>
                <span className="text-amber-800">₹{totalSalaryDue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 17. Upcoming Salaries Section (Section 17) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm">Upcoming Salaries</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                30 Sep Due
              </span>
            </div>

            <div className="space-y-2">
              {upcomingSalaries.map((emp) => (
                <div
                  key={emp.id}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-stone-900">{emp.name}</p>
                    <p className="text-[10px] text-stone-400">
                      due on {emp.salaryDateDisplay}
                    </p>
                  </div>
                  <span className="font-black text-stone-900">
                    ₹{emp.payable.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <button
              id="view-staff-salary-upcoming-btn"
              onClick={() => onNavigate('salary')}
              className="w-full py-2 bg-[#B45309] hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-colors text-center"
            >
              View Staff Salary
            </button>
          </div>
        </div>
      </div>

      {/* Hourly Sales Chart */}
      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Sales Velocity</h3>
            <p className="text-xs text-stone-400">Hourly operational transaction volume</p>
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="text-xs font-bold text-[#B45309] uppercase tracking-wider hover:underline flex items-center space-x-1"
          >
            <span>Sales Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-44 sm:h-48 flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-1">
          {hourlyLabels.map((hour, idx) => {
            const amount = hourlySales[idx];
            const heightPercent = Math.round((amount / maxSaleHour) * 100);

            return (
              <div key={hour} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <div className="absolute -top-7 hidden group-hover:flex bg-stone-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md z-10">
                  ₹{amount}
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full bg-[#B45309] group-hover:bg-amber-800 rounded-t-md transition-all duration-300"
                />
                <span className="text-[10px] sm:text-xs text-stone-400 font-medium mt-2 whitespace-nowrap">
                  {hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
