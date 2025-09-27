"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  Shield, 
  ShoppingBag, 
  TrendingUp, 
  ChefHat,
  Calendar,
  DollarSign,
  Award,
  Activity,
  Clock,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function AdminDashboard() {
  const { isSignedIn } = useAuth();
  
  // Only run queries if user is authenticated to prevent "Not authenticated" errors during logout
  const users = useQuery(api.users.getAllUsers, isSignedIn ? undefined : "skip");
  const applications = useQuery(api.trainers.getTrainerApplications, isSignedIn ? undefined : "skip");
  const marketplaceStats = useQuery(api.marketplace.getMarketplaceStats, isSignedIn ? undefined : "skip");
  const allMemberships = useQuery(api.memberships.getAllMemberships, isSignedIn ? undefined : "skip");
  const membershipPlans = useQuery(api.memberships.getMembershipPlans, isSignedIn ? undefined : "skip");
  const activeTrainers = useQuery(api.trainerProfiles.getActiveTrainers, isSignedIn ? {} : "skip");
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get recipe data from Convex
  const allRecipes = useQuery(api.recipes.getRecipes, isSignedIn ? {} : "skip");
  const recommendedRecipesList = useQuery(api.recipes.getRecommendedRecipes, isSignedIn ? {} : "skip");

  // Calculate comprehensive statistics
  const totalUsers = users?.length || 0;
  const adminCount = users?.filter(u => u.role === "admin").length || 0;
  const trainerCount = users?.filter(u => u.role === "trainer").length || 0;
  const userCount = users?.filter(u => u.role === "user").length || 0;
  const pendingApplications = applications?.filter(a => a.status === "pending").length || 0;

  // Membership Statistics
  const activeMemberships = allMemberships?.filter(m => m.status === "active").length || 0;
  const expiredMemberships = allMemberships?.filter(m => m.status === "expired").length || 0;
  const totalMemberships = allMemberships?.length || 0;

  // Revenue Calculations
  const calculateMonthlyRevenue = () => {
    if (!allMemberships || !membershipPlans) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return allMemberships
      .filter(membership => {
        if (membership.status !== 'active') return false;
        const startDate = new Date(membership.createdAt);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      })
      .reduce((total, membership) => {
        const plan = membershipPlans.find(p => p.type === membership.membershipType);
        return total + (plan?.price || 0);
      }, 0);
  };

  const calculateTotalRevenue = () => {
    if (!allMemberships || !membershipPlans) return 0;
    
    return allMemberships
      .filter(membership => membership.status === 'active')
      .reduce((total, membership) => {
        const plan = membershipPlans.find(p => p.type === membership.membershipType);
        return total + (plan?.price || 0);
      }, 0);
  };

  const monthlyRevenue = calculateMonthlyRevenue();
  const totalRevenue = calculateTotalRevenue();

  // Growth calculations (mock data for now - you can implement real historical data)
  const previousMonthRevenue = monthlyRevenue * 0.85; // Mock 15% growth
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
    : "0";

  // Recipe statistics
  const totalRecipes = allRecipes?.length || 0;
  const recommendedRecipesCount = recommendedRecipesList?.length || 0;

  // Trainer statistics
  const activeTrainerCount = activeTrainers?.length || 0;
  const averageTrainerRating = activeTrainers && activeTrainers.length > 0
    ? activeTrainers.reduce((sum, trainer) => sum + (trainer.rating || 0), 0) / activeTrainers.length
    : 0;

  // Recent activity with mixed data
  const getRecentActivity = (): Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    date: number;
    status: string;
    avatar: string;
  }> => {
    const activities: Array<{
      id: string;
      type: string;
      title: string;
      subtitle: string;
      date: number;
      status: string;
      avatar: string;
    }> = [];
    
    // Add recent applications (safely)
    if (applications && applications.length > 0) {
      applications.slice(0, 3).forEach(app => {
        if (app && app._id && app.name && app.submittedAt) {
          activities.push({
            id: `app-${app._id}`,
            type: 'application',
            title: `${app.name} applied to become a trainer`,
            subtitle: app.status || 'pending',
            date: app.submittedAt,
            status: app.status || 'pending',
            avatar: app.name.charAt(0).toUpperCase()
          });
        }
      });
    }
    
    // Add recent memberships (safely)
    if (allMemberships && allMemberships.length > 0) {
      allMemberships
        .filter(m => m && m.status === 'active')
        .slice(0, 2)
        .forEach(membership => {
          if (membership && membership._id && membership.createdAt) {
            const plan = membershipPlans?.find(p => p && p.type === membership.membershipType);
            const planName = plan?.name || membership.membershipType || 'membership';
            activities.push({
              id: `membership-${membership._id}`,
              type: 'membership',
              title: `New ${planName} subscription`,
              subtitle: `Started ${formatDate(membership.createdAt)}`,
              date: membership.createdAt,
              status: 'active',
              avatar: 'M'
            });
          }
        });
    }
    
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const recentActivity = getRecentActivity();

  return (
    <AdminLayout 
      title="Welcome back, Admin" 
      subtitle="Here's what's happening at Elite Gym today"
    >
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Users</p>
              <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
              <p className="text-muted-foreground text-xs mt-1">{userCount} members, {trainerCount} trainers</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Trainers</p>
              <p className="text-3xl font-bold text-foreground">{activeTrainerCount}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <p className="text-yellow-400 text-xs">{averageTrainerRating.toFixed(1)} avg rating</p>
              </div>
            </div>
            <UserCheck className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Memberships</p>
              <p className="text-3xl font-bold text-foreground">{activeMemberships}</p>
              <p className="text-green-400 text-xs mt-1">{((activeMemberships/totalMemberships)*100 || 0).toFixed(1)}% active rate</p>
            </div>
            <Activity className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Healthy Recipes</p>
              <p className="text-3xl font-bold text-foreground">{totalRecipes}</p>
              <p className="text-orange-400 text-xs mt-1">{recommendedRecipesCount} featured</p>
            </div>
            <ChefHat className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Marketplace</p>
              <p className="text-3xl font-bold text-foreground">{marketplaceStats?.activeItems || 0}</p>
              <p className="text-purple-400 text-xs mt-1">{formatCurrency(marketplaceStats?.totalValue || 0)} value</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(monthlyRevenue)}</p>
              <p className="text-yellow-400 text-xs mt-1">+{revenueGrowth}% this month</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card/50 border border-border rounded-lg p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 -z-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-foreground">Pending Actions</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Trainer Applications</span>
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                  {pendingApplications}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Expired Memberships</span>
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                  {expiredMemberships}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 -z-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Total Active Revenue</span>
                <span className="text-green-400 font-medium">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">This Month</span>
                <span className="text-green-400 font-medium">{formatCurrency(monthlyRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 -z-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-foreground">Performance</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Avg Trainer Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-purple-400 font-medium">{averageTrainerRating.toFixed(1)}/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Member Retention</span>
                <span className="text-purple-400 font-medium">{((activeMemberships/totalMemberships)*100 || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link 
          href="/admin/users"
          className="group bg-card/50 border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-primary mr-3" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary">Manage Users</h3>
          </div>
          <p className="text-muted-foreground mb-4">View, edit, and manage user roles and permissions</p>
          <div className="text-primary text-sm font-medium">
            {totalUsers} total users →
          </div>
        </Link>

        <Link 
          href="/admin/trainer-applications"
          className="group bg-card/50 border border-border rounded-lg p-6 hover:border-yellow-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <UserCheck className="h-6 w-6 text-yellow-500 mr-3" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-yellow-500">Trainer Applications</h3>
          </div>
          <p className="text-muted-foreground mb-4">Review and approve trainer applications</p>
          <div className="text-yellow-500 text-sm font-medium">
            {pendingApplications} pending →
          </div>
        </Link>

        <Link 
          href="/admin/salary"
          className="group bg-card/50 border border-border rounded-lg p-6 hover:border-green-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <DollarSign className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-green-500">Salary Management</h3>
          </div>
          <p className="text-muted-foreground mb-4">Comprehensive payroll and compensation system</p>
          <div className="text-green-500 text-sm font-medium">
            {trainerCount + adminCount} employees →
          </div>
        </Link>

        <Link 
          href="/admin/recipes"
          className="group bg-card/50 border border-border rounded-lg p-6 hover:border-orange-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <ChefHat className="h-6 w-6 text-orange-500 mr-3" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-orange-500">Healthy Recipes</h3>
          </div>
          <p className="text-muted-foreground mb-4">Manage nutrition recipes for gym members</p>
          <div className="text-orange-500 text-sm font-medium">
            {totalRecipes} recipes ({recommendedRecipesCount} recommended) →
          </div>
        </Link>
      </div>

      {/* Second Row for Additional Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link 
          href="/admin/marketplace"
          className="group bg-card/50 border border-border rounded-lg p-6 hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-6 w-6 text-blue-500 mr-3" />
            <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-500">Marketplace</h3>
          </div>
          <p className="text-muted-foreground mb-4">Manage products, inventory, and pricing</p>
          <div className="text-blue-500 text-sm font-medium">
            {marketplaceStats?.activeItems || 0} active items →
          </div>
        </Link>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="bg-card/50 border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Live Updates</span>
          </div>
        </div>
        <div className="space-y-4">
          {!mounted ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading activity...</p>
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:bg-accent/30 rounded-lg px-3 transition-all duration-200">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-medium text-primary-foreground ${
                    activity.type === 'application' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                    activity.type === 'membership' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    'bg-gradient-to-r from-muted to-muted-foreground'
                  }`}>
                    {activity.avatar}
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{activity.title}</p>
                    <p className="text-muted-foreground text-sm">{activity.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === "pending" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                    activity.status === "approved" || activity.status === "active" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                    activity.status === "rejected" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                    "bg-muted/20 text-muted-foreground border border-border"
                  }`}>
                    {activity.status}
                  </span>
                  <p className="text-muted-foreground text-xs mt-2">
                    {formatDate(activity.date)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-muted-foreground text-sm">Activity will appear here as users interact with the system</p>
              {mounted && (
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Debug Info:</p>
                  <p>Applications: {applications?.length || 0}</p>
                  <p>Memberships: {allMemberships?.length || 0}</p>
                  <p>Active Memberships: {allMemberships?.filter(m => m.status === 'active').length || 0}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {recentActivity.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">
                Showing {recentActivity.length} recent activities
              </span>
              <div className="flex gap-4">
                <Link 
                  href="/admin/trainer-applications" 
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  View Applications →
                </Link>
                <Link 
                  href="/admin/memberships" 
                  className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                >
                  View Memberships →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
