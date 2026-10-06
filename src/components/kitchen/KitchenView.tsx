import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order, OrderStatus } from '../../types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  AlertCircle,
  Bell,
  Check,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Utensils,
  LogOut,
  Coffee,
} from 'lucide-react';

type KitchenTab = 'new' | 'preparing' | 'ready' | 'served';

export const KitchenView: React.FC = () => {
  const { orders, startPreparingOrder, markOrderReady, incrementItemPrepared, logout, currentUser, settings, showConfirm } = useCafe();
  const [activeTab, setActiveTab] = useState<KitchenTab>('new');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('jb_cafe_kds_sound') !== 'false';
  });

  // Keep localStorage in sync when soundEnabled changes
  useEffect(() => {
    localStorage.setItem('jb_cafe_kds_sound', String(soundEnabled));
  }, [soundEnabled]);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAllItemsServed = (o: Order) => o.items.length > 0 && o.items.every(i => i.served);

  const newOrders = orders.filter((o) => o.status === 'new' && !isAllItemsServed(o));
  const preparingOrders = orders.filter((o) => o.status === 'preparing' && !isAllItemsServed(o) && o.items.some(i => (i.prepared || 0) < i.quantity));
  const readyOrders = orders.filter((o) => (o.status === 'ready' || (o.status === 'preparing' && o.items.some(i => (i.prepared || 0) > (i.servedCount || 0)))) && !isAllItemsServed(o));
  const servedOrders = orders.filter((o) => o.status === 'served' || isAllItemsServed(o) || o.items.some(i => (i.servedCount || 0) > 0)).slice(0, 15);

  const displayedOrders =
    activeTab === 'new'
      ? newOrders
      : activeTab === 'preparing'
        ? preparingOrders
        : activeTab === 'ready'
          ? readyOrders
          : servedOrders;

  const cafeName = settings?.cafeName || 'BREW & BITE Café';

  const initials = (currentUser?.name || 'Cook')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C1917] flex flex-col select-none">
      {/* Fixed Header & Tabs Container */}
      <div className="sticky top-0 z-20 flex flex-col w-full shadow-2xs">
        {/* Custom Kitchen Header */}
        <header className="bg-[#B45309] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          
          {/* Left: Cafe Name & Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner shrink-0">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-tight">
                {cafeName}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] sm:text-xs text-white/80 font-medium tracking-wide uppercase">
                  Kitchen Display (KDS)
                </span>
                <span className="bg-white/20 text-white border border-white/30 text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Clock, Profile */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3 sm:space-x-4">
            {/* KDS Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  soundEnabled
                    ? 'bg-white text-[#B45309] border-transparent'
                    : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20 hover:text-white'
                }`}
                title="Toggle Kitchen Chime"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <div className="bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/20 font-mono text-xs font-bold text-white hidden sm:block">
                {currentTime}
              </div>
            </div>

            <div className="w-px h-6 bg-white/20 hidden sm:block"></div>

            {/* Profile Avatar & Name */}
            <div className="flex items-center space-x-2.5">
              <span className="text-sm font-medium hidden sm:inline-block">
                Hello, {currentUser?.name || 'Cook'}
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#B45309] font-black flex items-center justify-center text-xs sm:text-sm shadow-xs border-2 border-[#B45309] shrink-0">
                {initials}
              </div>
              <button
                onClick={() => {
                  showConfirm(
                    'Logout',
                    'Are you sure you want to log out?',
                    () => logout(),
                    { isDestructive: true, confirmText: 'Logout' }
                  );
                }}
                className="p-1.5 rounded-lg text-white/60 hover:text-white bg-white/10 border border-white/20 hover:bg-red-500 hover:border-red-500 transition-colors ml-1"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Status Bar / Filter Tabs */}
        <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-2 flex items-center space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar">
          <button
            id="kds-tab-new"
            onClick={() => setActiveTab('new')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${activeTab === 'new'
                ? 'bg-[#B45309] text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>NEW ORDERS</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">
              {newOrders.length}
            </span>
          </button>

          <button
            id="kds-tab-preparing"
            onClick={() => setActiveTab('preparing')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${activeTab === 'preparing'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
              }`}
          >
            <Flame className="w-4 h-4" />
            <span>PREPARING</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">
              {preparingOrders.length}
            </span>
          </button>

          <button
            id="kds-tab-ready"
            onClick={() => setActiveTab('ready')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${activeTab === 'ready'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>READY</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">
              {readyOrders.length}
            </span>
          </button>

          <button
            id="kds-tab-served"
            onClick={() => setActiveTab('served')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all ${activeTab === 'served'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
              }`}
          >
            <Utensils className="w-4 h-4" />
            <span>SERVED</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">
              {servedOrders.length}
            </span>
          </button>

        </div>
      </div>

      {/* Main KDS Grid */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] text-stone-400 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-400 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold text-stone-700">No orders under {activeTab.toUpperCase()}</p>
            <p className="text-xs text-stone-500 max-w-sm text-center">
              Incoming orders from waiters will automatically show up here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {displayedOrders.map((order) => {
              const isAllItemsServed = order.items.length > 0 && order.items.every(i => i.served);
              const isServed = order.status === 'served' || isAllItemsServed;
              const isNew = order.status === 'new' && !isAllItemsServed;
              const isPrep = order.status === 'preparing' && activeTab === 'preparing' && !isAllItemsServed;
              const isRdy = (order.status === 'ready' || (order.status === 'preparing' && activeTab === 'ready')) && !isAllItemsServed;

              return (
                <div
                  key={order.id}
                  id={`kds-card-${order.orderNumber.replace('#', '')}`}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-all ${isNew
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : isPrep
                        ? 'border-stone-800 ring-2 ring-stone-800/15'
                        : isRdy
                          ? 'border-emerald-500 ring-2 ring-emerald-500/25'
                          : 'border-stone-200 opacity-80'
                    }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-[#B45309] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-stone-400">{order.createdAt}</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-stone-900 mt-1">
                          {order.tableNumber}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                          Waiter
                        </span>
                        <span className="font-bold text-sm text-stone-800">
                          {order.waiterName}
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="py-4">
                      {Array.from(new Set(order.items.map(i => i.batch || 1))).sort((a: number, b: number) => a - b).map((batchNum, batchIdx) => (
                        <div key={`batch-${batchNum}`} className={batchIdx > 0 ? "mt-4" : ""}>
                          {batchIdx > 0 && (
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="h-px bg-amber-200 flex-1"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shadow-sm">
                                NEW ADDITION {batchIdx}
                              </span>
                              <div className="h-px bg-amber-200 flex-1"></div>
                            </div>
                          )}
                          <div className="space-y-2.5">
                            {order.items.map((item, originalIdx) => ({ item, originalIdx }))
                              .filter(x => (x.item.batch || 1) === batchNum)
                              .map(({ item, originalIdx }) => {
                                const preparedCount = item.prepared || 0;
                                const totalCount = item.quantity;
                                const unservedReady = preparedCount > (item.servedCount || 0) ? preparedCount - (item.servedCount || 0) : 0;
                                
                                // In the 'served' tab, if it's partially served, we only want to show the items that have SOME served count.
                                if (activeTab === 'served' && (item.servedCount || 0) === 0 && order.status !== 'served' && !isAllItemsServed) return null;
                                // In the 'ready' tab, we only want to show the items that have unserved prepared count.
                                if (activeTab === 'ready' && unservedReady === 0 && order.status !== 'ready') return null;
                                // In the 'preparing' tab, we might only want to show items that are not fully prepared.
                                if (activeTab === 'preparing' && preparedCount >= totalCount) return null;

                                const displayCount = 
                                  (activeTab === 'ready' && order.status !== 'ready' && unservedReady > 0 && preparedCount < totalCount) 
                                    ? unservedReady 
                                    : (activeTab === 'served' && (item.servedCount || 0) > 0 && (item.servedCount || 0) < totalCount) 
                                      ? item.servedCount 
                                      : totalCount;

                                const isItemFullyServedOrPartiallyServedInServedTab = item.served || (activeTab === 'served' && (item.servedCount || 0) > 0);

                                return (
                                  <div
                                    key={originalIdx}
                                    className="flex items-start justify-between text-sm sm:text-base gap-2 mb-2"
                                  >
                                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                      <span className={`shrink-0 w-8 h-8 rounded-lg border font-bold flex items-center justify-center text-xs ${isItemFullyServedOrPartiallyServedInServedTab ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-stone-100 border-stone-200 text-stone-800'}`}>
                                        {displayCount}×
                                      </span>
                                      <div className="font-bold flex flex-wrap items-center gap-2 flex-1 pt-1">
                                        <span className={isItemFullyServedOrPartiallyServedInServedTab ? 'text-stone-400 line-through decoration-stone-300' : 'text-stone-900'}>{item.name}</span>
                                        {isItemFullyServedOrPartiallyServedInServedTab && (
                                          <span className="shrink-0 whitespace-nowrap text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-200">
                                            <Check className="w-3 h-3" />
                                            <span>Already Served</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      {item.notes && (
                                        <span className="shrink-0 text-xs text-[#B45309] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 mt-0.5">
                                          {item.notes}
                                        </span>
                                      )}
                                      {activeTab === 'preparing' && (
                                        <button
                                          onClick={() => incrementItemPrepared(order.id, originalIdx)}
                                          className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-md font-extrabold tracking-wide hover:bg-emerald-200 transition-colors shadow-sm flex items-center space-x-1 whitespace-nowrap"
                                        >
                                          <span>PREPARED</span>
                                          <span className="bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-sm">{preparedCount}/{totalCount}</span>
                                        </button>
                                      )}
                                      {activeTab === 'ready' && unservedReady > 0 && preparedCount < totalCount && (
                                        <span className="text-[10px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-1 rounded-md font-bold">
                                          {unservedReady}/{totalCount} READY
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* General Ticket Note if provided */}
                      {order.notes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[#B45309] text-xs">
                          <span className="font-bold uppercase tracking-wide">Note: </span>
                          <span className="font-medium">{order.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-3 border-t border-stone-100">
                    {isNew && (
                      <button
                        id={`start-prep-btn-${order.orderNumber.replace('#', '')}`}
                        onClick={() => startPreparingOrder(order.id)}
                        className="w-full py-3 bg-[#B45309] hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
                      >
                        <Flame className="w-4 h-4" />
                        <span>START PREPARING</span>
                      </button>
                    )}

                    {isRdy && (
                      <div className="w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>READY FOR WAITER PICKUP</span>
                      </div>
                    )}

                    {(isServed || activeTab === 'served') && (
                      <div className="w-full py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl text-center flex items-center justify-center space-x-1.5">
                        <Utensils className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {isAllItemsServed || order.status === 'served' ? `Served to ${order.tableNumber}` : `Partially Served to ${order.tableNumber}`}
                          {order.servedAt ? ` (${order.servedAt})` : ''}
                        </span>
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <div className="w-full py-2 bg-stone-100 text-stone-600 text-xs font-medium rounded-xl text-center">
                        Served & Completed at {order.completedAt}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
