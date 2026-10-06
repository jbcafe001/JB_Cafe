import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Coffee, LogIn, Key, Mail, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../../services/auth';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const { login } = useCafe();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(email, password);
      // login via CafeContext with the fetched user role
      if (response.data) {
        if ((response.data as any).requiresPasswordChange) {
          setLoggedInUser(response.data);
          setNeedsPasswordChange(true);
        } else {
          login(response.data.email, response.data.role as UserRole, response.data.name, response.data.uid);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.toast !== false) {
        setError(err.message || 'Failed to login. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { auth, db } = await import('../../firebase');
      const { updatePassword } = await import('firebase/auth');
      const { doc, updateDoc } = await import('firebase/firestore');

      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        
        // Remove flag
        await updateDoc(doc(db, 'users', loggedInUser.uid), {
          requiresPasswordChange: false
        });

        // Complete login
        login(loggedInUser.email, loggedInUser.role as UserRole, loggedInUser.name, loggedInUser.uid);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
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
            Staff Portal Login
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start space-x-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!needsPasswordChange ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-hidden"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Log In to Café System'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4 font-semibold">
                You must set a new password before you can continue.
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-hidden"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-stone-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Key className="w-4 h-4" />
                <span>{loading ? 'Updating...' : 'Update Password & Continue'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
