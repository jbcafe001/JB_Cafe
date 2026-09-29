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
} from 'lucide-react';

interface WaiterTablesProps {
  onSelectTable: (table: Table) => void;
}

export const WaiterTables: React.FC<WaiterTablesProps> = ({ onSelectTable }) => {
  const { tables, orders, serveOrder, completeOrder } = useCafe();
  const [filter, setFilter] = useState<'all' | TableStatus>('all');

  // Modal states for Table View
  const [activeTableModal, setActiveTableModal] = useState<Table | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
          label: 'Occupied',
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

  const getActiveOrderForTable = (tableId: string) => {
    return orders.find(
      (o) =>
        (o.status === 'new' ||
          o.status === 'preparing' ||
          o.status === 'ready' ||
          o.status === 'served') &&
        o.tableId === tableId
    );
  };

  const handleCardClick = (table: Table) => {
    const activeOrder = getActiveOrderForTable(table.id);
    if (activeOrder) {
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

  const activeOrderInModal = activeTableModal
    ? getActiveOrderForTable(activeTableModal.id)
    : null;

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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
              filter === st
                ? 'bg-[#B45309] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {st === 'all'
              ? 'All Tables'
              : st === 'ready'
              ? 'Ready to Serve'
              : st === 'served'
              ? 'Served / Dining'
              : st}
          </button>
        ))}
      </div>

      {/* Table Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTables.map((table) => {
          const badge = getStatusBadge(table.status);
          const isReady = table.status === 'ready';
          const isServed = table.status === 'served';
          const activeOrder = getActiveOrderForTable(table.id);

          return (
            <div
              key={table.id}
              onClick={() => handleCardClick(table)}
              className={`bg-white rounded-3xl border p-5 sm:p-6 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-98 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] ${
                isReady
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-50 bg-emerald-50/20'
                  : isServed
                  ? 'border-indigo-300 ring-1 ring-indigo-400/20 bg-indigo-50/10'
                  : table.status === 'occupied'
                  ? 'border-amber-200'
                  : 'border-stone-200/90'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-extrabold text-stone-900 text-lg sm:text-2xl">{table.name}</span>
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
                {activeOrder ? (
                  <div className="text-xs sm:text-sm text-stone-600">
                    <span className="font-mono font-bold text-stone-800">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="ml-1 text-stone-400">• ₹{activeOrder.total}</span>
                  </div>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center space-x-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Take Order</span>
                  </span>
                )}

                {/* Direct Action Chips */}
                {isReady && activeOrder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServeTable(activeOrder.id);
                    }}
                    className="text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Serve</span>
                  </button>
                )}

                {isServed && activeOrder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPayment(activeOrder);
                    }}
                    className="text-xs sm:text-sm bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-xl font-bold shadow-xs flex items-center space-x-1.5"
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Pay</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Table Details Modal */}
      {activeTableModal && activeOrderInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#B45309]">
                  {activeOrderInModal.orderNumber}
                </span>
                <h3 className="text-xl font-black text-stone-900">{activeTableModal.name}</h3>
                <span className="text-xs text-stone-500">
                  Waiter: {activeOrderInModal.waiterName}
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
            <div className="bg-stone-50 rounded-2xl p-3 space-y-1.5 text-xs max-h-40 overflow-y-auto">
              <span className="font-bold text-stone-400 uppercase text-[10px] block">
                Ordered Items
              </span>
              {activeOrderInModal.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-stone-800">
                  <span>
                    {i.quantity}× {i.name}
                  </span>
                  <span className="font-bold">₹{i.price * i.quantity}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-sm text-stone-900">
                <span>Total Amount</span>
                <span className="text-amber-700">₹{activeOrderInModal.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              {activeOrderInModal.status === 'ready' && (
                <button
                  onClick={() => {
                    handleServeTable(activeOrderInModal.id);
                    setActiveTableModal(null);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Serve to {activeTableModal.name}</span>
                </button>
              )}

              {activeOrderInModal.status === 'served' && (
                <button
                  onClick={() => handleOpenPayment(activeOrderInModal)}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Settle Bill & Collect Payment</span>
                </button>
              )}

              {activeOrderInModal.status === 'preparing' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center text-xs text-blue-800 font-bold flex items-center justify-center space-x-2">
                  <Flame className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>Order is preparing in the kitchen</span>
                </div>
              )}
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
