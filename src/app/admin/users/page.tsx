"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Crown, Shield, User, Search, Filter, Eye, Calendar, Activity, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@clerk/nextjs";

export default function AdminUsersPage() {
  const { isSignedIn } = useAuth();
  const users = useQuery(api.users.getAllUsers, isSignedIn ? undefined : "skip");
  const allMemberships = useQuery(api.memberships.getAllMemberships, isSignedIn ? undefined : "skip");
  const updateRole = useMutation(api.users.updateUserRole);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

  // Get user's current membership
  const getUserMembership = (clerkId: string) => {
    if (!allMemberships) return null;
    return allMemberships
      .filter(m => m.clerkId === clerkId)
      .sort((a, b) => b.createdAt - a.createdAt)[0]; // Get most recent
  };

  // Profile Image Component with multiple fallbacks
  const ProfileImage = ({ user, size = "h-10 w-10" }: { user: any, size?: string }) => {
    const [imageError, setImageError] = useState(false);
    
    // Try user.image first, then try to construct Clerk image URL if we have clerkId
    const getImageUrl = () => {
      if (user.image && !imageError) return user.image;
      // For Clerk users, try the standard Clerk image URL pattern
      if (user.clerkId && !imageError) {
        return `https://img.clerk.com/${user.clerkId}`;
      }
      return null;
    };

    const imageUrl = getImageUrl();

    if (imageUrl && !imageError) {
      return (
        <img
          src={imageUrl}
          alt={user.name}
          className={`${size} rounded-full object-cover border-2 border-primary/30 shadow-lg`}
          onError={() => setImageError(true)}
        />
      );
    }
    return null;
  };

  const ProfileAvatar = ({ user, size = "h-10 w-10", textSize = "text-sm", showStatus = false }: { 
    user: any, 
    size?: string, 
    textSize?: string,
    showStatus?: boolean 
  }) => {
    const [showFallback, setShowFallback] = useState(false);
    
    // Check if user was active recently (within last 24 hours)
    const isRecentlyActive = () => {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return user.updatedAt && user.updatedAt > oneDayAgo;
    };
    
    return (
      <div className="relative">
        {!showFallback && (
          <ProfileImage 
            user={user} 
            size={size}
          />
        )}
        {(showFallback || !user.image) && (
          <div 
            className={`${size} rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-medium shadow-lg ${textSize}`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        {user.image && !showFallback && (
          <img
            src={user.image}
            alt={user.name}
            className={`${size} rounded-full object-cover border-2 border-primary/30 shadow-lg absolute inset-0`}
            onError={() => setShowFallback(true)}
          />
        )}
        {showStatus && isRecentlyActive() && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background"></div>
        )}
      </div>
    );
  };

  // Get membership status
  const getMembershipStatus = (membership: any) => {
    if (!membership) return { status: 'none', color: 'gray', text: 'No Membership' };
    
    const now = Date.now();
    const endDate = membership.currentPeriodEnd;
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (membership.status === 'active' && membership.cancelAtPeriodEnd) {
      return { 
        status: 'cancelling', 
        color: 'orange', 
        text: `Cancelling (${daysRemaining}d left)` 
      };
    } else if (membership.status === 'active' && daysRemaining > 0) {
      return { 
        status: 'active', 
        color: 'green', 
        text: daysRemaining > 30 ? 'Active' : `${daysRemaining}d left` 
      };
    } else if (membership.status === 'expired' || daysRemaining <= 0) {
      return { 
        status: 'expired', 
        color: 'red', 
        text: 'Expired' 
      };
    } else {
      return { 
        status: membership.status, 
        color: 'gray', 
        text: membership.status.charAt(0).toUpperCase() + membership.status.slice(1) 
      };
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || (user.role || "user") === roleFilter;
    
    let matchesMembership = true;
    if (membershipFilter !== "all") {
      const membership = getUserMembership(user.clerkId);
      const status = getMembershipStatus(membership);
      matchesMembership = status.status === membershipFilter;
    }
    
    return matchesSearch && matchesRole && matchesMembership;
  });

  const handleRoleChange = async (userId: string, newRole: "admin" | "trainer" | "user") => {
    try {
      setUpdatingUser(userId);
      await updateRole({ userId: userId as any, role: newRole });
      alert("Role updated successfully!");
    } catch (error) {
      alert("Failed to update role: " + (error as Error).message);
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case "trainer":
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return <User className="h-4 w-4 text-green-400" />;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "trainer":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <AdminLayout 
      title="Member Management" 
      subtitle="Manage members, roles, and membership statuses"
    >
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Members</p>
              <p className="text-3xl font-bold text-foreground">{users?.length || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Memberships</p>
              <p className="text-3xl font-bold text-foreground">
                {users?.filter(u => {
                  const membership = getUserMembership(u.clerkId);
                  const status = getMembershipStatus(membership);
                  return status.status === 'active';
                }).length || 0}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Trainers</p>
              <p className="text-3xl font-bold text-foreground">
                {users?.filter(u => u.role === "trainer").length || 0}
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card/50 border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">New This Month</p>
              <p className="text-3xl font-bold text-foreground">
                {users?.filter(u => {
                  const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                  return u.createdAt && u.createdAt > monthAgo;
                }).length || 0}
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-card/50 border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-accent border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-accent border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Roles</option>
              <option value="user">Members</option>
              <option value="trainer">Trainers</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="bg-accent border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Memberships</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelling">Cancelling</option>
              <option value="none">No Membership</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-card/50 border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Membership
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers?.map((user) => {
                const membership = getUserMembership(user.clerkId);
                const membershipStatus = getMembershipStatus(membership);
                
                return (
                  <tr key={user._id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ProfileAvatar user={user} size="h-10 w-10" showStatus={true} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {user.clerkId.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground/80">
                        Member since {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                          {user.role || "user"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <Badge 
                          className={`w-fit mb-1 ${
                            membershipStatus.color === 'green' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            membershipStatus.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            membershipStatus.color === 'red' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-muted/20 text-muted-foreground border-border'
                          }`}
                        >
                          {membershipStatus.text}
                        </Badge>
                        {membership && (
                          <div className="text-xs text-muted-foreground">
                            {membership.membershipType?.charAt(0).toUpperCase() + membership.membershipType?.slice(1)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role || "user"}
                          onChange={(e) => handleRoleChange(user._id, e.target.value as "admin" | "trainer" | "user")}
                          disabled={updatingUser === user._id}
                          className="bg-accent border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="trainer">Trainer</option>
                          <option value="admin">Admin</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                          className="p-2 h-8 w-8"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {updatingUser === user._id && (
                          <div className="inline-block">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!filteredUsers || filteredUsers.length === 0) && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || roleFilter !== "all" || membershipFilter !== "all" 
                  ? "No members found matching your filters" 
                  : "No members found"
                }
              </p>
              {(searchTerm || roleFilter !== "all" || membershipFilter !== "all") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setMembershipFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <ProfileAvatar user={selectedUser} size="h-16 w-16" textSize="text-xl" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleIcon(selectedUser.role)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role || "user"}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Member Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Member Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Clerk ID</p>
                    <p className="text-foreground font-mono text-xs">{selectedUser.clerkId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Join Date</p>
                    <p className="text-foreground">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Membership Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Membership Details</h4>
                {(() => {
                  const membership = getUserMembership(selectedUser.clerkId);
                  const status = getMembershipStatus(membership);
                  
                  if (!membership) {
                    return (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No membership found</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Plan Type</p>
                        <p className="text-foreground font-medium">
                          {membership.membershipType?.charAt(0).toUpperCase() + membership.membershipType?.slice(1)} Plan
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge 
                          className={`${
                            status.color === 'green' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            status.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            status.color === 'red' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-muted/20 text-muted-foreground border-border'
                          }`}
                        >
                          {status.text}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Period</p>
                        <p className="text-foreground text-sm">
                          {formatDate(membership.currentPeriodStart)} - {formatDate(membership.currentPeriodEnd)}
                        </p>
                      </div>
                      {membership.stripeSubscriptionId && (
                        <div>
                          <p className="text-sm text-muted-foreground">Subscription ID</p>
                          <p className="text-foreground font-mono text-xs">{membership.stripeSubscriptionId}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
