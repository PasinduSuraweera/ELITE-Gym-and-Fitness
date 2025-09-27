"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter, 
  Search, 
  Calendar,
  User,
  Award,
  FileText,
  TrendingUp,
  Users,
  CheckSquare
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function TrainerApplicationsPage() {
  const { isSignedIn } = useAuth();
  const applications = useQuery(api.trainers.getTrainerApplications, isSignedIn ? undefined : "skip");
  const reviewApplication = useMutation(api.trainers.reviewTrainerApplication);
  const [reviewingApp, setReviewingApp] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [mounted, setMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getTimeAgo = (date: number | Date | null | undefined) => {
    if (!mounted || !date) return 'N/A';
    try {
      const now = new Date();
      const past = new Date(date);
      const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch {
      return 'N/A';
    }
  };

  // Filter and sort applications
  const filteredApplications = applications?.filter(app => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      case "oldest":
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Calculate statistics
  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter(app => app.status === "pending").length || 0,
    approved: applications?.filter(app => app.status === "approved").length || 0,
    rejected: applications?.filter(app => app.status === "rejected").length || 0,
  };

  const handleReview = async (applicationId: string, status: "approved" | "rejected") => {
    try {
      setReviewingApp(applicationId);
      await reviewApplication({ 
        applicationId: applicationId as any, 
        status, 
        notes: notes || undefined 
      });
      alert(`Application ${status} successfully!`);
      setSelectedApp(null);
      setNotes("");
    } catch (error) {
      alert("Failed to review application: " + (error as Error).message);
    } finally {
      setReviewingApp(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted/20 text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout 
      title="Trainer Applications" 
      subtitle="Review and manage trainer applications with advanced filtering"
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card/50 border border-border rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-accent border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 bg-accent border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 bg-accent border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          <div className="text-muted-foreground text-sm">
            Showing {filteredApplications?.length || 0} of {stats.total} applications
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid gap-6">
      {/* Applications Grid */}
      <div className="grid gap-6">
        {filteredApplications?.map((app) => (
          <div key={app._id} className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg">
                  {app.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{app.name}</h3>
                  <p className="text-muted-foreground mb-2">{app.email}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(app.submittedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(app.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 text-sm font-medium rounded-full border flex items-center gap-2 ${getStatusBadge(app.status)}`}>
                  {getStatusIcon(app.status)}
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
                <button
                  onClick={() => setSelectedApp(app)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200"
                  title="View Details"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-400" />
                  <p className="text-muted-foreground text-sm font-medium">Experience</p>
                </div>
                <p className="text-foreground text-sm line-clamp-3 leading-relaxed">{app.experience}</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <p className="text-muted-foreground text-sm font-medium">Certifications</p>
                </div>
                <p className="text-foreground text-sm line-clamp-3 leading-relaxed">{app.certifications}</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <p className="text-muted-foreground text-sm font-medium">Motivation</p>
                </div>
                <p className="text-foreground text-sm line-clamp-3 leading-relaxed">{app.motivation}</p>
              </div>
            </div>

            {app.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => handleReview(app._id, "approved")}
                  disabled={reviewingApp === app._id}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {reviewingApp === app._id ? "Approving..." : "Approve"}
                </button>
                <button
                  onClick={() => handleReview(app._id, "rejected")}
                  disabled={reviewingApp === app._id}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  {reviewingApp === app._id ? "Rejecting..." : "Reject"}
                </button>
                <button
                  onClick={() => setSelectedApp(app)}
                  className="px-6 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Review
                </button>
              </div>
            )}

            {app.status !== "pending" && app.reviewedAt && (
              <div className="pt-4 border-t border-border">
                <div className="bg-accent/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm font-medium">
                      Reviewed on {formatDate(app.reviewedAt)}
                    </p>
                  </div>
                  {app.notes && (
                    <p className="text-foreground text-sm bg-accent p-3 rounded-md">
                      <span className="text-muted-foreground">Review Notes:</span> {app.notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {(!filteredApplications || filteredApplications.length === 0) && (
          <div className="text-center py-16 bg-card/50 border border-border rounded-lg">
            <div className="max-w-md mx-auto">
              {searchTerm || filterStatus !== "all" ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">No applications found</h3>
                  <p className="text-muted-foreground/70">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                    }}
                    className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">No trainer applications</h3>
                  <p className="text-muted-foreground/70">New applications will appear here when submitted</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      </div>

      {/* Enhanced Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedApp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-1">{selectedApp.name}</h2>
                    <p className="text-muted-foreground text-lg">{selectedApp.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied {formatDate(selectedApp.submittedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getTimeAgo(selectedApp.submittedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 text-sm font-medium rounded-full border flex items-center gap-2 ${getStatusBadge(selectedApp.status)}`}>
                    {getStatusIcon(selectedApp.status)}
                    {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded-lg transition-all duration-200"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Application Content */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="bg-accent/50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-blue-400" />
                      <h3 className="text-xl font-semibold text-foreground">Professional Experience</h3>
                    </div>
                    <p className="text-foreground leading-relaxed">{selectedApp.experience}</p>
                  </div>

                  <div className="bg-accent/50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-xl font-semibold text-foreground">Certifications</h3>
                    </div>
                    <p className="text-foreground leading-relaxed">{selectedApp.certifications}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-accent/50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      <h3 className="text-xl font-semibold text-foreground">Motivation</h3>
                    </div>
                    <p className="text-foreground leading-relaxed">{selectedApp.motivation}</p>
                  </div>

                  {selectedApp.status !== "pending" && selectedApp.reviewedAt && (
                    <div className="bg-accent/50 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckSquare className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-xl font-semibold text-foreground">Review Information</h3>
                      </div>
                      <div className="space-y-3">
                        <p className="text-foreground">
                          <span className="text-muted-foreground">Reviewed on:</span> {formatDate(selectedApp.reviewedAt)}
                        </p>
                        {selectedApp.notes && (
                          <div>
                            <p className="text-muted-foreground text-sm mb-2">Review Notes:</p>
                            <p className="text-foreground bg-accent p-3 rounded-md">{selectedApp.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Section for Pending Applications */}
              {selectedApp.status === "pending" && (
                <div className="bg-accent/30 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Application Review</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-muted-foreground text-sm font-medium mb-2">
                        Review Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about this application decision..."
                        className="w-full p-4 bg-accent border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedApp.status === "pending" && (
                <div className="flex gap-4 pt-6 border-t border-border">
                  <button
                    onClick={() => handleReview(selectedApp._id, "approved")}
                    disabled={reviewingApp === selectedApp._id}
                    className="flex-1 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {reviewingApp === selectedApp._id ? "Approving..." : "Approve Application"}
                  </button>
                  <button
                    onClick={() => handleReview(selectedApp._id, "rejected")}
                    disabled={reviewingApp === selectedApp._id}
                    className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                  >
                    <XCircle className="h-5 w-5" />
                    {reviewingApp === selectedApp._id ? "Rejecting..." : "Reject Application"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
