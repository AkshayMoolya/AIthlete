"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"];

  useEffect(() => {
    // If the user is not authenticated and trying to access a protected route
    if (status === "unauthenticated" && !publicRoutes.includes(pathname)) {
      router.push("/login"); // Redirect to login instead of home
    }
  }, [status, router, pathname, publicRoutes]);

  // Show loading spinner while authentication status is being determined
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  // If authentication check is complete, render children
  return <>{children}</>;
}
