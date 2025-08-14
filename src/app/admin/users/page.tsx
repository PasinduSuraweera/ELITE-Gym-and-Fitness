"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Crown, Shield, User } from "lucide-react";

export default function AdminUsersPage() {
  const users = useQuery(api.users.getAllUsers);
  const updateRole = useMutation(api.users.updateUserRole);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
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
      title="User Management" 
      subtitle="Manage user roles and permissions"
    >
      {/* Users Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                        {user.role || "user"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role || "user"}
                      onChange={(e) => handleRoleChange(user._id, e.target.value as "admin" | "trainer" | "user")}
                      disabled={updatingUser === user._id}
                      className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="trainer">Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                    {updatingUser === user._id && (
                      <div className="ml-2 inline-block">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!users || users.length === 0) && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <Crown className="h-5 w-5 text-yellow-400 mr-2" />
            <span className="text-gray-400">Admins:</span>
            <span className="ml-2 text-white font-medium">
              {users?.filter(u => u.role === "admin").length || 0}
            </span>
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-gray-400">Trainers:</span>
            <span className="ml-2 text-white font-medium">
              {users?.filter(u => u.role === "trainer").length || 0}
            </span>
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-gray-400">Members:</span>
            <span className="ml-2 text-white font-medium">
              {users?.filter(u => (u.role || "user") === "user").length || 0}
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
