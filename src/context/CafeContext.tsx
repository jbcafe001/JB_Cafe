import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ToastContainer } from '../components/common/ToastContainer';
import {
  UserRole,
  User,
  Table,
  MenuItem,
  StockItem,
  Order,
  OrderItem,
  Expense,
  StockAddition,
  MaterialUsageRecord,
  CafeNotification,
  PaymentMethod,
  StaffMember,
  UpaadRecord,
  SalaryPaymentRecord,
} from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { db } from '../firebase';
import { doc, collection, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

interface CreateOrderParams {
  tableId: string;
  items: OrderItem[];
  notes?: string;
  waiterId?: string;
  waiterName?: string;
}

interface CafeContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isLoggedIn: boolean;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  users: User[];
  tables: Table[];
  menuItems: MenuItem[];
  stockItems: StockItem[];
  orders: Order[];
  expenses: Expense[];
  stockAdditions: StockAddition[];
  materialUsageLogs: MaterialUsageRecord[];
  notifications: CafeNotification[];

  // Staff Salary & Upaad
  staffMembers: StaffMember[];
  upaadRecords: UpaadRecord[];
  salaryHistory: SalaryPaymentRecord[];
  addStaffMember: (staff: Omit<StaffMember, 'id'>) => void;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  giveUpaad: (params: { staffId: string; amount: number; date: string; note?: string }) => { success: boolean; error?: string };
  editUpaad: (id: string, updates: { amount: number; date: string; note?: string }) => { success: boolean; error?: string };
  deleteUpaad: (id: string) => void;
  paySalary: (params: { staffId: string; paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer'; paymentDate: string; note?: string }) => void;

  // Auth & Roles
  login: (email: string, role: UserRole, name: string, uid: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Order Flow
  createOrder: (params: CreateOrderParams) => Order;
  addItemsToOrder: (orderId: string, newItems: OrderItem[], additionalNotes?: string) => void;
  startPreparingOrder: (orderId: string) => void;
  markOrderReady: (orderId: string) => void;
  serveOrder: (orderId: string) => void;
  toggleItemServed: (orderId: string, itemIndex: number | number[]) => void;
  removeItemFromOrder: (orderId: string, itemIndex: number | number[]) => void;
  completeOrder: (orderId: string, paymentMethod: PaymentMethod) => void;
  cancelOrder: (orderId: string) => void;

  // Stock
  addStock: (stockItemId: string, quantity: number, purchaseCost: number) => void;
  useStock: (stockItemId: string, quantity: number, purpose?: string, notes?: string) => void;
  todayStockUsage: Record<string, { name: string; amount: number; unit: string }>;

  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  // Menu Management
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  toggleMenuItemAvailability: (id: string) => void;

  // Table Management
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;

  // User Management
  addUser: (user: Omit<User, 'id'>) => void;
  toggleUserStatus: (id: string) => void;

  // Notification
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; isDestructive?: boolean }
  ) => void;

  // Demo Controls
  resetDemoData: () => void;
}

const STORAGE_KEY = 'brew_and_bite_cafe_state_v1';

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial or stored state
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return null;
  };

  // Clear any stale localStorage cache — we now use Firebase Collections exclusively
  localStorage.removeItem(STORAGE_KEY);

  const saved = loadSavedState();


  const [users, setUsers] = useState<User[]>(saved?.users || INITIAL_USERS);
  const [currentRole, setCurrentRole] = useState<UserRole>(saved?.currentRole || 'waiter');
  const [currentUser, setCurrentUser] = useState<User | null>(
    saved?.currentUser || null
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(saved?.isLoggedIn ?? false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockAdditions, setStockAdditions] = useState<StockAddition[]>([]);
  const [materialUsageLogs, setMaterialUsageLogs] = useState<MaterialUsageRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [upaadRecords, setUpaadRecords] = useState<UpaadRecord[]>([]);
  const [salaryHistory, setSalaryHistory] = useState<SalaryPaymentRecord[]>([]);
  const [notifications, setNotifications] = useState<CafeNotification[]>([]);


  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const isRemoteUpdate = useRef(false);
  const [isSyncing, setIsSyncing] = useState(true);

  // Listen for Firestore changes — one listener per collection
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    const attachListener = (collName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
      const unsub = onSnapshot(collection(db, collName), (snap) => {
        setter(snap.docs.map(d => d.data()));
        setIsSyncing(false);
      });
      unsubs.push(unsub);
    };

    attachListener('users', setUsers);
    attachListener('tables', setTables);
    attachListener('menuItems', setMenuItems);
    attachListener('stockItems', setStockItems);
    attachListener('orders', setOrders);
    attachListener('expenses', setExpenses);
    attachListener('stockAdditions', setStockAdditions);
    attachListener('materialUsageLogs', setMaterialUsageLogs);
    attachListener('staffMembers', setStaffMembers);
    attachListener('upaadRecords', setUpaadRecords);
    attachListener('salaryHistory', setSalaryHistory);
    attachListener('notifications', setNotifications);

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);



  const addNotification = (message: string, targetRole: UserRole | 'all' = 'all') => {
    const newNotif: CafeNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      message,
      targetRole,
      timestamp: 'Just now',
      read: false,
    };
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(console.error);
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Auth & Roles
  const login = (email: string, role: UserRole, name: string, uid: string) => {
    const matchedUser: User = {
      id: uid,
      name,
      email,
      role,
      status: 'active'
    };
    
    setCurrentUser(matchedUser);
    setCurrentRole(role);
    setIsLoggedIn(true);
    addNotification(`Logged in as ${matchedUser.name} (${matchedUser.role})`, matchedUser.role);
    return true;
  };

  const logout = () => {
    import('../services/auth').then(({ logoutUser }) => {
      logoutUser().then(() => {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }).catch(console.error);
    });
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const userForRole = users.find((u) => u.role === role) || users[0];
    setCurrentUser(userForRole);
    setIsLoggedIn(true);
    addNotification(`Switched role to ${role.toUpperCase()} (${userForRole.name})`, role);
  };

  // Order Actions
  const createOrder = ({ tableId, items, notes, waiterId, waiterName }: CreateOrderParams): Order => {
    const table = tables.find((t) => t.id === tableId);
    const tableNumStr = table ? table.name : 'Table';
    
    // Generate next sequential order number (e.g. #1044)
    const existingNums = orders
      .map((o) => parseInt(o.orderNumber.replace('#', ''), 10))
      .filter((n) => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1044;
    const orderNumber = `#${nextNum}`;

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = 0; // standard clean subtotal
    const total = subtotal + tax;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tableId,
      tableNumber: tableNumStr,
      waiterId: waiterId || currentUser?.id || 'u-waiter-1',
      waiterName: waiterName || currentUser?.name || 'Rahul Sharma',
      items: items.map(i => ({ ...i, batch: 1 })),
      subtotal,
      tax,
      total,
      status: 'new',
      notes: notes || null,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Strip undefined values — Firebase rejects them
    const cleanOrder = JSON.parse(JSON.stringify(newOrder));
    setDoc(doc(db, 'orders', newOrder.id), cleanOrder).catch(console.error);


    // Update Table status to occupied
    updateDoc(doc(db, 'tables', tableId), {
      status: 'occupied',
      currentOrderId: newOrder.id,
      activeWaiterId: newOrder.waiterId,
      activeWaiterName: newOrder.waiterName,
    }).catch(console.error);

    // Notify Kitchen
    addNotification(`New order ${orderNumber} received for ${tableNumStr}`, 'cook');
    addToast('New order created successfully!');

    return newOrder;
  };

  const addItemsToOrder = (orderId: string, newItems: OrderItem[], additionalNotes?: string) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;

    const tableNumStr = existingOrder.tableNumber;
    const ordNum = existingOrder.orderNumber;
    const updatedTableId = existingOrder.tableId;
    
    const nextBatch = Math.max(...existingOrder.items.map(i => i.batch || 1)) + 1;
    const itemsWithBatch = newItems.map(i => ({ ...i, batch: nextBatch }));
    const updatedItems = [...existingOrder.items, ...itemsWithBatch];
    const subtotal = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    let combinedNotes = existingOrder.notes;
    if (additionalNotes) {
      combinedNotes = combinedNotes ? `${combinedNotes} | ${additionalNotes}` : additionalNotes;
    }

    updateDoc(doc(db, 'orders', orderId), {
      items: updatedItems,
      subtotal,
      total: subtotal + existingOrder.tax,
      notes: combinedNotes,
      status: 'new' // Revert to new so kitchen sees the added items
    }).catch(console.error);

    if (updatedTableId) {
      updateDoc(doc(db, 'tables', updatedTableId), { status: 'occupied' }).catch(console.error);
    }

    // Notify Kitchen
    addNotification(`Additional items added to ${ordNum} for ${tableNumStr}`, 'cook');
    addToast('Items added to order successfully!');
  };

  const startPreparingOrder = (orderId: string) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedTableId = existingOrder.tableId;

    updateDoc(doc(db, 'orders', orderId), {
      status: 'preparing',
      preparingAt: timeStr,
    }).catch(console.error);

    if (updatedTableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === updatedTableId ? { ...t, status: 'preparing' } : t))
      );
    }
    
    addToast('Started preparing order', 'info');
  };

  const markOrderReady = (orderId: string) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tableNum = existingOrder.tableNumber;
    const ordNum = existingOrder.orderNumber;
    const updatedTableId = existingOrder.tableId;

    updateDoc(doc(db, 'orders', orderId), {
      status: 'ready',
      readyAt: timeStr,
    }).catch(console.error);

    if (updatedTableId) {
      updateDoc(doc(db, 'tables', updatedTableId), { status: 'ready' }).catch(console.error);
    }

    // High priority notification to Waiter
    addNotification(`${tableNum} — Order ${ordNum} is READY!`, 'waiter');
    addToast('Order marked as ready for serving!', 'success');
  };

  const serveOrder = (orderId: string) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tableNum = existingOrder.tableNumber;
    const ordNum = existingOrder.orderNumber;
    const updatedTableId = existingOrder.tableId;

    updateDoc(doc(db, 'orders', orderId), {
      status: 'served',
      servedAt: timeStr,
    }).catch(console.error);

    if (updatedTableId) {
      updateDoc(doc(db, 'tables', updatedTableId), { status: 'served' }).catch(console.error);
    }

    addNotification(`${tableNum} — Order ${ordNum} served to table!`, 'waiter');
    addToast('Order served successfully!');
  };

  const toggleItemServed = (orderId: string, itemIndex: number | number[]) => {
    const indices = Array.isArray(itemIndex) ? itemIndex : [itemIndex];
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;
    
    const updatedItems = [...existingOrder.items];
    indices.forEach(idx => {
      updatedItems[idx] = {
        ...updatedItems[idx],
        served: !updatedItems[idx].served,
      };
    });

    updateDoc(doc(db, 'orders', orderId), { items: updatedItems }).catch(console.error);
  };

  const removeItemFromOrder = (orderId: string, itemIndex: number | number[]) => {
    const indices = Array.isArray(itemIndex) ? itemIndex : [itemIndex];
    // Sort descending so splicing doesn't shift remaining indices
    const sortedIndices = [...indices].sort((a, b) => b - a);

    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;

    const updatedItems = [...existingOrder.items];
    sortedIndices.forEach(idx => {
      updatedItems.splice(idx, 1);
    });
    
    const newSubtotal = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    updateDoc(doc(db, 'orders', orderId), {
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal + existingOrder.tax
    }).catch(console.error);
    addToast('Item removed from order', 'info');
  };

  const completeOrder = (orderId: string, paymentMethod: PaymentMethod) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const completedOrder = orders.find(o => o.id === orderId);
    
    if (!completedOrder) return;

    updateDoc(doc(db, 'orders', orderId), {
      status: 'completed',
      paymentMethod,
      completedAt: timeStr,
    }).catch(console.error);

    // 1. Free Table
    updateDoc(doc(db, 'tables', completedOrder.tableId), {
      status: 'available',
      currentOrderId: null,
      activeWaiterId: null,
      activeWaiterName: null,
    }).catch(console.error);

    // 2. Automatically Deduct Ingredients from Stock
    // Calculate total ingredients used by completed order items
    const stockDeductions: Record<string, number> = {};

    completedOrder.items.forEach((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId || m.name === item.name);
      if (menuItem && menuItem.ingredients) {
        menuItem.ingredients.forEach((ing) => {
          const usedAmount = ing.amount * item.quantity;
          stockDeductions[ing.stockItemId] = (stockDeductions[ing.stockItemId] || 0) + usedAmount;
        });
      }
    });

    // Deduct from stockItems
    stockItems.forEach((st) => {
      if (stockDeductions[st.id]) {
        const deduction = stockDeductions[st.id];
        const newQty = Math.max(0, Math.round((st.available - deduction) * 100) / 100);
        const newStatus =
          newQty <= 0 ? 'out' : newQty <= st.minThreshold ? 'low' : 'good';
        
        if (newStatus === 'low' && st.status !== 'low') {
          addNotification(`Alert: ${st.name} stock is low (${newQty} ${st.unit} remaining)`, 'admin');
        }
        
        updateDoc(doc(db, 'stockItems', st.id), {
          available: newQty,
          status: newStatus,
        }).catch(console.error);
      }
    });

    addNotification(
      `Order ${completedOrder.orderNumber} completed (₹${completedOrder.total} via ${paymentMethod.toUpperCase()})`,
      'admin'
    );
    addToast(`Payment of ₹${completedOrder.total} received via ${paymentMethod.toUpperCase()}`, 'success');
  };

  const cancelOrder = (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    updateDoc(doc(db, 'orders', orderId), { status: 'cancelled' }).catch(console.error);

    if (ord.tableId) {
      updateDoc(doc(db, 'tables', ord.tableId), {
        status: 'available',
        currentOrderId: null,
        activeWaiterId: null,
        activeWaiterName: null
      }).catch(console.error);
    }
    addNotification(`Order ${ord.orderNumber} was cancelled`, 'all');
    addToast('Order cancelled successfully', 'error');
  };

  // Stock Management
  const addStock = (stockItemId: string, quantity: number, purchaseCost: number) => {
    const stockItem = stockItems.find((s) => s.id === stockItemId);
    if (!stockItem) return;

    const newAddition: StockAddition = {
      id: `sa-${Date.now()}`,
      stockItemId,
      stockItemName: stockItem.name,
      quantity,
      unit: stockItem.unit,
      purchaseCost,
      date: new Date().toISOString().split('T')[0],
    };

    setDoc(doc(db, 'stockAdditions', newAddition.id), newAddition).catch(console.error);

    // Update stock item
    const updatedQty = stockItem.available + quantity;
    updateDoc(doc(db, 'stockItems', stockItemId), {
      available: updatedQty,
      status: updatedQty <= stockItem.minThreshold ? 'low' : 'good'
    }).catch(console.error);

    // Also optionally record as an expense under 'Ingredients'
    if (purchaseCost > 0) {
      addExpense({
        name: `Restock: ${stockItem.name} (+${quantity} ${stockItem.unit})`,
        amount: purchaseCost,
        category: 'Ingredients',
        date: new Date().toISOString().split('T')[0],
        note: 'Inventory replenishment',
      });
    }

    addNotification(`Restocked ${quantity} ${stockItem.unit} of ${stockItem.name}`, 'admin');
  };

  const useStock = (
    stockItemId: string,
    quantity: number,
    purpose: string = 'Kitchen Prep',
    notes?: string
  ) => {
    const stockItem = stockItems.find((s) => s.id === stockItemId);
    if (!stockItem || quantity <= 0) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0];

    const newUsageRecord: MaterialUsageRecord = {
      id: `use-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      stockItemId,
      stockItemName: stockItem.name,
      amount: quantity,
      unit: stockItem.unit,
      purpose,
      notes,
      usedAt: timeStr,
      date: todayStr,
      loggedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Staff',
    };

    setDoc(doc(db, 'materialUsageLogs', newUsageRecord.id), newUsageRecord).catch(console.error);

    // Deduct from stock item
    const updatedQty = Math.max(0, Math.round((stockItem.available - quantity) * 100) / 100);
    const newStatus = updatedQty <= 0 ? 'out' : updatedQty <= stockItem.minThreshold ? 'low' : 'good';

    if (newStatus === 'low' && stockItem.status !== 'low') {
      addNotification(`Alert: ${stockItem.name} stock is low (${updatedQty} ${stockItem.unit} remaining)`, 'admin');
    } else if (newStatus === 'out' && stockItem.status !== 'out') {
      addNotification(`Alert: ${stockItem.name} is OUT OF STOCK!`, 'admin');
    }

    updateDoc(doc(db, 'stockItems', stockItemId), {
      available: updatedQty,
      status: newStatus,
    }).catch(console.error);

    addNotification(
      `Recorded usage: ${quantity} ${stockItem.unit} of ${stockItem.name} (${purpose})`,
      'admin'
    );
  };

  // Stock Usage calculations from all today's orders and manual usage logs
  const todayStockUsage = useMemo(() => {
    const usage: Record<string, { name: string; amount: number; unit: string }> = {
      'st-milk': { name: 'Milk', amount: 6.4, unit: 'L' },
      'st-coffee': { name: 'Coffee Beans', amount: 0.82, unit: 'KG' },
      'st-sugar': { name: 'Sugar', amount: 1.2, unit: 'KG' },
      'st-bread': { name: 'Bread', amount: 14, unit: 'Packs' },
      'st-cheese': { name: 'Cheese', amount: 0.9, unit: 'KG' },
      'st-potatoes': { name: 'Potatoes', amount: 3.5, unit: 'KG' },
    };

    // Add usage from manual logs
    materialUsageLogs.forEach((log) => {
      const current = usage[log.stockItemId] || {
        name: log.stockItemName,
        amount: 0,
        unit: log.unit,
      };
      current.amount = Math.round((current.amount + log.amount) * 100) / 100;
      usage[log.stockItemId] = current;
    });

    // Add usage from newly completed orders in this session
    orders.forEach((ord) => {
      if (ord.status === 'completed') {
        ord.items.forEach((item) => {
          const mi = menuItems.find((m) => m.id === item.menuItemId || m.name === item.name);
          if (mi?.ingredients) {
            mi.ingredients.forEach((ing) => {
              const current = usage[ing.stockItemId] || {
                name: ing.stockItemName,
                amount: 0,
                unit: ing.unit,
              };
              // Add modest incremental amounts
              current.amount = Math.round((current.amount + ing.amount * item.quantity * 0.05) * 100) / 100;
              usage[ing.stockItemId] = current;
            });
          }
        });
      }
    });

    return usage;
  }, [orders, menuItems, materialUsageLogs]);

  // Expenses
  const addExpense = (exp: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...exp,
      id: `exp-${Date.now()}`,
    };
    setDoc(doc(db, 'expenses', newExp.id), newExp).catch(console.error);
    addNotification(`New expense added: ${newExp.name} (₹${newExp.amount})`, 'admin');
    addToast(`Expense added successfully`);
  };

  // Menu Management
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`,
    };
    setDoc(doc(db, 'menuItems', newItem.id), newItem).catch(console.error);
    addNotification(`Menu item added: ${newItem.name} (₹${newItem.price})`, 'admin');
    addToast('Menu item added successfully!');
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    updateDoc(doc(db, 'menuItems', id), updates).catch(console.error);
    addToast('Menu item updated');
  };

  const toggleMenuItemAvailability = (id: string) => {
    const target = menuItems.find(m => m.id === id);
    if (target) {
      updateDoc(doc(db, 'menuItems', id), { available: !target.available }).catch(console.error);
    }
    addToast('Availability toggled', 'info');
  };

  // Table Management
  const addTable = (tbl: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tbl,
      id: `tbl-${Date.now()}`,
    };
    setDoc(doc(db, 'tables', newTable.id), newTable).catch(console.error);
    addToast('Table added successfully!');
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    updateDoc(doc(db, 'tables', id), updates).catch(console.error);
  };

  // User Management
  const addUser = (usr: Omit<User, 'id'>) => {
    const newUser: User = {
      ...usr,
      id: `u-${Date.now()}`,
    };
    setDoc(doc(db, 'users', newUser.id), newUser).catch(console.error);
    addNotification(`New team member added: ${newUser.name} (${newUser.role})`, 'admin');
  };

  const toggleUserStatus = (id: string) => {
    const target = users.find(u => u.id === id);
    if (target) {
      updateDoc(doc(db, 'users', id), { status: target.status === 'active' ? 'inactive' : 'active' }).catch(console.error);
    }
  };

  // Notifications
  const dismissNotification = (id: string) => {
    deleteDoc(doc(db, 'notifications', id)).catch(console.error);
  };

  const clearAllNotifications = () => {
    notifications.forEach(n => {
      deleteDoc(doc(db, 'notifications', n.id)).catch(console.error);
    });
  };

  // Staff Salary & Upaad Management
  const getNextSalaryPeriod = (period: string): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = period.split(' ');
    if (parts.length === 2) {
      const idx = months.indexOf(parts[0]);
      const yr = parseInt(parts[1], 10);
      if (idx !== -1) {
        if (idx === 11) {
          return `Jan ${yr + 1}`;
        }
        return `${months[idx + 1]} ${yr}`;
      }
    }
    return 'Oct 2026';
  };

  const addStaffMember = (staff: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...staff,
      id: `staff-${Date.now()}`,
    };
    setDoc(doc(db, 'staffMembers', newStaff.id), newStaff).catch(console.error);
    addNotification(`New staff member added: ${newStaff.name} (${newStaff.role})`, 'admin');
  };

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    updateDoc(doc(db, 'staffMembers', id), updates).catch(console.error);
  };

  const deleteStaffMember = (id: string) => {
    deleteDoc(doc(db, 'staffMembers', id)).catch(console.error);
    addNotification('Staff member removed', 'admin');
  };

  const giveUpaad = (params: { staffId: string; amount: number; date: string; note?: string }) => {
    const staff = staffMembers.find((s) => s.id === params.staffId);
    if (!staff) {
      return { success: false, error: 'Employee not found.' };
    }

    const currentUpaad = upaadRecords
      .filter((u) => u.staffId === staff.id && u.salaryPeriod === staff.currentPeriod)
      .reduce((sum, u) => sum + u.amount, 0);

    const remainingAllowed = staff.monthlySalary - currentUpaad;

    if (params.amount > remainingAllowed) {
      return {
        success: false,
        error: `Upaad cannot exceed the remaining salary of ₹${remainingAllowed.toLocaleString()}.`,
      };
    }

    const newRecord: UpaadRecord = {
      id: `upd-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.name,
      amount: params.amount,
      date: params.date,
      note: params.note || 'Salary advance',
      salaryPeriod: staff.currentPeriod,
      createdAt: new Date().toISOString(),
    };

    setDoc(doc(db, 'upaadRecords', newRecord.id), newRecord).catch(console.error);

    // Record as Staff expense
    addExpense({
      name: `Upaad: ${staff.name}`,
      amount: params.amount,
      category: 'Staff',
      date: params.date,
      note: `Salary advance (${staff.currentPeriod})${params.note ? ` - ${params.note}` : ''}`,
    });

    addNotification(
      `₹${params.amount.toLocaleString()} Upaad advance recorded for ${staff.name}`,
      'admin'
    );
    return { success: true };
  };

  const editUpaad = (id: string, updates: { amount: number; date: string; note?: string }) => {
    const target = upaadRecords.find((u) => u.id === id);
    if (!target) return { success: false, error: 'Upaad record not found.' };

    const staff = staffMembers.find((s) => s.id === target.staffId);
    if (!staff) return { success: false, error: 'Employee not found.' };

    const otherUpaad = upaadRecords
      .filter((u) => u.id !== id && u.staffId === staff.id && u.salaryPeriod === target.salaryPeriod)
      .reduce((sum, u) => sum + u.amount, 0);

    const remainingAllowed = staff.monthlySalary - otherUpaad;
    if (updates.amount > remainingAllowed) {
      return {
        success: false,
        error: `Upaad cannot exceed the remaining salary of ₹${remainingAllowed.toLocaleString()}.`,
      };
    }

    updateDoc(doc(db, 'upaadRecords', id), updates).catch(console.error);

    addNotification(`Updated Upaad record for ${target.staffName}`, 'admin');
    return { success: true };
  };

  const deleteUpaad = (id: string) => {
    const target = upaadRecords.find((u) => u.id === id);
    if (target) {
      deleteDoc(doc(db, 'upaadRecords', id)).catch(console.error);
      addNotification(`Deleted Upaad record of ₹${target.amount.toLocaleString()} for ${target.staffName}`, 'admin');
    }
  };

  const paySalary = (params: {
    staffId: string;
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
    paymentDate: string;
    note?: string;
  }) => {
    const staff = staffMembers.find((s) => s.id === params.staffId);
    if (!staff) return;

    const totalUpaad = upaadRecords
      .filter((u) => u.staffId === staff.id && u.salaryPeriod === staff.currentPeriod)
      .reduce((sum, u) => sum + u.amount, 0);

    const finalSalary = Math.max(0, staff.monthlySalary - totalUpaad);

    const paymentRecord: SalaryPaymentRecord = {
      id: `sal-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      month: staff.currentPeriod,
      monthlySalary: staff.monthlySalary,
      totalUpaad,
      paidAmount: finalSalary,
      paymentMethod: params.paymentMethod,
      paymentDate: params.paymentDate,
      status: 'Paid',
      note: params.note || `${staff.currentPeriod} Salary Settled`,
      createdAt: new Date().toISOString(),
    };

    setDoc(doc(db, 'salaryHistory', paymentRecord.id), paymentRecord).catch(console.error);

    // Record remaining salary as Staff expense
    if (finalSalary > 0) {
      addExpense({
        name: `${staff.name} Final Salary (${staff.currentPeriod})`,
        amount: finalSalary,
        category: 'Staff',
        date: params.paymentDate,
        note: `Salary settled via ${params.paymentMethod} (Monthly: ₹${staff.monthlySalary.toLocaleString()}, Upaad: ₹${totalUpaad.toLocaleString()}, Paid: ₹${finalSalary.toLocaleString()})`,
      });
    }

    // Start next salary period for this staff member (Section 11)
    const nextPeriod = getNextSalaryPeriod(staff.currentPeriod);
    updateDoc(doc(db, 'staffMembers', staff.id), { currentPeriod: nextPeriod }).catch(console.error);

    addNotification(
      `Salary of ₹${finalSalary.toLocaleString()} paid to ${staff.name} via ${params.paymentMethod} for ${staff.currentPeriod}`,
      'admin'
    );
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; isDestructive?: boolean }
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      ...options,
    });
  };

  // Reset demo data to pristine state
  const resetDemoData = () => {
    addToast('Demo reset is disabled. You are now using live Firebase data!', 'info');
  };

  return (
    <CafeContext.Provider
      value={{
        currentUser,
        currentRole,
        isLoggedIn,
        isMobileFrame,
        setIsMobileFrame,
        users,
        tables,
        menuItems,
        stockItems,
        orders,
        expenses,
        stockAdditions,
        materialUsageLogs,
        staffMembers,
        upaadRecords,
        salaryHistory,
        notifications,
        login,
        logout,
        switchRole,
        createOrder,
        addItemsToOrder,
        startPreparingOrder,
        markOrderReady,
        serveOrder,
        toggleItemServed,
        removeItemFromOrder,
        completeOrder,
        cancelOrder,
        addStock,
        useStock,
        todayStockUsage,
        addExpense,
        addMenuItem,
        updateMenuItem,
        toggleMenuItemAvailability,
        addTable,
        updateTable,
        addUser,
        toggleUserStatus,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        giveUpaad,
        editUpaad,
        deleteUpaad,
        paySalary,
        dismissNotification,
        clearAllNotifications,
        showConfirm,
        addToast,
        resetDemoData,
      }}
    >
      {children}
      <ConfirmModal 
        isOpen={confirmConfig?.isOpen || false}
        title={confirmConfig?.title || ''}
        message={confirmConfig?.message || ''}
        confirmText={confirmConfig?.confirmText}
        cancelText={confirmConfig?.cancelText}
        isDestructive={confirmConfig?.isDestructive}
        onConfirm={() => confirmConfig?.onConfirm()}
        onCancel={() => setConfirmConfig(prev => prev ? { ...prev, isOpen: false } : null)}
      />
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
