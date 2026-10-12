import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { StockItem, Material } from '../../types';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Edit2,
  Trash2,
  Eye,
  X,
  Layers,
  ArrowUpDown,
  UtensilsCrossed,
  Sparkles,
  TrendingUp,
  Tag,
  ShieldCheck,
  LayoutGrid,
  List,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { useModalClose } from '../../hooks/useModalClose';

export const AdminRawMaterial: React.FC = () => {
  const {
    materials,
    stockItems,
    menuItems,
    createStockItem,
    updateMaterial,
    deleteMaterial,
    showConfirm,
    currentRole,
  } = useCafe();

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<'All' | 'JB Cafe' | 'KUNAFA'>('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'good' | 'low' | 'out'>('All');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<StockItem | null>(null);

  // New Material Form State
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUnit, setNewMaterialUnit] = useState('KG');
  const [newMaterialMinThreshold, setNewMaterialMinThreshold] = useState('5');
  const [newMaterialCost, setNewMaterialCost] = useState('100');
  const [newMaterialBrand, setNewMaterialBrand] = useState<'JB Cafe' | 'KUNAFA'>(
    currentRole === 'admin_kunafa' ? 'KUNAFA' : 'JB Cafe'
  );
  const [newMaterialOpeningStock, setNewMaterialOpeningStock] = useState('0');

  // Edit Material Form State
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('KG');
  const [editMinThreshold, setEditMinThreshold] = useState('5');
  const [editCost, setEditCost] = useState('100');
  const [editBrand, setEditBrand] = useState<'JB Cafe' | 'KUNAFA'>('JB Cafe');

  // Copy ID feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useModalClose(() => setShowCreateModal(false), showCreateModal);
  useModalClose(() => setShowEditModal(false), showEditModal);
  useModalClose(() => setShowDetailModal(false), showDetailModal);

  // Merge raw materials with stock items for complete specifications
  const enrichedMaterials: StockItem[] = useMemo(() => {
    return stockItems.map((st) => {
      // Find matching material doc
      const mat = materials.find((m) => m.id === st.id);
      return {
        ...st,
        name: mat?.name || st.name,
        unit: mat?.unit || st.unit,
        costPerUnit: mat?.costPerUnit ?? st.costPerUnit,
        minThreshold: mat?.minThreshold ?? st.minThreshold,
        brand: mat?.brand || st.brand || 'JB Cafe',
      };
    });
  }, [stockItems, materials]);

  // Available unique units for filtering
  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    enrichedMaterials.forEach((m) => {
      if (m.unit) set.add(m.unit);
    });
    return Array.from(set).sort();
  }, [enrichedMaterials]);

  // Brand-aware filtering
  const filteredMaterials = useMemo(() => {
    return enrichedMaterials
      .filter((item) => {
        // Role check
        if (currentRole === 'admin_kunafa' && item.brand !== 'KUNAFA') {
          return false;
        }

        // Brand filter
        if (brandFilter !== 'All') {
          if (brandFilter === 'JB Cafe' && item.brand !== 'JB Cafe') return false;
          if (brandFilter === 'KUNAFA' && item.brand !== 'KUNAFA') return false;
        }

        // Unit filter
        if (unitFilter !== 'All' && item.unit !== unitFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'All' && item.status !== statusFilter) {
          return false;
        }

        // Search Query (matches name, id, unit, brand)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(q);
          const matchId = item.id.toLowerCase().includes(q);
          const matchUnit = item.unit.toLowerCase().includes(q);
          const matchBrand = (item.brand || '').toLowerCase().includes(q);
          if (!matchName && !matchId && !matchUnit && !matchBrand) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'cost-desc':
            return b.costPerUnit - a.costPerUnit;
          case 'cost-asc':
            return a.costPerUnit - b.costPerUnit;
          case 'stock-desc':
            return b.available - a.available;
          case 'stock-asc':
            return a.available - b.available;
          case 'threshold-desc':
            return b.minThreshold - a.minThreshold;
          default:
            return 0;
        }
      });
  }, [enrichedMaterials, currentRole, brandFilter, unitFilter, statusFilter, searchQuery, sortBy]);

  // Overview metrics
  const totalItemsCount = currentRole === 'admin_kunafa'
    ? enrichedMaterials.filter((m) => m.brand === 'KUNAFA').length
    : enrichedMaterials.length;

  const jbCafeCount = enrichedMaterials.filter((m) => m.brand === 'JB Cafe' || !m.brand).length;
  const kunafaCount = enrichedMaterials.filter((m) => m.brand === 'KUNAFA').length;

  const totalInventoryValue = filteredMaterials.reduce(
    (sum, m) => sum + m.available * m.costPerUnit,
    0
  );

  const avgCostPerUnit = filteredMaterials.length > 0
    ? filteredMaterials.reduce((sum, m) => sum + m.costPerUnit, 0) / filteredMaterials.length
    : 0;

  const lowStockCount = filteredMaterials.filter((m) => m.status === 'low').length;
  const outOfStockCount = filteredMaterials.filter((m) => m.status === 'out').length;

  // Recipe usage lookup for a material
  const getRecipeUsage = (materialId: string) => {
    return menuItems.filter((menu) =>
      menu.ingredients?.some((ing) => ing.stockItemId === materialId)
    );
  };

  // Copy material ID to clipboard
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit New Material
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;

    createStockItem({
      name: newMaterialName.trim(),
      unit: newMaterialUnit,
      available: parseFloat(newMaterialOpeningStock) || 0,
      minThreshold: parseFloat(newMaterialMinThreshold) || 0,
      costPerUnit: parseFloat(newMaterialCost) || 0,
      status: (parseFloat(newMaterialOpeningStock) || 0) <= (parseFloat(newMaterialMinThreshold) || 0)
        ? ((parseFloat(newMaterialOpeningStock) || 0) <= 0 ? 'out' : 'low')
        : 'good',
      lastRestocked: new Date().toISOString().split('T')[0],
      brand: currentRole === 'admin_kunafa' ? 'KUNAFA' : newMaterialBrand,
    });

    setNewMaterialName('');
    setNewMaterialMinThreshold('5');
    setNewMaterialCost('100');
    setNewMaterialOpeningStock('0');
    setNewMaterialBrand(currentRole === 'admin_kunafa' ? 'KUNAFA' : 'JB Cafe');
    setShowCreateModal(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: StockItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditId(item.id);
    setEditName(item.name);
    setEditUnit(item.unit);
    setEditMinThreshold(item.minThreshold.toString());
    setEditCost(item.costPerUnit.toString());
    setEditBrand(item.brand || 'JB Cafe');
    setShowEditModal(true);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editName.trim()) return;

    updateMaterial(editId, {
      name: editName.trim(),
      unit: editUnit,
      minThreshold: parseFloat(editMinThreshold) || 0,
      costPerUnit: parseFloat(editCost) || 0,
      brand: editBrand,
    });

    setShowEditModal(false);
  };

  // Delete Material Handler
  const handleDelete = (item: StockItem, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      'Delete Raw Material',
      `Are you sure you want to delete "${item.name}" (${item.id})? This will remove the raw material definition.`,
      () => {
        deleteMaterial(item.id);
      },
      { isDestructive: true, confirmText: 'Delete Material' }
    );
  };

  // View Details Handler
  const handleOpenDetail = (item: StockItem) => {
    setSelectedMaterial(item);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              RAW MATERIAL MANAGEMENT
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Collection: materials
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Catalog of raw ingredients, measurement units, purchase cost benchmarks, safety limits, and brand classification
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* New Material Button (Moved from Stock module) */}
          <button
            id="create-material-btn"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Material</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Tracked Raw Materials */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/30 to-white border border-indigo-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
              Total Materials
            </span>
            <Boxes className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{totalItemsCount}</div>
          <span className="text-[11px] text-indigo-600/80 mt-1 inline-block">
            Tracked in materials db
          </span>
        </div>

        {/* Brand Breakdown */}
        {currentRole !== 'admin_kunafa' && (
          <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-white border border-amber-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Brand Catalog
              </span>
              <Tag className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-black text-stone-800">{jbCafeCount} <span className="text-[10px] font-semibold text-stone-400">JB</span></span>
              <span className="text-xs text-stone-300">|</span>
              <span className="text-lg font-black text-amber-700">{kunafaCount} <span className="text-[10px] font-semibold text-amber-600">KNF</span></span>
            </div>
            <span className="text-[11px] text-amber-700/80 mt-1 inline-block">Active brand distribution</span>
          </div>
        )}

        {/* Total Stock Value */}
        <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Total Valuation
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            ₹{Math.round(totalInventoryValue).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">
            Holding asset value
          </span>
        </div>

        {/* Average Unit Cost */}
        <div className="bg-gradient-to-br from-yellow-50/80 via-amber-50/30 to-white border border-yellow-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-800">
              Avg Cost / Unit
            </span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            ₹{Math.round(avgCostPerUnit).toLocaleString()}
          </div>
          <span className="text-[11px] text-yellow-700/80 mt-1 inline-block">Benchmark avg cost</span>
        </div>

        {/* Stock Alerts (Low & Out) */}
        <div className="bg-gradient-to-br from-rose-50/80 via-pink-50/30 to-white border border-rose-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Stock Warnings
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-black text-amber-600">{lowStockCount} <span className="text-[10px] text-amber-500 font-semibold">Low</span></span>
            <span className="text-xs text-stone-300">/</span>
            <span className="text-xl font-black text-rose-600">{outOfStockCount} <span className="text-[10px] text-rose-500 font-semibold">Out</span></span>
          </div>
          <span className="text-[11px] text-rose-700/80 mt-1 inline-block">Threshold alerts</span>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Filter Tabs */}
          {currentRole !== 'admin_kunafa' ? (
            <div className="flex items-center space-x-1.5 p-1 bg-[#FAF7F2] border border-[#EFE7DA] rounded-xl">
              <button
                onClick={() => setBrandFilter('All')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  brandFilter === 'All'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                All Materials ({enrichedMaterials.length})
              </button>
              <button
                onClick={() => setBrandFilter('JB Cafe')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  brandFilter === 'JB Cafe'
                    ? 'bg-amber-100 text-amber-900 shadow-2xs border border-amber-200'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                JB Cafe ({jbCafeCount})
              </button>
              <button
                onClick={() => setBrandFilter('KUNAFA')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  brandFilter === 'KUNAFA'
                    ? 'bg-rose-100 text-rose-900 shadow-2xs border border-rose-200'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                KUNAFA ({kunafaCount})
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Showing KUNAFA Materials Only</span>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex items-center space-x-1 border border-stone-200 rounded-xl p-1 bg-stone-50 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>

        {/* Second Row: Search, Unit Filter, Status Filter, Sort By */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, or unit..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Unit Filter */}
          <CustomSelect
            value={unitFilter}
            onChange={(val) => setUnitFilter(val)}
            placeholder="All Units"
            options={[
              { value: 'All', label: 'All Units' },
              ...availableUnits.map((u) => ({ value: u, label: `Unit: ${u}` })),
            ]}
          />

          {/* Stock Status Filter */}
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as any)}
            placeholder="All Status"
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'good', label: 'In Stock (Good)' },
              { value: 'low', label: 'Low Stock' },
              { value: 'out', label: 'Out of Stock' },
            ]}
          />

          {/* Sort By */}
          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            placeholder="Sort by"
            options={[
              { value: 'name-asc', label: 'Name (A to Z)' },
              { value: 'name-desc', label: 'Name (Z to A)' },
              { value: 'cost-desc', label: 'Cost: High to Low' },
              { value: 'cost-asc', label: 'Cost: Low to High' },
              { value: 'stock-desc', label: 'Stock: High to Low' },
              { value: 'stock-asc', label: 'Stock: Low to High' },
              { value: 'threshold-desc', label: 'Safe Min: High to Low' },
            ]}
          />
        </div>
      </div>

      {/* Materials List Section */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs">
          <Boxes className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-stone-800 text-sm">No Raw Materials Found</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No materials matched "${searchQuery}". Try clearing filters or search terms.`
              : 'No materials are listed currently.'}
          </p>
          {(searchQuery || brandFilter !== 'All' || unitFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setBrandFilter('All');
                setUnitFilter('All');
                setStatusFilter('All');
              }}
              className="mt-4 px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-stone-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold tracking-wider uppercase text-[10px]">
                  <th className="py-3.5 px-4">Material Details</th>
                  <th className="py-3.5 px-3">Material ID</th>
                  <th className="py-3.5 px-3">Unit</th>
                  <th className="py-3.5 px-3">Benchmark Cost</th>
                  <th className="py-3.5 px-3">Safe Minimum</th>
                  <th className="py-3.5 px-3">In-Stock Qty</th>
                  <th className="py-3.5 px-3">Stock Status</th>
                  <th className="py-3.5 px-3">Total Value</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredMaterials.map((item) => {
                  const recipesUsing = getRecipeUsage(item.id);
                  const isLow = item.status === 'low';
                  const isOut = item.status === 'out';
                  const holdingValue = item.available * item.costPerUnit;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className="hover:bg-stone-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Name & Brand */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-black text-stone-600 text-xs shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 group-hover:text-indigo-700 transition-colors flex items-center space-x-1.5">
                              <span>{item.name}</span>
                              {recipesUsing.length > 0 && (
                                <span
                                  className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.2 rounded font-semibold"
                                  title={`Used in ${recipesUsing.length} menu items`}
                                >
                                  {recipesUsing.length} recipes
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                                  item.brand === 'KUNAFA'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                                }`}
                              >
                                {item.brand || 'JB Cafe'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Material ID with Copy button */}
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="truncate max-w-[130px]">{item.id}</span>
                          <button
                            onClick={(e) => handleCopyId(item.id, e)}
                            className="p-1 rounded-md hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
                            title="Copy ID"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 rounded-md font-bold text-[11px]">
                          {item.unit}
                        </span>
                      </td>

                      {/* Cost per unit */}
                      <td className="py-3 px-3 font-semibold text-stone-900">
                        ₹{item.costPerUnit.toLocaleString()}
                        <span className="text-[10px] text-stone-400 font-normal"> / {item.unit}</span>
                      </td>

                      {/* Min Threshold */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-stone-700">
                          {item.minThreshold} {item.unit}
                        </span>
                      </td>

                      {/* In-Stock Quantity */}
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-stone-900">
                          {item.available} {item.unit}
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3 px-3">
                        {isOut ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Good</span>
                          </span>
                        )}
                      </td>

                      {/* Total Holding Value */}
                      <td className="py-3 px-3 font-bold text-stone-800">
                        ₹{Math.round(holdingValue).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(item);
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Complete Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(item, e)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Material"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(item, e)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((item) => {
            const recipesUsing = getRecipeUsage(item.id);
            const isLow = item.status === 'low';
            const isOut = item.status === 'out';
            const holdingValue = item.available * item.costPerUnit;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="bg-white border border-stone-200/90 hover:border-indigo-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
              >
                <div>
                  {/* Top Row: Brand & Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.brand === 'KUNAFA'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {item.brand || 'JB Cafe'}
                    </span>

                    {isOut ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>Out of Stock</span>
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>Low Stock</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Good</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Document ID */}
                  <h3 className="font-extrabold text-stone-900 text-base group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-[11px] font-mono text-stone-400 mt-0.5">
                    <span className="truncate">{item.id}</span>
                    <button
                      onClick={(e) => handleCopyId(item.id, e)}
                      className="p-0.5 text-stone-400 hover:text-stone-700"
                      title="Copy ID"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Specification Badges Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-100 text-xs">
                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-100">
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">
                        Benchmark Cost
                      </span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        ₹{item.costPerUnit}
                        <span className="text-[10px] font-normal text-stone-500"> / {item.unit}</span>
                      </span>
                    </div>

                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-100">
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">
                        Safe Minimum
                      </span>
                      <span className="font-extrabold text-stone-900 text-sm">
                        {item.minThreshold} {item.unit}
                      </span>
                    </div>

                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-100">
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">
                        In-Stock Qty
                      </span>
                      <span className="font-black text-stone-900 text-sm">
                        {item.available} {item.unit}
                      </span>
                    </div>

                    <div className="p-2 bg-stone-50 rounded-xl border border-stone-100">
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">
                        Holding Value
                      </span>
                      <span className="font-black text-emerald-700 text-sm">
                        ₹{Math.round(holdingValue).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Recipe Usage Note */}
                  {recipesUsing.length > 0 && (
                    <div className="mt-2 text-[11px] text-stone-500 flex items-center space-x-1">
                      <UtensilsCrossed className="w-3 h-3 text-stone-400" />
                      <span>Configured in {recipesUsing.length} menu recipe(s)</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-[10px] text-stone-400 font-medium">
                    {item.lastRestocked ? `Restocked: ${item.lastRestocked}` : 'No restock date'}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(item);
                      }}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-indigo-600 hover:bg-indigo-50"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleOpenEdit(item, e)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-amber-50"
                      title="Edit Material"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item, e)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW MATERIAL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm">Add New Raw Material</h3>
                    <p className="text-[10px] text-stone-400">
                      Saves to Firestore collection: <span className="font-mono font-bold">materials</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
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
                        { value: 'Tubs', label: 'Tubs' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Safe Min Warning *</label>
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

                <div className="grid grid-cols-2 gap-3">
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

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Initial Opening Stock</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={newMaterialOpeningStock}
                      onChange={(e) => setNewMaterialOpeningStock(e.target.value)}
                      placeholder="e.g. 0"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {currentRole !== 'admin_kunafa' ? (
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Brand Classification *</label>
                    <CustomSelect
                      value={newMaterialBrand}
                      onChange={(val) => setNewMaterialBrand(val as 'JB Cafe' | 'KUNAFA')}
                      options={[
                        { value: 'JB Cafe', label: 'JB Cafe' },
                        { value: 'KUNAFA', label: 'KUNAFA' },
                      ]}
                    />
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 rounded-xl text-xs text-amber-800 font-semibold border border-amber-200">
                    Brand pinned to KUNAFA automatically.
                  </div>
                )}

                <div className="p-3 bg-indigo-50/50 rounded-xl text-xs text-stone-500 border border-indigo-100/50">
                  This new material will immediately be registered in the <span className="font-semibold text-indigo-700">materials</span> collection and be available for recipes and inventory management.
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="confirm-create-material-btn"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
                  >
                    Save Raw Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MATERIAL MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center space-x-2">
                  <Edit2 className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm">Edit Raw Material</h3>
                    <p className="text-[10px] text-stone-400 font-mono">ID: {editId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Material Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Measurement Unit *</label>
                    <CustomSelect
                      value={editUnit}
                      onChange={(val) => setEditUnit(val)}
                      options={[
                        { value: 'L', label: 'Liters (L)' },
                        { value: 'KG', label: 'Kilograms (KG)' },
                        { value: 'Packs', label: 'Packs' },
                        { value: 'Units', label: 'Units' },
                        { value: 'Tubs', label: 'Tubs' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Safe Min Warning *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0"
                      value={editMinThreshold}
                      onChange={(e) => setEditMinThreshold(e.target.value)}
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
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {currentRole !== 'admin_kunafa' && (
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Brand Classification *</label>
                    <CustomSelect
                      value={editBrand}
                      onChange={(val) => setEditBrand(val as 'JB Cafe' | 'KUNAFA')}
                      options={[
                        { value: 'JB Cafe', label: 'JB Cafe' },
                        { value: 'KUNAFA', label: 'KUNAFA' },
                      ]}
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs"
                  >
                    Update Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE MATERIAL SPECIFICATION SHEET (DETAIL MODAL) */}
      {showDetailModal && selectedMaterial && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 bg-stone-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        selectedMaterial.brand === 'KUNAFA'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-stone-700 text-stone-200'
                      }`}
                    >
                      {selectedMaterial.brand || 'JB Cafe'}
                    </span>
                    <span className="text-stone-400 text-xs">Specification Sheet</span>
                  </div>
                  <h3 className="font-black text-xl text-white mt-1">
                    {selectedMaterial.name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-xs sm:text-sm">
                {/* ID with copy */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Firestore Document ID
                    </span>
                    <span className="font-mono text-xs font-semibold text-stone-800">
                      {selectedMaterial.id}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleCopyId(selectedMaterial.id, e)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 font-bold text-xs flex items-center space-x-1 hover:bg-stone-100 transition-colors"
                  >
                    {copiedId === selectedMaterial.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2x3 Spec Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">
                      Measurement Unit
                    </span>
                    <span className="font-extrabold text-stone-900 text-sm">
                      {selectedMaterial.unit}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">
                      Cost Benchmark
                    </span>
                    <span className="font-extrabold text-stone-900 text-sm">
                      ₹{selectedMaterial.costPerUnit} / {selectedMaterial.unit}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">
                      Safe Minimum Threshold
                    </span>
                    <span className="font-extrabold text-stone-900 text-sm">
                      {selectedMaterial.minThreshold} {selectedMaterial.unit}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">
                      Current Available
                    </span>
                    <span className="font-extrabold text-stone-900 text-sm">
                      {selectedMaterial.available} {selectedMaterial.unit}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">
                      Stock Status
                    </span>
                    <span className="font-bold text-sm">
                      {selectedMaterial.status === 'good' && (
                        <span className="text-emerald-700">Good Level</span>
                      )}
                      {selectedMaterial.status === 'low' && (
                        <span className="text-amber-700">Needs Restock</span>
                      )}
                      {selectedMaterial.status === 'out' && (
                        <span className="text-rose-700">Out of Stock</span>
                      )}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">
                      Total Holding Asset
                    </span>
                    <span className="font-black text-emerald-700 text-sm">
                      ₹{Math.round(selectedMaterial.available * selectedMaterial.costPerUnit).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Recipe Usage in Menu */}
                <div>
                  <div className="flex items-center space-x-1.5 mb-2">
                    <UtensilsCrossed className="w-4 h-4 text-stone-500" />
                    <span className="font-bold text-stone-800 text-xs uppercase tracking-wider">
                      Dishes Using This Raw Material
                    </span>
                  </div>

                  {(() => {
                    const recipes = getRecipeUsage(selectedMaterial.id);
                    if (recipes.length === 0) {
                      return (
                        <p className="text-stone-400 italic text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                          Not currently linked to any active menu item recipes.
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {recipes.map((item) => {
                          const ingredient = item.ingredients?.find(
                            (ing) => ing.stockItemId === selectedMaterial.id
                          );
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-100"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-stone-800">{item.name}</span>
                                <span className="text-[10px] text-stone-400">({item.category})</span>
                              </div>
                              <span className="font-mono font-bold text-xs text-indigo-700">
                                {ingredient?.amount} {ingredient?.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    {selectedMaterial.lastRestocked ? `Last Restocked: ${selectedMaterial.lastRestocked}` : 'No Restock Record'}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        setShowDetailModal(false);
                        handleOpenEdit(selectedMaterial, e);
                      }}
                      className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Specs</span>
                    </button>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
