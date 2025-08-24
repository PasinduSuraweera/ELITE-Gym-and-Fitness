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
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const sidebarItems = [
    { href: "/profile", icon: User, label: "Profile", active: pathname === "/profile" },
    { href: "/profile/fitness-plans", icon: Dumbbell, label: "Workout Plans", active: pathname === "/profile/fitness-plans" },
    { href: "/profile/diet-plans", icon: Apple, label: "Diet Plans", active: pathname === "/profile/diet-plans" },
    { href: "/profile/training-sessions", icon: Activity, label: "Training Sessions", active: pathname === "/profile/training-sessions" },
    { href: "/reviews", icon: Star, label: "Reviews", active: pathname === "/reviews" },
    { href: "/profile/orders", icon: Package, label: "Orders", active: pathname === "/profile/orders" },
    { href: "/recipes", icon: ChefHat, label: "Recipes", active: pathname === "/recipes" },
    { href: "/generate-program", icon: Target, label: "Generate Program", active: pathname === "/generate-program" },
    { href: "/marketplace", icon: ShoppingBag, label: "Marketplace", active: pathname === "/marketplace" },
    { href: "/trainer-booking", icon: Calendar, label: "Book Trainer", active: pathname === "/trainer-booking" },
  ];

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"></div>
      
      {/* Main Content with Sidebar - proper spacing from navbar */}
      <section className="relative z-10 pt-32 pb-16 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900/50 border border-gray-800 rounded-xl flex-shrink-0 h-fit sticky top-8">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white">{title}</h2>
                  {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
                </div>

                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Dashboard
                </h3>
                <nav className="space-y-2">
                  {sidebarItems.slice(0, 6).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        item.active
                          ? "bg-red-600/20 text-red-400 border border-red-500/30"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-8">
                  Services
                </h3>
                <nav className="space-y-2">
                  {sidebarItems.slice(6).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        item.active
                          ? "bg-red-600/20 text-red-400 border border-red-500/30"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Add Button in Sidebar if needed */}
                {showAddButton && (
                  <div className="mt-8">
                    <Button
                      onClick={onAddClick}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
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
