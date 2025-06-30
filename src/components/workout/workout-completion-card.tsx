import { Award, Save } from "lucide-react";
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
    <Card className="mt-8 border-2 border-dashed border-primary/40">
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4 text-lg">
            <span className="font-semibold">Progress:</span>
            <span className="font-mono">{progress}%</span>
            <Progress value={progress} className="w-32 h-3" />
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
                <Award className="w-5 h-5 mr-2" />
                Complete Workout
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Complete All Sets ({progress}%)
              </>
            )}
          </Button>

          {!isComplete && (
            <p className="text-sm text-muted-foreground">
              {remainingSets} sets remaining
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
