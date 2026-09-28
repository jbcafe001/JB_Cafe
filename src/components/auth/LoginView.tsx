import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { UserRole } from '../../types';
import { Coffee, ShieldCheck, Smartphone, ChefHat, LogIn, Key, Mail } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useCafe();
  const [email, setEmail] = useState('waiter@cafe.demo');
  const [password, setPassword] = useState('••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('waiter');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, selectedRole);
  };

  const handleQuickLogin = (role: UserRole, demoEmail: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    login(demoEmail, role);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-center items-center p-4 sm:p-6 text-stone-800">
      <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Café Header Banner */}
        <div className="bg-stone-900 text-white p-6 text-center relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <Coffee className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">BREW & BITE</h1>
          <p className="text-xs text-amber-300/80 tracking-wide font-medium uppercase mt-1">
            Simple Café & Order Management
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Demo Login Badges */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
              1-Click Demo Login
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="demo-login-waiter"
                onClick={() => handleQuickLogin('waiter', 'waiter@cafe.demo')}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                  selectedRole === 'waiter'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-600'
                }`}
              >
                <Smartphone className="w-5 h-5 text-amber-600 mb-1" />
                <span className="font-bold text-xs">Waiter</span>
                <span className="text-[10px] text-stone-400">Mobile</span>
              </button>

              <button
                type="button"
                id="demo-login-kitchen"
                onClick={() => handleQuickLogin('kitchen', 'kitchen@cafe.demo')}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                  selectedRole === 'kitchen'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-600'
                }`}
              >
                <ChefHat className="w-5 h-5 text-amber-600 mb-1" />
                <span className="font-bold text-xs">Kitchen</span>
                <span className="text-[10px] text-stone-400">KDS Display</span>
              </button>

              <button
                type="button"
                id="demo-login-admin"
                onClick={() => handleQuickLogin('admin', 'admin@cafe.demo')}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                  selectedRole === 'admin'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-600'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-amber-600 mb-1" />
                <span className="font-bold text-xs">Admin</span>
                <span className="text-[10px] text-stone-400">Full Portal</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Email / Staff ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cafe.demo"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Password / Staff PIN
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="w-full mt-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Café System</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-100">
            <p className="text-[11px] text-stone-400">
              Demo credentials auto-filled. Tap any role card above for instant access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
