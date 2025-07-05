"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Plus,
  Target,
  Trophy,
  User,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define interface for dashboard data
interface DashboardData {
  weeklyStats: {
    workouts: number;
    totalTime: string;
    calories: number;
  };
  recentWorkouts: Array<{
    id: string;
    name: string;
    completedAt: string;
    duration: number;
    exerciseCount: number;
    calories?: number;
  }>;
  goals: Array<{
    id: string;
    title: string;
    current: string;
    target: string;
    progress: number;
  }>;
  quickStats: {
    weeklyProgress: number;
    monthlyProgress: number;
    currentStreak: number;
    weeklyGoalCurrent: number;
    weeklyGoalTarget: number;
    monthlyGoalCurrent: number;
    monthlyGoalTarget: number;
    hasWeeklyGoal: boolean;
    hasMonthlyGoal: boolean;
    isUsingDefaults: boolean;
    weeklyGoalName?: string | null;
    monthlyGoalName?: string | null;
    tooltips: {
      weeklyProgress: string;
      monthlyProgress: string;
      currentStreak: string;
      weeklyGoal: string;
      monthlyGoal: string;
    };
  };
  upcomingWorkouts: Array<{
    id: string;
    date: string;
    name: string;
    description: string;
  }>;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        throw new Error(`Error fetching dashboard data: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-500 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} className="mx-auto block">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please sign in to access the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header
          variant="dashboard"
          user={session.user}
          onSignOut={() => signOut()}
        />

        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="relative">
              <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent inline-block">
                Welcome back, {session.user?.name?.split(" ")[0] || "there"}
              </h1>
              <div className="absolute -z-10 top-1/2 left-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl transform -translate-y-1/2"></div>
            </div>
            <p className="text-muted-foreground text-lg md:text-xl flex items-center gap-3">
              <span>Ready for today's workout?</span>
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20"
              >
                {new Date().toLocaleDateString("en-US", { weekday: "long" })}
              </Badge>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6 xl:space-y-8">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 xl:gap-6">
                <Button
                  size="lg"
                  className="h-16 justify-start space-x-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20"
                  asChild
                >
                  <Link href="/workouts/create">
                    <Plus className="w-7 h-7" />
                    <span className="text-xl font-medium">Start Workout</span>
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 justify-start space-x-4 border-2 hover:bg-muted/50 shadow-sm"
                  asChild
                >
                  <Link href="/progress">
                    <BarChart3 className="w-7 h-7" />
                    <span className="text-xl font-medium">View Progress</span>
                  </Link>
                </Button>
              </div>

              {/* Recent Workouts */}
              <Card className="border-0 bg-gradient-to-br from-card via-card to-muted/20 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                        <Dumbbell className="w-7 h-7 text-primary" />
                      </div>
                      <span className="text-2xl lg:text-3xl">
                        Recent Workouts
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/workout-sessions">View Sessions</Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/workouts">View All</Link>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 flex flex-col gap-2">
                  {dashboardData?.recentWorkouts &&
                  dashboardData.recentWorkouts.length > 0 ? (
                    dashboardData.recentWorkouts.map((workout) => (
                      <Link
                        key={workout.id}
                        href={`/workout-sessions/${workout.id}`}
                      >
                        <div className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{workout.name}</h4>
                            <Badge variant="secondary">Completed</Badge>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(
                                  workout.completedAt
                                ).toLocaleDateString()}
                              </span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{workout.duration} min</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <Target className="w-4 h-4" />
                              <span>{workout.exerciseCount} exercises</span>
                            </span>
                            {workout.calories && (
                              <span className="flex items-center space-x-2">
                                <Flame className="w-4 h-4" />
                                <span>{workout.calories} cal</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No recent workouts.{" "}
                      <Link
                        href="/workouts/create"
                        className="text-foreground hover:underline"
                      >
                        Create your first workout
                      </Link>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Summary */}
              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <BarChart3 className="w-7 h-7" />
                    <span className="text-2xl lg:text-3xl">This Week</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                    <div className="text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Trophy className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <div className="text-xl md:text-3xl font-bold mb-1">
                        {dashboardData?.weeklyStats?.workouts || 0}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        Workouts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Clock className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <div className="text-xl md:text-3xl font-bold mb-1">
                        {dashboardData?.weeklyStats?.totalTime || "0h"}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        Total Time
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Flame className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <div className="text-xl md:text-3xl font-bold mb-1">
                        {dashboardData?.weeklyStats?.calories || 0}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        Calories
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:space-y-5 xl:space-y-6">
              {/* Quick Stats */}
              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Weekly Progress */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Weekly Progress
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 rounded-full hover:bg-muted"
                          >
                            <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">
                            {dashboardData?.quickStats?.tooltips
                              ?.weeklyProgress || "Weekly workout progress"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={dashboardData?.quickStats?.weeklyProgress || 0}
                        className="h-2 w-16"
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {dashboardData?.quickStats?.weeklyProgress || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Monthly Progress */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Monthly Progress
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 rounded-full hover:bg-muted"
                          >
                            <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">
                            {dashboardData?.quickStats?.tooltips
                              ?.monthlyProgress || "Monthly workout progress"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={dashboardData?.quickStats?.monthlyProgress || 0}
                        className="h-2 w-16"
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {dashboardData?.quickStats?.monthlyProgress || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Current Streak */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Current Streak
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 rounded-full hover:bg-muted"
                          >
                            <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">
                            {dashboardData?.quickStats?.tooltips
                              ?.currentStreak || "Consecutive workout days"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Badge
                      variant={
                        (dashboardData?.quickStats?.currentStreak || 0) > 0
                          ? "default"
                          : "secondary"
                      }
                    >
                      {dashboardData?.quickStats?.currentStreak || 0} Day
                      {(dashboardData?.quickStats?.currentStreak || 0) !== 1
                        ? "s"
                        : ""}
                    </Badge>
                  </div>

                  {/* Only show goal sections if user has set goals */}
                  {dashboardData?.quickStats?.hasWeeklyGoal && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          Weekly Goal
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 rounded-full hover:bg-muted"
                            >
                              <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">
                              {dashboardData?.quickStats?.tooltips
                                ?.weeklyGoal || "Weekly workout goal"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Progress
                            value={Math.min(
                              ((dashboardData?.quickStats?.weeklyGoalCurrent ||
                                0) /
                                Math.max(
                                  dashboardData?.quickStats?.weeklyGoalTarget ||
                                    1,
                                  1
                                )) *
                                100,
                              100
                            )}
                            className="h-2 w-12"
                          />
                          <span className="text-sm font-medium">
                            {dashboardData?.quickStats?.weeklyGoalCurrent || 0}{" "}
                            / {dashboardData?.quickStats?.weeklyGoalTarget || 0}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Goal Set
                        </Badge>
                      </div>
                    </div>
                  )}

                  {dashboardData?.quickStats?.hasMonthlyGoal && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          Monthly Goal
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 rounded-full hover:bg-muted"
                            >
                              <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">
                              {dashboardData?.quickStats?.tooltips
                                ?.monthlyGoal || "Monthly workout goal"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Progress
                            value={Math.min(
                              ((dashboardData?.quickStats?.monthlyGoalCurrent ||
                                0) /
                                Math.max(
                                  dashboardData?.quickStats
                                    ?.monthlyGoalTarget || 1,
                                  1
                                )) *
                                100,
                              100
                            )}
                            className="h-2 w-12"
                          />
                          <span className="text-sm font-medium">
                            {dashboardData?.quickStats?.monthlyGoalCurrent || 0}{" "}
                            /{" "}
                            {dashboardData?.quickStats?.monthlyGoalTarget || 0}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Goal Set
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Show call-to-action if no goals are set */}
                  {!dashboardData?.quickStats?.hasWeeklyGoal &&
                    !dashboardData?.quickStats?.hasMonthlyGoal && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          Set consistency goals to track your progress better
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/goals">
                            <Target className="w-3 h-3 mr-1" />
                            Create Goals
                          </Link>
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Current Goals */}
              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-3">
                    <Target className="w-6 h-6" />
                    <span>Current Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.goals && dashboardData.goals.length > 0 ? (
                    dashboardData.goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="p-3 border border-border rounded-lg"
                      >
                        <div className="font-medium text-sm mb-1">
                          {goal.title}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Current: {goal.current}
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No active goals.{" "}
                      <Link
                        href="/goals"
                        className="text-foreground hover:underline"
                      >
                        Set one now
                      </Link>
                    </p>
                  )}
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/goals">Manage Goals</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming */}
              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-3">
                    <Calendar className="w-6 h-6" />
                    <span>Upcoming</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.upcomingWorkouts &&
                  dashboardData.upcomingWorkouts.length > 0 ? (
                    dashboardData.upcomingWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="p-4 border border-border rounded-xl"
                      >
                        <div className="font-semibold text-sm mb-1">
                          {workout.date}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {workout.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {workout.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <div className="font-semibold text-sm mb-1">Today</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Rest Day
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Recovery and stretching
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
