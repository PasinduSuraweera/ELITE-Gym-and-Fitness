"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Calendar, TrendingUp, Dumbbell } from "lucide-react";

export default function TrainerDashboard() {
  const memberCount = useQuery(api.users.getMemberCount);
  
  return (
    <RoleGuard allowedRoles={["trainer", "admin"]}>
      <div className="min-h-screen bg-black text-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Trainer Dashboard</h1>
            <p className="text-gray-400">Welcome to your trainer portal</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Members</p>
                  <p className="text-3xl font-bold text-white">{memberCount || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sessions This Week</p>
                  <p className="text-3xl font-bold text-green-400">0</p>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Programs Created</p>
                  <p className="text-3xl font-bold text-purple-400">0</p>
                </div>
                <Dumbbell className="h-8 w-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Member Progress</p>
                  <p className="text-3xl font-bold text-yellow-400">--</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-500 mr-3" />
                <h3 className="text-xl font-semibold text-white">View Members</h3>
              </div>
              <p className="text-gray-400 mb-4">See all gym members and their progress</p>
              <button className="text-blue-500 text-sm font-medium hover:text-blue-400 transition-colors">
                Coming Soon →
              </button>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-green-500 mr-3" />
                <h3 className="text-xl font-semibold text-white">Schedule Sessions</h3>
              </div>
              <p className="text-gray-400 mb-4">Manage your training schedule and bookings</p>
              <button className="text-green-500 text-sm font-medium hover:text-green-400 transition-colors">
                Coming Soon →
              </button>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Dumbbell className="h-6 w-6 text-purple-500 mr-3" />
                <h3 className="text-xl font-semibold text-white">Create Programs</h3>
              </div>
              <p className="text-gray-400 mb-4">Design custom workout plans for members</p>
              <button className="text-purple-500 text-sm font-medium hover:text-purple-400 transition-colors">
                Coming Soon →
              </button>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to the Trainer Portal!</h2>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              As a certified trainer at Elite Gym, you have access to powerful tools to help members achieve their fitness goals. 
              More features will be added soon to enhance your training capabilities.
            </p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
