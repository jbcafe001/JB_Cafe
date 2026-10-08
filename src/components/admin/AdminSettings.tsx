import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Coffee, RotateCcw, Shield, Check, Info } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { resetDemoData, settings, updateSettings, currentRole } = useCafe();
  const isKunafaAdmin = currentRole === 'admin_kunafa';
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  const [profile, setProfile] = useState(settings);

  // Sync profile when settings from DB changes (e.g. initial load)
  React.useEffect(() => {
    if (settings) setProfile(settings);
  }, [settings]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = () => {
    setIsSaving(true);
    updateSettings(profile);
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">SETTINGS & PREFERENCES</h2>
        <p className="text-xs text-stone-500">Café profile, localized currency, and demo environment reset</p>
      </div>

      {/* Café Profile Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>Café Profile</span>
          </h3>
          {!isKunafaAdmin && (
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-500 font-semibold mb-1">Café Name</label>
            <input
              type="text"
              value={profile.cafeName}
              onChange={(e) => setProfile({ ...profile, cafeName: e.target.value })}
              disabled={isKunafaAdmin}
              className={`w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${isKunafaAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Currency Symbol</label>
            <input
              type="text"
              value={profile.currencySymbol}
              onChange={(e) => setProfile({ ...profile, currencySymbol: e.target.value })}
              disabled={isKunafaAdmin}
              className={`w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${isKunafaAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Outlet Terminal</label>
            <input
              type="text"
              value={profile.outletTerminal}
              onChange={(e) => setProfile({ ...profile, outletTerminal: e.target.value })}
              disabled={isKunafaAdmin}
              className={`w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${isKunafaAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Tax / GST Configuration</label>
            <input
              type="text"
              value={profile.taxConfig}
              onChange={(e) => setProfile({ ...profile, taxConfig: e.target.value })}
              disabled={isKunafaAdmin}
              className={`w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${isKunafaAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Seed Materials Card - Hidden for Kunafa Admin */}
      {!isKunafaAdmin && (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Seed Required Materials</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md">
                Automatically creates all the required materials (Coffee, Milk, Sugar, etc.) needed by your current Menu Items, so you don't have to add them one by one.
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                const { doc, setDoc, getDocs, collection, deleteDoc } = await import('firebase/firestore');
                const { db } = await import('../../firebase');
                
                // Clear old stockItems collection
                const oldSnap = await getDocs(collection(db, 'stockItems'));
                await Promise.all(oldSnap.docs.map(d => deleteDoc(d.ref)));
                
                // Clear materials and stockBalances just in case
                const oldMaterials = await getDocs(collection(db, 'materials'));
                await Promise.all(oldMaterials.docs.map(d => deleteDoc(d.ref)));
                const oldBalances = await getDocs(collection(db, 'stockBalances'));
                await Promise.all(oldBalances.docs.map(d => deleteDoc(d.ref)));

                const requiredItems = [
                  { id: 'st-coffee', name: 'Coffee Beans', unit: 'KG', minThreshold: 2, costPerUnit: 800 },
                  { id: 'st-milk', name: 'Milk', unit: 'L', minThreshold: 10, costPerUnit: 60 },
                  { id: 'st-sugar', name: 'Sugar', unit: 'KG', minThreshold: 5, costPerUnit: 45 },
                  { id: 'st-lemons', name: 'Fresh Lemons & Mint', unit: 'KG', minThreshold: 1, costPerUnit: 120 },
                  { id: 'st-tea', name: 'Tea Leaves', unit: 'KG', minThreshold: 1, costPerUnit: 600 },
                  { id: 'st-bread', name: 'Bread', unit: 'Packs', minThreshold: 5, costPerUnit: 40 },
                  { id: 'st-cheese', name: 'Cheese', unit: 'KG', minThreshold: 2, costPerUnit: 450 },
                  { id: 'st-potatoes', name: 'Potatoes', unit: 'KG', minThreshold: 10, costPerUnit: 30 },
                  { id: 'st-chocolate', name: 'Cocoa & Brownie Mix', unit: 'KG', minThreshold: 2, costPerUnit: 500 },
                  { id: 'st-icecream', name: 'Vanilla Ice Cream', unit: 'L', minThreshold: 2, costPerUnit: 200 },
                ];
                for (const item of requiredItems) {
                  // Insert into materials
                  await setDoc(doc(db, 'materials', item.id), item);
                  // Insert into stockBalances
                  await setDoc(doc(db, 'stockBalances', item.id), {
                    id: item.id,
                    materialId: item.id,
                    available: 0,
                    status: 'out',
                    lastRestocked: new Date().toISOString().split('T')[0]
                  });
                }
                alert('Successfully seeded all required materials and stock balances!');
              } catch (err) {
                console.error(err);
                alert('Failed to seed materials');
              }
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-colors active:scale-95"
          >
            <Check className="w-4 h-4 text-emerald-100" />
            <span>Seed Materials Now</span>
          </button>
        </div>
      )}

    </div>
  );
};
