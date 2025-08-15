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
  const cancelMembership = useMutation(api.memberships.cancelMembership);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCancelMembership = async () => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to cancel your membership? This action cannot be undone and your membership will remain active until the end of your current billing period.')) {
      return;
    }
    
    try {
      await cancelMembership({ clerkId: user.id });
      alert('Your membership has been cancelled successfully. It will remain active until the end of your current billing period.');
    } catch (error) {
      console.error("Error cancelling membership:", error);
      alert("Error cancelling membership. Please contact support.");
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

  const activePlan = allPlans?.find((plan) => plan.isActive);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <UserLayout 
        title="Profile Overview" 
        subtitle="Manage your account and view your fitness journey"
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-800 rounded-lg"></div>
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

        {allPlans && allPlans.length > 0 ? (
          <>
            {/* User Profile Card - Simplified since we have ProfileHeader */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-400">Role</p>
                      <p className="text-white font-semibold capitalize">{userRole || 'User'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-white font-semibold">
                        {formatDate(user?.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Active Plans</p>
                      <p className="text-white font-semibold">{allPlans?.filter(plan => plan.isActive).length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Membership Status */}
            {currentMembership && (
              <Card className={`bg-gray-900/50 mb-6 ${
                (currentMembership.status === 'cancelled' || 
                 (currentMembership.status === 'active' && currentMembership.cancelAtPeriodEnd)) ? 'border-orange-500/50' : 
                currentMembership.status === 'expired' ? 'border-red-500/50' : 
                'border-green-500/50'
              }`}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
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
                      <p className="text-sm text-gray-400">Plan Type</p>
                      <p className="text-white font-semibold capitalize">
                        {currentMembership.membershipType} Plan
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      {(() => {
                        const statusInfo = getMembershipStatusInfo(currentMembership);
                        if (!statusInfo) return <span className="text-gray-400">Loading...</span>;
                        
                        const colorClasses = {
                          green: 'bg-green-900/50 text-green-400 border-green-500/50',
                          yellow: 'bg-yellow-900/50 text-yellow-400 border-yellow-500/50',
                          orange: 'bg-orange-900/50 text-orange-400 border-orange-500/50',
                          red: 'bg-red-900/50 text-red-400 border-red-500/50'
                        };
                        
                        return (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[statusInfo.color as keyof typeof colorClasses]}`}>
                            {statusInfo.message}
                          </span>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Valid From</p>
                      <p className="text-white font-semibold">
                        {formatMembershipDate(currentMembership.currentPeriodStart)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Valid Until</p>
                      <p className="text-white font-semibold">
                        {formatMembershipDate(currentMembership.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar for Membership Period */}
                  {(() => {
                    if (!mounted) return null;
                    
                    const now = new Date().getTime();
                    const start = new Date(currentMembership.currentPeriodStart).getTime();
                    const end = new Date(currentMembership.currentPeriodEnd).getTime();
                    const total = end - start;
                    const elapsed = now - start;
                    const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
                    
                    return (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Membership Progress</span>
                          <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress > 90 ? 'bg-red-500' : 
                              progress > 75 ? 'bg-yellow-500' : 
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
                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Need to cancel your membership?</p>
                          <p className="text-xs text-gray-500">Your membership will remain active until the end of your billing period</p>
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
                  
                  {currentMembership.status === 'active' && currentMembership.cancelAtPeriodEnd && (
                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-orange-500" />
                          <span className="text-orange-400 font-semibold">Membership Cancelling</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Your membership has been cancelled but will remain active until the end of your current billing period.
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          You can continue using gym facilities until {formatMembershipDate(currentMembership.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {currentMembership.status === 'cancelled' && (
                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-red-500" />
                          <span className="text-red-400 font-semibold">Membership Cancelled</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Your membership has been cancelled and is no longer active.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!currentMembership && (
              <Card className="bg-gray-900/50 border-yellow-500/50 mb-6">
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Membership</h3>
                  <p className="text-gray-400 mb-4">
                    Get access to premium features and facilities with our membership plans
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/membership'}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    View Membership Plans
                  </Button>
                </CardContent>
              </Card>
            )}


            {/* Active Plan Preview */}
            {activePlan ? (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Active Fitness Plan
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your current active fitness program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-gray-700">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{activePlan.name}</h3>
                        <p className="text-sm text-gray-400">
                          Schedule: {activePlan.workoutPlan.schedule.join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Daily Calories</p>
                        <p className="text-xl font-bold text-red-500">{activePlan.dietPlan.dailyCalories}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button 
                        asChild 
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <a href="/profile/fitness-plans">View Workout Plan</a>
                      </Button>
                      <Button 
                        asChild 
                        variant="outline" 
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <a href="/profile/diet-plans">View Diet Plan</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Target className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Plan</h3>
                  <p className="text-gray-400 mb-6">
                    Get started with a personalized fitness and diet plan tailored to your goals.
                  </p>
                  <Button 
                    asChild 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <a href="/generate-program">Generate Your Plan</a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* All Plans Preview */}
            {allPlans && allPlans.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">All Your Plans</CardTitle>
                  <CardDescription className="text-gray-400">
                    Quick access to all your generated fitness and diet plans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allPlans.map((plan) => (
                      <div
                        key={plan._id}
                        className={`p-4 rounded-lg border transition-colors ${
                          plan.isActive
                            ? 'bg-green-600/10 border-green-500/30'
                            : 'bg-gray-800/50 border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{plan.name}</h4>
                          {plan.isActive && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          {plan.workoutPlan.schedule.length} workout days • {plan.dietPlan.dailyCalories} cal/day
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            asChild 
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <a href="/profile/fitness-plans">Workout</a>
                          </Button>
                          <Button 
                            asChild 
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <a href="/profile/diet-plans">Diet</a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plan Status - Real Data Only */}
            {activePlan && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Current Activity</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your active fitness plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-black/50 rounded-lg border border-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Following: {activePlan.name}</p>
                      <p className="text-sm text-gray-400">
                        {activePlan.workoutPlan?.exercises?.length || 0} workout days • Active plan
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Show NoFitnessPlan when user has no plans */
          <NoFitnessPlan />
        )}
      </div>
    </UserLayout>
  );
};
export default ProfilePage;
