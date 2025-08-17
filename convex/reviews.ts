import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a review after session completion
export const createReview = mutation({
  args: {
    bookingId: v.id("bookings"),
    userId: v.id("users"),
    trainerId: v.id("trainerProfiles"),
    rating: v.number(), // 1-5
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if booking exists and is completed
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (booking.status !== "completed") {
      throw new Error("Can only review completed sessions");
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("trainerReviews")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .first();

    if (existingReview) {
      throw new Error("Review already exists for this booking");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Create review
    const reviewId = await ctx.db.insert("trainerReviews", {
      bookingId: args.bookingId,
      userId: args.userId,
      trainerId: args.trainerId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });

    // Update trainer's average rating
    await updateTrainerRating(ctx, args.trainerId);

    return reviewId;
  },
});

// Get reviews for a trainer
export const getTrainerReviews = query({
  args: {
    trainerId: v.id("trainerProfiles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const reviews = await ctx.db
      .query("trainerReviews")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .order("desc")
      .take(limit);

    // Get user details for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name || "Anonymous",
          userImage: user?.image,
        };
      })
    );

    return reviewsWithUsers;
  },
});

// Get user's reviews
export const getUserReviews = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("trainerReviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Get trainer details for each review
    const reviewsWithTrainers = await Promise.all(
      reviews.map(async (review) => {
        const trainer = await ctx.db.get(review.trainerId);
        const booking = await ctx.db.get(review.bookingId);
        return {
          ...review,
          trainerName: trainer?.name || "Unknown",
          trainerImage: trainer?.profileImage,
          sessionDate: booking?.sessionDate,
          sessionType: booking?.sessionType,
        };
      })
    );

    return reviewsWithTrainers;
  },
});

// Update trainer's average rating
async function updateTrainerRating(ctx: any, trainerId: any) {
  const reviews = await ctx.db
    .query("trainerReviews")
    .withIndex("by_trainer", (q: any) => q.eq("trainerId", trainerId))
    .collect();

  if (reviews.length === 0) {
    return;
  }

  const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await ctx.db.patch(trainerId, {
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    totalReviews: reviews.length,
    updatedAt: Date.now(),
  });
}

// Get bookings that can be reviewed (completed sessions without reviews)
export const getReviewableBookings = query({
  args: {
    userClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user from clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userClerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get completed bookings
    const completedBookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Filter out bookings that already have reviews
    const reviewableBookings = [];
    for (const booking of completedBookings) {
      const existingReview = await ctx.db
        .query("trainerReviews")
        .withIndex("by_booking", (q) => q.eq("bookingId", booking._id))
        .first();

      if (!existingReview) {
        const trainer = await ctx.db.get(booking.trainerId);
        reviewableBookings.push({
          ...booking,
          trainerName: trainer?.name || "Unknown",
          trainerImage: trainer?.profileImage,
        });
      }
    }

    return reviewableBookings.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Update review
export const updateReview = mutation({
  args: {
    reviewId: v.id("trainerReviews"),
    rating: v.optional(v.number()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    const updates: any = {};
    if (args.rating !== undefined) {
      if (args.rating < 1 || args.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      updates.rating = args.rating;
    }
    if (args.comment !== undefined) {
      updates.comment = args.comment;
    }

    await ctx.db.patch(args.reviewId, updates);

    // Update trainer's average rating if rating was changed
    if (args.rating !== undefined) {
      await updateTrainerRating(ctx, review.trainerId);
    }

    return { success: true };
  },
});

// Delete review
export const deleteReview = mutation({
  args: {
    reviewId: v.id("trainerReviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    const trainerId = review.trainerId;
    await ctx.db.delete(args.reviewId);

    // Update trainer's average rating
    await updateTrainerRating(ctx, trainerId);

    return { success: true };
  },
});
