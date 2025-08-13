"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Flame, Zap, Star, Filter, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Simple Badge component
const Badge = ({ children, className = "", variant = "default" }: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: "default" | "outline" 
}) => {
  const baseClasses = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantClasses = variant === "outline" 
    ? "border-gray-600 text-gray-400 bg-transparent" 
    : "border-transparent bg-red-600/20 text-red-400";
  
  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};

// Simple Input component
const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  const baseClasses = "flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50";
  
  return (
    <input 
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

const RecipesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get recipes from Convex
  const allRecipes = useQuery(api.recipes.getRecipes, {
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
  });

  const recommendedRecipes = useQuery(api.recipes.getRecommendedRecipes, { limit: 6 });

  // Search recipes if there's a search term
  const searchResults = useQuery(api.recipes.searchRecipes, 
    searchTerm ? { searchTerm, limit: 50 } : "skip"
  );

  // Determine which recipes to display
  const displayRecipes = searchTerm && searchResults ? searchResults : (allRecipes || []);

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
      case "easy": return "bg-green-900/50 text-green-400 border-green-500/30";
      case "medium": return "bg-yellow-900/50 text-yellow-400 border-yellow-500/30";
      case "hard": return "bg-red-900/50 text-red-400 border-red-500/30";
      default: return "bg-gray-900/50 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breakfast": return "bg-orange-900/50 text-orange-400 border-orange-500/30";
      case "lunch": return "bg-blue-900/50 text-blue-400 border-blue-500/30";
      case "dinner": return "bg-purple-900/50 text-purple-400 border-purple-500/30";
      case "snack": return "bg-pink-900/50 text-pink-400 border-pink-500/30";
      case "pre-workout": return "bg-green-900/50 text-green-400 border-green-500/30";
      case "post-workout": return "bg-cyan-900/50 text-cyan-400 border-cyan-500/30";
      case "protein": return "bg-red-900/50 text-red-400 border-red-500/30";
      case "healthy": return "bg-emerald-900/50 text-emerald-400 border-emerald-500/30";
      default: return "bg-gray-900/50 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="text-red-500">Healthy</span> Recipes
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Fuel your fitness journey with our curated collection of nutritious and delicious recipes
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                <option key={diff.value} value={diff.value} className="bg-black">
                  {diff.label}
                </option>
              ))}
            </select>

            {(selectedCategory !== "all" || selectedDifficulty !== "all" || searchTerm) && (
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

        <Tabs defaultValue="recommended" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/50 border border-red-500/30">
            <TabsTrigger 
              value="recommended" 
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/50"
            >
              <Star className="h-4 w-4 mr-2" />
              Recommended
            </TabsTrigger>
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/50"
            >
              <Zap className="h-4 w-4 mr-2" />
              All Recipes
            </TabsTrigger>
          </TabsList>

          {/* Recommended Recipes */}
          <TabsContent value="recommended">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Chef&apos;s <span className="text-red-500">Recommendations</span>
              </h2>
              <p className="text-gray-400">
                Our top picks for optimal nutrition and performance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedRecipes?.map((recipe: any) => (
                <Card key={recipe._id} className="bg-black/90 backdrop-blur-sm border-red-500/30 hover:border-red-500/50 transition-all duration-300 group">
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
                      <Star className="h-5 w-5 text-yellow-500 ml-2 flex-shrink-0" />
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

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">{recipe.cookingTime} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">{recipe.servings} servings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">{recipe.calories} cal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">{recipe.protein}g protein</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          +{recipe.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Link href={`/recipes/${recipe._id}`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white border-0">
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
                  Showing {displayRecipes.length} recipe{displayRecipes.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRecipes?.map((recipe: any) => (
                <Card key={recipe._id} className="bg-black/90 backdrop-blur-sm border-red-500/30 hover:border-red-500/50 transition-all duration-300 group">
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
                      {recipe.isRecommended && (
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

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">{recipe.cookingTime} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">{recipe.servings} servings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">{recipe.calories} cal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">{recipe.protein}g protein</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          +{recipe.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Link href={`/recipes/${recipe._id}`}>
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
                  <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
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
