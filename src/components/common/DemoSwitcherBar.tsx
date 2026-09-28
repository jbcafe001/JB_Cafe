import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { UserRole } from '../../types';
import {
  Smartphone,
  ChefHat,
  LayoutDashboard,
  RotateCcw,
  BookOpen,
  Bell,
  X,
  CheckCircle2,
  Monitor,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const DemoSwitcherBar: React.FC = () => {
  const {
    currentRole,
    currentUser,
    switchRole,
    resetDemoData,
    notifications,
    dismissNotification,
    isMobileFrame,
    setIsMobileFrame,
  } = useCafe();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header
        id="demo-switcher-header"
        className="sticky top-0 z-40 bg-white text-[#1C1917] border-b border-stone-200 shadow-xs text-xs sm:text-sm select-none"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Demo Pill */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#B45309] rounded-lg flex items-center justify-center text-white shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-stone-900 leading-none">
                BREW & BITE
              </h1>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                Café Management
              </p>
            </div>
          </div>

          {/* Clean Minimalism Pill Role Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-full border border-stone-200 shadow-2xs">
            <button
              id="role-switch-waiter-btn"
              onClick={() => switchRole('waiter')}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentRole === 'waiter'
                  ? 'bg-white shadow-sm border border-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Waiter</span>
              <span className="hidden md:inline text-stone-400 text-[11px]">(Mobile)</span>
            </button>

            <button
              id="role-switch-kitchen-btn"
              onClick={() => switchRole('kitchen')}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentRole === 'kitchen'
                  ? 'bg-white shadow-sm border border-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Kitchen</span>
              <span className="hidden md:inline text-stone-400 text-[11px]">(KDS)</span>
            </button>

            <button
              id="role-switch-admin-btn"
              onClick={() => switchRole('admin')}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentRole === 'admin'
                  ? 'bg-white shadow-sm border border-stone-200 text-stone-900 font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Admin</span>
              <span className="hidden md:inline text-stone-400 text-[11px]">(View)</span>
            </button>
          </div>

          {/* Right Action Tools & User Profile */}
          <div className="flex items-center space-x-2">
            {/* If Waiter, offer phone frame toggle */}
            {currentRole === 'waiter' && (
              <button
                id="toggle-mobile-frame-btn"
                onClick={() => setIsMobileFrame(!isMobileFrame)}
                title={isMobileFrame ? 'Switch to Full Width' : 'Simulate Mobile Device Frame'}
                className={`hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  isMobileFrame
                    ? 'bg-stone-50 border-stone-300 text-[#B45309]'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                {isMobileFrame ? (
                  <>
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Full Width</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Phone Frame</span>
                  </>
                )}
              </button>
            )}

            {/* Step-by-Step Demo Flow Guide */}
            <button
              id="demo-walkthrough-guide-btn"
              onClick={() => setShowGuide(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-stone-50 hover:bg-stone-100 text-[#B45309] border border-stone-200 font-semibold text-xs transition-colors shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#B45309]" />
              <span className="hidden sm:inline">11-Step Flow</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="demo-notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B45309] text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl p-4 z-50 text-stone-900">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center space-x-2 font-bold text-xs text-stone-800 uppercase tracking-wider">
                      <Bell className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>Live Café Events</span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-stone-400 hover:text-stone-600 p-1 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-stone-400 text-xs py-4 text-center">
                        No recent notifications.
                      </p>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          className="py-2.5 flex items-start justify-between gap-2 text-xs"
                        >
                          <div>
                            <p className="text-stone-800 font-medium">{notif.message}</p>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {notif.timestamp}
                            </span>
                          </div>
                          <button
                            onClick={() => dismissNotification(notif.id)}
                            className="text-stone-400 hover:text-stone-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Demo Data Button */}
            <button
              id="reset-demo-data-btn"
              onClick={() => {
                if (window.confirm('Reset café data back to initial demo state?')) {
                  resetDemoData();
                }
              }}
              title="Reset Demo Data"
              className="p-2 rounded-full border border-stone-200 bg-stone-50 hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Clean User Profile Badge */}
            <div className="hidden md:flex items-center gap-3 pl-2 border-l border-stone-200">
              <div className="text-right">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                  {currentRole === 'admin' ? 'Admin Panel' : currentRole === 'kitchen' ? 'Kitchen KDS' : 'Waiter Service'}
                </p>
                <p className="text-xs font-medium text-stone-700 leading-tight mt-0.5">
                  {currentUser?.name || 'Staff User'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center border border-stone-300 text-stone-800 font-bold text-xs">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 11-Step Interactive Walkthrough Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#B45309] flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Brew & Bite 11-Step Demo Walkthrough
                  </h3>
                  <p className="text-stone-400 text-xs">
                    Experience the complete synchronized café flow
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 text-xs sm:text-sm text-stone-700">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs">
                💡 <strong className="text-[#B45309]">How to test:</strong> Use the top bar pill buttons (
                <span className="font-bold text-stone-900">Waiter</span>,{' '}
                <span className="font-bold text-stone-900">Kitchen</span>,{' '}
                <span className="font-bold text-stone-900">Admin</span>) anytime to jump between
                roles and watch real-time updates!
              </div>

              <ol className="space-y-3">
                <li className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/60 border border-stone-200/80">
                  <span className="w-6 h-6 rounded-full bg-[#B45309] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    1-4
                  </span>
                  <div>
                    <strong className="text-stone-900 block">Step 1 to 4: Waiter takes order</strong>
                    <span className="text-stone-500 text-xs">
                      Switch to <strong>Waiter</strong> role → Tap <strong>Table 04</strong> → Add{' '}
                      <strong>2 × Cappuccino</strong> and <strong>1 × Veg Sandwich</strong> → Tap{' '}
                      <strong>"SEND TO KITCHEN"</strong>.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/60 border border-stone-200/80">
                  <span className="w-6 h-6 rounded-full bg-[#B45309] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    5-7
                  </span>
                  <div>
                    <strong className="text-stone-900 block">Step 5 to 7: Kitchen prepares</strong>
                    <span className="text-stone-500 text-xs">
                      Switch to <strong>Kitchen</strong> role → See order under <strong>New Orders</strong> → Click{' '}
                      <strong>"START PREPARING"</strong> → Click <strong>"MARK READY"</strong>.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/60 border border-stone-200/80">
                  <span className="w-6 h-6 rounded-full bg-[#B45309] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    8-10
                  </span>
                  <div>
                    <strong className="text-stone-900 block">Step 8 to 10: Waiter serves & settles</strong>
                    <span className="text-stone-500 text-xs">
                      Switch to <strong>Waiter</strong> role → Notice Table 04 is{' '}
                      <span className="text-green-700 font-semibold uppercase">ORDER READY</span> → Tap order → Click{' '}
                      <strong>"COMPLETE ORDER"</strong> → Select <strong>UPI</strong>.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/60 border border-stone-200/80">
                  <span className="w-6 h-6 rounded-full bg-[#B45309] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    11
                  </span>
                  <div>
                    <strong className="text-stone-900 block">Step 11: Admin dashboard reflects automatically</strong>
                    <span className="text-stone-500 text-xs">
                      Switch to <strong>Admin</strong> role → Watch Today's Sales (+₹440), Order Count (+1), UPI
                      Sales breakdown, and automatic ingredient stock deduction (Coffee Beans -36g, Milk -300ml,
                      Bread -0.25 packs)!
                    </span>
                  </div>
                </li>
              </ol>
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between">
              <span className="text-xs text-stone-500">Current Role: <span className="font-semibold text-[#B45309] capitalize">{currentRole} ({currentUser?.name})</span></span>
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 bg-[#B45309] hover:bg-amber-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
              >
                Got It, Let's Try!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
