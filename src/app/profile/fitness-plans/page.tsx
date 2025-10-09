"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DumbbellIcon, CalendarIcon, Clock, Target, Activity, Calendar, Download } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FitnessPlansPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const userId = user?.id as string;
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

  const allPlans = useQuery(api.plans.getUserPlans, { userId });
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);

  const activePlan = allPlans?.find((plan) => plan.isActive);

  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  // Download fitness plan as PDF-style image
  const downloadFitnessPlan = (plan: any) => {
    if (!plan) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'hsl(222.2, 84%, 4.9%)');
    gradient.addColorStop(1, 'hsl(217.2, 32.6%, 17.5%)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ELITE GYM & FITNESS', canvas.width / 2, 50);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
    ctx.fillText('FITNESS PLAN', canvas.width / 2, 80);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.fillText(plan.name, canvas.width / 2, 110);

    // Plan info
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
    ctx.fillText(`Schedule: ${plan.workoutPlan.schedule.join(', ')}`, 40, 160);
    
    const totalExercises = plan.workoutPlan.exercises.reduce((total: number, day: any) => total + day.routines.length, 0);
    ctx.fillText(`Total Exercises: ${totalExercises}`, 40, 185);

    // Workouts
    let yPos = 230;
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.fillText('WORKOUT SCHEDULE', 40, yPos);
    yPos += 40;

    plan.workoutPlan.exercises.forEach((exerciseDay: any, dayIndex: number) => {
      if (yPos > 1100) return; // Prevent overflow
      
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
      ctx.fillText(`${exerciseDay.day} (${exerciseDay.routines.length} exercises)`, 40, yPos);
      yPos += 30;

      exerciseDay.routines.forEach((routine: any, routineIndex: number) => {
        if (yPos > 1100) return;
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = 'hsl(210, 40%, 98%)';
        ctx.fillText(`${routineIndex + 1}. ${routine.name}`, 60, yPos);
        yPos += 20;

        ctx.font = '11px Arial';
        ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
        const details = [];
        if (routine.sets) details.push(`${routine.sets} sets`);
        if (routine.reps) details.push(`${routine.reps} reps`);
        if (routine.duration) details.push(routine.duration);
        
        if (details.length > 0) {
          ctx.fillText(`${details.join(' • ')}`, 80, yPos);
          yPos += 15;
        }

        if (routine.description) {
          ctx.font = '10px Arial';
          ctx.fillStyle = 'hsl(210, 40%, 98%)';
          const words = routine.description.split(' ');
          let line = '';
          for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 650 && line) {
              ctx.fillText(line.trim(), 80, yPos);
              line = word + ' ';
              yPos += 12;
            } else {
              line = testLine;
            }
          }
          if (line.trim()) {
            ctx.fillText(line.trim(), 80, yPos);
            yPos += 12;
          }
        }
        yPos += 10;
      });
      yPos += 20;
    });

    // Footer
    ctx.font = '10px Arial';
    ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
    ctx.textAlign = 'center';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, 1180);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fitness-plan-${plan.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // Show loading state during auth check or hydration
  if (!mounted || !isLoaded) {
    return (
      <UserLayout 
        title="Fitness Plans" 
        subtitle="Manage your workout routines and training programs"
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
      title="Fitness Plans" 
      subtitle="Manage your workout routines and track your progress"
    >
      <div className="space-y-6">
        {allPlans && allPlans?.length > 0 ? (
          <>
            {/* Plan Selector */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Your Fitness Plans
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Select a plan to view detailed workout routines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {allPlans.map((plan) => (
                    <Button
                      key={plan._id}
                      onClick={() => setSelectedPlanId(plan._id)}
                      className={`text-foreground border transition-all duration-300 rounded-lg ${
                        selectedPlanId === plan._id
                          ? "bg-primary/20 text-primary border-primary shadow-primary/25"
                          : "bg-card/50 border-border hover:border-primary/50 hover:bg-primary/10"
                      }`}
                    >
                      {plan.name}
                      {plan.isActive && (
                        <span className="ml-2 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                          ACTIVE
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plan Details */}
            {currentPlan && (
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <DumbbellIcon className="h-5 w-5 text-primary" />
                        {currentPlan.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground flex items-center gap-2 mt-2">
                        <CalendarIcon className="h-4 w-4" />
                        Schedule: {currentPlan.workoutPlan.schedule.join(", ")}
                      </CardDescription>
                    </div>
                    {currentPlan.isActive && (
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 text-sm font-medium">
                        Active Plan
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Schedule Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border">
                        <Calendar className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Workout Days</p>
                          <p className="text-foreground font-semibold">{currentPlan.workoutPlan.schedule.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border">
                        <Activity className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Exercises</p>
                          <p className="text-foreground font-semibold">
                            {currentPlan.workoutPlan.exercises.reduce((total, day) => total + day.routines.length, 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border">
                        <Clock className="h-8 w-8 text-orange-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Est. Duration</p>
                          <p className="text-foreground font-semibold">45-60 min</p>
                        </div>
                      </div>
                    </div>

                    {/* Workout Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Workout Schedule</h3>
                      <Accordion type="multiple" className="space-y-4">
                        {currentPlan.workoutPlan.exercises.map((exerciseDay, index) => (
                          <AccordionItem
                            key={index}
                            value={exerciseDay.day}
                            className="border border-border rounded-lg overflow-hidden bg-card/30"
                          >
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/10 font-mono text-foreground">
                              <div className="flex justify-between w-full items-center">
                                <span className="text-primary font-bold">{exerciseDay.day}</span>
                                <div className="text-xs text-muted-foreground bg-card/50 px-2 py-1 rounded">
                                  {exerciseDay.routines.length} EXERCISES
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="pb-6 px-6">
                              <div className="space-y-4 mt-4">
                                {exerciseDay.routines.map((routine, routineIndex) => (
                                  <div
                                    key={routineIndex}
                                    className="border border-border rounded-lg p-4 bg-card/50 shadow-lg"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <h4 className="font-semibold text-foreground text-lg">
                                        {routine.name}
                                      </h4>
                                      <div className="flex items-center gap-3">
                                        {routine.sets && (
                                          <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-mono border border-primary/30">
                                            {routine.sets} SETS
                                          </div>
                                        )}
                                        {routine.reps && (
                                          <div className="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-sm font-mono border border-orange-500/30">
                                            {routine.reps} REPS
                                          </div>
                                        )}
                                        {routine.duration && (
                                          <div className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-sm font-mono border border-blue-500/30">
                                            {routine.duration}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {routine.description && (
                                      <p className="text-sm text-foreground mt-2 bg-card/30 p-3 rounded border border-border">
                                        {routine.description}
                                      </p>
                                    )}
                                    {routine.exercises && routine.exercises.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-sm text-muted-foreground mb-2">Exercises:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {routine.exercises.map((exercise, exerciseIndex) => (
                                            <span
                                              key={exerciseIndex}
                                              className="text-xs bg-card/50 text-foreground px-2 py-1 rounded border border-border"
                                            >
                                              {exercise}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => downloadFitnessPlan(currentPlan)}
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Plan
                      </Button>
                      <Button 
                        onClick={() => window.location.href = '/generate-program'}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Generate New Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="bg-card/50 border-border">
            <CardContent className="p-8 text-center">
              <DumbbellIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Fitness Plans</h3>
              <p className="text-muted-foreground mb-6">
                Get started with a personalized workout plan tailored to your fitness goals.
              </p>
              <Button 
                onClick={() => window.location.href = '/generate-program'}
                className="bg-primary hover:bg-primary/90"
              >
                Generate Your First Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
};

export default FitnessPlansPage;
