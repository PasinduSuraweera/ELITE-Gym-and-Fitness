import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create trainer profile when trainer application is approved
export const createTrainerProfile = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    bio: v.string(),
    specializations: v.array(v.string()),
    experience: v.string(),
    certifications: v.array(v.string()),
    hourlyRate: v.number(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the user from the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if trainer profile already exists
    const existingProfile = await ctx.db
      .query("trainerProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingProfile) {
      throw new Error("Trainer profile already exists");
    }

    const profileId = await ctx.db.insert("trainerProfiles", {
      userId: user._id,
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      bio: args.bio,
      specializations: args.specializations,
      experience: args.experience,
      certifications: args.certifications,
      hourlyRate: args.hourlyRate,
      profileImage: args.profileImage,
      isActive: true,
      rating: 5.0,
      totalReviews: 0,
      totalSessions: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return profileId;
  },
});

// Get all active trainers
export const getActiveTrainers = query({
  args: {
    specialization: v.optional(v.string()),
    minRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let trainers = await ctx.db
      .query("trainerProfiles")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter by specialization if provided
    if (args.specialization) {
      trainers = trainers.filter(trainer => 
        trainer.specializations.includes(args.specialization!)
      );
    }

    // Filter by minimum rating if provided
    if (args.minRating) {
      trainers = trainers.filter(trainer => trainer.rating >= args.minRating!);
    }

    // Sort by rating (highest first)
    trainers.sort((a, b) => b.rating - a.rating);

    return trainers;
  },
});

// Get trainer by ID
export const getTrainerById = query({
  args: { trainerId: v.id("trainerProfiles") },
  handler: async (ctx, args) => {
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) return null;

    // Get live user data
    const user = await ctx.db.get(trainer.userId);
    
    return {
      ...trainer,
      // Use live user name if available, fallback to stored name
      name: user?.name || trainer.name,
      // Use live user profile image if available, fallback to stored image
      profileImage: user?.image || trainer.profileImage,
    };
  },
});

// Get trainer by clerk ID
export const getTrainerByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trainerProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Update trainer profile
export const updateTrainerProfile = mutation({
  args: {
    trainerId: v.id("trainerProfiles"),
    bio: v.optional(v.string()),
    specializations: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    certifications: v.optional(v.array(v.string())),
    hourlyRate: v.optional(v.number()),
    profileImage: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { trainerId, ...updates } = args;
    
    await ctx.db.patch(trainerId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update trainer's own profile (self-edit)
export const updateMyTrainerProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    experience: v.optional(v.string()),
    certifications: v.optional(v.array(v.string())),
    specializations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get the trainer's profile
    const trainerProfile = await ctx.db
      .query("trainerProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!trainerProfile) {
      throw new Error("Trainer profile not found");
    }

    // Update only the fields that were provided
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.experience !== undefined) updates.experience = args.experience;
    if (args.certifications !== undefined) updates.certifications = args.certifications;
    if (args.specializations !== undefined) updates.specializations = args.specializations;

    await ctx.db.patch(trainerProfile._id, updates);

    return { success: true };
  },
});

// Get trainer stats for dashboard
export const getTrainerStats = query({
  args: { trainerId: v.id("trainerProfiles") },
  handler: async (ctx, args) => {
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) return null;

    // Get total bookings
    const allBookings = await ctx.db
      .query("bookings")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .collect();

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthBookings = allBookings.filter(booking => 
      new Date(booking.createdAt) >= thisMonth
    );

    const completedSessions = allBookings.filter(booking => 
      booking.status === "completed"
    ).length;

    const upcomingSessions = allBookings.filter(booking => 
      booking.status === "confirmed" && 
      new Date(booking.sessionDate) > new Date()
    ).length;

    const totalEarnings = allBookings
      .filter(booking => booking.status === "completed")
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    return {
      totalSessions: completedSessions,
      upcomingSessions,
      thisMonthBookings: thisMonthBookings.length,
      totalEarnings,
      rating: trainer.rating,
      totalReviews: trainer.totalReviews,
    };
  },
});

// Update trainer rating (called after review)
export const updateTrainerRating = mutation({
  args: {
    trainerId: v.id("trainerProfiles"),
    newRating: v.number(),
  },
  handler: async (ctx, args) => {
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) throw new Error("Trainer not found");

    const totalReviews = trainer.totalReviews + 1;
    const newAverageRating = 
      ((trainer.rating * trainer.totalReviews) + args.newRating) / totalReviews;

    await ctx.db.patch(args.trainerId, {
      rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update trainer hourly rate
export const updateTrainerRate = mutation({
  args: {
    clerkId: v.string(),
    hourlyRate: v.number(),
  },
  handler: async (ctx, args) => {
    // Get trainer by clerk ID
    const trainer = await ctx.db
      .query("trainerProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!trainer) {
      throw new Error("Trainer profile not found");
    }

    // Validate rate (minimum 1000 LKR, maximum 50000 LKR)
    if (args.hourlyRate < 1000 || args.hourlyRate > 50000) {
      throw new Error("Hourly rate must be between LKR 1,000 and LKR 50,000");
    }

    await ctx.db.patch(trainer._id, {
      hourlyRate: args.hourlyRate,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
