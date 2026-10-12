import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table, TableStatus } from '../../types';
import { Plus, Users, Edit, X, Grid, CheckCircle2 } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { useModalClose } from '../../hooks/useModalClose';

export const AdminTables: React.FC = () => {
  const { tables, addTable, updateTable } = useCafe();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [number, setNumber] = useState('');
  const [seats, setSeats] = useState('4');
  const [numberError, setNumberError] = useState('');

  const handleCloseModal = () => setShowAddModal(false);
  useModalClose(handleCloseModal, showAddModal);

  const handleOpenAdd = () => {
    const nextNum = (tables.length + 1).toString().padStart(2, '0');
    setNumber(nextNum);
    setSeats('4');
    setEditingTable(null);
    setNumberError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (tbl: Table) => {
    setEditingTable(tbl);
    setNumber(tbl.number);
    setSeats(tbl.seats.toString());
    setNumberError('');
    setShowAddModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !seats) return;

    // Check for duplicate table number (exclude the current table when editing)
    const trimmed = number.trim();
    const isDuplicate = tables.some(
      (t) => t.number === trimmed && t.id !== editingTable?.id
    );
    if (isDuplicate) {
      setNumberError(`Table ${trimmed} already exists. Please choose a different number.`);
      return;
    }

    setNumberError('');

    if (editingTable) {
      updateTable(editingTable.id, {
        number: trimmed,
        name: `Table ${trimmed}`,
        seats: parseInt(seats, 10) || 4,
      });
    } else {
      addTable({
        number: trimmed,
        name: `Table ${trimmed}`,
        seats: parseInt(seats, 10) || 4,
        status: 'available',
      });
    }

    setShowAddModal(false);
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'occupied':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'preparing':
        return 'bg-orange-50 text-orange-900 border-orange-200';
      case 'ready':
        return 'bg-teal-50 text-teal-900 border-teal-200';
      case 'served':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const getTableCardBg = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'bg-gradient-to-br from-emerald-50/40 via-white to-white border-emerald-200/80';
      case 'occupied':
        return 'bg-gradient-to-br from-amber-50/50 via-white to-white border-amber-200/90';
      case 'preparing':
        return 'bg-gradient-to-br from-orange-50/50 via-white to-white border-orange-200/90';
      case 'ready':
        return 'bg-gradient-to-br from-teal-50/50 via-white to-white border-teal-200/90';
      case 'served':
        return 'bg-gradient-to-br from-purple-50/50 via-white to-white border-purple-200/90';
      default:
        return 'bg-white border-stone-200/90';
    }
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">TABLE MANAGEMENT</h2>
          <p className="text-xs text-stone-500">Floor arrangement, seating capacity, and occupancy status</p>
        </div>

        <button
          id="add-table-btn"
          onClick={handleOpenAdd}
          className="btn-interactive w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md shadow-teal-700/15 flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Table</span>
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tables.map((table, idx) => (
          <div
            key={table.id}
            style={{ animationDelay: `${(idx % 10) * 40}ms` }}
            className={`card-interactive border rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[148px] ${getTableCardBg(table.status)}`}
          >
            <div>
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex items-center justify-between w-full">
                  <span className="font-extrabold text-stone-900 text-base sm:text-lg whitespace-nowrap">{table.name}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${table.status === 'available' ? 'bg-emerald-500 animate-emerald-pulse' : 'bg-amber-500 animate-live-pulse'}`} />
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full capitalize border ${getStatusBadge(
                    table.status
                  )}`}
                >
                  {table.status === 'occupied' ? 'Order Taken' : table.status}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-stone-500 mt-2">
                <Users className="w-3.5 h-3.5" />
                <span>{table.seats} Seats</span>
              </div>

              {table.activeWaiterName && (
                <p className="text-[11px] text-stone-400 mt-1">
                  Waiter: <strong className="text-stone-700">{table.activeWaiterName}</strong>
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => handleOpenEdit(table)}
                className="btn-interactive text-xs text-stone-600 hover:text-stone-900 font-semibold flex items-center space-x-1 px-1.5 py-1 rounded-lg"
              >
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>

              {table.status !== 'available' && (
                <button
                  onClick={() => updateTable(table.id, { status: 'available', currentOrderId: undefined })}
                  className="btn-interactive text-[10px] text-emerald-800 font-bold bg-emerald-100/80 px-2 py-1 rounded-lg hover:bg-emerald-200 transition-colors shadow-2xs"
                >
                  Free Table
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/35 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={handleCloseModal}>
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-stone-200/80 animate-modal-spring overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/80">
              <h3 className="font-extrabold text-stone-900 text-base">
                {editingTable ? 'Edit Table' : '+ Add Café Table'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-interactive p-1.5 rounded-xl text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Table Number (e.g. 11) *</label>
                <input
                  type="text"
                  required
                  value={number}
                  onChange={(e) => { setNumber(e.target.value); setNumberError(''); }}
                  placeholder="11"
                  className={`w-full px-3 py-2 bg-stone-50 border rounded-xl focus:ring-1 focus:outline-hidden transition-all ${
                    numberError
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-stone-200 focus:ring-amber-500'
                  }`}
                />
                {numberError && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-slide-in-right">
                    <span>⚠</span> {numberError}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Seating Capacity (Guests) *</label>
                <CustomSelect
                  value={seats}
                  onChange={(val) => setSeats(val)}
                  options={[
                    { value: '2', label: '2 Guests' },
                    { value: '4', label: '4 Guests' },
                    { value: '6', label: '6 Guests' },
                    { value: '8', label: '8 Guests' },
                    { value: '10', label: '10 Guests' },
                  ]}
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-interactive px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-table-btn"
                  className="btn-interactive px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-600/20"
                >
                  {editingTable ? 'Save Table' : 'Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
