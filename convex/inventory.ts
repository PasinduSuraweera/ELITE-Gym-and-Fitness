import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all inventory items
export const getAllInventory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    return await ctx.db
      .query("inventory")
      .order("desc")
      .collect();
  },
});

// Get inventory by category
export const getInventoryByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    return await ctx.db
      .query("inventory")
      .withIndex("by_category", (q) => q.eq("category", category as any))
      .order("desc")
      .collect();
  },
});

// Get inventory statistics
export const getInventoryStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const allItems = await ctx.db.query("inventory").collect();
    
    const stats = {
      totalItems: allItems.length,
      totalQuantity: allItems.reduce((sum, item) => sum + item.totalQuantity, 0),
      availableQuantity: allItems.reduce((sum, item) => sum + item.availableQuantity, 0),
      inUseQuantity: allItems.reduce((sum, item) => sum + item.inUseQuantity, 0),
      maintenanceQuantity: allItems.reduce((sum, item) => sum + item.maintenanceQuantity, 0),
      lowStockItems: allItems.filter(item => 
        item.minQuantityAlert && item.availableQuantity <= item.minQuantityAlert
      ).length,
      outOfOrderItems: allItems.filter(item => item.condition === "out_of_order").length,
      maintenanceNeeded: allItems.filter(item => 
        item.nextMaintenanceDate && item.nextMaintenanceDate <= Date.now()
      ).length,
      categories: {
        cardio: allItems.filter(item => item.category === "cardio").length,
        strength: allItems.filter(item => item.category === "strength").length,
        free_weights: allItems.filter(item => item.category === "free_weights").length,
        functional: allItems.filter(item => item.category === "functional").length,
        accessories: allItems.filter(item => item.category === "accessories").length,
        safety: allItems.filter(item => item.category === "safety").length,
        cleaning: allItems.filter(item => item.category === "cleaning").length,
        maintenance: allItems.filter(item => item.category === "maintenance").length,
      },
      conditionBreakdown: {
        excellent: allItems.filter(item => item.condition === "excellent").length,
        good: allItems.filter(item => item.condition === "good").length,
        fair: allItems.filter(item => item.condition === "fair").length,
        poor: allItems.filter(item => item.condition === "poor").length,
        out_of_order: allItems.filter(item => item.condition === "out_of_order").length,
      }
    };

    return stats;
  },
});

// Add new inventory item
export const addInventoryItem = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("free_weights"),
      v.literal("functional"),
      v.literal("accessories"),
      v.literal("safety"),
      v.literal("cleaning"),
      v.literal("maintenance")
    ),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    totalQuantity: v.number(),
    condition: v.union(
      v.literal("excellent"),
      v.literal("good"),
      v.literal("fair"),
      v.literal("poor"),
      v.literal("out_of_order")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("maintenance"),
      v.literal("retired")
    ),
    purchaseDate: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    vendor: v.optional(v.string()),
    warrantyExpiry: v.optional(v.number()),
    location: v.optional(v.string()),
    zone: v.optional(v.string()),
    minQuantityAlert: v.optional(v.number()),
    maxCapacity: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    manualUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const now = Date.now();
    
    const inventoryItem = await ctx.db.insert("inventory", {
      ...args,
      availableQuantity: args.totalQuantity,
      inUseQuantity: 0,
      maintenanceQuantity: 0,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    return inventoryItem;
  },
});

// Update inventory item
export const updateInventoryItem = mutation({
  args: {
    id: v.id("inventory"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("cardio"),
      v.literal("strength"),
      v.literal("free_weights"),
      v.literal("functional"),
      v.literal("accessories"),
      v.literal("safety"),
      v.literal("cleaning"),
      v.literal("maintenance")
    )),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    totalQuantity: v.optional(v.number()),
    availableQuantity: v.optional(v.number()),
    inUseQuantity: v.optional(v.number()),
    maintenanceQuantity: v.optional(v.number()),
    condition: v.optional(v.union(
      v.literal("excellent"),
      v.literal("good"),
      v.literal("fair"),
      v.literal("poor"),
      v.literal("out_of_order")
    )),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("maintenance"),
      v.literal("retired")
    )),
    purchaseDate: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    vendor: v.optional(v.string()),
    warrantyExpiry: v.optional(v.number()),
    location: v.optional(v.string()),
    zone: v.optional(v.string()),
    lastMaintenanceDate: v.optional(v.number()),
    nextMaintenanceDate: v.optional(v.number()),
    maintenanceNotes: v.optional(v.string()),
    minQuantityAlert: v.optional(v.number()),
    maxCapacity: v.optional(v.number()),
    usageCount: v.optional(v.number()),
    lastUsedDate: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    manualUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Inventory item not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return id;
  },
});

// Delete inventory item
export const deleteInventoryItem = mutation({
  args: { id: v.id("inventory") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Inventory item not found");
    }

    await ctx.db.delete(id);
    return id;
  },
});

// Update equipment usage (for checking in/out equipment)
export const updateEquipmentUsage = mutation({
  args: {
    id: v.id("inventory"),
    action: v.union(v.literal("check_out"), v.literal("check_in"), v.literal("maintenance")),
    quantity: v.optional(v.number()),
    userId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, action, quantity = 1, userId, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const item = await ctx.db.get(id);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    let updates: any = {
      updatedAt: Date.now(),
      updatedBy: user._id,
      usageCount: (item.usageCount || 0) + (action === "check_out" ? quantity : 0),
      lastUsedDate: action === "check_out" ? Date.now() : item.lastUsedDate,
    };

    switch (action) {
      case "check_out":
        if (item.availableQuantity < quantity) {
          throw new Error("Insufficient available quantity");
        }
        updates.availableQuantity = item.availableQuantity - quantity;
        updates.inUseQuantity = item.inUseQuantity + quantity;
        break;
        
      case "check_in":
        if (item.inUseQuantity < quantity) {
          throw new Error("Cannot check in more than what's in use");
        }
        updates.availableQuantity = item.availableQuantity + quantity;
        updates.inUseQuantity = item.inUseQuantity - quantity;
        break;
        
      case "maintenance":
        if (item.availableQuantity < quantity) {
          throw new Error("Insufficient available quantity for maintenance");
        }
        updates.availableQuantity = item.availableQuantity - quantity;
        updates.maintenanceQuantity = item.maintenanceQuantity + quantity;
        updates.lastMaintenanceDate = Date.now();
        if (notes) {
          updates.maintenanceNotes = notes;
        }
        break;
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Get items needing maintenance
export const getMaintenanceAlerts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    const now = Date.now();
    const allItems = await ctx.db.query("inventory").collect();
    
    return {
      overdue: allItems.filter(item => 
        item.nextMaintenanceDate && item.nextMaintenanceDate <= now
      ),
      upcoming: allItems.filter(item => 
        item.nextMaintenanceDate && 
        item.nextMaintenanceDate > now && 
        item.nextMaintenanceDate <= now + (7 * 24 * 60 * 60 * 1000) // Next 7 days
      ),
      lowStock: allItems.filter(item => 
        item.minQuantityAlert && item.availableQuantity <= item.minQuantityAlert
      ),
      outOfOrder: allItems.filter(item => item.condition === "out_of_order"),
    };
  },
});