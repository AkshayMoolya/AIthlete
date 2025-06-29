import { ReactNode } from "react";

interface SectionProps {
  id?: string;
  className?: string;
  background?: "default" | "muted";
  padding?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

export function Section({
  id,
  className = "",
  background = "default",
  padding = "lg",
  children,
}: SectionProps) {
  const backgroundClasses = {
    default: "",
    muted: "bg-muted/30",
  };

  const paddingClasses = {
    sm: "py-8 sm:py-12 px-4 sm:px-6",
    md: "py-12 sm:py-16 px-4 sm:px-6",
    lg: "py-16 sm:py-24 px-4 sm:px-6",
    xl: "py-20 sm:py-32 px-4 sm:px-6",
  };

  return (
    <section
      id={id}
      className={`${paddingClasses[padding]} ${backgroundClasses[background]} ${className}`}
    >
      {children}
    </section>
  );
}
