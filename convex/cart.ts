import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user's cart
export const getUserCart = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.clerkId))
      .collect();

    // Get full product details for each cart item
    const cartWithProducts = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await ctx.db.get(cartItem.productId);
        return {
          ...cartItem,
          product,
        };
      })
    );

    return cartWithProducts.filter(item => item.product); // Filter out deleted products
  },
});

// Add item to cart
export const addToCart = mutation({
  args: {
    clerkId: v.string(),
    productId: v.id("marketplaceItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if product exists and is available
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.status !== "active") {
      throw new Error("Product is not available");
    }

    if (product.stock < args.quantity) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    // Check if item already exists in cart
    const existingCartItem = await ctx.db
      .query("cartItems")
      .withIndex("by_user_product", (q) => 
        q.eq("userClerkId", args.clerkId).eq("productId", args.productId)
      )
      .first();

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + args.quantity;
      
      if (newQuantity > product.stock) {
        throw new Error(`Cannot add ${args.quantity} more items. Only ${product.stock - existingCartItem.quantity} additional items available`);
      }

      await ctx.db.patch(existingCartItem._id, {
        quantity: newQuantity,
        updatedAt: Date.now(),
      });

      return existingCartItem._id;
    } else {
      // Create new cart item
      const cartItemId = await ctx.db.insert("cartItems", {
        userClerkId: args.clerkId,
        userId: user._id,
        productId: args.productId,
        quantity: args.quantity,
        priceAtTime: product.price, // Store price at time of adding to cart
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return cartItemId;
    }
  },
});

// Update cart item quantity
export const updateCartQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const cartItem = await ctx.db.get(args.cartItemId);
    
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // Verify ownership
    if (cartItem.userClerkId !== args.clerkId) {
      throw new Error("Unauthorized");
    }

    const product = await ctx.db.get(cartItem.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    if (args.quantity > product.stock) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    await ctx.db.patch(args.cartItemId, {
      quantity: args.quantity,
      updatedAt: Date.now(),
    });

    return args.cartItemId;
  },
});

// Remove item from cart
export const removeFromCart = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const cartItem = await ctx.db.get(args.cartItemId);
    
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // Verify ownership
    if (cartItem.userClerkId !== args.clerkId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.cartItemId);
    return true;
  },
});

// Clear entire cart
export const clearCart = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.clerkId))
      .collect();

    await Promise.all(
      cartItems.map((item) => ctx.db.delete(item._id))
    );

    return true;
  },
});

// Get cart summary (total items, total price)
export const getCartSummary = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.clerkId))
      .collect();

    let totalItems = 0;
    let totalPrice = 0;

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);
      if (product && product.status === "active") {
        totalItems += cartItem.quantity;
        totalPrice += cartItem.quantity * cartItem.priceAtTime;
      }
    }

    return {
      totalItems,
      totalPrice,
      itemCount: cartItems.length,
    };
  },
});
