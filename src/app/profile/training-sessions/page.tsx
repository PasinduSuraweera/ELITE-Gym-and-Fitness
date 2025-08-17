"use client";

import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Star, User } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function TrainingSessionsPage() {
  const { user } = useUser();
  const userBookings = useQuery(
    api.bookings.getUserBookings, 
    user?.id ? { userClerkId: user.id } : "skip"
  );
  const cancelBooking = useMutation(api.bookings.cancelBooking);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-900/30 text-green-300 border-green-600/30";
      case "pending":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-600/30";
      case "cancelled":
        return "bg-red-900/30 text-red-300 border-red-600/30";
      case "completed":
        return "bg-blue-900/30 text-blue-300 border-blue-600/30";
      default:
        return "bg-gray-900/30 text-gray-300 border-gray-600/30";
    }
  };

  const isUpcoming = (sessionDate: string) => {
    return new Date(sessionDate) > new Date();
  };

  return (
    <UserLayout title="Training Sessions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Training Sessions</h1>
            <p className="text-gray-400 mt-2">
              Manage your training sessions and view session history
            </p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => window.location.href = '/trainer-booking'}
          >
            Book New Session
          </Button>
        </div>

        {/* Sessions Grid */}
        {userBookings && userBookings.length > 0 ? (
          <div className="space-y-4">
            {userBookings.map((booking) => (
              <Card 
                key={booking._id} 
                className="bg-gray-900/50 border-gray-800 hover:border-red-500/30 transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-red-500" />
                      {booking.trainerName}
                    </CardTitle>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusBadgeColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <CardDescription className="text-gray-400">
                    {booking.sessionType.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Date and Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span className="text-white">
                        {formatDate(new Date(booking.sessionDate))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span className="text-gray-300">
                        {new Date(`2000-01-01T${booking.startTime}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-sm text-gray-400">
                    Duration: {booking.duration} minutes
                  </div>

                  {/* Special Notes */}
                  {booking.notes && (
                    <div className="text-sm">
                      <span className="text-gray-400">Notes: </span>
                      <span className="text-gray-300">{booking.notes}</span>
                    </div>
                  )}

                  {/* Status Indicators */}
                  {booking.status === "confirmed" && isUpcoming(booking.sessionDate) && (
                    <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded-lg border border-green-600/30">
                      <Clock className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">Upcoming Session</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {booking.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                        onClick={() => window.location.href = '/reviews'}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}
                    
                    {booking.status === "confirmed" && isUpcoming(booking.sessionDate) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-600/50 text-red-400 hover:bg-red-900/20"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to cancel your training session with ${booking.trainerName}?\n\nSession: ${booking.sessionType.replace('_', ' ')}\nDate: ${formatDate(new Date(booking.sessionDate))}\n\nThis action cannot be undone.`)) {
                            try {
                              await cancelBooking({
                                bookingId: booking._id,
                                cancellationReason: "Cancelled by user",
                                cancelledBy: "user"
                              });
                              alert("✅ Your training session has been cancelled successfully.");
                            } catch (error) {
                              console.error("Error cancelling booking:", error);
                              alert("❌ Error cancelling session. Please try again or contact support.");
                            }
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => window.location.href = `/trainer-profile/${booking.trainerId}`}
                    >
                      View Trainer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Training Sessions Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Start your fitness journey by booking your first training session with one of our certified trainers.
              </p>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => window.location.href = '/trainer-booking'}
              >
                Browse Trainers
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}
