"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Star, 
  User, 
  MapPin, 
  Award, 
  Phone, 
  Mail,
  BookOpen,
  TrendingUp,
  Users
} from "lucide-react";

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export default function TrainerProfilePage() {
  const { trainerId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Get trainer profile
  const trainerProfile = useQuery(api.trainerProfiles.getTrainerById, {
    trainerId: trainerId as Id<"trainerProfiles">
  });

  // Get trainer stats
  const trainerStats = useQuery(api.trainerProfiles.getTrainerStats, {
    trainerId: trainerId as Id<"trainerProfiles">
  });

  // Get trainer availability for next 7 days
  const generateNext7Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = generateNext7Days();
  const availabilityQueries = weekDates.map(date => 
    useQuery(api.availability.getAvailableTimeSlots, {
      trainerId: trainerId as Id<"trainerProfiles">,
      date,
      duration: 60
    })
  );

  // Get trainer reviews
  const trainerReviews = useQuery(api.reviews.getTrainerReviews, {
    trainerId: trainerId as Id<"trainerProfiles">,
    limit: 10
  });

  if (!trainerProfile) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-black"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading trainer profile...</div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
      />
    ));
  };

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-red-950/10" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(220,38,38,0.05)_0%,transparent_50%)]" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(234,88,12,0.05)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10 flex-1">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Profile Info */}
          <Card className="lg:col-span-2 bg-gray-900/50 backdrop-blur-md border border-gray-800/50 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={trainerProfile.profileImage || "/logo.png"}
                    alt={trainerProfile.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto md:mx-0 border-2 border-red-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-white mb-2">{trainerProfile.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {renderStars(Math.floor(trainerProfile.rating || 0))}
                  </div>
                  <span className="text-white font-medium">{trainerProfile.rating?.toFixed(1) || "New"}</span>
                  <span className="text-gray-400 text-sm">({trainerProfile.totalReviews || 0} reviews)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Award className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{trainerProfile.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{trainerStats?.totalSessions || 0} sessions completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 md:col-span-2">
                    <Mail className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{trainerProfile.email}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {trainerProfile.specializations.map((spec: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-red-600/20 text-red-300 border border-red-500/30 text-xs">
                      {spec.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => router.push(`/book-session/${trainerId}`)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">This Month</span>
                <span className="text-white font-medium">{trainerStats?.thisMonthBookings || 0} sessions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Session Type</span>
                <span className="text-green-400 font-medium">Included</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Joined</span>
                <span className="text-white font-medium">
                  {formatDate(trainerProfile.createdAt).split(',')[0]}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="availability" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Availability</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Reviews</TabsTrigger>
            <TabsTrigger value="programs" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* About */}
              <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                <p className="text-gray-300 leading-relaxed">
                  {trainerProfile.bio || "This trainer hasn't added a bio yet."}
                </p>
              </Card>

              {/* Certifications */}
              <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Certifications</h3>
                {trainerProfile.certifications && trainerProfile.certifications.length > 0 ? (
                  <div className="space-y-3">
                    {trainerProfile.certifications.map((cert: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-gray-300">
                        <Award className="h-4 w-4 text-yellow-400" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No certifications listed.</p>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
            <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Next 7 Days Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                {weekDates.map((date, index) => {
                  const dateObj = new Date(date);
                  const slots = availabilityQueries[index];
                  
                  return (
                    <div key={date} className="text-center">
                      <div className="bg-gray-800/50 rounded-lg p-3 mb-3 border border-gray-700/30">
                        <p className="text-white font-medium">
                          {dateObj.toLocaleDateString('en', { weekday: 'short' })}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {dateObj.getDate()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {slots && slots.length > 0 ? (
                          slots.slice(0, 3).map((slot, slotIndex) => (
                            <div key={slotIndex} className="bg-green-600/20 text-green-300 text-xs py-1 px-2 rounded border border-green-600/30">
                              {slot.startTime}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-xs">No slots</div>
                        )}
                        {slots && slots.length > 3 && (
                          <div className="text-gray-400 text-xs">+{slots.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Client Reviews</h3>
              <div className="space-y-6">
                {trainerReviews && trainerReviews.length > 0 ? (
                  trainerReviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-700/30 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">{review.userName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-gray-400 text-sm">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-300">{review.comment}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No reviews yet</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="mt-6">
            <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Training Programs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainerProfile.specializations.map((spec: string, index: number) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-white font-medium capitalize">{spec.replace('_', ' ')}</h4>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">
                      Specialized {spec.replace('_', ' ')} training program designed for all fitness levels.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-medium">Included</span>
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/book-session/${trainerId}`)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
