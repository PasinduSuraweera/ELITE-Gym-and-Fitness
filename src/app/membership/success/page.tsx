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
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-32 relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Processing your membership...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-32 relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6 max-w-md">
              <h2 className="text-xl font-bold text-destructive mb-2">Error Processing Membership</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push("/membership")} variant="outline">
                Return to Membership Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10" suppressHydrationWarning>
        <div className="max-w-2xl mx-auto text-center" suppressHydrationWarning>
          {/* Success Animation */}
          <div className="mb-8" suppressHydrationWarning>
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 shadow-lg border border-primary/30">
              <Check className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              <span className="text-foreground">Welcome to </span>
              <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Elite Gym!
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Your membership has been successfully activated
            </p>
          </div>

          {/* Membership Details */}
          {membership && (
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/30 shadow-lg mb-8" suppressHydrationWarning>
              <CardHeader>
                <CardTitle className="text-2xl text-foreground flex items-center justify-center gap-3">
                  <Crown className="h-8 w-8 text-primary" />
                  {membership.membershipType.charAt(0).toUpperCase() + membership.membershipType.slice(1)} Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-primary" />
                      <p className="text-primary font-semibold">Status</p>
                    </div>
                    <p className="text-foreground text-lg capitalize">{membership.status}</p>
                  </div>
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p className="text-primary font-semibold">Valid Until</p>
                    </div>
                    <p className="text-foreground text-lg font-semibold">
                      {new Date(membership.currentPeriodEnd).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Membership Duration Info */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Membership Period
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="text-foreground">
                        {new Date(membership.currentPeriodStart).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="text-foreground">
                        {Math.ceil((membership.currentPeriodEnd - membership.currentPeriodStart) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8" suppressHydrationWarning>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
              <Link href="/profile">View Profile</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/50 text-foreground hover:bg-primary/10 font-semibold transition-all duration-300">
              <Link href="/generate-program">Generate Fitness Plan</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-left space-y-2 text-sm text-muted-foreground bg-card/30 backdrop-blur-sm border border-border/50 p-6 rounded-lg" suppressHydrationWarning>
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Important Information</h3>
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
