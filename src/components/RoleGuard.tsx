"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface RoleGuardProps {
  allowedRoles: ("admin" | "trainer" | "user")[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useUser();
  const userRole = useQuery(api.users.getCurrentUserRole);

  if (!user || userRole === undefined || userRole === null) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(userRole as "admin" | "trainer" | "user")) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You don't have permission to access this area. 
            {userRole === "user" && " Consider applying to become a trainer or contact an admin."}
          </p>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-500">
              Your current role: <span className="text-red-500 font-medium capitalize">{userRole}</span>
            </p>
            <p className="text-sm text-gray-500">
              Required roles: <span className="text-red-500 font-medium">{allowedRoles.join(", ")}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
