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
    sm: "max-w-xl",
    md: "max-w-3xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`container mx-auto px-3 sm:px-4 lg:px-6 ${sizeClasses[size]} ${className}`}
    >
      {children}
    </div>
  );
}
