import { useState } from "react";
import { CheckCircle2, PencilLine, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SetRowProps {
  exerciseId: string;
  setIndex: number;
  isCompleted: boolean;
  isCurrentSet: boolean;
  reps: number;
  weight: number;
  workoutStarted: boolean;
  onCompleteSet: () => void;
  onUpdateValue: (field: "reps" | "weight", value: number) => void;
}

export function SetRow({
  exerciseId,
  setIndex,
  isCompleted,
  isCurrentSet,
  reps,
  weight,
  workoutStarted,
  onCompleteSet,
  onUpdateValue,
}: SetRowProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onCompleteSet();
  };

  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-2 items-center p-2 rounded-lg",
        isCurrentSet && !isCompleted && "bg-primary/5 border border-primary/20",
        isCompleted && "bg-green-50/50 dark:bg-green-950/20",
        !workoutStarted && "opacity-60"
      )}
    >
      <div className="col-span-2 font-medium">
        <Badge
          variant={isCurrentSet ? "default" : "outline"}
          className="w-8 h-6 flex items-center justify-center"
        >
          {setIndex + 1}
        </Badge>
      </div>

      <div className="col-span-3">
        {isEditing ? (
          <Input
            type="number"
            value={weight || 0}
            onChange={(e) =>
              onUpdateValue("weight", parseFloat(e.target.value) || 0)
            }
            className="h-8 text-sm"
            autoFocus
          />
        ) : (
          <div className="flex items-center">
            <span className="font-mono">{weight || 0}</span>
            <span className="ml-1 text-xs text-muted-foreground">kg</span>
          </div>
        )}
      </div>

      <div className="col-span-3">
        {isEditing ? (
          <Input
            type="number"
            value={reps || 0}
            onChange={(e) =>
              onUpdateValue("reps", parseInt(e.target.value) || 0)
            }
            className="h-8 text-sm"
          />
        ) : (
          <div className="font-mono">{reps || 0}</div>
        )}
      </div>

      <div className="col-span-4 flex items-center justify-end gap-1">
        {!isCompleted && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            disabled={!workoutStarted}
          >
            <PencilLine size={14} className="mr-1" />
            Edit
          </Button>
        )}

        <Button
          onClick={isEditing ? handleSaveClick : onCompleteSet}
          disabled={!workoutStarted}
          size="sm"
          className={cn(
            isCompleted
              ? "bg-green-500 hover:bg-green-600 text-white"
              : isEditing
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Done
            </>
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4 mr-1" />
              Save
            </>
          ) : (
            <>Complete</>
          )}
        </Button>
      </div>
    </div>
  );
}
