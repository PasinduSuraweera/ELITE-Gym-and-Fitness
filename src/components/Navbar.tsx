"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeAwareLogo } from "./ThemeAwareLogo";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const userRole = useQuery(api.users.getCurrentUserRole);
  const cartSummary = useQuery(
    api.cart.getCartSummary,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 py-2">
        <div className="container mx-auto flex items-center justify-between px-4">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <ThemeAwareLogo
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">
                ELITE GYM
              </span>
              <span className="text-xs text-muted-foreground font-mono tracking-wider">
                FITNESS & WELLNESS
              </span>
            </div>
          </Link>{" "}
          {/* Loading state for auth section */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 py-2">
      <div
        className="container mx-auto flex items-center justify-between px-4"
        suppressHydrationWarning
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center"
            suppressHydrationWarning
          >
            <ThemeAwareLogo width={48} height={48} className="object-contain" />
          </div>
          <div className="flex flex-col" suppressHydrationWarning>
            <span className="text-lg font-bold text-foreground leading-tight">
              ELITE GYM
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              FITNESS & WELLNESS
            </span>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            href="/"
            className={`text-foreground hover:text-primary transition-colors text-sm font-medium relative pb-2 ${
              pathname === "/" ? "" : ""
            }`}
          >
            <span>Home</span>
            {pathname === "/" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
            )}
          </Link>
          <Link
            href="/generate-program"
            className={`text-foreground hover:text-primary transition-colors text-sm font-medium relative pb-2 ${
              pathname === "/generate-program" ? "" : ""
            }`}
          >
            <span>AI Plan Generator</span>
            {pathname === "/generate-program" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
            )}
          </Link>
          <Link
            href="/recipes"
            className={`text-foreground hover:text-primary transition-colors text-sm font-medium relative pb-2 ${
              pathname === "/recipes" ? "" : ""
            }`}
          >
            <span>Recipes</span>
            {pathname === "/recipes" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
            )}
          </Link>
          <Link
            href="/membership"
            className={`text-foreground hover:text-primary transition-colors text-sm font-medium relative pb-2 ${
              pathname === "/membership" ? "" : ""
            }`}
          >
            <span>Membership</span>
            {pathname === "/membership" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
            )}
          </Link>
          <Link
            href="/trainer-booking"
            className={`text-foreground hover:text-primary transition-colors text-sm font-medium relative pb-2 ${
              pathname === "/trainer-booking" ? "" : ""
            }`}
          >
            <span>Trainer Booking</span>
            {pathname === "/trainer-booking" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
            )}
          </Link>
          <Link
            href="/blog"
            className={`text-foreground hover:text-primary transition-colors text-sm font-medium relative pb-2 ${
              pathname.startsWith("/blog") ? "" : ""
            }`}
          >
            <span>Blog</span>
            {pathname.startsWith("/blog") && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
            )}
          </Link>
          <Link
            href="/marketplace"
            className={`text-foreground hover:text-primary transition-colors text-sm font-medium relative pb-2 ${
              pathname === "/marketplace" ? "" : ""
            }`}
          >
            <span>Marketplace</span>
            {pathname === "/marketplace" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
            )}
          </Link>

          {/* ROLE-BASED NAVIGATION */}
          {userRole === "admin" && (
            <Link
              href="/admin"
              className={`text-primary hover:text-primary/80 transition-colors text-sm font-medium relative pb-2 ${
                pathname.startsWith("/admin") ? "" : ""
              }`}
            >
              <span>Admin Panel</span>
              {pathname.startsWith("/admin") && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
              )}
            </Link>
          )}

          {(userRole === "trainer" || userRole === "admin") && (
            <Link
              href="/trainer"
              className={`text-secondary hover:text-secondary/80 transition-colors text-sm font-medium relative pb-2 ${
                pathname === "/trainer" || pathname.startsWith("/trainer/")
                  ? ""
                  : ""
              }`}
            >
              <span>Trainer Panel</span>
              {(pathname === "/trainer" ||
                pathname.startsWith("/trainer/")) && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary"></div>
              )}
            </Link>
          )}

          {userRole === "user" && (
            <Link
              href="/become-trainer"
              className={`text-foreground hover:text-primary transition-colors text-sm font-medium relative pb-2 ${
                pathname === "/become-trainer" ? "" : ""
              }`}
            >
              <span>Become Trainer</span>
              {pathname === "/become-trainer" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
              )}
            </Link>
          )}
        </nav>

        {/* AUTH BUTTONS */}
        <div className="flex items-center gap-4" suppressHydrationWarning>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Shopping Cart Icon */}
          {isSignedIn && (
            <Link href="/marketplace/cart" className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary hover:bg-accent/10 p-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartSummary && cartSummary.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartSummary.totalItems > 9 ? "9+" : cartSummary.totalItems}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {isSignedIn ? (
            <>
              <Link
                href="/profile"
                className="hidden md:block text-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                Profile
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                  },
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary border border-border hover:border-primary rounded-full px-6 py-2 transition-all duration-300 bg-transparent hover:bg-accent/10"
                >
                  Login
                </Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 font-semibold transition-all duration-300 shadow-lg hover:shadow-primary/25">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
