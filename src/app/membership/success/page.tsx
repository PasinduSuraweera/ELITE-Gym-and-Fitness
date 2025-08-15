"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Check, Crown, Loader2, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MembershipSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [membershipCreated, setMembershipCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Query user's membership to show current status
  const membership = useQuery(api.memberships.getUserMembership, 
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (sessionId && user?.id) {
      // Wait for webhook to create membership
      setLoading(false);
      
      // Poll for membership creation (webhook should handle this)
      const pollForMembership = () => {
        if (membership) {
          setMembershipCreated(true);
          setLoading(false);
        } else {
          // If no membership after 10 seconds, show message
          setTimeout(() => {
            if (!membership) {
              setError("Membership is being processed. Please check your profile in a few minutes.");
              setLoading(false);
            }
          }, 10000);
        }
      };
      
      pollForMembership();
    } else if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
    }
  }, [sessionId, user?.id, membership]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-300">Processing your membership...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Processing Membership</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={() => router.push("/membership")} variant="outline">
              Return to Membership Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="bg-green-500 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
              <Check className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Elite Gym!
            </h1>
            <p className="text-xl text-gray-300">
              Your membership has been successfully activated
            </p>
          </div>

          {/* Membership Details */}
          {membership && (
            <Card className="bg-gray-900/50 border-green-500/50 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center justify-center gap-3">
                  <Crown className="h-8 w-8 text-yellow-500" />
                  {membership.membershipType.charAt(0).toUpperCase() + membership.membershipType.slice(1)} Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <p className="text-green-400 font-semibold">Status</p>
                    </div>
                    <p className="text-white text-lg capitalize">{membership.status}</p>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <p className="text-blue-400 font-semibold">Valid Until</p>
                    </div>
                    <p className="text-white text-lg font-semibold">
                      {new Date(membership.currentPeriodEnd).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Membership Duration Info */}
                <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded-lg border border-green-500/20">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Membership Period
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Start Date</p>
                      <p className="text-white">
                        {new Date(membership.currentPeriodStart).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white">
                        {Math.ceil((membership.currentPeriodEnd - membership.currentPeriodStart) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="/profile">View Profile</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/generate-program">Generate Fitness Plan</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-left space-y-2 text-sm text-gray-400 bg-gray-900/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Important Information</h3>
            <p>• Your membership includes access to all gym facilities during operating hours</p>
            <p>• You'll receive an email confirmation with your membership details shortly</p>
            <p>• For any questions, contact our support team or visit the help section</p>
            <p>• Your next billing cycle will begin automatically next month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipSuccessPage;
