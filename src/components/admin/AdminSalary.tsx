import React, { useState, useMemo } from 'react';
import { useCafe } from '../../context/CafeContext';
import { StaffMember, StaffRole, UpaadRecord, SalaryPaymentRecord } from '../../types';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  Phone,
  AlertCircle,
  IndianRupee,
  Search,
  Filter,
  History,
  X,
  CreditCard,
  Edit2,
  Trash2,
  Receipt,
  FileText,
  ChevronRight,
  Users,
  Check,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { useModalClose } from '../../hooks/useModalClose';
// Helper component for inline editable salary
const EditableSalary: React.FC<{
  staff: StaffMember;
  onUpdate: (id: string, val: number) => void;
}> = ({ staff, onUpdate }) => {
  const [val, setVal] = useState(staff.monthlySalary.toString());
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    setVal(staff.monthlySalary.toString());
  }, [staff.monthlySalary]);

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed !== staff.monthlySalary) {
      onUpdate(staff.id, parsed);
    } else {
      setVal(staff.monthlySalary.toString());
    }
  };

  return (
    <div 
      className={`flex items-center space-x-1 border-b transition-colors px-1 max-w-fit ${isEditing ? 'border-amber-500 bg-amber-50 rounded-t-md' : 'border-stone-300 hover:border-amber-400'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-stone-500 select-none">₹</span>
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
        title="Click to edit salary"
        className="w-20 bg-transparent focus:outline-hidden text-stone-800 font-bold"
      />
      <Edit2 className={`w-3 h-3 text-stone-400 transition-opacity ${isEditing ? 'opacity-0' : 'opacity-100 group-hover:text-amber-600'}`} />
    </div>
  );
};

export const AdminSalary: React.FC = () => {
  const {
    staffMembers,
    upaadRecords,
    salaryHistory,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    giveUpaad,
    editUpaad,
    deleteUpaad,
    paySalary,
  } = useCafe();

  // Navigation tabs within Staff Salary
  const [activeTab, setActiveTab] = useState<'staff' | 'history' | 'upaad'>('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | StaffRole>('All');

  // Modals state
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showUpaadModal, setShowUpaadModal] = useState(false);
  const [showPaySalaryModal, setShowPaySalaryModal] = useState(false);
  const [targetStaffForAction, setTargetStaffForAction] = useState<StaffMember | null>(null);
  const [editingUpaadRecord, setEditingUpaadRecord] = useState<UpaadRecord | null>(null);
  const [selectedSalaryRecord, setSelectedSalaryRecord] = useState<SalaryPaymentRecord | null>(null);

  // Form states - Add/Edit Staff
  const [staffForm, setStaffForm] = useState<{
    id?: string;
    name: string;
    role: StaffRole;
    monthlySalary: string;
    salaryDateDisplay: string;
    joiningDate: string;
    phone: string;
    status: 'Active' | 'Inactive';
  }>({
    name: '',
    role: 'Waiter',
    monthlySalary: '',
    salaryDateDisplay: '30 Sep',
    joiningDate: '01 Sep 2026',
    phone: '',
    status: 'Active',
  });

  // Form states - Give Upaad
  const [upaadForm, setUpaadForm] = useState<{
    staffId: string;
    amount: string;
    date: string;
    note: string;
  }>({
    staffId: '',
    amount: '',
    date: '10 Sep 2026',
    note: 'Personal advance',
  });
  const [upaadError, setUpaadError] = useState<string | null>(null);

  // Form states - Pay Salary
  const [paySalaryForm, setPaySalaryForm] = useState<{
    staffId: string;
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
    paymentDate: string;
    note: string;
  }>({
    staffId: '',
    paymentMethod: 'UPI',
    paymentDate: '30 Sep 2026',
    note: 'September Salary',
  });

  // Helper calculation for staff stats
  useModalClose(() => setSelectedStaff(null), !!selectedStaff);
  useModalClose(() => setShowUpaadModal(false), showUpaadModal);
  useModalClose(() => setShowPaySalaryModal(false), showPaySalaryModal);
  useModalClose(() => setShowAddStaffModal(false), showAddStaffModal);
  useModalClose(() => setSelectedSalaryRecord(null), !!selectedSalaryRecord);

  const getStaffUpaadTotal = (staffId: string, period: string) => {
    return upaadRecords
      .filter((u) => u.staffId === staffId && u.salaryPeriod === period)
      .reduce((sum, u) => sum + u.amount, 0);
  };

  const isStaffPaidForPeriod = (staffId: string, period: string) => {
    return salaryHistory.some((s) => s.staffId === staffId && s.month === period);
  };

  // Aggregated overview calculations (matching Section 2 of requirements)
  const overview = useMemo(() => {
    const totalStaff = staffMembers.length;
    const totalMonthlySalary = staffMembers.reduce((sum, s) => sum + s.monthlySalary, 0);

    let totalUpaadGiven = 0;
    let totalSalaryPaid = 0;
    let totalSalaryDue = 0;

    staffMembers.forEach((staff) => {
      const upaad = getStaffUpaadTotal(staff.id, staff.currentPeriod);
      totalUpaadGiven += upaad;

      const isPaid = isStaffPaidForPeriod(staff.id, staff.currentPeriod);
      const payable = Math.max(0, staff.monthlySalary - upaad);

      if (isPaid) {
        totalSalaryPaid += payable;
      } else {
        totalSalaryDue += payable;
      }
    });

    return {
      totalStaff,
      totalMonthlySalary,
      totalUpaadGiven,
      totalSalaryDue,
      totalSalaryPaid,
      nextSalaryDate: '30 September',
    };
  }, [staffMembers, upaadRecords, salaryHistory]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone.includes(searchTerm) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || staff.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staffMembers, searchTerm, roleFilter]);

  // Open Add Staff Modal
  const handleOpenAddStaff = () => {
    setStaffForm({
      name: '',
      role: 'Waiter',
      monthlySalary: '',
      salaryDateDisplay: '30 Sep',
      joiningDate: '01 Sep 2026',
      phone: '+91 ',
      status: 'Active',
    });
    setShowAddStaffModal(true);
  };

  // Open Edit Staff Modal
  const handleOpenEditStaff = (staff: StaffMember) => {
    setStaffForm({
      id: staff.id,
      name: staff.name,
      role: staff.role,
      monthlySalary: staff.monthlySalary.toString(),
      salaryDateDisplay: staff.salaryDateDisplay,
      joiningDate: staff.joiningDate,
      phone: staff.phone,
      status: staff.status,
    });
    setShowAddStaffModal(true);
  };

  // Submit Add/Edit Staff
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.monthlySalary) return;

    const salaryNum = parseInt(staffForm.monthlySalary, 10) || 0;

    if (staffForm.id) {
      updateStaffMember(staffForm.id, {
        name: staffForm.name.trim(),
        role: staffForm.role,
        monthlySalary: salaryNum,
        salaryDateDisplay: staffForm.salaryDateDisplay,
        joiningDate: staffForm.joiningDate,
        phone: staffForm.phone.trim(),
        status: staffForm.status,
      });
      if (selectedStaff && selectedStaff.id === staffForm.id) {
        setSelectedStaff({
          ...selectedStaff,
          name: staffForm.name.trim(),
          role: staffForm.role,
          monthlySalary: salaryNum,
          salaryDateDisplay: staffForm.salaryDateDisplay,
          joiningDate: staffForm.joiningDate,
          phone: staffForm.phone.trim(),
          status: staffForm.status,
        });
      }
    } else {
      addStaffMember({
        name: staffForm.name.trim(),
        role: staffForm.role,
        monthlySalary: salaryNum,
        salaryDateDay: 30,
        salaryDateDisplay: staffForm.salaryDateDisplay || '30 Sep',
        currentPeriod: 'Sep 2026',
        joiningDate: staffForm.joiningDate || '01 Sep 2026',
        phone: staffForm.phone.trim() || '+91 98765 43200',
        status: staffForm.status,
      });
    }

    setShowAddStaffModal(false);
  };

  // Open Give Upaad Modal
  const handleOpenGiveUpaad = (staff?: StaffMember) => {
    const defaultStaff = staff || staffMembers[0];
    setTargetStaffForAction(defaultStaff);
    setUpaadForm({
      staffId: defaultStaff ? defaultStaff.id : '',
      amount: '',
      date: '10 Sep 2026',
      note: 'Personal advance',
    });
    setEditingUpaadRecord(null);
    setUpaadError(null);
    setShowUpaadModal(true);
  };

  // Open Edit Upaad Modal
  const handleOpenEditUpaad = (record: UpaadRecord) => {
    const staff = staffMembers.find((s) => s.id === record.staffId);
    setTargetStaffForAction(staff || null);
    setEditingUpaadRecord(record);
    setUpaadForm({
      staffId: record.staffId,
      amount: record.amount.toString(),
      date: record.date,
      note: record.note || '',
    });
    setUpaadError(null);
    setShowUpaadModal(true);
  };

  // Submit Give/Edit Upaad
  const handleSubmitUpaad = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(upaadForm.amount, 10);
    if (!upaadForm.staffId || isNaN(amountNum) || amountNum <= 0) {
      setUpaadError('Please enter a valid advance amount.');
      return;
    }

    if (editingUpaadRecord) {
      const res = editUpaad(editingUpaadRecord.id, {
        amount: amountNum,
        date: upaadForm.date,
        note: upaadForm.note,
      });
      if (!res.success) {
        setUpaadError(res.error || 'Failed to update Upaad.');
        return;
      }
    } else {
      const res = giveUpaad({
        staffId: upaadForm.staffId,
        amount: amountNum,
        date: upaadForm.date,
        note: upaadForm.note,
      });
      if (!res.success) {
        setUpaadError(res.error || 'Failed to record Upaad.');
        return;
      }
    }

    setShowUpaadModal(false);
    setUpaadError(null);
  };

  // Open Pay Salary Modal
  const handleOpenPaySalary = (staff: StaffMember) => {
    setTargetStaffForAction(staff);
    const upaad = getStaffUpaadTotal(staff.id, staff.currentPeriod);
    const payable = Math.max(0, staff.monthlySalary - upaad);

    setPaySalaryForm({
      staffId: staff.id,
      paymentMethod: 'UPI',
      paymentDate: '30 Sep 2026',
      note: `${staff.currentPeriod} Salary Settled`,
    });
    setShowPaySalaryModal(true);
  };

  // Confirm Pay Salary
  const handleConfirmPaySalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStaffForAction) return;

    paySalary({
      staffId: targetStaffForAction.id,
      paymentMethod: paySalaryForm.paymentMethod,
      paymentDate: paySalaryForm.paymentDate,
      note: paySalaryForm.note,
    });

    setShowPaySalaryModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight uppercase">
              Staff Salary
            </h1>
            <span className="bg-amber-100 text-[#B45309] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Upaad & Payroll
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage salaries, record Upaad (early advances), and settle monthly staff payroll
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            id="give-upaad-btn-header"
            onClick={() => handleOpenGiveUpaad()}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Give Upaad</span>
          </button>

          <button
            id="add-staff-btn-header"
            onClick={handleOpenAddStaff}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 bg-[#B45309] hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* 2. STAFF SALARY DASHBOARD — Simple Overview Cards (Section 2) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Staff */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Staff</p>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-1.5">{overview.totalStaff}</p>
          <p className="text-[11px] text-stone-500 font-medium mt-0.5">8 active team members</p>
        </div>

        {/* Total Monthly Salary */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Monthly Salary</p>
            <Wallet className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-1.5">
            ₹{overview.totalMonthlySalary.toLocaleString()}
          </p>
          <p className="text-[11px] text-stone-500 font-medium mt-0.5">Committed gross payroll</p>
        </div>

        {/* Total Upaad Given */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Total Upaad Given</p>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-1.5">
            ₹{overview.totalUpaadGiven.toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Salary advances taken</p>
        </div>

        {/* Salary Due */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs border-l-4 border-l-stone-900">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">Salary Due</p>
            <Clock className="w-4 h-4 text-stone-800" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 mt-1.5">
            ₹{overview.totalSalaryDue.toLocaleString()}
          </p>
          <p className="text-[11px] text-stone-500 font-medium mt-0.5">Net balance payable</p>
        </div>

        {/* Next Salary Date */}
        <div className="col-span-2 md:col-span-1 bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider">Next Salary Date</p>
            <Calendar className="w-4 h-4 text-[#B45309]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#B45309] mt-1.5">30 Sep</p>
          <p className="text-[11px] text-amber-800 font-medium mt-0.5">Scheduled settlement</p>
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            id="tab-staff-list"
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'staff'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Directory</span>
          </button>

          <button
            id="tab-salary-history"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Salary History</span>
          </button>

          <button
            id="tab-upaad-log"
            onClick={() => setActiveTab('upaad')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'upaad'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Upaad Advances</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STAFF DIRECTORY & PAYABLES TABLE */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/50">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-staff-input"
                type="text"
                placeholder="Search staff name, role, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Role Filter Chips */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
              {(['All', 'Waiter', 'Kitchen', 'Admin', 'Other Staff'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    roleFilter === role
                      ? 'bg-[#B45309] text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Staff Table (Section 3) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-100">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Monthly Salary</th>
                  <th className="px-4 py-3.5 text-amber-700">Upaad Taken</th>
                  <th className="px-4 py-3.5 text-stone-900 font-black">Salary Payable</th>
                  <th className="px-4 py-3.5">Salary Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {filteredStaff.map((staff) => {
                  const upaadTaken = getStaffUpaadTotal(staff.id, staff.currentPeriod);
                  const isPaid = isStaffPaidForPeriod(staff.id, staff.currentPeriod);
                  const salaryPayable = Math.max(0, staff.monthlySalary - upaadTaken);

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-amber-50/20 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStaff(staff)}
                    >
                      {/* Employee Name */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-stone-900 flex items-center space-x-1.5">
                            <span>{staff.name}</span>
                          </p>
                          <p className="text-[11px] text-stone-400">{staff.phone}</p>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          {staff.role}
                        </span>
                      </td>

                      {/* Monthly Salary */}
                      <td className="px-4 py-4 font-semibold text-stone-800">
                        <EditableSalary 
                          staff={staff} 
                          onUpdate={(id, val) => updateStaffMember(id, { ...staff, monthlySalary: val })}
                        />
                      </td>

                      {/* Upaad Taken */}
                      <td className="px-4 py-4 font-bold text-amber-700">
                        {upaadTaken > 0 ? `₹${upaadTaken.toLocaleString()}` : '₹0'}
                      </td>

                      {/* Salary Payable (Automatic calculation: Monthly Salary - Upaad) */}
                      <td className="px-4 py-4">
                        <span className="font-black text-stone-900 text-sm sm:text-base">
                          ₹{salaryPayable.toLocaleString()}
                        </span>
                        {upaadTaken > 0 && (
                          <span className="text-[10px] text-stone-400 block -mt-0.5">
                            (₹{staff.monthlySalary.toLocaleString()} − ₹{upaadTaken.toLocaleString()})
                          </span>
                        )}
                      </td>

                      {/* Salary Date */}
                      <td className="px-4 py-4 text-stone-600 font-medium">
                        {staff.salaryDateDisplay}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center space-x-1 w-fit">
                            <Check className="w-3 h-3" />
                            <span>PAID</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider flex items-center space-x-1 w-fit">
                            <Clock className="w-3 h-3" />
                            <span>PENDING</span>
                          </span>
                        )}
                      </td>

                      {/* Row Action Buttons */}
                      <td
                        className="px-5 py-4 text-right"
                        onClick={(e) => e.stopPropagation()} // Prevent opening details modal when clicking specific buttons
                      >
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            id={`give-upaad-${staff.id}`}
                            onClick={() => handleOpenGiveUpaad(staff)}
                            title="Give early advance"
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3 text-[#B45309]" />
                            <span>Upaad</span>
                          </button>

                          {!isPaid ? (
                            <button
                              id={`pay-salary-${staff.id}`}
                              onClick={() => handleOpenPaySalary(staff)}
                              className="px-3 py-1.5 bg-[#B45309] hover:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-all active:scale-95 flex items-center space-x-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Pay</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              Settled
                            </span>
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
      )}

      {/* TAB 2: SALARY HISTORY (Section 12) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">Past Salary Payments & Records</h2>
              <p className="text-xs text-stone-500">Historical settled salaries with Upaad deductions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-100">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-4 py-3.5">Month</th>
                  <th className="px-4 py-3.5">Monthly Salary</th>
                  <th className="px-4 py-3.5 text-amber-700">Upaad</th>
                  <th className="px-4 py-3.5 text-stone-900 font-bold">Paid Amount</th>
                  <th className="px-4 py-3.5">Payment Date</th>
                  <th className="px-4 py-3.5">Method</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {salaryHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-4 font-bold text-stone-900">{rec.staffName}</td>
                    <td className="px-4 py-4 font-medium text-stone-600">{rec.month}</td>
                    <td className="px-4 py-4 text-stone-600">₹{rec.monthlySalary.toLocaleString()}</td>
                    <td className="px-4 py-4 text-amber-700 font-semibold">
                      ₹{rec.totalUpaad.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 font-black text-stone-900">
                      ₹{rec.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-stone-600">{rec.paymentDate}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700">
                        {rec.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedSalaryRecord(rec)}
                        className="text-xs text-[#B45309] font-bold hover:underline"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL UPAAD ADVANCES LOG (Section 13) */}
      {activeTab === 'upaad' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">All Upaad Advances Given</h2>
              <p className="text-xs text-stone-500">Record of early salary advances and personal loans</p>
            </div>
            <button
              onClick={() => handleOpenGiveUpaad()}
              className="px-3 py-1.5 bg-[#B45309] hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Upaad</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-100">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Employee</th>
                  <th className="px-4 py-3.5">Salary Period</th>
                  <th className="px-4 py-3.5 text-amber-700 font-bold">Advance Amount</th>
                  <th className="px-4 py-3.5">Reason / Note</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {upaadRecords.map((upd) => (
                  <tr key={upd.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-stone-600">{upd.date}</td>
                    <td className="px-4 py-4 font-bold text-stone-900">{upd.staffName}</td>
                    <td className="px-4 py-4 text-stone-500">{upd.salaryPeriod}</td>
                    <td className="px-4 py-4 font-black text-amber-800 text-base">
                      ₹{upd.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-stone-600 italic">{upd.note || 'Advance'}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditUpaad(upd)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                          title="Edit Upaad"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete this ₹${upd.amount} Upaad record?`)) {
                              deleteUpaad(upd.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                          title="Delete Upaad"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. EMPLOYEE DETAIL MODAL (Section 5 & Section 13) */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedStaff(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] shadow-2xl border border-stone-200 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="overflow-y-auto flex-1">
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-start justify-between bg-stone-50/60">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#B45309] text-white font-black flex items-center justify-center text-base shadow-xs">
                  {selectedStaff.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">{selectedStaff.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-stone-500 mt-0.5">
                    <span className="font-semibold text-stone-700">{selectedStaff.role}</span>
                    <span>•</span>
                    <span>{selectedStaff.phone}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStaff(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Profile Details Card */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block font-bold uppercase text-[10px]">Monthly Salary</span>
                  <span className="text-base font-black text-stone-900 mt-0.5 block">
                    ₹{selectedStaff.monthlySalary.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block font-bold uppercase text-[10px]">Salary Date</span>
                  <span className="text-base font-black text-stone-900 mt-0.5 block">
                    {selectedStaff.salaryDateDisplay}
                  </span>
                </div>
              </div>

              {/* Salary Summary Card (Section 5) */}
              {(() => {
                const upaad = getStaffUpaadTotal(selectedStaff.id, selectedStaff.currentPeriod);
                const isPaid = isStaffPaidForPeriod(selectedStaff.id, selectedStaff.currentPeriod);
                const payable = Math.max(0, selectedStaff.monthlySalary - upaad);

                return (
                  <div className="bg-stone-900 text-white p-5 rounded-2xl shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                      <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                        Current Salary Period ({selectedStaff.currentPeriod})
                      </span>
                      {isPaid ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900 text-emerald-200 border border-emerald-700 uppercase">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-900 text-amber-200 border border-amber-700 uppercase">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center text-stone-300">
                        <span>Monthly Salary</span>
                        <span className="font-semibold text-white">
                          ₹{selectedStaff.monthlySalary.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-amber-400">
                        <span>Upaad Taken</span>
                        <span className="font-semibold">− ₹{upaad.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-stone-800 pt-2 flex justify-between items-center text-base">
                        <span className="font-bold text-white">Salary Payable</span>
                        <span className="font-black text-amber-400 text-xl">
                          ₹{payable.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons inside summary */}
                    <div className="pt-2 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStaff(null);
                          handleOpenGiveUpaad(selectedStaff);
                        }}
                        className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs rounded-xl transition-colors text-center"
                      >
                        + Give Upaad
                      </button>

                      {!isPaid && (
                        <button
                          onClick={() => {
                            setSelectedStaff(null);
                            handleOpenPaySalary(selectedStaff);
                          }}
                          className="flex-1 py-2.5 bg-[#B45309] hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-colors text-center"
                        >
                          Pay Salary
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 13. Upaad History for this Employee (Section 13) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    Upaad History
                  </h4>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Total: ₹
                    {getStaffUpaadTotal(
                      selectedStaff.id,
                      selectedStaff.currentPeriod
                    ).toLocaleString()}
                  </span>
                </div>

                {(() => {
                  const staffUpaads = upaadRecords.filter(
                    (u) => u.staffId === selectedStaff.id
                  );

                  if (staffUpaads.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 text-center text-xs text-stone-400">
                        No Upaad advances recorded for this staff member.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {staffUpaads.map((upd) => (
                        <div
                          key={upd.id}
                          className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-stone-800">{upd.date}</span>
                              <span className="text-[10px] text-stone-400">
                                ({upd.salaryPeriod})
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {upd.note || 'Advance'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-black text-amber-800 text-sm">
                              ₹{upd.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedStaff(null);
                                handleOpenEditUpaad(upd);
                              }}
                              className="p-1 text-stone-400 hover:text-stone-700"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Past Salary Settlements for this Employee */}
              <div>
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">
                  Past Settlements
                </h4>
                {(() => {
                  const staffHistory = salaryHistory.filter(
                    (s) => s.staffId === selectedStaff.id
                  );
                  if (staffHistory.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 text-center text-xs text-stone-400">
                        No past settlement records yet.
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {staffHistory.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-stone-800">{rec.month}</span>
                            <p className="text-[11px] text-stone-500">
                              Paid on {rec.paymentDate} via {rec.paymentMethod}
                            </p>
                          </div>
                          <span className="font-black text-emerald-800 text-sm">
                            ₹{rec.paidAmount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Edit Staff Details Shortcut */}
              <div className="pt-2 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => {
                    const current = selectedStaff;
                    setSelectedStaff(null);
                    handleOpenEditStaff(current);
                  }}
                  className="text-xs text-stone-600 hover:text-stone-900 font-semibold flex items-center space-x-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Employee Profile</span>
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. GIVE UPAAD / SALARY ADVANCE MODAL (Section 6 & Section 19) */}
      {showUpaadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowUpaadModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">
                  {editingUpaadRecord ? 'Edit Upaad Advance' : 'Give Upaad (Salary Advance)'}
                </h3>
              </div>
              <button
                onClick={() => setShowUpaadModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpaad} className="p-5 space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Employee
                </label>
                {editingUpaadRecord ? (
                  // When editing, show disabled-style display (not interactive)
                  <div className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-500 cursor-not-allowed">
                    {(() => {
                      const st = staffMembers.find((s) => s.id === upaadForm.staffId);
                      if (!st) return 'Select employee';
                      const upaad = getStaffUpaadTotal(st.id, st.currentPeriod);
                      const remaining = st.monthlySalary - upaad;
                      return `${st.name} (${st.role} — Max Advance: ₹${remaining.toLocaleString()})`;
                    })()}
                  </div>
                ) : (
                  <CustomSelect
                    id="upaad-staff-select"
                    value={upaadForm.staffId}
                    onChange={(val) => {
                      const st = staffMembers.find((s) => s.id === val);
                      setUpaadForm({ ...upaadForm, staffId: val });
                      setTargetStaffForAction(st || null);
                      setUpaadError(null);
                    }}
                    options={staffMembers.map((s) => {
                      const upaad = getStaffUpaadTotal(s.id, s.currentPeriod);
                      const remaining = s.monthlySalary - upaad;
                      return {
                        value: s.id,
                        label: `${s.name} (${s.role} — Max Advance: ₹${remaining.toLocaleString()})`,
                      };
                    })}
                  />
                )}
              </div>

              {/* Remaining Salary Context Box (Section 19) */}
              {targetStaffForAction && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs">
                  <div className="flex justify-between items-center text-[#B45309]">
                    <span>Monthly Salary:</span>
                    <span className="font-bold">₹{targetStaffForAction.monthlySalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#B45309] mt-1">
                    <span>Already Taken Upaad:</span>
                    <span className="font-bold">
                      ₹
                      {getStaffUpaadTotal(
                        targetStaffForAction.id,
                        targetStaffForAction.currentPeriod
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-amber-900 font-bold border-t border-amber-200 pt-1.5 mt-1.5">
                    <span>Max Allowed Advance:</span>
                    <span>
                      ₹
                      {(
                        targetStaffForAction.monthlySalary -
                        getStaffUpaadTotal(
                          targetStaffForAction.id,
                          targetStaffForAction.currentPeriod
                        )
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Upaad Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400">
                    ₹
                  </span>
                  <input
                    id="upaad-amount-input"
                    type="number"
                    min="100"
                    step="100"
                    placeholder="e.g. 3000"
                    value={upaadForm.amount}
                    onChange={(e) => {
                      setUpaadForm({ ...upaadForm, amount: e.target.value });
                      setUpaadError(null);
                    }}
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  id="upaad-date-input"
                  type="text"
                  placeholder="e.g. 10 September 2026"
                  value={upaadForm.date}
                  onChange={(e) => setUpaadForm({ ...upaadForm, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Note / Reason
                </label>
                <input
                  id="upaad-note-input"
                  type="text"
                  placeholder="e.g. Personal advance, Medical, Festival"
                  value={upaadForm.note}
                  onChange={(e) => setUpaadForm({ ...upaadForm, note: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Error Message (Section 19) */}
              {upaadError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{upaadError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUpaadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="submit-upaad-btn"
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95"
                >
                  {editingUpaadRecord ? 'Update Upaad' : 'Record Upaad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. SALARY PAYMENT CONFIRMATION MODAL (Section 9) */}
      {showPaySalaryModal && targetStaffForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowPaySalaryModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#B45309] text-white flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">Salary Payment Confirmation</h3>
              </div>
              <button
                onClick={() => setShowPaySalaryModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const totalUpaad = getStaffUpaadTotal(
                targetStaffForAction.id,
                targetStaffForAction.currentPeriod
              );
              const finalSalary = Math.max(0, targetStaffForAction.monthlySalary - totalUpaad);

              return (
                <form onSubmit={handleConfirmPaySalary} className="p-5 space-y-4">
                  {/* Summary Card */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-stone-500">
                      <span>Employee:</span>
                      <span className="font-bold text-stone-900">{targetStaffForAction.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-500">
                      <span>Monthly Salary:</span>
                      <span className="font-bold text-stone-800">
                        ₹{targetStaffForAction.monthlySalary.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-amber-700">
                      <span>Total Upaad Deducted:</span>
                      <span className="font-bold">− ₹{totalUpaad.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-stone-200 pt-2 flex justify-between items-center text-sm">
                      <span className="font-black text-stone-900">Final Salary Payable:</span>
                      <span className="font-black text-emerald-700 text-xl">
                        ₹{finalSalary.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['UPI', 'Cash', 'Bank Transfer'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaySalaryForm({ ...paySalaryForm, paymentMethod: method })}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                            paySalaryForm.paymentMethod === method
                              ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Date */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                      Payment Date
                    </label>
                    <input
                      id="payment-date-input"
                      type="text"
                      placeholder="e.g. 30 September 2026"
                      value={paySalaryForm.paymentDate}
                      onChange={(e) => setPaySalaryForm({ ...paySalaryForm, paymentDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Optional Note */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                      Optional Note
                    </label>
                    <input
                      id="payment-note-input"
                      type="text"
                      placeholder="e.g. September Salary"
                      value={paySalaryForm.note}
                      onChange={(e) => setPaySalaryForm({ ...paySalaryForm, note: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPaySalaryModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                    >
                      Cancel
                    </button>
                    <button
                      id="confirm-salary-payment-btn"
                      type="submit"
                      className="px-4 py-2.5 bg-[#B45309] hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Salary Payment</span>
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. ADD / EDIT STAFF MODAL (Section 4) */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowAddStaffModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 rounded-t-2xl">
              <h3 className="font-bold text-stone-900 text-sm">
                {staffForm.id ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-5 space-y-3.5">
              {/* Employee Name */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Employee Name
                </label>
                <input
                  id="staff-name-input"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Role
                </label>
                <CustomSelect
                  id="staff-role-select"
                  value={staffForm.role}
                  onChange={(val) => setStaffForm({ ...staffForm, role: val as StaffRole })}
                  options={[
                    { value: 'Waiter', label: 'Waiter' },
                    { value: 'Kitchen', label: 'Kitchen' },
                    { value: 'Admin', label: 'Admin' },
                    { value: 'Other Staff', label: 'Other Staff' },
                  ]}
                />
              </div>

              {/* Monthly Salary */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Monthly Salary (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400">
                    ₹
                  </span>
                  <input
                    id="staff-salary-input"
                    type="number"
                    placeholder="e.g. 18000"
                    value={staffForm.monthlySalary}
                    onChange={(e) => setStaffForm({ ...staffForm, monthlySalary: e.target.value })}
                    required
                    className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Salary Date & Joining Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Salary Date
                  </label>
                  <input
                    id="staff-salary-date-input"
                    type="text"
                    placeholder="e.g. 30 Sep"
                    value={staffForm.salaryDateDisplay}
                    onChange={(e) => setStaffForm({ ...staffForm, salaryDateDisplay: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Joining Date
                  </label>
                  <input
                    id="staff-joining-date-input"
                    type="text"
                    placeholder="e.g. 15 Jan 2025"
                    value={staffForm.joiningDate}
                    onChange={(e) => setStaffForm({ ...staffForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  id="staff-phone-input"
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="radio"
                      name="staffStatus"
                      checked={staffForm.status === 'Active'}
                      onChange={() => setStaffForm({ ...staffForm, status: 'Active' })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="radio"
                      name="staffStatus"
                      checked={staffForm.status === 'Inactive'}
                      onChange={() => setStaffForm({ ...staffForm, status: 'Inactive' })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-stone-100">
                {staffForm.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${staffForm.name} from staff directory?`)) {
                        deleteStaffMember(staffForm.id!);
                        setShowAddStaffModal(false);
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Delete Staff
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    id="save-staff-submit-btn"
                    type="submit"
                    className="px-4 py-2 bg-[#B45309] hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95"
                  >
                    {staffForm.id ? 'Save Changes' : 'Add Staff'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Settlement Receipt Modal */}
      {selectedSalaryRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedSalaryRecord(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-stone-200 p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-stone-900 text-sm">Salary Payment Slip</h3>
              </div>
              <button
                onClick={() => setSelectedSalaryRecord(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Employee:</span>
                <span className="font-bold text-stone-900">{selectedSalaryRecord.staffName}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Role:</span>
                <span className="font-medium text-stone-700">{selectedSalaryRecord.role}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Month:</span>
                <span className="font-medium text-stone-700">{selectedSalaryRecord.month}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Monthly Base Salary:</span>
                <span className="font-medium text-stone-900">
                  ₹{selectedSalaryRecord.monthlySalary.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>Upaad Advance Deducted:</span>
                <span>− ₹{selectedSalaryRecord.totalUpaad.toLocaleString()}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-black text-stone-900">
                <span>Total Disbursed:</span>
                <span className="text-emerald-700 text-base">
                  ₹{selectedSalaryRecord.paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-stone-400 text-[11px] pt-1">
                <span>Paid On:</span>
                <span>
                  {selectedSalaryRecord.paymentDate} via {selectedSalaryRecord.paymentMethod}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedSalaryRecord(null)}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
