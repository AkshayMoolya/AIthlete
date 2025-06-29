import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
}: FeatureCardProps) {
  return (
    <Card
      className={`border-0 bg-card hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <CardContent className="p-8">
        <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center mb-6">
          <Icon className="w-6 h-6 text-background" />
        </div>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
