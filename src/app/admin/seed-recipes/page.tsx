"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function SeedRecipesPage() {
  const seedRecipes = useMutation(api.recipes.seedRecipes);

  const handleSeedRecipes = async () => {
    try {
      await seedRecipes();
      alert("Recipes seeded successfully!");
    } catch (error: any) {
      alert(`Failed to seed recipes: ${error.message}`);
      console.error("Seed error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-black/50 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white text-center">Seed Database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-center">
              Click the button below to populate the database with sample recipes.
              This should only be done once when setting up the application.
            </p>
            <Button 
              onClick={handleSeedRecipes}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Seed Recipes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
