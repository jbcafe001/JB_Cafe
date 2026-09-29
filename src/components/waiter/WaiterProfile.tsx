import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { User, LogOut, Coffee, Shield, ChefHat, Smartphone } from 'lucide-react';

export const WaiterProfile: React.FC = () => {
  const { currentUser, logout, switchRole } = useCafe();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 bg-[#F8F6F0]">
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 font-extrabold text-xl border-2 border-amber-300">
          {currentUser?.name.charAt(0) || 'R'}
        </div>
        <h2 className="font-extrabold text-stone-900 text-lg">{currentUser?.name}</h2>
        <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Waiter Staff
        </span>
        <p className="text-xs text-stone-400 mt-2">{currentUser?.email}</p>
        <p className="text-xs text-stone-400">{currentUser?.phone}</p>
      </div>



      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center space-x-3 text-xs text-stone-600">
          <Coffee className="w-4 h-4 text-amber-600" />
          <span>BREW & BITE Café — Branch Terminal #01</span>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of Shift</span>
      </button>
    </div>
  );
};
