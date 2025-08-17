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
        <div className="text-center mb-12" suppressHydrationWarning>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Book a <span className="text-red-500">Personal Trainer</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find and book sessions with certified fitness professionals tailored to your goals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search trainers by name, experience, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filters:</span>
            </div>
            
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="bg-black/50 border border-red-500/30 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:ring-red-500/20"
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
              className="w-auto bg-black/50 border border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20"
            />

            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="bg-black/50 border border-red-500/30 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:ring-red-500/20"
            >
              <option value="" className="bg-black">Any Time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time} className="bg-black">
                  {time}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Rating:</span>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-white min-w-[3rem]">{minRating || "Any"}⭐</span>
            </div>

            {(searchTerm || selectedSpecialization || selectedDate || selectedTimeSlot || minRating > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialization("");
                  setSelectedDate("");
                  setSelectedTimeSlot("");
                  setMinRating(0);
                }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {trainers && trainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <Card
                key={trainer._id}
                className="bg-gray-900/50 border border-gray-800 hover:border-red-500/50 transition-all duration-300 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800">
                        {trainer.profileImage ? (
                          <img
                            src={trainer.profileImage}
                            alt={trainer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white group-hover:text-red-500 transition-colors">
                          {trainer.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={trainer.rating} />
                          <span className="text-xs text-gray-400">
                            ({trainer.totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-400 line-clamp-2">
                    {trainer.bio}
                  </CardDescription>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1">
                    {trainer.specializations.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded-full"
                      >
                        {spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                    {trainer.specializations.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                        +{trainer.specializations.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{trainer.totalSessions}</div>
                      <div className="text-xs text-gray-400">Sessions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        {trainer.experience}
                      </div>
                      <div className="text-xs text-gray-400">Experience</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/trainer-profile/${trainer._id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        View Profile
                      </Button>
                    </Link>
                    {hasActiveMembership ? (
                      <Link href={`/book-session/${trainer._id}`} className="flex-1">
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                          Book Session
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        disabled
                        className="flex-1 bg-gray-700 text-gray-400 cursor-not-allowed"
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
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Trainers Found</h3>
            <p className="text-gray-400 mb-4">
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
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerBookingPage;
