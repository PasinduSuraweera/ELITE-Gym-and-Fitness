"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Users, UserCheck, Shield, ShoppingBag, TrendingUp, ChefHat } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const users = useQuery(api.users.getAllUsers);
  const applications = useQuery(api.trainers.getTrainerApplications);
  const marketplaceStats = useQuery(api.marketplace.getMarketplaceStats);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (date: number | Date | null | undefined) => {
    if (!mounted || !date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get recipe data from Convex
  const allRecipes = useQuery(api.recipes.getRecipes, {});
  const recommendedRecipesList = useQuery(api.recipes.getRecommendedRecipes, {});

  const totalUsers = users?.length || 0;
  const adminCount = users?.filter(u => u.role === "admin").length || 0;
  const trainerCount = users?.filter(u => u.role === "trainer").length || 0;
  const userCount = users?.filter(u => u.role === "user").length || 0;
  const pendingApplications = applications?.filter(a => a.status === "pending").length || 0;

  // Calculate recipe statistics
  const totalRecipes = allRecipes?.length || 0;
  const recommendedRecipesCount = recommendedRecipesList?.length || 0;

  return (
    <AdminLayout 
      title="Welcome back, Admin" 
      subtitle="Here's what's happening at Elite Gym today"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Trainers</p>
              <p className="text-3xl font-bold text-white">{trainerCount}</p>
              <p className="text-blue-400 text-sm">{pendingApplications} pending</p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Healthy Recipes</p>
              <p className="text-3xl font-bold text-white">{totalRecipes}</p>
              <p className="text-orange-400 text-sm">{recommendedRecipesCount} recommended</p>
            </div>
            <ChefHat className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Marketplace Items</p>
              <p className="text-3xl font-bold text-white">{marketplaceStats?.activeItems || 0}</p>
              <p className="text-green-400 text-sm">${marketplaceStats?.totalValue || 0} value</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <p className="text-3xl font-bold text-white">$0</p>
              <p className="text-yellow-400 text-sm">+0% from last week</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link 
          href="/admin/users"
          className="group bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-red-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-xl font-semibold text-white group-hover:text-red-500">Manage Users</h3>
          </div>
          <p className="text-gray-400 mb-4">View, edit, and manage user roles and permissions</p>
          <div className="text-red-500 text-sm font-medium">
            {totalUsers} total users →
          </div>
        </Link>

        <Link 
          href="/admin/trainer-applications"
          className="group bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-yellow-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <UserCheck className="h-6 w-6 text-yellow-500 mr-3" />
            <h3 className="text-xl font-semibold text-white group-hover:text-yellow-500">Trainer Applications</h3>
          </div>
          <p className="text-gray-400 mb-4">Review and approve trainer applications</p>
          <div className="text-yellow-500 text-sm font-medium">
            {pendingApplications} pending →
          </div>
        </Link>

        <Link 
          href="/admin/recipes"
          className="group bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-orange-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <ChefHat className="h-6 w-6 text-orange-500 mr-3" />
            <h3 className="text-xl font-semibold text-white group-hover:text-orange-500">Healthy Recipes</h3>
          </div>
          <p className="text-gray-400 mb-4">Manage nutrition recipes for gym members</p>
          <div className="text-orange-500 text-sm font-medium">
            {totalRecipes} recipes ({recommendedRecipesCount} recommended) →
          </div>
        </Link>

        <Link 
          href="/admin/marketplace"
          className="group bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-semibold text-white group-hover:text-blue-500">Marketplace</h3>
          </div>
          <p className="text-gray-400 mb-4">Manage products, inventory, and pricing</p>
          <div className="text-blue-500 text-sm font-medium">
            {marketplaceStats?.activeItems || 0} active items →
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {applications?.slice(0, 5).map((app) => (
            <div key={app._id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">{app.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white font-medium">{app.name}</p>
                  <p className="text-gray-400 text-sm">Applied to become a trainer</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  app.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                  app.status === "approved" ? "bg-green-500/20 text-green-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {app.status}
                </span>
                <p className="text-gray-500 text-xs mt-1">
                  {formatDate(app.submittedAt)}
                </p>
              </div>
            </div>
          ))}
          {(!applications || applications.length === 0) && (
            <p className="text-gray-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
