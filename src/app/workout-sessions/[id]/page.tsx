"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Dumbbell,
  BarChart2,
  Trophy,
  Target,
  Activity,
  TrendingUp,
  Share2,
  Download,
  Repeat,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { CompletedBadge } from "@/components/workout/completed-badge";

interface WorkoutSession {
  id: string;
  userId: string;
  workoutId: string;
  workout: {
    name: string;
    description?: string;
  };
  startTime: string;
  endTime?: string;
  completed: boolean;
  notes?: string;
  exerciseLogs: Array<{
    id: string;
    exerciseId: string;
    exercise: {
      name: string;
      category: string;
      equipment: string;
    };
    sets: number;
    reps: number[];
    weight: number[];
    restTime?: number[];
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function WorkoutSessionDetail({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const sessionId = params.id;
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/workout-sessions/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setSession(data);
        } else {
          toast.error("Failed to load workout session");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching workout session:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, router]);

  // Calculate workout duration in minutes
  const calculateDuration = () => {
    if (!session?.startTime || !session?.endTime) return "--";
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    return diffMins;
  };

  // Calculate volume (total weight lifted)
  const calculateTotalVolume = () => {
    if (!session?.exerciseLogs) return 0;

    let totalVolume = 0;
    session.exerciseLogs.forEach((log) => {
      for (let i = 0; i < log.sets; i++) {
        const reps = log.reps[i] || 0;
        const weight = log.weight[i] || 0;
        totalVolume += reps * weight;
      }
    });

    return totalVolume;
  };

  // Calculate total reps
  const calculateTotalReps = () => {
    if (!session?.exerciseLogs) return 0;
    return session.exerciseLogs.reduce((total, log) => {
      return total + log.reps.reduce((setTotal, reps) => setTotal + reps, 0);
    }, 0);
  };

  const handleShare = async () => {
    if (navigator.share && session) {
      try {
        await navigator.share({
          title: `${session.workout.name} - Workout Session`,
          text: `Check out my workout session: ${session.workout.name}`,
          url: window.location.href,
        });
      } catch (error) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Loading workout details</h3>
          <p className="text-muted-foreground">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Session not found</h3>
            <p className="text-muted-foreground mb-6">
              The workout session you're looking for doesn't exist or has been
              removed.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const duration = calculateDuration();
  const totalVolume = calculateTotalVolume();
  const totalReps = calculateTotalReps();
  const totalSets = session.exerciseLogs.reduce(
    (sum, log) => sum + log.sets,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <Button variant="ghost" size="sm" asChild className="-ml-2">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/workouts/${session.workoutId}/start`}>
                    <Repeat className="w-4 h-4 mr-2" />
                    Do Again
                  </Link>
                </Button>
              </div>
            </div>

            {/* Workout Title and Status */}
            <div className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-bold">
                      {session.workout.name}
                    </h1>
                    <CompletedBadge completed={session.completed} />
                  </div>
                  <div className="flex items-center justify-center sm:justify-start text-muted-foreground gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(
                          new Date(session.startTime),
                          "EEEE, MMM d, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(session.startTime), "h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {session.workout.description && (
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto sm:mx-0">
                  {session.workout.description}
                </p>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  {duration !== "--" ? `${duration}m` : duration}
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  {session.exerciseLogs.length}
                </div>
                <div className="text-sm text-muted-foreground">Exercises</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold mb-1">{totalSets}</div>
                <div className="text-sm text-muted-foreground">Total Sets</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  {totalVolume.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Volume (kg)</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Exercise Performance */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5" />
                    Exercise Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {session.exerciseLogs.map((log, index) => (
                      <div key={log.id}>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {log.exercise.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">
                                    {log.exercise.category}
                                  </Badge>
                                  <span>{log.exercise.equipment}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {log.sets} sets
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.reps.reduce((a, b) => a + b, 0)} total reps
                              </div>
                            </div>
                          </div>

                          {/* Sets Performance */}
                          <div className="bg-muted/30 rounded-lg p-4">
                            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-3">
                              <div>SET</div>
                              <div>REPS</div>
                              <div>WEIGHT</div>
                              <div>VOLUME</div>
                            </div>

                            <div className="space-y-2">
                              {Array.from({ length: log.sets }).map(
                                (_, setIndex) => {
                                  const reps = log.reps[setIndex] || 0;
                                  const weight = log.weight[setIndex] || 0;
                                  const volume = reps * weight;

                                  return (
                                    <div
                                      key={setIndex}
                                      className="grid grid-cols-4 gap-2 items-center py-2 px-2 bg-background rounded text-sm"
                                    >
                                      <div className="font-medium">
                                        {setIndex + 1}
                                      </div>
                                      <div>{reps}</div>
                                      <div>{weight} kg</div>
                                      <div className="font-medium">
                                        {volume.toFixed(1)} kg
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          {log.notes && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                              <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Notes
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                {log.notes}
                              </div>
                            </div>
                          )}
                        </div>
                        {index < session.exerciseLogs.length - 1 && (
                          <Separator />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href={`/workouts/${session.workoutId}/start`}>
                      <Repeat className="w-4 h-4 mr-2" />
                      Do This Workout Again
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/workouts/${session.workoutId}`}>
                      <Dumbbell className="w-4 h-4 mr-2" />
                      View Workout Details
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                </CardContent>
              </Card>

              {/* Session Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {session.notes ? (
                    <div className="text-sm">{session.notes}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No notes for this session.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Reps</span>
                      <span className="font-medium">{totalReps}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Average Weight
                      </span>
                      <span className="font-medium">
                        {totalVolume && totalReps
                          ? `${(totalVolume / totalReps).toFixed(1)} kg`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Workout Intensity
                      </span>
                      <span className="font-medium">
                        {session.completed ? "100%" : "Incomplete"}
                      </span>
                    </div>
                    {session.completed && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Completion
                          </span>
                          <span className="font-medium text-green-600">
                            Complete
                          </span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
