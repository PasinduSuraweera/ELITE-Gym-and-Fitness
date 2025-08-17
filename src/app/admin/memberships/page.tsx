"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, DollarSign, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminMembershipsPage() {
  const [mounted, setMounted] = useState(false);
  const checkExpiredMemberships = useMutation(api.memberships.checkExpiredMemberships);
  const fixAllMembershipPeriods = useMutation(api.memberships.fixAllMembershipPeriods);
  const cancelMembership = useMutation(api.memberships.cancelMembership);
  const fixAllDuplicateMemberships = useMutation(api.memberships.fixAllDuplicateMemberships);
  
  const membershipPlans = useQuery(api.memberships.getMembershipPlans);
  const allMemberships = useQuery(api.memberships.getAllMemberships);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleFixPeriods = async () => {
    try {
      const result = await fixAllMembershipPeriods({});
      alert(`Fixed ${result.fixedCount} out of ${result.totalInvalid} invalid memberships`);
    } catch (error) {
      console.error("Error fixing membership periods:", error);
      alert("Error fixing membership periods");
    }
  };

  const handleCheckExpired = async () => {
    try {
      const result = await checkExpiredMemberships({});
      alert(`Updated ${result.updatedCount} expired memberships`);
    } catch (error) {
      console.error("Error checking expired memberships:", error);
      alert("Error checking expired memberships");
    }
  };

  const getMembershipStats = () => {
    if (!allMemberships) return { total: 0, active: 0, expired: 0, cancelled: 0, cancelling: 0 };
    
    const stats = {
      total: allMemberships.length,
      active: allMemberships.filter(m => m.status === 'active' && !m.cancelAtPeriodEnd).length,
      cancelling: allMemberships.filter(m => m.status === 'active' && m.cancelAtPeriodEnd).length,
      expired: allMemberships.filter(m => m.status === 'expired').length,
      cancelled: allMemberships.filter(m => m.status === 'cancelled').length,
    };
    
    return stats;
  };

  const getStatusColor = (status: string, endDate: number, cancelAtPeriodEnd: boolean) => {
    if (status === 'cancelled') return 'bg-gray-500';
    if (status === 'expired') return 'bg-red-500';
    
    // If membership is set to cancel at period end, show orange/warning color
    if (cancelAtPeriodEnd) return 'bg-orange-500';
    
    const now = Date.now();
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return 'bg-red-500';
    if (daysRemaining <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (status: string, cancelAtPeriodEnd: boolean) => {
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'expired') return 'Expired';
    
    // If membership is active but set to cancel, show "Cancelling"
    if (status === 'active' && cancelAtPeriodEnd) return 'Cancelling';
    
    return status;
  };

  const handleFixDuplicates = async () => {
    try {
      const result = await fixAllDuplicateMemberships({});
      alert(`Fixed duplicate memberships for ${result.fixedUsers} users out of ${result.totalUsers} total users`);
    } catch (error) {
      console.error("Error fixing duplicate memberships:", error);
      alert("Error fixing duplicate memberships");
    }
  };

  const handleCancelMembership = async (clerkId: string, memberName: string) => {
    console.log("🔍 Admin cancel button clicked for:", memberName, "ClerkID:", clerkId);
    
    if (!confirm(`Are you sure you want to cancel ${memberName}'s membership?\n\nThis will:\n• Cancel their Stripe subscription\n• Set membership to cancel at period end\n• They'll keep access until the current billing period ends\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      console.log("🚫 Admin cancelling membership for:", memberName, "ClerkID:", clerkId);
      const result = await cancelMembership({ clerkId });
      console.log("✅ Admin cancel membership result:", result);
      
      // Give immediate feedback and suggest refresh
      alert(`✅ ${memberName}'s membership has been cancelled successfully!\n\nTheir membership will remain active until the end of their current billing period.\n\nNote: The page may take a moment to update the status. You can refresh to see the latest status.`);
      
      console.log("🔄 Membership data should update automatically. If not visible, check in a few seconds or refresh the page.");
      
    } catch (error) {
      console.error("❌ Error cancelling membership:", error);
      alert(`❌ Error cancelling ${memberName}'s membership. Please try again or contact support.`);
    }
  };

  // Calculate real stats from actual data
  const totalPlans = membershipPlans?.length || 0;
  const membershipStats = getMembershipStats();
  
  // Calculate real revenue from active memberships
  const calculateRealRevenue = () => {
    if (!allMemberships || !membershipPlans) return 0;
    
    return allMemberships
      .filter(membership => membership.status === 'active')
      .reduce((total, membership) => {
        const plan = membershipPlans.find(p => p.type === membership.membershipType);
        return total + (plan?.price || 0);
      }, 0);
  };
  
  const activeRevenue = calculateRealRevenue();

  return (
    <AdminLayout 
      title="Membership Management" 
      subtitle="Manage gym membership plans and subscriptions"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Memberships</p>
              <p className="text-3xl font-bold text-white">{membershipStats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Members</p>
              <p className="text-3xl font-bold text-white">{membershipStats.active}</p>
            </div>
            <Crown className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cancelling Soon</p>
              <p className="text-3xl font-bold text-white">{membershipStats.cancelling}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Expired Members</p>
              <p className="text-3xl font-bold text-white">{membershipStats.expired}</p>
            </div>
            <Crown className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-white">{formatPrice(activeRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <Button 
          onClick={handleFixPeriods}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Fix Invalid Periods
        </Button>
        <Button 
          onClick={handleFixDuplicates}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Fix Duplicate Memberships
        </Button>
        <Button 
          onClick={handleCheckExpired}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Check Expired Memberships
        </Button>
      </div>

      {/* All Memberships */}
      {allMemberships && allMemberships.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">All Memberships</CardTitle>
            <CardDescription className="text-gray-400">
              Complete list of member subscriptions and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Member</th>
                    <th className="text-left py-3 px-4 text-gray-400">Plan</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">Start Date</th>
                    <th className="text-left py-3 px-4 text-gray-400">End Date</th>
                    <th className="text-left py-3 px-4 text-gray-400">Days Left</th>
                    <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allMemberships.map((membership) => {
                    const now = Date.now();
                    const daysLeft = Math.ceil((membership.currentPeriodEnd - now) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr key={membership._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">{membership.userName}</p>
                            <p className="text-gray-400 text-xs">{membership.userEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {membership.membershipType}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            className={`${getStatusColor(membership.status, membership.currentPeriodEnd, membership.cancelAtPeriodEnd)} text-white`}
                          >
                            {getStatusText(membership.status, membership.cancelAtPeriodEnd)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {formatDate(membership.currentPeriodStart)}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {formatDate(membership.currentPeriodEnd)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${
                            daysLeft < 0 ? 'text-red-400' : 
                            daysLeft <= 7 ? 'text-yellow-400' : 
                            'text-green-400'
                          }`}>
                            {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {membership.status === 'active' && !membership.cancelAtPeriodEnd && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelMembership(membership.clerkId, membership.userName)}
                              className="bg-red-600 hover:bg-red-700 text-xs"
                            >
                              Cancel
                            </Button>
                          )}
                          {membership.status === 'active' && membership.cancelAtPeriodEnd && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              Cancelled
                            </Badge>
                          )}
                          {membership.status !== 'active' && (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Membership Plans */}
      <Card className="bg-gray-900/50 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white">Membership Plans</CardTitle>
          <CardDescription className="text-gray-400">
            Manage available membership plans and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membershipPlans && membershipPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {membershipPlans.map((plan) => (
                <Card key={plan._id} className="bg-black/50 border-gray-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                      <Badge 
                        className={
                          plan.isActive 
                            ? "bg-green-900/50 text-green-400" 
                            : "bg-red-900/50 text-red-400"
                        }
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400 text-sm">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{formatPrice(plan.price)}</p>
                        <p className="text-gray-400 text-sm">per month</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-white">Features:</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-green-500">•</span>
                              {feature}
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-gray-500">+{plan.features.length - 3} more</li>
                          )}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500">
                          Stripe Price ID: {plan.stripePriceId}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {formatDate(plan.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No membership plans found</p>
              <p className="text-gray-500 text-sm">Membership plans will appear here once created</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
