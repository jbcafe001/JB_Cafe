export type UserRole = 'admin' | 'waiter' | 'cook' | 'others';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatar?: string;
  phone?: string;
}

export type TableStatus = 'available' | 'occupied' | 'preparing' | 'ready' | 'served';

export interface Table {
  id: string;
  number: string; // e.g., "01", "02", "04"
  name: string;   // e.g., "Table 04"
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
  activeWaiterId?: string;
  activeWaiterName?: string;
}

export type MenuItemCategory =
  | 'All'
  | 'Coffee'
  | 'Tea'
  | 'Beverages'
  | 'Snacks'
  | 'Main Course'
  | 'Desserts';

export interface RecipeIngredient {
  stockItemId: string;
  stockItemName: string;
  amount: number; // e.g. 18 for grams, 150 for ml
  unit: string;   // 'g', 'ml', 'packs', 'units', 'kg', 'l'
}

export interface MenuItem {
  id: string;
  name: string;
  category: Exclude<MenuItemCategory, 'All'>;
  price: number;
  available: boolean;
  description?: string;
  ingredients: RecipeIngredient[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  served?: boolean;
  prepared?: number;
  batch?: number;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi' | 'card';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#1042"
  tableId: string;
  tableNumber: string; // "Table 04"
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  date: string;          // ISO date YYYY-MM-DD
  createdAt: string;     // ISO or readable
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;     // when waiter serves to table
  completedAt?: string;
  paymentMethod?: PaymentMethod;
}

export interface StockItem {
  id: string;
  name: string;
  available: number;
  unit: string;          // 'L', 'KG', 'Packs', 'Units'
  minThreshold: number;
  costPerUnit: number;
  status: 'good' | 'low' | 'out';
}

export interface StockUsageEntry {
  stockItemId: string;
  stockItemName: string;
  amountUsed: number;
  unit: string;
}

export interface MaterialUsageRecord {
  id: string;
  stockItemId: string;
  stockItemName: string;
  amount: number;
  unit: string;
  purpose: string;
  notes?: string;
  usedAt: string;
  date: string;
  loggedBy?: string;
}

export interface StockAddition {
  id: string;
  stockItemId: string;
  stockItemName: string;
  quantity: number;
  unit: string;
  purchaseCost: number;
  date: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Ingredients'
  | 'Staff'
  | 'Staff Salary'
  | 'Maintenance'
  | 'Other';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
}

export interface CafeNotification {
  id: string;
  message: string;
  targetRole: UserRole | 'all';
  timestamp: string;
  read: boolean;
}

// Staff Salary & Upaad Management
export type StaffRole = 'Waiter' | 'Kitchen' | 'Admin' | 'Other Staff';
export type SalaryStatus = 'Pending' | 'Partially Paid' | 'Paid';

export interface UpaadRecord {
  id: string;
  staffId: string;
  staffName: string;
  amount: number;
  date: string; // e.g. '10 Sep 2026'
  note?: string;
  salaryPeriod: string; // e.g. 'Sep 2026'
  createdAt: string;
}

export interface SalaryPaymentRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  month: string; // e.g. 'Sep 2026'
  monthlySalary: number;
  totalUpaad: number;
  paidAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
  paymentDate: string;
  status: 'Paid';
  note?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  monthlySalary: number;
  salaryDateDay: number; // e.g. 30
  salaryDateDisplay: string; // e.g. '30 Sep'
  currentPeriod: string; // e.g. 'Sep 2026'
  joiningDate: string; // e.g. '12 Jan 2025'
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface ApiResponse<T = any> {
  message: string;
  status: number | string;
  toast: boolean;
  data?: T;
}

export interface CafeSettings {
  cafeName: string;
  currencySymbol: string;
  outletTerminal: string;
  taxConfig: string;
}
