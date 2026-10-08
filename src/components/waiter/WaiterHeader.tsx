import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Coffee, LogOut } from 'lucide-react';
import { useModalClose } from '../../hooks/useModalClose';

export const WaiterHeader: React.FC = () => {
  const { currentUser, settings, logout, showConfirm } = useCafe();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  useModalClose(() => setIsAvatarMenuOpen(false), isAvatarMenuOpen);

  const cafeName = settings?.cafeName || 'JB PAVILION & CAFE';

  const initials = (currentUser?.name || 'Rahul')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-[#B45309] text-white px-4 py-3.5 sm:py-4 -mx-4 -mt-4 mb-4 flex items-center justify-between shadow-md">
      {/* Left: Cafe Name & Logo */}
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner overflow-hidden">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
          {cafeName}
        </h1>
      </div>

      {/* Right: Profile Avatar & Name */}
      <div className="flex items-center space-x-2.5 relative">
        <span className="text-sm font-medium hidden sm:inline-block">
          Hello, {currentUser?.name || 'Rahul'}
        </span>
        <span className="text-sm font-medium sm:hidden">
          {currentUser?.name?.split(' ')[0] || 'Rahul'}
        </span>
        <div
          onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#B45309] font-black flex items-center justify-center text-xs sm:text-sm shadow-xs border-2 border-[#B45309] cursor-pointer hover:bg-stone-50 transition-colors"
        >
          {initials}
        </div>

        {/* Dropdown Menu */}
        {isAvatarMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-stone-100 text-stone-800">
              <p className="text-xs font-bold truncate">{currentUser?.name || 'Waiter'}</p>
              <p className="text-[10px] text-stone-500 truncate">{currentUser?.email || 'waiter@brewandbite.com'}</p>
            </div>
            <div className="p-1.5">
              <button
                onClick={() => {
                  setIsAvatarMenuOpen(false);
                  showConfirm(
                    'Logout',
                    'Are you sure you want to log out?',
                    () => logout(),
                    { isDestructive: true, confirmText: 'Logout' }
                  );
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
