"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Users,
  Flame,
  Zap,
  Star,
  Filter,
  Search,
  Target,
  TrendingUp,
  Brain,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { RecipeImage } from "@/components/ui/RecipeImage";

// Simple Badge component
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
      ? "border-gray-600 text-gray-400 bg-transparent"
      : "border-transparent bg-primary/20 text-primary";

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};

// Simple Input component
const Input = ({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const baseClasses =
    "flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50";

  return <input className={`${baseClasses} ${className}`} {...props} />;
};

const RecipesPage = () => {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get recipes from Convex
  const allRecipes = useQuery(api.recipes.getRecipes, {
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
  });

  const recommendedRecipes = useQuery(api.recipes.getRecommendedRecipes, {
    limit: 6,
  });

  // Get personalized recommendations based on user's plan
  const personalizedRecipes = useQuery(
    api.recipes.getPersonalizedRecipes,
    user?.id ? { clerkId: user.id, limit: 8 } : "skip"
  );

  // Get workout-based recommendations
  const workoutBasedRecipes = useQuery(
    api.recipes.getWorkoutBasedRecipes,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get meal prep suggestions
  const mealPrepRecipes = useQuery(
    api.recipes.getMealPrepSuggestions,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Search recipes if there's a search term
  const searchResults = useQuery(
    api.recipes.searchRecipes,
    searchTerm ? { searchTerm, limit: 50 } : "skip"
  );

  // Determine which recipes to display
  const displayRecipes =
    searchTerm && searchResults ? searchResults : allRecipes || [];

  const categories = [
    { value: "all", label: "All Recipes" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snacks" },
    { value: "pre-workout", label: "Pre-Workout" },
    { value: "post-workout", label: "Post-Workout" },
    { value: "protein", label: "Protein" },
    { value: "healthy", label: "Healthy" },
  ];

  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-900/50 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-900/50 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-destructive/50 text-destructive border-destructive/30";
      default:
        return "bg-gray-900/50 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breakfast":
        return "bg-orange-900/50 text-orange-400 border-orange-500/30";
      case "lunch":
        return "bg-blue-900/50 text-blue-400 border-blue-500/30";
      case "dinner":
        return "bg-purple-900/50 text-purple-400 border-purple-500/30";
      case "snack":
        return "bg-pink-900/50 text-pink-400 border-pink-500/30";
      case "pre-workout":
        return "bg-green-900/50 text-green-400 border-green-500/30";
      case "post-workout":
        return "bg-cyan-900/50 text-cyan-400 border-cyan-500/30";
      case "protein":
        return "bg-orange-900/50 text-orange-400 border-orange-500/30";
      case "healthy":
        return "bg-emerald-900/50 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-gray-900/50 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background"
      suppressHydrationWarning
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"
        suppressHydrationWarning
      ></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]"
        suppressHydrationWarning
      ></div>

      <div
        className="container mx-auto px-4 py-32 relative z-10 flex-1"
        suppressHydrationWarning
      >
        {/* Header */}
        <div
          className="max-w-4xl mx-auto text-center mb-16"
          suppressHydrationWarning
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            <span className="text-primary">Healthy</span> Recipes
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
            Fuel your fitness journey with our curated collection of nutritious
            and delicious recipes
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-12 pr-4 py-4 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 text-base"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-6 justify-center items-center mb-12">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-base text-muted-foreground">Filters:</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-base focus:border-primary focus:ring-primary/20"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-background">
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-base focus:border-primary focus:ring-primary/20"
            >
              {difficulties.map((diff) => (
                <option
                  key={diff.value}
                  value={diff.value}
                  className="bg-background"
                >
                  {diff.label}
                </option>
              ))}
            </select>

            {(selectedCategory !== "all" ||
              selectedDifficulty !== "all" ||
              searchTerm) && (
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                  setSearchTerm("");
                }}
                className="px-6 py-3 border-border text-primary hover:bg-primary/10 text-base font-medium"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="personalized" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-12 bg-card/50 border border-border p-1 h-14">
            <TabsTrigger
              value="personalized"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 text-base font-medium py-3"
            >
              <Brain className="h-5 w-5 mr-2" />
              For You
            </TabsTrigger>
            <TabsTrigger
              value="workout"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 text-base font-medium py-3"
            >
              <Target className="h-5 w-5 mr-2" />
              Workout
            </TabsTrigger>
            <TabsTrigger
              value="recommended"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 text-base font-medium py-3"
            >
              <Star className="h-5 w-5 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 text-base font-medium py-3"
            >
              <Zap className="h-5 w-5 mr-2" />
              All
            </TabsTrigger>
          </TabsList>

          {/* Personalized Recipes */}
          <TabsContent value="personalized">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                <span className="text-primary">Personalized</span> for Your
                Goals
              </h2>
              <p className="text-muted-foreground text-lg">
                AI-curated recipes based on your fitness plan and dietary needs
              </p>
            </div>

            {user?.id ? (
              <>
                {/* Meal Prep Section */}
                {mealPrepRecipes && mealPrepRecipes.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">
                        Meal Prep Champions
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        Perfect for your workout schedule
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                      {mealPrepRecipes.slice(0, 3).map((recipe: any) => (
                        <div
                          key={recipe._id}
                          className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 group flex flex-col h-full overflow-hidden rounded-lg"
                        >
                          {/* Recipe Image */}
                          {recipe.imageUrl && (
                            <div className="relative h-48 overflow-hidden flex-shrink-0">
                              <img
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                              <div className="absolute top-2 right-2 text-xs text-primary font-mono bg-card/80 px-2 py-1 rounded border border-border">
                                {recipe.weeklyPortions} portions
                              </div>
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-secondary/80 text-secondary-foreground border-secondary/30">
                                  meal-prep
                                </Badge>
                              </div>
                            </div>
                          )}

                          <div className="p-6 pb-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-foreground text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                  {recipe.title}
                                </h3>
                                <p className="text-muted-foreground text-base line-clamp-3 leading-relaxed">
                                  {recipe.description}
                                </p>
                              </div>
                              {!recipe.imageUrl && (
                                <div className="ml-3 text-right">
                                  <div className="text-sm text-orange-400 font-mono">
                                    {recipe.weeklyPortions} portions
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Score: {recipe.suitabilityScore}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                              <Badge
                                className={getCategoryColor(recipe.category)}
                              >
                                {recipe.category}
                              </Badge>
                              {!recipe.imageUrl && (
                                <Badge className="bg-orange-900/50 text-orange-400 border-orange-500/30">
                                  meal-prep
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6 text-base mt-6">
                              <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <span className="text-muted-foreground">
                                  {recipe.cookingTime} min
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <span className="text-muted-foreground">
                                  {recipe.servings} servings
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Flame className="h-5 w-5 text-primary" />
                                <span className="text-muted-foreground">
                                  {recipe.calories} cal
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" />
                                <span className="text-muted-foreground">
                                  {recipe.protein}g protein
                                </span>
                              </div>
                            </div>

                            <Link
                              href={`/recipes/${recipe._id}`}
                              className="mt-auto"
                            >
                              <Button className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground border-0 text-base font-medium">
                                View Recipe
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personalized Recipes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {personalizedRecipes?.map((recipe: any) => (
                    <div
                      key={recipe._id}
                      className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 group flex flex-col h-full overflow-hidden rounded-lg"
                    >
                      {/* Recipe Image */}
                      {recipe.imageUrl && (
                        <div className="relative h-48 overflow-hidden flex-shrink-0">
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute top-2 right-2 text-xs text-primary font-mono bg-card/80 px-2 py-1 rounded border border-border">
                            Match:{" "}
                            {recipe.score
                              ? Math.round((recipe.score / 100) * 100)
                              : 0}
                            %
                          </div>
                        </div>
                      )}
                      <div className="p-4 pb-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                              {recipe.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {recipe.description}
                            </p>
                          </div>
                          {!recipe.imageUrl && (
                            <div className="ml-2 text-right">
                              <div className="text-xs text-primary font-mono">
                                Match:{" "}
                                {recipe.score
                                  ? Math.round((recipe.score / 100) * 100)
                                  : 0}
                                %
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge className={getCategoryColor(recipe.category)}>
                            {recipe.category}
                          </Badge>
                          <Badge
                            className={getDifficultyColor(recipe.difficulty)}
                          >
                            {recipe.difficulty}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm mt-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">
                              {recipe.cookingTime} min
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">
                              {recipe.servings} servings
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">
                              {recipe.calories} cal
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">
                              {recipe.protein}g protein
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {recipe.tags.slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-gray-600 text-gray-400"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {recipe.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-gray-600 text-gray-400"
                            >
                              +{recipe.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <Link
                          href={`/recipes/${recipe._id}`}
                          className="mt-auto"
                        >
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                            View Recipe
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <Brain className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Sign in for Personalized Recipes
                </h3>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto leading-relaxed">
                  Get AI-powered recipe recommendations based on your fitness
                  goals and plans
                </p>
                <Button asChild className="bg-primary hover:bg-primary/90 px-6 py-3 text-base font-medium">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Workout-Based Recipes */}
          <TabsContent value="workout">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                <span className="text-primary">Workout</span> Optimized
              </h2>
              <p className="text-muted-foreground text-lg">
                Perfect nutrition timing for your training schedule
              </p>
            </div>

            {user?.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {workoutBasedRecipes?.map((recipe: any) => (
                  <div
                    key={recipe._id}
                    className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 group flex flex-col h-full overflow-hidden rounded-lg"
                  >
                    {/* Recipe Image */}
                    {recipe.imageUrl && (
                      <div className="relative h-48 overflow-hidden flex-shrink-0">
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute top-2 right-2">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    )}

                    <div className="p-4 pb-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                            {recipe.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {recipe.description}
                          </p>
                        </div>
                        {!recipe.imageUrl && (
                          <Target className="h-5 w-5 text-primary ml-2 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className={getCategoryColor(recipe.category)}>
                          {recipe.category}
                        </Badge>
                        <Badge
                          className={getDifficultyColor(recipe.difficulty)}
                        >
                          {recipe.difficulty}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm mt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">
                            {recipe.cookingTime} min
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">
                            {recipe.servings} servings
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">
                            {recipe.calories} cal
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">
                            {recipe.protein}g protein
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {recipe.tags.slice(0, 3).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-gray-600 text-gray-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {recipe.tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-600 text-gray-400"
                          >
                            +{recipe.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <Link href={`/recipes/${recipe._id}`} className="mt-auto">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                          View Recipe
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Target className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Sign in for Workout Recipes
                </h3>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto leading-relaxed">
                  Get recipes optimized for your workout schedule and timing
                </p>
                <Button asChild className="bg-primary hover:bg-primary/90 px-6 py-3 text-base font-medium">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Recommended Recipes */}
          <TabsContent value="recommended">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                <span className="text-primary">Popular</span> Recipes
              </h2>
              <p className="text-muted-foreground text-lg">
                Community favorites and most loved recipes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedRecipes?.slice(0, 9).map((recipe: any) => (
                <div
                  key={recipe._id}
                  className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 group flex flex-col h-full overflow-hidden rounded-lg"
                >
                  {/* Recipe Image */}
                  {recipe.imageUrl && (
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 px-2 py-1 rounded">
                        <Star className="h-3 w-3 text-primary fill-current" />
                        <span className="text-primary text-xs font-semibold">
                          {recipe.rating?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-secondary/80 text-secondary-foreground border-secondary/30">
                          popular
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="p-4 pb-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                          {recipe.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {recipe.description}
                        </p>
                      </div>
                      {!recipe.imageUrl && (
                        <div className="ml-2 flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary fill-current" />
                          <span className="text-primary text-sm font-semibold">
                            {recipe.rating?.toFixed(1) || "5.0"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={getCategoryColor(recipe.category)}>
                        {recipe.category}
                      </Badge>
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                      {!recipe.imageUrl && (
                        <Badge className="bg-secondary/50 text-secondary-foreground border-secondary/30">
                          popular
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {recipe.cookingTime} min
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {recipe.servings} servings
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {recipe.calories} cal
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {recipe.protein}g protein
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs border-gray-600 text-gray-400"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-600 text-gray-400"
                        >
                          +{recipe.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Link href={`/recipes/${recipe._id}`} className="mt-auto">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                        View Recipe
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* All Recipes */}
          <TabsContent value="all">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                All <span className="text-primary">Recipes</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Discover our complete collection of healthy recipes
              </p>
              {displayRecipes && (
                <p className="text-base text-gray-500 mt-3">
                  Showing {displayRecipes.length} recipe
                  {displayRecipes.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayRecipes?.map((recipe: any) => (
                <div
                  key={recipe._id}
                  className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 group flex flex-col h-full overflow-hidden rounded-lg"
                >
                  {/* Recipe Image */}
                  {recipe.imageUrl && (
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      {recipe.isRecommended && (
                        <div className="absolute top-2 right-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 pb-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                          {recipe.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {recipe.description}
                        </p>
                      </div>
                      {!recipe.imageUrl && recipe.isRecommended && (
                        <Star className="h-5 w-5 text-yellow-500 ml-2 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={getCategoryColor(recipe.category)}>
                        {recipe.category}
                      </Badge>
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {recipe.cookingTime} min
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {recipe.servings} servings
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {recipe.calories} cal
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {recipe.protein}g protein
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs border-gray-600 text-gray-400"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-600 text-gray-400"
                        >
                          +{recipe.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Link href={`/recipes/${recipe._id}`} className="mt-auto">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                        View Recipe
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {displayRecipes?.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-12 shadow-2xl max-w-lg mx-auto">
                  <p className="text-muted-foreground text-xl mb-6">No recipes found</p>
                  <p className="text-muted-foreground/70 text-base">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RecipesPage;
