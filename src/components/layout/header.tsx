"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ThemeToggle } from "../theme-toggle";
import { Logo } from "../ui/logo";

interface HeaderProps {
  variant?: "landing" | "dashboard";
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  onSignOut?: () => void;
}

export function Header({ variant = "landing", user, onSignOut }: HeaderProps) {
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
          { href: "/progress", label: "Progress" },
          { href: "/exercises", label: "Exercises" },
        ];

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />
        
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                variant === "dashboard" && item.href === "/dashboard"
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
              <Button variant="ghost" size="sm">
                Profile
              </Button>
              {onSignOut && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                >
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
