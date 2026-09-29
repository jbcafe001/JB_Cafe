import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { User, UserRole } from '../../types';
import { Plus, UserCheck, Shield, ChefHat, Smartphone, X, Edit, ToggleLeft, ToggleRight, User as UserIcon } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, addUser, toggleUserStatus } = useCafe();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('waiter');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      status: 'active',
    });

    setName('');
    setEmail('');
    setPhone('');
    setShowAddModal(false);
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return {
          label: 'Admin',
          icon: <Shield className="w-3.5 h-3.5" />,
          cls: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'cook':
        return {
          label: 'Cook',
          icon: <ChefHat className="w-3.5 h-3.5" />,
          cls: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'others':
        return {
          label: 'Others',
          icon: <UserIcon className="w-3.5 h-3.5" />, // Note: Need to import UserIcon or use a generic one
          cls: 'bg-stone-50 text-stone-800 border-stone-200',
        };
      case 'waiter':
        return {
          label: 'Waiter',
          icon: <Smartphone className="w-3.5 h-3.5" />,
          cls: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      default:
        return {
          label: userRole || 'Unknown',
          icon: <UserIcon className="w-3.5 h-3.5" />,
          cls: 'bg-stone-50 text-stone-800 border-stone-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">STAFF & ROLES</h2>
          <p className="text-xs text-stone-500">Manage user access for Waiters, Kitchen Staff, and Admins</p>
        </div>

        <button
          id="add-user-btn"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add User</span>
        </button>
      </div>

      {/* Users Table (Section 19: Name, Role, Status) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="pb-2.5">Staff Name</th>
                <th className="pb-2.5">Email / Login ID</th>
                <th className="pb-2.5">Role</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {users.map((usr) => {
                const roleBadge = getRoleBadge(usr.role);
                const isActive = usr.status === 'active';

                return (
                  <tr key={usr.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 font-bold text-stone-900 flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-stone-100 font-bold text-stone-600 flex items-center justify-center text-xs">
                        {usr.name.charAt(0)}
                      </div>
                      <span>{usr.name}</span>
                    </td>
                    <td className="py-3 text-stone-500 font-mono text-xs">{usr.email}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.cls}`}
                      >
                        {roleBadge.icon}
                        <span>{roleBadge.label}</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border-stone-200'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => toggleUserStatus(usr.id)}
                        className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-2 py-1 rounded-lg hover:bg-stone-100 inline-flex items-center space-x-1"
                      >
                        {isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span>Disable</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-stone-400" />
                            <span>Enable</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="font-extrabold text-stone-900 text-base">+ Add Team Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Rao"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email / Login ID *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@cafe.demo"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assigned Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="waiter">Waiter (Mobile Terminal)</option>
                  <option value="cook">Cook (KDS Display)</option>
                  <option value="admin">Admin (Full Management)</option>
                  <option value="others">Others (Limited Access)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
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
                  id="save-user-btn"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
