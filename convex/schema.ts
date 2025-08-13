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
    isRecommended: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_category", ["category"])
    .index("by_recommended", ["isRecommended"])
    .index("by_difficulty", ["difficulty"])
    .index("by_created_at", ["createdAt"]),
});
