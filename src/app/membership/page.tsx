"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Users,
  Zap,
  Star,
  Shield,
  Dumbbell,
  Trophy,
  Heart,
  Sparkles,
} from "lucide-react";
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
    if (!user) {
      // Redirect to sign-in page if user is not authenticated
      window.location.href = "/sign-in?redirect_url=" + encodeURIComponent("/membership");
      return;
    }

    if (!plan?.stripePriceId) {
      console.error("Invalid plan data");
      return;
    }

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { sessionId, url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      // You could add a toast notification here for better UX
    } finally {
      setLoading(null);
    }
  };

  const getPlanConfig = (type: string) => {
    switch (type) {
      case "basic":
        return {
          icon: <Star className="h-6 w-6" />,
          color: "text-blue-500 dark:text-blue-400",
          border: "border-blue-500/30",
          button:
            "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
          gradient: "from-blue-500/10 to-blue-600/5",
          description: "Great value plan",
        };
      case "couple":
        return {
          icon: <Heart className="h-6 w-6" />,
          color: "text-purple-500 dark:text-purple-400",
          border: "border-purple-500/30",
          button:
            "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
          gradient: "from-purple-500/10 to-purple-600/5",
          description: "Train together",
        };
      case "premium":
        return {
          icon: <Crown className="h-6 w-6" />,
          color: "text-primary",
          border: "border-primary/50",
          button: "bg-primary hover:bg-primary/90",
          gradient: "from-primary/10 to-primary/5",
          description: "Ultimate experience",
        };
      default:
        return {
          icon: <Star className="h-6 w-6" />,
          color: "text-muted-foreground",
          border: "border-border",
          button: "bg-secondary hover:bg-secondary/80",
          gradient: "from-secondary/10 to-secondary/5",
          description: "Standard plan",
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
    if (!mounted || !date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (!user) {
    // Allow users to view packages without authentication
    // Only require auth when purchasing
  }

  // Loading state
  if (!mounted || membershipPlans === undefined) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-32 relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading membership plans...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (membershipPlans === null) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-32 relative z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Unable to load plans
            </h2>
            <p className="text-muted-foreground">
              Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background"
      suppressHydrationWarning
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5"
        suppressHydrationWarning
      ></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]"
        suppressHydrationWarning
      ></div>

      <div
        className="container mx-auto px-4 py-32 relative z-10"
        suppressHydrationWarning
      >
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16" suppressHydrationWarning>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            <span className="text-foreground">Choose Your </span>
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Membership
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unlock your potential with our comprehensive membership plans
            designed for every fitness level and lifestyle
          </p>
        </div>
        {/* Current Membership Status */}
        {currentMembership && user && (
          <div className="max-w-7xl mx-auto mb-12" suppressHydrationWarning>
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/30 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        Active Membership
                      </h3>
                      <Badge className="bg-primary text-primary-foreground capitalize font-medium">
                        {currentMembership.membershipType} Plan -{" "}
                        {currentMembership.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      Valid until
                    </p>
                    <p className="text-foreground font-semibold text-lg">
                      {formatMembershipDate(currentMembership.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Membership Plans */}
        <div
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          suppressHydrationWarning
        >
          {membershipPlans && membershipPlans.length > 0 ? (
            membershipPlans.map((plan) => {
              const config = getPlanConfig(plan.type);
              const isCurrentPlan =
                Boolean(currentMembership?.membershipType === plan.type && user);

              return (
                <Card
                  key={plan._id}
                  className={`relative bg-card/90 backdrop-blur-sm border transition-all duration-500 group flex flex-col h-full hover:shadow-2xl hover:-translate-y-2 transform-gpu ${
                    plan.type === "premium"
                      ? "border-primary/60 ring-2 ring-primary/30 shadow-primary/20"
                      : config.border
                  } ${isCurrentPlan ? "border-primary/80 ring-2 ring-primary/40 shadow-primary/30" : ""}`}
                >
                  {/* Enhanced Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500`}
                  />

                  {/* Professional Popular badge for premium */}
                  {plan.type === "premium" && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-lg text-xs px-4 py-1.5 border border-amber-500/20">
                        <span className="font-semibold tracking-wide">
                          MOST POPULAR
                        </span>
                      </Badge>
                    </div>
                  )}

                  {/* Current plan indicator - Compact */}
                  {isCurrentPlan && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg text-xs px-2 py-1">
                        ✓ ACTIVE
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4 relative z-10 pt-8">
                    {/* Enhanced Icon Container */}
                    <div className="mx-auto mb-6 p-4 rounded-xl bg-background/90 group-hover:bg-background transition-all duration-500 shadow-lg group-hover:shadow-xl w-fit border border-border/50 group-hover:border-emerald-500/30">
                      <div
                        className={`${config.color} transition-all group-hover:scale-110 duration-500`}
                      >
                        {config.icon}
                      </div>
                    </div>

                    {/* Enhanced Title */}
                    <CardTitle className="text-2xl font-bold text-foreground mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                      {plan.name}
                    </CardTitle>

                    {/* Enhanced Description */}
                    <p className="text-muted-foreground text-sm font-medium">
                      {config.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 flex-1 flex flex-col relative z-10 px-6">
                    {/* Enhanced Price Section */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-foreground mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                        {formatPrice(plan.price)}
                      </div>
                      <div className="text-muted-foreground text-sm font-medium mb-2">
                        per month
                      </div>
                      {plan.type === "premium" && (
                        <div className="text-sm text-emerald-600 font-semibold mt-2 bg-emerald-500/10 px-3 py-1 rounded-full">
                          Best Value
                        </div>
                      )}
                    </div>

                    {/* Enhanced Features Section */}
                    <div className="mb-6 flex-1">
                      <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Star className="h-4 w-4 text-emerald-500" />
                        What's Included
                      </h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 group/feature"
                          >
                            <div className="mt-0.5">
                              <Check
                                className={`h-4 w-4 ${config.color} flex-shrink-0 group-hover/feature:scale-110 transition-transform duration-200`}
                              />
                            </div>
                            <span className="text-muted-foreground text-sm leading-relaxed group-hover/feature:text-foreground transition-colors duration-200">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Enhanced Benefits Badge */}
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg p-3 text-center">
                        <p className="text-sm text-emerald-600 font-medium">
                          {plan.type === "premium"
                            ? "🏆 Priority + Personal Training"
                            : plan.type === "couple"
                            ? "💑 Special Couple Benefits"
                            : "🎯 Complete Gym Access"}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Call-to-Action Button */}
                    <div className="mt-auto">
                      <Button
                        className={`w-full ${config.button} text-white font-semibold py-4 text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] group-hover:shadow-2xl`}
                        onClick={() => handleSubscribe(plan)}
                        disabled={loading === plan.type || isCurrentPlan}
                      >
                        {loading === plan.type ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : isCurrentPlan ? (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Active Plan
                          </div>
                        ) : !user ? (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Sign In to Subscribe
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            {plan.type === "premium"
                              ? "Upgrade Now"
                              : "Get Started"}
                          </div>
                        )}
                      </Button>

                      {/* Enhanced Additional Info */}
                      <p className="text-sm text-muted-foreground text-center mt-3">
                        {isCurrentPlan
                          ? "Manage in profile settings"
                          : !user
                          ? "Sign in to purchase • No setup fees"
                          : "Cancel anytime • No setup fees"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="bg-muted/10 p-6 rounded-2xl border border-border/50 max-w-md mx-auto">
                <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Plans Available
                </h3>
                <p className="text-muted-foreground text-sm">
                  Membership plans will be available soon.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Why Choose Elite Gym */}
        <div className="text-center mt-20" suppressHydrationWarning>
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-8">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Why Elite Gym
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Elite Gym?
            </span>
          </h3>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Experience the difference with our world-class facilities and expert
            guidance
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 shadow-lg group-hover:shadow-xl border border-primary/20">
                <Dumbbell className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                Premium Equipment
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                State-of-the-art fitness equipment and facilities for optimal
                training
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 shadow-lg group-hover:shadow-xl border border-primary/20">
                <Users className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                Expert Trainers
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Certified professionals to guide and motivate your fitness
                journey
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 shadow-lg group-hover:shadow-xl border border-primary/20">
                <Trophy className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                Flexible Plans
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Choose the perfect plan that fits your lifestyle and goals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
