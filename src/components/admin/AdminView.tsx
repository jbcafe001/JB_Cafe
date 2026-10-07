import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminSales } from './AdminSales';
import { AdminExpenses } from './AdminExpenses';
import { AdminStock } from './AdminStock';
import { AdminMenu } from './AdminMenu';
import { AdminTables } from './AdminTables';
import { AdminSalary } from './AdminSalary';
import { AdminUsers } from './AdminUsers';
import { AdminReports } from './AdminReports';
import { AdminSettings } from './AdminSettings';
import {
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Receipt,
  Package,
  UtensilsCrossed,
  Grid,
  Wallet,
  Users,
  BarChart3,
  Settings,
  Coffee,
  Menu as MenuIcon,
  X,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react';

type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'sales'
  | 'expenses'
  | 'stock'
  | 'menu'
  | 'tables'
  | 'salary'
  | 'users'
  | 'reports'
  | 'settings';

export const AdminView: React.FC = () => {
  const { currentUser, logout, stockItems, orders, filteredOrders, currentRole, showConfirm } = useCafe();
  const [activeTab, setActiveTab] = useState<AdminTab>(
    () => (localStorage.getItem('adminActiveTab') as AdminTab) || 'dashboard'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Badge indicators
  const lowStockCount = stockItems.filter((s) => s.status === 'low' || s.status === 'out').length;
  const activeOrdersCount = filteredOrders.filter(
    (o) => o.status === 'new' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    { id: 'sales', label: 'Sales', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt className="w-4 h-4" /> },
    {
      id: 'stock',
      label: 'Stock',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    { id: 'menu', label: 'Menu', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'tables', label: 'Tables', icon: <Grid className="w-4 h-4" /> },
    { id: 'salary', label: 'Staff Salary', icon: <Wallet className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleTabSelect = (tab: AdminTab) => {
    setActiveTab(tab);
    localStorage.setItem('adminActiveTab', tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col md:flex-row select-none">
      {/* Mobile Top bar */}
      <div className="md:hidden bg-white border-b border-stone-200 text-stone-900 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#B45309] flex items-center justify-center text-white shadow-xs">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-stone-900">BREW & BITE</span>
            <span className="text-[10px] text-stone-400 block -mt-0.5 uppercase tracking-widest font-bold">Admin Central</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-700"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Clean Minimalism Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-[100dvh] md:h-screen w-60 bg-white text-stone-700 border-r border-stone-200 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-xs md:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top category label */}
        <div className="px-5 py-4 border-b border-stone-100 hidden md:block">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Menu</div>
          <div className="text-xs font-semibold text-stone-800 mt-0.5">
            {currentRole === 'admin_kunafa' ? (
              <span className="flex items-center space-x-1">
                <span>KUNAFA Admin</span>
                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">KUNAFA</span>
              </span>
            ) : 'Admin Management'}
          </div>
        </div>

        {/* 10 Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            if (currentRole === 'admin_kunafa' && (item.id === 'tables' || item.id === 'salary')) {
              return null;
            }

            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => handleTabSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs tracking-wide transition-all ${
                  isActive
                    ? 'bg-stone-50 border border-stone-200 text-[#B45309] font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-[#B45309]' : 'text-stone-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-white border border-stone-200 text-[#B45309]'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile & shift logout */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/50">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 text-stone-800 font-bold flex items-center justify-center text-xs">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-stone-900 leading-tight">
                  {currentUser?.name || 'Administrator'}
                </p>
                <span className="text-[10px] text-stone-400">admin@cafe.demo</span>
              </div>
            </div>

            <button
              onClick={() => {
                showConfirm(
                  'Logout',
                  'Are you sure you want to sign out?',
                  () => logout(),
                  { isDestructive: true, confirmText: 'Sign Out' }
                );
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
        {activeTab === 'dashboard' && <AdminDashboard onNavigate={(t) => setActiveTab(t as AdminTab)} />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'sales' && <AdminSales />}
        {activeTab === 'expenses' && <AdminExpenses />}
        {activeTab === 'stock' && <AdminStock />}
        {activeTab === 'menu' && <AdminMenu />}
        {activeTab === 'tables' && currentRole !== 'admin_kunafa' && <AdminTables />}
        {activeTab === 'salary' && currentRole !== 'admin_kunafa' && <AdminSalary />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'reports' && <AdminReports />}
        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};
