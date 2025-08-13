"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Crown, Shield } from "lucide-react";

export default function SuperAdminPage() {
  const { user } = useUser();
  const [superAdminKey, setSuperAdminKey] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const createSuperAdmin = useMutation(api.users.createSuperAdmin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);

    try {
      await createSuperAdmin({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.firstName || "Admin",
        superAdminKey,
      });
      setSuccess(true);
      alert("Admin access granted! Please refresh the page to see admin features.");
    } catch (error) {
      alert("Failed to create admin: " + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-400">You need to be signed in to access admin features</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-6">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Admin Access Granted!</h1>
          <p className="text-gray-400 mb-6">
            You now have admin privileges. Please refresh the page to see the admin panel in the navigation.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Super Admin Access</h1>
            <p className="text-gray-400">
              Enter the super admin key to gain administrative privileges for Elite Gym
            </p>
          </div>

          {/* Super Admin Key Info */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">🔑 Super Admin Key</h2>
            <div className="bg-black/50 rounded-lg p-4 border border-yellow-500/30">
              <p className="text-yellow-400 font-mono text-sm break-all">
                ELITE_GYM_SUPER_ADMIN_2025
              </p>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Use this key to become the first admin. After that, existing admins can promote other users.
            </p>
          </div>

          {/* Form */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="superAdminKey" className="block text-sm font-medium text-white mb-2">
                  Super Admin Key
                </label>
                <input
                  type="text"
                  id="superAdminKey"
                  value={superAdminKey}
                  onChange={(e) => setSuperAdminKey(e.target.value)}
                  placeholder="Enter the super admin key..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isCreating}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isCreating ? "Creating Admin Access..." : "Become Admin"}
              </Button>
            </form>
          </div>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6">
            <p className="text-red-400 text-sm">
              ⚠️ <strong>Important:</strong> This page should only be used for initial setup. 
              After creating the first admin, use the admin panel to manage user roles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
