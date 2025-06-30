import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SetRow } from "./set-row";

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
}

interface ExerciseCardProps {
  index: number;
  exercise: {
    id: string;
    exerciseId: string;
    exercise: Exercise;
    sets: number;
    reps: number;
    restTime?: number;
  };
  isCurrentExercise: boolean;
  isExpanded: boolean;
  completedSets: boolean[];
  setValues: { reps: number[]; weight: number[] };
  workoutStarted: boolean;
  currentSetIndex: number;
  onToggleExpanded: () => void;
  onCompleteSet: (setIndex: number) => void;
  onUpdateSetValue: (
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => void;
  onAddSet: () => void;
  onRemove: () => void;
}

export function ExerciseCard({
  index,
  exercise,
  isCurrentExercise,
  isExpanded,
  completedSets,
  setValues,
  workoutStarted,
  currentSetIndex,
  onToggleExpanded,
  onCompleteSet,
  onUpdateSetValue,
  onAddSet,
  onRemove,
}: ExerciseCardProps) {
  const completedSetsCount = completedSets.filter(Boolean).length;
  const totalSetsCount = completedSets.length;
  const isExerciseComplete =
    completedSetsCount === totalSetsCount && totalSetsCount > 0;

  return (
    <Draggable
      key={exercise.id}
      draggableId={exercise.id}
      index={index}
      isDragDisabled={!workoutStarted}
    >
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "transition-all duration-300 overflow-hidden",
            isCurrentExercise && "ring-2 ring-primary shadow-lg",
            isExerciseComplete &&
              "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
          )}
        >
          <div
            className="flex items-center cursor-pointer p-4 hover:bg-muted/50"
            onClick={onToggleExpanded}
          >
            <div
              {...provided.dragHandleProps}
              className="mr-2 text-muted-foreground cursor-grab"
            >
              <GripVertical size={16} />
            </div>

            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-medium",
                    isExerciseComplete
                      ? "bg-green-500 text-white"
                      : isCurrentExercise
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {isExerciseComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                <div>
                  <h3 className="font-medium">{exercise.exercise.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{exercise.exercise.category}</span>
                    <span>•</span>
                    <span>{exercise.exercise.equipment}</span>
                    <span>•</span>
                    <span>
                      {completedSetsCount}/{totalSetsCount} sets completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Progress
                  value={(completedSetsCount / totalSetsCount) * 100}
                  className="w-20 h-1.5 sm:block hidden"
                />

                <div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={18} className="text-muted-foreground" />
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSet();
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Set
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Exercise
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {isExpanded && (
            <CardContent className="pt-0 pb-4">
              <Separator className="mb-4" />
              <div className="space-y-3">
                {/* Headers for the set table */}
                <div className="grid grid-cols-12 gap-2 mb-2 px-1 text-xs text-muted-foreground font-medium">
                  <div className="col-span-2">SET</div>
                  <div className="col-span-3">WEIGHT</div>
                  <div className="col-span-3">REPS</div>
                  <div className="col-span-4">COMPLETED</div>
                </div>

                {/* Set rows */}
                {completedSets.map((isCompleted, setIndex) => (
                  <SetRow
                    key={`${exercise.id}-set-${setIndex}`}
                    exerciseId={exercise.id}
                    setIndex={setIndex}
                    isCompleted={isCompleted}
                    isCurrentSet={
                      isCurrentExercise && setIndex === currentSetIndex
                    }
                    reps={setValues.reps[setIndex] || 0}
                    weight={setValues.weight[setIndex] || 0}
                    workoutStarted={workoutStarted}
                    onCompleteSet={() => onCompleteSet(setIndex)}
                    onUpdateValue={(field, value) =>
                      onUpdateSetValue(setIndex, field, value)
                    }
                  />
                ))}

                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSet();
                    }}
                    className="w-full max-w-xs"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Set
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </Draggable>
  );
}
