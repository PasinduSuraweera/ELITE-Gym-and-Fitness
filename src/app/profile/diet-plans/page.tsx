"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppleIcon, Target, Utensils, Calculator, Clock } from "lucide-react";

const DietPlansPage = () => {
  const { user } = useUser();
  const userId = user?.id as string;

  const allPlans = useQuery(api.plans.getUserPlans, { userId });
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);

  const activePlan = allPlans?.find((plan) => plan.isActive);

  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  return (
    <UserLayout 
      title="Diet Plans" 
      subtitle="Manage your nutrition plans and meal schedules"
    >
      <div className="space-y-6">
        {allPlans && allPlans?.length > 0 ? (
          <>
            {/* Plan Selector */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Your Diet Plans
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Select a plan to view detailed nutrition and meal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {allPlans.map((plan) => (
                    <Button
                      key={plan._id}
                      onClick={() => setSelectedPlanId(plan._id)}
                      className={`text-white border transition-all duration-300 rounded-lg ${
                        selectedPlanId === plan._id
                          ? "bg-red-600/20 text-red-400 border-red-500 shadow-red-500/25"
                          : "bg-gray-900/50 border-gray-700 hover:border-red-500/50 hover:bg-red-900/20"
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
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AppleIcon className="h-5 w-5 text-red-500" />
                        {currentPlan.name} - Diet Plan
                      </CardTitle>
                      <CardDescription className="text-gray-400 flex items-center gap-2 mt-2">
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
                      <div className="flex items-center gap-3 p-4 bg-black/50 rounded-lg border border-gray-700">
                        <Calculator className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-400">Daily Calories</p>
                          <p className="text-white font-semibold">{currentPlan.dietPlan.dailyCalories}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-black/50 rounded-lg border border-gray-700">
                        <Utensils className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-400">Meals per Day</p>
                          <p className="text-white font-semibold">{currentPlan.dietPlan.meals.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-black/50 rounded-lg border border-gray-700">
                        <Clock className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-400">Avg. Calories/Meal</p>
                          <p className="text-white font-semibold">
                            {Math.round(currentPlan.dietPlan.dailyCalories / currentPlan.dietPlan.meals.length)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-black/50 rounded-lg border border-gray-700">
                        <Target className="h-8 w-8 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-400">Goal</p>
                          <p className="text-white font-semibold">Fitness</p>
                        </div>
                      </div>
                    </div>

                    {/* Calorie Breakdown Chart */}
                    <Card className="bg-black/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Daily Calorie Target</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                          <span className="font-mono text-lg text-gray-300">TARGET</span>
                          <div className="font-mono text-3xl text-red-500 font-bold">
                            {currentPlan.dietPlan.dailyCalories} KCAL
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Meal Plan */}
                    <Card className="bg-black/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Meal Schedule</CardTitle>
                        <CardDescription className="text-gray-400">
                          Your daily meal plan with recommended foods
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {currentPlan.dietPlan.meals.map((meal, index) => (
                            <div
                              key={index}
                              className="border border-gray-700 rounded-lg p-6 bg-gray-900/30 shadow-lg"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                  <h4 className="font-mono text-red-500 text-xl font-bold">{meal.name}</h4>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-400">Estimated</p>
                                  <p className="text-lg font-bold text-white">
                                    {Math.round(currentPlan.dietPlan.dailyCalories / currentPlan.dietPlan.meals.length)} cal
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {meal.foods.map((food, foodIndex) => (
                                  <div
                                    key={foodIndex}
                                    className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-gray-700 hover:border-red-500/30 transition-colors"
                                  >
                                    <span className="text-xs text-red-500 font-mono bg-red-900/20 px-2 py-1 rounded border border-red-500/30 min-w-[2rem] text-center">
                                      {String(foodIndex + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-sm text-gray-300 flex-1">{food}</span>
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
                        onClick={() => window.location.href = '/recipes'}
                        className="bg-red-600 hover:bg-red-700"
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
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <AppleIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Diet Plans</h3>
              <p className="text-gray-400 mb-6">
                Get started with a personalized nutrition plan tailored to your dietary goals.
              </p>
              <Button 
                onClick={() => window.location.href = '/generate-program'}
                className="bg-red-600 hover:bg-red-700"
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
