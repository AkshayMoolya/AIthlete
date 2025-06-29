"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart2,
  Users,
  Dumbbell,
  Activity,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function BottomNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/workouts", label: "Workouts", icon: Dumbbell },
    { href: "/community", label: "Community", icon: Users },
    { href: "/progress", label: "Progress", icon: BarChart2 },
    { href: "/exercises", label: "Exercises", icon: Activity },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t z-40">
      <div className="grid grid-cols-5 max-w-screen-sm mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-3 px-1 ${
              pathname === item.href
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs truncate w-full text-center">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
