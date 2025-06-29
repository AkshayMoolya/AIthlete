"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  LogOut,
  Plus,
  Target,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/dashboard/loading-spinner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";

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
    <div className="min-h-screen bg-background">
      <Header
        variant="dashboard"
        user={session.user}
        onSignOut={() => signOut()}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">
            Good morning, {session.user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready for today's workout?
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                size="lg"
                className="h-16 justify-start space-x-4 bg-foreground text-background hover:bg-foreground/90"
                asChild
              >
                <Link href="/workouts/create">
                  <Plus className="w-6 h-6" />
                  <span className="text-lg font-medium">Start Workout</span>
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 justify-start space-x-4"
                asChild
              >
                <Link href="/progress">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-lg font-medium">View Progress</span>
                </Link>
              </Button>
            </div>

            {/* Recent Workouts */}
            <Card className="border-0 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Dumbbell className="w-6 h-6" />
                    <span className="text-2xl">Recent Workouts</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/workouts">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.recentWorkouts &&
                dashboardData.recentWorkouts.length > 0 ? (
                  dashboardData.recentWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{workout.name}</h4>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(workout.completedAt).toLocaleDateString()}
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
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-2xl">This Week</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 md:gap-8">
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
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span>Weekly Goal</span>
                    <span className="font-semibold">
                      {dashboardData?.quickStats?.weeklyGoalCurrent || 0}/
                      {dashboardData?.quickStats?.weeklyGoalTarget || 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      dashboardData?.quickStats?.weeklyGoalTarget
                        ? dashboardData?.quickStats?.weeklyProgress || 0
                        : 0
                    }
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span>Monthly Goal</span>
                    <span className="font-semibold">
                      {dashboardData?.quickStats?.monthlyGoalCurrent || 0}/
                      {dashboardData?.quickStats?.monthlyGoalTarget || 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      dashboardData?.quickStats?.monthlyGoalTarget
                        ? dashboardData?.quickStats?.monthlyProgress || 0
                        : 0
                    }
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span>Current Streak</span>
                    <span className="font-semibold">
                      {dashboardData?.quickStats?.currentStreak || 0} days
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (dashboardData?.quickStats?.currentStreak || 0) * 10,
                      100
                    )}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Goals */}
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-3">
                  <Target className="w-5 h-5" />
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
                    No active goals
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
                  <Calendar className="w-5 h-5" />
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
  );
}
