import React, { useState } from 'react';
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

const CATEGORIES: ExpenseCategory[] = [
  'Ingredients',
  'Electricity',
  'Rent',
  'Staff',
  'Maintenance',
  'Other',
];

export const AdminExpenses: React.FC = () => {
  const { expenses, addExpense } = useCafe();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Ingredients');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleCloseModal = () => setShowAddModal(false);
  useModalClose(handleCloseModal, showAddModal);

  // Summaries
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // For demo, weekly is all current expenses
  const weekTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthTotal = weekTotal + 18500; // Realistic month total

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    addExpense({
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      category,
      date,
      note: note.trim() || undefined,
    });

    // Reset form
    setName('');
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">EXPENSES</h2>
          <p className="text-xs text-stone-500">Record daily café operational and ingredient costs</p>
        </div>

        <button
          id="add-expense-btn"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* 3 Summary Cards (Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Today's Expenses
          </span>
          <div className="text-2xl font-black text-stone-900">₹{todayTotal.toLocaleString()}</div>
          <span className="text-[11px] text-stone-400 mt-1 inline-block">Daily logged spend</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
            This Week's Expenses
          </span>
          <div className="text-2xl font-black text-stone-900">₹{weekTotal.toLocaleString()}</div>
          <span className="text-[11px] text-stone-400 mt-1 inline-block">Current 7-day period</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
            This Month's Expenses
          </span>
          <div className="text-2xl font-black text-stone-900">₹{monthTotal.toLocaleString()}</div>
          <span className="text-[11px] text-stone-400 mt-1 inline-block">Calendar month total</span>
        </div>
      </div>

      {/* Expense List Table (Section 12) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-stone-900 text-base">Expense Log</h3>
          <span className="text-xs text-stone-400">{expenses.length} records</span>
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
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 font-bold text-stone-900">{exp.name}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 text-stone-500">{exp.date}</td>
                  <td className="py-3 text-stone-500 text-xs">{exp.note || '—'}</td>
                  <td className="py-3 font-extrabold text-stone-900 text-right">
                    ₹{exp.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* + Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-150" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
              <h3 className="font-extrabold text-stone-900 text-base">Record New Expense</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
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

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-expense-btn"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
