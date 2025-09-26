import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ===== SALARY STRUCTURES =====

// Get all salary structures with employee details
export const getAllSalaryStructures = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const structures = await ctx.db
      .query("salaryStructures")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    return structures;
  },
});

// Get salary structure by employee ID
export const getSalaryStructureByEmployee = query({
  args: { employeeClerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Allow employee to see their own salary or admin to see any
    if (!currentUser || (currentUser.role !== "admin" && currentUser.clerkId !== args.employeeClerkId)) {
      throw new Error("Unauthorized");
    }

    const structure = await ctx.db
      .query("salaryStructures")
      .withIndex("by_employee_clerk", (q) => q.eq("employeeClerkId", args.employeeClerkId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return structure;
  },
});

// Create salary structure
export const createSalaryStructure = mutation({
  args: {
    employeeClerkId: v.string(),
    baseSalary: v.number(),
    paymentFrequency: v.union(v.literal("monthly"), v.literal("bi-weekly"), v.literal("weekly")),
    performanceBonus: v.optional(v.number()),
    membershipCommissionRate: v.optional(v.number()),
    trainerSessionRate: v.optional(v.number()),
    overtimeRate: v.optional(v.number()),
    allowances: v.array(v.object({
      type: v.string(),
      amount: v.number(),
      isPercentage: v.boolean(),
    })),
    deductions: v.array(v.object({
      type: v.string(),
      amount: v.number(),
      isPercentage: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get employee details
    const employee = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.employeeClerkId))
      .first();

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Check if employee already has an active salary structure
    const existingStructure = await ctx.db
      .query("salaryStructures")
      .withIndex("by_employee_clerk", (q) => q.eq("employeeClerkId", args.employeeClerkId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existingStructure) {
      // Deactivate existing structure
      await ctx.db.patch(existingStructure._id, {
        status: "inactive",
        updatedAt: Date.now(),
        updatedBy: currentUser._id,
      });
    }

    const now = Date.now();
    const structureId = await ctx.db.insert("salaryStructures", {
      employeeId: employee._id,
      employeeClerkId: args.employeeClerkId,
      employeeName: employee.name,
      employeeRole: employee.role || "user",
      baseSalary: args.baseSalary,
      currency: "LKR",
      paymentFrequency: args.paymentFrequency,
      effectiveDate: now,
      status: "active",
      performanceBonus: args.performanceBonus,
      membershipCommissionRate: args.membershipCommissionRate,
      trainerSessionRate: args.trainerSessionRate,
      overtimeRate: args.overtimeRate,
      allowances: args.allowances,
      deductions: args.deductions,
      createdAt: now,
      updatedAt: now,
      createdBy: currentUser._id,
    });

    return structureId;
  },
});

// Update salary structure
export const updateSalaryStructure = mutation({
  args: {
    structureId: v.id("salaryStructures"),
    baseSalary: v.optional(v.number()),
    paymentFrequency: v.optional(v.union(v.literal("monthly"), v.literal("bi-weekly"), v.literal("weekly"))),
    performanceBonus: v.optional(v.number()),
    membershipCommissionRate: v.optional(v.number()),
    trainerSessionRate: v.optional(v.number()),
    overtimeRate: v.optional(v.number()),
    allowances: v.optional(v.array(v.object({
      type: v.string(),
      amount: v.number(),
      isPercentage: v.boolean(),
    }))),
    deductions: v.optional(v.array(v.object({
      type: v.string(),
      amount: v.number(),
      isPercentage: v.boolean(),
    }))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const updateData: any = {
      updatedAt: Date.now(),
      updatedBy: currentUser._id,
    };

    // Add only provided fields to update
    if (args.baseSalary !== undefined) updateData.baseSalary = args.baseSalary;
    if (args.paymentFrequency !== undefined) updateData.paymentFrequency = args.paymentFrequency;
    if (args.performanceBonus !== undefined) updateData.performanceBonus = args.performanceBonus;
    if (args.membershipCommissionRate !== undefined) updateData.membershipCommissionRate = args.membershipCommissionRate;
    if (args.trainerSessionRate !== undefined) updateData.trainerSessionRate = args.trainerSessionRate;
    if (args.overtimeRate !== undefined) updateData.overtimeRate = args.overtimeRate;
    if (args.allowances !== undefined) updateData.allowances = args.allowances;
    if (args.deductions !== undefined) updateData.deductions = args.deductions;
    if (args.status !== undefined) updateData.status = args.status;

    await ctx.db.patch(args.structureId, updateData);
    
    return { success: true };
  },
});

// ===== SALARY STATISTICS =====

// Get salary management statistics for dashboard
export const getSalaryStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all active salary structures
    const activeSalaries = await ctx.db
      .query("salaryStructures")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Get current month's payroll records
    const now = new Date();
    const currentMonth = now.toLocaleString("default", { month: "short" });
    const currentYear = now.getFullYear();

    const currentMonthPayroll = await ctx.db
      .query("payrollRecords")
      .withIndex("by_period", (q) => q.eq("payrollPeriod.year", currentYear).eq("payrollPeriod.month", currentMonth))
      .collect();

    // Get pending salary advances
    const pendingAdvances = await ctx.db
      .query("salaryAdvances")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Calculate totals
    const totalEmployeesOnPayroll = activeSalaries.length;
    const totalMonthlyPayroll = activeSalaries.reduce((sum, salary) => sum + salary.baseSalary, 0);
    const totalProcessedPayroll = currentMonthPayroll
      .filter(record => record.status === "paid" || record.status === "approved")
      .reduce((sum, record) => sum + record.netSalary, 0);
    const totalPendingApprovals = currentMonthPayroll.filter(record => record.status === "pending_approval").length;
    const totalAdvanceRequests = pendingAdvances.length;
    const totalAdvanceAmount = pendingAdvances.reduce((sum, advance) => sum + advance.requestedAmount, 0);

    // Calculate average salary by role
    const roleGroups = activeSalaries.reduce((acc, salary) => {
      if (!acc[salary.employeeRole]) {
        acc[salary.employeeRole] = { count: 0, total: 0 };
      }
      acc[salary.employeeRole].count += 1;
      acc[salary.employeeRole].total += salary.baseSalary;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const averageSalaryByRole = Object.entries(roleGroups).map(([role, data]) => ({
      role,
      count: data.count,
      averageSalary: data.total / data.count,
    }));

    return {
      totalEmployeesOnPayroll,
      totalMonthlyPayroll,
      totalProcessedPayroll,
      totalPendingApprovals,
      totalAdvanceRequests,
      totalAdvanceAmount,
      averageSalaryByRole,
      currentPeriod: {
        month: currentMonth,
        year: currentYear,
      },
    };
  },
});

// ===== HELPER FUNCTIONS =====

// Calculate Sri Lankan tax (PAYE) - simplified version
export function calculateSriLankanTax(monthlyIncome: number): number {
  // Sri Lankan PAYE tax brackets (simplified - 2025 rates)
  // This is a basic implementation - real tax calculation would be more complex
  
  const annualIncome = monthlyIncome * 12;
  let tax = 0;
  
  if (annualIncome <= 1200000) { // Up to LKR 1.2M annually
    tax = 0;
  } else if (annualIncome <= 1700000) { // LKR 1.2M to 1.7M
    tax = (annualIncome - 1200000) * 0.06; // 6%
  } else if (annualIncome <= 2200000) { // LKR 1.7M to 2.2M
    tax = 500000 * 0.06 + (annualIncome - 1700000) * 0.12; // 12%
  } else if (annualIncome <= 2700000) { // LKR 2.2M to 2.7M
    tax = 500000 * 0.06 + 500000 * 0.12 + (annualIncome - 2200000) * 0.18; // 18%
  } else { // Above LKR 2.7M
    tax = 500000 * 0.06 + 500000 * 0.12 + 500000 * 0.18 + (annualIncome - 2700000) * 0.24; // 24%
  }
  
  return Math.round(tax / 12); // Monthly tax
}

// Calculate EPF/ETF contributions
export function calculateEmployeeContributions(baseSalary: number) {
  return {
    epfEmployee: Math.round(baseSalary * 0.08), // 8% employee contribution
    epfEmployer: Math.round(baseSalary * 0.12), // 12% employer contribution
    etfEmployer: Math.round(baseSalary * 0.03), // 3% employer contribution (ETF)
  };
}

// Process payroll for a specific period
export const processPayroll = mutation({
  args: {
    year: v.number(),
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all active salary structures
    const activeSalaryStructures = await ctx.db
      .query("salaryStructures")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Check if payroll already processed for this period
    const existingPayroll = await ctx.db
      .query("payrollRecords")
      .withIndex("by_period", (q) => q.eq("payrollPeriod.year", args.year).eq("payrollPeriod.month", args.month))
      .first();

    if (existingPayroll) {
      throw new Error("Payroll already processed for this period");
    }

    // Process each employee's payroll
    const payrollRecords = [];
    for (const structure of activeSalaryStructures) {
      // Get employee details
      const employee = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", structure.employeeClerkId))
        .first();

      if (!employee) continue;

      // Calculate allowances total
      const allowancesTotal = Object.values(structure.allowances || {}).reduce(
        (sum: number, amount: any) => sum + (typeof amount === 'number' ? amount : 0), 0
      );

      // Calculate gross salary
      const grossSalary = structure.baseSalary + allowancesTotal;

      // Calculate deductions
      const taxAmount = calculateSriLankanTax(structure.baseSalary);
      const contributions = calculateEmployeeContributions(grossSalary);
      
      // Other deductions from structure
      const otherDeductions = Object.entries(structure.deductions || {})
        .filter(([key]) => !['tax', 'epf', 'etf'].includes(key))
        .reduce((sum, [_, amount]: [string, any]) => sum + (typeof amount === 'number' ? amount : 0), 0);

      const totalDeductions = taxAmount + contributions.epfEmployee + otherDeductions;
      const netSalary = Math.max(0, grossSalary - totalDeductions);

      // Create payroll record
      const payrollRecordId = await ctx.db.insert("payrollRecords", {
        employeeId: employee._id,
        employeeClerkId: structure.employeeClerkId,
        employeeName: employee.name,
        employeeRole: employee.role || 'user',
        payrollPeriod: {
          startDate: new Date(args.year, new Date(`${args.month} 1, ${args.year}`).getMonth(), 1).getTime(),
          endDate: new Date(args.year, new Date(`${args.month} 1, ${args.year}`).getMonth() + 1, 0).getTime(),
          month: args.month,
          year: args.year,
          periodLabel: `${args.month} ${args.year}`,
        },
        earnings: {
          baseSalary: structure.baseSalary,
          performanceBonus: 0,
          membershipCommissions: 0,
          sessionEarnings: 0,
          overtimeEarnings: 0,
          allowances: allowancesTotal,
          totalEarnings: grossSalary,
        },
        deductions: {
          incomeTax: taxAmount,
          epfEmployee: contributions.epfEmployee,
          epfEmployer: contributions.epfEmployer,
          etfEmployer: contributions.etfEmployer,
          insurance: otherDeductions,
          loanDeductions: 0,
          advanceDeductions: 0,
          otherDeductions: 0,
          totalDeductions,
        },
        netSalary,
        totalEmployerCost: grossSalary + contributions.epfEmployer + contributions.etfEmployer,
        status: "pending_approval",
        createdBy: currentUser._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      payrollRecords.push(payrollRecordId);
    }

    return {
      success: true,
      recordsProcessed: payrollRecords.length,
      payrollRecords,
    };
  },
});

// Get payroll records for a specific period
export const getPayrollRecords = query({
  args: {
    year: v.optional(v.number()),
    month: v.optional(v.string()),
    allRecords: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // If allRecords is true, get all payroll records
    if (args.allRecords) {
      const payrollRecords = await ctx.db
        .query("payrollRecords")
        .order("desc")
        .collect();
      return payrollRecords;
    }

    // If no period specified, get current month
    const now = new Date();
    const queryYear = args.year || now.getFullYear();
    const queryMonth = args.month || now.toLocaleString("default", { month: "short" });

    const payrollRecords = await ctx.db
      .query("payrollRecords")
      .withIndex("by_period", (q) => q.eq("payrollPeriod.year", queryYear).eq("payrollPeriod.month", queryMonth))
      .collect();

    return payrollRecords;
  },
});

// Get payroll records for a specific employee (for payment slips)
export const getEmployeePayrollRecords = query({
  args: {
    employeeClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Allow employee to see their own records or admin to see any
    if (!currentUser || (currentUser.role !== "admin" && currentUser.clerkId !== args.employeeClerkId)) {
      throw new Error("Unauthorized: Can only view your own payroll records");
    }

    const payrollRecords = await ctx.db
      .query("payrollRecords")
      .withIndex("by_employee_clerk", (q) => q.eq("employeeClerkId", args.employeeClerkId))
      .order("desc")
      .collect();

    return payrollRecords;
  },
});

// Approve payroll records
export const approvePayrollRecords = mutation({
  args: {
    recordIds: v.array(v.id("payrollRecords")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Update all specified records to approved status
    const approvedRecords = [];
    for (const recordId of args.recordIds) {
      await ctx.db.patch(recordId, {
        status: "approved",
        approvedAt: Date.now(),
        approvedBy: currentUser._id,
      });
      approvedRecords.push(recordId);
    }

    return {
      success: true,
      recordsApproved: approvedRecords.length,
    };
  },
});

// Get payroll statistics
export const getPayrollStats = query({
  args: {
    year: v.optional(v.number()),
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // If no period specified, get current month
    const now = new Date();
    const queryYear = args.year || now.getFullYear();
    const queryMonth = args.month || now.toLocaleString("default", { month: "long" });

    const payrollRecords = await ctx.db
      .query("payrollRecords")
      .withIndex("by_period", (q) => q.eq("payrollPeriod.year", queryYear).eq("payrollPeriod.month", queryMonth))
      .collect();

    // Calculate statistics
    const totalEmployees = payrollRecords.length;
    const totalGrossPay = payrollRecords.reduce((sum, record) => sum + record.earnings.totalEarnings, 0);
    const totalNetPay = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0);
    const totalTaxDeductions = payrollRecords.reduce((sum, record) => sum + record.deductions.incomeTax, 0);
    const totalEPF = payrollRecords.reduce((sum, record) => sum + record.deductions.epfEmployee, 0);
    const totalETF = payrollRecords.reduce((sum, record) => sum + record.deductions.etfEmployer, 0);

    const draft = payrollRecords.filter(record => record.status === "draft").length;
    const pending = payrollRecords.filter(record => record.status === "pending_approval").length;
    const approved = payrollRecords.filter(record => record.status === "approved").length;
    const processed = payrollRecords.filter(record => record.status === "paid").length;

    return {
      totalEmployees,
      totalGrossPay,
      totalNetPay,
      totalTaxDeductions,
      totalEPF,
      totalETF,
      draft,
      pending,
      approved,
      processed,
      payrollRecords,
    };
  },
});

// === SALARY ADVANCE MANAGEMENT ===

// Get all salary advance requests
export const getAllAdvanceRequests = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const advances = await ctx.db
      .query("salaryAdvances")
      .collect();

    // Get employee details for each advance
    const advancesWithEmployeeInfo = await Promise.all(
      advances.map(async (advance) => {
        const employee = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", advance.employeeClerkId))
          .first();

        return {
          ...advance,
          employeeName: employee?.name || "Unknown Employee",
          employeeRole: employee?.role || "user",
        };
      })
    );

    return advancesWithEmployeeInfo;
  },
});

// Create new advance request
export const createAdvanceRequest = mutation({
  args: {
    employeeClerkId: v.string(),
    requestedAmount: v.number(),
    reason: v.string(),
    urgency: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    repaymentMonths: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get employee details
    const employee = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.employeeClerkId))
      .first();

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Get employee's current salary structure
    const salaryStructure = await ctx.db
      .query("salaryStructures")
      .withIndex("by_employee_clerk", (q) => q.eq("employeeClerkId", args.employeeClerkId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!salaryStructure) {
      throw new Error("Employee salary structure not found");
    }

    // Calculate monthly deduction
    const monthlyDeduction = Math.ceil(args.requestedAmount / args.repaymentMonths);

    // Check if requested amount doesn't exceed 50% of monthly salary
    const maxAdvance = salaryStructure.baseSalary * 0.5;
    if (args.requestedAmount > maxAdvance) {
      throw new Error(`Advance amount cannot exceed 50% of monthly salary (Rs. ${maxAdvance.toLocaleString()})`);
    }

    const advanceId = await ctx.db.insert("salaryAdvances", {
      employeeId: employee._id,
      employeeClerkId: args.employeeClerkId,
      employeeName: employee.name,
      employeeRole: employee.role || 'user',
      requestedAmount: args.requestedAmount,
      reason: args.reason,
      urgency: args.urgency,
      repaymentPeriodMonths: args.repaymentMonths,
      monthlyDeductionAmount: monthlyDeduction,
      remainingBalance: args.requestedAmount,
      status: "pending",
      requestedBy: currentUser._id,
      requestedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return advanceId;
  },
});

// Approve or reject advance request
export const processAdvanceRequest = mutation({
  args: {
    advanceId: v.id("salaryAdvances"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    approvedAmount: v.optional(v.number()),
    comments: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const advance = await ctx.db.get(args.advanceId);
    if (!advance) {
      throw new Error("Advance request not found");
    }

    if (advance.status !== "pending") {
      throw new Error("Only pending requests can be processed");
    }

    if (args.action === "approve") {
      const approvedAmount = args.approvedAmount || advance.requestedAmount;
      
      // Update repayment plan based on approved amount
      const monthlyDeduction = Math.ceil(approvedAmount / advance.repaymentPeriodMonths);
      
      await ctx.db.patch(args.advanceId, {
        status: "approved",
        approvedAmount: approvedAmount,
        reviewedBy: currentUser._id,
        reviewedAt: Date.now(),
        adminNotes: args.comments,
        monthlyDeductionAmount: monthlyDeduction,
        remainingBalance: approvedAmount,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.advanceId, {
        status: "rejected",
        reviewedBy: currentUser._id,
        reviewedAt: Date.now(),
        rejectionReason: args.comments,
        updatedAt: Date.now(),
      });
    }

    return { success: true, action: args.action };
  },
});

// Mark advance as disbursed
export const disburseAdvance = mutation({
  args: {
    advanceId: v.id("salaryAdvances"),
    disbursementMethod: v.string(),
    disbursementReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const advance = await ctx.db.get(args.advanceId);
    if (!advance) {
      throw new Error("Advance request not found");
    }

    if (advance.status !== "approved") {
      throw new Error("Only approved requests can be disbursed");
    }

    await ctx.db.patch(args.advanceId, {
      status: "paid",
      paidAt: Date.now(),
      adminNotes: `Disbursed via ${args.disbursementMethod}${args.disbursementReference ? ` - Reference: ${args.disbursementReference}` : ''}`,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get advance statistics
export const getAdvanceStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const allAdvances = await ctx.db
      .query("salaryAdvances")
      .collect();

    const totalRequests = allAdvances.length;
    const pendingRequests = allAdvances.filter(adv => adv.status === "pending").length;
    const approvedRequests = allAdvances.filter(adv => adv.status === "approved").length;
    const disbursedRequests = allAdvances.filter(adv => adv.status === "paid").length;
    const rejectedRequests = allAdvances.filter(adv => adv.status === "rejected").length;
    
    const totalRequestedAmount = allAdvances.reduce((sum, adv) => sum + adv.requestedAmount, 0);
    const totalApprovedAmount = allAdvances.reduce((sum, adv) => sum + (adv.approvedAmount || 0), 0);
    const totalDisbursedAmount = allAdvances
      .filter(adv => adv.status === "paid")
      .reduce((sum, adv) => sum + (adv.approvedAmount || 0), 0);

    const averageRequestAmount = totalRequests > 0 ? totalRequestedAmount / totalRequests : 0;
    const approvalRate = totalRequests > 0 ? ((approvedRequests + disbursedRequests) / totalRequests) * 100 : 0;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      disbursedRequests,
      rejectedRequests,
      totalRequestedAmount,
      totalApprovedAmount,
      totalDisbursedAmount,
      averageRequestAmount,
      approvalRate,
    };
  },
});

// Get payroll trends over multiple months for reports
export const getPayrollTrends = query({
  args: {
    monthsBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const monthsToFetch = args.monthsBack || 6;
    const trends = [];
    const now = new Date();

    // Get data for the last N months
    for (let i = monthsToFetch - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });
      const monthShort = date.toLocaleString("default", { month: "short" });

      const payrollRecords = await ctx.db
        .query("payrollRecords")
        .withIndex("by_period", (q) => q.eq("payrollPeriod.year", year).eq("payrollPeriod.month", month))
        .collect();

      const totalAmount = payrollRecords
        .filter(record => record.status === "paid" || record.status === "approved")
        .reduce((sum, record) => sum + record.netSalary, 0);

      trends.push({
        month: monthShort,
        fullMonth: month,
        year,
        amount: totalAmount,
        employeeCount: payrollRecords.length,
      });
    }

    return trends;
  },
});

// Get detailed expense breakdown for reports
export const getExpenseBreakdown = query({
  args: {
    year: v.optional(v.number()),
    month: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // If no period specified, get current month
    const now = new Date();
    const queryYear = args.year || now.getFullYear();
    const queryMonth = args.month || now.toLocaleString("default", { month: "long" });

    const payrollRecords = await ctx.db
      .query("payrollRecords")
      .withIndex("by_period", (q) => q.eq("payrollPeriod.year", queryYear).eq("payrollPeriod.month", queryMonth))
      .collect();

    const salaryStructures = await ctx.db
      .query("salaryStructures")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Calculate breakdown
    let totalBaseSalaries = 0;
    let totalAllowances = 0;
    let totalEPFEmployer = 0;
    let totalETF = 0;
    let totalOtherBenefits = 0;

    // From payroll records (actual processed data)
    if (payrollRecords.length > 0) {
      totalBaseSalaries = payrollRecords.reduce((sum, record) => sum + record.earnings.baseSalary, 0);
      totalAllowances = payrollRecords.reduce((sum, record) => sum + record.earnings.allowances, 0);
      totalEPFEmployer = payrollRecords.reduce((sum, record) => sum + record.deductions.epfEmployer, 0);
      totalETF = payrollRecords.reduce((sum, record) => sum + record.deductions.etfEmployer, 0);
      totalOtherBenefits = payrollRecords.reduce((sum, record) => 
        sum + record.earnings.performanceBonus + record.earnings.membershipCommissions + record.earnings.sessionEarnings, 0);
    } else {
      // Fallback to salary structures if no payroll processed yet
      salaryStructures.forEach(structure => {
        totalBaseSalaries += structure.baseSalary;
        
        // Calculate allowances
        structure.allowances.forEach(allowance => {
          if (allowance.isPercentage) {
            totalAllowances += (structure.baseSalary * allowance.amount) / 100;
          } else {
            totalAllowances += allowance.amount;
          }
        });

        // EPF Employer (12% of basic salary)
        totalEPFEmployer += structure.baseSalary * 0.12;
        
        // ETF (3% of basic salary)
        totalETF += structure.baseSalary * 0.03;
        
        // Performance bonus (if applicable)
        if (structure.performanceBonus) {
          totalOtherBenefits += structure.performanceBonus;
        }
      });
    }

    const totalExpenses = totalBaseSalaries + totalAllowances + totalEPFEmployer + totalETF + totalOtherBenefits;

    const breakdown = [
      {
        category: "Base Salaries",
        amount: totalBaseSalaries,
        percentage: totalExpenses > 0 ? Math.round((totalBaseSalaries / totalExpenses) * 100) : 0
      },
      {
        category: "Allowances",
        amount: totalAllowances,
        percentage: totalExpenses > 0 ? Math.round((totalAllowances / totalExpenses) * 100) : 0
      },
      {
        category: "EPF Employer",
        amount: totalEPFEmployer,
        percentage: totalExpenses > 0 ? Math.round((totalEPFEmployer / totalExpenses) * 100) : 0
      },
      {
        category: "ETF",
        amount: totalETF,
        percentage: totalExpenses > 0 ? Math.round((totalETF / totalExpenses) * 100) : 0
      },
      {
        category: "Other Benefits",
        amount: totalOtherBenefits,
        percentage: totalExpenses > 0 ? Math.round((totalOtherBenefits / totalExpenses) * 100) : 0
      }
    ];

    return {
      breakdown,
      totalExpenses,
    };
  },
});

// Get all generated reports
export const getGeneratedReports = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const reports = await ctx.db
      .query("generatedReports")
      .order("desc")
      .take(50); // Limit to last 50 reports

    return reports;
  },
});

// Create a new generated report record
export const createGeneratedReport = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("payroll"), v.literal("advances"), v.literal("tax"), v.literal("comparative")),
    dateRange: v.string(),
    fileName: v.string(),
    fileSize: v.string(),
    parameters: v.object({
      year: v.optional(v.number()),
      month: v.optional(v.string()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const reportId = await ctx.db.insert("generatedReports", {
      title: args.title,
      description: args.description,
      type: args.type,
      dateRange: args.dateRange,
      status: "generated",
      fileName: args.fileName,
      fileSize: args.fileSize,
      generatedBy: currentUser._id,
      generatedAt: Date.now(),
      parameters: args.parameters,
    });

    return reportId;
  },
});