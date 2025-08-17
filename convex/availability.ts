import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add trainer availability
export const addAvailability = mutation({
  args: {
    trainerId: v.id("trainerProfiles"),
    dayOfWeek: v.union(
      v.literal("monday"),
      v.literal("tuesday"),
      v.literal("wednesday"),
      v.literal("thursday"),
      v.literal("friday"),
      v.literal("saturday"),
      v.literal("sunday")
    ),
    startTime: v.string(),
    endTime: v.string(),
    isRecurring: v.boolean(),
    specificDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const availabilityId = await ctx.db.insert("trainerAvailability", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });

    return availabilityId;
  },
});

// Get trainer availability
export const getTrainerAvailability = query({
  args: { 
    trainerId: v.id("trainerProfiles"),
    date: v.optional(v.string()), // "2025-08-20"
  },
  handler: async (ctx, args) => {
    let availability = await ctx.db
      .query("trainerAvailability")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.date) {
      const dayOfWeek = new Date(args.date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Get both recurring availability for the day and specific date availability
      availability = availability.filter(slot => 
        (slot.isRecurring && slot.dayOfWeek === dayOfWeek) ||
        (!slot.isRecurring && slot.specificDate === args.date)
      );
    }

    return availability;
  },
});

// Get available time slots for a trainer on a specific date
export const getAvailableTimeSlots = query({
  args: {
    trainerId: v.id("trainerProfiles"),
    date: v.string(), // "2025-08-20"
    duration: v.number(), // session duration in minutes
  },
  handler: async (ctx, args) => {
    const dayOfWeek = new Date(args.date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Get trainer availability for this day
    const availability = await ctx.db
      .query("trainerAvailability")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const dayAvailability = availability.filter(slot => 
      (slot.isRecurring && slot.dayOfWeek === dayOfWeek) ||
      (!slot.isRecurring && slot.specificDate === args.date)
    );

    if (dayAvailability.length === 0) {
      return [];
    }

    // Get existing bookings for this date
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .filter((q) => 
        q.and(
          q.eq(q.field("sessionDate"), args.date),
          q.or(
            q.eq(q.field("status"), "confirmed"),
            q.eq(q.field("status"), "pending")
          )
        )
      )
      .collect();

    // Generate available time slots
    const availableSlots: Array<{startTime: string, endTime: string}> = [];

    for (const availSlot of dayAvailability) {
      const startMinutes = timeToMinutes(availSlot.startTime);
      const endMinutes = timeToMinutes(availSlot.endTime);
      
      // Generate slots every 30 minutes
      for (let minutes = startMinutes; minutes + args.duration <= endMinutes; minutes += 30) {
        const slotStart = minutesToTime(minutes);
        const slotEnd = minutesToTime(minutes + args.duration);
        
        // Check if this slot conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
          const bookingStart = timeToMinutes(booking.startTime);
          const bookingEnd = timeToMinutes(booking.endTime);
          const slotStartMin = minutes;
          const slotEndMin = minutes + args.duration;
          
          return (slotStartMin < bookingEnd && slotEndMin > bookingStart);
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: slotStart,
            endTime: slotEnd
          });
        }
      }
    }

    return availableSlots;
  },
});

// Remove availability slot
export const removeAvailability = mutation({
  args: { availabilityId: v.id("trainerAvailability") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.availabilityId, { isActive: false });
    return { success: true };
  },
});

// Bulk set weekly availability
export const setWeeklyAvailability = mutation({
  args: {
    trainerId: v.id("trainerProfiles"),
    schedule: v.array(v.object({
      dayOfWeek: v.union(
        v.literal("monday"),
        v.literal("tuesday"),
        v.literal("wednesday"),
        v.literal("thursday"),
        v.literal("friday"),
        v.literal("saturday"),
        v.literal("sunday")
      ),
      startTime: v.string(),
      endTime: v.string(),
      isActive: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // First, deactivate all existing recurring availability
    const existingAvailability = await ctx.db
      .query("trainerAvailability")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .filter((q) => q.eq(q.field("isRecurring"), true))
      .collect();

    for (const slot of existingAvailability) {
      await ctx.db.patch(slot._id, { isActive: false });
    }

    // Add new availability slots
    for (const scheduleItem of args.schedule) {
      if (scheduleItem.isActive) {
        await ctx.db.insert("trainerAvailability", {
          trainerId: args.trainerId,
          dayOfWeek: scheduleItem.dayOfWeek,
          startTime: scheduleItem.startTime,
          endTime: scheduleItem.endTime,
          isRecurring: true,
          isActive: true,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
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
