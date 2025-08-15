"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Users, Zap, Star } from "lucide-react";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const MembershipPage = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  
  const membershipPlans = useQuery(api.memberships.getMembershipPlans);
  const currentMembership = useQuery(
    api.memberships.getUserMembership,
    user?.id ? { clerkId: user.id } : "skip"
  );

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

  const getIcon = (type: string) => {
    switch (type) {
      case "beginner":
        return <Zap className="h-8 w-8" />;
      case "basic":
        return <Star className="h-8 w-8" />;
      case "couple":
        return <Users className="h-8 w-8" />;
      case "premium":
        return <Crown className="h-8 w-8" />;
      default:
        return <Star className="h-8 w-8" />;
    }
  };

  const getColorScheme = (type: string) => {
    switch (type) {
      case "beginner":
        return {
          border: "border-green-500",
          bg: "bg-green-500/10",
          text: "text-green-500",
          button: "bg-green-600 hover:bg-green-700",
        };
      case "basic":
        return {
          border: "border-blue-500",
          bg: "bg-blue-500/10",
          text: "text-blue-500",
          button: "bg-blue-600 hover:bg-blue-700",
        };
      case "couple":
        return {
          border: "border-purple-500",
          bg: "bg-purple-500/10",
          text: "text-purple-500",
          button: "bg-purple-600 hover:bg-purple-700",
        };
      case "premium":
        return {
          border: "border-yellow-500",
          bg: "bg-yellow-500/10",
          text: "text-yellow-500",
          button: "bg-yellow-600 hover:bg-yellow-700",
        };
      default:
        return {
          border: "border-gray-500",
          bg: "bg-gray-500/10",
          text: "text-gray-500",
          button: "bg-gray-600 hover:bg-gray-700",
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

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-400">You need to be signed in to view membership plans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-white">Choose Your </span>
            <span className="text-red-500">Membership</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your fitness journey with our comprehensive membership plans designed for every fitness level
          </p>
        </div>

        {/* Current Membership Status */}
        {currentMembership && (
          <div className="mb-8">
            <Card className="bg-gray-900/50 border-green-500/50">
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
                      {new Date(currentMembership.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Membership Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {membershipPlans?.map((plan) => {
            const colors = getColorScheme(plan.type);
            const isCurrentPlan = currentMembership?.membershipType === plan.type;

            return (
              <Card
                key={plan._id}
                className={`relative bg-gray-900/50 border-2 ${colors.border} hover:scale-105 transition-transform duration-300`}
              >
                {plan.type === "premium" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-600 text-black font-bold">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 p-3 rounded-full ${colors.bg}`}>
                    <div className={colors.text}>
                      {getIcon(plan.type)}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-white mb-1">
                      {formatPrice(plan.price)}
                    </div>
                    <div className="text-gray-400">per month</div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 mt-0.5 ${colors.text} flex-shrink-0`} />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Button
                    className={`w-full ${colors.button} text-white font-semibold py-3`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading === plan.type || isCurrentPlan}
                  >
                    {loading === plan.type ? (
                      "Processing..."
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      "Choose Plan"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Why Choose Elite Gym?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-red-500" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Premium Equipment</h4>
              <p className="text-gray-400">State-of-the-art fitness equipment and facilities</p>
            </div>
            <div className="text-center">
              <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-red-500" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Expert Trainers</h4>
              <p className="text-gray-400">Certified professionals to guide your fitness journey</p>
            </div>
            <div className="text-center">
              <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
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
