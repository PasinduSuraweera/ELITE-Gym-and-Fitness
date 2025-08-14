import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      {/* Hero Section */}
      <section className="relative z-10 py-24 flex-grow pt-32">
        <div className="container mx-auto px-4" suppressHydrationWarning>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative min-h-[600px]" suppressHydrationWarning>
            {/* LEFT SIDE CONTENT */}
            <div className="lg:col-span-7 space-y-8 relative" suppressHydrationWarning>
              <div className="space-y-6" suppressHydrationWarning>
                <h2 className="text-3xl md:text-4xl font-normal text-white">
                  Your Goals,
                </h2>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="text-red-500">Your Fitness Journey</span>
                </h1>
                <h3 className="text-2xl md:text-3xl font-medium text-white">
                  Powered By Elite Gym & Fitness
                </h3>
              </div>

              <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                Join The Elite Gym & Fitness Experience And Take Full Control Of Your Fitness Journey. From AI-Powered
                Workout And Diet Plans To Expert Trainer Support, Real-Time Bookings, And A Thriving Fitness Community —
                Everything You Need Is In One Platform. Ready To Train Smarter, Eat Better, And Stay Motivated?
              </p>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button
                  size="lg"
                  asChild
                  className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 text-lg font-semibold rounded-md transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                >
                  <Link href={"/generate-program"}>
                    Get Started
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black px-12 py-6 text-lg font-semibold rounded-md transition-all duration-300 bg-transparent"
                >
                  <Link href={"/generate-program"}>
                    Explore Plans
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE - HERO IMAGE */}
            <div className="lg:col-span-5 relative">
              <div className="relative">
                {/* Main Hero Image - Much bigger like the reference */}
                <div className="relative w-full h-[700px] lg:h-[800px]">
                  <Image
                    src="/hero-ai.png"
                    alt="Fitness trainer"
                    fill
                    className="object-contain object-center scale-200"
                    priority
                  />
                </div>
                
                {/* Statistics Badges positioned exactly like reference image - Made bigger */}
                {/* + 300 AI Generations - top right */}
                <div className="absolute top-6 right-4 bg-black/90 backdrop-blur-sm rounded-xl p-5 border border-orange-500/50 shadow-lg">
                  <div className="text-orange-500 font-bold text-2xl">+ 300</div>
                  <div className="text-white text-sm font-medium">AI Generations</div>
                </div>
                
                {/* + 20 Coaches - left side, upper middle */}
                <div className="absolute top-1/3 -left-6 bg-black/90 backdrop-blur-sm rounded-xl p-5 border border-orange-500/50 shadow-lg">
                  <div className="text-orange-500 font-bold text-2xl">+ 20</div>
                  <div className="text-white text-sm font-medium">Coaches</div>
                </div>
                
                {/* + 1000 Community - bottom left, overlapping figure */}
                <div className="absolute bottom-1/4 left-0 bg-black/90 backdrop-blur-sm rounded-xl p-5 border border-orange-500/50 shadow-lg z-10">
                  <div className="text-orange-500 font-bold text-2xl">+ 1000</div>
                  <div className="text-white text-sm font-medium">Community</div>
                </div>
                
                {/* + 30 Trainers - bottom right */}
                <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm rounded-xl p-5 border border-orange-500/50 shadow-lg">
                  <div className="text-orange-500 font-bold text-2xl">+ 30</div>
                  <div className="text-white text-sm font-medium">Trainers</div>
                </div>

                {/* Glow effects around the image */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-orange-500/10 rounded-3xl blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default HomePage;
