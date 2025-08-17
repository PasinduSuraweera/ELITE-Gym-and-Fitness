"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TestBookingPage() {
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<string>("");

  // Get trainers to use in test
  const trainers = useQuery(api.trainerProfiles.getActiveTrainers, {});
  
  // Get user bookings
  const userBookings = useQuery(
    api.bookings.getUserBookings,
    user?.id ? { userClerkId: user.id } : "skip"
  );

  const createTestBooking = useMutation(api.bookings.createTestBooking);

  const handleCreateTestBooking = async () => {
    if (!user || !trainers || trainers.length === 0) {
      setResult("User not logged in or no trainers available");
      return;
    }

    setIsCreating(true);
    try {
      const bookingId = await createTestBooking({
        userClerkId: user.id,
        trainerId: trainers[0]._id,
        sessionType: "personal_training",
        sessionDate: "2025-08-20",
        startTime: "14:00",
        duration: 60,
        totalAmount: 5000, // LKR 5000
      });
      
      setResult(`✅ Test booking created successfully! ID: ${bookingId}`);
    } catch (error) {
      console.error("Error creating test booking:", error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Please sign in to test booking creation.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black"></div>
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Test Booking Creation
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Creation */}
            <Card className="bg-gray-900/50 border border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Create Test Booking</h2>
                <p className="text-gray-300 mb-4">
                  This will create a test booking to verify the database connection works.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">User: {user.fullName || user.emailAddresses[0]?.emailAddress}</p>
                    <p className="text-sm text-gray-400">Available Trainers: {trainers?.length || 0}</p>
                  </div>
                  
                  <Button
                    onClick={handleCreateTestBooking}
                    disabled={isCreating || !trainers || trainers.length === 0}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isCreating ? "Creating..." : "Create Test Booking"}
                  </Button>
                  
                  {result && (
                    <div className={`p-3 rounded-lg text-sm ${
                      result.includes("✅") ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"
                    }`}>
                      {result}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Bookings */}
            <Card className="bg-gray-900/50 border border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Current Bookings</h2>
                
                {userBookings && userBookings.length > 0 ? (
                  <div className="space-y-3">
                    {userBookings.map((booking) => (
                      <div key={booking._id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{booking.trainerName}</p>
                            <p className="text-gray-400 text-sm">
                              {booking.sessionDate} • {booking.startTime}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {booking.sessionType} • LKR {booking.totalAmount.toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.status === "confirmed" ? "bg-green-900/30 text-green-300" :
                            booking.status === "pending" ? "bg-yellow-900/30 text-yellow-300" :
                            "bg-gray-900/30 text-gray-300"
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No bookings found</p>
                    <p className="text-gray-500 text-sm mt-2">Create a test booking to see it appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              This page is for testing only. In production, bookings are created via Stripe webhooks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
