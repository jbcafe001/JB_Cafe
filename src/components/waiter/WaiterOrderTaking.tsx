import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table, MenuItemCategory, OrderItem, PaymentMethod } from '../../types';
import {
  Search,
  Plus,
  Minus,
  Send,
  X,
  CheckCircle2,
  FileText,
  ShoppingBag,
  ArrowLeft,
  QrCode,
  Banknote,
  CreditCard,
} from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';

interface WaiterOrderTakingProps {
  table: Table;
  onBack: () => void;
  onOrderSent: () => void;
}

const CATEGORIES: MenuItemCategory[] = [
  'All',
  'Coffee',
  'Tea',
  'Beverages',
  'Snacks',
  'Desserts',
];

export const WaiterOrderTaking: React.FC<WaiterOrderTakingProps> = ({
  table,
  onBack,
  onOrderSent,
}) => {
  const { menuItems, createOrder, currentUser, addItemsToOrder, stockItems } = useCafe();

  const [selectedCategory, setSelectedCategory] = useState<MenuItemCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, OrderItem>>({});
  const [notes, setNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate how much of each stock item is currently reserved in the cart
  const usedStockMap = useMemo(() => {
    const map: Record<string, number> = {};
    (Object.values(cart) as OrderItem[]).forEach((cartItem) => {
      const menuItem = menuItems.find(m => m.id === cartItem.menuItemId || m.name === cartItem.name);
      if (menuItem && menuItem.ingredients) {
        menuItem.ingredients.forEach(ing => {
          map[ing.stockItemId] = (map[ing.stockItemId] || 0) + (ing.amount * cartItem.quantity);
        });
      }
    });
    return map;
  }, [cart, menuItems]);

  const getAdditionalAvailable = (menuItem: typeof menuItems[0]) => {
    if (!menuItem.ingredients || menuItem.ingredients.length === 0) return null;
    
    let maxQty = Infinity;
    for (const ing of menuItem.ingredients) {
      const stock = stockItems.find((s) => s.id === ing.stockItemId);
      if (!stock || ing.amount <= 0) return 0;
      
      const usedAmount = usedStockMap[ing.stockItemId] || 0;
      const remainingStock = Math.max(0, stock.available - usedAmount);
      
      const possible = Math.floor(remainingStock / ing.amount);
      if (possible < maxQty) maxQty = possible;
    }
    return maxQty === Infinity ? null : maxQty;
  };
  useModalClose(() => {
    if (showPaymentModal) setShowPaymentModal(false);
    else if (showReviewModal) setShowReviewModal(false);
  }, showReviewModal || showPaymentModal);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    if (!item.available) return false;
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart helper functions
  const handleAddItem = (itemId: string, name: string, price: number) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (existing) {
        return {
          ...prev,
          [itemId]: { ...existing, quantity: existing.quantity + 1 },
        };
      }
      return {
        ...prev,
        [itemId]: { menuItemId: itemId, name, price, quantity: 1, served: false },
      };
    });
  };

  const handleDecreaseItem = (itemId: string) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { ...existing, quantity: existing.quantity - 1 },
      };
    });
  };

  const cartItemsList: OrderItem[] = Object.values(cart);
  const totalItemCount = cartItemsList.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItemsList.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleReviewConfirm = () => {
    setShowReviewModal(false);
    setShowPaymentModal(true);
    setCashTendered(subtotal);
  };

  const handleSendToKitchen = () => {
    if (cartItemsList.length === 0) return;

    // Always create a new order instead of appending
    createOrder({
      tableId: table.id,
      items: cartItemsList,
      notes: notes.trim() ? notes.trim() : undefined,
      waiterId: currentUser?.id,
      waiterName: currentUser?.name,
      paymentMethod,
    });

    setShowPaymentModal(false);
    setIsSuccess(true);
    setTimeout(() => {
      onOrderSent();
    }, 1200);
  };

  const currentCash = typeof cashTendered === 'number' ? cashTendered : 0;
  const changeToReturn = currentCash - subtotal;

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[450px] text-center bg-white rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Order Sent to Kitchen!</h2>
        <p className="text-sm text-stone-500 mt-1">
          {table.name} • {totalItemCount} items (₹{subtotal})
        </p>
        <span className="inline-block mt-3 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
          Kitchen display notified instantly
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F6F0] relative">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-stone-900 text-base">{table.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                {table.seats} Guests
              </span>
            </div>
            <p className="text-[11px] text-stone-500">Taking new order</p>
          </div>
        </div>

        {totalItemCount > 0 && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
            <span>{totalItemCount} items</span>
          </button>
        )}
      </div>

      {/* Search & Fast Category Filters */}
      <div className="p-3 bg-white border-b border-stone-100 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cappuccino, sandwich..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Item Cards Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-28">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm">No items found.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const currentQty = cart[item.id]?.quantity || 0;
            const additionalAvailable = getAdditionalAvailable(item);
            const isOutOfStock = additionalAvailable !== null && additionalAvailable <= 0 && currentQty === 0;
            const canAddMore = additionalAvailable === null || additionalAvailable > 0;
            
            return (
              <div
                key={item.id}
                className={`bg-white border rounded-xl p-3 flex items-center justify-between transition-shadow ${isOutOfStock ? 'border-red-200 bg-red-50/30 opacity-75' : 'border-stone-200/80 shadow-xs hover:shadow-sm'}`}
              >
                <div className="pr-2 flex-1">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    {item.name}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-amber-700 text-sm inline-block">
                      ₹{item.price}
                    </span>
                    {additionalAvailable !== null && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${additionalAvailable > 0 ? 'bg-amber-100 text-amber-800' : currentQty > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                        {additionalAvailable > 0 ? `${additionalAvailable} more available` : currentQty > 0 ? 'Limit Reached' : 'Out of stock'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Instant Quantity Tap Controls */}
                <div>
                  {currentQty === 0 ? (
                    <button
                      id={`add-btn-${item.id}`}
                      disabled={!canAddMore}
                      onClick={() => handleAddItem(item.id, item.name, item.price)}
                      className={`w-10 h-10 rounded-xl border font-bold flex items-center justify-center transition-colors shadow-xs ${!canAddMore ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 active:scale-95'}`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                      <button
                        onClick={() => handleDecreaseItem(item.id)}
                        className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-stone-50 flex items-center justify-center shadow-xs font-bold active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-bold text-stone-900 text-sm">
                        {currentQty}
                      </span>
                      <button
                        disabled={!canAddMore}
                        onClick={() => handleAddItem(item.id, item.name, item.price)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs font-bold ${!canAddMore ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Cart Bar */}
      {totalItemCount > 0 && (
        <div className="fixed sm:sticky bottom-14 sm:bottom-0 left-0 right-0 z-20 bg-stone-900 text-white p-3.5 shadow-2xl border-t border-stone-800">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base">₹{subtotal}</span>
                <span className="text-xs text-stone-300 bg-stone-800 px-2 py-0.5 rounded-md font-medium">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-medium">Ready for {table.name}</p>
            </div>

            <button
              id="view-order-cart-btn"
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <span>View Order</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Order Review & Send to Kitchen Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">{table.name} — Order Review</h3>
                <p className="text-xs text-stone-500">Confirm items before sending to kitchen</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="p-4 overflow-y-auto divide-y divide-stone-100 flex-1 space-y-2">
              {cartItemsList.map((item) => (
                <div key={item.menuItemId} className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-800 text-sm">{item.name}</span>
                    <div className="text-xs text-stone-500">
                      ₹{item.price} × {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-stone-900 text-sm">
                      ₹{item.price * item.quantity}
                    </span>
                    <div className="flex items-center space-x-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                      <button
                        onClick={() => handleDecreaseItem(item.menuItemId)}
                        className="w-6 h-6 rounded bg-white text-stone-700 flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => handleAddItem(item.menuItemId, item.name, item.price)}
                        className="w-6 h-6 rounded bg-amber-600 text-white flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Special Note Input */}
              <div className="pt-4">
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Optional Kitchen Note
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Less sugar, extra spicy, warm milk..."
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Subtotal Bill summary */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-semibold text-stone-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1 border-t border-stone-100">
                  <span>Estimated Total</span>
                  <span className="text-amber-700">₹{subtotal}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200">
              <button
                id="send-to-kitchen-primary-btn"
                onClick={handleReviewConfirm}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-base shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <CreditCard className="w-5 h-5" />
                <span>PROCEED TO PAYMENT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-black text-stone-900 text-lg">
                  Collect Payment
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  {table.name}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
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
                    ₹{subtotal}
                  </span>
                </div>
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
                onClick={handleSendToKitchen}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRM PAYMENT & SEND TO KITCHEN</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
