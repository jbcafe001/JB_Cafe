import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Coffee, RotateCcw, Shield, Check, Info } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { resetDemoData, settings, updateSettings } = useCafe();
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
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-500 font-semibold mb-1">Café Name</label>
            <input
              type="text"
              value={profile.cafeName}
              onChange={(e) => setProfile({ ...profile, cafeName: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Currency Symbol</label>
            <input
              type="text"
              value={profile.currencySymbol}
              onChange={(e) => setProfile({ ...profile, currencySymbol: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Outlet Terminal</label>
            <input
              type="text"
              value={profile.outletTerminal}
              onChange={(e) => setProfile({ ...profile, outletTerminal: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Tax / GST Configuration</label>
            <input
              type="text"
              value={profile.taxConfig}
              onChange={(e) => setProfile({ ...profile, taxConfig: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Reset Demo State</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md">
              Restores initial seed dataset: Table 04 ready with order #104, stock thresholds, menu
              items, and sample revenue data.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-colors active:scale-95"
        >
          {resetDone ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Demo State Restored!</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset to Clean Demo State</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
