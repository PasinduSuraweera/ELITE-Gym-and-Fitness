"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, DollarSign, AlertTriangle, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function AdminMembershipsPage() {
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  const checkExpiredMemberships = useMutation(api.memberships.checkExpiredMemberships);
  const fixAllMembershipPeriods = useMutation(api.memberships.fixAllMembershipPeriods);
  const cancelMembership = useMutation(api.memberships.cancelMembership);
  const fixAllDuplicateMemberships = useMutation(api.memberships.fixAllDuplicateMemberships);
  
  const membershipPlans = useQuery(api.memberships.getMembershipPlans, isSignedIn ? undefined : "skip");
  const allMemberships = useQuery(api.memberships.getAllMemberships, isSignedIn ? undefined : "skip");

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

  // Export memberships to CSV
  const handleExportMemberships = () => {
    if (!allMemberships?.length) {
      alert("No memberships to export");
      return;
    }

    const headers = [
      'Member Name',
      'Email',
      'Membership Type',
      'Status',
      'Price (LKR)',
      'Stripe Customer ID',
      'Stripe Subscription ID',
      'Start Date',
      'End Date',
      'Cancel At Period End',
      'Created Date',
      'Updated Date'
    ];

    const csvData = allMemberships.map((membership: any) => {
      const plan = membershipPlans?.find(p => p.type === membership.membershipType);
      return [
        membership.userName || 'N/A',
        membership.userEmail || 'N/A',
        membership.membershipType,
        membership.status,
        plan?.price || 0,
        membership.stripeCustomerId || '',
        membership.stripeSubscriptionId || '',
        formatDate(membership.currentPeriodStart),
        formatDate(membership.currentPeriodEnd),
        membership.cancelAtPeriodEnd ? 'Yes' : 'No',
        formatDate(membership.createdAt),
        formatDate(membership.updatedAt)
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `memberships-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout 
      title="Membership Management" 
      subtitle="Manage gym membership plans and subscriptions"
    >
      {/* Export Button */}
      <div className="mb-6">
        <Button
          onClick={handleExportMemberships}
          variant="outline"
          className="border-border text-foreground hover:bg-accent"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Memberships
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card/50 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Memberships</p>
              <p className="text-3xl font-bold text-foreground">{membershipStats.total}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Members</p>
              <p className="text-3xl font-bold text-foreground">{membershipStats.active}</p>
            </div>
            <Crown className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Cancelling Soon</p>
              <p className="text-3xl font-bold text-foreground">{membershipStats.cancelling}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Expired Members</p>
              <p className="text-3xl font-bold text-foreground">{membershipStats.expired}</p>
            </div>
            <Crown className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-foreground">{formatPrice(activeRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* All Memberships */}
      {allMemberships && allMemberships.length > 0 && (
        <Card className="bg-card/50 border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">All Memberships</CardTitle>
            <CardDescription className="text-muted-foreground">
              Complete list of member subscriptions and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground">Member</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Start Date</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">End Date</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Days Left</th>
                    <th className="text-left py-3 px-4 text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allMemberships.map((membership) => {
                    const now = Date.now();
                    const daysLeft = Math.ceil((membership.currentPeriodEnd - now) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr key={membership._id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-foreground font-medium">{membership.userName}</p>
                            <p className="text-muted-foreground text-xs">{membership.userEmail}</p>
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
                        <td className="py-3 px-4 text-foreground">
                          {formatDate(membership.currentPeriodStart)}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {formatDate(membership.currentPeriodEnd)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${
                            daysLeft < 0 ? 'text-red-500' : 
                            daysLeft <= 7 ? 'text-yellow-500' : 
                            'text-green-500'
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
                            <span className="text-muted-foreground text-xs">-</span>
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
      <Card className="bg-card/50 border-border mb-8">
        <CardHeader>
          <CardTitle className="text-foreground">Membership Plans</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage available membership plans and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membershipPlans && membershipPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {membershipPlans.map((plan) => (
                <Card key={plan._id} className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground text-lg">{plan.name}</CardTitle>
                      <Badge 
                        className={
                          plan.isActive 
                            ? "bg-green-500/20 text-green-500 border-green-500/30" 
                            : "bg-red-500/20 text-red-500 border-red-500/30"
                        }
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="text-muted-foreground text-sm">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{formatPrice(plan.price)}</p>
                        <p className="text-muted-foreground text-sm">per month</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">Features:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-green-500">•</span>
                              {feature}
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-muted-foreground/60">+{plan.features.length - 3} more</li>
                          )}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Stripe Price ID: {plan.stripePriceId}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
              <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No membership plans found</p>
              <p className="text-muted-foreground/60 text-sm">Membership plans will appear here once created</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
