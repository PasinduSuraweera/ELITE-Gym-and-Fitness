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

// Get single marketplace item by ID (public)
export const getMarketplaceItemById = query({
  args: {
    itemId: v.id("marketplaceItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    
    if (!item || item.status !== "active") {
      return null;
    }
    
    return item;
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

// Seed marketplace with sample items
export const seedMarketplace = mutation({
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

    // Check if items already exist
    const existingItems = await ctx.db.query("marketplaceItems").collect();
    if (existingItems.length > 0) {
      return { message: "Marketplace already has items" };
    }

    const sampleItems = [
      // Supplements
      {
        name: "Premium Whey Protein Powder",
        description: "High-quality whey protein isolate with 25g protein per serving. Perfect for muscle building and recovery.",
        price: 8500,
        category: "supplements" as const,
        imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400",
        stock: 50,
        featured: true,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },
      {
        name: "BCAA Energy Drink Mix",
        description: "Branched-chain amino acids with natural caffeine for pre-workout energy and recovery.",
        price: 4500,
        category: "supplements" as const,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        stock: 75,
        featured: false,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },
      {
        name: "Creatine Monohydrate",
        description: "Pure creatine monohydrate for increased strength, power, and muscle mass.",
        price: 3200,
        category: "supplements" as const,
        imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=400",
        stock: 60,
        featured: false,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },

      // Equipment
      {
        name: "Adjustable Dumbbells Set",
        description: "Professional adjustable dumbbells ranging from 5kg to 50kg per dumbbell. Space-saving design.",
        price: 85000,
        category: "equipment" as const,
        imageUrl: "https://images.unsplash.com/photo-1434596922112-19c563067271?w=400",
        stock: 15,
        featured: true,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },
      {
        name: "Resistance Bands Set",
        description: "Complete set of resistance bands with handles, door anchor, and ankle straps.",
        price: 3500,
        category: "equipment" as const,
        imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400",
        stock: 100,
        featured: false,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },
      {
        name: "Yoga Mat Premium",
        description: "High-quality non-slip yoga mat with superior grip and cushioning. 6mm thickness.",
        price: 4500,
        category: "equipment" as const,
        imageUrl: "https://images.unsplash.com/photo-1506629905607-aeb36ad2ba2e?w=400",
        stock: 80,
        featured: false,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },

      // Apparel
      {
        name: "Elite Gym Performance T-Shirt",
        description: "Moisture-wicking performance shirt with Elite Gym branding. Comfortable fit for all workouts.",
        price: 2500,
        category: "apparel" as const,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        stock: 120,
        featured: true,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },
      {
        name: "Compression Leggings",
        description: "High-performance compression leggings for women. Four-way stretch fabric with squat-proof design.",
        price: 4200,
        category: "apparel" as const,
        imageUrl: "https://images.unsplash.com/photo-1506629905607-aeb36ad2ba2e?w=400",
        stock: 90,
        featured: false,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },

      // Accessories
      {
        name: "Smart Water Bottle",
        description: "Insulated smart water bottle that tracks your hydration. Keeps drinks cold for 24 hours.",
        price: 6500,
        category: "accessories" as const,
        imageUrl: "https://images.unsplash.com/photo-1502767882403-23013220e375?w=400",
        stock: 45,
        featured: false,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },
      {
        name: "Gym Towel Set",
        description: "Set of 3 premium microfiber gym towels. Quick-dry and antibacterial treated.",
        price: 1800,
        category: "accessories" as const,
        imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400",
        stock: 150,
        featured: false,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },

      // Nutrition
      {
        name: "Organic Protein Bars Box",
        description: "Box of 12 organic protein bars with 20g protein each. Multiple flavors available.",
        price: 3600,
        category: "nutrition" as const,
        imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400",
        stock: 200,
        featured: false,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },
      {
        name: "Pre-Workout Energy Drink",
        description: "Natural pre-workout energy drink with green tea extract and B-vitamins. Sugar-free formula.",
        price: 1200,
        category: "nutrition" as const,
        imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400",
        stock: 300,
        featured: false,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser._id,
      },
    ];

    // Insert all items
    for (const item of sampleItems) {
      await ctx.db.insert("marketplaceItems", item);
    }

    return { message: "Marketplace seeded successfully", count: sampleItems.length };
  },
});
