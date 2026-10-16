import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table } from '../../types';
import { WaiterHome } from './WaiterHome';
import { WaiterActiveOrders } from './WaiterActiveOrders';
import { WaiterTables } from './WaiterTables';
import { WaiterProfile } from './WaiterProfile';
import { WaiterOrderTaking } from './WaiterOrderTaking';
import { Home, ClipboardList, Grid, User, Smartphone, Coffee, X } from 'lucide-react';

type WaiterTab = 'home' | 'orders' | 'tables' | 'profile';

export const WaiterView: React.FC = () => {
  const { isMobileFrame, orders } = useCafe();
  const [activeTab, setActiveTab] = useState<WaiterTab>('home');
  const [activeTableForOrder, setActiveTableForOrder] = useState<Table | null>(null);
  const [brandSelectionTable, setBrandSelectionTable] = useState<Table | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<'JB Cafe' | 'KUNAFA'>('JB Cafe');

  // Active orders badge count (including served & ready)
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'new' || o.status === 'preparing' || o.status === 'ready' || o.status === 'served'
  ).length;

  const handleSelectTable = (table: Table) => {
    setBrandSelectionTable(table);
  };

  const handleBrandSelect = (brand: 'JB Cafe' | 'KUNAFA') => {
    if (brandSelectionTable) {
      setSelectedBrand(brand);
      setActiveTableForOrder(brandSelectionTable);
      setBrandSelectionTable(null);
    }
  };

  const handleOrderSent = () => {
    setActiveTableForOrder(null);
    setActiveTab('orders'); // Jump straight to active orders so waiter sees it!
  };

  // The actual waiter UI content
  const waiterContent = (
    <div className="flex-1 flex flex-col h-full bg-[#F9F8F6] relative select-none overflow-hidden min-h-0">
      {/* If currently taking order on a table */}
      {activeTableForOrder ? (
        <WaiterOrderTaking
          table={activeTableForOrder}
          selectedBrand={selectedBrand}
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

          {/* Brand Selection Modal */}
          {brandSelectionTable && (
            <div
              className="fixed inset-0 z-50 bg-stone-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setBrandSelectionTable(null)}
            >
              <div
                className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 border border-stone-200/80 flex flex-col space-y-4 animate-modal-spring"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {brandSelectionTable.name || `Table ${brandSelectionTable.number}`}
                    </span>
                    <h3 className="text-lg font-black text-stone-900 mt-1">Select Menu Brand</h3>
                    <p className="text-xs text-stone-500">Which items would you like to take?</p>
                  </div>
                  <button
                    onClick={() => setBrandSelectionTable(null)}
                    className="btn-interactive p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* JB Cafe Card */}
                  <button
                    type="button"
                    onClick={() => handleBrandSelect('JB Cafe')}
                    className="card-interactive group text-left p-4 rounded-2xl border-2 border-amber-200/90 hover:border-amber-600 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 hover:from-amber-100/70 hover:to-orange-100/50 transition-all shadow-sm flex items-center space-x-3.5 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 group-hover:-rotate-3 transition-transform">
                      <Coffee className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-stone-900 text-base group-hover:text-amber-800 transition-colors">
                          JB Cafe items
                        </h4>
                        <span className="text-amber-700 font-extrabold text-xs">Select &rarr;</span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                        Tea, Coffee, Pizza, Burger, Snacks & Drinks
                      </p>
                    </div>
                  </button>

                  {/* Kunafa Card */}
                  <button
                    type="button"
                    onClick={() => handleBrandSelect('KUNAFA')}
                    className="card-interactive group text-left p-4 rounded-2xl border-2 border-orange-200/90 hover:border-orange-600 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 hover:from-orange-100/70 hover:to-amber-100/50 transition-all shadow-sm flex items-center space-x-3.5 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform overflow-hidden shadow-sm">
                      <img src="/kunafa.png" alt="Kunafa" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-stone-900 text-base group-hover:text-amber-800 transition-colors">
                          Kunafa items
                        </h4>
                        <span className="text-amber-700 font-extrabold text-xs">Select &rarr;</span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                        Kunafa, Cheesecakes, Bombolinis & Desserts
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fixed Bottom Navigation (Mobile First Clean Minimalism) */}
          <nav
            id="waiter-bottom-nav"
            className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#EFE7DA] shadow-lg px-2 py-1.5 flex items-center justify-around"
          >
            <button
              id="waiter-nav-home"
              onClick={() => setActiveTab('home')}
              className={`btn-interactive flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${activeTab === 'home'
                  ? 'text-amber-900 font-black bg-amber-100/90 border border-amber-300 shadow-xs'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
                }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              id="waiter-nav-orders"
              onClick={() => setActiveTab('orders')}
              className={`btn-interactive relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${activeTab === 'orders'
                  ? 'text-sky-900 font-black bg-sky-100/90 border border-sky-300 shadow-xs'
                  : 'text-stone-400 hover:text-stone-600 font-medium'
                }`}
            >
              <ClipboardList className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Orders</span>
              {activeOrdersCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs animate-live-pulse">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              id="waiter-nav-tables"
              onClick={() => setActiveTab('tables')}
              className={`btn-interactive flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${activeTab === 'tables'
                  ? 'text-emerald-900 font-black bg-emerald-100/90 border border-emerald-300 shadow-xs'
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
    <div className="h-screen h-[100dvh] w-full flex flex-col bg-[#F9F8F6] relative overflow-hidden">
      {waiterContent}
    </div>
  );
};
