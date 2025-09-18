"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon, MessageCircle, Brain, Users, ShoppingCart, BookOpen, Heart, Crown, Dumbbell, Calendar, Star, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import GymLocationsSection from "@/components/GymLocationsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Dynamic import to prevent hydration issues
const ChadBot = dynamic(() => import("@/components/ChadBot"), {
  ssr: false,
});

const HomePage = () => {
  return (
    <div
      className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background"
      suppressHydrationWarning
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-primary/5"
        suppressHydrationWarning
      ></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.15)_0%,transparent_50%)]"
        suppressHydrationWarning
      ></div>

      {/* Hero Section */}
      <section className="relative z-10 py-24 flex-grow pt-32">
        <div
          className="container mx-auto px-6 md:px-12 lg:px-20 xl:px-32"
          suppressHydrationWarning
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative min-h-[600px]"
            suppressHydrationWarning
          >
            {/* LEFT SIDE CONTENT */}
            <div
              className="lg:col-span-7 space-y-8 relative"
              suppressHydrationWarning
            >
              <div className="space-y-6" suppressHydrationWarning>
                <h2 className="text-3xl md:text-4xl font-normal text-foreground">
                  Your Goals,
                </h2>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="text-primary">Your Fitness Journey</span>
                </h1>
                <h3 className="text-2xl md:text-3xl font-medium text-foreground">
                  Powered By Elite Gym & Fitness
                </h3>
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Join The Elite Gym & Fitness Experience And Take Full Control Of
                Your Fitness Journey. From AI-Powered Workout And Diet Plans To
                Expert Trainer Support, Real-Time Bookings, And A Thriving
                Fitness Community — Everything You Need Is In One Platform.
                Ready To Train Smarter, Eat Better, And Stay Motivated?
              </p>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button
                  size="lg"
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-lg font-semibold rounded-md transition-all duration-300 shadow-lg hover:shadow-primary/25"
                >
                  <Link href={"/generate-program"}>Get Started</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-12 py-6 text-lg font-semibold rounded-md transition-all duration-300 bg-transparent"
                >
                  <Link href={"/generate-program"}>Explore Plans</Link>
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE - HERO IMAGE */}
            <div className="lg:col-span-5 relative">
              <div className="relative">
                {/* Main Hero Image - Much bigger like the reference */}
                <div className="relative w-full h-[700px] lg:h-[800px] overflow-hidden">
                  <div
                    className="relative w-full h-full"
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)",
                    }}
                  >
                    <Image
                      src="/hero-ai.png"
                      alt="Fitness trainer"
                      fill
                      className="object-contain object-center scale-200"
                      priority
                    />
                  </div>
                </div>

                {/* Statistics Badges positioned exactly like reference image - Made bigger */}
                {/* + 300 AI Generations - top right */}
                <div className="absolute top-6 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-5 border border-border shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-primary" />
                    <div className="text-primary font-bold text-2xl">300+</div>
                  </div>
                  <div className="text-foreground text-sm font-medium">
                    AI Generations
                  </div>
                </div>

                {/* + 20 Coaches - left side, upper middle */}
                <div className="absolute top-1/3 -left-6 bg-background/95 backdrop-blur-sm rounded-xl p-5 border border-border shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <div className="text-primary font-bold text-2xl">30+</div>
                  </div>
                  <div className="text-foreground text-sm font-medium">
                    Expert Trainers
                  </div>
                </div>

                {/* + 1000 Community - bottom left, overlapping figure */}
                <div className="absolute bottom-1/4 left-0 bg-background/95 backdrop-blur-sm rounded-xl p-5 border border-border shadow-lg z-10 hover:shadow-primary/20 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-primary" />
                    <div className="text-primary font-bold text-2xl">1000+</div>
                  </div>
                  <div className="text-foreground text-sm font-medium">
                    Community
                  </div>
                </div>

                {/* + Premium Equipment - bottom right */}
                <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-5 border border-border shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    <div className="text-primary font-bold text-2xl">24/7</div>
                  </div>
                  <div className="text-foreground text-sm font-medium">
                    Gym Access
                  </div>
                </div>

                {/* Glow effects around the image */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-secondary/5 rounded-3xl blur-3xl dark:via-primary/10 dark:to-secondary/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="relative z-10 py-24 bg-muted/30">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              Complete Fitness Ecosystem
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Everything You Need in 
              <span className="text-primary"> One Platform</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              From AI-powered personalized plans to expert trainers, premium marketplace, and thriving community - 
              we've built the ultimate fitness ecosystem for your success.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* AI-Powered Plans */}
            <div className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group h-[450px] flex flex-col hover:shadow-lg">
              <div className="text-center pb-3 flex-shrink-0 p-6">
                <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 border border-primary/20 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop"
                    alt="AI Fitness Planning"
                    width={400}
                    height={128}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  AI-Powered Plans
                </h3>
                <p className="text-sm text-muted-foreground">
                  Personalized workout & diet plans generated by AI
                </p>
              </div>
              <div className="text-center flex-grow flex flex-col p-6 pt-0">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Custom workout routines
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Personalized nutrition plans
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Goal-specific programming
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Link href="/generate-program">Generate Your Plan</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Expert Trainers */}
            <div className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group h-[450px] flex flex-col hover:shadow-lg">
              <div className="text-center pb-3 flex-shrink-0 p-6">
                <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 border border-primary/20 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop"
                    alt="Expert Personal Trainers"
                    width={400}
                    height={128}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Expert Trainers
                </h3>
                <p className="text-sm text-muted-foreground">
                  30+ certified trainers ready to guide you
                </p>
              </div>
              <div className="text-center flex-grow flex flex-col p-6 pt-0">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Real-time booking system
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Multiple specializations
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    4.8+ average rating
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Link href="/trainer-booking">Book a Trainer</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Marketplace */}
            <div className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group h-[450px] flex flex-col hover:shadow-lg">
              <div className="text-center pb-3 flex-shrink-0 p-6">
                <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 border border-primary/20 relative">
                  <Image
                    src="https://gssports.lk/wp-content/uploads/2021/12/ADS24.jpg"
                    alt="Premium Fitness Marketplace"
                    width={400}
                    height={128}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <ShoppingCart className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Premium Marketplace
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quality supplements, equipment & apparel
                </p>
              </div>
              <div className="text-center flex-grow flex flex-col p-6 pt-0">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Premium supplements
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Professional equipment
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Branded fitness apparel
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Link href="/marketplace">Shop Now</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Recipe Database */}
            <div className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group h-[450px] flex flex-col hover:shadow-lg">
              <div className="text-center pb-3 flex-shrink-0 p-6">
                <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 border border-primary/20 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop"
                    alt="Healthy Recipe Database"
                    width={400}
                    height={128}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Recipe Database
                </h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive nutrition & meal planning
                </p>
              </div>
              <div className="text-center flex-grow flex flex-col p-6 pt-0">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Goal-based recipes
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Detailed nutrition info
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Meal prep guides
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Link href="/recipes">Browse Recipes</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Community */}
            <div className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group h-[450px] flex flex-col hover:shadow-lg">
              <div className="text-center pb-3 flex-shrink-0 p-6">
                <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 border border-primary/20 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&auto=format&fit=crop"
                    alt="Thriving Fitness Community"
                    width={400}
                    height={128}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Thriving Community
                </h3>
                <p className="text-sm text-muted-foreground">
                  1000+ active members supporting each other
                </p>
              </div>
              <div className="text-center flex-grow flex flex-col p-6 pt-0">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Progress sharing
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Motivation & support
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Success celebrations
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Link href="/community">Join Community</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Blog & Resources */}
            <div className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group h-[450px] flex flex-col hover:shadow-lg">
              <div className="text-center pb-3 flex-shrink-0 p-6">
                <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 border border-primary/20 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop"
                    alt="Expert Fitness Content"
                    width={400}
                    height={128}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Expert Content
                </h3>
                <p className="text-sm text-muted-foreground">
                  Latest fitness insights & expert advice
                </p>
              </div>
              <div className="text-center flex-grow flex flex-col p-6 pt-0">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Expert articles
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Training tips
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Success stories
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Link href="/blog">Read Blog</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Preview Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              Flexible Pricing
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Choose Your 
              <span className="text-primary"> Elite Membership</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              From fitness enthusiasts to elite athletes, we have the perfect membership plan to match your fitness goals and lifestyle.
              All plans include AI plan generation and trainer booking.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Basic Plan */}
            <Card className="relative bg-background/50 backdrop-blur-sm border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl h-[520px] flex flex-col">
              <CardHeader className="text-center pb-3 flex-shrink-0">
                <CardTitle className="text-xl font-semibold mb-2">Basic</CardTitle>
                <div className="text-3xl font-bold text-primary mb-1">Rs. 2,500</div>
                <div className="text-sm text-muted-foreground">per month</div>
                <CardDescription className="mt-3 text-sm">
                  Essential gym access with standard equipment
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col p-4">
                <ul className="space-y-2 flex-1">
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Full gym equipment access
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Standard locker facilities
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    All operating hours access
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Basic workout guidance
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Free parking
                  </li>
                </ul>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/membership">Choose Basic</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan - Most Popular */}
            <Card className="relative bg-background/50 backdrop-blur-sm border-2 border-primary hover:border-primary transition-all duration-300 hover:shadow-2xl shadow-primary/20 h-[520px] flex flex-col">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-3 pt-6 flex-shrink-0">
                <CardTitle className="text-xl font-semibold mb-2 text-primary">Premium</CardTitle>
                <div className="text-3xl font-bold text-primary mb-1">Rs. 3,000</div>
                <div className="text-sm text-muted-foreground">per month</div>
                <CardDescription className="mt-3 text-sm">
                  Ultimate fitness experience with premium amenities
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col p-4">
                <ul className="space-y-2 flex-1">
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Full gym & premium equipment
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Personal training sessions (2/month)
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Nutrition consultation included
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Spa & sauna access
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    24/7 gym access
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Priority class booking
                  </li>
                </ul>
                <div className="mt-4">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href="/membership">Go Premium</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Couple Plan */}
            <Card className="relative bg-background/50 backdrop-blur-sm border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl h-[520px] flex flex-col">
              <CardHeader className="text-center pb-3 flex-shrink-0">
                <CardTitle className="text-xl font-semibold mb-2">Couple</CardTitle>
                <div className="text-3xl font-bold text-primary mb-1">Rs. 4,500</div>
                <div className="text-sm text-muted-foreground">per month</div>
                <CardDescription className="mt-3 text-sm">
                  Train together, stay together with couple benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col p-4">
                <ul className="space-y-2 flex-1">
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Full gym access for 2 people
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Couple workout programs
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Premium locker facilities
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Personal training discounts
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    Nutrition consultation included
                  </li>
                </ul>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/membership">Choose Couple</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              All plans include AI-powered workout generation, recipe database access, and community features.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                No setup fees
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Instant activation
              </div>
            </div>
            <Button size="lg" asChild className="px-12 py-6 text-lg font-semibold">
              <Link href="/membership">View Full Pricing Details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-12 text-center border-2 border-primary/20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to Join the 
              <span className="text-primary"> Elite Family?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
              Start your transformation journey today with AI-powered plans, expert trainers, 
              and a community that believes in your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="px-12 py-6 text-lg font-semibold">
                <Link href="/generate-program">
                  <Brain className="mr-2 h-5 w-5" />
                  Generate Your AI Plan
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-12 py-6 text-lg font-semibold">
                <Link href="/trainer-booking">
                  <Users className="mr-2 h-5 w-5" />
                  Book a Trainer Session
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Join 1000+ members who are already crushing their fitness goals
            </p>
          </div>
        </div>
      </section>

      {/* Equipment Gallery Section */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              Premium Equipment
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              State-of-the-Art 
              <span className="text-primary"> Fitness Equipment</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From cutting-edge cardio machines to professional strength equipment, 
              we provide everything you need for an exceptional workout experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Equipment Images */}
            <div className="aspect-square rounded-lg overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&auto=format&fit=crop"
                alt="Modern Gym Interior"
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&auto=format&fit=crop"
                alt="Cardio Equipment"
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&auto=format&fit=crop"
                alt="Free Weights Area"
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=300&auto=format&fit=crop"
                alt="Functional Training"
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&auto=format&fit=crop"
                alt="Group Fitness Studio"
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 group">
              <Image
                src="https://www.usnews.com/object/image/0000018b-72bc-d15f-a3db-fffea06d0000/gettyimages-1342504672.jpg?update-time=1698437080300&size=responsive640"
                alt="Recovery & Wellness"
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild variant="outline" className="px-12 py-6 text-lg font-semibold">
              <Link href="/about">
                <Dumbbell className="mr-2 h-5 w-5" />
                Explore Our Facilities
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gym Locations Section */}
      <GymLocationsSection />

      {/* ChadBot - Only on homepage */}
      <ChadBot />
    </div>
  );
};
export default HomePage;
