"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Award, Target, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

// Import our new components
import { WorkoutTimer } from "@/components/workout/workout-timer";
import { RestTimerModal } from "@/components/workout/rest-timer-modal";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { WorkoutCompletionCard } from "@/components/workout/workout-completion-card";
import { RestTimerSettings } from "@/components/workout/rest-timer-settings";

interface WorkoutStartProps {
  params: {
    id: string;
  };
}

// Types (adjust these based on your actual types)
interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
}

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number[];
  weight: number[] | null;
  restTime?: number;
}

interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
}

export default function WorkoutStart({ params }: WorkoutStartProps) {
  const router = useRouter();
  const workoutId = params.id;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<
    Record<string, boolean>
  >({});
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>(
    {}
  );
  const [setValues, setSetValues] = useState<
    Record<string, { reps: number[]; weight: number[] }>
  >({});
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);

  // Rest timer states
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [defaultRestTime, setDefaultRestTime] = useState(60); // Default 60 seconds
  const [showRestTimerSettings, setShowRestTimerSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timerSound] = useState(() =>
    typeof Audio !== "undefined" ? new Audio("/sounds/timer-end.mp3") : null
  );

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`/api/workouts/${workoutId}`);
        if (response.ok) {
          const data = await response.json();
          setWorkout(data);

          // Initialize expanded exercises (current exercise is expanded by default)
          const initialExpandedState: Record<string, boolean> = {};
          data.exercises.forEach((exercise: WorkoutExercise, index: number) => {
            initialExpandedState[exercise.id] = index === 0;
          });
          setExpandedExercises(initialExpandedState);

          // Initialize completed sets tracking
          const initialCompletedSets: Record<string, boolean[]> = {};

          // Initialize set values for tracking reps and weights
          const initialSetValues: Record<
            string,
            { reps: number[]; weight: number[] }
          > = {};

          data.exercises.forEach((exercise: WorkoutExercise) => {
            initialCompletedSets[exercise.id] = Array(exercise.sets).fill(
              false
            );

            // Initialize with the exercise's default values
            const reps = Array.isArray(exercise.reps)
              ? [...exercise.reps]
              : Array(exercise.sets).fill(exercise.reps || 10);

            const weights = exercise.weight
              ? Array.isArray(exercise.weight)
                ? [...exercise.weight]
                : Array(exercise.sets).fill(exercise.weight)
              : Array(exercise.sets).fill(0);

            initialSetValues[exercise.id] = {
              reps,
              weight: weights,
            };

            // If the exercise has a defined rest time, use it as default
            if (exercise.restTime) {
              setDefaultRestTime(exercise.restTime);
            }
          });

          setCompletedSets(initialCompletedSets);
          setSetValues(initialSetValues);
        } else {
          toast.error("Failed to load workout");
          router.push("/workouts");
        }
      } catch (error) {
        console.error("Error fetching workout:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId, router]);

  // Handle rest timer
  useEffect(() => {
    if (restTimerActive && restTimeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            setRestTimerActive(false);
            if (soundEnabled && timerSound)
              timerSound
                .play()
                .catch((e) => console.error("Could not play sound", e));
            toast("Rest time finished!", {
              description: "Time to start your next set",
            });
            clearInterval(timerRef.current as NodeJS.Timeout);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!restTimerActive && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restTimerActive, restTimeRemaining, timerSound, soundEnabled]);

  const startWorkout = () => {
    setWorkoutStarted(true);
    setWorkoutStartTime(new Date());
    toast.success("Workout started!", {
      description: "Let's crush this session! 💪",
    });
  };

  const toggleExerciseExpanded = (exerciseId: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const updateSetValue = (
    exerciseId: string,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setSetValues((prev) => {
      const exercise = { ...prev[exerciseId] };
      const fieldArray = [...exercise[field]];
      fieldArray[setIndex] = value;
      return {
        ...prev,
        [exerciseId]: {
          ...exercise,
          [field]: fieldArray,
        },
      };
    });
  };

  const completeSet = (exerciseId: string, setIndex: number) => {
    const newCompletedSets = { ...completedSets };
    newCompletedSets[exerciseId][setIndex] =
      !newCompletedSets[exerciseId][setIndex];
    setCompletedSets(newCompletedSets);

    // Start rest timer if set was completed (not uncompleted)
    if (newCompletedSets[exerciseId][setIndex]) {
      setRestTimerActive(true);
      setRestTimeRemaining(defaultRestTime);

      // Auto advance to next set or exercise if this wasn't the last set
      const currentExercise = workout?.exercises.find(
        (ex) => ex.id === exerciseId
      );
      if (currentExercise && setIndex < currentExercise.sets - 1) {
        setCurrentSetIndex(setIndex + 1);
      } else {
        // Find the next uncompleted exercise
        const nextExerciseIndex = workout?.exercises.findIndex((ex, idx) => {
          const allSetsCompleted = completedSets[ex.id]?.every(Boolean);
          return !allSetsCompleted && idx > currentExerciseIndex;
        });

        if (nextExerciseIndex !== undefined && nextExerciseIndex !== -1) {
          setCurrentExerciseIndex(nextExerciseIndex);
          setCurrentSetIndex(0);

          // Expand the next exercise
          if (workout) {
            const nextExerciseId = workout.exercises[nextExerciseIndex].id;
            setExpandedExercises((prev) => ({
              ...prev,
              [nextExerciseId]: true,
            }));
          }
        }
      }

      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      toast.success("Set completed! 🎯", {
        description: "Great job! Take a quick rest.",
      });
    }
  };

  const skipRestTimer = () => {
    setRestTimerActive(false);
    setRestTimeRemaining(0);
    toast("Rest time skipped", { description: "Moving on to next set" });
  };

  const addTimeToRestTimer = (seconds: number) => {
    setRestTimeRemaining((prev) => prev + seconds);
    toast.info(`+${seconds} seconds added`);
  };

  const addSetToExercise = (exerciseId: string) => {
    // Add a new set to the exercise
    setCompletedSets((prev) => {
      const exerciseSets = [...(prev[exerciseId] || [])];
      exerciseSets.push(false);
      return {
        ...prev,
        [exerciseId]: exerciseSets,
      };
    });

    // Add corresponding reps and weight values
    setSetValues((prev) => {
      const exercise = prev[exerciseId] || { reps: [], weight: [] };
      // Use the last set's values as default for the new set
      const lastRepValue =
        exercise.reps.length > 0 ? exercise.reps[exercise.reps.length - 1] : 10;
      const lastWeightValue =
        exercise.weight.length > 0
          ? exercise.weight[exercise.weight.length - 1]
          : 0;

      return {
        ...prev,
        [exerciseId]: {
          reps: [...exercise.reps, lastRepValue],
          weight: [...exercise.weight, lastWeightValue],
        },
      };
    });

    toast.success("New set added", {
      description: "Added a new set to this exercise",
    });
  };

  const removeExercise = (exerciseId: string) => {
    if (!workout) return;

    // Remove the exercise from the workout
    const updatedExercises = workout.exercises.filter(
      (ex) => ex.id !== exerciseId
    );

    setWorkout({
      ...workout,
      exercises: updatedExercises,
    });

    // Clean up related state
    const updatedCompletedSets = { ...completedSets };
    delete updatedCompletedSets[exerciseId];
    setCompletedSets(updatedCompletedSets);

    const updatedSetValues = { ...setValues };
    delete updatedSetValues[exerciseId];
    setSetValues(updatedSetValues);

    const updatedExpandedExercises = { ...expandedExercises };
    delete updatedExpandedExercises[exerciseId];
    setExpandedExercises(updatedExpandedExercises);

    setExerciseToDelete(null);
    setDeleteDialogOpen(false);

    toast.success("Exercise removed", {
      description: "Exercise removed from this workout session",
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !workout) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    // Reorder the exercises
    const reorderedExercises = Array.from(workout.exercises);
    const [removed] = reorderedExercises.splice(source.index, 1);
    reorderedExercises.splice(destination.index, 0, removed);

    // Update the workout with reordered exercises
    setWorkout({
      ...workout,
      exercises: reorderedExercises,
    });

    // Update current exercise index if needed
    if (currentExerciseIndex === source.index) {
      setCurrentExerciseIndex(destination.index);
    } else if (
      currentExerciseIndex > source.index &&
      currentExerciseIndex <= destination.index
    ) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    } else if (
      currentExerciseIndex < source.index &&
      currentExerciseIndex >= destination.index
    ) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }

    toast.success("Exercise reordered", {
      description: "Workout order has been updated",
    });
  };

  const finishWorkout = async () => {
    if (!workout || !workoutStartTime) return;

    const allSetsCompleted = Object.values(completedSets).every((sets) =>
      sets.every((set) => set)
    );

    if (!allSetsCompleted) {
      toast.error("Not all sets are completed", {
        description: "Make sure to complete all sets before finishing",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Transform the set values to match what the API expects
      const exerciseLogs = workout.exercises.map((exercise) => {
        const exerciseValues = setValues[exercise.id];
        return {
          exerciseId: exercise.exerciseId,
          sets: completedSets[exercise.id].length,
          reps: exerciseValues.reps,
          weight: exerciseValues.weight,
          restTime: exercise.restTime ? [exercise.restTime] : undefined,
        };
      });

      // Save workout session to database
      const response = await fetch("/api/workout-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutId: workout.id,
          startTime: workoutStartTime,
          endTime: new Date(),
          completed: true,
          exerciseLogs,
        }),
      });

      if (response.ok) {
        const sessionData = await response.json();
        toast.success("Workout completed!", {
          description: "Great job on completing your workout!",
        });
        router.push(`/workout-sessions/${sessionData.id}`);
      } else {
        throw new Error("Failed to save workout session");
      }
    } catch (error) {
      console.error("Error saving workout session:", error);
      toast.error("Failed to save workout session", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall progress
  const calculateProgress = () => {
    if (!workout) return 0;

    let totalSets = 0;
    let completedSetsCount = 0;

    Object.entries(completedSets).forEach(([exerciseId, sets]) => {
      totalSets += sets.length;
      completedSetsCount += sets.filter(Boolean).length;
    });

    return totalSets === 0
      ? 0
      : Math.round((completedSetsCount / totalSets) * 100);
  };

  // Calculate remaining sets
  const calculateRemainingSets = () => {
    return (
      Object.values(completedSets).reduce((acc, sets) => acc + sets.length, 0) -
      Object.values(completedSets).reduce(
        (acc, sets) => acc + sets.filter(Boolean).length,
        0
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium mb-4">Workout not found</p>
          <Button asChild>
            <Link href="/workouts">Back to Workouts</Link>
          </Button>
        </div>
      </div>
    );
  }

  const overallProgress = calculateProgress();
  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentSetInfo = currentExercise
    ? `Next: Set ${currentSetIndex + 2} of ${
        completedSets[currentExercise.id]?.length || currentExercise.sets
      }`
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Enhanced Header */}
      <header className="border-b bg-background/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/workouts">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit
                </Link>
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">
                  {workout?.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {workout?.exercises.length} exercises •{" "}
                  {Object.values(completedSets).flat().filter(Boolean).length}{" "}
                  sets completed
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {workoutStarted ? (
                <WorkoutTimer
                  startTime={workoutStartTime}
                  isActive={workoutStarted}
                  progress={overallProgress}
                />
              ) : (
                <Button onClick={startWorkout} className="bg-primary">
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Rest Timer Modal */}
      <RestTimerModal
        isActive={restTimerActive}
        remainingTime={restTimeRemaining}
        defaultRestTime={defaultRestTime}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        onSkip={skipRestTimer}
        onAddTime={addTimeToRestTimer}
        currentSetInfo={currentSetInfo}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!workoutStarted ? (
          <Card className="mb-8 border-2 border-dashed border-primary/40 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="text-center py-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl mb-2">Ready to Begin?</CardTitle>
              <CardDescription className="text-lg">
                {workout?.exercises.length} exercises •{" "}
                {Object.values(completedSets).reduce(
                  (sum, sets) => sum + sets.length,
                  0
                )}{" "}
                total sets
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button
                size="lg"
                onClick={startWorkout}
                className="px-12 py-6 text-lg"
              >
                <Play className="w-6 h-6 mr-3" />
                Start Workout
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Rest Timer Settings */}
          <RestTimerSettings
            isOpen={showRestTimerSettings}
            onOpenChange={setShowRestTimerSettings}
            defaultRestTime={defaultRestTime}
            onRestTimeChange={setDefaultRestTime}
            soundEnabled={soundEnabled}
            onSoundToggle={setSoundEnabled}
          />

          {/* Exercises List with Drag & Drop */}
          <div className="space-y-4">
            {workout.exercises.length > 0 && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="exercises">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {workout.exercises.map((exercise, exerciseIndex) => (
                        <ExerciseCard
                          key={exercise.id}
                          index={exerciseIndex}
                          exercise={exercise}
                          isCurrentExercise={
                            exerciseIndex === currentExerciseIndex
                          }
                          isExpanded={expandedExercises[exercise.id]}
                          completedSets={completedSets[exercise.id] || []}
                          setValues={
                            setValues[exercise.id] || { reps: [], weight: [] }
                          }
                          workoutStarted={workoutStarted}
                          currentSetIndex={currentSetIndex}
                          onToggleExpanded={() =>
                            toggleExerciseExpanded(exercise.id)
                          }
                          onCompleteSet={(setIndex) =>
                            completeSet(exercise.id, setIndex)
                          }
                          onUpdateSetValue={(setIndex, field, value) =>
                            updateSetValue(exercise.id, setIndex, field, value)
                          }
                          onAddSet={() => addSetToExercise(exercise.id)}
                          onRemove={() => {
                            setExerciseToDelete(exercise.id);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          {/* Workout Completion Card */}
          {workoutStarted && (
            <WorkoutCompletionCard
              progress={overallProgress}
              remainingSets={calculateRemainingSets()}
              onFinish={finishWorkout}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Delete Exercise Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this exercise from your workout?
              This won't affect the workout template.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                exerciseToDelete && removeExercise(exerciseToDelete)
              }
            >
              Remove Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
