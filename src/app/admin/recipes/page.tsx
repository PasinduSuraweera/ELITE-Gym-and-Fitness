"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/AdminLayout";
import {
  Clock,
  Users,
  Flame,
  Zap,
  Star,
  Plus,
  Edit2,
  Trash2,
  ChefHat,
  X,
  FileText,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

// Theme-compatible Badge component
const Badge = ({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
}) => {
  const baseClasses =
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantClasses =
    variant === "outline"
      ? "border-border text-muted-foreground bg-transparent"
      : "border-transparent bg-primary/20 text-primary";

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};

const AdminRecipesPage = () => {
  const { isSignedIn } = useAuth();
  // Get recipes from Convex
  const recipes = useQuery(api.recipes.getRecipes, isSignedIn ? {} : "skip");
  const deleteRecipeMutation = useMutation(api.recipes.deleteRecipe);
  const updateRecipeMutation = useMutation(api.recipes.updateRecipe);
  const createRecipeMutation = useMutation(api.recipes.createRecipe);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [recommendedFilter, setRecommendedFilter] = useState<string>("all");

  // Modal state for adding new recipe
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    ingredients: [{ name: "", amount: "", unit: "" }],
    instructions: [""],
    cookingTime: 35, // prepTime + cookTime
    servings: 2,
    difficulty: "easy" as const,
    category: "breakfast" as const,
    tags: [] as string[],
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    imageUrl: "",
    isRecommended: false,
  });

  // Modal state for editing recipe
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [editRecipe, setEditRecipe] = useState({
    title: "",
    description: "",
    imageUrl: "",
    ingredients: [{ name: "", amount: "", unit: "" }],
    instructions: [""],
    cookingTime: 35,
    servings: 2,
    difficulty: "easy" as const,
    category: "breakfast" as const,
    tags: [] as string[],
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    isRecommended: false,
  });

  // Filter recipes based on search and filters
  const filteredRecipes = recipes?.filter((recipe) => {
    const matchesSearch = 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing => 
        ing.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = 
      categoryFilter === "all" || recipe.category === categoryFilter;
    
    const matchesDifficulty = 
      difficultyFilter === "all" || recipe.difficulty === difficultyFilter;
    
    const matchesRecommended = 
      recommendedFilter === "all" || 
      (recommendedFilter === "recommended" && recipe.isRecommended) ||
      (recommendedFilter === "not-recommended" && !recipe.isRecommended);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesRecommended;
  });

  // Calculate statistics from filtered recipes data
  const totalRecipes = filteredRecipes?.length || 0;
  const allRecipes = recipes?.length || 0;
  const recommendedRecipes =
    filteredRecipes?.filter((recipe) => recipe.isRecommended).length || 0;
  const avgCookingTime = filteredRecipes?.length
    ? Math.round(
        filteredRecipes.reduce((sum, recipe) => sum + recipe.cookingTime, 0) /
          filteredRecipes.length
      )
    : 0;
  const avgProtein = filteredRecipes?.length
    ? Math.round(
        filteredRecipes.reduce((sum, recipe) => sum + recipe.protein, 0) /
          filteredRecipes.length
      )
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-400 dark:border-green-500/30";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-500/30";
      case "hard":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-400 dark:border-red-500/30";
      default:
        return "bg-accent/50 text-muted-foreground border-border";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breakfast":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-400 dark:border-orange-500/30";
      case "lunch":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-500/30";
      case "dinner":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-400 dark:border-purple-500/30";
      case "snack":
        return "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-400 dark:border-pink-500/30";
      case "pre-workout":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-400 dark:border-green-500/30";
      case "post-workout":
        return "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/50 dark:text-cyan-400 dark:border-cyan-500/30";
      case "protein":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-400 dark:border-red-500/30";
      case "healthy":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-500/30";
      default:
        return "bg-accent/50 text-muted-foreground border-border";
    }
  };

  const handleEditRecipe = (recipeId: string) => {
    const recipe = recipes?.find((r) => r._id === recipeId);
    if (recipe) {
      setEditingRecipe(recipe);
      setEditRecipe({
        title: recipe.title,
        description: recipe.description,
        imageUrl: recipe.imageUrl || "",
        ingredients: recipe.ingredients.map((ing) => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit || "",
        })),
        instructions: recipe.instructions || [""],
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty as any,
        category: recipe.category as any,
        tags: recipe.tags || [],
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fats: recipe.fats,
        isRecommended: recipe.isRecommended,
      });
      setShowEditModal(true);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      try {
        await deleteRecipeMutation({ id: recipeId as Id<"recipes"> });
        alert("Recipe deleted successfully!");
      } catch (error) {
        alert(
          "Failed to delete recipe. Make sure you're logged in as an admin."
        );
        console.error("Delete error:", error);
      }
    }
  };

  const handleToggleRecommended = async (
    recipeId: string,
    currentStatus: boolean
  ) => {
    try {
      await updateRecipeMutation({
        id: recipeId as Id<"recipes">,
        isRecommended: !currentStatus,
      });
      alert(
        `Recipe ${!currentStatus ? "marked as recommended" : "removed from recommended"}!`
      );
    } catch (error) {
      alert("Failed to update recipe. Make sure you're logged in as an admin.");
      console.error("Update error:", error);
    }
  };

  const handleCreateRecipe = async () => {
    if (!newRecipe.title.trim() || !newRecipe.description.trim()) {
      alert("Please fill in title and description");
      return;
    }

    try {
      await createRecipeMutation({
        title: newRecipe.title,
        description: newRecipe.description,
        ingredients: newRecipe.ingredients.filter((i) => i.name.trim()),
        instructions: newRecipe.instructions.filter((i) => i.trim()),
        cookingTime: newRecipe.cookingTime,
        servings: newRecipe.servings,
        difficulty: newRecipe.difficulty,
        category: newRecipe.category,
        tags: newRecipe.tags,
        calories: newRecipe.calories,
        protein: newRecipe.protein,
        carbs: newRecipe.carbs,
        fats: newRecipe.fats,
        imageUrl: newRecipe.imageUrl,
        isRecommended: newRecipe.isRecommended,
      });

      alert("Recipe created successfully!");
      setShowAddModal(false);
      setNewRecipe({
        title: "",
        description: "",
        ingredients: [{ name: "", amount: "", unit: "" }],
        instructions: [""],
        cookingTime: 35,
        servings: 2,
        difficulty: "easy",
        category: "breakfast",
        tags: [],
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        imageUrl: "",
        isRecommended: false,
      });
    } catch (error) {
      alert("Failed to create recipe. Make sure you're logged in as an admin.");
      console.error("Create error:", error);
    }
  };

  const addIngredient = () => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: "", unit: "" }],
    }));
  };

  const removeIngredient = (index: number) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (
    index: number,
    field: "name" | "amount" | "unit",
    value: string
  ) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const addInstruction = () => {
    setNewRecipe((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index: number) => {
    setNewRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setNewRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst
      ),
    }));
  };

  // Edit recipe handlers
  const handleUpdateRecipe = async () => {
    if (!editRecipe.title.trim() || !editRecipe.description.trim()) {
      alert("Please fill in title and description");
      return;
    }

    if (!editingRecipe) return;

    try {
      await updateRecipeMutation({
        id: editingRecipe._id,
        title: editRecipe.title,
        description: editRecipe.description,
        ingredients: editRecipe.ingredients.filter((i) => i.name.trim()),
        instructions: editRecipe.instructions.filter((i) => i.trim()),
        cookingTime: editRecipe.cookingTime,
        servings: editRecipe.servings,
        difficulty: editRecipe.difficulty,
        category: editRecipe.category,
        tags: editRecipe.tags,
        calories: editRecipe.calories,
        protein: editRecipe.protein,
        carbs: editRecipe.carbs,
        fats: editRecipe.fats,
        imageUrl: editRecipe.imageUrl,
        isRecommended: editRecipe.isRecommended,
      });

      alert("Recipe updated successfully!");
      setShowEditModal(false);
      setEditingRecipe(null);
    } catch (error) {
      alert("Failed to update recipe. Make sure you're logged in as an admin.");
      console.error("Update error:", error);
    }
  };

  const addEditIngredient = () => {
    setEditRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: "", unit: "" }],
    }));
  };

  const removeEditIngredient = (index: number) => {
    setEditRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateEditIngredient = (
    index: number,
    field: "name" | "amount" | "unit",
    value: string
  ) => {
    setEditRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const addEditInstruction = () => {
    setEditRecipe((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeEditInstruction = (index: number) => {
    setEditRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateEditInstruction = (index: number, value: string) => {
    setEditRecipe((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst
      ),
    }));
  };

  // Export recipes to CSV
  const handleExportRecipes = () => {
    if (!filteredRecipes?.length) {
      alert("No recipes to export");
      return;
    }

    const headers = [
      'Title',
      'Description',
      'Category',
      'Difficulty',
      'Cooking Time (min)',
      'Servings',
      'Calories',
      'Protein (g)',
      'Carbs (g)',
      'Fats (g)',
      'Is Recommended',
      'Created Date',
      'Ingredients',
      'Instructions',
      'Tags'
    ];

    const csvData = filteredRecipes.map((recipe: any) => [
      recipe.title,
      recipe.description,
      recipe.category,
      recipe.difficulty,
      recipe.cookingTime,
      recipe.servings,
      recipe.calories,
      recipe.protein,
      recipe.carbs,
      recipe.fats,
      recipe.isRecommended ? 'Yes' : 'No',
      new Date(recipe.createdAt).toLocaleDateString(),
      recipe.ingredients.map((ing: any) => `${ing.amount} ${ing.unit || ''} ${ing.name}`).join('; '),
      recipe.instructions.join('; '),
      recipe.tags?.join('; ') || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recipes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Show loading state
  if (recipes === undefined) {
    return (
      <AdminLayout title="Recipe Management" subtitle="Loading recipes...">
        <div className="flex items-center justify-center py-12">
          <div className="text-foreground">Loading recipes...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Recipe Management"
      subtitle="Manage nutrition content for your gym members"
    >
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card/50 border border-border hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <ChefHat className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {totalRecipes}
              </div>
              <div className="text-sm text-muted-foreground">Total Recipes</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border border-border hover:border-yellow-500/30 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {recommendedRecipes}
              </div>
              <div className="text-sm text-muted-foreground">Recommended</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border border-border hover:border-blue-500/30 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {avgCookingTime}
              </div>
              <div className="text-sm text-muted-foreground">Avg Cook Time (min)</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border border-border hover:border-green-500/30 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{avgProtein}g</div>
              <div className="text-sm text-muted-foreground">Avg Protein</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card/50 border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Search & Filter Recipes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Find recipes by name, ingredients, category, or difficulty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Search by title, description, or ingredients..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="pre-workout">Pre-workout</option>
                  <option value="post-workout">Post-workout</option>
                  <option value="protein">Protein</option>
                  <option value="healthy">Healthy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Difficulty
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recommended
                </label>
                <select
                  value={recommendedFilter}
                  onChange={(e) => setRecommendedFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Recipes</option>
                  <option value="recommended">Recommended</option>
                  <option value="not-recommended">Not Recommended</option>
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            {(searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || recommendedFilter !== "all") && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-500/30">
                    Search: &quot;{searchTerm}&quot;
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge className={getCategoryColor(categoryFilter)}>
                    Category: {categoryFilter}
                  </Badge>
                )}
                {difficultyFilter !== "all" && (
                  <Badge className={getDifficultyColor(difficultyFilter)}>
                    Difficulty: {difficultyFilter}
                  </Badge>
                )}
                {recommendedFilter !== "all" && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-500/30">
                    {recommendedFilter === "recommended" ? "Recommended Only" : "Not Recommended"}
                  </Badge>
                )}
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setDifficultyFilter("all");
                    setRecommendedFilter("all");
                  }}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Recipes ({totalRecipes} of {allRecipes})
            </h2>
            {totalRecipes !== allRecipes && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing {totalRecipes} filtered results from {allRecipes} total recipes
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportRecipes}
              variant="outline"
              className="border-border text-foreground hover:bg-accent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Recipe
            </Button>
          </div>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes && filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe: any) => (
              <div
                key={recipe._id}
                className="bg-card/50 border border-border hover:border-primary/50 transition-colors rounded-lg overflow-hidden flex flex-col h-full"
              >
                {/* Recipe Image */}
                {recipe.imageUrl && (
                  <div className="relative h-32 overflow-hidden flex-shrink-0">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    {recipe.isRecommended && (
                      <div className="absolute top-2 right-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 pb-3 flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-foreground text-lg mb-2 flex items-center gap-2">
                        {recipe.title}
                        {!recipe.imageUrl && recipe.isRecommended && (
                          <Star className="h-4 w-4 text-yellow-400" />
                        )}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Badge className={getCategoryColor(recipe.category)}>
                      {recipe.category}
                    </Badge>
                    <Badge className={getDifficultyColor(recipe.difficulty)}>
                      {recipe.difficulty}
                    </Badge>
                  </div>

                  {/* Recipe Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center mt-4">
                    <div>
                      <Clock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                      <div className="text-sm font-semibold text-foreground">
                        {recipe.cookingTime}m
                      </div>
                    </div>
                    <div>
                      <Users className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                      <div className="text-sm font-semibold text-foreground">
                        {recipe.servings}
                      </div>
                    </div>
                    <div>
                      <Flame className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                      <div className="text-sm font-semibold text-foreground">
                        {recipe.calories}
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Info */}
                  <div className="bg-accent/50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div>
                        <div className="text-red-400 font-semibold">
                          {recipe.protein}g
                        </div>
                        <div className="text-muted-foreground">Protein</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-semibold">
                          {recipe.carbs}g
                        </div>
                        <div className="text-muted-foreground">Carbs</div>
                      </div>
                      <div>
                        <div className="text-yellow-400 font-semibold">
                          {recipe.fats}g
                        </div>
                        <div className="text-muted-foreground">Fats</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/recipes/${recipe._id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-border text-muted-foreground hover:bg-accent"
                      >
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                      onClick={() =>
                        handleToggleRecommended(recipe._id, recipe.isRecommended)
                      }
                      title={
                        recipe.isRecommended
                          ? "Remove from recommended"
                          : "Mark as recommended"
                      }
                    >
                      <Star
                        className={`h-4 w-4 ${recipe.isRecommended ? "fill-current" : ""}`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => handleEditRecipe(recipe._id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDeleteRecipe(recipe._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-card border border-border">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || recommendedFilter !== "all" 
                      ? "No recipes found" 
                      : "No recipes yet"
                    }
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || recommendedFilter !== "all"
                      ? "Try adjusting your search criteria or filters to find more recipes."
                      : "Get started by creating your first recipe to help members with their fitness journey."
                    }
                  </p>
                </div>
                {!(searchTerm || categoryFilter !== "all" || difficultyFilter !== "all" || recommendedFilter !== "all") && (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Recipe
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        
        {/* Add Recipe Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20 pb-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-semibold text-foreground">
                  Add New Recipe
                </h3>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newRecipe.title}
                      onChange={(e) =>
                        setNewRecipe((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Recipe title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newRecipe.description}
                      onChange={(e) =>
                        setNewRecipe((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={3}
                      placeholder="Recipe description"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={newRecipe.imageUrl || ""}
                      onChange={(e) =>
                        setNewRecipe((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="https://example.com/recipe-image.jpg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a direct URL to an image (jpg, png, webp)
                    </p>

                    {/* Image Preview */}
                    {newRecipe.imageUrl &&
                      newRecipe.imageUrl !== "/api/placeholder/400/300" && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                          <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-border">
                            <img
                              src={newRecipe.imageUrl}
                              alt="Recipe preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = "none";
                                const errorDiv =
                                  target.nextElementSibling as HTMLElement;
                                if (errorDiv) errorDiv.style.display = "flex";
                              }}
                            />
                            <div className="absolute inset-0 bg-destructive/20 border border-destructive/30 rounded-lg hidden items-center justify-center text-destructive text-xs">
                              Invalid Image
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Category
                      </label>
                      <select
                        value={newRecipe.category}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            category: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                        <option value="pre-workout">Pre-workout</option>
                        <option value="post-workout">Post-workout</option>
                        <option value="protein">Protein</option>
                        <option value="healthy">Healthy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Difficulty
                      </label>
                      <select
                        value={newRecipe.difficulty}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            difficulty: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Cooking Time (min)
                      </label>
                      <input
                        type="number"
                        value={newRecipe.cookingTime}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            cookingTime: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Servings
                      </label>
                      <input
                        type="number"
                        value={newRecipe.servings}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            servings: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Calories
                      </label>
                      <input
                        type="number"
                        value={newRecipe.calories}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            calories: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        value={newRecipe.protein}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            protein: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        value={newRecipe.carbs}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            carbs: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Fats (g)
                      </label>
                      <input
                        type="number"
                        value={newRecipe.fats}
                        onChange={(e) =>
                          setNewRecipe((prev) => ({
                            ...prev,
                            fats: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ingredients
                  </label>
                  {newRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) =>
                          updateIngredient(index, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ingredient name"
                      />
                      <input
                        type="text"
                        value={ingredient.amount}
                        onChange={(e) =>
                          updateIngredient(index, "amount", e.target.value)
                        }
                        className="w-24 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Amount"
                      />
                      <input
                        type="text"
                        value={ingredient.unit || ""}
                        onChange={(e) =>
                          updateIngredient(index, "unit", e.target.value)
                        }
                        className="w-20 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Unit"
                      />
                      {newRecipe.ingredients.length > 1 && (
                        <Button
                          onClick={() => removeIngredient(index)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={addIngredient}
                    variant="outline"
                    size="sm"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Instructions
                  </label>
                  {newRecipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <span className="w-8 h-10 bg-primary/20 border border-primary/30 rounded-md flex items-center justify-center text-primary text-sm font-medium">
                        {index + 1}
                      </span>
                      <textarea
                        value={instruction}
                        onChange={(e) =>
                          updateInstruction(index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        rows={2}
                        placeholder={`Step ${index + 1}`}
                      />
                      {newRecipe.instructions.length > 1 && (
                        <Button
                          onClick={() => removeInstruction(index)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 self-start"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={addInstruction}
                    variant="outline"
                    size="sm"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {/* Recommended checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="recommended"
                    checked={newRecipe.isRecommended}
                    onChange={(e) =>
                      setNewRecipe((prev) => ({
                        ...prev,
                        isRecommended: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/20"
                  />
                  <label
                    htmlFor="recommended"
                    className="text-sm text-foreground"
                  >
                    Mark as recommended recipe
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRecipe}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Create Recipe
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Recipe Modal */}
        {showEditModal && editingRecipe && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20 pb-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-semibold text-foreground">
                  Edit Recipe: {editingRecipe.title}
                </h3>
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editRecipe.title}
                      onChange={(e) =>
                        setEditRecipe((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Recipe title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description *
                    </label>
                    <textarea
                      value={editRecipe.description}
                      onChange={(e) =>
                        setEditRecipe((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={3}
                      placeholder="Recipe description"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={editRecipe.imageUrl || ""}
                      onChange={(e) =>
                        setEditRecipe((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="https://example.com/recipe-image.jpg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a direct URL to an image (jpg, png, webp)
                    </p>

                    {/* Image Preview */}
                    {editRecipe.imageUrl &&
                      editRecipe.imageUrl !== "/api/placeholder/400/300" && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                          <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-border">
                            <img
                              src={editRecipe.imageUrl}
                              alt="Recipe preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = "none";
                                const errorDiv =
                                  target.nextElementSibling as HTMLElement;
                                if (errorDiv) errorDiv.style.display = "flex";
                              }}
                            />
                            <div className="absolute inset-0 bg-destructive/20 border border-destructive/30 rounded-lg hidden items-center justify-center text-destructive text-xs">
                              Invalid Image
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Category
                      </label>
                      <select
                        value={editRecipe.category}
                        onChange={(e) =>
                          setEditRecipe((prev) => ({
                            ...prev,
                            category: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                        <option value="pre-workout">Pre-workout</option>
                        <option value="post-workout">Post-workout</option>
                        <option value="protein">Protein</option>
                        <option value="healthy">Healthy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Difficulty
                      </label>
                      <select
                        value={editRecipe.difficulty}
                        onChange={(e) =>
                          setEditRecipe((prev) => ({
                            ...prev,
                            difficulty: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Cooking Time (min)
                      </label>
                      <input
                        type="number"
                        value={editRecipe.cookingTime}
                        onChange={(e) =>
                          setEditRecipe((prev) => ({
                            ...prev,
                            cookingTime: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Servings
                      </label>
                      <input
                        type="number"
                        value={editRecipe.servings}
                        onChange={(e) =>
                          setEditRecipe((prev) => ({
                            ...prev,
                            servings: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Calories
                      </label>
                      <input
                        type="number"
                        value={editRecipe.calories}
                        onChange={(e) =>
                          setEditRecipe((prev) => ({
                            ...prev,
                            calories: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        value={editRecipe.protein}
                        onChange={(e) =>
                          setEditRecipe((prev) => ({
                            ...prev,
                            protein: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        value={editRecipe.carbs}
                        onChange={(e) =>
                          setEditRecipe((prev) => ({
                            ...prev,
                            carbs: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Fats (g)
                      </label>
                      <input
                        type="number"
                        value={editRecipe.fats}
                        onChange={(e) =>
                          setEditRecipe((prev) => ({
                            ...prev,
                            fats: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ingredients
                  </label>
                  {editRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) =>
                          updateEditIngredient(index, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Ingredient name"
                      />
                      <input
                        type="text"
                        value={ingredient.amount}
                        onChange={(e) =>
                          updateEditIngredient(index, "amount", e.target.value)
                        }
                        className="w-24 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Amount"
                      />
                      <input
                        type="text"
                        value={ingredient.unit || ""}
                        onChange={(e) =>
                          updateEditIngredient(index, "unit", e.target.value)
                        }
                        className="w-20 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Unit"
                      />
                      {editRecipe.ingredients.length > 1 && (
                        <Button
                          onClick={() => removeEditIngredient(index)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={addEditIngredient}
                    variant="outline"
                    size="sm"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Instructions
                  </label>
                  {editRecipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <span className="w-8 h-10 bg-primary/20 border border-primary/30 rounded-md flex items-center justify-center text-primary text-sm font-medium">
                        {index + 1}
                      </span>
                      <textarea
                        value={instruction}
                        onChange={(e) =>
                          updateEditInstruction(index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        rows={2}
                        placeholder={`Step ${index + 1}`}
                      />
                      {editRecipe.instructions.length > 1 && (
                        <Button
                          onClick={() => removeEditInstruction(index)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 self-start"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={addEditInstruction}
                    variant="outline"
                    size="sm"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {/* Recommended checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="edit-recommended"
                    checked={editRecipe.isRecommended}
                    onChange={(e) =>
                      setEditRecipe((prev) => ({
                        ...prev,
                        isRecommended: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/20"
                  />
                  <label
                    htmlFor="edit-recommended"
                    className="text-sm text-foreground"
                  >
                    Mark as recommended recipe
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateRecipe}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Update Recipe
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRecipesPage;
