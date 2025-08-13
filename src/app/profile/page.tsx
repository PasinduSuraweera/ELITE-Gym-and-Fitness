"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import CornerElements from "@/components/CornerElements";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, CalendarIcon, DumbbellIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProfilePage = () => {
  const { user } = useUser();
  const userId = user?.id as string;

  const allPlans = useQuery(api.plans.getUserPlans, { userId });
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);

  const activePlan = allPlans?.find((plan) => plan.isActive);

  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"></div>
      
      <section className="relative z-10 pt-32 pb-16 flex-grow container mx-auto px-4">
        <ProfileHeader user={user} />

        {allPlans && allPlans?.length > 0 ? (
          <div className="space-y-8">
            {/* PLAN SELECTOR */}
            <div className="relative bg-black/90 backdrop-blur-sm border border-red-500/30 p-6 rounded-xl shadow-2xl">
              <CornerElements />
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  <span className="text-red-500">Your</span>{" "}
                  <span className="text-white">Fitness Plans</span>
                </h2>
                <div className="font-mono text-sm text-gray-400 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                  TOTAL: {allPlans.length}
                </div>
              </div>

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
            </div>

            {/* PLAN DETAILS */}
            {currentPlan && (
              <div className="relative bg-black/90 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 shadow-2xl">
                <CornerElements />

                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <h3 className="text-xl font-bold">
                    PLAN: <span className="text-red-500">{currentPlan.name}</span>
                  </h3>
                </div>

                <Tabs defaultValue="workout" className="w-full">
                  <TabsList className="mb-6 w-full grid grid-cols-2 bg-gray-900/80 border border-gray-700 rounded-lg">
                    <TabsTrigger
                      value="workout"
                      className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/50 text-white"
                    >
                      <DumbbellIcon className="mr-2 size-4" />
                      Workout Plan
                    </TabsTrigger>

                    <TabsTrigger
                      value="diet"
                      className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/50 text-white"
                    >
                      <AppleIcon className="mr-2 h-4 w-4" />
                      Diet Plan
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="workout">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-6">
                        <CalendarIcon className="h-5 w-5 text-red-500" />
                        <span className="font-mono text-sm text-gray-300 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                          SCHEDULE: {currentPlan.workoutPlan.schedule.join(", ")}
                        </span>
                      </div>

                      <Accordion type="multiple" className="space-y-4">
                        {currentPlan.workoutPlan.exercises.map((exerciseDay, index) => (
                          <AccordionItem
                            key={index}
                            value={exerciseDay.day}
                            className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900/30"
                          >
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-red-600/10 font-mono text-white">
                              <div className="flex justify-between w-full items-center">
                                <span className="text-red-500 font-bold">{exerciseDay.day}</span>
                                <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                                  {exerciseDay.routines.length} EXERCISES
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="pb-6 px-6">
                              <div className="space-y-4 mt-4">
                                {exerciseDay.routines.map((routine, routineIndex) => (
                                  <div
                                    key={routineIndex}
                                    className="border border-gray-700 rounded-lg p-4 bg-black/50 shadow-lg"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <h4 className="font-semibold text-white text-lg">
                                        {routine.name}
                                      </h4>
                                      <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm font-mono border border-red-500/30">
                                          {routine.sets} SETS
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-sm font-mono border border-orange-500/30">
                                          {routine.reps} REPS
                                        </div>
                                      </div>
                                    </div>
                                    {routine.description && (
                                      <p className="text-sm text-gray-300 mt-2 bg-gray-900/30 p-3 rounded border border-gray-700">
                                        {routine.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </TabsContent>

                  <TabsContent value="diet">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <span className="font-mono text-sm text-gray-300">
                          DAILY CALORIE TARGET
                        </span>
                        <div className="font-mono text-2xl text-red-500 font-bold">
                          {currentPlan.dietPlan.dailyCalories} KCAL
                        </div>
                      </div>

                      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent my-6"></div>

                      <div className="space-y-4">
                        {currentPlan.dietPlan.meals.map((meal, index) => (
                          <div
                            key={index}
                            className="border border-gray-700 rounded-lg overflow-hidden p-6 bg-black/50 shadow-lg"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <h4 className="font-mono text-red-500 text-lg font-bold">{meal.name}</h4>
                            </div>
                            <ul className="space-y-3">
                              {meal.foods.map((food, foodIndex) => (
                                <li
                                  key={foodIndex}
                                  className="flex items-center gap-3 text-sm text-gray-300 bg-gray-900/30 p-3 rounded border border-gray-700"
                                >
                                  <span className="text-xs text-red-500 font-mono bg-red-900/20 px-2 py-1 rounded border border-red-500/30">
                                    {String(foodIndex + 1).padStart(2, "0")}
                                  </span>
                                  {food}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        ) : (
          <NoFitnessPlan />
        )}
      </section>
    </div>
  );
};
export default ProfilePage;
