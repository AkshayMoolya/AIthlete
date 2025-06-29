import { Dumbbell } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

export function Logo({ 
  size = "md", 
  showText = true, 
  href = "/",
  className = "" 
}: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-7 h-7"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  const roundedClasses = {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-2xl"
  };

  const content = (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-foreground ${roundedClasses[size]} flex items-center justify-center`}>
        <Dumbbell className={`${iconSizes[size]} text-background`} />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold text-foreground`}>
          FitTracker
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}
