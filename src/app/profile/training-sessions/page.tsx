"use client";

import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Star, User } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function TrainingSessionsPage() {
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const userBookings = useQuery(
    api.bookings.getUserBookings, 
    user?.id ? { userClerkId: user.id } : "skip"
  );
  const cancelBooking = useMutation(api.bookings.cancelBooking);

  // Show loading state during auth check or hydration
  if (!mounted || !isLoaded) {
    return (
      <UserLayout 
        title="Training Sessions" 
        subtitle="Manage your training sessions and bookings"
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
        return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600/30";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600/30";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600/30";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600/30";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600/30";
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
            <h1 className="text-3xl font-bold text-foreground">Training Sessions</h1>
            <p className="text-muted-foreground mt-2">
              Manage your training sessions and view session history
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
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
                className="bg-card/50 border-border hover:border-primary/30 transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {booking.trainerName}
                    </CardTitle>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusBadgeColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {booking.sessionType.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Date and Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-foreground">
                        {formatDate(new Date(booking.sessionDate))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {new Date(`2000-01-01T${booking.startTime}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-sm text-muted-foreground">
                    Duration: {booking.duration} minutes
                  </div>

                  {/* Special Notes */}
                  {booking.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Notes: </span>
                      <span className="text-foreground">{booking.notes}</span>
                    </div>
                  )}

                  {/* Status Indicators */}
                  {booking.status === "confirmed" && isUpcoming(booking.sessionDate) && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 text-sm font-medium">Upcoming Session</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {booking.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border text-foreground hover:bg-muted"
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
                        className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
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
                      className="flex-1 border-border text-foreground hover:bg-muted"
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
          <Card className="bg-card/50 border-border">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground/60 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Training Sessions Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start your fitness journey by booking your first training session with one of our certified trainers.
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90"
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
