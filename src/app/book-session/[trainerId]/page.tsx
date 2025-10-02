"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, User, MapPin, Award, CheckCircle, Users } from "lucide-react";

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function BookSessionPage() {
  const { trainerId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{startTime: string; endTime: string;} | null>(null);
  const [sessionType, setSessionType] = useState<"personal_training" | "group_class">("personal_training");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Get trainer profile
  const trainerProfile = useQuery(api.trainerProfiles.getTrainerById, {
    trainerId: trainerId as Id<"trainerProfiles">
  });

  // Get user's membership
  const userMembership = useQuery(api.memberships.getUserMembership, 
    user ? { clerkId: user.id } : "skip"
  );

  // Get user data to get the database ID
  const userData = useQuery(api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Get available time slots
  const availableSlots = useQuery(api.availability.getAvailableTimeSlots, 
    selectedDate ? {
      trainerId: trainerId as Id<"trainerProfiles">,
      date: selectedDate,
      duration: 60 // 1 hour sessions
    } : "skip"
  );

  // Create booking mutation
  const createBooking = useMutation(api.bookings.createBooking);

  // Generate next 14 days for date selection
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleBooking = async () => {
    if (!user || !selectedTimeSlot || !trainerProfile) return;

    setIsBooking(true);
    try {
      // For users with active membership, create booking directly (no payment required)
      if (userMembership && userMembership.status === "active" && userData) {
        const bookingId = await createBooking({
          userId: userData._id,
          trainerId: trainerId as Id<"trainerProfiles">,
          userClerkId: user.id,
          sessionType,
          sessionDate: selectedDate,
          startTime: selectedTimeSlot.startTime,
          duration: 60,
          notes,
        });
        
        if (bookingId) {
          // Redirect to success page
          window.location.href = `${window.location.origin}/booking-success?booking_id=${bookingId}`;
        } else {
          throw new Error("Failed to create booking");
        }
      } else {
        // No active membership - redirect to membership page
        alert("You need an active membership to book training sessions.");
        window.location.href = `${window.location.origin}/membership`;
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book session. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  if (!trainerProfile) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]"></div>
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-foreground text-xl">Loading trainer information...</div>
        </div>
      </div>
    );
  }

  if (!userMembership || userMembership.status !== "active") {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]"></div>
        
        <div className="flex items-center justify-center min-h-screen relative z-10 p-4">
          <Card className="bg-card/50 backdrop-blur-md border border-border max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-3">Membership Required</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                All trainer sessions are <span className="text-primary font-semibold">FREE</span> with an active membership.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span>Unlimited personal training</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span>All group classes included</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span>Full gym access</span>
                </div>
              </div>
              
              <Button 
                onClick={() => router.push("/membership")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-3"
              >
                Get Membership
              </Button>
              
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="w-full border-border text-muted-foreground hover:bg-accent"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10" suppressHydrationWarning>
        {/* Header */}
        <div className="text-center mb-16" suppressHydrationWarning>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Book Your
            <span className="text-primary block">Training Session</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Schedule your personalized training session with <span className="text-primary font-semibold">{trainerProfile.name}</span> 
            and take your fitness journey to the next level
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trainer Info */}
          <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={trainerProfile.profileImage || "/logo.png"}
                    alt={trainerProfile.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary/30"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{trainerProfile.name}</h3>
                <div className="flex items-center justify-center gap-2 text-yellow-500 dark:text-yellow-400 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(trainerProfile.rating || 0) ? "fill-current" : "stroke-current fill-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{trainerProfile.rating?.toFixed(1) || "New"}</span>
                  <span className="text-muted-foreground">({trainerProfile.totalReviews || 0} reviews)</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-foreground font-medium">{trainerProfile.experience} experience</p>
                    <p className="text-muted-foreground text-sm">Professional Training</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3 font-medium">Specializations:</p>
                <div className="flex flex-wrap gap-2">
                  {trainerProfile.specializations.map((spec: string, index: number) => (
                    <Badge key={index} className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors">
                      {spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>

              {trainerProfile.bio && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2 font-medium">About:</p>
                  <p className="text-sm text-foreground leading-relaxed">{trainerProfile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Type */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Choose Session Type</h3>
                    <p className="text-muted-foreground text-sm">Select the training format that suits you best</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSessionType("personal_training")}
                    className={`group p-6 rounded-xl border-2 transition-colors ${
                      sessionType === "personal_training"
                        ? "border-primary bg-primary/20"
                        : "border-border bg-card/50 hover:bg-accent/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        sessionType === "personal_training" ? "bg-primary/30" : "bg-accent/50"
                      }`}>
                        <User className="h-6 w-6 text-foreground" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Personal Training</h4>
                      <p className="text-sm text-muted-foreground">One-on-one focused session</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setSessionType("group_class")}
                    className={`group p-6 rounded-xl border-2 transition-colors ${
                      sessionType === "group_class"
                        ? "border-primary bg-primary/20"
                        : "border-border bg-card/50 hover:bg-accent/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        sessionType === "group_class" ? "bg-primary/30" : "bg-accent/50"
                      }`}>
                        <Users className="h-6 w-6 text-foreground" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Group Class</h4>
                      <p className="text-sm text-muted-foreground">Train with others in a group</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Select Date</h3>
                    <p className="text-muted-foreground text-sm">Choose your preferred session date</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                  {generateAvailableDates().map((date) => {
                    const dateObj = new Date(date);
                    const isSelected = selectedDate === date;
                    const isToday = date === new Date().toISOString().split('T')[0];
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`group p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          isSelected
                            ? "border-primary bg-primary/20 shadow-lg shadow-primary/25"
                            : "border-border bg-card/50 hover:bg-accent/50 hover:border-primary/50"
                        }`}
                      >
                        <div className="text-center">
                          <p className={`text-xs font-medium mb-1 ${
                            isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          }`}>
                            {dateObj.toLocaleDateString('en', { weekday: 'short' })}
                          </p>
                          <p className={`text-lg font-bold ${
                            isSelected ? "text-foreground" : "text-foreground group-hover:text-foreground"
                          }`}>
                            {dateObj.getDate()}
                          </p>
                          {isToday && (
                            <div className="w-1 h-1 bg-green-500 dark:bg-green-400 rounded-full mx-auto mt-1"></div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Slots */}
            {selectedDate && (
              <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Available Times</h3>
                      <p className="text-muted-foreground text-sm">
                        {new Date(selectedDate).toLocaleDateString('en', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  {availableSlots && availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`group p-4 rounded-xl border-2 transition-colors ${
                            selectedTimeSlot === slot
                              ? "border-primary bg-primary/20"
                              : "border-border bg-card/50 hover:bg-accent/50 hover:border-primary/50"
                          }`}
                        >
                          <div className="text-center">
                            <Clock className={`h-5 w-5 mx-auto mb-2 ${
                              selectedTimeSlot === slot ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                            }`} />
                            <p className={`text-sm font-semibold ${
                              selectedTimeSlot === slot ? "text-foreground" : "text-foreground group-hover:text-foreground"
                            }`}>
                              {slot.startTime}
                            </p>
                            <p className={`text-xs ${
                              selectedTimeSlot === slot ? "text-primary" : "text-muted-foreground group-hover:text-muted-foreground"
                            }`}>
                              {slot.endTime}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-medium text-foreground mb-2">No Available Slots</h4>
                      <p className="text-muted-foreground">Try selecting a different date</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Session Notes</h3>
                    <p className="text-muted-foreground text-sm">Optional - Share your goals or requirements</p>
                  </div>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell your trainer about your fitness goals, any injuries, or specific areas you'd like to focus on..."
                  className="w-full p-4 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground resize-none h-32 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {notes.length}/500 characters
                </p>
              </CardContent>
            </Card>

            {/* Booking Summary & Button */}
            {selectedTimeSlot && (
              <Card className="bg-card/50 backdrop-blur-sm border border-primary/30">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Booking Summary</h3>
                      <p className="text-muted-foreground text-sm">Review your session details</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground">Trainer</span>
                      </div>
                      <span className="text-foreground font-medium">{trainerProfile.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground">Date</span>
                      </div>
                      <span className="text-foreground font-medium">
                        {new Date(selectedDate).toLocaleDateString('en', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-foreground">Time</span>
                      </div>
                      <span className="text-foreground font-medium">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {sessionType === "personal_training" ? (
                          <User className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Users className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-foreground">Type</span>
                      </div>
                      <span className="text-foreground font-medium capitalize">{sessionType.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-4 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {isBooking ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Confirm Booking
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
