import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Coffee, RotateCcw, Shield, Check, Info } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { resetDemoData } = useCafe();
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">SETTINGS & PREFERENCES</h2>
        <p className="text-xs text-stone-500">Café profile, localized currency, and demo environment reset</p>
      </div>

      {/* Café Profile Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
          <Coffee className="w-4 h-4 text-amber-600" />
          <span>Café Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-500 font-semibold mb-1">Café Name</label>
            <input
              type="text"
              readOnly
              value="BREW & BITE Café"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Currency Symbol</label>
            <input
              type="text"
              readOnly
              value="INR (₹)"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Outlet Terminal</label>
            <input
              type="text"
              readOnly
              value="Main Dining Floor — POS #01"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Tax / GST Configuration</label>
            <input
              type="text"
              readOnly
              value="5% Inclusive CGST + SGST"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 focus:outline-hidden"
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
