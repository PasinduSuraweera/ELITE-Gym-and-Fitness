"use client";

import { UserLayout } from "@/components/UserLayout";

export default function SettingsPage() {
  return (
    <UserLayout 
      title="Settings" 
      subtitle="Manage your account settings"
    >
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-foreground mb-4">Settings Page</h2>
        <p className="text-muted-foreground">Coming Soon...</p>
      </div>
    </UserLayout>
  );
}