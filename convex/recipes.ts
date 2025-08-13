import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all recipes with optional filtering
export const getRecipes = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let recipesQuery = ctx.db.query("recipes");

    if (args.category) {
      recipesQuery = recipesQuery.filter((q) => q.eq(q.field("category"), args.category));
    }

    if (args.difficulty) {
      recipesQuery = recipesQuery.filter((q) => q.eq(q.field("difficulty"), args.difficulty));
    }

    const recipes = await recipesQuery.order("desc").collect();

    if (args.limit) {
      return recipes.slice(0, args.limit);
    }

    return recipes;
  },
});

// Get recommended recipes
export const getRecommendedRecipes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_recommended", (q) => q.eq("isRecommended", true))
      .order("desc")
      .collect();

    if (args.limit) {
      return recipes.slice(0, args.limit);
    }

    return recipes;
  },
});

// Get recipe by ID
export const getRecipeById = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get recipes by category
export const getRecipesByCategory = query({
  args: { 
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
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();

    if (args.limit) {
      return recipes.slice(0, args.limit);
    }

    return recipes;
  },
});

// Search recipes by title or tags
export const searchRecipes = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db.query("recipes").collect();
    const searchTerm = args.searchTerm.toLowerCase();
    
    const filteredRecipes = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(searchTerm) ||
      recipe.description.toLowerCase().includes(searchTerm) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    // Sort by creation date descending
    filteredRecipes.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      return filteredRecipes.slice(0, args.limit);
    }

    return filteredRecipes;
  },
});

// Create a new recipe (admin only)
export const createRecipe = mutation({
  args: {
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
    cookingTime: v.number(),
    servings: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fats: v.number(),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create recipes");
    }

    const now = Date.now();

    const recipeId = await ctx.db.insert("recipes", {
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl,
      category: args.category,
      cookingTime: args.cookingTime,
      servings: args.servings,
      difficulty: args.difficulty,
      calories: args.calories,
      protein: args.protein,
      carbs: args.carbs,
      fats: args.fats,
      ingredients: args.ingredients,
      instructions: args.instructions,
      tags: args.tags,
      isRecommended: args.isRecommended,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return recipeId;
  },
});

// Update recipe (admin only)
export const updateRecipe = mutation({
  args: {
    id: v.id("recipes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack"),
      v.literal("pre-workout"),
      v.literal("post-workout"),
      v.literal("protein"),
      v.literal("healthy")
    )),
    cookingTime: v.optional(v.number()),
    servings: v.optional(v.number()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fats: v.optional(v.number()),
    ingredients: v.optional(
      v.array(
        v.object({
          name: v.string(),
          amount: v.string(),
          unit: v.optional(v.string()),
        })
      )
    ),
    instructions: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    isRecommended: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Only admins can update recipes");
    }

    const { id, ...updateData } = args;
    const updates: any = {};

    // Only include defined fields
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Date.now();
      await ctx.db.patch(id, updates);
    }

    return await ctx.db.get(id);
  },
});

// Delete recipe (admin only)
export const deleteRecipe = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Only admins can delete recipes");
    }

    await ctx.db.delete(args.id);
  },
});

// Seed initial recipes (for development)
export const seedRecipes = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Only admins can seed recipes");
    }

    const existingRecipes = await ctx.db.query("recipes").first();
    if (existingRecipes) {
      throw new Error("Recipes already exist");
    }

    const now = Date.now();
    
    // Sample recipe 1
    await ctx.db.insert("recipes", {
      title: "Protein Power Bowl",
      description: "A high-protein, nutrient-dense bowl perfect for post-workout recovery.",
      category: "post-workout",
      cookingTime: 15,
      servings: 2,
      difficulty: "easy",
      calories: 450,
      protein: 35,
      carbs: 40,
      fats: 15,
      ingredients: [
        { name: "Quinoa", amount: "1", unit: "cup" },
        { name: "Grilled chicken breast", amount: "6", unit: "oz" },
        { name: "Mixed greens", amount: "2", unit: "cups" },
        { name: "Avocado", amount: "1/2", unit: "piece" },
        { name: "Cherry tomatoes", amount: "1/2", unit: "cup" },
        { name: "Greek yogurt", amount: "2", unit: "tbsp" },
      ],
      instructions: [
        "Cook quinoa according to package instructions",
        "Season and grill chicken breast until cooked through",
        "Slice avocado and halve cherry tomatoes",
        "Arrange quinoa in bowl, top with mixed greens",
        "Add sliced chicken, avocado, and tomatoes",
        "Dollop with Greek yogurt and serve"
      ],
      tags: ["high-protein", "healthy", "quick", "post-workout"],
      isRecommended: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Sample recipe 2
    await ctx.db.insert("recipes", {
      title: "Overnight Oats Energy Bowl",
      description: "Perfect breakfast to fuel your morning workout with sustained energy.",
      category: "breakfast",
      cookingTime: 5,
      servings: 1,
      difficulty: "easy",
      calories: 380,
      protein: 18,
      carbs: 55,
      fats: 12,
      ingredients: [
        { name: "Rolled oats", amount: "1/2", unit: "cup" },
        { name: "Greek yogurt", amount: "1/4", unit: "cup" },
        { name: "Almond milk", amount: "1/2", unit: "cup" },
        { name: "Chia seeds", amount: "1", unit: "tbsp" },
        { name: "Banana", amount: "1/2", unit: "piece" },
        { name: "Almond butter", amount: "1", unit: "tbsp" },
        { name: "Honey", amount: "1", unit: "tsp" },
      ],
      instructions: [
        "Mix oats, Greek yogurt, and almond milk in a jar",
        "Add chia seeds and honey, stir well",
        "Refrigerate overnight",
        "In the morning, top with sliced banana",
        "Add a dollop of almond butter",
        "Enjoy cold or warm"
      ],
      tags: ["breakfast", "overnight", "energy", "fiber"],
      isRecommended: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Sample recipe 3
    await ctx.db.insert("recipes", {
      title: "Lean Turkey Meatballs",
      description: "Flavorful, lean protein-packed meatballs perfect for meal prep.",
      category: "lunch",
      cookingTime: 25,
      servings: 4,
      difficulty: "medium",
      calories: 320,
      protein: 28,
      carbs: 8,
      fats: 18,
      ingredients: [
        { name: "Ground turkey", amount: "1", unit: "lb" },
        { name: "Egg", amount: "1", unit: "piece" },
        { name: "Almond flour", amount: "1/4", unit: "cup" },
        { name: "Onion", amount: "1/2", unit: "piece" },
        { name: "Garlic", amount: "3", unit: "cloves" },
        { name: "Italian herbs", amount: "1", unit: "tsp" },
        { name: "Olive oil", amount: "2", unit: "tbsp" },
      ],
      instructions: [
        "Preheat oven to 400°F",
        "Finely chop onion and garlic",
        "Mix turkey, egg, almond flour, onion, garlic, and herbs",
        "Form into 16 meatballs",
        "Heat olive oil in oven-safe skillet",
        "Brown meatballs on all sides",
        "Transfer to oven for 12-15 minutes",
        "Serve with your favorite sauce"
      ],
      tags: ["protein", "meal-prep", "lean", "gluten-free"],
      isRecommended: false,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Sample recipe 4
    await ctx.db.insert("recipes", {
      title: "Pre-Workout Energy Smoothie",
      description: "Quick and energizing smoothie to fuel your workout.",
      category: "pre-workout",
      cookingTime: 5,
      servings: 1,
      difficulty: "easy",
      calories: 280,
      protein: 20,
      carbs: 45,
      fats: 5,
      ingredients: [
        { name: "Banana", amount: "1", unit: "piece" },
        { name: "Protein powder", amount: "1", unit: "scoop" },
        { name: "Almond milk", amount: "1", unit: "cup" },
        { name: "Dates", amount: "2", unit: "pieces" },
        { name: "Spinach", amount: "1", unit: "cup" },
        { name: "Ice", amount: "1/2", unit: "cup" },
      ],
      instructions: [
        "Add all ingredients to blender",
        "Blend on high until smooth",
        "Add more almond milk if too thick",
        "Serve immediately",
        "Drink 30-60 minutes before workout"
      ],
      tags: ["smoothie", "pre-workout", "energy", "quick"],
      isRecommended: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Sample recipe 5
    await ctx.db.insert("recipes", {
      title: "Salmon Power Salad",
      description: "Omega-3 rich salmon with nutrient-dense vegetables for optimal recovery.",
      category: "dinner",
      cookingTime: 20,
      servings: 2,
      difficulty: "medium",
      calories: 420,
      protein: 32,
      carbs: 25,
      fats: 22,
      ingredients: [
        { name: "Salmon fillet", amount: "8", unit: "oz" },
        { name: "Mixed greens", amount: "4", unit: "cups" },
        { name: "Sweet potato", amount: "1", unit: "medium" },
        { name: "Walnuts", amount: "1/4", unit: "cup" },
        { name: "Feta cheese", amount: "2", unit: "oz" },
        { name: "Olive oil", amount: "2", unit: "tbsp" },
        { name: "Lemon", amount: "1", unit: "piece" },
      ],
      instructions: [
        "Preheat oven to 425°F",
        "Cube and roast sweet potato for 25 minutes",
        "Season salmon with salt, pepper, and lemon",
        "Pan-sear salmon 4 minutes per side",
        "Arrange greens in bowls",
        "Top with roasted sweet potato and flaked salmon",
        "Sprinkle with walnuts and feta",
        "Drizzle with olive oil and lemon juice"
      ],
      tags: ["omega-3", "recovery", "nutrient-dense", "anti-inflammatory"],
      isRecommended: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return { message: "Sample recipes created successfully" };
  },
});
