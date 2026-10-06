import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order, PaymentMethod } from '../../types';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Banknote,
  QrCode,
  X,
  ChevronRight,
  Flame,
  Utensils,
  Receipt,
  Copy,
  Check,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';

interface WaiterActiveOrdersProps {
  onSelectTableForOrder?: (tableId: string) => void;
}

type OrderTabFilter = 'all' | 'ready' | 'served' | 'kitchen';

export const WaiterActiveOrders: React.FC<WaiterActiveOrdersProps> = () => {
  const { orders, completeOrder, serveOrder, toggleItemServed, removeItemFromOrder } = useCafe();

  const [activeTabFilter, setActiveTabFilter] = useState<OrderTabFilter>('all');
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Serve confirmation state
  const [justServedOrder, setJustServedOrder] = useState<Order | null>(null);

  useModalClose(() => setJustServedOrder(null), !!justServedOrder);
  useModalClose(() => setIsCompletedModalOpen(false), isCompletedModalOpen);

  // Active orders (new, preparing, ready, served)
  const activeOrders = orders.filter(
    (o) =>
      o.status === 'new' ||
      o.status === 'preparing' ||
      o.status === 'ready' ||
      o.status === 'served'
  );

  const readyOrders = activeOrders.filter((o) => o.status === 'ready' && !(o.items.length > 0 && o.items.every(i => i.served)));
  const servedOrders = activeOrders.filter((o) => o.status === 'served' || (o.items.length > 0 && o.items.every(i => i.served)));
  const preparingOrders = activeOrders.filter((o) => o.status === 'preparing' && !(o.items.length > 0 && o.items.every(i => i.served)));
  const newOrders = activeOrders.filter((o) => o.status === 'new' && !(o.items.length > 0 && o.items.every(i => i.served)));
  const inKitchenOrders = [...newOrders, ...preparingOrders];

  const filteredOrders = activeOrders.filter((ord) => {
    if (activeTabFilter === 'ready') return ord.status === 'ready';
    if (activeTabFilter === 'served') return ord.status === 'served';
    if (activeTabFilter === 'kitchen') return ord.status === 'new' || ord.status === 'preparing';
    return true;
  });

  const handleServeOrderClick = (order: Order) => {
    serveOrder(order.id);
    setJustServedOrder({ ...order, status: 'served' });
  };

  const handleOpenCompleteModal = (order: Order) => {
    setSelectedOrderForPayment(order);
    setPaymentMethod('upi');
    setCashTendered(order.total);
    setIsCompletedModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedOrderForPayment) return;
    completeOrder(selectedOrderForPayment.id, paymentMethod);
    setCompletionSuccess(true);
    setTimeout(() => {
      setCompletionSuccess(false);
      setIsCompletedModalOpen(false);
      setSelectedOrderForPayment(null);
    }, 1400);
  };

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText('brewandbite@okhdfcbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const currentCash = typeof cashTendered === 'number' ? cashTendered : 0;
  const changeToReturn = selectedOrderForPayment ? currentCash - selectedOrderForPayment.total : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 bg-[#F8F6F0]">
      {/* Ready Orders Alert Banner if any */}
      {readyOrders.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-extrabold text-emerald-950 text-sm sm:text-base">
                {readyOrders.length} {readyOrders.length === 1 ? 'Order' : 'Orders'} Ready at Kitchen Counter!
              </span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-200/90 text-emerald-900 px-2.5 py-1 rounded-lg">
              Pickup Ready
            </span>
          </div>
          <p className="text-xs text-emerald-800">
            Pick up from kitchen counter and tap <span className="font-bold underline">Serve to Table</span> to deliver to guests.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {readyOrders.map((ro) => (
              <button
                key={ro.id}
                onClick={() => handleServeOrderClick(ro)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Serve {ro.tableNumber}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTabFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeTabFilter === 'all'
              ? 'bg-[#B45309] text-white shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          All Active ({activeOrders.length})
        </button>

        <button
          onClick={() => setActiveTabFilter('ready')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTabFilter === 'ready'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Ready to Serve ({readyOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('served')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTabFilter === 'served'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-50'
          }`}
        >
          <Utensils className="w-3 h-3 text-indigo-500" />
          <span>Served & Dining ({servedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('kitchen')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTabFilter === 'kitchen'
              ? 'bg-stone-800 text-white shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Flame className="w-3 h-3 text-amber-500" />
          <span>In Kitchen ({inKitchenOrders.length})</span>
        </button>
      </div>

      {/* Orders List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-stone-900 text-base">
            Orders Feed ({filteredOrders.length})
          </h2>
          <span className="text-xs text-stone-500">Live Waiter POV</span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 text-sm">No Orders in this view</h3>
            <p className="text-xs text-stone-400 mt-1">
              {activeTabFilter === 'ready'
                ? 'No kitchen orders currently waiting to be served.'
                : activeTabFilter === 'served'
                ? 'No tables currently served. Deliver ready orders first.'
                : 'All orders have been processed and settled.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredOrders.map((order) => {
              const allItemsServed = order.items.length > 0 && order.items.every(i => i.served);
              const isServed = order.status === 'served' || allItemsServed;
              const isReady = order.status === 'ready' && !allItemsServed;
              const isPreparing = order.status === 'preparing' && !allItemsServed;
              const isNew = order.status === 'new' && !allItemsServed;

              return (
                <div
                  key={order.id}
                  id={`order-card-${order.orderNumber.replace('#', '')}`}
                  className={`bg-white rounded-2xl border transition-all shadow-xs p-4 sm:p-5 ${
                    isReady
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-50'
                      : isServed
                      ? 'border-indigo-300 ring-1 ring-indigo-400/20'
                      : isPreparing
                      ? 'border-blue-200'
                      : 'border-amber-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-stone-900 text-lg">
                          {order.tableNumber}
                        </span>
                        <span className="font-mono font-bold text-xs text-[#B45309] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                          {order.orderNumber}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 mt-0.5 block">
                        Waiter: {order.waiterName} • Placed {order.createdAt}
                        {order.readyAt && ` • Ready at ${order.readyAt}`}
                        {order.servedAt && ` • Served at ${order.servedAt}`}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isReady && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs animate-pulse">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>READY TO SERVE</span>
                        </span>
                      )}

                      {isServed && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                          <Utensils className="w-3.5 h-3.5 text-indigo-600" />
                          <span>SERVED / DINING</span>
                        </span>
                      )}

                      {isPreparing && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Flame className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                          <span>PREPARING</span>
                        </span>
                      )}

                      {isNew && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>NEW</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="py-3 space-y-1.5 text-xs sm:text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx} className={`flex justify-between items-center text-stone-800 ${item.served ? 'opacity-60' : ''}`}>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleItemServed(order.id, idx); }}
                            className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${item.served ? 'bg-emerald-500 text-white' : 'border border-stone-300 bg-white'}`}
                            title="Mark as Served"
                          >
                            {item.served && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <span className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-xs ${item.served ? 'bg-stone-50 border-stone-200 text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-700'}`}>
                            {item.quantity}×
                          </span>
                          <span className={`font-semibold ${item.served ? 'line-through text-stone-500' : ''}`}>{item.name}</span>
                          {!item.served && (item.prepared || 0) > 0 && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                              {item.prepared}/{item.quantity} Ready
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {item.notes}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-stone-700 font-bold">
                            ₹{item.price * item.quantity}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeItemFromOrder(order.id, idx); }}
                            className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {order.notes && (
                      <div className="mt-2 p-2 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-900 text-xs">
                        <span className="font-bold">Table Note: </span>
                        {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                        Total Bill:
                      </span>
                      <span className="font-black text-stone-900 text-lg">
                        ₹{order.total}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Step 1: When order is READY from kitchen -> Waiter serves to table */}
                      {isReady && (
                        <button
                          id={`serve-table-btn-${order.orderNumber.replace('#', '')}`}
                          onClick={() => handleServeOrderClick(order)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
                        >
                          <Utensils className="w-4 h-4" />
                          <span>Serve to {order.tableNumber}</span>
                        </button>
                      )}

                      {/* Step 2: When DONE (guests dining or finished) -> Payment option is there */}
                      {isServed && (
                        <button
                          id={`collect-payment-btn-${order.orderNumber.replace('#', '')}`}
                          onClick={() => handleOpenCompleteModal(order)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-stone-900 hover:bg-stone-800 text-white shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                        >
                          <CreditCard className="w-4 h-4 text-amber-400" />
                          <span>Collect Payment (₹{order.total})</span>
                        </button>
                      )}

                      {/* Fallback for other states */}
                      {isPreparing && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                          Cooking in Kitchen
                        </span>
                      )}

                      {isNew && (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          Ticket Sent to Kitchen
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Just Served Confirmation Sheet / Dialog */}
      {justServedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setJustServedOrder(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <Utensils className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Order Delivered
              </span>
              <h3 className="text-xl font-black text-stone-900 mt-2">
                Served to {justServedOrder.tableNumber}!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Order {justServedOrder.orderNumber} (₹{justServedOrder.total}) has been delivered to guests.
                Table status updated to <span className="font-semibold text-indigo-700">Served / Dining</span>.
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                id="settle-now-btn"
                onClick={() => {
                  const ord = justServedOrder;
                  setJustServedOrder(null);
                  handleOpenCompleteModal(ord);
                }}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Collect Payment Now (₹{justServedOrder.total})</span>
              </button>

              <button
                id="let-dine-btn"
                onClick={() => setJustServedOrder(null)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all"
              >
                Done (Guests Dining — Settle Later)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Order & Payment Modal */}
      {isCompletedModalOpen && selectedOrderForPayment && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsCompletedModalOpen(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200" onClick={e => e.stopPropagation()}>
            {completionSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-stone-900">Payment Settled!</h3>
                <p className="text-sm text-stone-600">
                  {selectedOrderForPayment.tableNumber} is now marked <span className="font-bold text-emerald-700">Available</span>.
                </p>
                <div className="text-xs text-stone-500 bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 space-y-0.5">
                  <p className="font-bold text-stone-800">
                    ₹{selectedOrderForPayment.total} received via {paymentMethod.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-stone-400">Inventory ingredients deducted automatically</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-stone-900 text-lg">
                        Settle Bill — {selectedOrderForPayment.tableNumber}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 font-mono">
                      Order {selectedOrderForPayment.orderNumber} • Served at {selectedOrderForPayment.servedAt || selectedOrderForPayment.readyAt || 'Counter'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCompletedModalOpen(false)}
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
                  {/* Bill Items */}
                  <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 space-y-2">
                    <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block">
                      Order Summary
                    </span>
                    {selectedOrderForPayment.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-stone-700">
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                        <span className="font-bold text-stone-900">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-stone-200/80 space-y-1">
                      <div className="flex justify-between text-stone-500 text-xs">
                        <span>Subtotal</span>
                        <span className="font-semibold text-stone-800">
                          ₹{selectedOrderForPayment.subtotal}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-black text-stone-900 pt-1 border-t border-stone-200">
                        <span>Total Due</span>
                        <span className="text-amber-700">₹{selectedOrderForPayment.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        id="payment-method-upi"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'upi'
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                        }`}
                      >
                        <QrCode className="w-5 h-5 text-amber-600 mb-1" />
                        <span className="font-extrabold text-xs">UPI</span>
                        <span className="text-[10px] text-stone-400">GPay/PhonePe</span>
                      </button>

                      <button
                        type="button"
                        id="payment-method-cash"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                        }`}
                      >
                        <Banknote className="w-5 h-5 text-amber-600 mb-1" />
                        <span className="font-extrabold text-xs">Cash</span>
                        <span className="text-[10px] text-stone-400">Currency</span>
                      </button>

                      <button
                        type="button"
                        id="payment-method-card"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'card'
                            ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-amber-600 mb-1" />
                        <span className="font-extrabold text-xs">Card</span>
                        <span className="text-[10px] text-stone-400">POS Terminal</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode-Specific Interaction */}
                  {paymentMethod === 'upi' && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5">
                      <div className="w-32 h-32 bg-white rounded-xl border border-amber-200 p-2 shadow-xs flex items-center justify-center relative">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=upi://pay?pa=brewandbite@okhdfcbank%26pn=Brew%20and%20Bite%26am=${selectedOrderForPayment.total}%26cu=INR`}
                          alt="UPI QR Code"
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          Scan with Google Pay, PhonePe, or Paytm
                        </p>
                        <div className="flex items-center justify-center space-x-1 mt-1 text-xs text-stone-600">
                          <span className="font-mono font-semibold">brewandbite@okhdfcbank</span>
                          <button
                            onClick={handleCopyUpi}
                            className="p-1 text-amber-700 hover:text-amber-900 rounded"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Cash Tendered from Customer (₹)
                        </label>
                        <input
                          type="number"
                          value={cashTendered}
                          onChange={(e) =>
                            setCashTendered(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          placeholder="Amount received"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-base font-bold font-mono text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Quick Cash Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setCashTendered(selectedOrderForPayment.total)}
                          className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100"
                        >
                          Exact ₹{selectedOrderForPayment.total}
                        </button>
                        {selectedOrderForPayment.total < 500 && (
                          <button
                            type="button"
                            onClick={() => setCashTendered(500)}
                            className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100"
                          >
                            ₹500
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setCashTendered(1000)}
                          className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100"
                        >
                          ₹1,000
                        </button>
                      </div>

                      {/* Change calculation */}
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-600">Change to Return:</span>
                        <span
                          className={`text-base font-black font-mono ${
                            changeToReturn >= 0 ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {changeToReturn >= 0 ? `₹${changeToReturn}` : `Short by ₹${Math.abs(changeToReturn)}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center space-y-1">
                      <CreditCard className="w-8 h-8 text-stone-500 mx-auto" />
                      <p className="font-bold text-xs text-stone-800">Swipe or Tap Card on Wireless POS</p>
                      <p className="text-[11px] text-stone-400">
                        Once approved on the EDC terminal, tap Complete below.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-1.5">
                  <button
                    id="confirm-complete-order-btn"
                    onClick={handleConfirmPayment}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>CONFIRM PAYMENT & SETTLE (₹{selectedOrderForPayment.total})</span>
                  </button>
                  <p className="text-[11px] text-center text-stone-500">
                    Frees {selectedOrderForPayment.tableNumber} for new guests & logs sales
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
