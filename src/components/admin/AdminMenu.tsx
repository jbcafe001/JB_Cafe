import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCafe } from '../../context/CafeContext';
import { MenuItem, MenuItemCategory, RecipeIngredient } from '../../types';
import { Plus, Check, X, Edit, ToggleLeft, ToggleRight, Coffee, Trash2 } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { useModalClose } from '../../hooks/useModalClose';
import { getCategoryImageUrl, getMenuItemImageUrl } from '../../utils/menuImages';

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
  'Soft Drink',
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

const JB_CAFE_CATEGORIES: Exclude<MenuItemCategory, 'All'>[] = CATEGORIES.filter(
  (c) => !KUNAFA_CATEGORIES.includes(c)
);

export const AdminMenu: React.FC = () => {
  const { filteredMenuItems: menuItems, addMenuItem, updateMenuItem, toggleMenuItemAvailability, stockItems, brandFilter, currentRole } = useCafe();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [listBrandFilter, setListBrandFilter] = useState<'All' | 'JB Cafe' | 'KUNAFA'>(
    currentRole === 'admin_kunafa' ? 'KUNAFA' : 'All'
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Filter categories shown in top pills according to the selected brand
  const displayedCategories = useMemo(() => {
    if (currentRole === 'admin_kunafa' || listBrandFilter === 'KUNAFA') {
      return KUNAFA_CATEGORIES;
    }
    if (listBrandFilter === 'JB Cafe') {
      return JB_CAFE_CATEGORIES;
    }
    return CATEGORIES;
  }, [currentRole, listBrandFilter]);

  // Reset activeCategory if it does not exist in the newly displayed categories
  useEffect(() => {
    if (activeCategory !== 'All' && !displayedCategories.includes(activeCategory as any)) {
      setActiveCategory('All');
    }
  }, [displayedCategories, activeCategory]);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<MenuItemCategory, 'All'>>('Tea & Coffee');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState<'JB Cafe' | 'KUNAFA'>('JB Cafe');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  const modalCategories = useMemo(() => {
    return brand === 'KUNAFA' ? KUNAFA_CATEGORIES : JB_CAFE_CATEGORIES;
  }, [brand]);

  const handleCloseModal = () => setShowAddModal(false);
  useModalClose(handleCloseModal, showAddModal);

  const filteredItems = menuItems.filter(
    (item) => {
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const isItemKunafa = item.brand === 'KUNAFA' || KUNAFA_CATEGORIES.includes(item.category as any);
      const itemBrand = isItemKunafa ? 'KUNAFA' : (item.brand || 'JB Cafe');
      const matchesBrand = listBrandFilter === 'All' || itemBrand === listBrandFilter;
      return matchesCat && matchesBrand;
    }
  );

  const handleOpenAdd = () => {
    const defaultBrand = listBrandFilter === 'KUNAFA' || brandFilter === 'KUNAFA' ? 'KUNAFA' : 'JB Cafe';
    setName('');
    setBrand(defaultBrand);
    setCategory(defaultBrand === 'KUNAFA' ? 'Kunafa' : 'Tea & Coffee');
    setPrice('');
    setDescription('');
    setImage('');
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
    setImage(item.image || '');
    setIngredients(item.ingredients || []);
    setShowAddModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const parsedIngredients = ingredients.map(ing => ({
      ...ing,
      amount: parseFloat(ing.amount as unknown as string) || 0
    }));

    const finalImage = image.trim() || getCategoryImageUrl(category);

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: name.trim(),
        category,
        price: parseFloat(price) || 0,
        description: description.trim() || "",
        brand,
        image: finalImage,
        ingredients: parsedIngredients,
      });
    } else {
      addMenuItem({
        name: name.trim(),
        category,
        price: parseFloat(price) || 0,
        available: true,
        description: description.trim() || "",
        brand,
        image: finalImage,
        ingredients: parsedIngredients,
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">MENU MANAGEMENT</h2>
          <p className="text-xs text-stone-500">Configure catalog prices, categories, and active recipes</p>
        </div>

        <button
          id="add-menu-item-btn"
          onClick={handleOpenAdd}
          className="btn-interactive w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs rounded-xl shadow-md shadow-amber-600/15 flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap"
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
            className={`btn-interactive px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${activeCategory === 'All'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                : 'bg-white border-[#EFE7DA] text-stone-600 hover:bg-[#FAF7F2]'
              }`}
          >
            All Items
          </button>
          {displayedCategories.map((cat) => {
            const isCatActive = activeCategory === cat;
            let activeColor = 'bg-amber-100 text-amber-900 border-amber-300';
            if (cat.includes('Coffee') || cat.includes('Tea')) activeColor = 'bg-amber-100 text-amber-900 border-amber-300';
            else if (cat.includes('Kunafa') || cat.includes('Dessert') || cat.includes('Cheesecake') || cat.includes('Brownie')) activeColor = 'bg-rose-100 text-rose-900 border-rose-300';
            else if (cat.includes('Pizza') || cat.includes('Pasta')) activeColor = 'bg-yellow-100 text-yellow-900 border-yellow-300';
            else if (cat.includes('Burger') || cat.includes('Sandwich') || cat.includes('Frankie') || cat.includes('Fries')) activeColor = 'bg-orange-100 text-orange-900 border-orange-300';
            else if (cat.includes('Shake') || cat.includes('Mocktail') || cat.includes('Drink')) activeColor = 'bg-sky-100 text-sky-900 border-sky-300';
            else activeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`btn-interactive px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isCatActive
                    ? `${activeColor} font-bold shadow-2xs`
                    : 'bg-white border-[#EFE7DA] text-stone-600 hover:bg-[#FAF7F2]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Brand Filter */}
        {currentRole !== 'admin_kunafa' && (
          <div className="flex bg-[#FAF7F2] border border-[#EFE7DA] p-1 rounded-xl w-full sm:w-auto shrink-0">
            {(['All', 'JB Cafe', 'KUNAFA'] as const).map((b) => (
              <button
                key={b}
                onClick={() => {
                  setListBrandFilter(b);
                  setActiveCategory('All');
                }}
                className={`btn-interactive flex-1 sm:flex-none px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  listBrandFilter === b
                    ? b === 'KUNAFA'
                      ? 'bg-rose-100 text-rose-900 shadow-2xs border border-rose-200'
                      : b === 'JB Cafe'
                      ? 'bg-amber-100 text-amber-900 shadow-2xs border border-amber-200'
                      : 'bg-white text-stone-900 shadow-2xs'
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
        {filteredItems.map((item, idx) => {
          const itemImage = getMenuItemImageUrl(item);

          return (
            <div
              key={item.id}
              style={{ animationDelay: `${(idx % 12) * 35}ms` }}
              className={`card-interactive bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                item.available ? 'border-stone-200/90' : 'border-stone-200 opacity-60 bg-stone-50/50'
              }`}
            >
              <div>
                <div className="flex gap-3.5 items-start">
                  {/* Category Image */}
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50/70 to-stone-100 border border-stone-200/80 flex items-center justify-center p-1.5 shadow-2xs group">
                    <img
                      src={itemImage}
                      alt={item.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xs"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {item.category}
                        </span>
                        {item.brand === 'KUNAFA' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            KUNAFA
                          </span>
                        )}
                        {(item.brand === 'JB Cafe' || !item.brand) && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            JB CAFE
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs whitespace-nowrap">
                        ₹{item.price}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-stone-900 text-base leading-snug">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>

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
                className={`btn-interactive flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${item.available
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-stone-500 bg-stone-100 hover:bg-stone-200'
                  }`}
              >
                {item.available ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{item.available ? 'Available' : 'Out of Stock'}</span>
              </button>

              <button
                onClick={() => handleOpenEdit(item)}
                className="btn-interactive text-xs font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1 rounded-lg hover:bg-stone-100 flex items-center space-x-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        );
      })}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-stone-900/35 backdrop-blur-md overflow-y-auto animate-fade-in flex items-center justify-center p-4" onClick={handleCloseModal}>
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200/80 animate-modal-spring overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/80">
                <h3 className="font-extrabold text-stone-900 text-base">
                  {editingItem ? 'Edit Menu Item' : '+ Add New Menu Item'}
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
                      onChange={(val) => {
                        const newBrand = val as 'JB Cafe' | 'KUNAFA';
                        setBrand(newBrand);
                        const targetCats = newBrand === 'KUNAFA' ? KUNAFA_CATEGORIES : JB_CAFE_CATEGORIES;
                        if (!targetCats.includes(category)) {
                          setCategory(targetCats[0]);
                        }
                      }}
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
                      options={modalCategories.map((cat) => ({ value: cat, label: cat }))}
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

                {/* Image Preview & Category Info */}
                <div className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl bg-white border border-amber-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <img
                      src={image.trim() || getCategoryImageUrl(category)}
                      alt={category}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-extrabold text-stone-800 flex items-center gap-1.5">
                      <span>Category Image</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-200/70 text-amber-900 border border-amber-300 font-bold">Auto</span>
                    </div>
                    <div className="text-[10px] text-stone-500 truncate mt-0.5">
                      {image.trim() ? 'Custom override URL' : getCategoryImageUrl(category)}
                    </div>
                    <div className="text-[10px] text-amber-800 font-medium mt-0.5">
                      Applied to all items in <span className="font-bold">{category}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Custom Image URL <span className="text-[10px] text-stone-400 font-normal">(Optional — defaults to {category} image)</span>
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Leave empty to use category default image"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden text-xs"
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
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
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
                              options={stockItems
                                .filter((s) => brand === 'KUNAFA' ? s.brand === 'KUNAFA' : (s.brand === 'JB Cafe' || !s.brand))
                                .map((s) => ({ value: s.id, label: `${s.name} (${s.unit})` }))}
                              placeholder="Select Material"
                              placement="top"
                              searchable
                            />
                          </div>
                          <input
                            type="number"
                            step="any"
                            required
                            min="0"
                            placeholder={`Amt${ing.unit ? ` (${ing.unit})` : ''}`}
                            value={ing.amount === 0 && (ing as any)._raw === undefined ? '' : ((ing as any)._raw ?? ing.amount)}
                            onChange={(e) => {
                              const newIngs = [...ingredients];
                              (newIngs[idx] as any)._raw = e.target.value;
                              newIngs[idx].amount = parseFloat(e.target.value) || 0;
                              setIngredients(newIngs);
                            }}
                            className="w-20 sm:w-28 shrink-0 px-2 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newIngs = [...ingredients];
                              newIngs.splice(idx, 1);
                              setIngredients(newIngs);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg shrink-0"
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
          </div>,
          document.body
        )}
    </div>
  );
};
