"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Star, Calendar, Clock, User, MessageCircle, Trophy } from "lucide-react";

interface ReviewFormData {
  rating: number;
  comment: string;
}

export default function ReviewsPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('booking');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 5,
    comment: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's bookings (completed ones can be reviewed)
  const userBookings = useQuery(api.bookings.getUserBookings,
    user ? { userClerkId: user.id } : "skip"
  );

  // Get user's existing reviews
  const userData = useQuery(api.users.getUserByClerkId, 
    user ? { clerkId: user.id } : "skip"
  );
  
  const userReviews = useQuery(api.reviews.getUserReviews,
    userData ? { userId: userData._id } : "skip"
  );

  // Create review mutation
  const createReview = useMutation(api.reviews.createReview);

  // Auto-select booking if passed as URL parameter
  useEffect(() => {
    if (bookingIdParam && userBookings) {
      const booking = userBookings.find(b => b._id === bookingIdParam && b.status === "completed");
      if (booking) {
        setSelectedBooking(booking);
      }
    }
  }, [bookingIdParam, userBookings]);

  const handleSubmitReview = async () => {
    if (!selectedBooking || !user) return;

    setIsSubmitting(true);
    try {
      await createReview({
        bookingId: selectedBooking._id,
        userId: selectedBooking.userId,
        trainerId: selectedBooking.trainerId,
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      });

      alert("Review submitted successfully!");
      setSelectedBooking(null);
      setReviewForm({ rating: 5, comment: "" });
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-300"
            }`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"></div>
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-white text-xl">Please sign in to view reviews.</div>
        </div>
      </div>
    );
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
            <span className="text-white">Reviews & </span>
            <span className="text-red-500">Feedback</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Share your experience and help others choose their trainer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reviewable Sessions */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Sessions to Review</h2>
            {userBookings && userBookings.filter(booking => 
              booking.status === "completed" && 
              !userReviews?.some(review => review.bookingId === booking._id)
            ).length > 0 ? (
              <div className="space-y-4">
                {userBookings
                  .filter(booking => 
                    booking.status === "completed" && 
                    !userReviews?.some(review => review.bookingId === booking._id)
                  )
                  .map((booking) => (
                  <Card key={booking._id} className="bg-gray-900/50 border border-gray-700/50 hover:border-red-500/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={booking.trainerImage || "/logo.png"}
                          alt={booking.trainerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{booking.trainerName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(booking.sessionDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{booking.startTime}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 capitalize mt-1">
                            {booking.sessionType.replace('_', ' ')} • LKR {booking.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => setSelectedBooking(booking)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900/50 border border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No sessions to review</p>
                  <p className="text-gray-500 text-sm mt-2">Complete a training session to leave a review</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Your Reviews */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Your Reviews</h2>
            {userReviews && userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <Card key={review._id} className="bg-gray-900/50 border border-gray-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.trainerImage || "/logo.png"}
                          alt={review.trainerName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-medium">{review.trainerName}</h3>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-300 text-sm mb-2">{review.comment}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatDate(review.createdAt)}</span>
                            <span className="capitalize">{review.sessionType?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900/50 border border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No reviews yet</p>
                  <p className="text-gray-500 text-sm mt-2">Your reviews will appear here after you submit them</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* All Bookings Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-6">All Your Bookings</h2>
          {userBookings && userBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userBookings.map((booking) => {
                const hasReview = userReviews?.some(review => review.bookingId === booking._id);
                const canReview = booking.status === "completed" && !hasReview;
                
                return (
                  <Card key={booking._id} className="bg-gray-900/50 border border-gray-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={booking.trainerImage || "/logo.png"}
                          alt={booking.trainerName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-sm">{booking.trainerName}</h3>
                          <p className="text-xs text-gray-400">
                            {new Date(booking.sessionDate).toLocaleDateString()} • {booking.startTime}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === "confirmed" ? "bg-green-900/30 text-green-300" :
                          booking.status === "pending" ? "bg-yellow-900/30 text-yellow-300" :
                          booking.status === "cancelled" ? "bg-red-900/30 text-red-300" :
                          booking.status === "completed" ? "bg-blue-900/30 text-blue-300" :
                          "bg-gray-900/30 text-gray-300"
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 capitalize mb-2">
                        {booking.sessionType.replace('_', ' ')} • LKR {booking.totalAmount.toLocaleString()}
                      </p>
                      
                      {booking.notes && (
                        <p className="text-xs text-gray-400 mb-3 italic">"{booking.notes}"</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {hasReview ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-400">Reviewed</span>
                          </div>
                        ) : canReview ? (
                          <Button
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-3"
                          >
                            Review
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {booking.status === "completed" ? "Session completed" : `Status: ${booking.status}`}
                          </span>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          {booking.duration} min
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gray-900/50 border border-gray-700/50">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No bookings yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  <a href="/trainer-booking" className="text-red-400 hover:text-red-300">
                    Book your first training session
                  </a>
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-900/95 border border-gray-700/50 max-w-md w-full">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <img
                    src={selectedBooking.trainerImage || "/logo.png"}
                    alt={selectedBooking.trainerName}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-white">{selectedBooking.trainerName}</h3>
                  <p className="text-gray-400">
                    {new Date(selectedBooking.sessionDate).toLocaleDateString()} • {selectedBooking.startTime}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-white font-medium mb-2">Rating</label>
                    <div className="flex justify-center">
                      {renderStars(reviewForm.rating, true, (rating) => 
                        setReviewForm(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-white font-medium mb-2">Comment (Optional)</label>
                    <Textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this trainer..."
                      className="w-full p-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 resize-none h-24 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => setSelectedBooking(null)}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
