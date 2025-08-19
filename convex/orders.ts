import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create order from cart
export const createOrderFromCart = mutation({
  args: {
    clerkId: v.string(),
    shippingAddress: v.object({
      name: v.string(),
      phone: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      postalCode: v.string(),
      country: v.string(),
      email: v.optional(v.string()), // Add email field to match what Stripe sends
    }),
    stripeSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.clerkId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Prepare order items and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);
      
      if (!product) {
        throw new Error(`Product ${cartItem.productId} not found`);
      }

      if (product.status !== "active") {
        throw new Error(`Product ${product.name} is no longer available`);
      }

      if (product.stock < cartItem.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available`);
      }

      const itemTotal = cartItem.quantity * cartItem.priceAtTime;
      subtotal += itemTotal;

      orderItems.push({
        productId: cartItem.productId,
        productName: product.name,
        quantity: cartItem.quantity,
        pricePerItem: cartItem.priceAtTime,
        totalPrice: itemTotal,
      });

      // Update product stock
      await ctx.db.patch(cartItem.productId, {
        stock: product.stock - cartItem.quantity,
        updatedAt: Date.now(),
      });
    }

    // Calculate shipping and tax
    const shippingCost = calculateShipping(subtotal, args.shippingAddress.city);
    const tax = calculateTax(subtotal);
    const totalAmount = subtotal + shippingCost + tax;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      userClerkId: args.clerkId,
      orderNumber,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      currency: "LKR",
      status: "pending",
      paymentStatus: "pending",
      stripeSessionId: args.stripeSessionId,
      shippingAddress: args.shippingAddress,
      estimatedDelivery: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Clear cart
    await Promise.all(
      cartItems.map((item) => ctx.db.delete(item._id))
    );

    return { orderId, orderNumber, totalAmount };
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    trackingNumber: v.optional(v.string()),
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
      throw new Error("Unauthorized: Admin access required");
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.trackingNumber) updates.trackingNumber = args.trackingNumber;
    if (args.notes) updates.notes = args.notes;

    await ctx.db.patch(args.orderId, updates);
    return true;
  },
});

// Update payment status (called by webhook)
export const updatePaymentStatus = mutation({
  args: {
    stripeSessionId: v.string(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripe_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();

    if (!order) {
      throw new Error("Order not found for Stripe session");
    }

    const updates: any = {
      paymentStatus: args.paymentStatus,
      updatedAt: Date.now(),
    };

    if (args.stripePaymentIntentId) {
      updates.stripePaymentIntentId = args.stripePaymentIntentId;
    }

    // If payment is successful, confirm the order
    if (args.paymentStatus === "paid") {
      updates.status = "confirmed";
    }

    await ctx.db.patch(order._id, updates);
    return order;
  },
});

// Get user orders
export const getUserOrders = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.clerkId))
      .order("desc")
      .collect();
  },
});

// Get order by ID
export const getOrderById = query({
  args: { 
    orderId: v.id("orders"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    // Verify ownership (or admin)
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (order.userClerkId !== args.clerkId && currentUser?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return order;
  },
});

// Get all orders (admin only)
export const getAllOrders = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
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

    let orders;
    if (args.status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    } else {
      orders = await ctx.db
        .query("orders")
        .order("desc")
        .collect();
    }

    if (args.limit) {
      orders = orders.slice(0, args.limit);
    }

    return orders;
  },
});

// Calculate shipping cost based on subtotal and location
function calculateShipping(subtotal: number, city: string): number {
  // Free shipping for orders over LKR 10,000
  if (subtotal >= 10000) {
    return 0;
  }

  // Colombo area - LKR 500
  const colomboAreas = ["colombo", "dehiwala", "mount lavinia", "nugegoda", "maharagama", "kotte"];
  if (colomboAreas.some(area => city.toLowerCase().includes(area))) {
    return 500;
  }

  // Other major cities - LKR 750
  const majorCities = ["kandy", "galle", "jaffna", "negombo", "kurunegala", "ratnapura"];
  if (majorCities.some(cityName => city.toLowerCase().includes(cityName))) {
    return 750;
  }

  // Remote areas - LKR 1000
  return 1000;
}

// Calculate tax (VAT in Sri Lanka is typically 18% on applicable items)
function calculateTax(subtotal: number): number {
  // Simplified tax calculation - 18% VAT
  return Math.round(subtotal * 0.18);
}

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EGF-${timestamp.slice(-8)}-${random}`;
}

// Get order statistics (admin only)
export const getOrderStats = query({
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

    const allOrders = await ctx.db.query("orders").collect();
    
    const stats = {
      totalOrders: allOrders.length,
      totalRevenue: allOrders
        .filter(order => order.paymentStatus === "paid")
        .reduce((sum, order) => sum + order.totalAmount, 0),
      pendingOrders: allOrders.filter(order => order.status === "pending").length,
      processingOrders: allOrders.filter(order => order.status === "processing").length,
      shippedOrders: allOrders.filter(order => order.status === "shipped").length,
      deliveredOrders: allOrders.filter(order => order.status === "delivered").length,
      cancelledOrders: allOrders.filter(order => order.status === "cancelled").length,
    };

    return stats;
  },
});
