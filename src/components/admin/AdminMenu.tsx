import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { MenuItem, MenuItemCategory, RecipeIngredient } from '../../types';
import { Plus, Check, X, Edit, ToggleLeft, ToggleRight, Coffee, Trash2 } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { useModalClose } from '../../hooks/useModalClose';

const CATEGORIES: Exclude<MenuItemCategory, 'All'>[] = [
  'Tea & Coffee',
  'Snacks',
  'Sandwich',
  'Burger',
  'Garlic Bread',
  'Pizza',
  'Hot Dog',
  'Frankie',
  'Maggi',
  'Pasta',
  'French Fries',
  'Starter',
  'Noodles',
  'Mocktail',
  'Soup',
  'Rice',
  'Shake',
  'Cold Coffee',
  'Sizzling Brownie',
  'Cheesecake',
  'Cookie Tin',
  'Coffee Tiramisu',
  'Kunafa',
  'Dessert Can',
  'Chocolate Bowl',
  'Baklava',
  'Kunafa Cheese Bomb',
  'Bombolinis',
  'Chocolate Bar',
];

const KUNAFA_CATEGORIES: Exclude<MenuItemCategory, 'All'>[] = [
  'Sizzling Brownie',
  'Cheesecake',
  'Cookie Tin',
  'Coffee Tiramisu',
  'Kunafa',
  'Dessert Can',
  'Chocolate Bowl',
  'Baklava',
  'Kunafa Cheese Bomb',
  'Bombolinis',
  'Chocolate Bar',
];

export const AdminMenu: React.FC = () => {
  const { filteredMenuItems: menuItems, addMenuItem, updateMenuItem, toggleMenuItemAvailability, stockItems, brandFilter, currentRole } = useCafe();

  const displayedCategories = currentRole === 'admin_kunafa' ? KUNAFA_CATEGORIES : CATEGORIES;

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [listBrandFilter, setListBrandFilter] = useState<'All' | 'JB Cafe' | 'KUNAFA'>(
    currentRole === 'admin_kunafa' ? 'KUNAFA' : 'All'
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<MenuItemCategory, 'All'>>('Coffee');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState<'JB Cafe' | 'KUNAFA'>('JB Cafe');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  const handleCloseModal = () => setShowAddModal(false);
  useModalClose(handleCloseModal, showAddModal);

  const filteredItems = menuItems.filter(
    (item) => {
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const itemBrand = item.brand || 'JB Cafe'; // Fallback to JB Cafe if undefined
      const matchesBrand = listBrandFilter === 'All' || itemBrand === listBrandFilter;
      return matchesCat && matchesBrand;
    }
  );

  const handleOpenAdd = () => {
    setName('');
    setCategory('Coffee');
    setPrice('');
    setDescription('');
    setBrand(brandFilter === 'KUNAFA' ? 'KUNAFA' : 'JB Cafe');
    setIngredients([]);
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setDescription(item.description || '');
    setBrand(item.brand || 'JB Cafe');
    setIngredients(item.ingredients || []);
    setShowAddModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: name.trim(),
        category,
        price: parseFloat(price) || 0,
        description: description.trim() || undefined,
        brand,
        ingredients,
      });
    } else {
      addMenuItem({
        name: name.trim(),
        category,
        price: parseFloat(price) || 0,
        available: true,
        description: description.trim() || undefined,
        brand,
        ingredients,
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">MENU MANAGEMENT</h2>
          <p className="text-xs text-stone-500">Configure catalog prices, categories, and active recipes</p>
        </div>

        <button
          id="add-menu-item-btn"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-colors active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar flex-1">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === 'All'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            All Items
          </button>
          {displayedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Brand Filter */}
        {currentRole !== 'admin_kunafa' && (
          <div className="flex bg-stone-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
            {(['All', 'JB Cafe', 'KUNAFA'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setListBrandFilter(b)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  listBrandFilter === b
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
              item.available ? 'border-stone-200/90' : 'border-stone-200 opacity-60 bg-stone-50/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {item.category}
                  </span>
                  {item.brand === 'KUNAFA' && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      KUNAFA
                    </span>
                  )}
                  {(item.brand === 'JB Cafe' || !item.brand) && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      JB CAFE
                    </span>
                  )}
                  <h3 className="font-extrabold text-stone-900 text-base mt-1">{item.name}</h3>
                </div>
                <span className="text-base font-black text-stone-900">₹{item.price}</span>
              </div>

              <p className="text-xs text-stone-500 mt-1 line-clamp-2">{item.description}</p>

              {/* Connected Ingredients hint */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-400">
                  <span className="font-medium">Uses: </span>
                  {item.ingredients.map((ing) => `${ing.stockItemName}`).join(', ')}
                </div>
              )}
            </div>

            {/* Actions: Enable/Disable & Edit */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => toggleMenuItemAvailability(item.id)}
                className={`flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  item.available
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-stone-500 bg-stone-100 hover:bg-stone-200'
                }`}
              >
                {item.available ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{item.available ? 'Available' : 'Out of Stock'}</span>
              </button>

              <button
                onClick={() => handleOpenEdit(item)}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1 rounded-lg hover:bg-stone-100 flex items-center space-x-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto" onClick={handleCloseModal}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-150" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
              <h3 className="font-extrabold text-stone-900 text-base">
                {editingItem ? 'Edit Menu Item' : '+ Add New Menu Item'}
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
                <label className="block font-semibold text-stone-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Flat White, Club Sandwich..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Brand</label>
                {brandFilter === 'KUNAFA' ? (
                  <div className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-bold text-xs flex items-center space-x-2">
                    <span>🟡 KUNAFA</span>
                    <span className="text-stone-400 font-normal">(locked to your brand)</span>
                  </div>
                ) : (
                  <CustomSelect
                    value={brand}
                    onChange={(val) => setBrand(val as 'JB Cafe' | 'KUNAFA')}
                    options={[
                      { value: 'JB Cafe', label: 'JB Cafe' },
                      { value: 'KUNAFA', label: 'KUNAFA' },
                    ]}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <CustomSelect
                    value={category}
                    onChange={(val) => setCategory(val as Exclude<MenuItemCategory, 'All'>)}
                    options={displayedCategories.map((cat) => ({ value: cat, label: cat }))}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="140"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short appetizing description..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Recipe / Ingredients Section */}
              <div className="pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-semibold text-stone-700">Recipe / Ingredients</label>
                  <button
                    type="button"
                    onClick={() => setIngredients([...ingredients, { stockItemId: '', stockItemName: '', amount: 0, unit: '' }])}
                    className="text-amber-600 hover:text-amber-700 text-xs font-bold flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </button>
                </div>
                {ingredients.length === 0 ? (
                  <div className="text-xs text-stone-400 italic mb-2">No ingredients added. Stock will not be auto-managed for this item.</div>
                ) : (
                  <div className="space-y-2 mb-2">
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="flex-1 min-w-[150px]">
                          <CustomSelect
                            value={ing.stockItemId}
                            onChange={(val) => {
                              const selectedItem = stockItems.find((s) => s.id === val);
                              const newIngs = [...ingredients];
                              newIngs[idx].stockItemId = val;
                              newIngs[idx].stockItemName = selectedItem ? selectedItem.name : '';
                              newIngs[idx].unit = selectedItem ? selectedItem.unit : '';
                              setIngredients(newIngs);
                            }}
                            options={stockItems.map((s) => ({ value: s.id, label: `${s.name} (${s.unit})` }))}
                            placeholder="Select Material"
                            placement="top"
                          />
                        </div>
                        <input
                          type="number"
                          step="any"
                          required
                          min="0"
                          placeholder={`Amt${ing.unit ? ` (${ing.unit})` : ''}`}
                          value={ing.amount || ''}
                          onChange={(e) => {
                            const newIngs = [...ingredients];
                            newIngs[idx].amount = parseFloat(e.target.value) || 0;
                            setIngredients(newIngs);
                          }}
                          className="w-20 px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newIngs = [...ingredients];
                            newIngs.splice(idx, 1);
                            setIngredients(newIngs);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  id="save-menu-item-btn"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
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
