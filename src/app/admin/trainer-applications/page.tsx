"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";

export default function TrainerApplicationsPage() {
  const applications = useQuery(api.trainers.getTrainerApplications);
  const reviewApplication = useMutation(api.trainers.reviewTrainerApplication);
  const [reviewingApp, setReviewingApp] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [mounted, setMounted] = useState(false);

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
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
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
      subtitle="Review and manage trainer applications"
    >
      {/* Applications Grid */}
      <div className="grid gap-6">
        {applications?.map((app) => (
          <div key={app._id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium mr-4">
                  {app.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{app.name}</h3>
                  <p className="text-gray-400">{app.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border flex items-center gap-1 ${getStatusBadge(app.status)}`}>
                  {getStatusIcon(app.status)}
                  {app.status}
                </span>
                <button
                  onClick={() => setSelectedApp(app)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Experience</p>
                    <p className="text-white text-sm line-clamp-2">{app.experience}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Certifications</p>
                    <p className="text-white text-sm line-clamp-2">{app.certifications}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Submitted</p>
                    <p className="text-white text-sm">{formatDate(app.submittedAt)}</p>
                  </div>
                </div>

                {app.status === "pending" && (
                  <div className="flex gap-2 pt-4 border-t border-gray-800">
                    <button
                      onClick={() => handleReview(app._id, "approved")}
                      disabled={reviewingApp === app._id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {reviewingApp === app._id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReview(app._id, "rejected")}
                      disabled={reviewingApp === app._id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {reviewingApp === app._id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                )}

                {app.status !== "pending" && app.reviewedAt && (
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-gray-400 text-sm">
                      Reviewed on {formatDate(app.reviewedAt)}
                      {app.notes && (
                        <span className="block mt-1 text-white">Notes: {app.notes}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {(!applications || applications.length === 0) && (
              <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-lg">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No trainer applications found</p>
              </div>
            )}
          </div>

          {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedApp.name}</h2>
                  <p className="text-gray-400">{selectedApp.email}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Experience</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedApp.experience}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Certifications</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedApp.certifications}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Motivation</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedApp.motivation}</p>
                </div>

                {selectedApp.status === "pending" && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Review Notes (Optional)</h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about this application..."
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {selectedApp.status === "pending" && (
                <div className="flex gap-3 pt-6 border-t border-gray-800 mt-6">
                  <button
                    onClick={() => handleReview(selectedApp._id, "approved")}
                    disabled={reviewingApp === selectedApp._id}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {reviewingApp === selectedApp._id ? "Approving..." : "Approve Application"}
                  </button>
                  <button
                    onClick={() => handleReview(selectedApp._id, "rejected")}
                    disabled={reviewingApp === selectedApp._id}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
                  >
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
