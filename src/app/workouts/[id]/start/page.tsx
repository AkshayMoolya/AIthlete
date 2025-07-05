"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Award,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  Settings,
  TrendingUp,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
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
  reps: number; // Changed from number[] to number
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
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);

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

            // Initialize with the exercise's default values - handle single reps value
            const reps = Array(exercise.sets).fill(exercise.reps || 10);

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

    setFinishDialogOpen(false);

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

  // Get workout stats for pre-start display
  const getWorkoutStats = () => {
    const totalSets = Object.values(completedSets).reduce(
      (acc, sets) => acc + sets.length,
      0
    );
    const totalExercises = workout?.exercises.length || 0;
    const estimatedTime = Math.round(
      (totalSets * 2.5 + (totalSets - 1) * 1) / 60
    ); // Rough estimate

    return { totalSets, totalExercises, estimatedTime };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-sm mx-4 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Loading workout...</p>
                <p className="text-sm text-muted-foreground">
                  Preparing your session
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-destructive" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Workout Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  The workout you're looking for doesn't exist or has been
                  removed.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/workouts">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Workouts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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
  const workoutStats = getWorkoutStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Improved Header with Better Responsiveness */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 h-16">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-9 w-9 p-0 shrink-0"
              >
                <Link href="/workouts">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold truncate">
                  {workout?.name}
                </h1>
                {workoutStarted && (
                  <div className="hidden sm:flex items-center space-x-2 lg:space-x-3 text-xs text-muted-foreground">
                    <span>{workout?.exercises.length} exercises</span>
                    <span>•</span>
                    <span>
                      {
                        Object.values(completedSets).flat().filter(Boolean)
                          .length
                      }{" "}
                      sets done
                    </span>
                    <span>•</span>
                    <span>{overallProgress}% complete</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {workoutStarted && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRestTimerSettings(true)}
                    className="xl:hidden h-9 w-9 p-0"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <WorkoutTimer
                    startTime={workoutStartTime}
                    isActive={workoutStarted}
                    progress={overallProgress}
                  />
                </>
              )}
            </div>
          </div>

          {/* Progress Bar - Better Mobile Design */}
          {workoutStarted && (
            <div className="absolute bottom-0 left-0 right-0">
              <Progress
                value={overallProgress}
                className="h-1 rounded-none border-0"
              />
            </div>
          )}
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

      {/* Main Content Area with Improved Responsiveness */}
      <div className="flex-1 overflow-y-auto">
        {!workoutStarted ? (
          /* Enhanced Pre-Workout Start Screen */
          <div>
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-5 xl:grid-cols-3">
                {/* Main Workout Card - Improved Spacing */}
                <div className="lg:col-span-3 xl:col-span-2">
                  <Card className="h-fit">
                    <CardHeader className="pb-4 sm:pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                          <CardTitle className="text-xl sm:text-2xl font-bold leading-tight">
                            {workout?.name}
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-base">
                            {workout?.description ||
                              "Ready to push your limits and reach new heights"}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 shrink-0 w-fit"
                        >
                          <Target className="w-3 h-3" />
                          <span className="text-xs sm:text-sm">
                            {workout?.exercises.length} exercises
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Improved Workout Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50 border border-muted-foreground/10">
                          <div className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                            {workoutStats.totalExercises}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                            Exercises
                          </div>
                        </div>
                        <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50 border border-muted-foreground/10">
                          <div className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                            {workoutStats.totalSets}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                            Total Sets
                          </div>
                        </div>
                        <div className="text-center p-3 sm:p-4 rounded-lg bg-muted/50 border border-muted-foreground/10">
                          <div className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                            ~{workoutStats.estimatedTime}m
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                            Est. Time
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Start Button Section */}
                      <div className="flex flex-col items-center space-y-4 sm:space-y-6 pt-2">
                        <Button
                          size="lg"
                          onClick={startWorkout}
                          className="w-full sm:max-w-sm h-12 sm:h-14 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Start Workout
                        </Button>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>Track progress</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-primary" />
                            <span>Earn rewards</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Exercise Preview Sidebar - Better Mobile Design */}
                <div className="lg:col-span-2 xl:col-span-1">
                  <Card className="h-fit">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-base sm:text-lg font-semibold">
                        Today's Exercises
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Your workout plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-72 sm:max-h-96 overflow-y-auto">
                        {workout.exercises.map((exercise, index) => (
                          <div
                            key={exercise.id}
                            className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-all duration-200"
                          >
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {exercise.exercise.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {exercise.sets} sets × {exercise.reps} reps
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Enhanced Active Workout Grid Layout */
          <div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 xl:grid-cols-4 gap-4 p-4 md:p-6">
            {/* Main Exercise Area - Better Mobile Layout */}
            <div className="flex-1 lg:col-span-4 xl:col-span-3 flex flex-col space-y-3 sm:space-y-4 overflow-hidden">
              {/* Rest Timer Settings */}
              <RestTimerSettings
                isOpen={showRestTimerSettings}
                onOpenChange={setShowRestTimerSettings}
                defaultRestTime={defaultRestTime}
                onRestTimeChange={setDefaultRestTime}
                soundEnabled={soundEnabled}
                onSoundToggle={setSoundEnabled}
              />

              {/* Exercise Cards with Better Spacing */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-3 sm:space-y-4">
                  {workout.exercises.length > 0 && (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="exercises">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-3 transition-colors duration-200 ${
                              snapshot.isDraggingOver
                                ? "bg-muted/50 rounded-lg p-2"
                                : ""
                            }`}
                          >
                            {workout.exercises.map(
                              (exercise, exerciseIndex) => (
                                <ExerciseCard
                                  key={exercise.id}
                                  index={exerciseIndex}
                                  exercise={exercise}
                                  isCurrentExercise={
                                    exerciseIndex === currentExerciseIndex
                                  }
                                  isExpanded={expandedExercises[exercise.id]}
                                  completedSets={
                                    completedSets[exercise.id] || []
                                  }
                                  setValues={
                                    setValues[exercise.id] || {
                                      reps: [],
                                      weight: [],
                                    }
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
                                    updateSetValue(
                                      exercise.id,
                                      setIndex,
                                      field,
                                      value
                                    )
                                  }
                                  onAddSet={() => addSetToExercise(exercise.id)}
                                  onRemove={() => {
                                    setExerciseToDelete(exercise.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                />
                              )
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}

                  {/* Workout Completion Card */}
                  <WorkoutCompletionCard
                    progress={overallProgress}
                    remainingSets={calculateRemainingSets()}
                    onFinish={() => setFinishDialogOpen(true)}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar - Hidden on Mobile */}
            <div className="hidden lg:block lg:col-span-1 xl:col-span-1">
              <div className="h-full flex flex-col space-y-3 sm:space-y-4">
                {/* Progress Overview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                      Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall</span>
                        <span className="font-medium">{overallProgress}%</span>
                      </div>
                      <Progress value={overallProgress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-muted/50 rounded-lg border">
                        <div className="text-lg font-bold text-green-600">
                          {
                            Object.values(completedSets).flat().filter(Boolean)
                              .length
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-lg border">
                        <div className="text-lg font-bold text-orange-600">
                          {calculateRemainingSets()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Remaining
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exercise List */}
                <Card className="flex-1 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                      Exercises
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Tap to jump to exercise
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-80 overflow-y-auto px-4 pb-4">
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, index) => {
                          const completed =
                            completedSets[exercise.id]?.every(Boolean) || false;
                          const inProgress =
                            completedSets[exercise.id]?.some(Boolean) &&
                            !completed;

                          return (
                            <button
                              key={exercise.id}
                              onClick={() => {
                                setCurrentExerciseIndex(index);
                                setExpandedExercises((prev) => ({
                                  ...prev,
                                  [exercise.id]: true,
                                }));
                              }}
                              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                                index === currentExerciseIndex
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : completed
                                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                                  : inProgress
                                  ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30"
                                  : "border-border hover:bg-muted/50 hover:border-primary/50"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    completed
                                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                      : inProgress
                                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                      : index === currentExerciseIndex
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {completed ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {exercise.exercise.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {completedSets[exercise.id]?.filter(Boolean)
                                      .length || 0}
                                    /{exercise.sets} sets
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRestTimerSettings(true)}
                        className="w-full justify-start"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Timer Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Exercise Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this exercise from your current
              workout session? This won't affect your workout template.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
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
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Workout Dialog */}
      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finish Workout</DialogTitle>
            <DialogDescription>
              Are you sure you want to finish this workout? Any incomplete sets
              will not be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setFinishDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={finishWorkout}>
              Finish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
