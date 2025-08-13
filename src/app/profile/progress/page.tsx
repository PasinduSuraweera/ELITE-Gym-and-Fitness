"use client";

import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Target, TrendingUp, Calendar, Clock, Zap, Award, BarChart3 } from "lucide-react";

const ProgressPage = () => {
  return (
    <UserLayout 
      title="Progress Tracking" 
      subtitle="Monitor your fitness journey and achievements"
    >
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Progress Tracking</p>
                  <p className="text-2xl font-bold text-white">Coming Soon</p>
                  <p className="text-xs text-gray-400">Feature in development</p>
                </div>
                <Target className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Workout Tracking</p>
                  <p className="text-2xl font-bold text-white">TBD</p>
                  <p className="text-xs text-gray-400">Track your workouts</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Time Tracking</p>
                  <p className="text-2xl font-bold text-white">TBD</p>
                  <p className="text-xs text-gray-400">Hours exercised</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Achievements</p>
                  <p className="text-2xl font-bold text-white">TBD</p>
                  <p className="text-xs text-gray-400">Goals reached</p>
                </div>
                <Zap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Features - Coming Soon */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-500" />
              Progress Tracking
            </CardTitle>
            <CardDescription className="text-gray-400">
              Comprehensive progress tracking features coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Progress Tracking Coming Soon</h3>
              <p className="text-gray-400 mb-6">
                We're working on advanced progress tracking features including workout logs, 
                achievements, and detailed analytics to help you monitor your fitness journey.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-black/50 rounded-lg border border-gray-700">
                  <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Workout Analytics</p>
                </div>
                <div className="p-4 bg-black/50 rounded-lg border border-gray-700">
                  <Award className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Achievement System</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            asChild 
            className="bg-red-600 hover:bg-red-700"
          >
            <a href="/profile/fitness-plans">View Workout Plans</a>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <a href="/profile/diet-plans">Check Diet Plans</a>
          </Button>
        </div>
      </div>
    </UserLayout>
  );
};

export default ProgressPage;
