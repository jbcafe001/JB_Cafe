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
} from 'lucide-react';

interface WaiterHomeProps {
  onSelectTable: (table: Table) => void;
  onNavigateToOrders: () => void;
  onNavigateToTables: () => void;
}

export const WaiterHome: React.FC<WaiterHomeProps> = ({
  onSelectTable,
  onNavigateToOrders,
  onNavigateToTables,
}) => {
  const { tables, orders, currentUser, serveOrder, completeOrder, toggleItemServed } = useCafe();

  // Selected table for quick order status / actions
  const [selectedTableForAction, setSelectedTableForAction] = useState<Table | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Ready orders for immediate serving notification
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const servedOrders = orders.filter((o) => o.status === 'served');

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

    const order = orders.find(
      (o) =>
        (o.status === 'ready' ||
          o.status === 'served' ||
          o.status === 'preparing' ||
          o.status === 'new') &&
        o.tableId === table.id
    );

    if (order) {
      setSelectedTableForAction(table);
    } else {
      onSelectTable(table);
    }
  };

  const getActiveOrderForTable = (tableId: string) => {
    return orders.find(
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

  const activeModalOrder = selectedTableForAction
    ? getActiveOrderForTable(selectedTableForAction.id)
    : null;

  const currentCash = typeof cashTendered === 'number' ? cashTendered : 0;
  const changeToReturn = paymentModalOrder ? currentCash - paymentModalOrder.total : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-28 bg-[#F9F8F6]">
      {/* Waiter Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
            Shift Active
          </span>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Hi, {currentUser?.name || 'Rahul'} 👋
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-700 font-bold">
          <Coffee className="w-5 h-5" />
        </div>
      </div>

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
            const badge = getTableBadge(table.status);
            const isReady = table.status === 'ready';
            const isServed = table.status === 'served';
            const activeOrder = getActiveOrderForTable(table.id);

            return (
              <div
                key={table.id}
                id={`table-card-${table.number}`}
                onClick={() => handleTableCardClick(table)}
                className={`bg-white rounded-3xl border p-5 sm:p-6 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-98 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] ${
                  isReady
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20'
                    : isServed
                    ? 'border-indigo-300 ring-1 ring-indigo-400/20 bg-indigo-50/10'
                    : table.status === 'occupied'
                    ? 'border-amber-200'
                    : 'border-stone-200/90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-stone-900 text-lg sm:text-2xl block">
                      {table.name}
                    </span>
                    <div className="flex items-center space-x-1.5 text-stone-400 text-sm mt-1">
                      <Users className="w-4 h-4" />
                      <span>{table.seats} Guests</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
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

                  {isReady && activeOrder && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServeFromModal(activeOrder.id);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Serve Now</span>
                    </button>
                  )}

                  {isServed && activeOrder && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPayment(activeOrder);
                      }}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Pay ₹{activeOrder.total}</span>
                    </button>
                  )}

                  {table.status === 'preparing' && activeOrder && (
                    <span className="text-blue-700 text-xs sm:text-sm font-bold flex items-center space-x-1.5">
                      <Flame className="w-4 h-4 animate-pulse" />
                      <span>In Kitchen</span>
                    </span>
                  )}

                  {table.status === 'occupied' && !isReady && !isServed && (
                    <span className="text-stone-500 text-xs sm:text-sm font-medium">
                      Manage Order &rarr;
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Detail & Action Modal (When clicking active table) */}
      {selectedTableForAction && activeModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#B45309]">
                  {activeModalOrder.orderNumber}
                </span>
                <h3 className="text-xl font-black text-stone-900">{selectedTableForAction.name}</h3>
                <span className="text-xs text-stone-500">
                  Waiter: {activeModalOrder.waiterName}
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
            <div className="bg-stone-50 rounded-2xl p-3 space-y-1.5 text-xs max-h-40 overflow-y-auto">
              <span className="font-bold text-stone-400 uppercase text-[10px] block">
                Ordered Items
              </span>
              {activeModalOrder.items.map((i, idx) => (
                <div key={idx} className={`flex items-center justify-between text-stone-800 ${i.served ? 'opacity-60' : ''}`}>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => toggleItemServed(activeModalOrder.id, idx)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${i.served ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300 bg-white'}`}
                      title="Mark as Served"
                    >
                      {i.served && <Check className="w-3 h-3" />}
                    </button>
                    <span className={i.served ? 'line-through text-stone-500' : ''}>
                      {i.quantity}× {i.name}
                    </span>
                  </div>
                  <span className="font-bold">₹{i.price * i.quantity}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-sm text-stone-900">
                <span>Total Amount</span>
                <span className="text-amber-700">₹{activeModalOrder.total}</span>
              </div>
            </div>

            {/* Action buttons depending on order status */}
            <div className="space-y-2 pt-1">
              {activeModalOrder.status === 'ready' && (
                <button
                  onClick={() => {
                    handleServeFromModal(activeModalOrder.id);
                    setSelectedTableForAction(null);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Serve to {selectedTableForAction.name}</span>
                </button>
              )}

              {activeModalOrder.status === 'served' && (
                <button
                  onClick={() => handleOpenPayment(activeModalOrder)}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Settle Payment (₹{activeModalOrder.total})</span>
                </button>
              )}

              <button
                onClick={() => {
                  const tableToPass = selectedTableForAction;
                  setSelectedTableForAction(null);
                  if (tableToPass) onSelectTable(tableToPass);
                }}
                className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add More Items</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTableForAction(null);
                  onNavigateToOrders();
                }}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all"
              >
                Go to Orders Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
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
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'upi'
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
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'cash'
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
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'card'
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
                          className={`font-black font-mono text-sm ${
                            changeToReturn >= 0 ? 'text-emerald-700' : 'text-red-600'
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
