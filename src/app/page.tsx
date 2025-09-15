"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import GymLocationsSection from "@/components/GymLocationsSection";

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
                <div className="absolute top-6 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-5 border border-border shadow-lg hover:shadow-primary/20 transition-all duration-300">
                  <div className="text-primary font-bold text-2xl">+ 300</div>
                  <div className="text-foreground text-sm font-medium">
                    AI Generations
                  </div>
                </div>

                {/* + 20 Coaches - left side, upper middle */}
                <div className="absolute top-1/3 -left-6 bg-background/95 backdrop-blur-sm rounded-xl p-5 border border-border shadow-lg hover:shadow-primary/20 transition-all duration-300">
                  <div className="text-primary font-bold text-2xl">+ 20</div>
                  <div className="text-foreground text-sm font-medium">
                    Coaches
                  </div>
                </div>

                {/* + 1000 Community - bottom left, overlapping figure */}
                <div className="absolute bottom-1/4 left-0 bg-background/95 backdrop-blur-sm rounded-xl p-5 border border-border shadow-lg z-10 hover:shadow-primary/20 transition-all duration-300">
                  <div className="text-primary font-bold text-2xl">
                    + 1000
                  </div>
                  <div className="text-foreground text-sm font-medium">
                    Community
                  </div>
                </div>

                {/* + 30 Trainers - bottom right */}
                <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-5 border border-border shadow-lg hover:shadow-primary/20 transition-all duration-300">
                  <div className="text-primary font-bold text-2xl">+ 30</div>
                  <div className="text-foreground text-sm font-medium">
                    Trainers
                  </div>
                </div>

                {/* Glow effects around the image */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-secondary/5 rounded-3xl blur-3xl dark:via-primary/10 dark:to-secondary/10"></div>
              </div>
            </div>
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
