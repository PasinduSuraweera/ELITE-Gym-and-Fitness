"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Users, 
  Flame, 
  Zap, 
  Star, 
  ArrowLeft,
  ChefHat,
  Activity,
  Target,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

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

const RecipeDetailPage = () => {
  const params = useParams();
  const recipeId = params.id as string;
  
  // Get recipe from Convex
  const recipe = useQuery(api.recipes.getRecipeById, { id: recipeId as Id<"recipes"> });

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

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Recipe Not Found</h1>
            <p className="text-gray-400 mb-6">Sorry, we couldn't find the recipe you're looking for.</p>
            <Link href="/recipes">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Back to Recipes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20">
      <div className="container mx-auto px-4 py-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/recipes">
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {recipe.title}
              </h1>
              {recipe.isRecommended && (
                <Star className="h-8 w-8 text-yellow-500" />
              )}
            </div>
            
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              {recipe.description}
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Badge className={getCategoryColor(recipe.category)}>
                {recipe.category}
              </Badge>
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty}
              </Badge>
              {recipe.tags.slice(0, 4).map((tag: string) => (
                <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-black/90 backdrop-blur-sm border-red-500/30 text-center">
              <CardContent className="p-4">
                <Clock className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">{recipe.cookingTime}</div>
                <div className="text-sm text-gray-400">minutes</div>
              </CardContent>
            </Card>

            <Card className="bg-black/90 backdrop-blur-sm border-red-500/30 text-center">
              <CardContent className="p-4">
                <Users className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">{recipe.servings}</div>
                <div className="text-sm text-gray-400">servings</div>
              </CardContent>
            </Card>

            <Card className="bg-black/90 backdrop-blur-sm border-red-500/30 text-center">
              <CardContent className="p-4">
                <Flame className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">{recipe.calories}</div>
                <div className="text-sm text-gray-400">calories</div>
              </CardContent>
            </Card>

            <Card className="bg-black/90 backdrop-blur-sm border-red-500/30 text-center">
              <CardContent className="p-4">
                <Zap className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">{recipe.protein}g</div>
                <div className="text-sm text-gray-400">protein</div>
              </CardContent>
            </Card>
          </div>

          {/* Nutrition Overview */}
          <Card className="bg-black/90 backdrop-blur-sm border-red-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-400" />
                Nutrition Facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{recipe.protein}g</div>
                  <div className="text-sm text-gray-400">Protein</div>
                  <div className="text-xs text-gray-500">({Math.round((recipe.protein * 4 / recipe.calories) * 100)}% of calories)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{recipe.carbs}g</div>
                  <div className="text-sm text-gray-400">Carbs</div>
                  <div className="text-xs text-gray-500">({Math.round((recipe.carbs * 4 / recipe.calories) * 100)}% of calories)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{recipe.fats}g</div>
                  <div className="text-sm text-gray-400">Fats</div>
                  <div className="text-xs text-gray-500">({Math.round((recipe.fats * 9 / recipe.calories) * 100)}% of calories)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Ingredients */}
            <Card className="bg-black/90 backdrop-blur-sm border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-red-400" />
                  Ingredients
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Everything you need for {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient: any, index: number) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>
                        <strong className="text-white">{ingredient.amount} {ingredient.unit}</strong> {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-black/90 backdrop-blur-sm border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-400" />
                  Instructions
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Step-by-step cooking guide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction: string, index: number) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="text-gray-300 pt-1">
                        {instruction}
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className="bg-black/90 backdrop-blur-sm border-red-500/30 mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-400 font-semibold mb-2">Best Time to Eat</h4>
                  <p className="text-gray-300 text-sm">
                    {recipe.category === "pre-workout" && "Consume 30-60 minutes before your workout for optimal energy."}
                    {recipe.category === "post-workout" && "Eat within 30 minutes after your workout for best recovery."}
                    {recipe.category === "breakfast" && "Perfect way to start your day with sustained energy."}
                    {recipe.category === "lunch" && "Great midday meal to keep you energized."}
                    {recipe.category === "dinner" && "Ideal evening meal for recovery and muscle building."}
                    {recipe.category === "snack" && "Perfect for between meals or on-the-go nutrition."}
                    {(recipe.category === "protein" || recipe.category === "healthy") && "Enjoy anytime as part of a balanced diet."}
                  </p>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2">Meal Prep Friendly</h4>
                  <p className="text-gray-300 text-sm">
                    This recipe can be prepared in advance and stored in the refrigerator for up to 3-4 days. 
                    Perfect for meal prepping your fitness nutrition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center mt-8">
            <Link href="/recipes">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                Explore More Recipes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;