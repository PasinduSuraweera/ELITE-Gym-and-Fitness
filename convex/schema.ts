import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("trainer"), v.literal("user"))),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),

  trainerApplications: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    experience: v.string(),
    certifications: v.string(),
    motivation: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  marketplaceItems: defineTable({
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
    status: v.union(v.literal("active"), v.literal("inactive")),
    stock: v.number(),
    featured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  }).index("by_category", ["category"]).index("by_status", ["status"]).index("by_featured", ["featured"]),

  plans: defineTable({
    userId: v.string(),
    name: v.string(),
    workoutPlan: v.object({
      schedule: v.array(v.string()),
      exercises: v.array(
        v.object({
          day: v.string(),
          routines: v.array(
            v.object({
              name: v.string(),
              sets: v.optional(v.number()),
              reps: v.optional(v.number()),
              duration: v.optional(v.string()),
              description: v.optional(v.string()),
              exercises: v.optional(v.array(v.string())),
            })
          ),
        })
      ),
    }),
    dietPlan: v.object({
      dailyCalories: v.number(),
      meals: v.array(
        v.object({
          name: v.string(),
          foods: v.array(v.string()),
        })
      ),
    }),
    isActive: v.boolean(),
  })
    .index("by_user_id", ["userId"])
    .index("by_active", ["isActive"]),

  recipes: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    category: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack"),
      v.literal("pre-workout"),
      v.literal("post-workout"),
      v.literal("protein"),
      v.literal("healthy")
    ),
    cookingTime: v.number(), // in minutes
    servings: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    calories: v.number(),
    protein: v.number(), // in grams
    carbs: v.number(), // in grams
    fats: v.number(), // in grams
    ingredients: v.array(
      v.object({
        name: v.string(),
        amount: v.string(),
        unit: v.optional(v.string()),
      })
    ),
    instructions: v.array(v.string()),
    tags: v.array(v.string()),
    rating: v.optional(v.number()), // Rating out of 5
    isRecommended: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_category", ["category"])
    .index("by_recommended", ["isRecommended"])
    .index("by_difficulty", ["difficulty"])
    .index("by_created_at", ["createdAt"]),

  memberships: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    membershipType: v.union(
      v.literal("basic"),
      v.literal("premium"),
      v.literal("couple"),
      v.literal("beginner")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("pending")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_subscription", ["stripeSubscriptionId"])
    .index("by_status", ["status"]),

  membershipPlans: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(), // in LKR
    currency: v.string(),
    type: v.union(
      v.literal("basic"),
      v.literal("premium"),
      v.literal("couple"),
      v.literal("beginner")
    ),
    stripePriceId: v.string(),
    stripeProductId: v.string(),
    features: v.array(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_active", ["isActive"])
    .index("by_sort_order", ["sortOrder"]),

  trainerProfiles: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    bio: v.string(),
    specializations: v.array(v.string()), // ["personal_training", "zumba", "yoga", "crossfit", "cardio", "strength"]
    experience: v.string(),
    certifications: v.array(v.string()),
    hourlyRate: v.number(),
    profileImage: v.optional(v.string()),
    isActive: v.boolean(),
    rating: v.number(), // Average rating
    totalReviews: v.number(),
    totalSessions: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_active", ["isActive"])
    .index("by_rating", ["rating"])
    .index("by_specializations", ["specializations"]),

  trainerAvailability: defineTable({
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
    startTime: v.string(), // "09:00"
    endTime: v.string(), // "17:00"
    isRecurring: v.boolean(), // true for weekly recurring availability
    specificDate: v.optional(v.string()), // "2025-08-20" for one-time availability
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_day", ["dayOfWeek"])
    .index("by_active", ["isActive"])
    .index("by_date", ["specificDate"]),

  bookings: defineTable({
    userId: v.id("users"),
    trainerId: v.id("trainerProfiles"),
    userClerkId: v.string(),
    trainerClerkId: v.string(),
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
    sessionDate: v.string(), // "2025-08-20"
    startTime: v.string(), // "14:00"
    endTime: v.string(), // "15:00"
    duration: v.number(), // in minutes
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
      v.literal("no_show")
    ),
    notes: v.optional(v.string()),
    totalAmount: v.number(),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("included_with_membership")
    ),
    paymentSessionId: v.optional(v.string()), // Stripe session ID
    cancellationReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_user_clerk", ["userClerkId"])
    .index("by_trainer_clerk", ["trainerClerkId"])
    .index("by_date", ["sessionDate"])
    .index("by_status", ["status"])
    .index("by_session_type", ["sessionType"])
    .index("by_datetime", ["sessionDate", "startTime"]),

  trainerReviews: defineTable({
    bookingId: v.id("bookings"),
    userId: v.id("users"),
    trainerId: v.id("trainerProfiles"),
    rating: v.number(), // 1-5 stars
    comment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_trainer", ["trainerId"])
    .index("by_user", ["userId"])
    .index("by_rating", ["rating"]),

  cartItems: defineTable({
    userId: v.id("users"),
    userClerkId: v.string(),
    productId: v.id("marketplaceItems"),
    quantity: v.number(),
    priceAtTime: v.number(), // Price when added to cart in LKR
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_clerk", ["userClerkId"])
    .index("by_user_product", ["userClerkId", "productId"])
    .index("by_user", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
    userClerkId: v.string(),
    orderNumber: v.string(), // Auto-generated order number
    items: v.array(
      v.object({
        productId: v.id("marketplaceItems"),
        productName: v.string(),
        quantity: v.number(),
        pricePerItem: v.number(), // Price in LKR at time of order
        totalPrice: v.number(), // quantity * pricePerItem
      })
    ),
    subtotal: v.number(), // Sum of all item totals in LKR
    shippingCost: v.number(), // Shipping cost in LKR
    tax: v.number(), // Tax amount in LKR
    totalAmount: v.number(), // Final total in LKR
    currency: v.string(), // "LKR"
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    stripeSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
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
    estimatedDelivery: v.optional(v.number()),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_clerk", ["userClerkId"])
    .index("by_order_number", ["orderNumber"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_stripe_session", ["stripeSessionId"]),

  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly version of title
    excerpt: v.string(), // Short description
    content: v.string(), // Full article content (HTML/Markdown)
    featuredImage: v.optional(v.string()), // URL to featured image
    category: v.union(
      v.literal("workout-tips"),
      v.literal("nutrition"),
      v.literal("success-stories"),
      v.literal("trainer-insights"),
      v.literal("equipment-guides"),
      v.literal("wellness"),
      v.literal("news")
    ),
    tags: v.array(v.string()), // Array of tags
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    authorId: v.id("users"), // Author (admin or trainer)
    authorName: v.string(), // Cached author name
    authorImage: v.optional(v.string()), // Cached author image
    readTime: v.number(), // Estimated read time in minutes
    views: v.number(), // View count
    likes: v.number(), // Like count
    isFeatured: v.boolean(), // Featured on homepage
    publishedAt: v.optional(v.number()), // When published
    seoTitle: v.optional(v.string()), // SEO optimized title
    seoDescription: v.optional(v.string()), // Meta description
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_author", ["authorId"])
    .index("by_slug", ["slug"])
    .index("by_featured", ["isFeatured"])
    .index("by_published", ["publishedAt"])
    .index("by_views", ["views"]),

  blogComments: defineTable({
    postId: v.id("blogPosts"),
    userId: v.id("users"),
    userClerkId: v.string(),
    userName: v.string(), // Cached user name
    userImage: v.optional(v.string()), // Cached user image
    content: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    parentCommentId: v.optional(v.id("blogComments")), // For nested comments
    likes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_user_clerk", ["userClerkId"])
    .index("by_status", ["status"])
    .index("by_parent", ["parentCommentId"]),

  blogLikes: defineTable({
    postId: v.optional(v.id("blogPosts")),
    commentId: v.optional(v.id("blogComments")),
    userId: v.id("users"),
    userClerkId: v.string(),
    type: v.union(v.literal("post"), v.literal("comment")),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_comment", ["commentId"])
    .index("by_user", ["userId"])
    .index("by_user_clerk", ["userClerkId"])
    .index("by_type", ["type"]),

  newsletter: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    status: v.union(
      v.literal("subscribed"),
      v.literal("unsubscribed"),
      v.literal("pending")
    ),
    source: v.string(), // Where they subscribed from
    subscribedAt: v.number(),
    unsubscribedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),
});
