import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all marketplace items (public)
export const getMarketplaceItems = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let items;
    
    if (args.category) {
      items = await ctx.db
        .query("marketplaceItems")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .collect();
    } else if (args.featured !== undefined) {
      items = await ctx.db
        .query("marketplaceItems")
        .withIndex("by_featured", (q) => q.eq("featured", args.featured!))
        .collect();
    } else {
      items = await ctx.db.query("marketplaceItems").collect();
    }
    
    return items.filter(item => item.status === "active");
  },
});

// Get all items for admin (including inactive)
export const getAllMarketplaceItems = query({
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

    return await ctx.db.query("marketplaceItems").collect();
  },
});

// Create marketplace item (admin only)
export const createMarketplaceItem = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.union(
      v.literal("supplements"),
      v.literal("equipment"),
      v.literal("apparel"),
      v.literal("accessories"),
      v.literal("nutrition")
    ),
    imageUrl: v.optional(v.string()),
    stock: v.number(),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (currentUser?.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const itemId = await ctx.db.insert("marketplaceItems", {
      ...args,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: currentUser._id,
    });

    return itemId;
  },
});

// Update marketplace item (admin only)
export const updateMarketplaceItem = mutation({
  args: {
    itemId: v.id("marketplaceItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.union(
      v.literal("supplements"),
      v.literal("equipment"),
      v.literal("apparel"),
      v.literal("accessories"),
      v.literal("nutrition")
    )),
    imageUrl: v.optional(v.string()),
    stock: v.optional(v.number()),
    featured: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (currentUser?.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const { itemId, ...updateData } = args;
    
    await ctx.db.patch(itemId, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return itemId;
  },
});

// Delete marketplace item (admin only)
export const deleteMarketplaceItem = mutation({
  args: {
    itemId: v.id("marketplaceItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (currentUser?.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.itemId);
    return true;
  },
});

// Get marketplace stats (admin only)
export const getMarketplaceStats = query({
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

    const items = await ctx.db.query("marketplaceItems").collect();
    
    return {
      totalItems: items.length,
      activeItems: items.filter(item => item.status === "active").length,
      inactiveItems: items.filter(item => item.status === "inactive").length,
      featuredItems: items.filter(item => item.featured).length,
      totalValue: items.reduce((sum, item) => sum + (item.price * item.stock), 0),
    };
  },
});
