"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  Clock,
  Target,
  Trophy,
  Activity,
  TrendingUp,
  CheckCircle2,
  Dumbbell,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { format } from "date-fns";

import Link from "next/link";

interface WeekdayData {
  day: string;
  status: "completed" | "today" | "planned";
}

interface StrengthData {
  exercise: string;
  previous: number;
  current: number;
  increase: number;
  percentage: number;
  progress: number;
}

interface GoalData {
  name: string;
  status: string;
  progress: number;
  current: string;
  target: string;
  daysLeft?: number;
  totalDays?: number;
}

interface CompletedGoalData {
  name: string;
  completedDate: string;
}

interface AchievementData {
  type: string;
  description: string;
  status: string;
  icon: "trophy" | "target" | "activity";
}

interface UserProgressData {
  metrics: {
    workoutsCompleted: number;
    weeklyChange: number;
    strengthIncrease: number;
    streak: number;
    trainingTime: number;
  };
  progressMetrics: {
    workoutConsistency: {
      value: number;
      explanation: string;
      target: number;
    };
    strengthProgression: {
      value: number;
      explanation: string;
      exerciseCount: number;
    };
    goalAchievement: {
      value: number;
      explanation: string;
      activeGoalsCount: number;
    };
  };
  achievements: AchievementData[];
  weekSummary: WeekdayData[];
  strengthProgression: StrengthData[];
  performanceMetrics: {
    totalVolume: {
      value: number;
      status: string;
      explanation: string;
      previousMonth: number;
    };
    trainingFrequency: {
      value: number;
      status: string;
      explanation: string;
      target: number;
    };
    progressiveOverload: {
      value: number;
      status: string;
      explanation: string;
      sessionCount: number;
    };
  };
  currentGoals: GoalData[];
  completedGoals: CompletedGoalData[];
  recentWorkouts: {
    id: string;
    name: string;
    date: string;
  }[];
  volumeData: {
    name: string;
    volume: number;
    sessions: number;
  }[];
}

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<UserProgressData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/progress");
        if (!response.ok) {
          throw new Error("Failed to fetch progress data");
        }

        const data = await response.json();
        setProgressData(data);
      } catch (error) {
        console.error("Error loading progress data:", error);
        toast.error("Failed to load progress data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const handleSetNewGoal = () => {
    toast("Create a new goal", {
      description: "Setting new fitness goals helps track your progress",
      action: {
        label: "Set Goal",
        onClick: () => toast.success("Goal creation started"),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header variant="dashboard" />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3">
            Your Progress
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Track your fitness journey and achievements
          </p>
        </div>

        {progressData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
              <Card className="border-0 bg-card">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-1">
                    {progressData.metrics.workoutsCompleted}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Workouts
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    +{progressData.metrics.weeklyChange} this week
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-1">
                    +{progressData.metrics.strengthIncrease}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Strength Increase
                  </div>
                  <div className="text-xs text-green-600 mt-1">This month</div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-1">
                    {progressData.metrics.streak}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Day Streak
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Personal best
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-1">
                    {progressData.metrics.trainingTime}h
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Training Time
                  </div>
                  <div className="text-xs text-green-600 mt-1">This month</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 mb-4 rounded-lg">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="strength">Strength</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
                  {/* Progress Chart */}
                  <Card className="border-0 bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-6 h-6" />
                        <span>Monthly Progress</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Workout Consistency</span>
                            <span>
                              {
                                progressData.progressMetrics.workoutConsistency
                                  .value
                              }
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              progressData.progressMetrics.workoutConsistency
                                .value
                            }
                            className="h-3"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {
                              progressData.progressMetrics.workoutConsistency
                                .explanation
                            }
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Strength Progression</span>
                            <span>
                              {
                                progressData.progressMetrics.strengthProgression
                                  .value
                              }
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              progressData.progressMetrics.strengthProgression
                                .value
                            }
                            className="h-3"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {
                              progressData.progressMetrics.strengthProgression
                                .explanation
                            }
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Goal Achievement</span>
                            <Link
                              href="/goals"
                              className="text-sm text-primary hover:underline"
                            >
                              Manage Goals
                            </Link>
                          </div>
                          <Progress
                            value={
                              progressData.progressMetrics.goalAchievement.value
                            }
                            className="h-3"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {
                              progressData.progressMetrics.goalAchievement
                                .explanation
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Achievements */}
                  <Card className="border-0 bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5" />
                        <span>Recent Achievements</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {progressData.achievements.map((achievement, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                              {achievement.icon === "trophy" && (
                                <Trophy className="w-5 h-5 text-background" />
                              )}
                              {achievement.icon === "target" && (
                                <Target className="w-5 h-5 text-background" />
                              )}
                              {achievement.icon === "activity" && (
                                <Activity className="w-5 h-5 text-background" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {achievement.type}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {achievement.description}
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {achievement.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly Summary */}
                <Card className="border-0 bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-6 h-6" />
                      <span>This Week's Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Mobile view - horizontal scrollable content */}
                    <div className="flex overflow-x-auto pb-3 sm:hidden space-x-3">
                      {progressData.weekSummary.map((day) => (
                        <div
                          key={day.day}
                          className="text-center flex-shrink-0 w-16"
                        >
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            {day.day}
                          </div>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                              day.status === "completed"
                                ? "bg-foreground"
                                : day.status === "today"
                                ? "bg-muted"
                                : "bg-muted"
                            }`}
                          >
                            {day.status === "completed" ? (
                              <Trophy className="w-4 h-4 text-background" />
                            ) : day.status === "today" ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {day.status === "completed"
                              ? "Done"
                              : day.status === "today"
                              ? "Today"
                              : "Plan"}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop view - grid layout */}
                    <div className="hidden sm:grid sm:grid-cols-7 gap-4">
                      {progressData.weekSummary.map((day) => (
                        <div key={day.day} className="text-center">
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            {day.day}
                          </div>
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                              day.status === "completed"
                                ? "bg-foreground"
                                : day.status === "today"
                                ? "bg-muted"
                                : "bg-muted"
                            }`}
                          >
                            {day.status === "completed" ? (
                              <Trophy className="w-5 h-5 text-background" />
                            ) : day.status === "today" ? (
                              <Clock className="w-5 h-5" />
                            ) : (
                              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {day.status === "completed"
                              ? "Completed"
                              : day.status === "today"
                              ? "Today"
                              : "Planned"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Completed Workouts - New Section */}
                <Card className="border-0 bg-card mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-6 h-6" />
                        <span>Recent Completed Workouts</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/workout-sessions">View All Sessions</Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {progressData.recentWorkouts &&
                      progressData.recentWorkouts.length > 0 ? (
                        progressData.recentWorkouts.map((workout, index) => (
                          <Link
                            href={`/workout-sessions/${workout.id}`}
                            key={workout.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                                <Dumbbell className="w-4 h-4 text-background" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {workout.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(workout.date),
                                    "MMM d, yyyy"
                                  )}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            No completed workouts yet
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Complete a workout to see it here
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Workout Volume Chart */}
                {/* <VolumeChart data={progressData.volumeData} /> */}
              </TabsContent>

              <TabsContent value="strength" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
                  <Card className="border-0 bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-6 h-6" />
                        <span>Strength Progression</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {progressData.strengthProgression &&
                        progressData.strengthProgression.length > 0 ? (
                          progressData.strengthProgression.map(
                            (exercise, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">
                                    {exercise.exercise}
                                  </span>
                                  <span className="text-sm text-green-600">
                                    +{exercise.increase} lbs
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                  <span>
                                    {exercise.previous} lbs → {exercise.current}{" "}
                                    lbs
                                  </span>
                                  <span>+{exercise.percentage}%</span>
                                </div>
                                <Progress
                                  value={exercise.progress}
                                  className="h-2"
                                />
                              </div>
                            )
                          )
                        ) : (
                          <div className="p-6 border border-border rounded-lg text-center">
                            <p className="text-muted-foreground">
                              No strength progression data available
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Complete more workouts with increasing weights to
                              see your progress
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="w-6 h-6" />
                        <span>Performance Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Total Volume */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Total Volume</span>
                            <Badge
                              variant={
                                progressData.performanceMetrics.totalVolume
                                  .status === "Getting Started"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {
                                progressData.performanceMetrics.totalVolume
                                  .status
                              }
                            </Badge>
                          </div>
                          {progressData.performanceMetrics.totalVolume
                            .status !== "Getting Started" ? (
                            <>
                              <div className="text-2xl font-bold">
                                {progressData.performanceMetrics.totalVolume
                                  .value >= 0
                                  ? "+"
                                  : ""}
                                {
                                  progressData.performanceMetrics.totalVolume
                                    .value
                                }
                                %
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                vs last month
                              </div>
                            </>
                          ) : (
                            <div className="text-lg font-semibold text-muted-foreground mb-2">
                              No data yet
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {
                              progressData.performanceMetrics.totalVolume
                                .explanation
                            }
                          </p>
                        </div>

                        {/* Training Frequency */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">
                              Training Frequency
                            </span>
                            <Badge
                              variant={
                                progressData.performanceMetrics
                                  .trainingFrequency.status ===
                                "Getting Started"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {
                                progressData.performanceMetrics
                                  .trainingFrequency.status
                              }
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold">
                            {
                              progressData.performanceMetrics.trainingFrequency
                                .value
                            }
                            x
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            workouts this week
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {
                              progressData.performanceMetrics.trainingFrequency
                                .explanation
                            }
                          </p>
                        </div>

                        {/* Progressive Overload */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">
                              Progressive Overload
                            </span>
                            <Badge
                              variant={
                                progressData.performanceMetrics
                                  .progressiveOverload.status ===
                                  "Needs Focus" ||
                                progressData.performanceMetrics
                                  .progressiveOverload.status ===
                                  "Getting Started"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {
                                progressData.performanceMetrics
                                  .progressiveOverload.status
                              }
                            </Badge>
                          </div>
                          {progressData.performanceMetrics.progressiveOverload
                            .value > 0 ? (
                            <>
                              <div className="text-2xl font-bold">
                                {
                                  progressData.performanceMetrics
                                    .progressiveOverload.value
                                }
                                %
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                average strength increase
                              </div>
                            </>
                          ) : (
                            <div className="text-lg font-semibold text-muted-foreground mb-2">
                              {progressData.performanceMetrics
                                .progressiveOverload.sessionCount > 0
                                ? "Focus needed"
                                : "Start tracking"}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {
                              progressData.performanceMetrics
                                .progressiveOverload.explanation
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="goals" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
                  <Card className="border-0 bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>Current Goals</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {progressData.currentGoals &&
                        progressData.currentGoals.length > 0 ? (
                          progressData.currentGoals.map((goal, index) => (
                            <div
                              key={index}
                              className="p-4 border border-border rounded-lg"
                              onClick={() =>
                                toast.info(`Goal details: ${goal.name}`)
                              }
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{goal.name}</h4>
                                <Badge variant="secondary">{goal.status}</Badge>
                              </div>
                              <Progress
                                value={goal.progress}
                                className="h-2 mb-2"
                              />
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{goal.current}</span>
                                <span>{goal.target}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 border border-border rounded-lg text-center">
                            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium mb-2">
                              No active goals set
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Set specific fitness goals to track your progress
                              more effectively
                            </p>
                            <Link href="/goals">
                              <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Goal
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5" />
                        <span>Completed Goals</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {progressData.completedGoals &&
                        progressData.completedGoals.length > 0 ? (
                          progressData.completedGoals.map((goal, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                              onClick={() =>
                                toast.success(`Completed: ${goal.name}`)
                              }
                            >
                              <Trophy className="w-5 h-5" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {goal.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Completed {goal.completedDate}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-muted/50 rounded-lg text-center">
                            <p className="text-muted-foreground">
                              No completed goals yet
                            </p>
                          </div>
                        )}

                        <Button
                          className="w-full mt-4 bg-foreground text-background hover:bg-foreground/90"
                          asChild
                        >
                          <Link href="/goals">Manage Goals</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
