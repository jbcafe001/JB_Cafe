import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table, TableStatus, Order, PaymentMethod } from '../../types';
import {
  Coffee,
  Users,
  Plus,
  ArrowRight,
  Utensils,
  CreditCard,
  CheckCircle2,
  X,
  Flame,
  QrCode,
  Banknote,
  Copy,
  Check,
  Trash2,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';
import { WaiterHeader } from './WaiterHeader';

interface WaiterHomeProps {
  onSelectTable: (table: Table) => void;
  onNavigateToOrders: () => void;
  onNavigateToTables: () => void;
  onNavigateToProfile: () => void;
}

export const WaiterHome: React.FC<WaiterHomeProps> = ({
  onSelectTable,
  onNavigateToOrders,
  onNavigateToTables,
  onNavigateToProfile,
}) => {
  const { tables, orders, currentUser, serveOrder, completeOrder, toggleItemServed, removeItemFromOrder, cancelOrder, showConfirm, settings, logout, servePreparedItems } = useCafe();

  // Selected table for quick order status / actions
  const [selectedTableForAction, setSelectedTableForAction] = useState<Table | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  useModalClose(() => setSelectedTableForAction(null), !!selectedTableForAction);
  useModalClose(() => setSelectedTableForAction(null), !!selectedTableForAction);
  useModalClose(() => setPaymentModalOrder(null), !!paymentModalOrder);

  // Ready orders for immediate serving notification
  const readyOrders = orders.filter((o) => o.status === 'ready' && !(o.items.length > 0 && o.items.every(i => i.served)));
  const servedOrders = orders.filter((o) => o.status === 'served' || (o.items.length > 0 && o.items.every(i => i.served)));

  const getTableBadge = (status: TableStatus) => {
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

  const handleTableCardClick = (table: Table) => {
    if (table.status === 'available') {
      onSelectTable(table);
      return;
    }

    const activeOrders = orders.filter(
      (o) =>
        (o.status === 'ready' ||
          o.status === 'served' ||
          o.status === 'preparing' ||
          o.status === 'new') &&
        o.tableId === table.id
    );

    if (activeOrders.length > 0) {
      setSelectedTableForAction(table);
    } else {
      onSelectTable(table);
    }
  };

  const getActiveOrdersForTable = (tableId: string) => {
    return orders.filter(
      (o) =>
        (o.status === 'ready' ||
          o.status === 'served' ||
          o.status === 'preparing' ||
          o.status === 'new') &&
        o.tableId === tableId
    );
  };

  const handleServeFromModal = (orderId: string) => {
    serveOrder(orderId);
  };

  const handleOpenPayment = (order: Order) => {
    setSelectedTableForAction(null);
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

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText('brewandbite@okhdfcbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const activeModalOrders = selectedTableForAction
    ? getActiveOrdersForTable(selectedTableForAction.id)
    : [];

  const currentCash = typeof cashTendered === 'number' ? cashTendered : 0;
  const changeToReturn = paymentModalOrder ? currentCash - paymentModalOrder.total : 0;

  const cafeName = settings?.cafeName || 'BREW & BITE Café';

  const initials = (currentUser?.name || 'Rahul')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-28 bg-[#F9F8F6]">
      <WaiterHeader />

      {/* Ready Orders Alert Strip */}
      {readyOrders.length > 0 && (
        <div className="bg-emerald-600 text-white rounded-2xl p-4 shadow-md flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <div>
                <p className="font-extrabold text-sm">
                  {readyOrders.length} {readyOrders.length === 1 ? 'Order' : 'Orders'} Ready for Serving!
                </p>
                <p className="text-[11px] text-emerald-100">Deliver food & beverages to the table</p>
              </div>
            </div>
            <button
              onClick={onNavigateToOrders}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-emerald-500/40">
            {readyOrders.map((ro) => (
              <button
                key={ro.id}
                onClick={() => handleServeFromModal(ro.id)}
                className="px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all active:scale-95"
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                <span>Serve to {ro.tableNumber}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tables Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Café Tables
            </h3>
            <p className="text-[11px] text-stone-400">Tap table to take order, serve, or settle payment</p>
          </div>
          <button
            onClick={onNavigateToTables}
            className="text-xs text-amber-700 font-semibold hover:underline flex items-center space-x-1"
          >
            <span>Floor View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tables.map((table) => {
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
            if (!activeOrder) activeOrder = activeOrders.find(o => o.status === 'preparing' && !(o.items.length > 0 && o.items.every(i => i.served)));
            if (!activeOrder) activeOrder = activeOrders.find(o => o.status === 'new' && !(o.items.length > 0 && o.items.every(i => i.served)));
            if (!activeOrder) activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;

            let effectiveStatus: typeof table.status = table.status;
            if (hasGenuinelyReady) effectiveStatus = 'ready';
            else if (hasGenuinelyPreparing) effectiveStatus = 'preparing';
            else if (hasGenuinelyNew) effectiveStatus = 'occupied';
            else if (allItemsServed) effectiveStatus = 'served';

            const badge = getTableBadge(effectiveStatus);
            const isServed = effectiveStatus === 'served' || allItemsServed;
            const isReady = effectiveStatus === 'ready' && !allItemsServed;
            const unservedReadyCount = activeOrder ? activeOrder.items.reduce((sum, i) => sum + ((i.prepared || 0) > (i.servedCount || 0) ? ((i.prepared || 0) - (i.servedCount || 0)) : 0), 0) : 0;
            const isPartiallyReadyState = activeOrder?.status === 'preparing' && unservedReadyCount > 0;

            return (
              <div
                key={table.id}
                id={`table-card-${table.number}`}
                onClick={() => handleTableCardClick(table)}
                className={`bg-white rounded-3xl border p-5 sm:p-6 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-98 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] ${isReady
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20'
                  : isServed
                    ? 'border-indigo-300 ring-1 ring-indigo-400/20 bg-indigo-50/10'
                    : table.status === 'occupied'
                      ? 'border-amber-200'
                      : 'border-stone-200/90'
                  }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-stone-900 text-lg sm:text-2xl block leading-none pt-1">
                      {table.name}
                    </span>
                    <div className="flex items-center space-x-1.5 text-stone-400 text-xs sm:text-sm mt-1">
                      <Users className="w-4 h-4" />
                      <span>{table.seats} Guests</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border whitespace-nowrap ${badge.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${badge.dot}`} />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Bottom action hint */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-sm">
                  {table.status === 'available' && (
                    <span className="text-amber-700 font-bold flex items-center space-x-1.5">
                      <Plus className="w-4 h-4" />
                      <span>New Order</span>
                    </span>
                  )}

                  {table.status !== 'available' && activeOrders.length > 1 ? (
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
                  ) : table.status !== 'available' && activeOrders.length === 1 ? (
                    <div className="w-full">
                      {(isReady || isPartiallyReadyState) && activeOrder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPartiallyReadyState) {
                              servePreparedItems(activeOrder.id);
                            } else {
                              handleServeFromModal(activeOrder.id);
                            }
                          }}
                          className={`w-full py-2 ${isPartiallyReadyState ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-extrabold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors`}
                        >
                          <Utensils className="w-4 h-4" />
                          <span>{isPartiallyReadyState ? `Serve ${unservedReadyCount} Ready Items` : 'Serve Now'}</span>
                        </button>
                      )}

                      {isServed && activeOrder && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTable(table);
                            }}
                            className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors whitespace-nowrap"
                          >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            <span>Order More</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              activeOrders.forEach(o => completeOrder(o.id, 'cash'));
                            }}
                            className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors whitespace-nowrap"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
                          Manage Order &rarr;
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Detail & Action Modal (When clicking active table) */}
      {selectedTableForAction && activeModalOrders.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedTableForAction(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-stone-100 pb-2.5">
              <div>
                <span className="text-xs font-mono font-bold text-[#B45309]">
                  {activeModalOrders.map(o => o.orderNumber).join(', ')}
                </span>
                <h3 className="text-xl font-black text-stone-900">{selectedTableForAction.name}</h3>
                <span className="text-xs text-stone-500">
                  Waiter: {activeModalOrders[0]?.waiterName}
                </span>
              </div>
              <button
                onClick={() => setSelectedTableForAction(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items summary */}
            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 shadow-inner max-h-[50vh] overflow-y-auto">
              <span className="font-black text-stone-400 uppercase tracking-widest text-[10px] mb-1.5 block">
                Ordered Items
              </span>
              <div className="space-y-4">
                {activeModalOrders.map((order) => (
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
                            <button
                              onClick={() => removeItemFromOrder(order.id, idx)}
                              className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                  ₹{activeModalOrders.reduce((sum, o) => sum + o.total, 0)}
                </span>
              </div>
            </div>

            {/* Action buttons depending on order status */}
            <div className="space-y-2">
              {activeModalOrders.map(order => {
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
                        handleServeFromModal(order.id);
                        if (activeModalOrders.length === 1) {
                          setSelectedTableForAction(null);
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Serve {order.orderNumber} to {selectedTableForAction.name}</span>
                    </button>
                  );
                }

                if (isServed) {
                  const allModalOrdersServed = activeModalOrders.length > 0 && activeModalOrders.every(o => o.status === 'served' || (o.items.length > 0 && o.items.every(i => i.served)));
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
                        if (activeModalOrders.length === 1 && unservedReadyCount === order.items.reduce((s, i) => s + (i.quantity - (i.servedCount || 0)), 0)) {
                           // if all remaining items are being served, close modal
                           setSelectedTableForAction(null);
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-sm rounded-xl border border-emerald-300 shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Serve {unservedReadyCount} Ready Items for {order.orderNumber}</span>
                    </button>
                  );
                }

                return null;
              })}

              {activeModalOrders.length > 0 && activeModalOrders.every(o => o.status === 'served' || (o.items.length > 0 && o.items.every(i => i.served))) && (
                <button
                  onClick={() => {
                    activeModalOrders.forEach(o => completeOrder(o.id, 'cash'));
                    setSelectedTableForAction(null);
                  }}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Free Table</span>
                </button>
              )}

              <button
                onClick={() => {
                  const tableToPass = selectedTableForAction;
                  setSelectedTableForAction(null);
                  if (tableToPass) onSelectTable(tableToPass);
                }}
                className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Order</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    showConfirm(
                      'Cancel All Orders?',
                      'Are you sure you want to cancel all active orders for this table?',
                      () => {
                        activeModalOrders.forEach(o => cancelOrder(o.id));
                        setSelectedTableForAction(null);
                      },
                      { isDestructive: true, confirmText: 'Yes, Cancel All' }
                    );
                  }}
                  className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition-all border border-red-100 flex items-center justify-center"
                >
                  Cancel Orders
                </button>
                <button
                  onClick={() => {
                    setSelectedTableForAction(null);
                    onNavigateToOrders();
                  }}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm rounded-xl transition-all flex items-center justify-center"
                >
                  Orders Feed
                </button>
              </div>
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
                <h3 className="text-xl font-black text-stone-900">Payment Settled!</h3>
                <p className="text-sm text-stone-600">
                  {paymentModalOrder.tableNumber} is now marked Available.
                </p>
                <div className="text-xs text-stone-500 bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 space-y-0.5">
                  <p className="font-bold text-stone-800">
                    ₹{paymentModalOrder.total} received via {paymentMethod.toUpperCase()}
                  </p>
                </div>
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
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
                  {/* Total */}
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

                  {/* Mode detail */}
                  {paymentMethod === 'upi' && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-2">
                      <div className="w-28 h-28 bg-white rounded-xl border border-amber-200 p-2 shadow-xs">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=upi://pay?pa=brewandbite@okhdfcbank%26pn=Brew%20and%20Bite%26am=${paymentModalOrder.total}%26cu=INR`}
                          alt="UPI QR"
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-stone-700">
                        brewandbite@okhdfcbank
                      </span>
                    </div>
                  )}

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
