"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  AlertTriangle,
  PiggyBank,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  CreditCard,
  Wallet,
  FileText,
  Send,
  X
} from "lucide-react";

interface NewAdvanceForm {
  employeeName: string;
  employeeId: string;
  requestedAmount: number;
  reason: string;
  urgency: string;
  installments: number;
}

const initialFormState: NewAdvanceForm = {
  employeeName: "",
  employeeId: "",
  requestedAmount: 0,
  reason: "",
  urgency: "medium",
  installments: 3
};

export default function SalaryAdvancesPage() {
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [formData, setFormData] = useState<NewAdvanceForm>(initialFormState);
  const [approvalData, setApprovalData] = useState({
    approvedAmount: 0,
    comments: "",
    action: "approve" as "approve" | "reject"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");

  // Convex queries and mutations
  const allUsers = useQuery(api.users.getAllUsers);
  const salaryStructures = useQuery(api.salary.getAllSalaryStructures);
  const advanceRequests = useQuery(api.salary.getAllAdvanceRequests);
  const advanceStats = useQuery(api.salary.getAdvanceStats);
  
  // Mutations
  const createAdvanceRequest = useMutation(api.salary.createAdvanceRequest);
  const processAdvanceRequest = useMutation(api.salary.processAdvanceRequest);
  const disburseAdvance = useMutation(api.salary.disburseAdvance);

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

  const formatDate = (date: Date) => {
    if (!mounted) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate advance statistics from real data
  const advanceStatsCalculated = {
    totalRequests: advanceStats?.totalRequests || 0,
    pendingRequests: advanceStats?.pendingRequests || 0,
    approvedRequests: advanceStats?.approvedRequests || 0,
    disbursedRequests: advanceStats?.disbursedRequests || 0,
    rejectedRequests: advanceStats?.rejectedRequests || 0,
    totalRequestedAmount: advanceStats?.totalRequestedAmount || 0,
    totalApprovedAmount: advanceStats?.totalApprovedAmount || 0,
    averageRequestAmount: advanceStats?.averageRequestAmount || 0
  };

  // Filter advance requests
  const filteredRequests = (advanceRequests || []).filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeClerkId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesUrgency = filterUrgency === "all" || request.urgency === filterUrgency;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const handleSubmitNewAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAdvanceRequest({
        employeeClerkId: formData.employeeId,
        requestedAmount: formData.requestedAmount,
        reason: formData.reason,
        urgency: formData.urgency as "low" | "medium" | "high",
        repaymentMonths: formData.installments,
      });
      
      setFormData(initialFormState);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating advance request:", error);
    }
  };

  const handleApproveReject = (request: any, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setApprovalData({
      approvedAmount: action === "approve" ? request.requestedAmount : 0,
      comments: "",
      action
    });
    setShowApprovalModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!selectedRequest) return;
    
    try {
      await processAdvanceRequest({
        advanceId: selectedRequest._id,
        action: approvalData.action,
        approvedAmount: approvalData.action === "approve" ? approvalData.approvedAmount : undefined,
        comments: approvalData.comments,
      });
      
      setShowApprovalModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error processing advance request:", error);
    }
  };

  return (
    <AdminLayout 
      title="Salary Advances" 
      subtitle="Manage employee salary advance requests and disbursements"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-blue-400">{advanceStatsCalculated.totalRequests}</p>
              <p className="text-blue-300 text-xs mt-1">All time</p>
            </div>
            <FileText className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-400">{advanceStatsCalculated.pendingRequests}</p>
              <p className="text-orange-300 text-xs mt-1">Awaiting review</p>
            </div>
            <Clock className="h-6 w-6 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Approved</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(advanceStatsCalculated.totalApprovedAmount)}</p>
              <p className="text-green-300 text-xs mt-1">Lifetime disbursed</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Average Request</p>
              <p className="text-2xl font-bold text-purple-400">{formatCurrency(advanceStatsCalculated.averageRequestAmount)}</p>
              <p className="text-purple-300 text-xs mt-1">Per request</p>
            </div>
            <TrendingUp className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Request Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-muted-foreground">Pending</span>
              </div>
              <span className="text-foreground font-medium">{advanceStatsCalculated.pendingRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-muted-foreground">Approved</span>
              </div>
              <span className="text-foreground font-medium">{advanceStatsCalculated.approvedRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-muted-foreground">Disbursed</span>
              </div>
              <span className="text-foreground font-medium">{advanceStatsCalculated.disbursedRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-muted-foreground">Rejected</span>
              </div>
              <span className="text-foreground font-medium">{advanceStatsCalculated.rejectedRequests}</span>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Requested</span>
              <span className="text-foreground font-medium">{formatCurrency(advanceStatsCalculated.totalRequestedAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Approved</span>
              <span className="text-green-400 font-medium">{formatCurrency(advanceStatsCalculated.totalApprovedAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Approval Rate</span>
              <span className="text-foreground font-medium">
                {advanceStatsCalculated.totalRequests > 0 ? Math.round(((advanceStatsCalculated.approvedRequests + advanceStatsCalculated.disbursedRequests) / advanceStatsCalculated.totalRequests) * 100) : 0}%
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Outstanding Amount</span>
                <span className="text-orange-400 font-medium">
                  {formatCurrency(advanceStatsCalculated.totalApprovedAmount * 0.7)} {/* Mock outstanding */}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Advance Request
            </button>
            <button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Bulk Approve ({advanceStatsCalculated.pendingRequests})
            </button>
            <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
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
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Disbursed</option>
            <option value="rejected">Rejected</option>
            <option value="repaying">Repaying</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* New Advance Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">New Advance Request</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewAdvance} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
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
                        employeeName: selectedUser?.name || ''
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
                    Requested Amount (LKR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="100"
                    value={formData.requestedAmount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, requestedAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reason for Advance <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Provide detailed reason for salary advance request"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Repayment Installments
                </label>
                <select
                  value={formData.installments}
                  onChange={(e) => setFormData(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={1}>1 Month</option>
                  <option value={2}>2 Months</option>
                  <option value={3}>3 Months</option>
                  <option value={4}>4 Months</option>
                  <option value={5}>5 Months</option>
                  <option value={6}>6 Months</option>
                </select>
                {formData.requestedAmount > 0 && formData.installments > 0 && (
                  <p className="text-muted-foreground text-sm mt-1">
                    Monthly deduction: {formatCurrency(Math.ceil(formData.requestedAmount / formData.installments))}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                {approvalData.action === "approve" ? "Approve Request" : "Reject Request"}
              </h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-foreground font-medium">{selectedRequest.employeeName}</p>
              <p className="text-muted-foreground text-sm">Requested: {formatCurrency(selectedRequest.requestedAmount)}</p>
              <p className="text-muted-foreground text-sm">Reason: {selectedRequest.reason}</p>
            </div>

            <div className="space-y-4">
              {approvalData.action === "approve" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Approved Amount (LKR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedRequest.requestedAmount}
                    value={approvalData.approvedAmount || ''}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, approvedAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Comments
                </label>
                <textarea
                  rows={3}
                  value={approvalData.comments}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Add comments or reasons for decision"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApproval}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  approvalData.action === "approve"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {approvalData.action === "approve" ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Approve Request
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advance Requests Table */}
      <div className="bg-card/50 border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Salary Advance Requests</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reason</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Urgency</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Request Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!mounted ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading advance requests...</p>
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="border-b border-border hover:bg-accent/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                          request.employeeRole === 'admin' ? 'bg-red-500' :
                          request.employeeRole === 'trainer' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}>
                          {request.employeeName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{request.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{request.employeeClerkId} • {request.employeeRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{formatCurrency(request.requestedAmount)}</p>
                        {request.approvedAmount && request.approvedAmount !== request.requestedAmount && (
                          <p className="text-sm text-green-400">Approved: {formatCurrency(request.approvedAmount)}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {request.repaymentPeriodMonths}x {formatCurrency(request.monthlyDeductionAmount)}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-foreground text-sm truncate" title={request.reason}>
                        {request.reason}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.urgency === "high" ? "bg-red-500/20 text-red-400" :
                        request.urgency === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="p-4 text-foreground">{formatDate(new Date(request.requestedAt))}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === "approved" ? "bg-green-500/20 text-green-400" :
                        request.status === "paid" ? "bg-blue-500/20 text-blue-400" :
                        request.status === "rejected" ? "bg-red-500/20 text-red-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {request.status === "paid" ? "disbursed" : request.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveReject(request, "approve")}
                              className="p-2 text-muted-foreground hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Approve Request"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleApproveReject(request, "reject")}
                              className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Reject Request"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="p-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
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
                    <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No advance requests found</p>
                    <p className="text-muted-foreground text-sm">
                      {searchTerm || filterStatus !== "all" || filterUrgency !== "all" 
                        ? "Try adjusting your filters or search term"
                        : "Employee advance requests will appear here"
                      }
                    </p>
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