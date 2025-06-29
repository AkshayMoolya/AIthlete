"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { ThemeToggle } from "../theme-toggle";
import { Logo } from "../ui/logo";
import { Dumbbell, LogOut } from "lucide-react";

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

  const navigationItems =
    variant === "landing"
      ? [
          { href: "#features", label: "Features" },
          { href: "#pricing", label: "Pricing" },
          { href: "#about", label: "About" },
        ]
      : [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/workouts", label: "Workouts" },
          { href: "/community", label: "Community" },
          { href: "/progress", label: "Progress" },
          { href: "/exercises", label: "Exercises" },
        ];

  return (
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

        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                variant === "dashboard" && pathname === item.href
                  ? "text-foreground"
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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              {onSignOut && (
                <Button variant="ghost" size="sm" onClick={onSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
