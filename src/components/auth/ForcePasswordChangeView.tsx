import React, { useState } from 'react';
import { Coffee, Key, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { auth, db } from '../../firebase';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useCafe } from '../../context/CafeContext';

export const ForcePasswordChangeView: React.FC = () => {
  const { currentUser, clearPasswordChangeFlag, addToast } = useCafe();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser || !currentUser) throw new Error('Session expired.');

      await updatePassword(auth.currentUser, newPassword);

      await updateDoc(doc(db, 'users', currentUser.id), {
        requiresPasswordChange: false,
      });

      clearPasswordChangeFlag();
      addToast('Password updated successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-center items-center p-4 sm:p-6 text-stone-800">
      <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <Coffee className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">BREW & BITE</h1>
          <p className="text-xs text-amber-300/80 tracking-wide font-medium uppercase mt-1">
            Action Required
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            <p className="font-bold mb-1">🔒 Password Change Required</p>
            <p>Hi <span className="font-semibold">{currentUser?.name}</span>, your account was assigned a temporary password. You must set a new password before you can continue.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start space-x-2">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">New Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Confirm New Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />}
              <Key className="w-4 h-4" />
              <span>{loading ? 'Updating...' : 'Set New Password & Continue'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
