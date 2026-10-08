import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { StockItem } from '../../types';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  ArrowDownRight,
  TrendingDown,
  X,
  Layers,
  Sparkles,
  Calculator,
  CheckCircle2,
  ClipboardList,
  History,
  Filter,
  Clock,
  User,
  Info,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { useModalClose } from '../../hooks/useModalClose';

export const AdminStock: React.FC = () => {
  const { stockItems, createStockItem, addStock, useStock, todayStockUsage, materialUsageLogs } = useCafe();

  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showUseStockModal, setShowUseStockModal] = useState(false);
  const [showCreateMaterialModal, setShowCreateMaterialModal] = useState(false);
  
  const [selectedStockItemId, setSelectedStockItemId] = useState<string>(stockItems[0]?.id || '');
  const [selectedItemUnit, setSelectedItemUnit] = useState(stockItems[0]?.unit || 'L');

  // Restock modal state
  const [quantity, setQuantity] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');

  // Use Stock modal state
  const [useQuantity, setUseQuantity] = useState('');
  const [usePurpose, setUsePurpose] = useState('Kitchen Cooking & Prep');
  const [useNotes, setUseNotes] = useState('');
  
  // Create Material modal state
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUnit, setNewMaterialUnit] = useState('KG');
  const [newMaterialMinThreshold, setNewMaterialMinThreshold] = useState('5');
  const [newMaterialCost, setNewMaterialCost] = useState('100');

  // Material Usage Log filter
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState('all');

  useModalClose(() => setShowUseStockModal(false), showUseStockModal);
  useModalClose(() => setShowAddStockModal(false), showAddStockModal);
  useModalClose(() => setShowCreateMaterialModal(false), showCreateMaterialModal);

  // Overview metrics
  const totalItems = stockItems.length;
  const lowStockCount = stockItems.filter((s) => s.status === 'low').length;
  const outOfStockCount = stockItems.filter((s) => s.status === 'out').length;
  const totalStockValue = stockItems.reduce((sum, s) => sum + s.available * s.costPerUnit, 0);

  const selectedItem = stockItems.find((s) => s.id === selectedStockItemId);

  // Auto-calculate purchase cost based on quantity entered and unit cost
  useEffect(() => {
    if (quantity && selectedItem) {
      const q = parseFloat(quantity);
      if (!isNaN(q) && q > 0) {
        setPurchaseCost((q * selectedItem.costPerUnit).toString());
      } else {
        setPurchaseCost('');
      }
    } else {
      setPurchaseCost('');
    }
  }, [quantity, selectedItem?.id]); // Re-run when quantity or item selection changes

  const handleStockSelectChange = (id: string) => {
    setSelectedStockItemId(id);
    const itm = stockItems.find((s) => s.id === id);
    if (itm) setSelectedItemUnit(itm.unit);
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockItemId || !quantity) return;

    addStock(
      selectedStockItemId,
      parseFloat(quantity) || 0,
      parseFloat(purchaseCost) || 0
    );

    setQuantity('');
    setPurchaseCost('');
    setShowAddStockModal(false);
  };

  const handleUseStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(useQuantity);
    if (!selectedStockItemId || isNaN(q) || q <= 0) return;

    useStock(selectedStockItemId, q, usePurpose, useNotes, true);

    setUseQuantity('');
    setUseNotes('');
    setShowUseStockModal(false);
  };

  const handleCreateMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName) return;

    createStockItem({
      name: newMaterialName,
      unit: newMaterialUnit,
      available: 0,
      minThreshold: parseFloat(newMaterialMinThreshold) || 0,
      costPerUnit: parseFloat(newMaterialCost) || 0,
      status: 'out',
      lastRestocked: new Date().toISOString().split('T')[0]
    });

    setNewMaterialName('');
    setNewMaterialMinThreshold('5');
    setNewMaterialCost('100');
    setShowCreateMaterialModal(false);
  };

  // Quick quantity chip presets based on unit
  const getQuickChips = (unit: string) => {
    switch (unit) {
      case 'L':
        return [0.25, 0.5, 1, 2, 5];
      case 'KG':
        return [0.1, 0.25, 0.5, 1, 2];
      case 'Packs':
      case 'Tubs':
      case 'Units':
      default:
        return [1, 2, 3, 5, 10];
    }
  };

  // Filtered usage logs
  const filteredUsageLogs =
    selectedMaterialFilter === 'all'
      ? materialUsageLogs
      : materialUsageLogs.filter((log) => log.stockItemId === selectedMaterialFilter);

  // Calculate total material units consumed today
  const totalLogsTodayCount = materialUsageLogs.length;

  return (
    <div className="space-y-6">
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            STOCK MANAGEMENT
          </h2>
          <p className="text-xs text-stone-500">
            Real-time inventory levels, ingredient deduction, material usage, and restocking
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Create Material Button */}
          <button
            id="create-material-btn"
            onClick={() => setShowCreateMaterialModal(true)}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1.5 transition-colors active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>New Material</span>
          </button>

          {/* Use Stock Button */}
          <button
            id="use-stock-header-btn"
            onClick={() => {
              const defaultItem = stockItems[0];
              if (defaultItem) {
                setSelectedStockItemId(defaultItem.id);
                setSelectedItemUnit(defaultItem.unit);
              }
              setUseQuantity('');
              setUseNotes('');
              setShowUseStockModal(true);
            }}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1.5 transition-colors active:scale-95 whitespace-nowrap"
          >
            <Minus className="w-3.5 h-3.5 text-stone-600" />
            <span>Use Stock</span>
          </button>

          {/* Add Stock Button */}
          <button
            id="add-stock-btn"
            onClick={() => {
              const defaultItem = stockItems[0];
              if (defaultItem) {
                setSelectedStockItemId(defaultItem.id);
                setSelectedItemUnit(defaultItem.unit);
              }
              setShowAddStockModal(true);
            }}
            className="flex-1 sm:flex-none justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1.5 transition-colors active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Items */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Total Tracked Items
          </span>
          <div className="text-2xl font-black text-stone-900">{totalItems}</div>
          <span className="text-[11px] text-stone-400 mt-1 inline-block">Active raw materials</span>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Low Stock
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{lowStockCount}</div>
          <span className="text-[11px] text-amber-800 font-semibold mt-1 inline-block">
            Needs replenishment
          </span>
        </div>

        {/* Out of Stock */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Out of Stock
          </span>
          <div className="text-2xl font-black text-rose-700">{outOfStockCount}</div>
          <span className="text-[11px] text-stone-400 mt-1 inline-block">Zero units left</span>
        </div>

        {/* Stock Value */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Total Stock Value
          </span>
          <div className="text-2xl font-black text-stone-900">
            ₹{Math.round(totalStockValue).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            Wholesale asset value
          </span>
        </div>
      </div>

      {/* Stock Usage Today & Deduction Formula Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Usage Today Widget */}
        <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-stone-900 text-base">Materials Used Today</h3>
                <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                  Live & Manual Deductions
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Calculated automatically from completed orders and staff kitchen usage
              </p>
            </div>
            <button
              onClick={() => {
                const defaultItem = stockItems[0];
                if (defaultItem) {
                  setSelectedStockItemId(defaultItem.id);
                  setSelectedItemUnit(defaultItem.unit);
                }
                setUseQuantity('');
                setShowUseStockModal(true);
              }}
              className="hidden sm:flex items-center space-x-1 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg border border-stone-300 transition-colors"
            >
              <Minus className="w-3 h-3 text-stone-500" />
              <span>Log Usage</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4">
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-600 block truncate">Milk</span>
              <span className="text-base font-black text-stone-900">
                {todayStockUsage['st-milk']?.amount || 0} L
              </span>
              <span className="text-[9px] text-stone-400 block mt-0.5">Used today</span>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-600 block truncate">Coffee Beans</span>
              <span className="text-base font-black text-stone-900">
                {Math.round((todayStockUsage['st-coffee']?.amount || 0) * 1000)} g
              </span>
              <span className="text-[9px] text-stone-400 block mt-0.5">Espresso bar</span>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-600 block truncate">Sugar</span>
              <span className="text-base font-black text-stone-900">
                {todayStockUsage['st-sugar']?.amount || 0} KG
              </span>
              <span className="text-[9px] text-stone-400 block mt-0.5">Sweetener</span>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-600 block truncate">Bread</span>
              <span className="text-base font-black text-stone-900">
                {Math.round(todayStockUsage['st-bread']?.amount || 0)} packs
              </span>
              <span className="text-[9px] text-stone-400 block mt-0.5">Sandwiches</span>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-600 block truncate">Cheese</span>
              <span className="text-base font-black text-stone-900">
                {todayStockUsage['st-cheese']?.amount || 0} KG
              </span>
              <span className="text-[9px] text-stone-400 block mt-0.5">Toasties</span>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-600 block truncate">Potatoes</span>
              <span className="text-base font-black text-stone-900">
                {todayStockUsage['st-potatoes']?.amount || 0} KG
              </span>
              <span className="text-[9px] text-stone-400 block mt-0.5">Fries prep</span>
            </div>
          </div>
        </div>

        {/* Stock Formula Callout */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm mb-2">
              <Calculator className="w-4 h-4 text-amber-700" />
              <span>Smart Inventory Formula</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-amber-500/20 text-xs font-mono text-amber-950 font-bold leading-relaxed mb-2.5">
              Opening + Restocked − Materials Used = Available Stock
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Whenever materials are used for prep, bar service, or waste, tap <strong>Use</strong> to
              manually record exact usage, keeping kitchen quantities and recipe calculations in sync!
            </p>
          </div>
        </div>
      </div>

      {/* Current Stock Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">Current Stock & Ingredients</h3>
            <p className="text-xs text-stone-400">Inventory levels, consumption, and threshold monitoring</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="pb-2.5">Material Item</th>
                <th className="pb-2.5">Unit</th>
                <th className="pb-2.5">Available Quantity</th>
                <th className="pb-2.5">Used Today</th>
                <th className="pb-2.5">Safe Min</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {stockItems.map((st) => (
                <tr key={st.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 font-bold text-stone-900">{st.name}</td>
                  <td className="py-3 text-stone-500">{st.unit}</td>
                  <td className="py-3">
                    <span className="font-extrabold text-stone-900 text-sm">
                      {st.available} {st.unit}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-stone-600">
                      {todayStockUsage[st.id]?.amount || 0} {st.unit}
                    </span>
                  </td>
                  <td className="py-3 text-stone-500 font-mono">
                    {st.minThreshold} {st.unit}
                  </td>
                  <td className="py-3">
                    {st.status === 'good' && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        Good
                      </span>
                    )}
                    {st.status === 'low' && (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        Low
                      </span>
                    )}
                    {st.status === 'out' && (
                      <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        Out
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Use Button */}
                      <button
                        id={`use-btn-${st.id}`}
                        onClick={() => {
                          setSelectedStockItemId(st.id);
                          setSelectedItemUnit(st.unit);
                          setUseQuantity('');
                          setUsePurpose('Kitchen Cooking & Prep');
                          setUseNotes('');
                          setShowUseStockModal(true);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors flex items-center space-x-1 shadow-2xs active:scale-95"
                        title={`Record ${st.name} used`}
                      >
                        <Minus className="w-3 h-3 text-stone-500" />
                        <span>Use</span>
                      </button>

                      {/* Restock Button */}
                      <button
                        id={`restock-btn-${st.id}`}
                        onClick={() => {
                          setSelectedStockItemId(st.id);
                          setSelectedItemUnit(st.unit);
                          setQuantity('');
                          setPurchaseCost('');
                          setShowAddStockModal(true);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors shadow-2xs active:scale-95"
                      >
                        + Restock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Materials Used Activity Ledger */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">Material Usage Log</h3>
              <p className="text-xs text-stone-400">
                Detailed record of what materials were used, purpose, and quantities
              </p>
            </div>
          </div>

          {/* Filter by Material */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <CustomSelect
              value={selectedMaterialFilter}
              onChange={(val) => setSelectedMaterialFilter(val)}
              options={[
                { value: 'all', label: `All Materials (${materialUsageLogs.length})` },
                ...stockItems.map((s) => ({ value: s.id, label: s.name })),
              ]}
              className="w-44"
            />
          </div>
        </div>

        {filteredUsageLogs.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-xl border border-stone-200/60">
            <p className="text-xs font-semibold text-stone-500">No usage recorded for this filter.</p>
            <button
              onClick={() => setShowUseStockModal(true)}
              className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-800 underline"
            >
              Record material used now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="pb-2.5">Time</th>
                  <th className="pb-2.5">Material</th>
                  <th className="pb-2.5">Quantity Used</th>
                  <th className="pb-2.5">Purpose / Station</th>
                  <th className="pb-2.5">Notes</th>
                  <th className="pb-2.5 text-right">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredUsageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 text-stone-500 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span className="font-mono text-[11px]">{log.usedAt}</span>
                      </div>
                    </td>
                    <td className="py-3 font-bold text-stone-900">{log.stockItemName}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-stone-900 font-black text-xs border border-stone-200">
                        − {log.amount} {log.unit}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {log.purpose}
                      </span>
                    </td>
                    <td className="py-3 text-stone-500 text-xs max-w-[220px] truncate">
                      {log.notes || '—'}
                    </td>
                    <td className="py-3 text-right text-stone-500 text-xs">
                      <span className="font-medium text-stone-700">{log.loggedBy || 'Staff'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* − Record Material Used Modal */}
      {showUseStockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto" onClick={() => setShowUseStockModal(false)}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-150" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-stone-200 flex items-center justify-center text-stone-700">
                  <Minus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">Record Material Used</h3>
                  <p className="text-[11px] text-stone-500">Deduct materials consumed from current stock</p>
                </div>
              </div>
              <button
                onClick={() => setShowUseStockModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUseStockSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              {/* Select Material */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Material *</label>
                <CustomSelect
                  value={selectedStockItemId}
                  onChange={(val) => handleStockSelectChange(val)}
                  options={stockItems.map((s) => ({
                    value: s.id,
                    label: `${s.name} (Available: ${s.available} ${s.unit})`,
                  }))}
                />
              </div>

              {/* Quantity Used with Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-700">
                    Quantity Used ({selectedItemUnit}) *
                  </label>
                  {selectedItem && (
                    <span className="text-[11px] text-stone-500">
                      In Stock: <strong className="text-stone-800">{selectedItem.available} {selectedItem.unit}</strong>
                    </span>
                  )}
                </div>

                <input
                  type="number"
                  step="any"
                  required
                  min="0.01"
                  max={selectedItem ? selectedItem.available : undefined}
                  value={useQuantity}
                  onChange={(e) => setUseQuantity(e.target.value)}
                  placeholder={`e.g. 2`}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono"
                />

                {/* Quick Presets */}
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mr-1">
                    Quick:
                  </span>
                  {getQuickChips(selectedItemUnit).map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setUseQuantity(chip.toString())}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-[11px] font-semibold rounded-lg transition-colors"
                    >
                      {chip} {selectedItemUnit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose / Where Used */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Purpose / Where Material Was Used *
                </label>
                <CustomSelect
                  value={usePurpose}
                  onChange={(val) => setUsePurpose(val)}
                  options={[
                    { value: 'Kitchen Cooking & Prep', label: '🍳 Kitchen Cooking & Prep' },
                    { value: 'Espresso & Beverage Bar', label: '☕ Espresso & Beverage Bar' },
                    { value: 'Sandwich & Bakery Station', label: '🥪 Sandwich & Bakery Station' },
                    { value: 'Spillage / Wastage / Expired', label: '🥄 Spillage / Wastage / Expired' },
                    { value: 'Staff Tasting / Shift Meal', label: '👥 Staff Tasting / Shift Meal' },
                    { value: 'Inventory Adjustment / Shrinkage', label: '📦 Inventory Adjustment / Shrinkage' },
                    { value: 'Custom Note', label: '📝 Custom Purpose' },
                  ]}
                  placement="top"
                />
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Notes / Details (Optional)
                </label>
                <input
                  type="text"
                  value={useNotes}
                  onChange={(e) => setUseNotes(e.target.value)}
                  placeholder="e.g. Prepped morning batch for flat whites"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden text-xs"
                />
              </div>

              {/* Real-time deduction preview */}
              {selectedItem && useQuantity && !isNaN(parseFloat(useQuantity)) && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Current Stock:</span>
                    <span className="font-bold text-stone-800">
                      {selectedItem.available} {selectedItem.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Deducting:</span>
                    <span className="font-bold text-rose-700">
                      − {parseFloat(useQuantity)} {selectedItem.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200">
                    <span className="font-bold text-stone-700">Remaining Balance:</span>
                    <span
                      className={`font-black ${
                        selectedItem.available - parseFloat(useQuantity) <= 0
                          ? 'text-red-700'
                          : selectedItem.available - parseFloat(useQuantity) <= selectedItem.minThreshold
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {Math.max(
                        0,
                        Math.round((selectedItem.available - parseFloat(useQuantity)) * 100) / 100
                      )}{' '}
                      {selectedItem.unit}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUseStockModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-use-stock-btn"
                  className="px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Deduct & Record Usage
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* + Add Stock Modal (Restock) */}
      {showAddStockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto" onClick={() => setShowAddStockModal(false)}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-150" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
              <h3 className="font-extrabold text-stone-900 text-base">Replenish Stock Item</h3>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Item *</label>
                <CustomSelect
                  value={selectedStockItemId}
                  onChange={(val) => handleStockSelectChange(val)}
                  options={stockItems.map((s) => ({
                    value: s.id,
                    label: `${s.name} (Current: ${s.available} ${s.unit})`,
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Added Quantity ({selectedItemUnit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-500">
                Adding stock automatically records an ingredient expense under the Expenses module
                if purchase cost is entered.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-add-stock-btn"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* Create Material Modal */}
      {showCreateMaterialModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-stone-900">Create New Material</h3>
              </div>
              <button
                onClick={() => setShowCreateMaterialModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterialSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  placeholder="e.g. Arabica Coffee Beans"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Measurement Unit *</label>
                  <CustomSelect
                    value={newMaterialUnit}
                    onChange={(val) => setNewMaterialUnit(val)}
                    options={[
                      { value: 'L', label: 'Liters (L)' },
                      { value: 'KG', label: 'Kilograms (KG)' },
                      { value: 'Packs', label: 'Packs' },
                      { value: 'Units', label: 'Units' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Low Stock Warning At *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    value={newMaterialMinThreshold}
                    onChange={(e) => setNewMaterialMinThreshold(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Cost Per Unit (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  min="0"
                  value={newMaterialCost}
                  onChange={(e) => setNewMaterialCost(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl text-xs text-stone-500 border border-indigo-100/50">
                Newly created materials start with 0 stock. Once created, you can use the "Add Stock" button to restock it.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateMaterialModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Create Material
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

