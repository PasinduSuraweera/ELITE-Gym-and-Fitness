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
      : "border-transparent bg-red-600/20 text-red-400";

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
        return "bg-red-900/50 text-red-400 border-red-500/30";
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
        return "bg-red-900/50 text-red-400 border-red-500/30";
      case "healthy":
        return "bg-emerald-900/50 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-gray-900/50 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black"
      suppressHydrationWarning
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"
        suppressHydrationWarning
      ></div>
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"
        suppressHydrationWarning
      ></div>

      <div
        className="container mx-auto px-4 py-32 relative z-10 flex-1"
        suppressHydrationWarning
      >
        {/* Header */}
        <div
          className="max-w-4xl mx-auto text-center mb-12"
          suppressHydrationWarning
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="text-red-500">Healthy</span> Recipes
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Fuel your fitness journey with our curated collection of nutritious
            and delicious recipes
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10 bg-black/50 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filters:</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black/50 border border-red-500/30 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:ring-red-500/20"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-black">
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-black/50 border border-red-500/30 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 focus:ring-red-500/20"
            >
              {difficulties.map((diff) => (
                <option
                  key={diff.value}
                  value={diff.value}
                  className="bg-black"
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
                size="sm"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                  setSearchTerm("");
                }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="personalized" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-black/50 border border-red-500/30">
            <TabsTrigger
              value="personalized"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/50"
            >
              <Brain className="h-4 w-4 mr-2" />
              For You
            </TabsTrigger>
            <TabsTrigger
              value="workout"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/50"
            >
              <Target className="h-4 w-4 mr-2" />
              Workout
            </TabsTrigger>
            <TabsTrigger
              value="recommended"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/50"
            >
              <Star className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/50"
            >
              <Zap className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
          </TabsList>

          {/* Personalized Recipes */}
          <TabsContent value="personalized">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                <span className="text-red-500">Personalized</span> for Your
                Goals
              </h2>
              <p className="text-gray-400">
                AI-curated recipes based on your fitness plan and dietary needs
              </p>
            </div>

            {user?.id ? (
              <>
                {/* Meal Prep Section */}
                {mealPrepRecipes && mealPrepRecipes.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <h3 className="text-xl font-semibold text-white">
                        Meal Prep Champions
                      </h3>
                      <span className="text-sm text-gray-400">
                        Perfect for your workout schedule
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {mealPrepRecipes.slice(0, 3).map((recipe: any) => (
                        <Card
                          key={recipe._id}
                          className="bg-black/90 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 group flex flex-col h-full"
                        >
                          {/* Recipe Image */}
                          {recipe.imageUrl && (
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                              <div className="absolute top-2 right-2 text-xs text-orange-400 font-mono bg-black/80 px-2 py-1 rounded">
                                {recipe.weeklyPortions} portions
                              </div>
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-orange-900/80 text-orange-400 border-orange-500/30">
                                  meal-prep
                                </Badge>
                              </div>
                            </div>
                          )}

                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-white text-lg mb-2 group-hover:text-orange-400 transition-colors">
                                  {recipe.title}
                                </CardTitle>
                                <CardDescription className="text-gray-400 text-sm line-clamp-2">
                                  {recipe.description}
                                </CardDescription>
                              </div>
                              {!recipe.imageUrl && (
                                <div className="ml-2 text-right">
                                  <div className="text-xs text-orange-400 font-mono">
                                    {recipe.weeklyPortions} portions
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Score: {recipe.suitabilityScore}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
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
                          </CardHeader>

                          <CardContent className="pt-0 flex flex-col flex-1">
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-400" />
                                <span className="text-gray-300">
                                  {recipe.cookingTime} min
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-orange-400" />
                                <span className="text-gray-300">
                                  {recipe.servings} servings
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Flame className="h-4 w-4 text-orange-400" />
                                <span className="text-gray-300">
                                  {recipe.calories} cal
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-orange-400" />
                                <span className="text-gray-300">
                                  {recipe.protein}g protein
                                </span>
                              </div>
                            </div>

                            <Link
                              href={`/recipes/${recipe._id}`}
                              className="mt-auto"
                            >
                              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0">
                                View Recipe
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personalized Recipes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {personalizedRecipes?.map((recipe: any) => (
                    <Card
                      key={recipe._id}
                      className="bg-black/90 backdrop-blur-sm border-green-500/30 hover:border-green-500/50 transition-all duration-300 group flex flex-col h-full"
                    >
                      {/* Recipe Image */}
                      {recipe.imageUrl && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute top-2 right-2 text-xs text-green-400 font-mono bg-black/80 px-2 py-1 rounded">
                            Match: {Math.round((recipe.score / 100) * 100)}%
                          </div>
                        </div>
                      )}{" "}
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-2 group-hover:text-green-400 transition-colors">
                              {recipe.title}
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-sm line-clamp-2">
                              {recipe.description}
                            </CardDescription>
                          </div>
                          {!recipe.imageUrl && (
                            <div className="ml-2 text-right">
                              <div className="text-xs text-green-400 font-mono">
                                Match: {Math.round((recipe.score / 100) * 100)}%
                              </div>
                            </div>
                          )}
                        </div>{" "}
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
                      </CardHeader>
                      <CardContent className="pt-0 flex flex-col flex-1">
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-400" />
                            <span className="text-gray-300">
                              {recipe.cookingTime} min
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-400" />
                            <span className="text-gray-300">
                              {recipe.servings} servings
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-green-400" />
                            <span className="text-gray-300">
                              {recipe.calories} cal
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-green-400" />
                            <span className="text-gray-300">
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
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0">
                            View Recipe
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Sign in for Personalized Recipes
                </h3>
                <p className="text-gray-400 mb-6">
                  Get AI-powered recipe recommendations based on your fitness
                  goals and plans
                </p>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Workout-Based Recipes */}
          <TabsContent value="workout">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                <span className="text-red-500">Workout</span> Optimized
              </h2>
              <p className="text-gray-400">
                Perfect nutrition timing for your training schedule
              </p>
            </div>

            {user?.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workoutBasedRecipes?.map((recipe: any) => (
                  <Card
                    key={recipe._id}
                    className="bg-black/90 backdrop-blur-sm border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 group flex flex-col h-full"
                  >
                    {/* Recipe Image */}
                    {recipe.imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute top-2 right-2">
                          <Target className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-2 group-hover:text-blue-400 transition-colors">
                            {recipe.title}
                          </CardTitle>
                          <CardDescription className="text-gray-400 text-sm line-clamp-2">
                            {recipe.description}
                          </CardDescription>
                        </div>
                        {!recipe.imageUrl && (
                          <Target className="h-5 w-5 text-blue-500 ml-2 flex-shrink-0" />
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
                    </CardHeader>

                    <CardContent className="pt-0 flex flex-col flex-1">
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-300">
                            {recipe.cookingTime} min
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-300">
                            {recipe.servings} servings
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-300">
                            {recipe.calories} cal
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-300">
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
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
                          View Recipe
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Sign in for Workout Recipes
                </h3>
                <p className="text-gray-400 mb-6">
                  Get recipes optimized for your workout schedule and timing
                </p>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Recommended Recipes */}
          <TabsContent value="recommended">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                <span className="text-red-500">Popular</span> Recipes
              </h2>
              <p className="text-gray-400">
                Community favorites and most loved recipes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedRecipes?.slice(0, 9).map((recipe: any) => (
                <Card
                  key={recipe._id}
                  className="bg-black/90 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Recipe Image */}
                  {recipe.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 px-2 py-1 rounded">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-yellow-400 text-xs font-semibold">
                          {recipe.rating?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-900/80 text-yellow-400 border-yellow-500/30">
                          popular
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2 group-hover:text-yellow-400 transition-colors">
                          {recipe.title}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm line-clamp-2">
                          {recipe.description}
                        </CardDescription>
                      </div>
                      {!recipe.imageUrl && (
                        <div className="ml-2 flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-yellow-400 text-sm font-semibold">
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
                        <Badge className="bg-yellow-900/50 text-yellow-400 border-yellow-500/30">
                          popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 flex flex-col flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">
                          {recipe.cookingTime} min
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">
                          {recipe.servings} servings
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">
                          {recipe.calories} cal
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300">
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
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white border-0">
                        View Recipe
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* All Recipes */}
          <TabsContent value="all">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                All <span className="text-red-500">Recipes</span>
              </h2>
              <p className="text-gray-400">
                Discover our complete collection of healthy recipes
              </p>
              {displayRecipes && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing {displayRecipes.length} recipe
                  {displayRecipes.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRecipes?.map((recipe: any) => (
                <Card
                  key={recipe._id}
                  className="bg-black/90 backdrop-blur-sm border-red-500/30 hover:border-red-500/50 transition-all duration-300 group flex flex-col h-full"
                >
                  {/* Recipe Image */}
                  {recipe.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
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

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2 group-hover:text-red-400 transition-colors">
                          {recipe.title}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm line-clamp-2">
                          {recipe.description}
                        </CardDescription>
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
                  </CardHeader>

                  <CardContent className="pt-0 flex flex-col flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">
                          {recipe.cookingTime} min
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">
                          {recipe.servings} servings
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">
                          {recipe.calories} cal
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">
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
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white border-0">
                        View Recipe
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {displayRecipes?.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-black/90 backdrop-blur-sm border border-red-500/30 rounded-xl p-8 shadow-2xl max-w-md mx-auto">
                  <p className="text-gray-400 text-lg mb-4">No recipes found</p>
                  <p className="text-gray-500 text-sm">
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
