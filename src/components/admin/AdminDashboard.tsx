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
import { getCafeBusinessDate, getCafeYesterdayDate } from '../../utils/dateUtils';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { filteredOrders: allOrders, menuItems, expenses, stockItems, tables, staffMembers, upaadRecords, salaryHistory, currentRole } = useCafe();

  const [brandFilter, setBrandFilter] = useState<'All' | 'JB Cafe' | 'KUNAFA'>(
    currentRole === 'admin_kunafa' ? 'KUNAFA' : 'All'
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Filter orders by brand
  const orders = React.useMemo(() => {
    if (brandFilter === 'All') return allOrders;
    const kunafaItemNames = new Set(menuItems.filter(m => m.brand === 'KUNAFA').map(m => m.name));
    return allOrders.filter(o => {
      const hasKunafa = o.items.some(i => kunafaItemNames.has(i.name));
      return brandFilter === 'KUNAFA' ? hasKunafa : !hasKunafa;
    });
  }, [allOrders, brandFilter, menuItems]);

  const todayBusinessDate = getCafeBusinessDate();
  // When it is after 5 PM, orders placed during this calendar day (before 5 PM)
  // belong to yesterday's business date, but orders placed AFTER 5 PM today belong
  // to today's business date (i.e. tomorrow's calendar date per the date utility).
  // So we need to also include orders whose o.date equals the current calendar day.
  const calendarToday = new Date();
  const calendarTodayStr = `${calendarToday.getFullYear()}-${String(calendarToday.getMonth() + 1).padStart(2, '0')}-${String(calendarToday.getDate()).padStart(2, '0')}`;

  // Completed orders for current cafe business cycle (5 PM to 5 AM)
  // Include both todayBusinessDate AND calendarToday so that orders placed any time
  // today (before AND after the 5 PM cutoff) show on today's dashboard.
  const completedOrders = orders.filter((o) =>
    o.status === 'completed' &&
    (!o.date || o.date === todayBusinessDate || o.date === calendarTodayStr)
  );

  // Refined total sales based on brand filter (only summing the relevant items)
  const todaySales = completedOrders.reduce((sum, o) => {
    if (brandFilter === 'All') return sum + o.total;

    if (brandFilter === 'KUNAFA') {
      const kunafaItemNames = new Set(menuItems.filter(m => m.brand === 'KUNAFA').map(m => m.name));
      return sum + o.items.filter(i => kunafaItemNames.has(i.name)).reduce((s, i) => s + (i.price * i.quantity), 0);
    } else {
      const jbItemNames = new Set(menuItems.filter(m => m.brand === 'JB Cafe').map(m => m.name));
      return sum + o.items.filter(i => jbItemNames.has(i.name)).reduce((s, i) => s + (i.price * i.quantity), 0);
    }
  }, 0);

  const activeOrders = orders.filter(
    (o) => o.status === 'new' || o.status === 'preparing' || o.status === 'ready' || o.status === 'served'
  );
  const activeOrdersCount = activeOrders.length;
  const todayOrdersCount = completedOrders.length;
  const avgOrderValue = todayOrdersCount > 0 ? Math.round(todaySales / todayOrdersCount) : 0;

  // Today's expenses for current cafe business cycle
  const todayExpenses = expenses.filter(e => !e.date || e.date === todayBusinessDate || e.date === calendarTodayStr).reduce((sum, e) => sum + e.amount, 0);
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

  // Hourly Sales Data for Chart (8 AM to 8 PM)
  const hourlyLabels = [
    '8 AM',
    '9 AM',
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

  const hourlySales = new Array(13).fill(0);
  completedOrders.forEach((o) => {
    const timeStr = o.completedAt || o.createdAt;
    if (!timeStr) return;

    let hour = -1;
    if (timeStr.includes('T') || timeStr.includes('-')) {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) hour = d.getHours();
    } else {
      const match = timeStr.match(/(\d+):/);
      if (match) {
        let h = parseInt(match[1], 10);
        if (timeStr.toUpperCase().includes('PM') && h < 12) h += 12;
        if (timeStr.toUpperCase().includes('AM') && h === 12) h = 0;
        hour = h;
      }
    }

    if (hour >= 8 && hour <= 20) {
      // Extract brand-specific total if needed, or use order total
      let salesToAdd = o.total;

      // If filtering by KUNAFA, only sum KUNAFA items
      if (brandFilter === 'KUNAFA') {
        const kunafaItemNames = new Set(menuItems.filter(m => m.brand === 'KUNAFA').map(m => m.name));
        salesToAdd = o.items.filter(i => kunafaItemNames.has(i.name)).reduce((sum, i) => sum + (i.price * i.quantity), 0);
      } else if (brandFilter === 'JB Cafe') {
        const jbItemNames = new Set(menuItems.filter(m => m.brand === 'JB Cafe').map(m => m.name));
        salesToAdd = o.items.filter(i => jbItemNames.has(i.name)).reduce((sum, i) => sum + (i.price * i.quantity), 0);
      }

      hourlySales[hour - 8] += salesToAdd;
    }
  });
  const maxSaleHour = Math.max(...hourlySales, 1);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Dashboard Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">DASHBOARD</h2>
          <p className="text-xs text-stone-500">Overview of today's cafe operations and metrics</p>
        </div>

        {/* Brand Filter */}
        {currentRole !== 'admin_kunafa' && (
          <div className="flex bg-stone-100 p-1 rounded-xl w-full sm:w-auto">
            {(['All', 'JB Cafe', 'KUNAFA'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBrandFilter(b)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${brandFilter === b
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

      {/* Top Section: Multi-colored Pastel Cafe Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Today's Sales - Matcha / Fresh Sage */}
        <div className="col-span-1 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs card-interactive animate-page-enter stagger-1 group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Today's Sales</p>
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-stone-900">₹{todaySales.toLocaleString()}</p>
          <p className="text-xs text-emerald-700/90 font-medium mt-1">Based on completed orders</p>
        </div>

        {/* Active Orders - Sky Breeze */}
        <div className="col-span-1 bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-white p-5 rounded-2xl border border-sky-200/80 shadow-2xs card-interactive animate-page-enter stagger-2 group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">Active Orders</p>
            <div className="w-7 h-7 rounded-lg bg-sky-100/80 flex items-center justify-center text-sky-700 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-stone-900">{activeOrdersCount}</p>
          <p className="text-xs text-sky-700/90 font-medium mt-1">Orders in progress</p>
        </div>

        {/* Estimated Net Profit - Honey Caramel */}
        <div className="col-span-1 bg-gradient-to-br from-amber-50/80 via-yellow-50/40 to-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs card-interactive animate-page-enter stagger-3 group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Est. Net Profit</p>
            <div className="w-7 h-7 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-700 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black mt-2 ${estimatedNet < 0 ? 'text-rose-600' : 'text-stone-900'}`}>
            {estimatedNet < 0 ? '-' : ''}₹{Math.abs(estimatedNet).toLocaleString()}
          </p>
          <p className="text-xs text-amber-700/90 font-medium mt-1">Expenses: ₹{todayExpenses.toLocaleString()}</p>
        </div>

        {/* Stock Alert - Apricot Peach */}
        <div className="col-span-1 bg-gradient-to-br from-rose-50/80 via-orange-50/40 to-white p-5 rounded-2xl border border-rose-200/80 shadow-2xs card-interactive animate-page-enter stagger-4 group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Stock Alert</p>
            <div className="w-7 h-7 rounded-lg bg-rose-100/80 flex items-center justify-center text-rose-700 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black mt-2 text-stone-900">
            {lowStockItems.length} {lowStockItems.length === 1 ? 'Item' : 'Items'}
          </p>
          {lowStockItems.length > 0 ? (
            <p className="text-xs text-rose-600 font-bold mt-1">Action Required</p>
          ) : (
            <p className="text-xs text-emerald-600 font-bold mt-1">All Good</p>
          )}
        </div>
      </div>

      {/* Main Grid: Orders Table + Right Side Panels */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left Column (Col 8) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {/* Recent Live Orders Table */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-[#FAF7F2]/60">
              <h2 className="font-extrabold text-stone-900 text-sm">Recent Live Orders</h2>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 uppercase tracking-wider hover:underline"
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
                  {paginatedOrders.map((ord) => {
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
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isKunafa
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

            <div className="p-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50 mt-auto">
              <span className="text-xs text-stone-500 font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, orders.length)} of {orders.length} orders
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-bold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 text-xs font-bold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* 17. Upcoming Salaries Section (Moved here from right column) */}
          {currentRole !== 'admin_kunafa' && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-sm">Upcoming Salaries</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  30 Sep Due
                </span>
              </div>

              <div className="space-y-2 mt-3">
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
                className="mt-auto w-full py-2 bg-[#B45309] hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-colors text-center"
              >
                View Staff Salary
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Table Availability + Dark Stock Alert Card (Col 4) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Table Availability Card */}
          {currentRole !== 'admin_kunafa' && (
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
          )}

          {/* Light Cafe Stock Inventory Alert Card */}
          <div className={`bg-gradient-to-br from-amber-50/90 via-[#FFFDF7] to-orange-50/60 text-stone-800 p-5 rounded-2xl border border-amber-200/80 shadow-2xs flex flex-col ${currentRole === 'admin_kunafa' ? 'flex-1' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="font-extrabold text-stone-900 text-sm">Stock Inventory Alert</h2>
              </div>
              <button
                onClick={() => onNavigate('stock')}
                className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg uppercase tracking-wider transition-colors"
              >
                Restock
              </button>
            </div>

            <div className="space-y-3 mt-auto">
              {stockItems.slice(0, 3).map((item) => {
                const isVeryLow = item.available <= item.minThreshold;

                return (
                  <div key={item.id} className="space-y-1.5 p-2.5 bg-white/80 rounded-xl border border-amber-100/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-700 font-semibold">{item.name} ({item.unit})</span>
                      <span className={`${isVeryLow ? 'text-rose-600' : 'text-amber-800'} font-black`}>
                        {item.available} {item.unit}
                      </span>
                    </div>
                    <div className="w-full bg-amber-100/70 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.max(10, (item.available / (item.minThreshold * 2 || 10)) * 100))}%` }}
                        className={`h-full ${isVeryLow ? 'bg-rose-500' : 'bg-amber-500'} rounded-full transition-all duration-300`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 16. Staff Salary Summary Card (Section 16) */}
          {currentRole !== 'admin_kunafa' && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col flex-1">
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

              <div className="mt-4 text-xs divide-y divide-stone-100">
                <div className="flex justify-between items-center pt-2 pb-1 text-stone-600">
                  <span>Total Monthly Salary</span>
                  <span className="font-bold text-stone-900">₹{totalMonthlySalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 pb-1 text-amber-700">
                  <span>Upaad Given</span>
                  <span className="font-bold">₹{totalUpaadGiven.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 pb-1 text-stone-700">
                  <span>Salary Remaining</span>
                  <span className="font-bold text-stone-900">₹{totalSalaryDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 pb-1 text-emerald-700">
                  <span>Salary Paid</span>
                  <span className="font-bold">₹{totalSalaryPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 pb-1 font-bold text-amber-900">
                  <span>Salary Pending</span>
                  <span className="text-amber-800">₹{totalSalaryDue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Salaries was moved to the left column */}
        </div>
      </div>

      {/* Hourly Sales Chart */}
      <div className="bg-gradient-to-br from-white via-[#FCFAF5] to-amber-50/20 border border-stone-200/90 shadow-2xs rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">Sales Velocity</h3>
            <p className="text-xs text-stone-500">Hourly operational transaction volume</p>
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 uppercase tracking-wider hover:underline flex items-center space-x-1"
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
              <div key={hour} className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer">
                <div className="absolute -top-7 hidden group-hover:flex bg-amber-950/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md z-10 animate-modal-spring pointer-events-none">
                  ₹{amount}
                </div>
                <div
                  style={{
                    height: `${heightPercent}%`,
                    animationDelay: `${idx * 45}ms`
                  }}
                  className="w-full bg-gradient-to-t from-amber-500 via-orange-400 to-amber-300 group-hover:from-amber-600 group-hover:to-orange-500 rounded-t-lg transition-all duration-300 shadow-2xs animate-bar-grow group-hover:scale-y-105"
                />
                <span className="text-[10px] sm:text-xs text-stone-400 font-medium mt-2 whitespace-nowrap group-hover:text-amber-800 transition-colors">
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
