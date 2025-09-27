"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Calculator,
  CreditCard,
  FileText,
  Settings,
  Plus,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Calendar,
  Award,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function SalaryManagementDashboard() {
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Get salary statistics
  const salaryStats = useQuery(api.salary.getSalaryStats, isSignedIn ? undefined : "skip");
  const allSalaryStructures = useQuery(api.salary.getAllSalaryStructures, isSignedIn ? undefined : "skip");
  
  // Get recent payroll data for current month
  const currentMonth = new Date().toLocaleString("default", { month: "short" });
  const currentYear = new Date().getFullYear();
  const recentPayroll = useQuery(api.salary.getPayrollRecords, isSignedIn ? {
    year: currentYear,
    month: currentMonth
  } : "skip");
  
  // Get user data for recent activity
  const allUsers = useQuery(api.users.getAllUsers, isSignedIn ? undefined : "skip");

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

  const formatDate = (date: number | Date | null | undefined) => {
    if (!mounted || !date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Calculate growth percentages using real data
  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Calculate previous month data for growth comparison
  const getPreviousMonthData = () => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return {
      month: prevMonth.toLocaleString("default", { month: "short" }),
      year: prevMonth.getFullYear()
    };
  };

  const previousMonth = getPreviousMonthData();
  
  // Get previous month payroll for comparison
  const previousMonthPayroll = useQuery(api.salary.getPayrollRecords, isSignedIn ? {
    year: previousMonth.year,
    month: previousMonth.month
  } : "skip");

  // Calculate actual growth based on real data
  const currentMonthTotal = recentPayroll?.reduce((sum, record) => sum + record.netSalary, 0) || 0;
  const previousMonthTotal = previousMonthPayroll?.reduce((sum, record) => sum + record.netSalary, 0) || 0;
  const payrollGrowth = calculateGrowth(currentMonthTotal, previousMonthTotal);
  const payrollGrowthNum = typeof payrollGrowth === 'string' ? parseFloat(payrollGrowth) : payrollGrowth;

  return (
    <AdminLayout 
      title="Salary Management" 
      subtitle="Comprehensive payroll and compensation management system"
    >
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Employees on Payroll */}
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Employees on Payroll</p>
              <p className="text-3xl font-bold text-foreground">{salaryStats?.totalEmployeesOnPayroll || 0}</p>
              <p className="text-blue-400 text-xs mt-1">Active salary structures</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        {/* Monthly Payroll */}
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Monthly Payroll</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(salaryStats?.totalMonthlyPayroll || 0)}</p>
              <div className="flex items-center gap-1 mt-1">
                {payrollGrowthNum >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <p className={`text-xs ${payrollGrowthNum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {payrollGrowth}% vs last month
                </p>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>

        {/* Processed This Month */}
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Processed This Month</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(currentMonthTotal)}</p>
              <p className="text-purple-400 text-xs mt-1">
                {currentMonth} {currentYear} ({recentPayroll?.length || 0} records)
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Pending Actions</p>
              <p className="text-3xl font-bold text-foreground">
                {salaryStats?.totalPendingApprovals || 0}
              </p>
              <p className="text-yellow-400 text-xs mt-1">
                Payroll pending approval
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Quick Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Salary Breakdown by Role */}
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-foreground">Salary by Role</h3>
          </div>
          <div className="space-y-3">
            {salaryStats?.averageSalaryByRole?.map((roleData: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    roleData.role === 'admin' ? 'bg-red-400' :
                    roleData.role === 'trainer' ? 'bg-blue-400' : 'bg-green-400'
                  }`} />
                  <span className="text-muted-foreground text-sm capitalize">{roleData.role}s ({roleData.count})</span>
                </div>
                <span className="text-foreground font-medium text-sm">{formatCurrency(roleData.averageSalary)}</span>
              </div>
            )) || (
              <p className="text-muted-foreground text-sm">No salary data available</p>
            )}
          </div>
        </div>



        {/* Payroll Processing Status */}
        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-800/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-semibold text-foreground">Processing Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Completion Rate</span>
              <span className="text-green-400 font-medium">
                {salaryStats?.totalEmployeesOnPayroll ? 
                  Math.round(((salaryStats.totalEmployeesOnPayroll - (salaryStats.totalPendingApprovals || 0)) / salaryStats.totalEmployeesOnPayroll) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Auto Processing</span>
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                Enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link 
          href="/admin/salary/structures"
          className="group bg-card/50 border border-border rounded-lg p-6 hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <Calculator className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-500">Salary Structures</h3>
          </div>
          <p className="text-muted-foreground mb-4">Create and manage employee salary structures and compensation plans</p>
          <div className="text-blue-500 text-sm font-medium">
            {salaryStats?.totalEmployeesOnPayroll || 0} active structures →
          </div>
        </Link>

        <Link 
          href="/admin/salary/payroll"
          className="group bg-card/50 border border-border rounded-lg p-6 hover:border-green-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <Wallet className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-green-500">Payroll Processing</h3>
          </div>
          <p className="text-muted-foreground mb-4">Generate, review, and process monthly payroll for all employees</p>
          <div className="text-green-500 text-sm font-medium">
            {formatCurrency(currentMonthTotal)} processed →
          </div>
        </Link>



        <Link 
          href="/admin/salary/reports"
          className="group bg-card/50 border border-border rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-purple-500 mr-3" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-purple-500">Reports & Analytics</h3>
          </div>
          <p className="text-muted-foreground mb-4">Generate salary reports, analytics, and export payroll data</p>
          <div className="text-purple-500 text-sm font-medium">
            View detailed reports →
          </div>
        </Link>
      </div>

      {/* Recent Salary Activities */}
      <div className="bg-card/50 border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Recent Salary Activities</h2>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Live Updates</span>
          </div>
        </div>

        <div className="space-y-4">
          {!mounted ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          ) : (
            <>
              {/* Recent Payroll Processing */}
              {recentPayroll && recentPayroll.length > 0 && (
                <>
                  <div className="text-sm font-medium text-muted-foreground mb-3">Recent Payroll Processing</div>
                  {recentPayroll.slice(0, 3).map((record: any, index: number) => (
                    <div key={record._id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:bg-accent/30 rounded-lg px-3 transition-all duration-200">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-medium text-primary-foreground bg-gradient-to-r ${
                          record.status === 'paid' ? 'from-green-500 to-emerald-500' :
                          record.status === 'approved' ? 'from-blue-500 to-purple-500' :
                          record.status === 'pending_approval' ? 'from-yellow-500 to-orange-500' :
                          'from-gray-500 to-slate-500'
                        }`}>
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            Payroll processed for {record.employeeName}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {formatCurrency(record.netSalary)} • {currentMonth} {currentYear} • {record.employeeRole}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === "paid" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                          record.status === "approved" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                          record.status === "pending_approval" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}>
                          {record.status === "pending_approval" ? "Pending" : record.status}
                        </span>
                        <p className="text-muted-foreground text-xs mt-2">
                          {formatDate(record.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}



              {/* Recent Salary Structures */}
              {allSalaryStructures && allSalaryStructures.length > 0 && (
                <>
                  <div className="text-sm font-medium text-muted-foreground mb-3 mt-6">Recent Salary Structure Updates</div>
                  {allSalaryStructures.slice(0, 2).map((structure: any, index: number) => (
                    <div key={structure._id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:bg-accent/30 rounded-lg px-3 transition-all duration-200">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-medium text-primary-foreground bg-gradient-to-r ${
                          structure.employeeRole === 'admin' ? 'from-red-500 to-pink-500' :
                          structure.employeeRole === 'trainer' ? 'from-blue-500 to-purple-500' :
                          'from-green-500 to-emerald-500'
                        }`}>
                          {structure.employeeName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            Salary structure updated for {structure.employeeName}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {formatCurrency(structure.baseSalary)} • {structure.paymentFrequency} • {structure.employeeRole}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          structure.status === "active" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                          structure.status === "pending" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}>
                          {structure.status}
                        </span>
                        <p className="text-muted-foreground text-xs mt-2">
                          {formatDate(structure.updatedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {/* Show empty state only if no data at all */}
              {(!recentPayroll || recentPayroll.length === 0) && 
               (!allSalaryStructures || allSalaryStructures.length === 0) && (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No salary activities yet</p>
                  <p className="text-muted-foreground text-sm mb-6">Start by creating salary structures for your employees</p>
                  <Link href="/admin/salary/structures">
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
                      <Plus className="h-4 w-4 mr-2 inline" />
                      Create Salary Structure
                    </button>
                  </Link>
                </div>
              )}
              
              {/* Quick action buttons */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">
                    Showing recent salary activities
                  </span>
                  <div className="flex gap-4">
                    <Link 
                      href="/admin/salary/structures" 
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Manage Structures →
                    </Link>
                    <Link 
                      href="/admin/salary/payroll" 
                      className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                    >
                      Process Payroll →
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}