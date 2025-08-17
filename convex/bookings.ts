import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new booking (only for subscribed users)
export const createBooking = mutation({
  args: {
    userId: v.id("users"),
    trainerId: v.id("trainerProfiles"),
    userClerkId: v.string(),
    sessionType: v.union(
      v.literal("personal_training"),
      v.literal("zumba"),
      v.literal("yoga"),
      v.literal("crossfit"),
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("nutrition_consultation"),
      v.literal("group_class")
    ),
    sessionDate: v.string(),
    startTime: v.string(),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user has active membership
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userClerkId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) {
      throw new Error("Active membership required to book sessions");
    }

    // Get trainer profile
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) {
      throw new Error("Trainer not found");
    }

    // Calculate end time
    const startMinutes = timeToMinutes(args.startTime);
    const endTime = minutesToTime(startMinutes + args.duration);

    // Check for conflicts
    const existingBooking = await ctx.db
      .query("bookings")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .filter((q) => 
        q.and(
          q.eq(q.field("sessionDate"), args.sessionDate),
          q.or(
            q.eq(q.field("status"), "confirmed"),
            q.eq(q.field("status"), "pending")
          )
        )
      )
      .collect();

    const hasConflict = existingBooking.some(booking => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);
      const newStart = startMinutes;
      const newEnd = startMinutes + args.duration;
      
      return (newStart < bookingEnd && newEnd > bookingStart);
    });

    if (hasConflict) {
      throw new Error("Time slot already booked");
    }

    // Calculate total amount (free for members)
    const totalAmount = 0; // Free with membership

    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      trainerClerkId: trainer.clerkId,
      endTime,
      status: "confirmed", // Auto-confirm for members
      totalAmount,
      paymentStatus: "included_with_membership", // Special status for free bookings
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return bookingId;
  },
});

// Create a new booking after successful payment (called from webhook)
export const createPaidBooking = mutation({
  args: {
    userId: v.id("users"),
    trainerId: v.id("trainerProfiles"),
    userClerkId: v.string(),
    sessionType: v.union(
      v.literal("personal_training"),
      v.literal("zumba"),
      v.literal("yoga"),
      v.literal("crossfit"),
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("nutrition_consultation"),
      v.literal("group_class")
    ),
    sessionDate: v.string(),
    startTime: v.string(),
    duration: v.number(),
    totalAmount: v.number(),
    paymentSessionId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("🏃‍♂️ createPaidBooking called with args:", JSON.stringify(args, null, 2));
    
    // Get trainer profile
    console.log("🔍 Looking up trainer:", args.trainerId);
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) {
      console.error("❌ Trainer not found for ID:", args.trainerId);
      
      // Debug: List available trainers
      const allTrainers = await ctx.db.query("trainerProfiles").collect();
      console.log("📋 Available trainers:", allTrainers.length);
      if (allTrainers.length > 0) {
        console.log("👥 Sample trainer IDs:", allTrainers.slice(0, 3).map(t => t._id));
      }
      
      throw new Error(`Trainer not found with ID: ${args.trainerId}`);
    }
    
    console.log("✅ Trainer found:", trainer.name);

    // Calculate end time
    const startMinutes = timeToMinutes(args.startTime);
    const endTime = minutesToTime(startMinutes + args.duration);
    console.log("⏰ Calculated end time:", endTime);

    // Check if booking with this payment session already exists (prevent duplicates)
    const existingBooking = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("paymentSessionId"), args.paymentSessionId))
      .first();

    if (existingBooking) {
      console.log("⚠️ Booking already exists for payment session:", args.paymentSessionId);
      return existingBooking._id;
    }

    console.log("📝 Creating booking record...");
    const bookingData = {
      userId: args.userId,
      trainerId: args.trainerId,
      userClerkId: args.userClerkId,
      trainerClerkId: trainer.clerkId,
      sessionType: args.sessionType,
      sessionDate: args.sessionDate,
      startTime: args.startTime,
      endTime,
      duration: args.duration,
      status: "confirmed" as const, // Paid bookings are automatically confirmed
      totalAmount: args.totalAmount,
      paymentStatus: "paid" as const, // Payment completed
      paymentSessionId: args.paymentSessionId,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    console.log("📊 Booking data to insert:", JSON.stringify(bookingData, null, 2));

    const bookingId = await ctx.db.insert("bookings", bookingData);
    
    console.log("✅ Booking created with ID:", bookingId);
    return bookingId;
  },
});

// Test function to manually create a booking (for development testing)
export const createTestBooking = mutation({
  args: {
    userClerkId: v.string(),
    trainerId: v.id("trainerProfiles"),
    sessionType: v.union(
      v.literal("personal_training"),
      v.literal("zumba"),
      v.literal("yoga"),
      v.literal("crossfit"),
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("nutrition_consultation"),
      v.literal("group_class")
    ),
    sessionDate: v.string(),
    startTime: v.string(),
    duration: v.number(),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    // Get user from Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userClerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get trainer profile
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) {
      throw new Error("Trainer not found");
    }

    // Calculate end time
    const startMinutes = timeToMinutes(args.startTime);
    const endTime = minutesToTime(startMinutes + args.duration);

    const bookingId = await ctx.db.insert("bookings", {
      userId: user._id,
      trainerId: args.trainerId,
      userClerkId: args.userClerkId,
      trainerClerkId: trainer.clerkId,
      sessionType: args.sessionType,
      sessionDate: args.sessionDate,
      startTime: args.startTime,
      endTime,
      duration: args.duration,
      status: "confirmed",
      totalAmount: args.totalAmount,
      paymentStatus: "paid",
      paymentSessionId: `test_${Date.now()}`,
      notes: "Test booking created manually",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("Test booking created:", bookingId);
    return bookingId;
  },
});

// Get user bookings
export const getUserBookings = query({
  args: { 
    userClerkId: v.string(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    )),
  },
  handler: async (ctx, args) => {
    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.userClerkId))
      .order("desc")
      .collect();

    if (args.status) {
      bookings = bookings.filter(booking => booking.status === args.status);
    }

    // Enrich with trainer information
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const trainer = await ctx.db.get(booking.trainerId);
        return {
          ...booking,
          trainerName: trainer?.name || "Unknown Trainer",
          trainerImage: trainer?.profileImage,
          trainerSpecializations: trainer?.specializations || [],
        };
      })
    );

    return enrichedBookings;
  },
});

// Get trainer bookings
export const getTrainerBookings = query({
  args: { 
    trainerClerkId: v.string(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    )),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bookings = await ctx.db
      .query("bookings")
      .withIndex("by_trainer_clerk", (q) => q.eq("trainerClerkId", args.trainerClerkId))
      .order("desc")
      .collect();

    if (args.status) {
      bookings = bookings.filter(booking => booking.status === args.status);
    }

    if (args.date) {
      bookings = bookings.filter(booking => booking.sessionDate === args.date);
    }

    // Enrich with user information
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const user = await ctx.db.get(booking.userId);
        return {
          ...booking,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || "Unknown Email",
        };
      })
    );

    return enrichedBookings;
  },
});

// Update booking status
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    ),
    cancellationReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { bookingId, status, cancellationReason } = args;

    await ctx.db.patch(bookingId, {
      status,
      cancellationReason,
      updatedAt: Date.now(),
    });

    // If completed, increment trainer's session count
    if (status === "completed") {
      const booking = await ctx.db.get(bookingId);
      if (booking) {
        const trainer = await ctx.db.get(booking.trainerId);
        if (trainer) {
          await ctx.db.patch(booking.trainerId, {
            totalSessions: trainer.totalSessions + 1,
            updatedAt: Date.now(),
          });
        }
      }
    }

    return { success: true };
  },
});

// Search trainers with filters
export const searchTrainers = query({
  args: {
    searchTerm: v.optional(v.string()),
    specialization: v.optional(v.string()),
    date: v.optional(v.string()),
    timeSlot: v.optional(v.string()),
    minRating: v.optional(v.number()),
    maxHourlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let trainers = await ctx.db
      .query("trainerProfiles")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Enrich with live user data from Clerk
    const trainersWithLiveNames = await Promise.all(
      trainers.map(async (trainer) => {
        const user = await ctx.db.get(trainer.userId);
        return {
          ...trainer,
          // Use live user name if available, fallback to stored name
          name: user?.name || trainer.name,
          // Use live user profile image if available, fallback to stored image
          profileImage: user?.image || trainer.profileImage,
        };
      })
    );

    // Filter by search term (name, bio, experience)
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      trainers = trainersWithLiveNames.filter(trainer => 
        trainer.name.toLowerCase().includes(term) ||
        trainer.bio.toLowerCase().includes(term) ||
        trainer.experience.toLowerCase().includes(term)
      );
    } else {
      trainers = trainersWithLiveNames;
    }

    // Filter by specialization
    if (args.specialization) {
      trainers = trainers.filter(trainer => 
        trainer.specializations.includes(args.specialization!)
      );
    }

    // Filter by rating
    if (args.minRating) {
      trainers = trainers.filter(trainer => trainer.rating >= args.minRating!);
    }

    // Filter by hourly rate
    if (args.maxHourlyRate) {
      trainers = trainers.filter(trainer => trainer.hourlyRate <= args.maxHourlyRate!);
    }

    // If date and time are provided, filter by availability
    if (args.date && args.timeSlot) {
      const availableTrainers: typeof trainers = [];
      
      for (const trainer of trainers) {
        const availableSlots = await ctx.runQuery("availability:getAvailableTimeSlots" as any, {
          trainerId: trainer._id,
          date: args.date,
          duration: 60, // Default 1 hour session
        });
        
        const hasTimeSlot = availableSlots.some((slot: any) => 
          slot.startTime === args.timeSlot
        );
        
        if (hasTimeSlot) {
          availableTrainers.push(trainer);
        }
      }
      
      trainers = availableTrainers;
    }

    // Sort by rating (highest first)
    trainers.sort((a, b) => b.rating - a.rating);

    // Enrich with real session counts
    const enrichedTrainers = await Promise.all(
      trainers.map(async (trainer) => {
        const totalBookings = await ctx.db
          .query("bookings")
          .withIndex("by_trainer", (q) => q.eq("trainerId", trainer._id))
          .filter((q) => q.or(
            q.eq(q.field("status"), "completed"),
            q.eq(q.field("status"), "confirmed")
          ))
          .collect();
        
        return {
          ...trainer,
          totalSessions: totalBookings.length,
        };
      })
    );

    return enrichedTrainers;
  },
});

// Get booking details
export const getBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return null;

    const trainer = await ctx.db.get(booking.trainerId);
    const user = await ctx.db.get(booking.userId);

    return {
      ...booking,
      trainerName: trainer?.name || "Unknown Trainer",
      trainerImage: trainer?.profileImage,
      trainerEmail: trainer?.email,
      userName: user?.name || "Unknown User",
      userEmail: user?.email,
    };
  },
});

// Cancel booking (with refund logic)
export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    cancellationReason: v.string(),
    cancelledBy: v.union(v.literal("user"), v.literal("trainer")),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      throw new Error("Cannot cancel this booking");
    }

    // Check cancellation policy (24 hours before session)
    const sessionDateTime = new Date(`${booking.sessionDate} ${booking.startTime}`);
    const now = new Date();
    const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundStatus: "pending" | "paid" | "refunded" = "pending";
    if (hoursUntilSession >= 24) {
      refundStatus = "refunded"; // Full refund
    } else if (args.cancelledBy === "trainer") {
      refundStatus = "refunded"; // Full refund if trainer cancels
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancellationReason: args.cancellationReason,
      paymentStatus: refundStatus,
      updatedAt: Date.now(),
    });

    return { success: true, refundStatus };
  },
});

// Helper functions
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
