"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { 
  Download,
  FileText,
  Users,
  DollarSign,
  Calculator,
  CreditCard
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function SalaryReportsPage() {
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [quickReportType, setQuickReportType] = useState("payroll");

  // Convex queries
  const salaryStats = useQuery(api.salary.getSalaryStats, isSignedIn ? undefined : "skip");
  // Get all payroll records for reports
  const payrollRecords = useQuery(api.salary.getPayrollRecords, isSignedIn ? { allRecords: true } : "skip");

  // Mutations
  const createGeneratedReport = useMutation(api.salary.createGeneratedReport);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (amount: number | undefined | null) => {
    if (!mounted || !amount || isNaN(amount)) return 'Rs. 0';
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const generateReport = async (reportType: string) => {
    if (!mounted) return;
    
    try {
      console.log('Generating report...', reportType);
      console.log('Payroll records:', payrollRecords);
      console.log('Number of records:', payrollRecords?.length);
      
      const now = new Date();
      let reportData = '';
      let fileName = '';
      let title = '';
      let description = '';
      
      // Check if we have data
      if (!payrollRecords || payrollRecords.length === 0) {
        alert('No payroll records found. Please process payroll first from the Payroll page.');
        return;
      }
      
      switch (reportType) {
        case 'payroll':
          reportData = generatePayrollCSV();
          fileName = `Payroll_Report_${now.getFullYear()}_${now.getMonth() + 1}.csv`;
          title = 'Monthly Payroll Report';
          description = `Complete payroll breakdown for ${now.toLocaleDateString()}`;
          break;
          
        case 'tax':
          reportData = generateTaxCSV();
          fileName = `Tax_Summary_${now.getFullYear()}_${now.getMonth() + 1}.csv`;
          title = 'Tax Summary Report';
          description = `PAYE, EPF, ETF summary for ${now.toLocaleDateString()}`;
          break;
      }

      console.log('Generated CSV data:', reportData);

      // Download the CSV
      downloadCSV(reportData, fileName);

      // Save report record to database
      await createGeneratedReport({
        title,
        description,
        type: reportType as "payroll" | "tax",
        dateRange: "Current Month",
        fileName,
        fileSize: `${Math.round(reportData.length / 1024)} KB`,
        parameters: {
          year: now.getFullYear(),
          month: now.toLocaleString('default', { month: 'long' }),
        }
      });

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please check console for details.');
    }
  };

  const generatePayrollCSV = (): string => {
    console.log('Generating payroll CSV with records:', payrollRecords);
    
    const csvRows = [
      ['Employee Name', 'Employee ID', 'Role', 'Base Salary', 'Allowances', 'Total Earnings', 'Income Tax', 'EPF Employee', 'EPF Employer', 'ETF', 'Total Deductions', 'Net Salary']
    ];

    (payrollRecords || []).forEach(record => {
      console.log('Processing record:', record);
      csvRows.push([
        record.employeeName || 'N/A',
        record.employeeClerkId || 'N/A',
        record.employeeRole || 'N/A',
        (record.earnings?.baseSalary || 0).toString(),
        (record.earnings?.allowances || 0).toString(),
        (record.earnings?.totalEarnings || 0).toString(),
        (record.deductions?.incomeTax || 0).toString(),
        (record.deductions?.epfEmployee || 0).toString(),
        (record.deductions?.epfEmployer || 0).toString(),
        (record.deductions?.etfEmployer || 0).toString(),
        (record.deductions?.totalDeductions || 0).toString(),
        (record.netSalary || 0).toString()
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    console.log('Final CSV content:', csvContent);
    return csvContent;
  };

  const generateTaxCSV = (): string => {
    console.log('Generating tax CSV with records:', payrollRecords);
    
    const csvRows = [
      ['Employee Name', 'Employee ID', 'Gross Salary', 'PAYE Tax', 'EPF Employee (8%)', 'EPF Employer (12%)', 'ETF (3%)', 'Total Tax Burden']
    ];

    (payrollRecords || []).forEach(record => {
      const incomeTax = record.deductions?.incomeTax || 0;
      const epfEmployee = record.deductions?.epfEmployee || 0;
      const epfEmployer = record.deductions?.epfEmployer || 0;
      const etfEmployer = record.deductions?.etfEmployer || 0;
      const totalTaxBurden = incomeTax + epfEmployee + epfEmployer + etfEmployer;
      
      csvRows.push([
        record.employeeName || 'N/A',
        record.employeeClerkId || 'N/A',
        (record.earnings?.totalEarnings || 0).toString(),
        incomeTax.toString(),
        epfEmployee.toString(),
        epfEmployer.toString(),
        etfEmployer.toString(),
        totalTaxBurden.toString()
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    console.log('Final Tax CSV content:', csvContent);
    return csvContent;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AdminLayout 
      title="Salary Reports" 
      subtitle="Generate and download salary reports and analytics"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Monthly Payroll</p>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(salaryStats?.totalMonthlyPayroll)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Employees</p>
              <p className="text-2xl font-bold text-green-400">{salaryStats?.totalEmployeesOnPayroll || 0}</p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Average Salary</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatCurrency(salaryStats?.totalEmployeesOnPayroll && salaryStats.totalEmployeesOnPayroll > 0 
                  ? salaryStats.totalMonthlyPayroll / salaryStats.totalEmployeesOnPayroll 
                  : 0)}
              </p>
            </div>
            <Calculator className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Processed Records</p>
              <p className="text-2xl font-bold text-orange-400">{payrollRecords?.length || 0}</p>
            </div>
            <CreditCard className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Report Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Generate Report</h3>
          
          {/* Debug Info */}
          {mounted && (
            <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-400">
                Data Status: {payrollRecords ? `${payrollRecords.length} payroll records found` : 'Loading...'}
              </p>
              <p className="text-xs text-blue-300">
                Current Date: {new Date().toLocaleDateString()} | 
                Month: {new Date().toLocaleString("default", { month: "short" })} | 
                Year: {new Date().getFullYear()}
              </p>
              {payrollRecords && payrollRecords.length === 0 && (
                <p className="text-sm text-yellow-400 mt-1">
                  ⚠️ No payroll records found. Please process payroll first from the Payroll page.
                </p>
              )}
              {payrollRecords && payrollRecords.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-green-400">
                    Found records for: {[...new Set(payrollRecords.map(r => `${r.payrollPeriod.month} ${r.payrollPeriod.year}`))].join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Report Type</label>
              <select 
                value={quickReportType}
                onChange={(e) => setQuickReportType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="payroll">Monthly Payroll</option>
                <option value="tax">Tax Summary</option>
              </select>
            </div>

            <button
              onClick={() => generateReport(quickReportType)}
              disabled={!payrollRecords || payrollRecords.length === 0}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Generate & Download Report
            </button>
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Available Reports</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div>
                <p className="text-blue-400 font-medium">Payroll Report</p>
                <p className="text-muted-foreground text-xs">Complete salary breakdown with deductions</p>
              </div>
              <FileText className="h-5 w-5 text-blue-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div>
                <p className="text-green-400 font-medium">Tax Summary</p>
                <p className="text-muted-foreground text-xs">PAYE, EPF, ETF compliance report</p>
              </div>
              <FileText className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}