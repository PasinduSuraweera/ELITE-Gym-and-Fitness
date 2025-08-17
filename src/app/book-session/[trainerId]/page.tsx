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
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"></div>
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-white text-xl">Loading trainer information...</div>
        </div>
      </div>
    );
  }

  if (!userMembership || userMembership.status !== "active") {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"></div>
        
        <div className="flex items-center justify-center min-h-screen relative z-10 p-4">
          <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800 max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-600/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">Membership Required</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                All trainer sessions are <span className="text-red-400 font-semibold">FREE</span> with an active membership.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Unlimited personal training</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>All group classes included</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Full gym access</span>
                </div>
              </div>
              
              <Button 
                onClick={() => router.push("/membership")}
                className="w-full bg-red-600 hover:bg-red-700 text-white mb-3"
              >
                Get Membership
              </Button>
              
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
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
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10" suppressHydrationWarning>
        {/* Header */}
        <div className="text-center mb-16" suppressHydrationWarning>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Book Your
            <span className="text-red-500 block">Training Session</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Schedule your personalized training session with <span className="text-red-400 font-semibold">{trainerProfile.name}</span> 
            and take your fitness journey to the next level
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trainer Info */}
          <Card className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/60 backdrop-blur-sm border border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={trainerProfile.profileImage || "/logo.png"}
                    alt={trainerProfile.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-red-500/30"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{trainerProfile.name}</h3>
                <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
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
                  <span className="text-gray-400">({trainerProfile.totalReviews || 0} reviews)</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                  <Award className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium">{trainerProfile.experience} experience</p>
                    <p className="text-gray-400 text-sm">Professional Training</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-3 font-medium">Specializations:</p>
                <div className="flex flex-wrap gap-2">
                  {trainerProfile.specializations.map((spec: string, index: number) => (
                    <Badge key={index} className="bg-red-600/20 text-red-300 border-red-500/30 hover:bg-red-600/30 transition-colors">
                      {spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>

              {trainerProfile.bio && (
                <div className="border-t border-gray-700/50 pt-4">
                  <p className="text-sm text-gray-400 mb-2 font-medium">About:</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{trainerProfile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Type */}
            <Card className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/30 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Choose Session Type</h3>
                    <p className="text-gray-400 text-sm">Select the training format that suits you best</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSessionType("personal_training")}
                    className={`group p-6 rounded-xl border-2 transition-colors ${
                      sessionType === "personal_training"
                        ? "border-red-500 bg-red-500/20"
                        : "border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-red-400/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        sessionType === "personal_training" ? "bg-red-500/30" : "bg-gray-700/50"
                      }`}>
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">Personal Training</h4>
                      <p className="text-sm text-gray-400">One-on-one focused session</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setSessionType("group_class")}
                    className={`group p-6 rounded-xl border-2 transition-colors ${
                      sessionType === "group_class"
                        ? "border-red-500 bg-red-500/20"
                        : "border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-red-400/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        sessionType === "group_class" ? "bg-red-500/30" : "bg-gray-700/50"
                      }`}>
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">Group Class</h4>
                      <p className="text-sm text-gray-400">Train with others in a group</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/30 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Select Date</h3>
                    <p className="text-gray-400 text-sm">Choose your preferred session date</p>
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
                            ? "border-red-500 bg-red-500/20 shadow-lg shadow-red-500/25"
                            : "border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-red-400/50"
                        }`}
                      >
                        <div className="text-center">
                          <p className={`text-xs font-medium mb-1 ${
                            isSelected ? "text-red-300" : "text-gray-400 group-hover:text-gray-300"
                          }`}>
                            {dateObj.toLocaleDateString('en', { weekday: 'short' })}
                          </p>
                          <p className={`text-lg font-bold ${
                            isSelected ? "text-white" : "text-gray-300 group-hover:text-white"
                          }`}>
                            {dateObj.getDate()}
                          </p>
                          {isToday && (
                            <div className="w-1 h-1 bg-green-400 rounded-full mx-auto mt-1"></div>
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
              <Card className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/30 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Available Times</h3>
                      <p className="text-gray-400 text-sm">
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
                              ? "border-red-500 bg-red-500/20"
                              : "border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-red-400/50"
                          }`}
                        >
                          <div className="text-center">
                            <Clock className={`h-5 w-5 mx-auto mb-2 ${
                              selectedTimeSlot === slot ? "text-red-400" : "text-gray-400 group-hover:text-red-400"
                            }`} />
                            <p className={`text-sm font-semibold ${
                              selectedTimeSlot === slot ? "text-white" : "text-gray-300 group-hover:text-white"
                            }`}>
                              {slot.startTime}
                            </p>
                            <p className={`text-xs ${
                              selectedTimeSlot === slot ? "text-red-300" : "text-gray-500 group-hover:text-gray-400"
                            }`}>
                              {slot.endTime}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-gray-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-300 mb-2">No Available Slots</h4>
                      <p className="text-gray-500">Try selecting a different date</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/30 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Session Notes</h3>
                    <p className="text-gray-400 text-sm">Optional - Share your goals or requirements</p>
                  </div>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell your trainer about your fitness goals, any injuries, or specific areas you'd like to focus on..."
                  className="w-full p-4 bg-gray-800/30 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 resize-none h-32 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {notes.length}/500 characters
                </p>
              </CardContent>
            </Card>

            {/* Booking Summary & Button */}
            {selectedTimeSlot && (
              <Card className="bg-gradient-to-br from-red-900/20 via-gray-900/60 to-gray-800/60 backdrop-blur-sm border border-red-500/30">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-600/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Booking Summary</h3>
                      <p className="text-gray-400 text-sm">Review your session details</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">Trainer</span>
                      </div>
                      <span className="text-white font-medium">{trainerProfile.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">Date</span>
                      </div>
                      <span className="text-white font-medium">
                        {new Date(selectedDate).toLocaleDateString('en', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">Time</span>
                      </div>
                      <span className="text-white font-medium">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {sessionType === "personal_training" ? (
                          <User className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Users className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="text-gray-300">Type</span>
                      </div>
                      <span className="text-white font-medium capitalize">{sessionType.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-4 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {isBooking ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
