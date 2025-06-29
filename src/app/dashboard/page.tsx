"use client";

import { useSession, signOut } from "next-auth/react";

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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";
import { Header } from "@/src/components/layout/header";
import { LoadingSpinner } from "@/src/components/dashboard/loading-spinner";
import { Progress } from "@/src/components/ui/progress";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
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
          <h1 className="text-4xl font-bold mb-3">Good morning, Alex</h1>
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
              >
                <Plus className="w-6 h-6" />
                <span className="text-lg font-medium">Start Workout</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 justify-start space-x-4"
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-lg font-medium">View Progress</span>
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
                <div className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Upper Body Strength</h4>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Yesterday</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>45 min</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>8 exercises</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Cardio Session</h4>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>2 days ago</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>30 min</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Flame className="w-4 h-4" />
                      <span>320 cal</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Lower Body Strength</h4>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>3 days ago</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>50 min</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>6 exercises</span>
                    </span>
                  </div>
                </div>
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
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-bold mb-1">4</div>
                    <div className="text-muted-foreground">Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-bold mb-1">3.2h</div>
                    <div className="text-muted-foreground">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Flame className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-bold mb-1">1,240</div>
                    <div className="text-muted-foreground">Calories</div>
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
                    <span className="font-semibold">4/5</span>
                  </div>
                  <Progress value={80} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span>Monthly Goal</span>
                    <span className="font-semibold">12/16</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span>Current Streak</span>
                    <span className="font-semibold">7 days</span>
                  </div>
                  <Progress value={100} className="h-3" />
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
                <div className="p-3 border border-border rounded-lg">
                  <div className="font-medium text-sm mb-1">
                    Bench Press 225 lbs
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Current: 210 lbs
                  </div>
                  <Progress value={93} className="h-2" />
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="font-medium text-sm mb-1">
                    Run 5K under 25 min
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Current: 26:30
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="font-medium text-sm mb-1">
                    Workout 5x per week
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    This week: 4/5
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Manage Goals
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
                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="font-semibold text-sm mb-1">Today</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Rest Day
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Recovery and stretching
                  </div>
                </div>
                <div className="p-4 border border-border rounded-xl">
                  <div className="font-semibold text-sm mb-1">Tomorrow</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Lower Body
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Squats, deadlifts, lunges
                  </div>
                </div>
                <div className="p-4 border border-border rounded-xl">
                  <div className="font-semibold text-sm mb-1">Friday</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Cardio
                  </div>
                  <div className="text-xs text-muted-foreground">
                    30 min running
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
