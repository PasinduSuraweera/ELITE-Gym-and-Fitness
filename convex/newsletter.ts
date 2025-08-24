import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Subscribe to newsletter
export const subscribeToNewsletter = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    source: v.string(), // "blog", "homepage", "footer", etc.
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existingSubscription = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingSubscription) {
      if (existingSubscription.status === "unsubscribed") {
        // Resubscribe
        await ctx.db.patch(existingSubscription._id, {
          status: "subscribed",
          subscribedAt: Date.now(),
          unsubscribedAt: undefined,
          source: args.source,
          name: args.name || existingSubscription.name,
        });
        return { success: true, message: "Successfully resubscribed!" };
      } else {
        return { success: false, message: "Email already subscribed" };
      }
    }

    // Create new subscription
    await ctx.db.insert("newsletter", {
      email: args.email,
      name: args.name,
      status: "subscribed",
      source: args.source,
      subscribedAt: Date.now(),
    });

    return { success: true, message: "Successfully subscribed!" };
  },
});

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!subscription) {
      return { success: false, message: "Email not found" };
    }

    await ctx.db.patch(subscription._id, {
      status: "unsubscribed",
      unsubscribedAt: Date.now(),
    });

    return { success: true, message: "Successfully unsubscribed!" };
  },
});

// Get newsletter subscribers (admin only)
export const getNewsletterSubscribers = query({
  args: {
    status: v.optional(v.union(v.literal("subscribed"), v.literal("unsubscribed"), v.literal("pending"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    let subscribers = await ctx.db
      .query("newsletter")
      .order("desc")
      .collect();

    if (args.status) {
      subscribers = subscribers.filter(sub => sub.status === args.status);
    }

    if (args.limit) {
      subscribers = subscribers.slice(0, args.limit);
    }

    return subscribers;
  },
});

// Get newsletter statistics
export const getNewsletterStats = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const allSubscribers = await ctx.db.query("newsletter").collect();

    const subscribed = allSubscribers.filter(sub => sub.status === "subscribed").length;
    const unsubscribed = allSubscribers.filter(sub => sub.status === "unsubscribed").length;
    const pending = allSubscribers.filter(sub => sub.status === "pending").length;

    // Group by source
    const sources = allSubscribers.reduce((acc, sub) => {
      acc[sub.source] = (acc[sub.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent subscriptions (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentSubscriptions = allSubscribers.filter(
      sub => sub.subscribedAt > thirtyDaysAgo && sub.status === "subscribed"
    ).length;

    return {
      total: allSubscribers.length,
      subscribed,
      unsubscribed,
      pending,
      sources,
      recentSubscriptions,
    };
  },
});
