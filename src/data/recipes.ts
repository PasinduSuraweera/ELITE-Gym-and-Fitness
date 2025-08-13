// Shared recipe data for the application
// In a real app, this would come from your database/API

export const sampleRecipes = [
  {
    _id: "1",
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
      "Cook quinoa according to package instructions and let cool slightly",
      "Season chicken breast with salt, pepper, and your favorite herbs",
      "Grill chicken breast until cooked through (165°F internal temperature)",
      "Slice avocado and halve cherry tomatoes",
      "Arrange quinoa in bowl as the base",
      "Top with mixed greens in an attractive manner",
      "Add sliced chicken, avocado, and tomatoes",
      "Dollop with Greek yogurt and serve immediately"
    ],
    tags: ["high-protein", "healthy", "quick", "post-workout"],
    isRecommended: true,
    createdAt: Date.now(),
  },
  {
    _id: "2",
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
      "Mix oats, Greek yogurt, and almond milk in a jar or container",
      "Add chia seeds and honey, stir well to combine",
      "Cover and refrigerate overnight (at least 4 hours)",
      "In the morning, stir the mixture",
      "Top with sliced banana",
      "Add a dollop of almond butter",
      "Enjoy cold or warm up for 30 seconds in microwave"
    ],
    tags: ["breakfast", "overnight", "energy", "fiber"],
    isRecommended: true,
    createdAt: Date.now(),
  },
  {
    _id: "3",
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
      { name: "Salt and pepper", amount: "to taste", unit: "" },
    ],
    instructions: [
      "Preheat oven to 400°F (200°C)",
      "Finely chop onion and garlic",
      "In a large bowl, mix turkey, egg, almond flour, onion, garlic, and herbs",
      "Season with salt and pepper",
      "Form mixture into 16 evenly sized meatballs",
      "Heat olive oil in oven-safe skillet over medium-high heat",
      "Brown meatballs on all sides, about 6-8 minutes total",
      "Transfer skillet to oven for 12-15 minutes until cooked through",
      "Serve with your favorite sauce or over vegetables"
    ],
    tags: ["protein", "meal-prep", "lean", "gluten-free"],
    isRecommended: false,
    createdAt: Date.now(),
  },
  {
    _id: "4",
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
      { name: "Banana", amount: "1", unit: "large" },
      { name: "Protein powder", amount: "1", unit: "scoop" },
      { name: "Almond milk", amount: "1", unit: "cup" },
      { name: "Medjool dates", amount: "2", unit: "pieces" },
      { name: "Fresh spinach", amount: "1", unit: "cup" },
      { name: "Ice cubes", amount: "1/2", unit: "cup" },
      { name: "Vanilla extract", amount: "1/2", unit: "tsp" },
    ],
    instructions: [
      "Add almond milk to blender first",
      "Add banana, dates, and spinach",
      "Add protein powder and vanilla extract",
      "Add ice cubes last",
      "Blend on high until smooth and creamy",
      "Add more almond milk if too thick",
      "Serve immediately",
      "Drink 30-60 minutes before workout for best results"
    ],
    tags: ["smoothie", "pre-workout", "energy", "quick"],
    isRecommended: true,
    createdAt: Date.now(),
  },
  {
    _id: "5",
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
      { name: "Dijon mustard", amount: "1", unit: "tsp" },
    ],
    instructions: [
      "Preheat oven to 425°F (220°C)",
      "Cube sweet potato and toss with 1 tbsp olive oil",
      "Roast sweet potato for 25 minutes until tender",
      "Season salmon with salt, pepper, and lemon zest",
      "Heat remaining olive oil in pan over medium-high heat",
      "Pan-sear salmon 4 minutes per side until cooked through",
      "Make dressing by whisking lemon juice, mustard, and olive oil",
      "Arrange mixed greens in bowls",
      "Top with roasted sweet potato and flaked salmon",
      "Sprinkle with walnuts and feta cheese",
      "Drizzle with lemon dressing and serve"
    ],
    tags: ["omega-3", "recovery", "nutrient-dense", "anti-inflammatory"],
    isRecommended: true,
    createdAt: Date.now(),
  },
  {
    _id: "6",
    title: "Protein Pancakes",
    description: "Fluffy, protein-packed pancakes perfect for weekend breakfast.",
    category: "breakfast",
    cookingTime: 15,
    servings: 2,
    difficulty: "easy",
    calories: 350,
    protein: 25,
    carbs: 35,
    fats: 10,
    ingredients: [
      { name: "Protein powder", amount: "1", unit: "scoop" },
      { name: "Oat flour", amount: "1/2", unit: "cup" },
      { name: "Eggs", amount: "2", unit: "large" },
      { name: "Almond milk", amount: "1/4", unit: "cup" },
      { name: "Baking powder", amount: "1", unit: "tsp" },
      { name: "Vanilla extract", amount: "1", unit: "tsp" },
      { name: "Fresh berries", amount: "1/2", unit: "cup" },
      { name: "Greek yogurt", amount: "2", unit: "tbsp" },
    ],
    instructions: [
      "Mix protein powder, oat flour, and baking powder in a bowl",
      "In another bowl, whisk eggs, almond milk, and vanilla",
      "Combine wet and dry ingredients until just mixed",
      "Let batter rest for 5 minutes to thicken",
      "Heat non-stick pan over medium heat",
      "Pour 1/4 cup batter per pancake",
      "Cook 2-3 minutes until bubbles form on surface",
      "Flip and cook 1-2 minutes more until golden",
      "Serve with fresh berries and Greek yogurt",
      "Drizzle with sugar-free syrup if desired"
    ],
    tags: ["protein", "weekend", "fluffy", "healthy"],
    isRecommended: false,
    createdAt: Date.now(),
  },
  {
    _id: "7",
    title: "Greek Yogurt Parfait",
    description: "Layered parfait with Greek yogurt, berries, and granola.",
    category: "snack",
    cookingTime: 5,
    servings: 1,
    difficulty: "easy",
    calories: 250,
    protein: 15,
    carbs: 30,
    fats: 8,
    ingredients: [
      { name: "Greek yogurt", amount: "3/4", unit: "cup" },
      { name: "Mixed berries", amount: "1/2", unit: "cup" },
      { name: "Granola", amount: "2", unit: "tbsp" },
      { name: "Honey", amount: "1", unit: "tsp" },
      { name: "Chia seeds", amount: "1", unit: "tsp" },
      { name: "Vanilla extract", amount: "1/4", unit: "tsp" },
    ],
    instructions: [
      "Mix Greek yogurt with vanilla extract and half the honey",
      "Layer half the yogurt mixture in a glass or bowl",
      "Add half the berries on top",
      "Sprinkle half the granola",
      "Repeat layers with remaining ingredients",
      "Top with chia seeds and remaining honey",
      "Serve immediately or chill for later"
    ],
    tags: ["greek-yogurt", "berries", "quick", "healthy"],
    isRecommended: false,
    createdAt: Date.now(),
  },
  {
    _id: "8",
    title: "Quinoa Buddha Bowl",
    description: "Colorful bowl packed with quinoa, vegetables, and tahini dressing.",
    category: "healthy",
    cookingTime: 30,
    servings: 2,
    difficulty: "medium",
    calories: 400,
    protein: 16,
    carbs: 50,
    fats: 18,
    ingredients: [
      { name: "Quinoa", amount: "1", unit: "cup" },
      { name: "Chickpeas", amount: "1", unit: "can" },
      { name: "Broccoli", amount: "2", unit: "cups" },
      { name: "Carrots", amount: "2", unit: "medium" },
      { name: "Red cabbage", amount: "1", unit: "cup" },
      { name: "Tahini", amount: "2", unit: "tbsp" },
      { name: "Lemon juice", amount: "2", unit: "tbsp" },
      { name: "Olive oil", amount: "1", unit: "tbsp" },
    ],
    instructions: [
      "Cook quinoa according to package instructions",
      "Drain and rinse chickpeas",
      "Steam broccoli until tender-crisp",
      "Slice carrots and shred red cabbage",
      "Roast chickpeas with olive oil for 15 minutes",
      "Make tahini dressing by mixing tahini, lemon juice, and water",
      "Arrange quinoa in bowls as base",
      "Top with vegetables and chickpeas in sections",
      "Drizzle with tahini dressing",
      "Garnish with sesame seeds if desired"
    ],
    tags: ["quinoa", "vegetables", "plant-based", "nutritious"],
    isRecommended: true,
    createdAt: Date.now(),
  },
  {
    _id: "9",
    title: "Chicken Teriyaki Bowl",
    description: "Asian-inspired bowl with lean chicken and steamed vegetables.",
    category: "lunch",
    cookingTime: 20,
    servings: 2,
    difficulty: "medium",
    calories: 380,
    protein: 30,
    carbs: 35,
    fats: 12,
    ingredients: [
      { name: "Chicken breast", amount: "8", unit: "oz" },
      { name: "Brown rice", amount: "1", unit: "cup" },
      { name: "Broccoli", amount: "2", unit: "cups" },
      { name: "Carrots", amount: "1", unit: "large" },
      { name: "Snow peas", amount: "1/2", unit: "cup" },
      { name: "Teriyaki sauce", amount: "3", unit: "tbsp" },
      { name: "Sesame oil", amount: "1", unit: "tsp" },
      { name: "Green onions", amount: "2", unit: "stalks" },
    ],
    instructions: [
      "Cook brown rice according to package instructions",
      "Cut chicken into bite-sized pieces",
      "Heat sesame oil in a large pan",
      "Cook chicken until golden and cooked through",
      "Steam broccoli, carrots, and snow peas until tender",
      "Add teriyaki sauce to chicken and simmer",
      "Serve chicken over rice with steamed vegetables",
      "Garnish with sliced green onions"
    ],
    tags: ["asian-inspired", "lean-protein", "balanced", "meal-prep"],
    isRecommended: true,
    createdAt: Date.now(),
  },
  {
    _id: "10",
    title: "Recovery Chocolate Smoothie",
    description: "Rich chocolate smoothie with protein for post-workout recovery.",
    category: "post-workout",
    cookingTime: 3,
    servings: 1,
    difficulty: "easy",
    calories: 320,
    protein: 25,
    carbs: 35,
    fats: 8,
    ingredients: [
      { name: "Chocolate protein powder", amount: "1", unit: "scoop" },
      { name: "Banana", amount: "1", unit: "medium" },
      { name: "Almond milk", amount: "1", unit: "cup" },
      { name: "Cocoa powder", amount: "1", unit: "tbsp" },
      { name: "Greek yogurt", amount: "1/4", unit: "cup" },
      { name: "Spinach", amount: "1", unit: "cup" },
      { name: "Ice", amount: "1/2", unit: "cup" },
    ],
    instructions: [
      "Add almond milk to blender first",
      "Add banana, spinach, and Greek yogurt",
      "Add protein powder and cocoa powder",
      "Add ice cubes",
      "Blend until smooth and creamy",
      "Add more liquid if needed for consistency",
      "Serve immediately after workout"
    ],
    tags: ["chocolate", "post-workout", "recovery", "protein"],
    isRecommended: true,
    createdAt: Date.now(),
  },
];

// Helper functions for recipe statistics
export const getRecipeStats = () => {
  const totalRecipes = sampleRecipes.length;
  const recommendedRecipes = sampleRecipes.filter(recipe => recipe.isRecommended).length;
  const avgCookingTime = Math.round(sampleRecipes.reduce((sum, recipe) => sum + recipe.cookingTime, 0) / totalRecipes);
  const avgProtein = Math.round(sampleRecipes.reduce((sum, recipe) => sum + recipe.protein, 0) / totalRecipes);
  const avgCalories = Math.round(sampleRecipes.reduce((sum, recipe) => sum + recipe.calories, 0) / totalRecipes);

  const categoryCounts = sampleRecipes.reduce((acc, recipe) => {
    acc[recipe.category] = (acc[recipe.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const difficultyCounts = sampleRecipes.reduce((acc, recipe) => {
    acc[recipe.difficulty] = (acc[recipe.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalRecipes,
    recommendedRecipes,
    avgCookingTime,
    avgProtein,
    avgCalories,
    categoryCounts,
    difficultyCounts,
  };
};

// Get recipe by ID
export const getRecipeById = (id: string) => {
  return sampleRecipes.find(recipe => recipe._id === id) || null;
};

// Get recommended recipes
export const getRecommendedRecipes = (limit?: number) => {
  const recommended = sampleRecipes.filter(recipe => recipe.isRecommended);
  return limit ? recommended.slice(0, limit) : recommended;
};

// Filter recipes
export const filterRecipes = (category?: string, difficulty?: string, searchTerm?: string) => {
  return sampleRecipes.filter(recipe => {
    const categoryMatch = !category || category === "all" || recipe.category === category;
    const difficultyMatch = !difficulty || difficulty === "all" || recipe.difficulty === difficulty;
    const searchMatch = !searchTerm || 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && difficultyMatch && searchMatch;
  });
};
