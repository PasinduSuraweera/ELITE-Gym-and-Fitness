"use client";

import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Target, TrendingUp, Calendar, Clock, Zap, Award, BarChart3 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ProgressPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during auth check or hydration
  if (!mounted || !isLoaded) {
    return (
      <UserLayout 
        title="Progress Tracking" 
        subtitle="Monitor your fitness journey and achievements"
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-card rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <UserLayout 
      title="Progress Tracking" 
      subtitle="Monitor your fitness journey and achievements"
    >
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress Tracking</p>
                  <p className="text-2xl font-bold text-foreground">Coming Soon</p>
                  <p className="text-xs text-muted-foreground">Feature in development</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workout Tracking</p>
                  <p className="text-2xl font-bold text-foreground">TBD</p>
                  <p className="text-xs text-muted-foreground">Track your workouts</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Time Tracking</p>
                  <p className="text-2xl font-bold text-foreground">TBD</p>
                  <p className="text-xs text-muted-foreground">Hours exercised</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold text-foreground">TBD</p>
                  <p className="text-xs text-muted-foreground">Goals reached</p>
                </div>
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Features - Coming Soon */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Progress Tracking
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Comprehensive progress tracking features coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Progress Tracking Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                We're working on advanced progress tracking features including workout logs, 
                achievements, and detailed analytics to help you monitor your fitness journey.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-card rounded-lg border border-border">
                  <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-foreground">Workout Analytics</p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border">
                  <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-foreground">Achievement System</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            asChild 
            className="bg-primary hover:bg-primary/90"
          >
            <a href="/profile/fitness-plans">View Workout Plans</a>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            className="border-border text-foreground hover:bg-accent"
          >
            <a href="/profile/diet-plans">Check Diet Plans</a>
          </Button>
        </div>
      </div>
    </UserLayout>
  );
};

export default ProgressPage;
