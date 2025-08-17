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

// Get all recipes (for admin)
export const getAllRecipes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("recipes").order("desc").collect();
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

// Get personalized recipe recommendations based on user's fitness plan
export const getPersonalizedRecipes = query({
  args: { 
    clerkId: v.string(),
    limit: v.optional(v.number()),
    mealType: v.optional(v.string()) // "breakfast", "lunch", "dinner", "pre-workout", "post-workout"
  },
  handler: async (ctx, args) => {
    // Get user's active plan
    const userPlan = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.clerkId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    // Get user's membership to understand their commitment level
    const userMembership = await ctx.db
      .query("memberships")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    let allRecipes = await ctx.db.query("recipes").collect();
    
    if (!userPlan) {
      // If no plan, return general healthy recipes
      return allRecipes
        .filter(recipe => recipe.isRecommended || recipe.category === "healthy")
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, args.limit || 10);
    }

    // Analyze user's fitness plan
    const { dietPlan, workoutPlan } = userPlan;
    const dailyCalories = dietPlan.dailyCalories;
    const workoutDays = workoutPlan.schedule.length;
    
    // Calculate user's fitness intensity
    const totalExercises = workoutPlan.exercises.reduce((total, day) => total + day.routines.length, 0);
    const avgExercisesPerDay = totalExercises / workoutDays;
    const isHighIntensity = avgExercisesPerDay > 8 || workoutDays > 4;
    
    // Score recipes based on user's needs
    const scoredRecipes = allRecipes.map(recipe => {
      let score = 0;
      
      // Base score for all recipes
      score += recipe.isRecommended ? 10 : 0;
      
      // Calorie matching (prefer recipes that fit their daily goal)
      const calorieRatio = recipe.calories / (dailyCalories / 4); // assuming 4 meals per day
      if (calorieRatio >= 0.8 && calorieRatio <= 1.2) score += 15;
      else if (calorieRatio >= 0.6 && calorieRatio <= 1.4) score += 10;
      else if (calorieRatio >= 0.4 && calorieRatio <= 1.6) score += 5;
      
      // Protein priority for high-intensity workouts
      if (isHighIntensity && recipe.protein > 20) score += 12;
      else if (recipe.protein > 15) score += 8;
      else if (recipe.protein > 10) score += 5;
      
      // Workout day considerations
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const isWorkoutDay = workoutPlan.schedule.includes(today);
      
      if (isWorkoutDay) {
        // Prioritize pre/post workout meals
        if (recipe.category === "pre-workout") score += 20;
        if (recipe.category === "post-workout") score += 18;
        if (recipe.category === "protein") score += 15;
        
        // Higher carbs for energy
        if (recipe.carbs > 30) score += 10;
      } else {
        // Rest day - prioritize recovery and lower calories
        if (recipe.category === "healthy") score += 12;
        if (recipe.calories < dailyCalories / 4) score += 8;
      }
      
      // Membership level considerations
      if (userMembership) {
        if (userMembership.membershipType === "premium") {
          // Premium members get complex recipes
          if (recipe.difficulty === "medium" || recipe.difficulty === "hard") score += 8;
        } else {
          // Basic members prefer easy recipes
          if (recipe.difficulty === "easy") score += 8;
        }
      }
      
      // Meal type filtering
      if (args.mealType) {
        if (recipe.category === args.mealType) score += 25;
        
        // Time-based suggestions
        const hour = new Date().getHours();
        if (args.mealType === "breakfast" && (recipe.category === "breakfast" || recipe.cookingTime <= 15)) score += 15;
        if (args.mealType === "lunch" && recipe.category === "lunch") score += 15;
        if (args.mealType === "dinner" && recipe.category === "dinner") score += 15;
        
        // Pre/post workout timing
        if (args.mealType === "pre-workout" && recipe.carbs > 20) score += 10;
        if (args.mealType === "post-workout" && recipe.protein > 15) score += 10;
      }
      
      // Cooking time preferences (busy people prefer quick meals)
      if (recipe.cookingTime <= 15) score += 5;
      else if (recipe.cookingTime <= 30) score += 3;
      
      // Variety bonus (prefer different categories)
      if (recipe.tags.includes("quick") && isHighIntensity) score += 5;
      if (recipe.tags.includes("meal-prep") && workoutDays > 3) score += 8;
      
      return { ...recipe, score };
    });
    
    // Sort by score and return top results
    return scoredRecipes
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit || 12);
  },
});

// Get recipes based on workout schedule analysis
export const getWorkoutBasedRecipes = query({
  args: { 
    clerkId: v.string(),
    timeOfDay: v.optional(v.string()), // "morning", "afternoon", "evening"
  },
  handler: async (ctx, args) => {
    const userPlan = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.clerkId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    if (!userPlan) return [];
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const isWorkoutDay = userPlan.workoutPlan.schedule.includes(today);
    const hour = new Date().getHours();
    
    let targetCategories: string[] = [];
    
    if (isWorkoutDay) {
      if (hour < 10) {
        // Morning workout day
        targetCategories = ["pre-workout", "breakfast", "protein"];
      } else if (hour < 16) {
        // Afternoon workout
        targetCategories = ["pre-workout", "post-workout", "protein", "lunch"];
      } else {
        // Evening workout
        targetCategories = ["post-workout", "protein", "dinner"];
      }
    } else {
      // Rest day
      if (hour < 10) targetCategories = ["breakfast", "healthy"];
      else if (hour < 16) targetCategories = ["lunch", "healthy", "snack"];
      else targetCategories = ["dinner", "healthy"];
    }
    
    const recipes = await ctx.db.query("recipes").collect();
    
    return recipes
      .filter(recipe => targetCategories.includes(recipe.category))
      .sort((a, b) => {
        // Prioritize by category relevance and protein content
        const aScore = (recipe => {
          let score = 0;
          if (targetCategories[0] === recipe.category) score += 10;
          if (targetCategories[1] === recipe.category) score += 8;
          if (targetCategories[2] === recipe.category) score += 6;
          score += recipe.protein * 0.5;
          return score;
        })(a);
        
        const bScore = (recipe => {
          let score = 0;
          if (targetCategories[0] === recipe.category) score += 10;
          if (targetCategories[1] === recipe.category) score += 8;
          if (targetCategories[2] === recipe.category) score += 6;
          score += recipe.protein * 0.5;
          return score;
        })(b);
        
        return bScore - aScore;
      })
      .slice(0, 8);
  },
});

// Get meal prep suggestions based on workout frequency
export const getMealPrepSuggestions = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const userPlan = await ctx.db
      .query("plans")
      .withIndex("by_user_id", (q) => q.eq("userId", args.clerkId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    
    if (!userPlan) return [];
    
    const workoutDays = userPlan.workoutPlan.schedule.length;
    const dailyCalories = userPlan.dietPlan.dailyCalories;
    
    const recipes = await ctx.db.query("recipes").collect();
    
    // Filter recipes suitable for meal prep
    return recipes
      .filter(recipe => {
        // Good for meal prep: high protein, reasonable cooking time, stores well
        return recipe.protein > 15 && 
               recipe.cookingTime <= 45 && 
               (recipe.tags.includes("meal-prep") || 
                recipe.category === "lunch" || 
                recipe.category === "dinner" ||
                recipe.category === "protein");
      })
      .map(recipe => ({
        ...recipe,
        weeklyPortions: Math.ceil(workoutDays * 1.5), // More portions for active people
        totalCalories: recipe.calories * Math.ceil(workoutDays * 1.5),
        suitabilityScore: (
          (recipe.protein > 20 ? 10 : 5) +
          (recipe.cookingTime <= 30 ? 8 : 4) +
          (recipe.tags.includes("meal-prep") ? 15 : 0) +
          (workoutDays > 3 ? 10 : 5)
        )
      }))
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
      .slice(0, 6);
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

// Comprehensive recipe seeding with more variety
export const seedMoreRecipes = mutation({
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

    const now = Date.now();
    
    const newRecipes = [
      // Breakfast Recipes
      {
        title: "Power Protein Pancakes",
        description: "Fluffy pancakes packed with protein for sustained morning energy.",
        category: "breakfast" as const,
        cookingTime: 20,
        servings: 3,
        difficulty: "medium" as const,
        calories: 340,
        protein: 28,
        carbs: 32,
        fats: 12,
        ingredients: [
          { name: "Protein powder", amount: "2", unit: "scoops" },
          { name: "Oats", amount: "1/2", unit: "cup" },
          { name: "Eggs", amount: "2", unit: "pieces" },
          { name: "Banana", amount: "1", unit: "medium" },
          { name: "Almond milk", amount: "1/4", unit: "cup" },
          { name: "Baking powder", amount: "1", unit: "tsp" },
          { name: "Blueberries", amount: "1/4", unit: "cup" },
        ],
        instructions: [
          "Blend oats into flour consistency",
          "Mix protein powder, oat flour, and baking powder",
          "In separate bowl, mash banana and mix with eggs and almond milk",
          "Combine wet and dry ingredients",
          "Fold in blueberries",
          "Cook on medium heat for 2-3 minutes per side",
          "Serve hot with sugar-free syrup"
        ],
        tags: ["high-protein", "breakfast", "muscle-building", "filling"],
        isRecommended: true,
      },
      
      {
        title: "Green Warrior Smoothie Bowl",
        description: "Nutrient-dense smoothie bowl with superfoods for maximum energy.",
        category: "breakfast" as const,
        cookingTime: 10,
        servings: 1,
        difficulty: "easy" as const,
        calories: 420,
        protein: 22,
        carbs: 58,
        fats: 14,
        ingredients: [
          { name: "Spinach", amount: "2", unit: "cups" },
          { name: "Frozen mango", amount: "1/2", unit: "cup" },
          { name: "Banana", amount: "1", unit: "medium" },
          { name: "Protein powder", amount: "1", unit: "scoop" },
          { name: "Coconut milk", amount: "1/2", unit: "cup" },
          { name: "Chia seeds", amount: "1", unit: "tbsp" },
          { name: "Granola", amount: "2", unit: "tbsp" },
          { name: "Almonds", amount: "10", unit: "pieces" },
        ],
        instructions: [
          "Blend spinach, mango, banana, protein powder and coconut milk",
          "Pour into bowl",
          "Top with chia seeds, granola, and almonds",
          "Add fresh berries if available",
          "Eat immediately for best texture"
        ],
        tags: ["superfood", "antioxidants", "energy", "vitamins"],
        isRecommended: true,
      },

      // Pre-Workout Recipes
      {
        title: "Explosive Energy Balls",
        description: "No-bake energy balls perfect for quick pre-workout fuel.",
        category: "pre-workout" as const,
        cookingTime: 15,
        servings: 8,
        difficulty: "easy" as const,
        calories: 180,
        protein: 8,
        carbs: 22,
        fats: 8,
        ingredients: [
          { name: "Dates", amount: "10", unit: "pieces" },
          { name: "Almonds", amount: "1/4", unit: "cup" },
          { name: "Oats", amount: "1/3", unit: "cup" },
          { name: "Protein powder", amount: "1", unit: "scoop" },
          { name: "Coconut oil", amount: "1", unit: "tbsp" },
          { name: "Dark chocolate chips", amount: "2", unit: "tbsp" },
        ],
        instructions: [
          "Soak dates in warm water for 10 minutes",
          "Drain and add to food processor with almonds",
          "Add oats, protein powder, and coconut oil",
          "Process until mixture sticks together",
          "Fold in chocolate chips",
          "Roll into 8 balls",
          "Refrigerate for 30 minutes",
          "Store in fridge for up to 1 week"
        ],
        tags: ["no-bake", "portable", "quick-energy", "meal-prep"],
        isRecommended: true,
      },

      // Post-Workout Recipes
      {
        title: "Recovery Muscle Smoothie",
        description: "Ultimate post-workout smoothie for muscle recovery and growth.",
        category: "post-workout" as const,
        cookingTime: 5,
        servings: 1,
        difficulty: "easy" as const,
        calories: 380,
        protein: 35,
        carbs: 38,
        fats: 8,
        ingredients: [
          { name: "Whey protein", amount: "1.5", unit: "scoops" },
          { name: "Banana", amount: "1", unit: "large" },
          { name: "Greek yogurt", amount: "1/2", unit: "cup" },
          { name: "Berries", amount: "1/2", unit: "cup" },
          { name: "Coconut water", amount: "1", unit: "cup" },
          { name: "Creatine", amount: "1", unit: "tsp" },
          { name: "Ice", amount: "1/2", unit: "cup" },
        ],
        instructions: [
          "Add coconut water to blender first",
          "Add banana, berries, and Greek yogurt",
          "Add protein powder and creatine",
          "Add ice and blend until smooth",
          "Drink within 30 minutes post-workout",
          "Add more liquid if too thick"
        ],
        tags: ["recovery", "high-protein", "fast-absorption", "muscle-building"],
        isRecommended: true,
      },

      // Lunch Recipes
      {
        title: "Mediterranean Power Bowl",
        description: "Nutrient-packed bowl with lean protein and healthy fats.",
        category: "lunch" as const,
        cookingTime: 25,
        servings: 2,
        difficulty: "medium" as const,
        calories: 480,
        protein: 32,
        carbs: 35,
        fats: 22,
        ingredients: [
          { name: "Chicken breast", amount: "6", unit: "oz" },
          { name: "Quinoa", amount: "1/2", unit: "cup" },
          { name: "Chickpeas", amount: "1/2", unit: "cup" },
          { name: "Cucumber", amount: "1", unit: "medium" },
          { name: "Cherry tomatoes", amount: "1", unit: "cup" },
          { name: "Feta cheese", amount: "2", unit: "oz" },
          { name: "Olive oil", amount: "2", unit: "tbsp" },
          { name: "Lemon juice", amount: "1", unit: "tbsp" },
          { name: "Mixed greens", amount: "2", unit: "cups" },
        ],
        instructions: [
          "Season and grill chicken breast until cooked through",
          "Cook quinoa according to package instructions",
          "Dice cucumber and halve cherry tomatoes",
          "Arrange mixed greens in bowl",
          "Top with quinoa, chickpeas, vegetables",
          "Slice chicken and place on top",
          "Crumble feta cheese over bowl",
          "Drizzle with olive oil and lemon juice"
        ],
        tags: ["mediterranean", "lean-protein", "healthy-fats", "balanced"],
        isRecommended: true,
      },

      // Dinner Recipes
      {
        title: "Lean Beef Stir-Fry",
        description: "Quick and protein-rich stir-fry with colorful vegetables.",
        category: "dinner" as const,
        cookingTime: 20,
        servings: 2,
        difficulty: "medium" as const,
        calories: 420,
        protein: 38,
        carbs: 28,
        fats: 16,
        ingredients: [
          { name: "Lean beef strips", amount: "8", unit: "oz" },
          { name: "Broccoli", amount: "2", unit: "cups" },
          { name: "Bell peppers", amount: "1", unit: "cup" },
          { name: "Brown rice", amount: "1/2", unit: "cup" },
          { name: "Soy sauce", amount: "2", unit: "tbsp" },
          { name: "Garlic", amount: "3", unit: "cloves" },
          { name: "Ginger", amount: "1", unit: "tbsp" },
          { name: "Sesame oil", amount: "1", unit: "tbsp" },
        ],
        instructions: [
          "Cook brown rice according to package instructions",
          "Heat sesame oil in large pan or wok",
          "Add minced garlic and ginger, stir for 30 seconds",
          "Add beef strips and cook until browned",
          "Add broccoli and bell peppers",
          "Stir-fry for 5-7 minutes until vegetables are tender-crisp",
          "Add soy sauce and toss to combine",
          "Serve over brown rice"
        ],
        tags: ["high-protein", "quick-dinner", "vegetables", "asian-inspired"],
        isRecommended: false,
      },

      // Snack Recipes
      {
        title: "Protein-Packed Hummus",
        description: "High-protein hummus perfect for post-workout snacking.",
        category: "snack" as const,
        cookingTime: 10,
        servings: 4,
        difficulty: "easy" as const,
        calories: 220,
        protein: 18,
        carbs: 20,
        fats: 10,
        ingredients: [
          { name: "Chickpeas", amount: "1", unit: "can" },
          { name: "Protein powder", amount: "1/2", unit: "scoop" },
          { name: "Tahini", amount: "2", unit: "tbsp" },
          { name: "Lemon juice", amount: "2", unit: "tbsp" },
          { name: "Garlic", amount: "2", unit: "cloves" },
          { name: "Olive oil", amount: "1", unit: "tbsp" },
          { name: "Paprika", amount: "1/2", unit: "tsp" },
        ],
        instructions: [
          "Drain and rinse chickpeas",
          "Add all ingredients to food processor",
          "Process until smooth and creamy",
          "Add water if too thick",
          "Taste and adjust seasonings",
          "Serve with vegetables or whole grain crackers",
          "Store in fridge for up to 1 week"
        ],
        tags: ["protein-snack", "meal-prep", "healthy", "plant-protein"],
        isRecommended: true,
      },

      // Healthy Category
      {
        title: "Detox Green Soup",
        description: "Cleansing vegetable soup packed with nutrients and fiber.",
        category: "healthy" as const,
        cookingTime: 30,
        servings: 4,
        difficulty: "easy" as const,
        calories: 180,
        protein: 8,
        carbs: 25,
        fats: 6,
        ingredients: [
          { name: "Spinach", amount: "4", unit: "cups" },
          { name: "Broccoli", amount: "2", unit: "cups" },
          { name: "Zucchini", amount: "1", unit: "medium" },
          { name: "Vegetable broth", amount: "4", unit: "cups" },
          { name: "Onion", amount: "1", unit: "medium" },
          { name: "Garlic", amount: "3", unit: "cloves" },
          { name: "Coconut milk", amount: "1/2", unit: "cup" },
          { name: "Olive oil", amount: "1", unit: "tbsp" },
        ],
        instructions: [
          "Heat olive oil in large pot",
          "Sauté diced onion and garlic until fragrant",
          "Add chopped broccoli and zucchini",
          "Pour in vegetable broth and bring to boil",
          "Simmer for 15 minutes until vegetables are tender",
          "Add spinach and cook until wilted",
          "Blend soup until smooth",
          "Stir in coconut milk and season to taste"
        ],
        tags: ["detox", "low-calorie", "fiber-rich", "vitamins"],
        isRecommended: false,
      }
    ];

    // Insert all new recipes
    const createdRecipes = [];
    for (const recipe of newRecipes) {
      const recipeId = await ctx.db.insert("recipes", {
        ...recipe,
        createdAt: now,
        updatedAt: now,
        createdBy: user._id,
      });
      createdRecipes.push(recipeId);
    }

    return { 
      message: `Successfully created ${newRecipes.length} new recipes`,
      recipeIds: createdRecipes
    };
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

export const seedComprehensiveRecipes = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if comprehensive recipes already exist
    const existingRecipes = await ctx.db.query("recipes").take(15);
    if (existingRecipes.length > 10) {
      return { message: "Comprehensive recipes already seeded" };
    }

    // Get or create a system user for seeding
    let systemUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "system@elitegym.com"))
      .first();

    if (!systemUser) {
      // Create a system user for seeding recipes
      const systemUserId = await ctx.db.insert("users", {
        clerkId: "system_user",
        email: "system@elitegym.com",
        name: "Elite Gym System",
        role: "admin",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      systemUser = await ctx.db.get(systemUserId);
    }

    if (!systemUser) {
      throw new Error("Failed to create system user");
    }

    const recipes = [
      // BREAKFAST RECIPES
      {
        title: "Power Breakfast Protein Pancakes",
        description: "Fluffy protein-packed pancakes perfect for muscle building and energy. Made with oats, protein powder, and bananas.",
        category: "breakfast",
        difficulty: "easy",
        cookingTime: 15,
        servings: 2,
        calories: 350,
        protein: 28,
        carbs: 45,
        fats: 8,
        ingredients: [
          { name: "Rolled oats", amount: "1", unit: "cup" },
          { name: "Vanilla protein powder", amount: "1", unit: "scoop" },
          { name: "Ripe banana", amount: "1", unit: "piece" },
          { name: "Egg whites", amount: "2", unit: "pieces" },
          { name: "Unsweetened almond milk", amount: "1/2", unit: "cup" },
          { name: "Baking powder", amount: "1", unit: "tsp" },
          { name: "Cinnamon", amount: "1/2", unit: "tsp" },
          { name: "Natural peanut butter", amount: "1", unit: "tbsp" }
        ],
        instructions: [
          "Blend oats into flour consistency",
          "Mix all dry ingredients",
          "Combine wet ingredients separately",
          "Mix wet and dry ingredients until smooth",
          "Cook on medium heat for 2-3 minutes per side",
          "Serve with peanut butter drizzle"
        ],
        tags: ["high-protein", "muscle-building", "pre-workout", "gluten-free", "meal-prep"],
        rating: 4.8,
        isRecommended: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Greek Yogurt Berry Protein Bowl",
        description: "Antioxidant-rich breakfast bowl with Greek yogurt, mixed berries, and crunchy granola.",
        category: "breakfast",
        difficulty: "easy",
        cookingTime: 5,
        servings: 1,
        calories: 280,
        protein: 22,
        carbs: 35,
        fats: 6,
        ingredients: [
          { name: "Greek yogurt (0% fat)", amount: "1", unit: "cup" },
          { name: "Mixed berries", amount: "1/2", unit: "cup" },
          { name: "Homemade granola", amount: "2", unit: "tbsp" },
          { name: "Chia seeds", amount: "1", unit: "tbsp" },
          { name: "Honey", amount: "1", unit: "tsp" },
          { name: "Sliced almonds", amount: "1", unit: "tbsp" }
        ],
        instructions: [
          "Layer Greek yogurt in bowl",
          "Top with fresh berries",
          "Sprinkle granola and chia seeds",
          "Drizzle with honey",
          "Add sliced almonds",
          "Serve immediately"
        ],
        tags: ["quick", "high-protein", "antioxidants", "probiotics", "meal-prep"],
        rating: 4.6,
        isRecommended: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },

      // LUNCH RECIPES
      {
        title: "Grilled Chicken Power Salad",
        description: "Nutrient-dense salad with grilled chicken, quinoa, and fresh vegetables. Perfect for lean muscle building.",
        category: "lunch",
        difficulty: "medium",
        cookingTime: 25,
        servings: 2,
        calories: 420,
        protein: 35,
        carbs: 28,
        fats: 18,
        ingredients: [
          { name: "Chicken breast", amount: "6", unit: "oz" },
          { name: "Cooked quinoa", amount: "1", unit: "cup" },
          { name: "Mixed greens", amount: "2", unit: "cups" },
          { name: "Avocado, sliced", amount: "1/2", unit: "piece" },
          { name: "Chickpeas", amount: "1/4", unit: "cup" },
          { name: "Olive oil", amount: "2", unit: "tbsp" },
          { name: "Lemon juice", amount: "1", unit: "tbsp" },
          { name: "Cherry tomatoes", amount: "1/2", unit: "cup" },
          { name: "Cucumber slices", amount: "1/2", unit: "cup" }
        ],
        instructions: [
          "Season and grill chicken breast",
          "Cook quinoa according to package instructions",
          "Prepare all vegetables",
          "Make dressing with olive oil and lemon",
          "Assemble salad with warm quinoa base",
          "Top with sliced grilled chicken"
        ],
        tags: ["lean-protein", "quinoa", "healthy-fats", "meal-prep", "gluten-free"],
        rating: 4.7,
        isRecommended: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Turkey and Sweet Potato Bowl",
        description: "Balanced macro bowl with lean turkey, roasted sweet potato, and steamed broccoli.",
        category: "lunch",
        difficulty: "medium",
        cookingTime: 30,
        servings: 2,
        calories: 380,
        protein: 32,
        carbs: 42,
        fats: 10,
        ingredients: [
          { name: "Ground turkey (93/7)", amount: "6", unit: "oz" },
          { name: "Sweet potato, cubed", amount: "1", unit: "large" },
          { name: "Broccoli florets", amount: "2", unit: "cups" },
          { name: "Olive oil", amount: "1", unit: "tbsp" },
          { name: "Garlic powder", amount: "1", unit: "tsp" },
          { name: "Paprika", amount: "1", unit: "tsp" },
          { name: "Salt and pepper", amount: "1", unit: "pinch" },
          { name: "Fresh herbs", amount: "2", unit: "tbsp" }
        ],
        instructions: [
          "Preheat oven to 400°F",
          "Toss sweet potato cubes with olive oil and spices",
          "Roast sweet potato for 25 minutes",
          "Cook ground turkey with seasonings",
          "Steam broccoli until tender",
          "Combine all components in bowl"
        ],
        tags: ["lean-protein", "complex-carbs", "vegetables", "meal-prep", "paleo"],
        rating: 4.5,
        isRecommended: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },

      // DINNER RECIPES
      {
        title: "Herb-Crusted Salmon with Vegetables",
        description: "Omega-3 rich salmon with colorful roasted vegetables. Anti-inflammatory and muscle recovery focused.",
        category: "dinner",
        difficulty: "medium",
        cookingTime: 35,
        servings: 2,
        calories: 450,
        protein: 38,
        carbs: 22,
        fats: 24,
        ingredients: [
          { name: "Salmon fillet", amount: "6", unit: "oz" },
          { name: "Zucchini, sliced", amount: "1", unit: "medium" },
          { name: "Bell pepper strips", amount: "1", unit: "cup" },
          { name: "Brussels sprouts", amount: "1", unit: "cup" },
          { name: "Olive oil", amount: "2", unit: "tbsp" },
          { name: "Fresh dill", amount: "2", unit: "tbsp" },
          { name: "Lemon zest", amount: "1", unit: "tsp" },
          { name: "Garlic cloves", amount: "2", unit: "pieces" }
        ],
        instructions: [
          "Preheat oven to 425°F",
          "Prepare herb mixture with dill and garlic",
          "Toss vegetables with olive oil",
          "Place salmon on baking sheet with vegetables",
          "Bake for 12-15 minutes",
          "Finish with lemon zest"
        ],
        tags: ["omega-3", "anti-inflammatory", "heart-healthy", "low-carb", "paleo"],
        rating: 4.9,
        isRecommended: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },

      // PRE-WORKOUT RECIPES
      {
        title: "Energy Boosting Banana Smoothie",
        description: "Quick-digesting carbs and caffeine for optimal pre-workout energy. Ready in 2 minutes.",
        category: "pre-workout",
        difficulty: "easy",
        cookingTime: 2,
        servings: 1,
        calories: 240,
        protein: 12,
        carbs: 38,
        fats: 6,
        ingredients: [
          { name: "Ripe banana", amount: "1", unit: "piece" },
          { name: "Unsweetened almond milk", amount: "1/2", unit: "cup" },
          { name: "Vanilla protein powder", amount: "1", unit: "scoop" },
          { name: "Almond butter", amount: "1", unit: "tbsp" },
          { name: "Cinnamon", amount: "1/2", unit: "tsp" },
          { name: "Ice cubes", amount: "4", unit: "pieces" },
          { name: "Espresso shot (optional)", amount: "1", unit: "shot" }
        ],
        instructions: [
          "Add all ingredients to blender",
          "Blend until smooth and creamy",
          "Add ice for desired consistency",
          "Serve immediately",
          "Consume 30-45 minutes before workout"
        ],
        tags: ["pre-workout", "quick-energy", "portable", "caffeine-optional"],
        rating: 4.7,
        isRecommended: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },

      // POST-WORKOUT RECIPES
      {
        title: "Recovery Chocolate Protein Smoothie",
        description: "Ultimate post-workout recovery drink with fast-absorbing proteins and carbs for muscle repair.",
        category: "post-workout",
        difficulty: "easy",
        cookingTime: 3,
        servings: 1,
        calories: 320,
        protein: 35,
        carbs: 28,
        fats: 8,
        ingredients: [
          { name: "Chocolate protein powder", amount: "1", unit: "scoop" },
          { name: "Unsweetened almond milk", amount: "1", unit: "cup" },
          { name: "Frozen banana", amount: "1/2", unit: "piece" },
          { name: "Almond butter", amount: "1", unit: "tbsp" },
          { name: "Spinach (optional)", amount: "1", unit: "cup" },
          { name: "Cacao powder", amount: "1", unit: "tsp" },
          { name: "Ice cubes", amount: "4", unit: "pieces" }
        ],
        instructions: [
          "Add all ingredients to blender",
          "Blend until completely smooth",
          "Adjust consistency with more milk if needed",
          "Serve immediately",
          "Consume within 30 minutes post-workout"
        ],
        tags: ["post-workout", "muscle-recovery", "high-protein", "antioxidants"],
        rating: 4.8,
        isRecommended: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Quinoa Recovery Bowl with Chicken",
        description: "Complete amino acid profile with quinoa and chicken for optimal muscle protein synthesis.",
        category: "post-workout",
        difficulty: "medium",
        cookingTime: 25,
        servings: 2,
        calories: 390,
        protein: 32,
        carbs: 45,
        fats: 9,
        ingredients: [
          { name: "Grilled chicken breast", amount: "6", unit: "oz" },
          { name: "Cooked quinoa", amount: "1", unit: "cup" },
          { name: "Black beans", amount: "1/2", unit: "cup" },
          { name: "Avocado, diced", amount: "1/4", unit: "piece" },
          { name: "Salsa", amount: "2", unit: "tbsp" },
          { name: "Lime juice", amount: "1", unit: "tbsp" },
          { name: "Cilantro", amount: "2", unit: "tbsp" },
          { name: "Hot sauce (optional)", amount: "1", unit: "tsp" }
        ],
        instructions: [
          "Grill chicken and slice",
          "Cook quinoa with low-sodium broth",
          "Heat black beans",
          "Assemble bowl with quinoa base",
          "Top with chicken, beans, avocado",
          "Finish with salsa and lime"
        ],
        tags: ["complete-protein", "complex-carbs", "muscle-building", "meal-prep"],
        rating: 4.6,
        isRecommended: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },

      // HEALTHY SNACKS
      {
        title: "Protein-Packed Hummus with Veggies",
        description: "Creamy homemade hummus with extra protein, served with colorful vegetable sticks.",
        category: "snack",
        difficulty: "easy",
        cookingTime: 10,
        servings: 4,
        calories: 160,
        protein: 8,
        carbs: 18,
        fats: 7,
        ingredients: [
          { name: "Chickpeas, drained", amount: "1", unit: "can" },
          { name: "Tahini", amount: "2", unit: "tbsp" },
          { name: "Lemon juice", amount: "2", unit: "tbsp" },
          { name: "Garlic cloves", amount: "2", unit: "pieces" },
          { name: "Unflavored protein powder", amount: "1", unit: "scoop" },
          { name: "Mixed vegetables", amount: "2", unit: "cups" },
          { name: "Olive oil", amount: "1", unit: "tbsp" },
          { name: "Paprika", amount: "1", unit: "tsp" }
        ],
        instructions: [
          "Blend chickpeas until smooth",
          "Add tahini, lemon juice, garlic",
          "Mix in protein powder gradually",
          "Adjust consistency with water",
          "Cut vegetables into sticks",
          "Serve with drizzle of olive oil"
        ],
        tags: ["high-fiber", "plant-protein", "meal-prep", "portable"],
        rating: 4.4,
        isRecommended: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        title: "Greek Yogurt Protein Parfait",
        description: "Layered parfait with Greek yogurt, berries, and protein-rich granola for sustained energy.",
        category: "snack",
        difficulty: "easy",
        cookingTime: 5,
        servings: 1,
        calories: 220,
        protein: 18,
        carbs: 26,
        fats: 6,
        ingredients: [
          { name: "Greek yogurt", amount: "3/4", unit: "cup" },
          { name: "Mixed berries", amount: "1/4", unit: "cup" },
          { name: "Protein granola", amount: "2", unit: "tbsp" },
          { name: "Honey", amount: "1", unit: "tsp" },
          { name: "Chopped walnuts", amount: "1", unit: "tbsp" },
          { name: "Cinnamon", amount: "1", unit: "pinch" }
        ],
        instructions: [
          "Layer half the yogurt in glass",
          "Add berries and granola",
          "Layer remaining yogurt",
          "Top with walnuts and drizzle honey",
          "Sprinkle with cinnamon",
          "Serve immediately or refrigerate"
        ],
        tags: ["probiotics", "antioxidants", "quick", "protein-rich"],
        rating: 4.5,
        isRecommended: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];

    // Insert all recipes
    for (const recipe of recipes) {
      await ctx.db.insert("recipes", {
        title: recipe.title,
        description: recipe.description,
        category: recipe.category as any,
        difficulty: recipe.difficulty as any,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fats: recipe.fats,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        tags: recipe.tags,
        rating: recipe.rating,
        isRecommended: recipe.isRecommended,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
        createdBy: systemUser._id
      });
    }

    return { 
      message: `Successfully seeded ${recipes.length} comprehensive recipes`,
      categories: [...new Set(recipes.map(r => r.category))],
      totalRecipes: recipes.length
    };
  },
});
