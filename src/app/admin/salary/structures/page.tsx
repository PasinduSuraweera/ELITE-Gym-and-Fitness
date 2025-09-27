"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Calculator, 
  TrendingUp,
  Award,
  AlertCircle,
  Users,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface SalaryStructureForm {
  employeeName: string;
  employeeId: string;
  employeeRole: string;
  baseSalary: number;
  allowances: {
    transport?: number;
    meal?: number;
    housing?: number;
    performance?: number;
    overtime?: number;
  };
  deductions: {
    tax?: number;
    epf?: number;
    etf?: number;
    insurance?: number;
    advance?: number;
  };
  paymentFrequency: string;
  effectiveDate: string;
  status: string;
}

const initialFormState: SalaryStructureForm = {
  employeeName: "",
  employeeId: "",
  employeeRole: "user",
  baseSalary: 0,
  allowances: {},
  deductions: {},
  paymentFrequency: "monthly",
  effectiveDate: new Date().toISOString().split('T')[0],
  status: "active"
};

export default function SalaryStructuresPage() {
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStructure, setViewingStructure] = useState<any>(null);
  const [editingStructure, setEditingStructure] = useState<any>(null);
  const [formData, setFormData] = useState<SalaryStructureForm>(initialFormState);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Convex queries and mutations
  const { isSignedIn } = useAuth();
  const salaryStructures = useQuery(api.salary.getAllSalaryStructures, isSignedIn ? undefined : "skip");
  const salaryStats = useQuery(api.salary.getSalaryStats, isSignedIn ? undefined : "skip");
  const allUsers = useQuery(api.users.getAllUsers, isSignedIn ? undefined : "skip");
  
  const createSalaryStructure = useMutation(api.salary.createSalaryStructure);
  const updateSalaryStructure = useMutation(api.salary.updateSalaryStructure);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (amount: number) => {
    if (!mounted) return 'Rs. 0';
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | number | Date) => {
    if (!mounted || !date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Download salary structures as CSV
  const handleDownload = () => {
    if (!salaryStructures?.length) return;

    const headers = [
      'Employee Name',
      'Employee ID', 
      'Role',
      'Base Salary (LKR)',
      'Transport Allowance (LKR)',
      'Meal Allowance (LKR)',
      'Housing Allowance (LKR)',
      'Performance Allowance (LKR)',
      'Overtime Allowance (LKR)',
      'Tax Deduction (%)',
      'EPF Deduction (%)',
      'ETF Deduction (%)',
      'Insurance Deduction (LKR)',
      'Advance Deduction (LKR)',
      'Total Compensation (LKR)',
      'Payment Frequency',
      'Status',
      'Effective Date'
    ];

    const csvData = filteredStructures.map((structure: any) => {
      // Helper function to get allowance amount by type
      const getAllowanceAmount = (type: string) => {
        if (Array.isArray(structure.allowances)) {
          const allowance = structure.allowances.find((a: any) => a.type === type);
          return allowance ? allowance.amount : 0;
        }
        return structure.allowances?.[type] || 0;
      };

      // Helper function to get deduction amount by type
      const getDeductionAmount = (type: string) => {
        if (Array.isArray(structure.deductions)) {
          const deduction = structure.deductions.find((d: any) => d.type === type);
          return deduction ? deduction.amount : 0;
        }
        return structure.deductions?.[type] || 0;
      };

      return [
        structure.employeeName,
        structure.employeeId,
        structure.employeeRole,
        structure.baseSalary,
        getAllowanceAmount('transport'),
        getAllowanceAmount('meal'),
        getAllowanceAmount('housing'),
        getAllowanceAmount('performance'),
        getAllowanceAmount('overtime'),
        getDeductionAmount('tax'),
        getDeductionAmount('epf'),
        getDeductionAmount('etf'),
        getDeductionAmount('insurance'),
        getDeductionAmount('advance'),
        calculateTotalSalary(structure),
        structure.paymentFrequency,
        structure.status,
        formatDate(structure.effectiveDate)
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `salary-structures-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Calculate total salary including allowances and performance bonus only
  // Note: Rates like trainerSessionRate, overtimeRate are not added as they are per-unit rates
  const calculateTotalSalary = (structure: any) => {
    let allowancesTotal = 0;
    
    // Handle both array and object formats for allowances
    if (Array.isArray(structure.allowances)) {
      allowancesTotal = structure.allowances.reduce((sum: number, allowance: any) => 
        sum + (allowance.amount || 0), 0);
    } else if (structure.allowances && typeof structure.allowances === 'object') {
      allowancesTotal = Object.values(structure.allowances).reduce((sum: number, val: any) => 
        sum + (val || 0), 0);
    }
    
    // Add fixed income sources (not rates)
    const baseSalary = structure.baseSalary || 0;
    const performanceBonus = structure.performanceBonus || 0;
    
    return baseSalary + allowancesTotal + performanceBonus;
  };

  // Filter salary structures
  const filteredStructures = salaryStructures?.filter((structure: any) => {
    const matchesSearch = structure.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         structure.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || structure.employeeRole === filterRole;
    const matchesStatus = filterStatus === "all" || structure.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStructure) {
        await updateSalaryStructure({
          structureId: editingStructure._id,
          baseSalary: formData.baseSalary,
          paymentFrequency: formData.paymentFrequency as any,
          status: formData.status as any,
          allowances: Object.entries(formData.allowances).map(([type, amount]) => ({
            type,
            amount: amount || 0,
            isPercentage: false
          })),
          deductions: Object.entries(formData.deductions).map(([type, amount]) => ({
            type,
            amount: amount || 0,
            isPercentage: type === 'tax' || type === 'epf' || type === 'etf'
          }))
        });
      } else {
        await createSalaryStructure({
          employeeClerkId: formData.employeeId, // This should be the Clerk ID
          baseSalary: formData.baseSalary,
          paymentFrequency: formData.paymentFrequency as any,
          allowances: Object.entries(formData.allowances).map(([type, amount]) => ({
            type,
            amount: amount || 0,
            isPercentage: false
          })),
          deductions: Object.entries(formData.deductions).map(([type, amount]) => ({
            type,
            amount: amount || 0,
            isPercentage: type === 'tax' || type === 'epf' || type === 'etf'
          }))
        });
      }
      
      // Reset form
      setFormData(initialFormState);
      setShowForm(false);
      setEditingStructure(null);
    } catch (error) {
      console.error("Error saving salary structure:", error);
    }
  };

  const handleEdit = (structure: any) => {
    setEditingStructure(structure);
    
    // Convert allowances array to object
    const allowancesObj: any = {};
    structure.allowances?.forEach((allowance: any) => {
      allowancesObj[allowance.type] = allowance.amount;
    });
    
    // Convert deductions array to object
    const deductionsObj: any = {};
    structure.deductions?.forEach((deduction: any) => {
      deductionsObj[deduction.type] = deduction.amount;
    });
    
    setFormData({
      employeeName: structure.employeeName,
      employeeId: structure.employeeClerkId,
      employeeRole: structure.employeeRole,
      baseSalary: structure.baseSalary,
      allowances: allowancesObj,
      deductions: deductionsObj,
      paymentFrequency: structure.paymentFrequency,
      effectiveDate: new Date(structure.effectiveDate).toISOString().split('T')[0],
      status: structure.status
    });
    setShowForm(true);
  };

  const handleView = (structure: any) => {
    setViewingStructure(structure);
    setShowViewModal(true);
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setShowForm(false);
    setShowViewModal(false);
    setEditingStructure(null);
    setViewingStructure(null);
  };

  return (
    <AdminLayout 
      title="Salary Structures" 
      subtitle="Create and manage employee compensation structures"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Structures</p>
              <p className="text-2xl font-bold text-blue-400">{salaryStats?.totalEmployeesOnPayroll || 0}</p>
            </div>
            <Users className="h-6 w-6 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Monthly Cost</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(salaryStats?.totalMonthlyPayroll || 0)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Average Salary</p>
              <p className="text-2xl font-bold text-purple-400">
                {salaryStats?.totalEmployeesOnPayroll 
                  ? formatCurrency((salaryStats.totalMonthlyPayroll || 0) / salaryStats.totalEmployeesOnPayroll)
                  : formatCurrency(0)
                }
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-400">{salaryStats?.totalPendingApprovals || 0}</p>
            </div>
            <AlertCircle className="h-6 w-6 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filters */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="user">Staff</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Structure
          </button>
        </div>
      </div>

      {/* Salary Structure Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                {editingStructure ? 'Edit Salary Structure' : 'Create New Salary Structure'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Employee Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formData.employeeName}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-not-allowed"
                    placeholder="Select an employee first"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Employee <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.employeeId}
                    onChange={(e) => {
                      const selectedUser = allUsers?.find(user => user.clerkId === e.target.value);
                      setFormData(prev => ({ 
                        ...prev, 
                        employeeId: e.target.value,
                        employeeName: selectedUser?.name || '',
                        employeeRole: selectedUser?.role || 'user'
                      }));
                    }}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select Employee</option>
                    {allUsers?.map((user) => (
                      <option key={user._id} value={user.clerkId}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formData.employeeRole === 'user' ? 'Staff' : formData.employeeRole === 'trainer' ? 'Trainer' : formData.employeeRole === 'admin' ? 'Admin' : ''}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-not-allowed capitalize"
                    placeholder="Select an employee first"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Base Salary (LKR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter base salary"
                  />
                </div>
              </div>

              {/* Allowances */}
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4">Allowances</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['transport', 'meal', 'housing', 'performance', 'overtime'].map((allowance) => (
                    <div key={allowance}>
                      <label className="block text-sm font-medium text-foreground mb-2 capitalize">
                        {allowance} Allowance (LKR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={formData.allowances[allowance as keyof typeof formData.allowances] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          allowances: {
                            ...prev.allowances,
                            [allowance]: parseFloat(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4">Deductions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['tax', 'epf', 'etf', 'insurance', 'advance'].map((deduction) => (
                    <div key={deduction}>
                      <label className="block text-sm font-medium text-foreground mb-2 capitalize">
                        {deduction === 'epf' ? 'EPF' : deduction === 'etf' ? 'ETF' : deduction} ({deduction === 'tax' || deduction === 'epf' || deduction === 'etf' ? '%' : 'LKR'})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={deduction === 'tax' || deduction === 'epf' || deduction === 'etf' ? "0.1" : "100"}
                        max={deduction === 'tax' || deduction === 'epf' || deduction === 'etf' ? "100" : undefined}
                        value={formData.deductions[deduction as keyof typeof formData.deductions] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          deductions: {
                            ...prev.deductions,
                            [deduction]: parseFloat(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Payment Frequency
                  </label>
                  <select
                    value={formData.paymentFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentFrequency: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending Approval</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingStructure ? 'Update Structure' : 'Create Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Salary Structure Modal */}
      {showViewModal && viewingStructure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Salary Structure Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Employee Information */}
              <div className="bg-accent/20 rounded-lg p-6">
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee Name</label>
                    <p className="text-foreground font-medium">{viewingStructure.employeeName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                    <p className="text-foreground">{viewingStructure.employeeId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      viewingStructure.employeeRole === 'admin' ? 'bg-red-500/20 text-red-400' :
                      viewingStructure.employeeRole === 'trainer' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {viewingStructure.employeeRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-500/10 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Salary & Allowances
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Salary</span>
                      <span className="text-foreground font-medium">{formatCurrency(viewingStructure.baseSalary)}</span>
                    </div>
                    {viewingStructure.allowances?.map((allowance: any) => (
                      <div key={allowance.type} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{allowance.type} Allowance</span>
                        <span className="text-green-400 font-medium">+{formatCurrency(allowance.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total Compensation</span>
                        <span className="text-green-400">{formatCurrency(calculateTotalSalary(viewingStructure))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-500/10 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-red-400" />
                    Deductions
                  </h4>
                  <div className="space-y-3">
                    {viewingStructure.deductions?.length > 0 ? (
                      viewingStructure.deductions.map((deduction: any) => (
                        <div key={deduction.type} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {deduction.type === 'epf' ? 'EPF' : deduction.type === 'etf' ? 'ETF' : deduction.type}
                          </span>
                          <span className="text-red-400 font-medium">
                            {deduction.isPercentage ? `${deduction.amount}%` : formatCurrency(deduction.amount)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No deductions configured</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-accent/20 rounded-lg p-6">
                <h4 className="text-lg font-medium text-foreground mb-4">Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Frequency</label>
                    <p className="text-foreground capitalize">{viewingStructure.paymentFrequency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Effective Date</label>
                    <p className="text-foreground">{formatDate(viewingStructure.effectiveDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      viewingStructure.status === "active" ? "bg-green-500/20 text-green-400" :
                      viewingStructure.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {viewingStructure.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent/50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingStructure);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Structure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Structures Table */}
      <div className="bg-card/50 border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Salary Structures</h2>
            <div className="flex gap-2">
              <button 
                onClick={handleDownload}
                disabled={!filteredStructures?.length}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download CSV"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Base Salary</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Compensation</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Frequency</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!mounted ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading salary structures...</p>
                  </td>
                </tr>
              ) : filteredStructures.length > 0 ? (
                filteredStructures.map((structure: any) => (
                  <tr key={structure._id} className="border-b border-border hover:bg-accent/20 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{structure.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{structure.employeeId}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        structure.employeeRole === 'admin' ? 'bg-red-500/20 text-red-400' :
                        structure.employeeRole === 'trainer' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {structure.employeeRole}
                      </span>
                    </td>
                    <td className="p-4 text-foreground font-medium">{formatCurrency(structure.baseSalary)}</td>
                    <td className="p-4 text-foreground font-medium">{formatCurrency(calculateTotalSalary(structure))}</td>
                    <td className="p-4 text-foreground capitalize">{structure.paymentFrequency}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        structure.status === "active" ? "bg-green-500/20 text-green-400" :
                        structure.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {structure.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(structure)}
                          className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Structure"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleView(structure)}
                          className="p-2 text-muted-foreground hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No salary structures found</p>
                    <p className="text-muted-foreground text-sm mb-6">
                      {searchTerm || filterRole !== "all" || filterStatus !== "all" 
                        ? "Try adjusting your filters or search term"
                        : "Create your first salary structure to get started"
                      }
                    </p>
                    {!searchTerm && filterRole === "all" && filterStatus === "all" && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2 inline" />
                        Create First Structure
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}