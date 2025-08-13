"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { UserLayout } from "@/components/UserLayout";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Shield, Activity, Target, Clock } from "lucide-react";

const ProfilePage = () => {
  const { user } = useUser();
  const userId = user?.id as string;

  const allPlans = useQuery(api.plans.getUserPlans, { userId });
  const userRole = useQuery(api.users.getCurrentUserRole);

  const activePlan = allPlans?.find((plan) => plan.isActive);

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
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Plans</p>
                      <p className="text-2xl font-bold text-white">{allPlans?.length || 0}</p>
                    </div>
                    <Target className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Plans</p>
                      <p className="text-2xl font-bold text-white">{allPlans?.filter(plan => plan.isActive).length || 0}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-lg font-bold text-white">
                        {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Role</p>
                      <p className="text-lg font-bold text-white capitalize">{userRole || 'User'}</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

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
