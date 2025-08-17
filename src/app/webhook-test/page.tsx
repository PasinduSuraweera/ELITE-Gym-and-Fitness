"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function WebhookTestPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string>("");

  // Get data for testing
  const users = useQuery(api.users.getAllUsers, {});
  const trainers = useQuery(api.trainerProfiles.getActiveTrainers, {});
  const userBookings = useQuery(
    api.bookings.getUserBookings,
    user?.id ? { userClerkId: user.id } : "skip"
  );

  const testBookingWebhook = async () => {
    if (!user || !trainers || trainers.length === 0) {
      setResults("❌ User not logged in or no trainers available");
      return;
    }

    setIsLoading(true);
    setResults("🔄 Testing booking webhook simulation...");

    try {
      // Simulate a Stripe webhook payload
      const mockWebhookPayload = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_" + Date.now(),
            mode: "payment",
            payment_status: "paid",
            amount_total: 500000, // LKR 5000 in paisa
            metadata: {
              userId: user.id,
              trainerId: trainers[0]._id,
              sessionType: "personal_training",
              sessionDate: "2025-08-25",
              startTime: "14:00",
              duration: "60",
              notes: "Test booking from webhook simulation"
            }
          }
        }
      };

      const response = await fetch('/api/stripe-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'test-signature-for-development',
        },
        body: JSON.stringify(mockWebhookPayload),
      });

      if (response.ok) {
        setResults("✅ Webhook processed successfully! Check Convex dashboard for new booking.");
      } else {
        const errorText = await response.text();
        setResults(`❌ Webhook failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Test error:", error);
      setResults(`❌ Test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Please sign in to test webhook.</div>
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
            Webhook Testing Dashboard
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Info */}
            <Card className="bg-gray-900/50 border border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current User:</span>
                    <span className="text-white">{user.fullName || user.emailAddresses[0]?.emailAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clerk ID:</span>
                    <span className="text-white font-mono text-xs">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Users:</span>
                    <span className="text-white">{users?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Trainers:</span>
                    <span className="text-white">{trainers?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User Bookings:</span>
                    <span className="text-white">{userBookings?.length || 0}</span>
                  </div>
                </div>
                
                {trainers && trainers.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-800/50 rounded">
                    <p className="text-xs text-gray-400 mb-1">Test Trainer:</p>
                    <p className="text-white font-medium">{trainers[0].name}</p>
                    <p className="text-xs text-gray-400 font-mono">{trainers[0]._id}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Actions */}
            <Card className="bg-gray-900/50 border border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Webhook Testing</h2>
                <p className="text-gray-300 mb-4">
                  This will simulate a Stripe webhook for a trainer booking payment.
                </p>
                
                <Button
                  onClick={testBookingWebhook}
                  disabled={isLoading || !trainers || trainers.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 mb-4"
                >
                  {isLoading ? "Testing..." : "Test Booking Webhook"}
                </Button>
                
                {results && (
                  <div className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                    results.includes("✅") ? "bg-green-900/30 text-green-300" : 
                    results.includes("🔄") ? "bg-blue-900/30 text-blue-300" :
                    "bg-red-900/30 text-red-300"
                  }`}>
                    {results}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          {userBookings && userBookings.length > 0 && (
            <Card className="bg-gray-900/50 border border-gray-800 mt-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Bookings</h2>
                <div className="space-y-3">
                  {userBookings.slice(0, 5).map((booking, index) => (
                    <div key={index} className="bg-gray-800/50 p-3 rounded border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">
                            {booking.sessionType.replace('_', ' ').toUpperCase()} Session
                          </p>
                          <p className="text-gray-400 text-sm">
                            {booking.sessionDate} at {booking.startTime}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Payment: {booking.paymentSessionId}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${
                            booking.status === 'confirmed' ? 'bg-green-600/20 text-green-300' :
                            booking.status === 'pending' ? 'bg-yellow-600/20 text-yellow-300' :
                            'bg-gray-600/20 text-gray-300'
                          }`}>
                            {booking.status}
                          </span>
                          <p className="text-white font-medium mt-1">
                            LKR {booking.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
