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
  DollarSign,
  Package,
  Menu,
  X,
  PanelLeftOpen,
  PanelLeftClose
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const sidebarItems = [
    { href: "/admin", icon: Home, label: "Dashboard", active: pathname === "/admin" },
    { href: "/admin/users", icon: Users, label: "Members", active: pathname === "/admin/users" },
    { href: "/admin/trainer-applications", icon: UserCheck, label: "Trainers", active: pathname === "/admin/trainer-applications" },
    { href: "/admin/salary", icon: DollarSign, label: "Salary", active: pathname.startsWith("/admin/salary") },
    { href: "/admin/inventory", icon: Package, label: "Inventory", active: pathname.startsWith("/admin/inventory") },
    { href: "/admin/memberships", icon: Settings, label: "Memberships", active: pathname === "/admin/memberships" },
    { href: "/admin/recipes", icon: ChefHat, label: "Recipes", active: pathname === "/admin/recipes" },
    { href: "/admin/blog", icon: FileText, label: "Blog", active: pathname.startsWith("/admin/blog") },
    { href: "/admin/marketplace", icon: ShoppingBag, label: "Marketplace", active: pathname === "/admin/marketplace" },
  ];

  if (!mounted) {
    return (
      <RoleGuard allowedRoles={["admin"]}>
        <div className="fixed inset-0 bg-background text-foreground z-50 flex flex-col">
          <div className="h-16 bg-card/95 border-b-2 border-border shadow-lg flex items-center px-6">
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-accent rounded w-24"></div>
                <div className="h-3 bg-accent rounded w-16"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-accent rounded-lg"></div>
              <div className="h-64 bg-accent rounded-lg"></div>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      {/* Full Screen Admin Layout - Start below navbar */}
      <div className="fixed inset-0 top-16 bg-background text-foreground z-[60] flex flex-col">
        {/* Mobile Menu Button - Floating Left */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden fixed top-20 left-4 z-30 p-2 h-10 w-10 text-foreground hover:text-primary hover:bg-accent/60 border-2 border-transparent hover:border-primary/20 bg-card/80 backdrop-blur-sm shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </Button>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile Sidebar */}
          <aside className={`lg:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-card/95 border-r-2 border-border shadow-2xl backdrop-blur-md z-20 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-3">
                {sidebarItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
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

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-72 bg-card/60 border-r-2 border-border shadow-lg flex-col flex-shrink-0 backdrop-blur-sm">
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
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
