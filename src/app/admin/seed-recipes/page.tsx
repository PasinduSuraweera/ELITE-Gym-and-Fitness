"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Zap, 
  ChefHat, 
  Target, 
  Clock,
  Users,
  Flame,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

const SeedRecipesPage = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  // Mutations
  const seedSampleRecipes = useMutation(api.recipes.seedRecipes);
  const seedComprehensiveRecipes = useMutation(api.recipes.seedComprehensiveRecipes);

  // Query existing recipes
  const existingRecipes = useQuery(api.recipes.getAllRecipes);

  const handleSeedSample = async () => {
    setLoading("sample");
    try {
      const result = await seedSampleRecipes();
      setResults({ type: "sample", data: result });
    } catch (error) {
      console.error("Error seeding sample recipes:", error);
      setResults({ type: "error", data: { message: "Failed to seed sample recipes" } });
    } finally {
      setLoading(null);
    }
  };

  const handleSeedComprehensive = async () => {
    setLoading("comprehensive");
    try {
      const result = await seedComprehensiveRecipes({});
      setResults({ type: "comprehensive", data: result });
    } catch (error) {
      console.error("Error seeding comprehensive recipes:", error);
      setResults({ type: "error", data: { message: "Failed to seed comprehensive recipes" } });
    } finally {
      setLoading(null);
    }
  };

  const getRecipeStats = () => {
    if (!existingRecipes) return null;
    
    const categories = existingRecipes.reduce((acc: any, recipe) => {
      acc[recipe.category] = (acc[recipe.category] || 0) + 1;
      return acc;
    }, {});

    const avgRating = existingRecipes.reduce((sum, recipe) => sum + (recipe.rating || 0), 0) / existingRecipes.length;
    const recommended = existingRecipes.filter(r => r.isRecommended).length;

    return {
      total: existingRecipes.length,
      categories,
      avgRating: avgRating.toFixed(1),
      recommended
    };
  };

  const stats = getRecipeStats();

  return (
    <AdminLayout title="Recipe Database Management" subtitle="Seed and manage the recipe database with comprehensive nutrition data">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Current Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-black/90 border-green-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-400 text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Total Recipes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/90 border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-yellow-400 text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommended
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.recommended}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/90 border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 text-sm font-medium flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{Object.keys(stats.categories).length}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/90 border-purple-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-400 text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Avg Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.avgRating}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="seed" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/50 border border-red-500/30">
              <TabsTrigger 
                value="seed" 
                className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
              >
                <Database className="h-4 w-4 mr-2" />
                Seed Database
              </TabsTrigger>
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
              >
                <Target className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
            </TabsList>

            {/* Seed Tab */}
            <TabsContent value="seed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sample Recipes Card */}
                <Card className="bg-black/90 backdrop-blur-sm border-orange-500/30 hover:border-orange-500/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-orange-400" />
                      Sample Recipes
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Basic recipe collection with 5 sample recipes for testing and development.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">Includes:</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-orange-900/50 text-orange-400 border-orange-500/30">Breakfast</Badge>
                        <Badge className="bg-blue-900/50 text-blue-400 border-blue-500/30">Lunch</Badge>
                        <Badge className="bg-purple-900/50 text-purple-400 border-purple-500/30">Dinner</Badge>
                        <Badge className="bg-green-900/50 text-green-400 border-green-500/30">Healthy</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4 text-orange-400" />
                        <span className="text-gray-300">5 Recipes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-400" />
                        <span className="text-gray-300">Quick Setup</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSeedSample}
                      disabled={loading === "sample"}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0"
                    >
                      {loading === "sample" ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4 mr-2" />
                      )}
                      Seed Sample Recipes
                    </Button>
                  </CardContent>
                </Card>

                {/* Comprehensive Recipes Card */}
                <Card className="bg-black/90 backdrop-blur-sm border-red-500/30 hover:border-red-500/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-red-400" />
                      Comprehensive Database
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Complete recipe collection with intelligent categorization and nutrition data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">Includes:</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-orange-900/50 text-orange-400 border-orange-500/30">Breakfast</Badge>
                        <Badge className="bg-blue-900/50 text-blue-400 border-blue-500/30">Lunch</Badge>
                        <Badge className="bg-purple-900/50 text-purple-400 border-purple-500/30">Dinner</Badge>
                        <Badge className="bg-green-900/50 text-green-400 border-green-500/30">Pre-Workout</Badge>
                        <Badge className="bg-cyan-900/50 text-cyan-400 border-cyan-500/30">Post-Workout</Badge>
                        <Badge className="bg-pink-900/50 text-pink-400 border-pink-500/30">Snacks</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">11+ Recipes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">AI Optimized</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">Macro Tracked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-red-400" />
                        <span className="text-gray-300">All Levels</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSeedComprehensive}
                      disabled={loading === "comprehensive"}
                      className="w-full bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                      {loading === "comprehensive" ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4 mr-2" />
                      )}
                      Seed Comprehensive Database
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Results Section */}
              {results && (
                <Card className="mt-8 bg-black/90 backdrop-blur-sm border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      {results.type === "error" ? (
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                      Seeding Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-gray-300">{results.data.message}</p>
                      {results.data.categories && (
                        <p className="text-sm text-gray-400">
                          Categories: {results.data.categories.join(", ")}
                        </p>
                      )}
                      {results.data.totalRecipes && (
                        <p className="text-sm text-gray-400">
                          Total recipes added: {results.data.totalRecipes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview">
              {stats && (
                <div className="space-y-6">
                  {/* Categories Breakdown */}
                  <Card className="bg-black/90 backdrop-blur-sm border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-blue-400" />
                        Recipe Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stats.categories).map(([category, count]) => (
                          <div key={category} className="text-center">
                            <div className="text-2xl font-bold text-white">{count as number}</div>
                            <div className="text-sm text-gray-400 capitalize">{category}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recipe Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-black/90 backdrop-blur-sm border-green-500/30">
                      <CardHeader>
                        <CardTitle className="text-green-400 text-lg">Personalized Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm">
                          AI-powered recipe suggestions based on user fitness plans, workout intensity, and dietary preferences.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/90 backdrop-blur-sm border-blue-500/30">
                      <CardHeader>
                        <CardTitle className="text-blue-400 text-lg">Workout Optimization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm">
                          Recipes timed perfectly for pre and post-workout nutrition to maximize performance and recovery.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/90 backdrop-blur-sm border-purple-500/30">
                      <CardHeader>
                        <CardTitle className="text-purple-400 text-lg">Meal Prep Ready</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm">
                          Bulk-friendly recipes with storage instructions and portion calculations for efficient meal preparation.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SeedRecipesPage;
