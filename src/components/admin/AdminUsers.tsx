import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { User, UserRole } from '../../types';
import { Plus, UserCheck, Shield, ChefHat, Smartphone, X, Edit, ToggleLeft, ToggleRight, User as UserIcon, Trash2 } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { useModalClose } from '../../hooks/useModalClose';

export const AdminUsers: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus, showConfirm, currentRole } = useCafe();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('waiter');
  const [brand, setBrand] = useState<'JB Cafe' | 'KUNAFA'>('JB Cafe');

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingUserId(null);
  };
  useModalClose(handleCloseModal, showAddModal);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role,
          ...( ['waiter', 'cook', 'others'].includes(role) ? { brand } : { brand: undefined } ),
        });
      } else {
        await addUser({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role,
          status: 'active',
          ...( ['waiter', 'cook', 'others'].includes(role) ? { brand } : { brand: undefined } ),
        }, password);
      }

      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setEditingUserId(null);
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (usr: User) => {
    setEditingUserId(usr.id);
    setName(usr.name);
    setEmail(usr.email);
    setPhone(usr.phone || '');
    setRole(usr.role);
    setBrand(usr.brand || (currentRole === 'admin_kunafa' ? 'KUNAFA' : 'JB Cafe'));
    setShowAddModal(true);
  };

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRole('waiter');
    setBrand(currentRole === 'admin_kunafa' ? 'KUNAFA' : 'JB Cafe');
    setShowAddModal(true);
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return {
          label: 'Admin',
          icon: <Shield className="w-3.5 h-3.5" />,
          cls: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'admin_kunafa':
        return {
          label: 'Admin (KUNAFA)',
          icon: <Shield className="w-3.5 h-3.5" />,
          cls: 'bg-indigo-50 text-indigo-800 border-indigo-200',
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

  const displayedUsers = users.filter((usr) => {
    if (currentRole === 'admin_kunafa') {
      return usr.role === 'admin_kunafa' || usr.brand === 'KUNAFA';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">STAFF & ROLES</h2>
          <p className="text-xs text-stone-500">Manage user access for Waiters, Kitchen Staff, and Admins</p>
        </div>

        <button
          id="add-user-btn"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-colors active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
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
                {currentRole !== 'admin_kunafa' && <th className="pb-2.5">Brand</th>}
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {displayedUsers.map((usr) => {
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
                    {currentRole !== 'admin_kunafa' && (
                      <td className="py-3">
                        {['waiter', 'cook', 'others'].includes(usr.role) ? (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                            usr.brand === 'KUNAFA' 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {usr.brand || 'JB Cafe'}
                          </span>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>
                    )}
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
                      <div className="flex items-center justify-end space-x-2">
                        {usr.role !== 'admin' ? (
                          <>
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
                            <button
                              onClick={() => handleOpenEdit(usr)}
                              className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                showConfirm(
                                  'Delete User',
                                  `Are you sure you want to completely remove ${usr.name}? This action cannot be undone.`,
                                  () => deleteUser(usr.id),
                                  { isDestructive: true, confirmText: 'Delete' }
                                );
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider px-2">Protected</span>
                        )}
                      </div>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-150" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
              <h3 className="font-extrabold text-stone-900 text-base">{editingUserId ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs sm:text-sm min-h-[400px] flex flex-col">
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

              {!editingUserId && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Temporary Password *</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. password123"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assigned Role *</label>
                <CustomSelect
                  value={role}
                  onChange={(val) => setRole(val as UserRole)}
                  options={[
                    { value: 'waiter', label: 'Waiter (Mobile Terminal)' },
                    { value: 'cook', label: 'Cook (KDS Display)' },
                    { value: 'others', label: 'Others (Limited Access)' },
                    ...(currentRole !== 'admin_kunafa' ? [
                      { value: 'admin', label: 'Admin (Full Management)' },
                      { value: 'admin_kunafa', label: 'Admin (KUNAFA)' },
                    ] : [])
                  ]}
                />
              </div>

              {['waiter', 'cook', 'others'].includes(role) && currentRole !== 'admin_kunafa' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Associated Brand *</label>
                  <CustomSelect
                    value={brand}
                    onChange={(val) => setBrand(val as 'JB Cafe' | 'KUNAFA')}
                    options={[
                      { value: 'JB Cafe', label: 'JB Cafe' },
                      { value: 'KUNAFA', label: 'KUNAFA' },
                    ]}
                  />
                </div>
              )}

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

              <div className="pt-2 flex items-center justify-end space-x-2 mt-auto">
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs disabled:opacity-70 flex items-center space-x-2"
                >
                  {isSubmitting && <span className="animate-spin h-3 w-3 border-2 border-white/40 border-t-white rounded-full" />}
                  <span>{editingUserId ? 'Update User' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
