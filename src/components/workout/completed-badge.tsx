import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompletedBadgeProps {
  completed: boolean;
  className?: string;
}

export function CompletedBadge({ completed, className }: CompletedBadgeProps) {
  if (!completed) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "bg-green-500/10 text-green-600 border-green-500/30 flex items-center",
        className
      )}
    >
      <CheckCircle2 className="w-3 h-3 mr-1" />
      Completed
    </Badge>
  );
}
