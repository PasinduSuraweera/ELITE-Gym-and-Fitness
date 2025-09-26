"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { 
  PlayCircle, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Download,
  FileText,
  Clock,
  Filter,
  Search,
  Eye,
  Calculator,
  CreditCard,
  Wallet,
  Settings,
  RefreshCw,
  ArrowRight,
  X
} from "lucide-react";

export default function PayrollProcessingPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "completed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [showPaySlipModal, setShowPaySlipModal] = useState(false);
  const [selectedPaySlip, setSelectedPaySlip] = useState<any>(null);

  // Utility functions
  const getMonthName = (monthNumber: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[monthNumber - 1] || "Unknown";
  };

  const formatCurrency = (amount: number) => {
    if (!mounted) return 'Rs. 0';
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Convex queries and mutations
  const salaryStructures = useQuery(api.salary.getAllSalaryStructures);
  const salaryStats = useQuery(api.salary.getSalaryStats);
  const payrollRecords = useQuery(api.salary.getPayrollRecords, {
    year: selectedYear,
    month: getMonthName(parseInt(selectedMonth.split('-')[1]))
  });
  const payrollStats = useQuery(api.salary.getPayrollStats, {
    year: selectedYear,
    month: getMonthName(parseInt(selectedMonth.split('-')[1]))
  });
  
  // Create mutations
  const processPayroll = useMutation(api.salary.processPayroll);
  const approvePayrollRecords = useMutation(api.salary.approvePayrollRecords);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate payroll statistics from real data
  const payrollStatsCalculated = {
    totalEmployees: payrollStats?.totalEmployees || 0,
    totalGrossPay: payrollStats?.totalGrossPay || 0,
    totalNetPay: payrollStats?.totalNetPay || 0,
    totalTaxDeductions: payrollStats?.totalTaxDeductions || 0,
    totalEPF: payrollStats?.totalEPF || 0,
    totalETF: payrollStats?.totalETF || 0,
    processed: payrollStats?.processed || 0,
    pending: payrollStats?.pending || 0,
    approved: payrollStats?.approved || 0,
    draft: payrollStats?.draft || 0,
  };

  // Filter payroll records
  const filteredPayrollData = (payrollRecords || []).filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeClerkId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || record.employeeRole === filterRole;
    const matchesStatus = filterStatus === "all" || record.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Check if payroll has already been processed for the selected period
  const hasExistingPayroll = payrollRecords && payrollRecords.length > 0;
  const isPayrollDisabled = processingStatus === "processing" || hasExistingPayroll;

  const handleProcessPayroll = async () => {
    try {
      setProcessingStatus("processing");
      setErrorMessage("");
      
      const monthName = getMonthName(parseInt(selectedMonth.split('-')[1]));
      
      const result = await processPayroll({
        year: selectedYear,
        month: monthName,
      });
      
      console.log("Payroll processed:", result);
      setProcessingStatus("completed");
      
      // Reset to idle after showing completion
      setTimeout(() => setProcessingStatus("idle"), 3000);
    } catch (error: any) {
      console.error("Error processing payroll:", error);
      setProcessingStatus("error");
      
      // Extract meaningful error message
      const errorMsg = error?.message || error?.data?.message || "Failed to process payroll";
      setErrorMessage(errorMsg);
      
      // Reset to idle after showing error
      setTimeout(() => {
        setProcessingStatus("idle");
        setErrorMessage("");
      }, 5000);
    }
  };

  const handleApproveAll = async () => {
    try {
      const recordsToApprove = payrollRecords?.filter(record => 
        record.status === "pending_approval"
      ).map(record => record._id) || [];
      
      if (recordsToApprove.length === 0) {
        console.log("No records to approve");
        return;
      }

      const result = await approvePayrollRecords({
        recordIds: recordsToApprove,
      });
      
      console.log("Records approved:", result);
    } catch (error) {
      console.error("Error approving payroll records:", error);
    }
  };

  // Export payroll report as CSV
  const handleExportPayrollReport = () => {
    if (!filteredPayrollData?.length) return;

    const headers = [
      'Employee Name',
      'Employee ID',
      'Role',
      'Base Salary (LKR)',
      'Allowances (LKR)',
      'Performance Bonus (LKR)',
      'Gross Pay (LKR)',
      'Tax Deduction (LKR)',
      'EPF Deduction (LKR)',
      'ETF Deduction (LKR)',
      'Other Deductions (LKR)',
      'Total Deductions (LKR)',
      'Net Salary (LKR)',
      'Status',
      'Payment Period'
    ];

    const csvData = filteredPayrollData.map((record: any) => [
      record.employeeName,
      record.employeeClerkId,
      record.employeeRole,
      record.earnings.baseSalary,
      record.earnings.allowances,
      record.earnings.performanceBonus || 0,
      record.earnings.totalEarnings,
      record.deductions.tax,
      record.deductions.epf,
      record.deductions.etf,
      record.deductions.other || 0,
      record.deductions.totalDeductions,
      record.netSalary,
      record.status,
      `${getMonthName(parseInt(selectedMonth.split('-')[1]))} ${selectedYear}`
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-report-${getMonthName(parseInt(selectedMonth.split('-')[1]))}-${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Generate and download individual pay slip
  const handleDownloadPaySlip = (record: any) => {
    const paySlipContent = generatePaySlipHTML(record);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(paySlipContent);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // Generate pay slip HTML content
  const generatePaySlipHTML = (record: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pay Slip - ${record.employeeName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .pay-slip-title { font-size: 18px; color: #666; }
          .employee-info { margin: 30px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .section { margin: 30px 0; }
          .section-title { font-size: 16px; font-weight: bold; background: #f5f5f5; padding: 10px; margin-bottom: 15px; }
          .earnings-table, .deductions-table { width: 100%; border-collapse: collapse; }
          .earnings-table td, .deductions-table td { padding: 8px; border-bottom: 1px solid #ddd; }
          .total-row { font-weight: bold; background: #f9f9f9; }
          .net-salary { text-align: center; font-size: 18px; font-weight: bold; background: #e8f5e8; padding: 15px; margin: 20px 0; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">ELITE Gym and Fitness</div>
          <div class="pay-slip-title">Employee Pay Slip</div>
        </div>

        <div class="employee-info">
          <div class="info-row">
            <span><strong>Employee Name:</strong> ${record.employeeName}</span>
            <span><strong>Employee ID:</strong> ${record.employeeClerkId}</span>
          </div>
          <div class="info-row">
            <span><strong>Role:</strong> ${record.employeeRole}</span>
            <span><strong>Pay Period:</strong> ${getMonthName(parseInt(selectedMonth.split('-')[1]))} ${selectedYear}</span>
          </div>
          <div class="info-row">
            <span><strong>Status:</strong> ${record.status}</span>
            <span><strong>Generated:</strong> ${new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">EARNINGS</div>
          <table class="earnings-table">
            <tr>
              <td>Base Salary</td>
              <td style="text-align: right;">${formatCurrency(record.earnings?.baseSalary || 0)}</td>
            </tr>
            <tr>
              <td>Allowances</td>
              <td style="text-align: right;">${formatCurrency(record.earnings?.allowances || 0)}</td>
            </tr>
            ${record.earnings?.performanceBonus && record.earnings.performanceBonus > 0 ? `
            <tr>
              <td>Performance Bonus</td>
              <td style="text-align: right;">${formatCurrency(record.earnings.performanceBonus)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td><strong>GROSS PAY</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(record.earnings?.totalEarnings || 0)}</strong></td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">DEDUCTIONS</div>
          <table class="deductions-table">
            <tr>
              <td>PAYE Tax</td>
              <td style="text-align: right;">${formatCurrency(record.deductions?.tax || 0)}</td>
            </tr>
            <tr>
              <td>EPF (8%)</td>
              <td style="text-align: right;">${formatCurrency(record.deductions?.epf || 0)}</td>
            </tr>
            <tr>
              <td>ETF (3%)</td>
              <td style="text-align: right;">${formatCurrency(record.deductions?.etf || 0)}</td>
            </tr>
            ${record.deductions?.other && record.deductions.other > 0 ? `
            <tr>
              <td>Other Deductions</td>
              <td style="text-align: right;">${formatCurrency(record.deductions.other)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td><strong>TOTAL DEDUCTIONS</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(record.deductions?.totalDeductions || 0)}</strong></td>
            </tr>
          </table>
        </div>

        <div class="net-salary">
          <strong>NET SALARY: ${formatCurrency(record.netSalary || 0)}</strong>
        </div>

        <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
          <p>This is a computer-generated pay slip. No signature is required.</p>
          <p>ELITE Gym and Fitness • Sri Lanka</p>
        </div>
      </body>
      </html>
    `;
  };

  // View pay slip in modal
  const handleViewPaySlip = (record: any) => {
    setSelectedPaySlip(record);
    setShowPaySlipModal(true);
  };

  // Generate all pay slips
  const handleGenerateAllPaySlips = () => {
    if (!filteredPayrollData?.length) return;

    filteredPayrollData.forEach((record: any, index: number) => {
      setTimeout(() => {
        handleDownloadPaySlip(record);
      }, index * 1000); // Stagger the generation by 1 second each
    });
  };

  return (
    <AdminLayout 
      title="Payroll Processing" 
      subtitle="Generate and process monthly payroll for all employees"
    >
      {/* Period Selection */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/50 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Payroll Period Selection</h2>
            <p className="text-muted-foreground">Select the month and year for payroll processing</p>
          </div>
          
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Month & Year</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  const [year, month] = e.target.value.split('-');
                  setSelectedYear(parseInt(year));
                }}
                className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleProcessPayroll}
                disabled={isPayrollDisabled}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isPayrollDisabled && hasExistingPayroll
                    ? "bg-gray-500/50 text-gray-400 cursor-not-allowed" 
                    : processingStatus === "processing" 
                    ? "bg-gray-500/50 text-gray-400 cursor-not-allowed" 
                    : processingStatus === "completed"
                    ? "bg-green-500 text-white"
                    : processingStatus === "error"
                    ? "bg-red-500 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
                title={hasExistingPayroll ? "Payroll already processed for this period" : ""}
              >
                {hasExistingPayroll ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Already Processed
                  </>
                ) : processingStatus === "processing" ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : processingStatus === "completed" ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </>
                ) : processingStatus === "error" ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Error
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Process Payroll
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Message for Already Processed Payroll */}
      {hasExistingPayroll && processingStatus !== "error" && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-blue-400 font-medium">Payroll Already Processed</p>
              <p className="text-blue-300 text-sm mt-1">
                Payroll has already been processed for {getMonthName(parseInt(selectedMonth.split('-')[1]))} {selectedYear}. 
                You can view, approve, or manage existing records below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {processingStatus === "error" && errorMessage && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Payroll Processing Error</p>
              <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
              {errorMessage.includes("already processed") && (
                <p className="text-red-300 text-xs mt-2">
                  Tip: Check existing payroll records below or select a different period.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payroll Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Employees</p>
              <p className="text-2xl font-bold text-green-400">{payrollStatsCalculated.totalEmployees}</p>
              <p className="text-green-300 text-xs mt-1">Active payroll</p>
            </div>
            <Users className="h-6 w-6 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Gross Payroll</p>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(payrollStatsCalculated.totalGrossPay)}</p>
              <p className="text-blue-300 text-xs mt-1">Before deductions</p>
            </div>
            <Calculator className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Net Payroll</p>
              <p className="text-2xl font-bold text-purple-400">{formatCurrency(payrollStatsCalculated.totalNetPay)}</p>
              <p className="text-purple-300 text-xs mt-1">After deductions</p>
            </div>
            <Wallet className="h-6 w-6 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Deductions</p>
              <p className="text-2xl font-bold text-orange-400">
                {formatCurrency(payrollStatsCalculated.totalTaxDeductions + payrollStatsCalculated.totalEPF + payrollStatsCalculated.totalETF)}
              </p>
              <p className="text-orange-300 text-xs mt-1">Tax + EPF + ETF</p>
            </div>
            <CreditCard className="h-6 w-6 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sri Lankan Statutory Deductions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">PAYE Tax</span>
              <span className="text-foreground font-medium">{formatCurrency(payrollStatsCalculated.totalTaxDeductions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">EPF (8%)</span>
              <span className="text-foreground font-medium">{formatCurrency(payrollStatsCalculated.totalEPF)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ETF (3%)</span>
              <span className="text-foreground font-medium">{formatCurrency(payrollStatsCalculated.totalETF)}</span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-foreground">Total Statutory</span>
                <span className="text-foreground">
                  {formatCurrency(payrollStatsCalculated.totalTaxDeductions + payrollStatsCalculated.totalEPF + payrollStatsCalculated.totalETF)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Processing Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-muted-foreground">Draft</span>
              </div>
              <span className="text-foreground font-medium">{payrollStatsCalculated.draft}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-muted-foreground">Pending Approval</span>
              </div>
              <span className="text-foreground font-medium">{payrollStatsCalculated.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-muted-foreground">Approved</span>
              </div>
              <span className="text-foreground font-medium">{payrollStatsCalculated.approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-muted-foreground">Paid</span>
              </div>
              <span className="text-foreground font-medium">{payrollStatsCalculated.processed}</span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="text-foreground font-medium">
                  {payrollStatsCalculated.totalEmployees > 0 ? Math.round(((payrollStatsCalculated.processed + payrollStatsCalculated.approved) / payrollStatsCalculated.totalEmployees) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleApproveAll}
              disabled={payrollStatsCalculated.pending === 0}
              className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              Approve All Processed ({payrollStatsCalculated.pending})
            </button>
            <button 
              onClick={handleExportPayrollReport}
              disabled={!filteredPayrollData?.length}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export Payroll Report
            </button>
            <button 
              onClick={handleGenerateAllPaySlips}
              disabled={!filteredPayrollData?.length}
              className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4" />
              Generate All Pay Slips ({filteredPayrollData?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
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
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="bg-card/50 border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">
              Payroll Records - {getMonthName(parseInt(selectedMonth.split('-')[1]))} {selectedYear}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Base Salary</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Gross Pay</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Deductions</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Net Pay</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!mounted ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading payroll data...</p>
                  </td>
                </tr>
              ) : filteredPayrollData.length > 0 ? (
                filteredPayrollData.map((record, index) => (
                  <tr key={record._id} className="border-b border-border hover:bg-accent/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                          record.employeeRole === 'admin' ? 'bg-red-500' :
                          record.employeeRole === 'trainer' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}>
                          {record.employeeName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{record.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{record.employeeClerkId} • {record.employeeRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground font-medium">{formatCurrency(record.earnings.baseSalary)}</td>
                    <td className="p-4 text-foreground font-medium">{formatCurrency(record.earnings.totalEarnings)}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-foreground font-medium">
                          {formatCurrency(record.deductions.totalDeductions)}
                        </p>
                        <p className="text-muted-foreground text-xs">Tax + EPF + ETF</p>
                      </div>
                    </td>
                    <td className="p-4 text-foreground font-bold">{formatCurrency(record.netSalary)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === "approved" ? "bg-green-500/20 text-green-400" :
                        record.status === "paid" ? "bg-blue-500/20 text-blue-400" :
                        record.status === "pending_approval" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {record.status === "pending_approval" ? "Pending" : 
                         record.status === "paid" ? "Paid" : 
                         record.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPaySlip(record)}
                          className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View Pay Slip"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPaySlip(record)}
                          className="p-2 text-muted-foreground hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Download Pay Slip"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No payroll records found</p>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm || filterRole !== "all" || filterStatus !== "all" 
                        ? "Try adjusting your filters or search term"
                        : "Process payroll to generate records for this period"
                      }
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Slip View Modal */}
      {showPaySlipModal && selectedPaySlip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Pay Slip - {selectedPaySlip.employeeName}
              </h3>
              <button
                onClick={() => setShowPaySlipModal(false)}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pay Slip Content */}
            <div className="bg-white text-black p-8 rounded-lg border">
              {/* Header */}
              <div className="text-center border-b border-gray-300 pb-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">ELITE Gym and Fitness</h1>
                <p className="text-gray-600 mt-2">Employee Pay Slip</p>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Employee Name:</span>
                    <span className="text-gray-900">{selectedPaySlip.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Employee ID:</span>
                    <span className="text-gray-900">{selectedPaySlip.employeeClerkId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className="text-gray-900 capitalize">{selectedPaySlip.employeeRole}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Pay Period:</span>
                    <span className="text-gray-900">{getMonthName(parseInt(selectedMonth.split('-')[1]))} {selectedYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="text-gray-900 capitalize">{selectedPaySlip.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Generated:</span>
                    <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 bg-gray-100 p-3 mb-4">EARNINGS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Base Salary</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(selectedPaySlip.earnings?.baseSalary || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Allowances</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(selectedPaySlip.earnings?.allowances || 0)}</span>
                  </div>
                  {selectedPaySlip.earnings?.performanceBonus && selectedPaySlip.earnings.performanceBonus > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-700">Performance Bonus</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(selectedPaySlip.earnings.performanceBonus)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 bg-gray-50 px-3 font-semibold">
                    <span className="text-gray-800">GROSS PAY</span>
                    <span className="text-gray-900">{formatCurrency(selectedPaySlip.earnings?.totalEarnings || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 bg-gray-100 p-3 mb-4">DEDUCTIONS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">PAYE Tax</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(selectedPaySlip.deductions?.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">EPF (8%)</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(selectedPaySlip.deductions?.epf || 0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">ETF (3%)</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(selectedPaySlip.deductions?.etf || 0)}</span>
                  </div>
                  {selectedPaySlip.deductions?.other && selectedPaySlip.deductions.other > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-700">Other Deductions</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(selectedPaySlip.deductions.other)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 bg-gray-50 px-3 font-semibold">
                    <span className="text-gray-800">TOTAL DEDUCTIONS</span>
                    <span className="text-gray-900">{formatCurrency(selectedPaySlip.deductions?.totalDeductions || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center mb-6">
                <h3 className="text-xl font-bold text-green-800">NET SALARY: {formatCurrency(selectedPaySlip.netSalary || 0)}</h3>
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm border-t border-gray-300 pt-4">
                <p>This is a computer-generated pay slip. No signature is required.</p>
                <p className="mt-1">ELITE Gym and Fitness • Sri Lanka</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-border mt-6">
              <button
                onClick={() => setShowPaySlipModal(false)}
                className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent/50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadPaySlip(selectedPaySlip)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}