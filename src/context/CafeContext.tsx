import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { ConfirmModal } from '../components/common/ConfirmModal';
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
import {
  INITIAL_USERS,
  INITIAL_STOCK,
  INITIAL_MENU,
  INITIAL_TABLES,
  INITIAL_EXPENSES,
  INITIAL_STOCK_USAGE_LOGS,
  INITIAL_STAFF_MEMBERS,
  INITIAL_UPAAD_RECORDS,
  INITIAL_SALARY_HISTORY,
  generateSampleHistory,
} from '../data/initialData';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

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
  toggleItemServed: (orderId: string, itemIndex: number) => void;
  removeItemFromOrder: (orderId: string, itemIndex: number) => void;
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

  const saved = loadSavedState();

  const [users, setUsers] = useState<User[]>(saved?.users || INITIAL_USERS);
  const [currentRole, setCurrentRole] = useState<UserRole>(saved?.currentRole || 'waiter');
  const [currentUser, setCurrentUser] = useState<User | null>(
    saved?.currentUser || null
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(saved?.isLoggedIn ?? false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  const [tables, setTables] = useState<Table[]>(saved?.tables || INITIAL_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(saved?.menuItems || INITIAL_MENU);
  const [stockItems, setStockItems] = useState<StockItem[]>(saved?.stockItems || INITIAL_STOCK);
  const [orders, setOrders] = useState<Order[]>(saved?.orders || generateSampleHistory());
  const [expenses, setExpenses] = useState<Expense[]>(saved?.expenses || INITIAL_EXPENSES);
  const [stockAdditions, setStockAdditions] = useState<StockAddition[]>(saved?.stockAdditions || []);
  const [materialUsageLogs, setMaterialUsageLogs] = useState<MaterialUsageRecord[]>(
    saved?.materialUsageLogs || INITIAL_STOCK_USAGE_LOGS
  );
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(saved?.staffMembers || INITIAL_STAFF_MEMBERS);
  const [upaadRecords, setUpaadRecords] = useState<UpaadRecord[]>(saved?.upaadRecords || INITIAL_UPAAD_RECORDS);
  const [salaryHistory, setSalaryHistory] = useState<SalaryPaymentRecord[]>(
    saved?.salaryHistory || INITIAL_SALARY_HISTORY
  );
  const [notifications, setNotifications] = useState<CafeNotification[]>(saved?.notifications || [
    {
      id: 'notif-welcome',
      message: 'Welcome to Brew & Bite Café Management Demo',
      targetRole: 'all',
      timestamp: 'Just now',
      read: false,
    },
    {
      id: 'notif-ready-table2',
      message: 'Table 02: Order #1043 is READY for serving!',
      targetRole: 'waiter',
      timestamp: '2 min ago',
      read: false,
    },
  ]);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const isRemoteUpdate = useRef(false);
  const [isSyncing, setIsSyncing] = useState(true);

  // 1. Listen for Firestore changes
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'cafe', 'mainState'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        isRemoteUpdate.current = true;
        
        if (data.users) setUsers(data.users);
        if (data.tables) setTables(data.tables);
        if (data.menuItems) setMenuItems(data.menuItems);
        if (data.stockItems) setStockItems(data.stockItems);
        if (data.orders) setOrders(data.orders);
        if (data.expenses) setExpenses(data.expenses);
        if (data.stockAdditions) setStockAdditions(data.stockAdditions);
        if (data.materialUsageLogs) setMaterialUsageLogs(data.materialUsageLogs);
        if (data.staffMembers) setStaffMembers(data.staffMembers);
        if (data.upaadRecords) setUpaadRecords(data.upaadRecords);
        if (data.salaryHistory) setSalaryHistory(data.salaryHistory);
        if (data.notifications) setNotifications(data.notifications);
      }
      setIsSyncing(false);
    });

    return () => unsub();
  }, []);

  // 2. Persist state changes
  useEffect(() => {
    if (isSyncing) return;
    
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const stateToSave = {
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
    };

    // Firebase does not allow undefined values, so we use JSON serialize/deserialize to strip them out
    const cleanState = JSON.parse(JSON.stringify(stateToSave));
    setDoc(doc(db, 'cafe', 'mainState'), cleanState).catch(console.error);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...stateToSave,
          currentRole,
          currentUser,
          isLoggedIn,
        })
      );
    } catch {
      // ignore
    }
  }, [
    isSyncing,
    users,
    currentRole,
    currentUser,
    isLoggedIn,
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
  ]);

  const addNotification = (message: string, targetRole: UserRole | 'all' = 'all') => {
    const newNotif: CafeNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      message,
      targetRole,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
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
      notes,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update Table status to occupied
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'occupied',
              currentOrderId: newOrder.id,
              activeWaiterId: newOrder.waiterId,
              activeWaiterName: newOrder.waiterName,
            }
          : t
      )
    );

    // Notify Kitchen
    addNotification(`New order ${orderNumber} received for ${tableNumStr}`, 'cook');

    return newOrder;
  };

  const addItemsToOrder = (orderId: string, newItems: OrderItem[], additionalNotes?: string) => {
    let tableNumStr = 'Table';
    let ordNum = '';
    let updatedTableId: string | undefined;
    
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          tableNumStr = ord.tableNumber;
          ordNum = ord.orderNumber;
          updatedTableId = ord.tableId;
          
          const nextBatch = Math.max(...ord.items.map(i => i.batch || 1)) + 1;
          const itemsWithBatch = newItems.map(i => ({ ...i, batch: nextBatch }));
          const updatedItems = [...ord.items, ...itemsWithBatch];
          const subtotal = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
          
          let combinedNotes = ord.notes;
          if (additionalNotes) {
            combinedNotes = combinedNotes ? `${combinedNotes} | ${additionalNotes}` : additionalNotes;
          }

          return {
            ...ord,
            items: updatedItems,
            subtotal,
            total: subtotal + ord.tax,
            notes: combinedNotes,
            status: 'new' // Revert to new so kitchen sees the added items
          };
        }
        return ord;
      })
    );

    if (updatedTableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === updatedTableId ? { ...t, status: 'occupied' } : t))
      );
    }

    // Notify Kitchen
    addNotification(`Additional items added to ${ordNum} for ${tableNumStr}`, 'cook');
  };

  const startPreparingOrder = (orderId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedTableId: string | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          updatedTableId = ord.tableId;
          return { ...ord, status: 'preparing', preparingAt: timeStr };
        }
        return ord;
      })
    );

    if (updatedTableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === updatedTableId ? { ...t, status: 'preparing' } : t))
      );
    }
  };

  const markOrderReady = (orderId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let tableNum = 'Table';
    let ordNum = '';
    let updatedTableId: string | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          tableNum = ord.tableNumber;
          ordNum = ord.orderNumber;
          updatedTableId = ord.tableId;
          return { ...ord, status: 'ready', readyAt: timeStr };
        }
        return ord;
      })
    );

    if (updatedTableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === updatedTableId ? { ...t, status: 'ready' } : t))
      );
    }

    // High priority notification to Waiter
    addNotification(`${tableNum} — Order ${ordNum} is READY!`, 'waiter');
  };

  const serveOrder = (orderId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let tableNum = 'Table';
    let ordNum = '';
    let updatedTableId: string | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          tableNum = ord.tableNumber;
          ordNum = ord.orderNumber;
          updatedTableId = ord.tableId;
          return { ...ord, status: 'served', servedAt: timeStr };
        }
        return ord;
      })
    );

    if (updatedTableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === updatedTableId ? { ...t, status: 'served' } : t))
      );
    }

    addNotification(`${tableNum} — Order ${ordNum} served to table!`, 'waiter');
  };

  const toggleItemServed = (orderId: string, itemIndex: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedItems = [...ord.items];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            served: !updatedItems[itemIndex].served,
          };
          return { ...ord, items: updatedItems };
        }
        return ord;
      })
    );
  };

  const removeItemFromOrder = (orderId: string, itemIndex: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedItems = [...ord.items];
          updatedItems.splice(itemIndex, 1);
          
          const newSubtotal = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
          
          return { 
            ...ord, 
            items: updatedItems,
            subtotal: newSubtotal,
            total: newSubtotal + ord.tax 
          };
        }
        return ord;
      })
    );
  };

  const completeOrder = (orderId: string, paymentMethod: PaymentMethod) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let completedOrder: Order | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          completedOrder = {
            ...ord,
            status: 'completed',
            paymentMethod,
            completedAt: timeStr,
          };
          return completedOrder;
        }
        return ord;
      })
    );

    if (!completedOrder) return;

    // 1. Free Table
    setTables((prev) =>
      prev.map((t) =>
        t.id === completedOrder!.tableId
          ? {
              ...t,
              status: 'available',
              currentOrderId: undefined,
              activeWaiterId: undefined,
              activeWaiterName: undefined,
            }
          : t
      )
    );

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
    setStockItems((prev) =>
      prev.map((st) => {
        if (stockDeductions[st.id]) {
          const deduction = stockDeductions[st.id];
          const newQty = Math.max(0, Math.round((st.available - deduction) * 100) / 100);
          const newStatus =
            newQty <= 0 ? 'out' : newQty <= st.minThreshold ? 'low' : 'good';
          
          if (newStatus === 'low' && st.status !== 'low') {
            addNotification(`Alert: ${st.name} stock is low (${newQty} ${st.unit} remaining)`, 'admin');
          }
          return {
            ...st,
            available: newQty,
            status: newStatus,
          };
        }
        return st;
      })
    );

    addNotification(
      `Order ${completedOrder.orderNumber} completed (₹${completedOrder.total} via ${paymentMethod.toUpperCase()})`,
      'admin'
    );
  };

  const cancelOrder = (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );

    if (ord.tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === ord.tableId
            ? { ...t, status: 'available', currentOrderId: undefined, activeWaiterId: undefined, activeWaiterName: undefined }
            : t
        )
      );
    }
    addNotification(`Order ${ord.orderNumber} was cancelled`, 'all');
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

    setStockAdditions((prev) => [newAddition, ...prev]);

    // Update stock item
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === stockItemId) {
          const updatedQty = item.available + quantity;
          return {
            ...item,
            available: updatedQty,
            status: updatedQty <= item.minThreshold ? 'low' : 'good',
          };
        }
        return item;
      })
    );

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

    setMaterialUsageLogs((prev) => [newUsageRecord, ...prev]);

    // Deduct from stock item
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === stockItemId) {
          const updatedQty = Math.max(0, Math.round((item.available - quantity) * 100) / 100);
          const newStatus =
            updatedQty <= 0 ? 'out' : updatedQty <= item.minThreshold ? 'low' : 'good';

          if (newStatus === 'low' && item.status !== 'low') {
            addNotification(
              `Alert: ${item.name} stock is low (${updatedQty} ${item.unit} remaining)`,
              'admin'
            );
          } else if (newStatus === 'out' && item.status !== 'out') {
            addNotification(`Alert: ${item.name} is OUT OF STOCK!`, 'admin');
          }

          return {
            ...item,
            available: updatedQty,
            status: newStatus,
          };
        }
        return item;
      })
    );

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
    setExpenses((prev) => [newExp, ...prev]);
    addNotification(`New expense added: ${newExp.name} (₹${newExp.amount})`, 'admin');
  };

  // Menu Management
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`,
    };
    setMenuItems((prev) => [...prev, newItem]);
    addNotification(`Menu item added: ${newItem.name} (₹${newItem.price})`, 'admin');
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const toggleMenuItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m))
    );
  };

  // Table Management
  const addTable = (tbl: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tbl,
      id: `tbl-${Date.now()}`,
    };
    setTables((prev) => [...prev, newTable]);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  // User Management
  const addUser = (usr: Omit<User, 'id'>) => {
    const newUser: User = {
      ...usr,
      id: `u-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    addNotification(`New team member added: ${newUser.name} (${newUser.role})`, 'admin');
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    );
  };

  // Notifications
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
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
    setStaffMembers((prev) => [...prev, newStaff]);
    addNotification(`New staff member added: ${newStaff.name} (${newStaff.role})`, 'admin');
  };

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    setStaffMembers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStaffMember = (id: string) => {
    setStaffMembers((prev) => prev.filter((s) => s.id !== id));
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

    setUpaadRecords((prev) => [newRecord, ...prev]);

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

    setUpaadRecords((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );

    addNotification(`Updated Upaad record for ${target.staffName}`, 'admin');
    return { success: true };
  };

  const deleteUpaad = (id: string) => {
    const target = upaadRecords.find((u) => u.id === id);
    if (target) {
      setUpaadRecords((prev) => prev.filter((u) => u.id !== id));
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

    setSalaryHistory((prev) => [paymentRecord, ...prev]);

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
    setStaffMembers((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, currentPeriod: nextPeriod } : s))
    );

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
    localStorage.removeItem(STORAGE_KEY);
    setUsers(INITIAL_USERS);
    setCurrentRole('waiter');
    setCurrentUser(INITIAL_USERS[1]);
    setIsLoggedIn(true);
    setTables(INITIAL_TABLES);
    setMenuItems(INITIAL_MENU);
    setStockItems(INITIAL_STOCK);
    setOrders(generateSampleHistory());
    setExpenses(INITIAL_EXPENSES);
    setStockAdditions([]);
    setMaterialUsageLogs(INITIAL_STOCK_USAGE_LOGS);
    setStaffMembers(INITIAL_STAFF_MEMBERS);
    setUpaadRecords(INITIAL_UPAAD_RECORDS);
    setSalaryHistory(INITIAL_SALARY_HISTORY);
    setNotifications([
      {
        id: `notif-${Date.now()}`,
        message: 'Demo data reset to initial state. Table 04 is ready for ordering!',
        targetRole: 'all',
        timestamp: 'Just now',
        read: false,
      },
    ]);
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
