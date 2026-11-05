import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order, OrderItem, PaymentMethod } from '../../types';
import { getOrderItemImage } from '../../utils/menuImages';
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
  Printer,
  Minus,
  Plus,
} from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';
import { WaiterHeader } from './WaiterHeader';
import { downloadKotPdf } from '../../utils/kotGenerator';

interface WaiterActiveOrdersProps {
  onSelectTableForOrder?: (tableId: string) => void;
}

interface ItemRemovalTarget {
  orderId: string;
  itemIndex: number;
  item: OrderItem;
  removeQty: number;
}

export const WaiterActiveOrders: React.FC<WaiterActiveOrdersProps> = () => {
  const { orders, menuItems, completeOrder, toggleItemServed, removeItemFromOrder, deleteOrder } = useCafe();

  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Item quantity removal & Order deletion state
  const [itemRemovalTarget, setItemRemovalTarget] = useState<ItemRemovalTarget | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  useModalClose(() => setIsCompletedModalOpen(false), isCompletedModalOpen);
  useModalClose(() => setItemRemovalTarget(null), !!itemRemovalTarget);
  useModalClose(() => setOrderToDelete(null), !!orderToDelete);

  // Active orders (pending to be served - not completed, cancelled, or served)
  const activeOrders = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'served'
  );

  const handleServeOrderClick = (order: Order) => {
    completeOrder(order.id, order.paymentMethod || 'cash');
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-16 sm:pb-20 bg-[#F8F6F0] min-h-0">
      <WaiterHeader />
      {/* Orders List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-stone-900 text-base">
            Orders Feed ({activeOrders.length})
          </h2>
          <span className="text-xs text-stone-500">Live Waiter POV</span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800 text-sm">All caught up!</h3>
            <p className="text-xs text-stone-400 mt-1">
              No active orders waiting to be served.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeOrders.map((order) => {
              return (
                <div
                  key={order.id}
                  id={`order-card-${order.orderNumber.replace('#', '')}`}
                  className="bg-white rounded-2xl border border-amber-200 transition-all shadow-xs p-4 sm:p-5"
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
                        <button
                          type="button"
                          title="Download KOT PDF"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadKotPdf({
                              orderNumber: order.orderNumber,
                              tableName: order.tableNumber,
                              customerName: order.customerName || 'Guest',
                              waiterName: order.waiterName,
                              items: order.items,
                              notes: order.notes || undefined,
                              paymentMethod: order.paymentMethod,
                              date: order.date,
                              time: order.createdAt,
                            });
                          }}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-stone-500 mt-0.5 block">
                        {order.customerName ? <strong className="text-stone-800 font-bold mr-1.5">Cust: {order.customerName} •</strong> : null}
                        Waiter: {order.waiterName} • Placed {order.createdAt}
                        {order.readyAt && ` • Ready at ${order.readyAt}`}
                        {order.servedAt && ` • Served at ${order.servedAt}`}
                      </span>
                    </div>

                    {/* Status Badge & Delete Entire Order */}
                    <div className="flex items-center space-x-1.5">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>ACTIVE</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrderToDelete(order);
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Entire Order"
                      >
                        <Trash2 className="w-4 h-4 text-stone-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="py-3 space-y-1.5 text-xs sm:text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx} className={`flex items-center justify-between group gap-2 text-stone-800 ${item.served ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-x-2.5 gap-y-1.5 flex-1 flex-wrap">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              toggleItemServed(order.id, idx); 
                            }}
                            className={`w-5 h-5 shrink-0 rounded flex items-center justify-center transition-colors cursor-pointer ${
                              item.served 
                                ? 'bg-emerald-500 text-white' 
                                : 'border border-stone-300 bg-white hover:border-emerald-400'
                            }`}
                            title={item.served ? "Item Served" : "Mark as Served"}
                          >
                            {item.served && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <span className={`w-6 h-6 shrink-0 rounded-md border flex items-center justify-center font-bold text-xs ${item.served ? 'bg-stone-50 border-stone-200 text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-700'}`}>
                            {item.quantity}×
                          </span>
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-stone-200 p-0.5 shrink-0 flex items-center justify-center shadow-2xs overflow-hidden">
                            <img
                              src={getOrderItemImage(item, menuItems)}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <span className={`font-semibold ${item.served ? 'line-through text-stone-500' : ''}`}>{item.name}</span>
                          {!item.served && (item.servedCount || 0) > 0 && (
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                              {item.servedCount}/{item.quantity} Served
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                              {item.notes}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 shrink-0 ml-1 mt-0.5 sm:mt-0">
                          <span className="text-stone-700 font-bold whitespace-nowrap">
                            ₹{item.price * item.quantity}
                          </span>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (item.quantity > 1) {
                                setItemRemovalTarget({
                                  orderId: order.id,
                                  itemIndex: idx,
                                  item,
                                  removeQty: 1,
                                });
                              } else {
                                removeItemFromOrder(order.id, idx);
                              }
                            }}
                            className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0 cursor-pointer"
                            title={item.quantity > 1 ? `Reduce quantity for ${item.name}` : `Remove ${item.name}`}
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
                      <button
                        type="button"
                        onClick={() => setOrderToDelete(order)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Order</span>
                      </button>

                      <button
                        id={`serve-table-btn-${order.orderNumber.replace('#', '')}`}
                        onClick={() => handleServeOrderClick(order)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Serve to {order.tableNumber}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src={getOrderItemImage(item, menuItems)}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <span className="truncate">
                            {item.quantity} × {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-stone-900 shrink-0 ml-2">
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

      {/* Item Quantity Removal Modal */}
      {itemRemovalTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setItemRemovalTarget(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Reduce Quantity
                </span>
                <h3 className="text-base sm:text-lg font-black text-stone-900 mt-1.5">
                  {itemRemovalTarget.item.name}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Current in order: <strong className="text-stone-900">{itemRemovalTarget.item.quantity}</strong> (₹{itemRemovalTarget.item.price} each)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setItemRemovalTarget(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-xs font-bold text-stone-700 mb-2.5">
                How many quantities do you want to remove?
              </span>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  disabled={itemRemovalTarget.removeQty <= 1}
                  onClick={() =>
                    setItemRemovalTarget((prev) =>
                      prev ? { ...prev, removeQty: Math.max(1, prev.removeQty - 1) } : null
                    )
                  }
                  className="w-10 h-10 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs font-bold cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-16 text-center">
                  <span className="text-3xl font-black text-stone-900 font-mono">
                    {itemRemovalTarget.removeQty}
                  </span>
                  <span className="block text-[10px] text-stone-400 font-bold uppercase">
                    To Remove
                  </span>
                </div>
                <button
                  type="button"
                  disabled={itemRemovalTarget.removeQty >= itemRemovalTarget.item.quantity}
                  onClick={() =>
                    setItemRemovalTarget((prev) =>
                      prev
                        ? { ...prev, removeQty: Math.min(prev.item.quantity, prev.removeQty + 1) }
                        : null
                    )
                  }
                  className="w-10 h-10 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3 w-full justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setItemRemovalTarget((prev) => (prev ? { ...prev, removeQty: 1 } : null))
                  }
                  className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer ${
                    itemRemovalTarget.removeQty === 1
                      ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Remove 1
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setItemRemovalTarget((prev) =>
                      prev ? { ...prev, removeQty: prev.item.quantity } : null
                    )
                  }
                  className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer ${
                    itemRemovalTarget.removeQty === itemRemovalTarget.item.quantity
                      ? 'bg-red-100 text-red-900 border-red-300 shadow-2xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Remove All ({itemRemovalTarget.item.quantity})
                </button>
              </div>
            </div>

            <div className="text-xs text-stone-600 px-1 text-center">
              {itemRemovalTarget.removeQty >= itemRemovalTarget.item.quantity ? (
                <span className="text-red-600 font-bold">
                  ⚠️ This item will be completely removed from the order.
                </span>
              ) : (
                <span>
                  Remaining in order:{' '}
                  <strong className="text-stone-900 font-mono">
                    {itemRemovalTarget.item.quantity - itemRemovalTarget.removeQty} × {itemRemovalTarget.item.name}
                  </strong>{' '}
                  (₹{(itemRemovalTarget.item.quantity - itemRemovalTarget.removeQty) * itemRemovalTarget.item.price})
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setItemRemovalTarget(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeItemFromOrder(
                    itemRemovalTarget.orderId,
                    itemRemovalTarget.itemIndex,
                    itemRemovalTarget.removeQty
                  );
                  setItemRemovalTarget(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Remove {itemRemovalTarget.removeQty} {itemRemovalTarget.removeQty === 1 ? 'Item' : 'Items'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Entire Order Confirmation Modal */}
      {orderToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setOrderToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-stone-900">
                Delete Entire Order?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {orderToDelete.tableNumber} • Order #{orderToDelete.orderNumber}
              </p>
              <div className="text-xs text-stone-600 mt-3 p-3 bg-red-50/60 rounded-xl border border-red-200/80 text-left space-y-1">
                <p>
                  <strong>Customer:</strong> {orderToDelete.customerName || 'Guest'}
                </p>
                <p>
                  <strong>Total Items:</strong> {orderToDelete.items.reduce((s, i) => s + i.quantity, 0)} items (₹{orderToDelete.total})
                </p>
                <p className="text-red-700 font-semibold pt-1">
                  ⚠️ This will permanently delete the entire order and free up {orderToDelete.tableNumber}.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full pt-1">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
