interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  text = "Loading...",
  className = ""
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`text-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}
