import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submitTrainerApplication = mutation({
  args: {
    experience: v.string(),
    certifications: v.string(),
    motivation: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if application already exists
    const existingApplication = await ctx.db
      .query("trainerApplications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingApplication) {
      throw new Error("Application already submitted");
    }

    const applicationId = await ctx.db.insert("trainerApplications", {
      userId: user._id,
      clerkId: identity.subject,
      name: user.name,
      email: user.email,
      experience: args.experience,
      certifications: args.certifications,
      motivation: args.motivation,
      status: "pending",
      submittedAt: Date.now(),
    });

    return applicationId;
  },
});

export const getTrainerApplications = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (currentUser?.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("trainerApplications").collect();
  },
});

export const getUserTrainerApplication = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    return await ctx.db
      .query("trainerApplications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

export const reviewTrainerApplication = mutation({
  args: {
    applicationId: v.id("trainerApplications"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can review applications");
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    // Update application status
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      reviewedAt: Date.now(),
      reviewedBy: currentUser._id,
      notes: args.notes,
    });

    // If approved, update user role to trainer
    if (args.status === "approved") {
      await ctx.db.patch(application.userId, {
        role: "trainer",
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});
