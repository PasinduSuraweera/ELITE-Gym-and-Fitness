"use client";

import { RoleGuard } from "@/components/RoleGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  UserCheck, 
  ShoppingBag, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Plus,
  ChefHat
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonText?: string;
}

export function AdminLayout({ 
  children, 
  title, 
  subtitle, 
  showAddButton, 
  onAddClick, 
  addButtonText = "Add new" 
}: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const sidebarItems = [
    { href: "/admin", icon: Home, label: "Dashboard", active: pathname === "/admin" },
    { href: "/admin/users", icon: Users, label: "Members", active: pathname === "/admin/users" },
    { href: "/admin/trainer-applications", icon: UserCheck, label: "Trainers", active: pathname === "/admin/trainer-applications" },
    { href: "/admin/memberships", icon: Settings, label: "Memberships", active: pathname === "/admin/memberships" },
    { href: "/admin/recipes", icon: ChefHat, label: "Recipes", active: pathname === "/admin/recipes" },
    { href: "/admin/marketplace", icon: ShoppingBag, label: "Marketplace", active: pathname === "/admin/marketplace" },
    { href: "/admin/content", icon: BarChart3, label: "Content", active: pathname === "/admin/content" },
    { href: "/admin/equipment", icon: Settings, label: "Equipment", active: pathname === "/admin/equipment" },
    { href: "/admin/revenue", icon: BarChart3, label: "Revenue", active: pathname === "/admin/revenue" },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      {/* Full Screen Admin Layout - Override main layout */}
      <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
        {/* Admin Header */}
        <header className="h-16 bg-gray-900/95 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EG</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">ELITE GYM</h1>
                <p className="text-gray-400 text-xs">Admin Dashboard</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-700 mx-2"></div>
            <div>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Add Button */}
            {showAddButton && (
              <Button
                onClick={onAddClick}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonText}
              </Button>
            )}

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">
                  {user?.firstName?.charAt(0) || "A"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {user?.firstName || "Admin"}
                </p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900/50 border-r border-gray-800 flex flex-col flex-shrink-0">
            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {sidebarItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.active
                          ? "bg-red-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content - Only this scrolls */}
          <main className="flex-1 overflow-y-auto bg-black">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
