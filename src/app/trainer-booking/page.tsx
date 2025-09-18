"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  Calendar,
  Filter,
  Users,
  User,
  Award,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

const TrainerBookingPage = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // Check if user has active membership
  const currentMembership = useQuery(
    api.memberships.getUserMembership,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const trainers = useQuery(api.bookings.searchTrainers, {
    searchTerm: searchTerm || undefined,
    specialization: selectedSpecialization || undefined,
    date: selectedDate || undefined,
    timeSlot: selectedTimeSlot || undefined,
    minRating: minRating > 0 ? minRating : undefined,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const specializations = [
    { value: "", label: "All Specializations" },
    { value: "personal_training", label: "Personal Training" },
    { value: "zumba", label: "Zumba Classes" },
    { value: "yoga", label: "Yoga" },
    { value: "crossfit", label: "CrossFit" },
    { value: "cardio", label: "Cardio Training" },
    { value: "strength", label: "Strength Training" },
    { value: "nutrition_consultation", label: "Nutrition Consultation" },
    { value: "group_class", label: "Group Classes" },
  ];

  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00"
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!mounted || !dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const hasActiveMembership = currentMembership?.status === "active";

  const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
          }`}
        />
      ))}
      <span className="text-sm text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-800 rounded-lg"></div>
            <div className="h-64 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10 flex-1" suppressHydrationWarning>
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16" suppressHydrationWarning>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Book a <span className="text-red-500">Personal Trainer</span>
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            Find and book sessions with certified fitness professionals tailored to your goals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto mb-12 space-y-8">
          {/* Search Bar */}
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search trainers by name, experience, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 bg-black/50 border border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20 text-base"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-6 justify-center items-center">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-base text-gray-400">Filters:</span>
            </div>
            
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white text-base focus:border-red-500 focus:ring-red-500/20"
            >
              {specializations.map((spec) => (
                <option key={spec.value} value={spec.value} className="bg-black">
                  {spec.label}
                </option>
              ))}
            </select>

            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-auto px-4 py-3 bg-black/50 border border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20 text-base"
            />

            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white text-base focus:border-red-500 focus:ring-red-500/20"
            >
              <option value="" className="bg-black">Any Time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time} className="bg-black">
                  {time}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-3">
              <span className="text-base text-gray-400">Rating:</span>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-base text-white min-w-[4rem]">{minRating || "Any"}⭐</span>
            </div>

            {(searchTerm || selectedSpecialization || selectedDate || selectedTimeSlot || minRating > 0) && (
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialization("");
                  setSelectedDate("");
                  setSelectedTimeSlot("");
                  setMinRating(0);
                }}
                className="px-6 py-3 border-red-500/30 text-red-400 hover:bg-red-500/10 text-base font-medium"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto">
        {trainers && trainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer) => (
              <Card
                key={trainer._id}
                className="bg-gray-900/50 border border-gray-800 hover:border-red-500/50 transition-all duration-300 group hover:shadow-lg"
              >
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800">
                        {trainer.profileImage ? (
                          <img
                            src={trainer.profileImage}
                            alt={trainer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-10 w-10 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
                          {trainer.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <StarRating rating={trainer.rating} />
                          <span className="text-sm text-gray-400">
                            ({trainer.totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 flex flex-col h-full">
                  <CardDescription className="text-gray-400 line-clamp-3 text-base leading-relaxed">
                    {trainer.bio}
                  </CardDescription>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2">
                    {trainer.specializations.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-md"
                      >
                        {spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                    {trainer.specializations.length > 3 && (
                      <span className="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-md">
                        +{trainer.specializations.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center flex-grow">
                    <div>
                      <div className="text-xl font-bold text-white">{trainer.totalSessions}</div>
                      <div className="text-sm text-gray-400">Sessions</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {trainer.experience}
                      </div>
                      <div className="text-sm text-gray-400">Experience</div>
                    </div>
                  </div>

                  {/* Action Buttons - Always at bottom */}
                  <div className="flex gap-3 mt-auto pt-4">
                    <Link href={`/trainer-profile/${trainer._id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full py-3 border-gray-700 text-gray-300 hover:bg-gray-800 text-base font-medium"
                      >
                        View Profile
                      </Button>
                    </Link>
                    {hasActiveMembership ? (
                      <Link href={`/book-session/${trainer._id}`} className="flex-1">
                        <Button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-base font-medium">
                          Book Session
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        disabled
                        className="flex-1 py-3 bg-gray-700 text-gray-400 cursor-not-allowed text-base font-medium"
                        title="Membership required"
                      >
                        Book Session
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="h-20 w-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No Trainers Found</h3>
            <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto leading-relaxed">
              {searchTerm || selectedSpecialization || selectedDate
                ? "Try adjusting your search criteria or filters"
                : "No trainers are currently available"}
            </p>
            {(searchTerm || selectedSpecialization || selectedDate || selectedTimeSlot || minRating > 0) && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialization("");
                  setSelectedDate("");
                  setSelectedTimeSlot("");
                  setMinRating(0);
                }}
                variant="outline"
                className="px-6 py-3 border-red-500/30 text-red-400 hover:bg-red-500/10 text-base font-medium"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TrainerBookingPage;
