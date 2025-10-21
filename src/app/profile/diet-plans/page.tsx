"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppleIcon, Target, Utensils, Calculator, Clock, Download } from "lucide-react";

const DietPlansPage = () => {
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

  const allPlans = useQuery(
    api.plans.getUserPlans, 
    user?.id ? { userId: user.id } : "skip"
  );
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);

  const activePlan = allPlans?.find((plan) => plan.isActive);

  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  // Download diet plan as PDF-style image
  const downloadDietPlan = (plan: any) => {
    if (!plan) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
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
    ctx.fillText('DIET PLAN', canvas.width / 2, 80);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.fillText(plan.name, canvas.width / 2, 110);

    // Plan info
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
    ctx.fillText(`Daily Calories: ${plan.dietPlan.dailyCalories}`, 40, 160);
    ctx.fillText(`Total Meals: ${plan.dietPlan.meals.length}`, 40, 190);

    // Meals
    let yPos = 240;
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.fillText('MEAL SCHEDULE', 40, yPos);
    yPos += 40;

    plan.dietPlan.meals.forEach((meal: any, index: number) => {
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
      ctx.fillText(`${index + 1}. ${meal.name}`, 40, yPos);
      yPos += 25;
      
      ctx.font = '12px Arial';
      ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
      const calories = Math.round(plan.dietPlan.dailyCalories / plan.dietPlan.meals.length);
      ctx.fillText(`Estimated: ${calories} calories`, 60, yPos);
      yPos += 20;

      ctx.font = '11px Arial';
      ctx.fillStyle = 'hsl(210, 40%, 98%)';
      meal.foods.forEach((food: string, foodIndex: number) => {
        if (yPos > 950) return; // Prevent overflow
        ctx.fillText(`• ${food}`, 60, yPos);
        yPos += 15;
      });
      yPos += 10;
    });

    // Footer
    ctx.font = '10px Arial';
    ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
    ctx.textAlign = 'center';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, 980);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diet-plan-${plan.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
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
        title="Diet Plans" 
        subtitle="Manage your nutrition plans and meal schedules"
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
      title="Diet Plans" 
      subtitle="Manage your nutrition plans and meal schedules"
    >
      <div className="space-y-6">
        {allPlans && allPlans?.length > 0 ? (
          <>
            {/* Plan Selector */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Your Diet Plans
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Select a plan to view detailed nutrition and meal information
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

            {/* Diet Plan Details */}
            {currentPlan && (
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <AppleIcon className="h-5 w-5 text-primary" />
                        {currentPlan.name} - Diet Plan
                      </CardTitle>
                      <CardDescription className="text-muted-foreground flex items-center gap-2 mt-2">
                        <Calculator className="h-4 w-4" />
                        Daily Target: {currentPlan.dietPlan.dailyCalories} calories
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
                    {/* Nutrition Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border">
                        <Calculator className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Daily Calories</p>
                          <p className="text-foreground font-semibold">{currentPlan.dietPlan.dailyCalories}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border">
                        <Utensils className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Meals per Day</p>
                          <p className="text-foreground font-semibold">{currentPlan.dietPlan.meals.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border">
                        <Clock className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Calories/Meal</p>
                          <p className="text-foreground font-semibold">
                            {Math.round(currentPlan.dietPlan.dailyCalories / currentPlan.dietPlan.meals.length)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-card/30 rounded-lg border border-border">
                        <Target className="h-8 w-8 text-orange-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Goal</p>
                          <p className="text-foreground font-semibold">Fitness</p>
                        </div>
                      </div>
                    </div>

                    {/* Calorie Breakdown Chart */}
                    <Card className="bg-card/30 border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground text-lg">Daily Calorie Target</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center p-6 bg-card/50 rounded-lg border border-border">
                          <span className="font-mono text-lg text-muted-foreground">TARGET</span>
                          <div className="font-mono text-3xl text-primary font-bold">
                            {currentPlan.dietPlan.dailyCalories} KCAL
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Meal Plan */}
                    <Card className="bg-card/30 border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground text-lg">Meal Schedule</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Your daily meal plan with recommended foods
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {currentPlan.dietPlan.meals.map((meal, index) => (
                            <div
                              key={index}
                              className="border border-border rounded-lg p-6 bg-card/50 shadow-lg"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                                  <h4 className="font-mono text-primary text-xl font-bold">{meal.name}</h4>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">Estimated</p>
                                  <p className="text-lg font-bold text-foreground">
                                    {Math.round(currentPlan.dietPlan.dailyCalories / currentPlan.dietPlan.meals.length)} cal
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {meal.foods.map((food, foodIndex) => (
                                  <div
                                    key={foodIndex}
                                    className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                                  >
                                    <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded border border-primary/30 min-w-[2rem] text-center">
                                      {String(foodIndex + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-sm text-foreground flex-1">{food}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => downloadDietPlan(currentPlan)}
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Plan
                      </Button>
                      <Button 
                        onClick={() => window.location.href = '/recipes'}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Browse Recipes
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
              <AppleIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Diet Plans</h3>
              <p className="text-muted-foreground mb-6">
                Get started with a personalized nutrition plan tailored to your dietary goals.
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

export default DietPlansPage;
