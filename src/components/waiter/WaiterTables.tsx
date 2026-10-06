import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table, TableStatus, Order, PaymentMethod } from '../../types';
import {
  Users,
  Plus,
  CheckCircle2,
  Utensils,
  CreditCard,
  X,
  QrCode,
  Banknote,
  Flame,
  Check,
  Sparkles,
} from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';

interface WaiterTablesProps {
  onSelectTable: (table: Table) => void;
}

export const WaiterTables: React.FC<WaiterTablesProps> = ({ onSelectTable }) => {
  const { tables, orders, serveOrder, completeOrder, servePreparedItems, toggleItemServed } = useCafe();
  const [filter, setFilter] = useState<'all' | TableStatus>('all');

  // Modal states for Table View
  const [activeTableModal, setActiveTableModal] = useState<Table | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useModalClose(() => setActiveTableModal(null), !!activeTableModal);
  useModalClose(() => setPaymentModalOrder(null), !!paymentModalOrder);

  const filteredTables = tables.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return {
          label: 'Available',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'occupied':
        return {
          label: 'Order Taken',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'preparing':
        return {
          label: 'Preparing',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'ready':
        return {
          label: 'Ready to Serve',
          bg: 'bg-emerald-600 text-white border-emerald-700 shadow-xs',
          dot: 'bg-white animate-ping',
        };
      case 'served':
        return {
          label: 'Served / Dining',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-600',
        };
      default:
        return {
          label: 'Available',
          bg: 'bg-stone-50 text-stone-700 border-stone-200',
          dot: 'bg-stone-400',
        };
    }
  };

  const getActiveOrdersForTable = (tableId: string) => {
    return orders.filter(
      (o) =>
        (o.status === 'new' ||
          o.status === 'preparing' ||
          o.status === 'ready' ||
          o.status === 'served') &&
        o.tableId === tableId
    );
  };

  const handleCardClick = (table: Table) => {
    const activeOrders = getActiveOrdersForTable(table.id);
    if (activeOrders.length > 0) {
      setActiveTableModal(table);
    } else {
      onSelectTable(table);
    }
  };

  const handleServeTable = (orderId: string) => {
    serveOrder(orderId);
  };

  const handleOpenPayment = (order: Order) => {
    setActiveTableModal(null);
    if (order.paymentMethod) {
      completeOrder(order.id, order.paymentMethod);
      setPaymentModalOrder(order);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setPaymentModalOrder(null);
      }, 1400);
      return;
    }
    setPaymentModalOrder(order);
    setPaymentMethod('upi');
    setCashTendered(order.total);
  };

  const handleConfirmPayment = () => {
    if (!paymentModalOrder) return;
    completeOrder(paymentModalOrder.id, paymentMethod);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setPaymentModalOrder(null);
    }, 1400);
  };

  const activeOrdersInModal = activeTableModal
    ? getActiveOrdersForTable(activeTableModal.id)
    : [];

  const currentCash = typeof cashTendered === 'number' ? cashTendered : 0;
  const changeToReturn = paymentModalOrder ? currentCash - paymentModalOrder.total : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 bg-[#F8F6F0]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Café Floor Tables</h2>
          <p className="text-xs text-stone-500">Tap table to start order, serve, or collect payment</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['all', 'available', 'occupied', 'preparing', 'ready', 'served'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${filter === st
                ? 'bg-[#B45309] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
          >
            {st === 'all'
              ? 'All Tables'
              : st === 'ready'
                ? 'Ready to Serve'
                : st === 'occupied'
                  ? 'Order Taken'
                  : st === 'served'
                    ? 'Served / Dining'
                    : st}
          </button>
        ))}
      </div>

      {/* Table Cards Grid */}
      {filteredTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-200/50 flex items-center justify-center text-stone-400">
            <Utensils className="w-8 h-8 opacity-50" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-700">
              {filter === 'available' ? 'No Available Tables' :
                filter === 'occupied' ? 'No Orders Taken' :
                  filter === 'preparing' ? 'Nothing in Kitchen' :
                    filter === 'ready' ? 'Nothing to Serve' :
                      filter === 'served' ? 'No Dining Tables' :
                        'No tables here'}
            </h3>
            <p className="text-sm text-stone-500 max-w-[200px] mx-auto mt-1">
              {filter === 'available' ? 'All tables are currently occupied.' :
                filter === 'occupied' ? 'No tables are waiting for food preparation.' :
                  filter === 'preparing' ? 'No orders are currently being prepared.' :
                    filter === 'ready' ? 'No orders are ready to be served right now.' :
                      filter === 'served' ? 'No tables are currently dining.' :
                        'There are no tables currently matching this status.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTables.map((table) => {
            const activeOrders = getActiveOrdersForTable(table.id);
            
            const isAllItemsServed = (o: Order) => o.items.length > 0 && o.items.every(i => i.served);
            const isPartiallyReady = (o: Order) => o.status === 'preparing' && o.items.some(i => ((i.prepared || 0) > (i.servedCount || 0)));
            const readyCount = activeOrders.filter(o => (o.status === 'ready' || isPartiallyReady(o)) && !isAllItemsServed(o)).length;
            const preparingCount = activeOrders.filter(o => o.status === 'preparing' && !isPartiallyReady(o) && !isAllItemsServed(o)).length;
            const newCount = activeOrders.filter(o => o.status === 'new' && !isAllItemsServed(o)).length;
            const servedCount = activeOrders.filter(o => o.status === 'served' || isAllItemsServed(o)).length;
            const kitchenCount = activeOrders.filter(o => o.status === 'preparing' && !isAllItemsServed(o)).length + newCount;

            // Check if ANY order is genuinely ready (status ready AND not all items served)
            const hasGenuinelyReady = readyCount > 0;
            const hasGenuinelyPreparing = preparingCount > 0 || kitchenCount > 0;
            const hasGenuinelyNew = newCount > 0;

            const allItemsServed = activeOrders.length > 0 && servedCount === activeOrders.length;

            let activeOrder = activeOrders.find(o => (o.status === 'ready' || isPartiallyReady(o)) && !isAllItemsServed(o));
            if (!activeOrder) activeOrder = activeOrders.find(o => o.status === 'served' || isAllItemsServed(o));
            if (!activeOrder) activeOrder = activeOrders.find(o => o.status === 'preparing' && !isAllItemsServed(o));
            if (!activeOrder) activeOrder = activeOrders.find(o => o.status === 'new' && !isAllItemsServed(o));
            if (!activeOrder) activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;

            let effectiveStatus: typeof table.status = table.status;
            if (hasGenuinelyReady) effectiveStatus = 'ready';
            else if (hasGenuinelyPreparing) effectiveStatus = 'preparing';
            else if (hasGenuinelyNew) effectiveStatus = 'occupied';
            else if (allItemsServed) effectiveStatus = 'served';

            const badge = getStatusBadge(effectiveStatus);
            const isServed = (activeOrders.some(o => o.status === 'served') || allItemsServed) && !activeOrders.some(o => o.status === 'ready' && !o.items.every(i => i.served));
            const isReady = activeOrders.some(o => o.status === 'ready') && !allItemsServed;
            const unservedReadyCount = activeOrder ? activeOrder.items.reduce((sum, i) => sum + ((i.prepared || 0) > (i.servedCount || 0) ? ((i.prepared || 0) - (i.servedCount || 0)) : 0), 0) : 0;
            const isPartiallyReadyState = activeOrder?.status === 'preparing' && unservedReadyCount > 0;

            return (
              <div
                key={table.id}
                onClick={() => handleCardClick(table)}
                className={`bg-white rounded-3xl border p-5 sm:p-6 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-98 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] ${isReady
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-50 bg-emerald-50/20'
                    : isServed
                      ? 'border-indigo-300 ring-1 ring-indigo-400/20 bg-indigo-50/10'
                      : table.status === 'occupied'
                        ? 'border-amber-200'
                        : 'border-stone-200/90'
                  }`}
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="font-extrabold text-stone-900 text-lg sm:text-2xl leading-none pt-1">{table.name}</span>
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-stone-400 text-sm mt-1">
                    <Users className="w-4 h-4" />
                    <span>{table.seats} Seats</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-sm">
                  {table.status === 'available' ? (
                    <span className="text-amber-700 font-bold flex items-center space-x-1.5">
                      <Plus className="w-4 h-4" />
                      <span>Take Order</span>
                    </span>
                  ) : activeOrders.length > 1 ? (
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-bold w-full">
                      {kitchenCount > 0 && (
                        <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 flex items-center space-x-1">
                          <Flame className="w-3 h-3" />
                          <span>{kitchenCount} In Kitchen</span>
                        </span>
                      )}
                      {readyCount > 0 && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 flex items-center space-x-1">
                          <Utensils className="w-3 h-3" />
                          <span>{readyCount} Ready</span>
                        </span>
                      )}
                      {servedCount > 0 && (
                        <span className="text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>{servedCount} Served</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-end gap-2">
                      {(isReady || isPartiallyReadyState) && activeOrder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPartiallyReadyState) {
                              servePreparedItems(activeOrder.id);
                            } else {
                              handleServeTable(activeOrder.id);
                            }
                          }}
                          className={`w-full py-1.5 ${isPartiallyReadyState ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-extrabold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors`}
                        >
                          <Utensils className="w-4 h-4" />
                          <span>{isPartiallyReadyState ? `Serve ${unservedReadyCount} Items` : 'Serve'}</span>
                        </button>
                      )}
                      {isServed && activeOrder && (
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTable(table);
                            }}
                            className="text-xs sm:text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>New Order</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              activeOrders.forEach(o => completeOrder(o.id, 'cash'));
                            }}
                            className="text-xs sm:text-sm bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                          >
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Free Table</span>
                          </button>
                        </div>
                      )}
                      {effectiveStatus === 'preparing' && activeOrder && !isPartiallyReadyState && (
                        <span className="text-blue-700 text-xs sm:text-sm font-bold flex items-center space-x-1.5">
                          <Flame className="w-4 h-4 animate-pulse" />
                          <span>In Kitchen</span>
                        </span>
                      )}
                      {effectiveStatus === 'occupied' && !isReady && !isServed && (
                        <span className="text-stone-500 text-xs sm:text-sm font-medium">
                          Manage &rarr;
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Table Details Modal */}
      {activeTableModal && activeOrdersInModal.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setActiveTableModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-stone-100 pb-2.5">
              <div>
                <span className="text-xs font-mono font-bold text-[#B45309]">
                  {activeOrdersInModal.map(o => o.orderNumber).join(', ')}
                </span>
                <h3 className="text-xl font-black text-stone-900">{activeTableModal.name}</h3>
                <span className="text-xs text-stone-500">
                  Waiter: {activeOrdersInModal[0]?.waiterName}
                </span>
              </div>
              <button
                onClick={() => setActiveTableModal(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 shadow-inner max-h-[50vh] overflow-y-auto">
              <span className="font-black text-stone-400 uppercase tracking-widest text-[10px] mb-1.5 block">
                Ordered Items
              </span>
              <div className="space-y-4">
                {activeOrdersInModal.map((order) => (
                  <div key={order.id}>
                    <div className="flex justify-between items-center mb-1 border-b border-stone-200 pb-1">
                      <span className="font-black text-stone-500 text-[10px] uppercase">
                        Order {order.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-0 divide-y divide-stone-200/60">
                      {order.items.map((item, idx) => (
                        <div key={idx} className={`flex items-center justify-between py-1.5 transition-opacity ${item.served ? 'opacity-60' : ''}`}>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                if ((item.prepared || 0) >= item.quantity || item.served) {
                                  toggleItemServed(order.id, idx);
                                }
                              }}
                              disabled={(item.prepared || 0) < item.quantity && !item.served}
                              className={`w-5 h-5 rounded-md border shadow-sm flex items-center justify-center transition-all ${
                                item.served 
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20' 
                                  : ((item.prepared || 0) < item.quantity 
                                      ? 'bg-stone-100 border-stone-200 cursor-not-allowed opacity-50' 
                                      : 'bg-white border-stone-300 text-transparent hover:border-emerald-400')
                              }`}
                              title={(item.prepared || 0) < item.quantity && !item.served ? "Item not fully prepared yet" : "Mark as Served"}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className={`w-6 h-6 rounded bg-white border border-stone-200 flex items-center justify-center font-bold text-xs ${item.served ? 'text-stone-400' : 'text-stone-700'}`}>
                                {item.quantity}×
                              </span>
                              <span className={`font-semibold text-sm ${item.served ? 'line-through text-stone-500' : 'text-stone-800'}`}>
                                {item.name}
                              </span>
                              {!item.served && (
                                <>
                                  {(item.servedCount || 0) > 0 && (
                                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">
                                      {item.servedCount}/{item.quantity} Served
                                    </span>
                                  )}
                                  {((item.prepared || 0) - (item.servedCount || 0)) > 0 && (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                                      {((item.prepared || 0) - (item.servedCount || 0))} Ready
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`font-bold text-sm ${item.served ? 'text-stone-500' : 'text-stone-900'}`}>
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t-2 border-stone-200 border-dashed flex justify-between items-center">
                <span className="font-bold text-stone-500 text-sm uppercase tracking-wider">Total Amount</span>
                <span className="text-lg font-black text-[#B45309]">
                  ₹{activeOrdersInModal.reduce((sum, o) => sum + o.total, 0)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {activeOrdersInModal.map(order => {
                const isAllItemsServed = order.items.length > 0 && order.items.every(i => i.served);
                const isReady = order.status === 'ready' && !isAllItemsServed;
                const isServed = order.status === 'served' || isAllItemsServed;
                const isPreparing = order.status === 'preparing' && !isAllItemsServed;
                const unservedReadyCount = order.items.reduce((sum, i) => sum + ((i.prepared || 0) > (i.servedCount || 0) ? ((i.prepared || 0) - (i.servedCount || 0)) : 0), 0);

                if (isReady) {
                  return (
                    <button
                      key={order.id}
                      onClick={() => {
                        handleServeTable(order.id);
                        if (activeOrdersInModal.length === 1) setActiveTableModal(null);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Serve {order.orderNumber} to {activeTableModal.name}</span>
                    </button>
                  );
                }

                if (isServed) {
                  const allModalOrdersServed = activeOrdersInModal.length > 0 && activeOrdersInModal.every(o => o.status === 'served' || (o.items.length > 0 && o.items.every(i => i.served)));
                  return allModalOrdersServed ? null : (
                    <div
                      key={order.id}
                      className="w-full py-2.5 bg-indigo-50 text-indigo-700 font-extrabold text-sm rounded-xl border border-indigo-200 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Served Order — {order.orderNumber}</span>
                    </div>
                  );
                }

                if (isPreparing && unservedReadyCount > 0) {
                  return (
                    <button
                      key={order.id}
                      onClick={() => {
                        servePreparedItems(order.id);
                        if (activeOrdersInModal.length === 1 && unservedReadyCount === order.items.reduce((s, i) => s + (i.quantity - (i.servedCount || 0)), 0)) {
                           setActiveTableModal(null);
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-sm rounded-xl border border-emerald-300 shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Serve {unservedReadyCount} Ready Items to {activeTableModal.name}</span>
                    </button>
                  );
                }

                return null;
              })}

              {activeOrdersInModal.length > 0 && activeOrdersInModal.every(o => o.status === 'served' || (o.items.length > 0 && o.items.every(i => i.served))) && (
                <button
                  onClick={() => {
                    activeOrdersInModal.forEach(o => completeOrder(o.id, 'cash'));
                    setActiveTableModal(null);
                  }}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95 mb-3"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Free Table</span>
                </button>
              )}

              {activeOrdersInModal.some(o => o.status === 'preparing' && o.items.reduce((sum, i) => sum + ((i.prepared || 0) > (i.servedCount || 0) ? ((i.prepared || 0) - (i.servedCount || 0)) : 0), 0) === 0) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center text-xs text-blue-800 font-bold flex items-center justify-center space-x-2">
                  <Flame className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>Preparing in the kitchen</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setPaymentModalOrder(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200" onClick={e => e.stopPropagation()}>
            {paymentSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-stone-900">Payment Completed!</h3>
                <p className="text-sm text-stone-600">
                  {paymentModalOrder.tableNumber} is now freed and Available.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                  <div>
                    <h3 className="font-black text-stone-900 text-lg">
                      Settle Bill — {paymentModalOrder.tableNumber}
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">
                      Order {paymentModalOrder.orderNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setPaymentModalOrder(null)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-stone-500 font-bold block uppercase">Total Due</span>
                      <span className="text-2xl font-black text-stone-900">
                        ₹{paymentModalOrder.total}
                      </span>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-lg">
                      Served Table
                    </span>
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${paymentMethod === 'upi'
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-stone-200 text-stone-600 bg-white'
                          }`}
                      >
                        <QrCode className="w-5 h-5 text-amber-600 mb-1" />
                        <span className="font-extrabold text-xs">UPI</span>
                        <span className="text-[10px] text-stone-400">QR Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${paymentMethod === 'cash'
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-stone-200 text-stone-600 bg-white'
                          }`}
                      >
                        <Banknote className="w-5 h-5 text-amber-600 mb-1" />
                        <span className="font-extrabold text-xs">Cash</span>
                        <span className="text-[10px] text-stone-400">Cash Box</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${paymentMethod === 'card'
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-stone-200 text-stone-600 bg-white'
                          }`}
                      >
                        <CreditCard className="w-5 h-5 text-amber-600 mb-1" />
                        <span className="font-extrabold text-xs">Card</span>
                        <span className="text-[10px] text-stone-400">POS Swipe</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-600">Cash Received:</span>
                        <input
                          type="number"
                          value={cashTendered}
                          onChange={(e) =>
                            setCashTendered(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="w-28 px-2.5 py-1 text-right bg-white border border-stone-300 rounded-lg text-sm font-bold font-mono"
                        />
                      </div>
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-600">Change:</span>
                        <span
                          className={`font-black font-mono text-sm ${changeToReturn >= 0 ? 'text-emerald-700' : 'text-red-600'
                            }`}
                        >
                          {changeToReturn >= 0 ? `₹${changeToReturn}` : `Short ₹${Math.abs(changeToReturn)}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-200">
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>CONFIRM PAYMENT & FREE TABLE</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
