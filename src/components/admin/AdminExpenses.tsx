import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCafe } from '../../context/CafeContext';
import { Expense, ExpenseCategory } from '../../types';
import {
  Plus,
  Receipt,
  X,
  Calendar,
  Layers,
  FileText,
  Trash2,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { useModalClose } from '../../hooks/useModalClose';
import { getCafeBusinessDate } from '../../utils/dateUtils';

const CATEGORIES: ExpenseCategory[] = [
  'Ingredients',
  'Electricity',
  'Rent',
  'Staff',
  'Maintenance',
  'Other',
];

export const AdminExpenses: React.FC = () => {
  const { expenses, addExpense, currentUser } = useCafe();

  const isKunafaAdmin = currentUser?.role === 'admin_kunafa';

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterBrand, setFilterBrand] = useState<'All' | 'JB Cafe' | 'KUNAFA'>('All');
  const [expenseBrand, setExpenseBrand] = useState<'JB Cafe' | 'KUNAFA'>('JB Cafe');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Ingredients');
  const [date, setDate] = useState(getCafeBusinessDate());
  const [note, setNote] = useState('');

  const handleCloseModal = () => setShowAddModal(false);
  useModalClose(handleCloseModal, showAddModal);

  const displayedExpenses = expenses.filter(e => {
    const b = e.brand || 'JB Cafe';
    if (isKunafaAdmin) return b === 'KUNAFA';
    if (filterBrand !== 'All') return b === filterBrand;
    return true;
  });

  // Summaries
  const todayStr = getCafeBusinessDate();
  const todayTotal = displayedExpenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // For demo, weekly is all current expenses
  const weekTotal = displayedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthTotal = weekTotal; // True month total based on DB

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    addExpense({
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      category,
      date,
      note: note.trim() || undefined,
      brand: isKunafaAdmin ? 'KUNAFA' : expenseBrand,
    });

    // Reset form
    setName('');
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">EXPENSES</h2>
          <p className="text-xs text-stone-500">Record daily café operational and ingredient costs</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {!isKunafaAdmin && (
            <div className="flex bg-stone-100 p-1 rounded-xl w-full sm:w-auto">
              {(['All', 'JB Cafe', 'KUNAFA'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setFilterBrand(b)}
                  className={`btn-interactive flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterBrand === b ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
          <button
            id="add-expense-btn"
            onClick={() => {
              setExpenseBrand(isKunafaAdmin ? 'KUNAFA' : 'JB Cafe');
              setShowAddModal(true);
            }}
            className="btn-interactive w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards (Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-interactive stagger-1 bg-gradient-to-br from-rose-50 via-rose-50/40 to-orange-50/30 border border-rose-200/90 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
            Today's Expenses
          </span>
          <div className="text-2xl font-black text-rose-950">₹{todayTotal.toLocaleString()}</div>
          <span className="text-[11px] text-rose-600/70 mt-1 inline-block">Daily logged spend</span>
        </div>

        <div className="card-interactive stagger-2 bg-gradient-to-br from-amber-50 via-amber-50/40 to-yellow-50/30 border border-amber-200/90 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
            This Week's Expenses
          </span>
          <div className="text-2xl font-black text-amber-950">₹{weekTotal.toLocaleString()}</div>
          <span className="text-[11px] text-amber-600/70 mt-1 inline-block">Current 7-day period</span>
        </div>

        <div className="card-interactive stagger-3 bg-gradient-to-br from-purple-50 via-purple-50/40 to-indigo-50/30 border border-purple-200/90 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
            This Month's Expenses
          </span>
          <div className="text-2xl font-black text-purple-950">₹{monthTotal.toLocaleString()}</div>
          <span className="text-[11px] text-purple-600/70 mt-1 inline-block">Calendar month total</span>
        </div>
      </div>

      {/* Expense List Table (Section 12) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-stone-900 text-base">Expense Log</h3>
          <span className="text-xs text-stone-400">{displayedExpenses.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="pb-2.5">Expense Name</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Note</th>
                <th className="pb-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {displayedExpenses.map((exp) => {
                const getCategoryStyle = (cat: string) => {
                  switch (cat) {
                    case 'Ingredients':
                      return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
                    case 'Electricity':
                      return 'bg-amber-50 text-amber-800 border-amber-200/80';
                    case 'Rent':
                      return 'bg-purple-50 text-purple-800 border-purple-200/80';
                    case 'Staff':
                      return 'bg-sky-50 text-sky-800 border-sky-200/80';
                    case 'Maintenance':
                      return 'bg-orange-50 text-orange-800 border-orange-200/80';
                    default:
                      return 'bg-stone-100 text-stone-700 border-stone-200/80';
                  }
                };

                return (
                  <tr key={exp.id} className="table-row-interactive hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 font-bold text-stone-900">
                      {exp.name}
                      {!isKunafaAdmin && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                          exp.brand === 'KUNAFA'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {exp.brand || 'JB Cafe'}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryStyle(exp.category)}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 text-stone-500">{exp.date}</td>
                    <td className="py-3 text-stone-500 text-xs">{exp.note || '—'}</td>
                    <td className="py-3 font-extrabold text-stone-900 text-right">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* + Add Expense Modal */}
      {showAddModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4 animate-fade-in"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200/80 animate-modal-spring overflow-hidden my-auto max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-amber-200/60 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-[#FAF7F2] to-orange-50/80 shrink-0">
                <h3 className="font-extrabold text-stone-900 text-base">Record New Expense</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-interactive p-1.5 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Expense Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Milk Purchase, Commercial Gas, Paper Cups..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="2500"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Category</label>
                    <CustomSelect
                      value={category}
                      onChange={(val) => setCategory(val as ExpenseCategory)}
                      options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Note (Optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Invoice #204 from Dairy supplier"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                {!isKunafaAdmin && (
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Brand</label>
                    <CustomSelect
                      value={expenseBrand}
                      onChange={(val) => setExpenseBrand(val as 'JB Cafe' | 'KUNAFA')}
                      options={[{ value: 'JB Cafe', label: 'JB Cafe' }, { value: 'KUNAFA', label: 'KUNAFA' }]}
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="save-expense-btn"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
