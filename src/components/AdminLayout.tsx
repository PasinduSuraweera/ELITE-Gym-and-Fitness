"use client";

import { RoleGuard } from "@/components/RoleGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  UserCheck, 
  ShoppingBag, 
  Settings,
  Bell,
  Search,
  Plus,
  ChefHat,
  FileText,
  DollarSign
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
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
    { href: "/admin/salary", icon: DollarSign, label: "Salary", active: pathname.startsWith("/admin/salary") },
    { href: "/admin/memberships", icon: Settings, label: "Memberships", active: pathname === "/admin/memberships" },
    { href: "/admin/recipes", icon: ChefHat, label: "Recipes", active: pathname === "/admin/recipes" },
    { href: "/admin/blog", icon: FileText, label: "Blog", active: pathname.startsWith("/admin/blog") },
    { href: "/admin/marketplace", icon: ShoppingBag, label: "Marketplace", active: pathname === "/admin/marketplace" },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      {/* Full Screen Admin Layout - Override main layout */}
      <div className="fixed inset-0 bg-background text-foreground z-50 flex flex-col">
        {/* Admin Header */}
        <header className="h-16 bg-card/95 border-b-2 border-border shadow-lg flex items-center justify-between px-6 flex-shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">EG</span>
              </div>
              <div>
                <h1 className="text-foreground font-bold text-xl">ELITE GYM</h1>
                <p className="text-muted-foreground text-sm font-medium">Admin Dashboard</p>
              </div>
            </div>
            {title && (
              <>
                <div className="h-8 w-px bg-border mx-2"></div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                  {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-muted border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            {/* Add Button */}
            {showAddButton && (
              <Button
                onClick={onAddClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonText}
              </Button>
            )}

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-xs">
                  {user?.firstName?.charAt(0) || "A"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-foreground text-sm font-medium">
                  {user?.firstName || "Admin"}
                </p>
                <p className="text-muted-foreground text-xs">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-72 bg-card/60 border-r-2 border-border shadow-lg flex flex-col flex-shrink-0 backdrop-blur-sm">
            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-3">
                {sidebarItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                        item.active
                          ? "bg-primary text-primary-foreground shadow-lg border-2 border-primary/20"
                          : "text-foreground hover:text-foreground hover:bg-accent/20 hover:scale-105 hover:shadow-md border-2 border-transparent"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${item.active ? "text-primary-foreground" : "text-foreground"}`} />
                      <span className="font-bold">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content - Only this scrolls */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
