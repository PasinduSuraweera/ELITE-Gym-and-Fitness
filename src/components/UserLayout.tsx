"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Dumbbell, 
  Apple, 
  ChefHat, 
  ShoppingBag, 
  Calendar,
  Plus,
  Target,
  Activity,
  Package,
  Star,
  Settings,
  Receipt,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface UserLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonText?: string;
}

export function UserLayout({ 
  children, 
  title, 
  subtitle, 
  showAddButton, 
  onAddClick, 
  addButtonText = "Add new" 
}: UserLayoutProps) {
  const pathname = usePathname();
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
    { href: "/profile", icon: User, label: "Profile", active: pathname === "/profile" },
    { href: "/profile/fitness-plans", icon: Dumbbell, label: "Workout Plans", active: pathname === "/profile/fitness-plans" },
    { href: "/profile/diet-plans", icon: Apple, label: "Diet Plans", active: pathname === "/profile/diet-plans" },
    { href: "/profile/training-sessions", icon: Activity, label: "Training Sessions", active: pathname === "/profile/training-sessions" },
    { href: "/reviews", icon: Star, label: "Reviews", active: pathname === "/reviews" },
    { href: "/profile/orders", icon: Package, label: "Orders", active: pathname === "/profile/orders" },
    { href: "/profile/payment-slips", icon: Receipt, label: "Payment Slips", active: pathname === "/profile/payment-slips" },
    { href: "/profile/settings", icon: Settings, label: "Settings", active: pathname === "/profile/settings" },
  ];

  const serviceItems = [
    { href: "/recipes", icon: ChefHat, label: "Recipes", active: pathname === "/recipes" },
    { href: "/generate-program", icon: Target, label: "Generate Program", active: pathname === "/generate-program" },
    { href: "/marketplace", icon: ShoppingBag, label: "Marketplace", active: pathname === "/marketplace" },
    { href: "/trainer-booking", icon: Calendar, label: "Book Trainer", active: pathname === "/trainer-booking" },
  ];

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb,220,38,38),0.1)_0%,transparent_50%)]"></div>
        <section className="relative z-10 pt-32 pb-16 flex-grow">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-accent rounded-lg"></div>
              <div className="h-64 bg-accent rounded-lg"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb,220,38,38),0.1)_0%,transparent_50%)]"></div>
      
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden relative z-20 pt-20 pb-4 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 h-10 w-10"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {showAddButton && (
          <div className="mt-4">
            <Button
              onClick={onAddClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-80 bg-card/95 border-r-2 border-border shadow-2xl backdrop-blur-md z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 pt-24">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 px-4">
            Dashboard
          </h3>
          <nav className="space-y-3">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
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
            ))}
          </nav>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 mt-8 px-4">
            Services
          </h3>
          <nav className="space-y-3">
            {serviceItems.map((item) => (
              <Link
                key={item.href}
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
            ))}
          </nav>

          {/* Add Button in Mobile Sidebar if needed */}
          {showAddButton && (
            <div className="mt-8">
              <Button
                onClick={() => {
                  onAddClick?.();
                  setSidebarOpen(false);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonText}
              </Button>
            </div>
          )}
        </div>
      </aside>
      
      {/* Main Content with Sidebar - proper spacing from navbar */}
      <section className="relative z-10 pt-8 lg:pt-32 pb-16 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 bg-card/60 border-2 border-border rounded-xl flex-shrink-0 h-fit sticky top-8 shadow-lg backdrop-blur-sm">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                  {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
                </div>

                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 px-4">
                  Dashboard
                </h3>
                <nav className="space-y-3">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.href}
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
                  ))}
                </nav>

                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 mt-8 px-4">
                  Services
                </h3>
                <nav className="space-y-3">
                  {serviceItems.map((item) => (
                    <Link
                      key={item.href}
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
                  ))}
                </nav>

                {/* Add Button in Desktop Sidebar if needed */}
                {showAddButton && (
                  <div className="mt-8">
                    <Button
                      onClick={onAddClick}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {addButtonText}
                    </Button>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
