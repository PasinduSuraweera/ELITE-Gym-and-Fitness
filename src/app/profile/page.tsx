"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/UserLayout";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Shield, Activity, Target, Clock } from "lucide-react";
import { useMembershipExpiryCheck, getMembershipStatusInfo, formatMembershipDate } from "@/lib/membership-utils";

const ProfilePage = () => {
  const { user } = useUser();
  const userId = user?.id as string;
  const [mounted, setMounted] = useState(false);
  
  // Auto-check for expired memberships
  useMembershipExpiryCheck();

  const allPlans = useQuery(api.plans.getUserPlans, { userId });
  const userRole = useQuery(api.users.getCurrentUserRole);
  const currentMembership = useQuery(
    api.memberships.getUserMembershipWithExpiryCheck,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Get user's recent bookings
  const userBookings = useQuery(
    api.bookings.getUserBookings,
    user?.id ? { userClerkId: user.id } : "skip"
  );
  
  // Get user's own payroll records (for all users including admins)
  const userPayrollRecords = useQuery(
    api.salary.getEmployeePayrollRecords,
    user?.id ? { employeeClerkId: user.id } : "skip"
  );
  
  const cancelMembership = useMutation(api.memberships.cancelMembership);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCancelMembership = async () => {
    if (!user?.id) return;
    
    console.log("🔍 Cancel button clicked for user:", user.id);
    console.log("🔍 Current membership before cancel:", currentMembership);
    
    if (!confirm('Are you sure you want to cancel your membership?\n\nThis will:\n• Cancel your Stripe subscription\n• Stop future billing\n• You\'ll keep access until your current billing period ends\n\nThis action cannot be undone.')) {
      return;
    }
    
    try {
      console.log("🚫 User cancelling their own membership:", user.id);
      const result = await cancelMembership({ clerkId: user.id });
      console.log("✅ Cancel membership result:", result);
      alert('✅ Your membership has been cancelled successfully.\n\nYour membership will remain active until the end of your current billing period. No further charges will be made.');
    } catch (error) {
      console.error("❌ Error cancelling membership:", error);
      alert("❌ Error cancelling membership. Please contact support if this issue persists.");
    }
  };

  // Check if membership is expired or expiring soon
  const getMembershipStatus = (membership: any) => {
    if (!mounted || !membership) return null;
    
    const now = new Date().getTime();
    const endDate = new Date(membership.currentPeriodEnd).getTime();
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    if (membership.status !== 'active') {
      return { status: 'inactive', message: 'Membership Inactive', color: 'red' };
    } else if (daysRemaining < 0) {
      return { status: 'expired', message: 'Membership Expired', color: 'red' };
    } else if (daysRemaining <= 7) {
      return { status: 'expiring', message: `Expires in ${daysRemaining} days`, color: 'yellow' };
    } else if (daysRemaining <= 30) {
      return { status: 'active', message: `${daysRemaining} days remaining`, color: 'orange' };
    } else {
      return { status: 'active', message: 'Active Membership', color: 'green' };
    }
  };

  // Format date consistently on client side only
  const formatDate = (date: number | Date | null | undefined) => {
    if (!mounted || !date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatYear = (date: number | Date | null | undefined) => {
    if (!mounted || !date) return 'N/A';
    try {
      return new Date(date).getFullYear().toString();
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number) => {
    if (!mounted) return 'Rs. 0';
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const activePlan = allPlans?.find((plan) => plan.isActive);

  // Shared profile content for both admin and regular users
  const profileContentForUser = () => (
    <>
      {/* Membership Status - Always show this regardless of plans */}
      {currentMembership && (
        <Card className={`bg-card/50 mb-6 ${
          (currentMembership.status === 'cancelled' || 
           (currentMembership.status === 'active' && currentMembership.cancelAtPeriodEnd)) ? 'border-orange-500/50' : 
          currentMembership.status === 'expired' ? 'border-red-500/50' : 
          'border-green-500/50'
        }`}>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className={`h-6 w-6 ${
                (currentMembership.status === 'cancelled' || 
                 (currentMembership.status === 'active' && currentMembership.cancelAtPeriodEnd)) ? 'text-orange-500' : 
                currentMembership.status === 'expired' ? 'text-red-500' : 
                'text-green-500'
              }`} />
              {(currentMembership.status === 'active' && currentMembership.cancelAtPeriodEnd) ? 'Cancelling Membership' :
               currentMembership.status === 'cancelled' ? 'Cancelled Membership' : 
               currentMembership.status === 'expired' ? 'Expired Membership' : 
               'Current Membership'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan Type</p>
                <p className="text-foreground font-semibold capitalize">
                  {currentMembership.membershipType} Plan
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {(() => {
                  const statusInfo = getMembershipStatusInfo(currentMembership);
                  if (!statusInfo) return <span className="text-muted-foreground">Loading...</span>;
                  
                  const colorClasses = {
                    green: 'text-green-400',
                    yellow: 'text-yellow-400', 
                    orange: 'text-orange-400',
                    red: 'text-red-400'
                  };

                  return (
                    <p className={`font-semibold ${colorClasses[statusInfo.color as keyof typeof colorClasses] || 'text-muted-foreground'}`}>
                      {statusInfo.message}
                    </p>
                  );
                })()}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-foreground font-semibold">
                  {formatMembershipDate(currentMembership.currentPeriodStart)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="text-foreground font-semibold">
                  {formatMembershipDate(currentMembership.currentPeriodEnd)}
                </p>
              </div>
            </div>
            
            {/* Progress Bar for Active Memberships */}
            {(() => {
              if (currentMembership.status !== 'active') return null;
              
              const now = new Date().getTime();
              const start = new Date(currentMembership.currentPeriodStart).getTime();
              const end = new Date(currentMembership.currentPeriodEnd).getTime();
              const total = end - start;
              const elapsed = now - start;
              const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
              
              return (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Membership Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress > 80 ? 'bg-red-500' :
                        progress > 60 ? 'bg-orange-500' :
                        progress > 40 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}
            
            {/* Cancel Membership Button or Status Info */}
            {currentMembership.status === 'active' && !currentMembership.cancelAtPeriodEnd && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Need to cancel your membership?</p>
                    <p className="text-xs text-muted-foreground">Your membership will remain active until the end of your billing period</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelMembership}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Membership
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!currentMembership && (
        <Card className="bg-card/50 border-yellow-500/50 mb-6">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Active Membership</h3>
            <p className="text-muted-foreground mb-4">
              Get access to premium features and facilities with our membership plans
            </p>
            <Button 
              onClick={() => window.location.href = '/membership'}
              className="bg-primary hover:bg-primary/90"
            >
              View Membership Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fitness Plans Section */}
      {allPlans && allPlans.length > 0 ? (
        <>
          {/* Active Plan Preview */}
          {activePlan ? (
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Active Fitness Plan
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your current active fitness program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{activePlan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Schedule: {activePlan.workoutPlan.schedule.join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Daily Calories</p>
                      <p className="text-xl font-bold text-primary">{activePlan.dietPlan.dailyCalories}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      asChild 
                      className=""
                    >
                      <a href="/profile/fitness-plans">View Workout Plan</a>
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      className=""
                    >
                      <a href="/profile/diet-plans">View Diet Plan</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-8 text-center">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Active Plan</h3>
                <p className="text-muted-foreground mb-6">
                  Get started with a personalized fitness and diet plan tailored to your goals.
                </p>
                <Button 
                  asChild 
                  className=""
                >
                  <a href="/generate-program">Generate Your Plan</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Show NoFitnessPlan when user has no plans */
        <NoFitnessPlan />
      )}
    </>
  );

  // Show loading state during hydration
  if (!mounted) {
    return (
      <UserLayout 
        title="Profile Overview" 
        subtitle="Manage your account and view your fitness journey"
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-card rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout 
      title="Profile Overview" 
      subtitle="Manage your account and view your fitness journey"
    >
      <div className="space-y-6">
        {/* Original Profile Header with Picture */}
        <ProfileHeader user={user} />

        {/* User Profile Card - Always show this */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="text-foreground font-semibold capitalize">{userRole || 'User'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-foreground font-semibold">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-foreground font-semibold">{allPlans?.filter(plan => plan.isActive).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rest of profile content */}
        {profileContentForUser()}
      </div>
    </UserLayout>
  );
};
export default ProfilePage;
