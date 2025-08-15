"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Users, Zap, Star, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const MembershipPage = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const membershipPlans = useQuery(api.memberships.getMembershipPlans);
  const currentMembership = useQuery(
    api.memberships.getUserMembership,
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribe = async (plan: any) => {
    if (!user) return;
    
    setLoading(plan.type);
    
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          clerkId: user.id,
          membershipType: plan.type,
        }),
      });

      const { sessionId, url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(null);
    }
  };

  const getPlanConfig = (type: string) => {
    switch (type) {
      case "beginner":
        return {
          icon: <Zap className="h-8 w-8" />,
          color: "text-green-500",
          border: "border-green-500/30",
          button: "bg-green-600 hover:bg-green-700"
        };
      case "basic":
        return {
          icon: <Star className="h-8 w-8" />,
          color: "text-blue-500", 
          border: "border-blue-500/30",
          button: "bg-blue-600 hover:bg-blue-700"
        };
      case "couple":
        return {
          icon: <Users className="h-8 w-8" />,
          color: "text-purple-500",
          border: "border-purple-500/30", 
          button: "bg-purple-600 hover:bg-purple-700"
        };
      case "premium":
        return {
          icon: <Crown className="h-8 w-8" />,
          color: "text-yellow-500",
          border: "border-yellow-500/30",
          button: "bg-yellow-600 hover:bg-yellow-700"
        };
      default:
        return {
          icon: <Star className="h-8 w-8" />,
          color: "text-gray-500",
          border: "border-gray-500/30",
          button: "bg-gray-600 hover:bg-gray-700"
        };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMembershipDate = (date: number | Date | null | undefined) => {
    if (!mounted || !date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (!user) {
    return null; // Middleware will handle redirect
  }

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10" suppressHydrationWarning>
        {/* Header */}
        <div className="text-center mb-12" suppressHydrationWarning>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-white">Choose Your </span>
            <span className="text-red-500">Membership</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Transform your fitness journey with our comprehensive membership plans designed for every fitness level
          </p>
        </div>
        {/* Current Membership Status */}
        {currentMembership && (
          <div className="mb-8" suppressHydrationWarning>
            <Card className="bg-gray-900/50 border border-green-500/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Current Membership</h3>
                    <Badge className="bg-green-600 text-white capitalize">
                      {currentMembership.membershipType} Plan - {currentMembership.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Valid until</p>
                    <p className="text-white font-semibold">
                      {formatMembershipDate(currentMembership.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Membership Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" suppressHydrationWarning>
          {membershipPlans?.map((plan) => {
            const config = getPlanConfig(plan.type);
            const isCurrentPlan = currentMembership?.membershipType === plan.type;

            return (
              <Card
                key={plan._id}
                className={`relative bg-gray-900/50 border border-gray-800 hover:border-red-500/50 transition-all duration-300 group flex flex-col h-full ${
                  plan.type === "premium" ? "border-yellow-500/50" : ""
                } ${isCurrentPlan ? "border-green-500/50" : ""}`}
              >
                {/* Popular badge for premium */}
                {plan.type === "premium" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-600 text-black font-bold">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                {/* Current plan indicator */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600 text-white">
                      CURRENT
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-gray-800/50 group-hover:bg-gray-700/50 transition-colors duration-300">
                    <div className={config.color}>
                      {config.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                  <p className="text-gray-400">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-white mb-1">
                      {formatPrice(plan.price)}
                    </div>
                    <div className="text-gray-400">per month</div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 mt-0.5 ${config.color} flex-shrink-0`} />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button - This will be pushed to bottom */}
                  <div className="mt-auto">
                    <Button
                      className={`w-full ${config.button} text-white font-semibold py-3 transition-all duration-300`}
                      onClick={() => handleSubscribe(plan)}
                      disabled={loading === plan.type || isCurrentPlan}
                    >
                      {loading === plan.type ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        "Choose Plan"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why Choose Elite Gym */}
        <div className="text-center" suppressHydrationWarning>
          <h3 className="text-3xl font-bold text-white mb-8">
            Why Choose <span className="text-red-500">Elite Gym?</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-300">
                <Star className="h-8 w-8 text-red-500" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Premium Equipment</h4>
              <p className="text-gray-400">State-of-the-art fitness equipment and facilities</p>
            </div>
            <div className="text-center group">
              <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-300">
                <Users className="h-8 w-8 text-red-500" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Expert Trainers</h4>
              <p className="text-gray-400">Certified professionals to guide your fitness journey</p>
            </div>
            <div className="text-center group">
              <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-300">
                <Crown className="h-8 w-8 text-red-500" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Flexible Plans</h4>
              <p className="text-gray-400">Choose the perfect plan that fits your lifestyle</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
