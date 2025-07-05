import { Award, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface WorkoutCompletionCardProps {
  progress: number;
  remainingSets: number;
  onFinish: () => void;
  isLoading: boolean;
}

export function WorkoutCompletionCard({
  progress,
  remainingSets,
  onFinish,
  isLoading,
}: WorkoutCompletionCardProps) {
  const isComplete = progress === 100;

  return (
    <Card
      className={cn(
        "mt-8 border-2 transition-all duration-500",
        isComplete
          ? "border-green-500 dark:border-green-600 shadow-lg shadow-green-100 dark:shadow-green-900/30"
          : "border-dashed border-primary/40"
      )}
    >
      <CardContent className="p-8 text-center">
        <div className="space-y-5">
          <div className="flex items-center justify-center space-x-4 text-lg">
            <span className="font-semibold">Progress:</span>
            <span
              className={cn(
                "font-mono transition-colors",
                isComplete ? "text-green-600 dark:text-green-500" : ""
              )}
            >
              {progress}%
            </span>
            <div className="relative w-32">
              <Progress
                value={progress}
                className={cn(
                  "h-3 transition-all",
                  isComplete ? "bg-green-100 dark:bg-green-950" : ""
                )}
              />
              {isComplete && (
                <div className="absolute inset-0 bg-green-500/20 animate-pulse rounded-full pointer-events-none" />
              )}
            </div>
          </div>

          <Button
            size="lg"
            onClick={onFinish}
            disabled={!isComplete || isLoading}
            className={cn(
              "w-full max-w-md mx-auto transition-all duration-300",
              isComplete
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-green-900/50"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            {isComplete ? (
              <>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Complete Workout
                  </>
                )}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Complete All Sets ({progress}%)
              </>
            )}
          </Button>

          {!isComplete && (
            <p
              className={cn(
                "text-sm text-muted-foreground flex items-center justify-center",
                remainingSets <= 2
                  ? "text-amber-600 dark:text-amber-500 font-medium"
                  : ""
              )}
            >
              {remainingSets <= 2 ? (
                <Award className="w-4 h-4 mr-2 inline-block" />
              ) : null}
              {remainingSets} sets remaining
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
