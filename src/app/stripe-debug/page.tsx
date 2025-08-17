"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StripeDebugPage() {
  const { user } = useUser();
  const [results, setResults] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const createTestBookingSession = async () => {
    setIsLoading(true);
    setResults("🔄 Creating test booking session...");

    try {
      const response = await fetch('/api/create-session-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainerId: "ks72rs5s7kz3tycwjwgk7zf2717nrvns",
          trainerName: "Test Trainer",
          sessionType: "personal_training",
          sessionDate: "2025-08-25",
          startTime: "14:00",
          duration: 60,
          amount: 5000,
          notes: "DEBUG: Testing webhook delivery",
          successUrl: `${window.location.origin}/booking-success`,
          cancelUrl: `${window.location.origin}/book-session/test`,
        }),
      });

      const data = await response.json();
      
      if (data.sessionId) {
        setResults(`✅ Session created: ${data.sessionId}\n📋 URL: ${data.url}\n\n🎯 Now check your Stripe Dashboard:\n1. Go to Payments → Sessions\n2. Find session: ${data.sessionId}\n3. Check if webhook events were sent\n4. Look for "checkout.session.completed" events`);
      } else {
        setResults(`❌ Failed to create session: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResults(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestMembershipSession = async () => {
    setIsLoading(true);
    setResults("🔄 Creating test membership session...");

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: "price_1Rw3ulK3W6wHBRwhyMFmIEbv",
          clerkId: user?.id || "test_user",
          membershipType: "basic",
        }),
      });

      const data = await response.json();
      
      if (data.sessionId) {
        setResults(`✅ Membership session created: ${data.sessionId}\n📋 URL: ${data.url}\n\n🎯 Compare this with booking session in Stripe Dashboard`);
      } else {
        setResults(`❌ Failed to create membership session: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResults(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Please sign in to test Stripe sessions.</div>
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
            Stripe Session Debugging
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Test */}
            <Card className="bg-gray-900/50 border border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Test Booking Session</h2>
                <p className="text-gray-300 mb-4">
                  Create a booking session and check if webhooks are configured properly.
                </p>
                
                <Button
                  onClick={createTestBookingSession}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 mb-4"
                >
                  {isLoading ? "Creating..." : "Create Booking Session"}
                </Button>
              </CardContent>
            </Card>

            {/* Membership Test */}
            <Card className="bg-gray-900/50 border border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Test Membership Session</h2>
                <p className="text-gray-300 mb-4">
                  Create a membership session to compare webhook configuration.
                </p>
                
                <Button
                  onClick={createTestMembershipSession}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                >
                  {isLoading ? "Creating..." : "Create Membership Session"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {results && (
            <Card className="bg-gray-900/50 border border-gray-800 mt-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
                <div className={`p-4 rounded-lg text-sm whitespace-pre-wrap font-mono ${
                  results.includes("✅") ? "bg-green-900/30 text-green-300" : 
                  results.includes("🔄") ? "bg-blue-900/30 text-blue-300" :
                  "bg-red-900/30 text-red-300"
                }`}>
                  {results}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gray-900/50 border border-gray-800 mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Debug Steps</h2>
              <div className="text-gray-300 space-y-3">
                <p className="font-semibold">1. Check Stripe Dashboard:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Go to Developers → Webhooks</li>
                  <li>Check if you have webhook endpoints configured</li>
                  <li>Look for the endpoint URL and events it listens to</li>
                  <li>Check recent delivery attempts</li>
                </ul>
                
                <p className="font-semibold mt-4">2. Compare Session Types:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Create both booking and membership sessions above</li>
                  <li>In Stripe Dashboard, go to Payments → Sessions</li>
                  <li>Find the sessions and compare their webhook events</li>
                  <li>Look for "checkout.session.completed" events</li>
                </ul>

                <p className="font-semibold mt-4">3. Expected Webhook Event:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Event: checkout.session.completed</li>
                  <li>Mode: "payment" (for bookings) or "subscription" (for memberships)</li>
                  <li>Status: Should show successful delivery</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
