"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Calendar, ArrowRight, Home, User, Clock, DollarSign } from "lucide-react";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Get recent bookings for this user to show booking details
  const userBookings = useQuery(
    api.bookings.getUserBookings,
    user?.id ? { userClerkId: user.id } : "skip"
  );

  // Get specific booking if booking_id is provided
  const specificBooking = useQuery(
    api.bookings.getBookingById,
    bookingId ? { bookingId: bookingId as any } : "skip"
  );

  // Use specific booking if available, otherwise use the most recent booking
  const displayBooking = specificBooking || userBookings?.[0];

  useEffect(() => {
    const session_id = searchParams.get("session_id");
    const booking_id = searchParams.get("booking_id");
    setSessionId(session_id);
    setBookingId(booking_id);
  }, [searchParams]);

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black"></div>
      <div className="container mx-auto px-4 py-16 relative z-10 flex-1 flex items-center justify-center">
        <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-3">Booking Confirmed!</h1>
            <p className="text-gray-300 text-lg">
              {sessionId ? 
                "Your training session has been successfully booked and payment processed." :
                "Your training session has been successfully booked with your membership."
              }
            </p>
          </div>

          {/* Booking Details */}
          {displayBooking ? (
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-500" />
                Booking Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Trainer:</span>
                  <span className="text-white font-medium">{displayBooking.trainerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{formatDate(displayBooking.sessionDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">
                    {formatTime(displayBooking.startTime)} - {formatTime(displayBooking.endTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Session Type:</span>
                  <span className="text-white capitalize">
                    {displayBooking.sessionType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Payment Status:</span>
                  <span className={`font-semibold ${
                    displayBooking.paymentStatus === "paid" ? "text-green-400" : "text-blue-400"
                  }`}>
                    {displayBooking.paymentStatus === "paid" ? "Paid" : "Included with Membership"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-500" />
                Booking Confirmed
              </h3>
              <p className="text-gray-300">
                Your booking has been confirmed! You'll receive an email with all the details shortly.
              </p>
            </div>
          )}

          <div className="bg-gray-800/30 rounded-lg p-6 mb-8 border border-gray-700">
            <h3 className="text-white font-medium mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-gray-300 text-sm">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                <span>You'll receive a confirmation email shortly with all the session details</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 text-sm">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                <span>Your trainer will contact you 24 hours before the session</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300 text-sm">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                <span>View and manage all your bookings in your profile dashboard</span>
              </div>
            </div>
          </div>

          {sessionId && (
            <div className="mb-6 text-center">
              <p className="text-xs text-gray-400 mb-1">Payment Reference</p>
              <p className="text-sm text-white font-mono bg-gray-800/50 px-3 py-2 rounded border border-gray-700">
                {sessionId.slice(-12).toUpperCase()}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/profile")}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View My Bookings
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
