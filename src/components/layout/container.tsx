import { ReactNode } from "react";

interface ContainerProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  children: ReactNode;
}

export function Container({
  size = "lg",
  className = "",
  children,
}: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`container mx-auto px-4 sm:px-6 ${sizeClasses[size]} ${className}`}
    >
      {children}
    </div>
  );
}
