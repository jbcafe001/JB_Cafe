import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table, TableStatus } from '../../types';
import { Plus, Users, Edit, X, Grid, CheckCircle2 } from 'lucide-react';

export const AdminTables: React.FC = () => {
  const { tables, addTable, updateTable } = useCafe();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [number, setNumber] = useState('');
  const [seats, setSeats] = useState('4');

  const handleOpenAdd = () => {
    const nextNum = (tables.length + 1).toString().padStart(2, '0');
    setNumber(nextNum);
    setSeats('4');
    setEditingTable(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (tbl: Table) => {
    setEditingTable(tbl);
    setNumber(tbl.number);
    setSeats(tbl.seats.toString());
    setShowAddModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !seats) return;

    if (editingTable) {
      updateTable(editingTable.id, {
        number: number.trim(),
        name: `Table ${number.trim()}`,
        seats: parseInt(seats, 10) || 4,
      });
    } else {
      addTable({
        number: number.trim(),
        name: `Table ${number.trim()}`,
        seats: parseInt(seats, 10) || 4,
        status: 'available',
      });
    }

    setShowAddModal(false);
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'occupied':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'preparing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ready':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'served':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">TABLE MANAGEMENT</h2>
          <p className="text-xs text-stone-500">Floor arrangement, seating capacity, and occupancy status</p>
        </div>

        <button
          id="add-table-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Table</span>
        </button>
      </div>

      {/* Tables Grid (Section 17) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="font-extrabold text-stone-900 text-lg">{table.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${getStatusBadge(
                    table.status
                  )}`}
                >
                  {table.status}
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
                className="text-xs text-stone-600 hover:text-stone-900 font-semibold flex items-center space-x-1"
              >
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>

              {table.status !== 'available' && (
                <button
                  onClick={() => updateTable(table.id, { status: 'available', currentOrderId: undefined })}
                  className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="font-extrabold text-stone-900 text-base">
                {editingTable ? 'Edit Table' : '+ Add Café Table'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
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
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="11"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Seating Capacity (Guests) *</label>
                <select
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="2">2 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6 Guests</option>
                  <option value="8">8 Guests</option>
                  <option value="10">10 Guests</option>
                </select>
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
                  id="save-table-btn"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs"
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
