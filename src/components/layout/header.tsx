"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../theme-toggle";
import { Logo } from "../ui/logo";
import {
  Dumbbell,
  LogOut,
  Menu,
  X,
  Home,
  BarChart2,
  Users,
  Activity,
  Dumbbell as DumbbellIcon,
  Settings,
  LucideIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";

// Define proper types for navigation items
type LandingNavItem = {
  href: string;
  label: string;
};

type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavItem = LandingNavItem | DashboardNavItem;

// Helper function to check if an item has an icon
const hasDashboardIcon = (item: NavItem): item is DashboardNavItem => {
  return "icon" in item;
};

interface HeaderProps {
  variant?: "landing" | "dashboard";
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  onSignOut?: () => void;
}

export function Header({ variant = "landing", user, onSignOut }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navigationItems: NavItem[] =
    variant === "landing"
      ? [
          { href: "#features", label: "Features" },
          { href: "#pricing", label: "Pricing" },
          { href: "#about", label: "About" },
        ]
      : [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/workouts", label: "Workouts", icon: DumbbellIcon },
          { href: "/community", label: "Community", icon: Users },
          { href: "/progress", label: "Progress", icon: BarChart2 },
          { href: "/exercises", label: "Exercises", icon: Activity },
        ];

  return (
    <>
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {variant === "dashboard" ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                AIthlete
              </span>
            </div>
          ) : (
            <Logo />
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  variant === "dashboard" && pathname === item.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {variant === "landing" ? (
              <>
                {!session ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="hidden sm:flex"
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/dashboard">Get Started</Link>
                    </Button>
                  </>
                ) : (
                  <Button size="sm" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Profile
                </Button>
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && variant === "dashboard" && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden">
          <div className="container mx-auto px-6 py-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-background" />
                </div>
                <span className="text-xl font-semibold text-foreground">
                  AIthlete
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-col space-y-6 flex-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center text-lg font-medium py-2 ${
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {hasDashboardIcon(item) && (
                    <item.icon className="mr-3 h-5 w-5" />
                  )}
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-8 border-t">
              <div className="flex flex-col space-y-4">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" /> Profile Settings
                </Button>
                {onSignOut && (
                  <Button variant="outline" onClick={onSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile Dashboard */}
      {variant === "dashboard" && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t z-40">
          <div className="grid grid-cols-5 max-w-screen-sm mx-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-3 px-1 ${
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {hasDashboardIcon(item) && (
                  <item.icon className="h-5 w-5 mb-1" />
                )}
                <span className="text-xs truncate w-full text-center">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
