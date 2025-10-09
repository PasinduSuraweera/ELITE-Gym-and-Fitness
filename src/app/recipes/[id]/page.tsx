"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

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
      ? "border-border text-muted-foreground bg-transparent"
      : "border-transparent bg-primary/20 text-primary";

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
  const recipe = useQuery(api.recipes.getRecipeById, {
    id: recipeId as Id<"recipes">,
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      default:
        return "bg-muted/10 text-muted-foreground border-border";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breakfast":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "lunch":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "dinner":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "snack":
        return "bg-pink-500/10 text-pink-500 border-pink-500/30";
      case "pre-workout":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      case "post-workout":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/30";
      case "protein":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "healthy":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      default:
        return "bg-muted/10 text-muted-foreground border-border";
    }
  };

  if (!recipe) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Recipe Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              Sorry, we couldn't find the recipe you're looking for.
            </p>
            <Link href="/recipes">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Back to Recipes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/recipes">
            <Button
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Recipe Hero Image */}
          {recipe.imageUrl && (
            <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl mb-8 shadow-2xl">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              {/* Floating badges on image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge className={getCategoryColor(recipe.category)}>
                  {recipe.category}
                </Badge>
                <Badge className={getDifficultyColor(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
              </div>

              {recipe.isRecommended && (
                <div className="absolute top-4 right-4">
                  <Star className="h-8 w-8 text-yellow-500 fill-current" />
                </div>
              )}

              {/* Title overlay on image */}
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {recipe.title}
                </h1>
                <p className="text-lg text-gray-200 max-w-2xl">
                  {recipe.description}
                </p>
              </div>
            </div>
          )}

          {/* Header (when no image) */}
          {!recipe.imageUrl && (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {recipe.title}
                </h1>
                {recipe.isRecommended && (
                  <Star className="h-8 w-8 text-yellow-500" />
                )}
              </div>

              <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
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
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-border text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags for recipes with images */}
          {recipe.imageUrl && (
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {recipe.tags.slice(0, 6).map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-border text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/30 text-center">
              <CardContent className="p-4">
                <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold text-foreground">
                  {recipe.cookingTime}
                </div>
                <div className="text-sm text-muted-foreground">minutes</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/30 text-center">
              <CardContent className="p-4">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold text-foreground">
                  {recipe.servings}
                </div>
                <div className="text-sm text-muted-foreground">servings</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/30 text-center">
              <CardContent className="p-4">
                <Flame className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold text-foreground">
                  {recipe.calories}
                </div>
                <div className="text-sm text-muted-foreground">calories</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/30 text-center">
              <CardContent className="p-4">
                <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-semibold text-foreground">
                  {recipe.protein}g
                </div>
                <div className="text-sm text-muted-foreground">protein</div>
              </CardContent>
            </Card>
          </div>

          {/* Nutrition Overview */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/30 mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Nutrition Facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {recipe.protein}g
                  </div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                  <div className="text-xs text-muted-foreground/70">
                    (
                    {Math.round(((recipe.protein * 4) / recipe.calories) * 100)}
                    % of calories)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {recipe.carbs}g
                  </div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                  <div className="text-xs text-muted-foreground/70">
                    ({Math.round(((recipe.carbs * 4) / recipe.calories) * 100)}%
                    of calories)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {recipe.fats}g
                  </div>
                  <div className="text-sm text-muted-foreground">Fats</div>
                  <div className="text-xs text-muted-foreground/70">
                    ({Math.round(((recipe.fats * 9) / recipe.calories) * 100)}%
                    of calories)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Ingredients */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Ingredients
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Everything you need for {recipe.servings} serving
                  {recipe.servings > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient: any, index: number) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>
                        <strong className="text-foreground">
                          {ingredient.amount} {ingredient.unit}
                        </strong>{" "}
                        {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Instructions
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Step-by-step cooking guide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.instructions.map(
                    (instruction: string, index: number) => (
                      <li key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="text-muted-foreground pt-1">{instruction}</div>
                      </li>
                    )
                  )}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Tips Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/30 mt-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <h4 className="text-primary font-semibold mb-2">
                    Best Time to Eat
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {recipe.category === "pre-workout" &&
                      "Consume 30-60 minutes before your workout for optimal energy."}
                    {recipe.category === "post-workout" &&
                      "Eat within 30 minutes after your workout for best recovery."}
                    {recipe.category === "breakfast" &&
                      "Perfect way to start your day with sustained energy."}
                    {recipe.category === "lunch" &&
                      "Great midday meal to keep you energized."}
                    {recipe.category === "dinner" &&
                      "Ideal evening meal for recovery and muscle building."}
                    {recipe.category === "snack" &&
                      "Perfect for between meals or on-the-go nutrition."}
                    {(recipe.category === "protein" ||
                      recipe.category === "healthy") &&
                      "Enjoy anytime as part of a balanced diet."}
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-500 font-semibold mb-2">
                    Meal Prep Friendly
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    This recipe can be prepared in advance and stored in the
                    refrigerator for up to 3-4 days. Perfect for meal prepping
                    your fitness nutrition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center mt-8">
            <Link href="/recipes">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
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
