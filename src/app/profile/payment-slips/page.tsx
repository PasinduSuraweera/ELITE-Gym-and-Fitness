"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Download } from "lucide-react";

const PaymentSlipsPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }
  }, [isLoaded, user, router]);
  
  // Get user's own payroll records
  const userPayrollRecords = useQuery(
    api.salary.getEmployeePayrollRecords,
    user?.id ? { employeeClerkId: user.id } : "skip"
  );

  const userRole = useQuery(api.users.getCurrentUserRole);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during auth check or hydration
  if (!mounted || !isLoaded) {
    return (
      <UserLayout 
        title="Payment Slips" 
        subtitle="Download your salary and payment records"
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-card rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Generate and download payment slip
  const handleDownloadPaySlip = (record: any) => {
    const html = generatePaySlipHTML(record);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PaySlip_${record.employeeName}_${record.payrollPeriod.periodLabel}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate HTML for payment slip
  const generatePaySlipHTML = (record: any) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Slip - ${record.employeeName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .payslip {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #dc2626;
            margin: 0;
        }
        .document-title {
            font-size: 20px;
            color: #374151;
            margin: 10px 0 0 0;
        }
        .employee-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .info-section h3 {
            color: #dc2626;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin: 0 0 15px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #6b7280;
        }
        .earnings-deductions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
        }
        .section {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px;
        }
        .section h3 {
            margin: 0 0 15px 0;
            color: #dc2626;
            font-size: 16px;
        }
        .amount-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px dotted #e5e7eb;
        }
        .amount-row:last-child {
            border-bottom: none;
            font-weight: bold;
            color: #dc2626;
        }
        .net-salary {
            background: #dc2626;
            color: white;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
            margin: 30px 0;
        }
        .net-salary h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .net-salary .amount {
            font-size: 32px;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        @media print {
            body { background: white; }
            .payslip { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="payslip">
        <div class="header">
            <h1 class="company-name">ELITE Gym & Fitness</h1>
            <h2 class="document-title">Salary Payment Slip</h2>
        </div>
        
        <div class="employee-info">
            <div class="info-section">
                <h3>Employee Information</h3>
                <div class="info-row">
                    <span class="info-label">Employee Name:</span>
                    <span class="info-value">${record.employeeName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Employee ID:</span>
                    <span class="info-value">${record.employeeClerkId.substring(0, 8)}...</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Designation:</span>
                    <span class="info-value">${record.employeeRole}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Status:</span>
                    <span class="info-value" style="color: ${record.status === 'paid' ? '#059669' : '#dc2626'};">
                        ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                </div>
            </div>
            
            <div class="info-section">
                <h3>Payment Period</h3>
                <div class="info-row">
                    <span class="info-label">Period:</span>
                    <span class="info-value">${record.payrollPeriod.periodLabel}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Start Date:</span>
                    <span class="info-value">${new Date(record.payrollPeriod.startDate).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">End Date:</span>
                    <span class="info-value">${new Date(record.payrollPeriod.endDate).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Generated On:</span>
                    <span class="info-value">${new Date(record.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
        
        <div class="earnings-deductions">
            <div class="section">
                <h3>Earnings</h3>
                <div class="amount-row">
                    <span>Base Salary:</span>
                    <span>${formatCurrency(record.earnings.baseSalary)}</span>
                </div>
                ${record.earnings.performanceBonus > 0 ? `
                <div class="amount-row">
                    <span>Performance Bonus:</span>
                    <span>${formatCurrency(record.earnings.performanceBonus)}</span>
                </div>
                ` : ''}
                ${record.earnings.membershipCommissions > 0 ? `
                <div class="amount-row">
                    <span>Membership Commissions:</span>
                    <span>${formatCurrency(record.earnings.membershipCommissions)}</span>
                </div>
                ` : ''}
                ${record.earnings.sessionEarnings > 0 ? `
                <div class="amount-row">
                    <span>Session Earnings:</span>
                    <span>${formatCurrency(record.earnings.sessionEarnings)}</span>
                </div>
                ` : ''}
                ${record.earnings.overtimeEarnings > 0 ? `
                <div class="amount-row">
                    <span>Overtime Earnings:</span>
                    <span>${formatCurrency(record.earnings.overtimeEarnings)}</span>
                </div>
                ` : ''}
                ${record.earnings.allowances > 0 ? `
                <div class="amount-row">
                    <span>Allowances:</span>
                    <span>${formatCurrency(record.earnings.allowances)}</span>
                </div>
                ` : ''}
                <div class="amount-row">
                    <span>Total Earnings:</span>
                    <span>${formatCurrency(record.earnings.totalEarnings)}</span>
                </div>
            </div>
            
            <div class="section">
                <h3>Deductions</h3>
                ${record.deductions.incomeTax > 0 ? `
                <div class="amount-row">
                    <span>Income Tax (PAYE):</span>
                    <span>${formatCurrency(record.deductions.incomeTax)}</span>
                </div>
                ` : ''}
                ${record.deductions.epfEmployee > 0 ? `
                <div class="amount-row">
                    <span>EPF Employee (8%):</span>
                    <span>${formatCurrency(record.deductions.epfEmployee)}</span>
                </div>
                ` : ''}
                ${record.deductions.insurance > 0 ? `
                <div class="amount-row">
                    <span>Insurance:</span>
                    <span>${formatCurrency(record.deductions.insurance)}</span>
                </div>
                ` : ''}
                ${record.deductions.loanDeductions > 0 ? `
                <div class="amount-row">
                    <span>Loan Deductions:</span>
                    <span>${formatCurrency(record.deductions.loanDeductions)}</span>
                </div>
                ` : ''}
                ${record.deductions.advanceDeductions > 0 ? `
                <div class="amount-row">
                    <span>Advance Deductions:</span>
                    <span>${formatCurrency(record.deductions.advanceDeductions)}</span>
                </div>
                ` : ''}
                <div class="amount-row">
                    <span>Total Deductions:</span>
                    <span>${formatCurrency(record.deductions.totalDeductions)}</span>
                </div>
            </div>
        </div>
        
        <div class="net-salary">
            <h3>Net Salary</h3>
            <div class="amount">${formatCurrency(record.netSalary)}</div>
        </div>
        
        <div class="footer">
            <p>This is a computer-generated document. No signature required.</p>
            <p>© ${new Date().getFullYear()} ELITE Gym & Fitness - All rights reserved</p>
        </div>
    </div>
</body>
</html>`;
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <UserLayout title="Payment Slips" subtitle="Download your salary payment slips">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </UserLayout>
    );
  }

  // Only show for admins and trainers
  if (userRole !== 'admin' && userRole !== 'trainer') {
    return (
      <UserLayout title="Payment Slips" subtitle="Download your salary payment slips">
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground text-center">
              Payment slips are only available for trainers and administrators.
            </p>
          </CardContent>
        </Card>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Payment Slips" subtitle="Download your salary payment slips">
      {userPayrollRecords && userPayrollRecords.length > 0 ? (
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Your Payment Slips
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Download your personal salary payment slips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userPayrollRecords.map((record: any) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border hover:bg-accent/20 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-foreground font-medium">
                          Salary for {record.payrollPeriod.periodLabel}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Status: 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            record.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            record.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {record.status === 'pending_approval' ? 'Pending' : record.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Gross Pay</p>
                        <p className="text-foreground font-medium">
                          {formatCurrency(record.earnings.totalEarnings)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deductions</p>
                        <p className="text-foreground font-medium">
                          {formatCurrency(record.deductions.totalDeductions)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Salary</p>
                        <p className="text-green-500 font-bold">
                          {formatCurrency(record.netSalary)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Generated</p>
                        <p className="text-foreground">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleDownloadPaySlip(record)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Payment Slips</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You don't have any payment slips yet. Payment slips will appear here 
              after your salary is processed by the admin.
            </p>
          </CardContent>
        </Card>
      )}
    </UserLayout>
  );
};

export default PaymentSlipsPage;