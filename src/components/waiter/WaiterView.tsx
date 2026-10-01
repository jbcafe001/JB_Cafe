import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table } from '../../types';
import { WaiterHome } from './WaiterHome';
import { WaiterActiveOrders } from './WaiterActiveOrders';
import { WaiterTables } from './WaiterTables';
import { WaiterProfile } from './WaiterProfile';
import { WaiterOrderTaking } from './WaiterOrderTaking';
import { Home, ClipboardList, Grid, User, Smartphone } from 'lucide-react';

type WaiterTab = 'home' | 'orders' | 'tables' | 'profile';

export const WaiterView: React.FC = () => {
  const { isMobileFrame, orders } = useCafe();
  const [activeTab, setActiveTab] = useState<WaiterTab>('home');
  const [activeTableForOrder, setActiveTableForOrder] = useState<Table | null>(null);

  // Active orders badge count (including served & ready)
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'new' || o.status === 'preparing' || o.status === 'ready' || o.status === 'served'
  ).length;

  const handleSelectTable = (table: Table) => {
    setActiveTableForOrder(table);
  };

  const handleOrderSent = () => {
    setActiveTableForOrder(null);
    setActiveTab('orders'); // Jump straight to active orders so waiter sees it!
  };

  // The actual waiter UI content
  const waiterContent = (
    <div className="flex flex-col h-full bg-[#F9F8F6] relative select-none">
      {/* If currently taking order on a table */}
      {activeTableForOrder ? (
        <WaiterOrderTaking
          table={activeTableForOrder}
          onBack={() => setActiveTableForOrder(null)}
          onOrderSent={handleOrderSent}
        />
      ) : (
        <>
          {/* Main Tab Screen */}
          {activeTab === 'home' && (
            <WaiterHome
              onSelectTable={handleSelectTable}
              onNavigateToOrders={() => setActiveTab('orders')}
              onNavigateToTables={() => setActiveTab('tables')}
              onNavigateToProfile={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'orders' && (
            <WaiterActiveOrders onSelectTableForOrder={(tblId) => { }} />
          )}

          {activeTab === 'tables' && (
            <WaiterTables onSelectTable={handleSelectTable} />
          )}

          {activeTab === 'profile' && <WaiterProfile />}

          {/* Fixed Bottom Navigation (Mobile First Clean Minimalism) */}
          <nav
            id="waiter-bottom-nav"
            className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-sm px-2 py-1.5 flex items-center justify-around"
          >
            <button
              id="waiter-nav-home"
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${activeTab === 'home'
                  ? 'text-[#B45309] font-extrabold'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
                }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              id="waiter-nav-orders"
              onClick={() => setActiveTab('orders')}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${activeTab === 'orders'
                  ? 'text-[#B45309] font-extrabold'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
                }`}
            >
              <ClipboardList className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Orders</span>
              {activeOrdersCount > 0 && (
                <span className="absolute top-0.5 right-2 w-4 h-4 bg-[#B45309] text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              id="waiter-nav-tables"
              onClick={() => setActiveTab('tables')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${activeTab === 'tables'
                  ? 'text-[#B45309] font-extrabold'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
                }`}
            >
              <Grid className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Tables</span>
            </button>


          </nav>
        </>
      )}
    </div>
  );

  // If in simulated mobile frame on desktop
  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center p-2 sm:p-6">
        <div className="w-full max-w-[420px] h-[780px] max-h-[92vh] bg-white rounded-[38px] shadow-2xl border-[9px] border-stone-900 overflow-hidden relative flex flex-col">
          {/* Phone Speaker Notch */}
          <div className="w-28 h-4 bg-stone-900 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center">
            <div className="w-8 h-1 bg-stone-700 rounded-full" />
          </div>
          <div className="flex-1 overflow-hidden pt-2 flex flex-col">{waiterContent}</div>
        </div>
      </div>
    );
  }

  // Full-width (default responsive mobile-first container)
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F9F8F6] relative">
      {waiterContent}
    </div>
  );
};
