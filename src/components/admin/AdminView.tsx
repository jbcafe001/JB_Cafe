import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminSales } from './AdminSales';
import { AdminExpenses } from './AdminExpenses';
import { AdminStock } from './AdminStock';
import { AdminRawMaterial } from './AdminRawMaterial';
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
  Boxes,
} from 'lucide-react';

type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'sales'
  | 'expenses'
  | 'stock'
  | 'raw-material'
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

  const NAV_ITEMS: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    activeClass: string;
    iconClass: string;
    badgeClass: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      activeClass: 'bg-amber-100/70 text-amber-900 border-amber-200/90 shadow-2xs',
      iconClass: 'text-amber-700',
      badgeClass: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
      activeClass: 'bg-sky-100/70 text-sky-900 border-sky-200/90 shadow-2xs',
      iconClass: 'text-sky-700',
      badgeClass: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: <TrendingUp className="w-4 h-4" />,
      activeClass: 'bg-emerald-100/70 text-emerald-900 border-emerald-200/90 shadow-2xs',
      iconClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: <Receipt className="w-4 h-4" />,
      activeClass: 'bg-rose-100/70 text-rose-900 border-rose-200/90 shadow-2xs',
      iconClass: 'text-rose-700',
      badgeClass: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      activeClass: 'bg-orange-100/70 text-orange-900 border-orange-200/90 shadow-2xs',
      iconClass: 'text-orange-700',
      badgeClass: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'raw-material',
      label: 'Raw Material',
      icon: <Boxes className="w-4 h-4" />,
      activeClass: 'bg-indigo-100/70 text-indigo-900 border-indigo-200/90 shadow-2xs',
      iconClass: 'text-indigo-700',
      badgeClass: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: <UtensilsCrossed className="w-4 h-4" />,
      activeClass: 'bg-yellow-100/70 text-yellow-900 border-yellow-200/90 shadow-2xs',
      iconClass: 'text-yellow-700',
      badgeClass: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'tables',
      label: 'Tables',
      icon: <Grid className="w-4 h-4" />,
      activeClass: 'bg-teal-100/70 text-teal-900 border-teal-200/90 shadow-2xs',
      iconClass: 'text-teal-700',
      badgeClass: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'salary',
      label: 'Staff Salary',
      icon: <Wallet className="w-4 h-4" />,
      activeClass: 'bg-purple-100/70 text-purple-900 border-purple-200/90 shadow-2xs',
      iconClass: 'text-purple-700',
      badgeClass: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'users',
      label: 'Users',
      icon: <Users className="w-4 h-4" />,
      activeClass: 'bg-cyan-100/70 text-cyan-900 border-cyan-200/90 shadow-2xs',
      iconClass: 'text-cyan-700',
      badgeClass: 'bg-cyan-100 text-cyan-800',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-4 h-4" />,
      activeClass: 'bg-violet-100/70 text-violet-900 border-violet-200/90 shadow-2xs',
      iconClass: 'text-violet-700',
      badgeClass: 'bg-violet-100 text-violet-800',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      activeClass: 'bg-stone-200/70 text-stone-900 border-stone-300 shadow-2xs',
      iconClass: 'text-stone-700',
      badgeClass: 'bg-stone-200 text-stone-800',
    },
  ];

  const handleTabSelect = (tab: AdminTab) => {
    setActiveTab(tab);
    localStorage.setItem('adminActiveTab', tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row select-none">
      {/* Mobile Top bar */}
      <div className="md:hidden bg-white border-b border-stone-200 text-stone-900 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-full bg-white border border-[#EFE7DA] overflow-hidden flex items-center justify-center shadow-xs shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-stone-900">JB PAVILION & CAFE</span>
            <span className="text-[10px] text-amber-700/80 block -mt-0.5 uppercase tracking-widest font-bold">Artisanal Cafe Central</span>
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
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/50 hidden md:block">
          <div className="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest">Navigation</div>
          <div className="text-xs font-semibold text-stone-800 mt-0.5">
            {currentRole === 'admin_kunafa' ? (
              <span className="flex items-center space-x-1">
                <span>KUNAFA Admin</span>
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold border border-amber-200">KUNAFA</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-stone-900">Admin Management</span>
              </span>
            )}
          </div>
        </div>

        {/* 12 Navigation Items with distinctive pastel accents */}
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs tracking-wide transition-all border ${
                  isActive
                    ? `${item.activeClass} font-bold`
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? item.iconClass : 'text-stone-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? `${item.badgeClass} border border-current/20`
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
        <div className="p-3 border-t border-stone-200 bg-stone-50/60">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 via-orange-200 to-amber-100 border border-amber-300/80 text-amber-950 font-black flex items-center justify-center text-xs shadow-2xs">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-stone-900 leading-tight">
                  {currentUser?.name || 'Administrator'}
                </p>
                <span className="text-[10px] text-stone-400">{currentUser?.email || 'admin@cafe.demo'}</span>
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
      <main className="flex-1 px-3 py-4 sm:p-8 overflow-y-auto min-w-0">
        {activeTab === 'dashboard' && <AdminDashboard onNavigate={(t) => setActiveTab(t as AdminTab)} />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'sales' && <AdminSales />}
        {activeTab === 'expenses' && <AdminExpenses />}
        {activeTab === 'stock' && <AdminStock />}
        {activeTab === 'raw-material' && <AdminRawMaterial />}
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
