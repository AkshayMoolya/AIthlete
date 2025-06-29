import {
  Dumbbell,
  TrendingUp,
  Trophy,
  Target,
  Calendar,
  Clock,
  BarChart3,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

import Link from "next/link";

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-background" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              FitTracker
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/workouts"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Workouts
            </Link>
            <Link
              href="/progress"
              className="text-foreground font-medium text-sm"
            >
              Progress
            </Link>
            <Link
              href="/exercises"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Exercises
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Your Progress</h1>
          <p className="text-muted-foreground text-lg">
            Track your fitness journey and achievements
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold mb-1">28</div>
              <div className="text-sm text-muted-foreground">
                Workouts Completed
              </div>
              <div className="text-xs text-green-600 mt-1">+4 this week</div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold mb-1">+18%</div>
              <div className="text-sm text-muted-foreground">
                Strength Increase
              </div>
              <div className="text-xs text-green-600 mt-1">This month</div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold mb-1">7</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
              <div className="text-xs text-green-600 mt-1">Personal best</div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold mb-1">22h</div>
              <div className="text-sm text-muted-foreground">Training Time</div>
              <div className="text-xs text-green-600 mt-1">This month</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Progress Chart */}
              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Monthly Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Workout Consistency</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Strength Progression</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Goal Achievement</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>88%</span>
                      </div>
                      <Progress value={88} className="h-3" />
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
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-background" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Personal Record
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Bench press: 225 lbs
                        </div>
                      </div>
                      <Badge variant="secondary">New</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-background" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Consistency Streak
                        </div>
                        <div className="text-xs text-muted-foreground">
                          7 days workout streak
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-background" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Monthly Goal</div>
                        <div className="text-xs text-muted-foreground">
                          16 workouts completed
                        </div>
                      </div>
                      <Badge variant="secondary">Achieved</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Summary */}
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>This Week's Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-7 gap-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          {day}
                        </div>
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            index < 4
                              ? "bg-foreground"
                              : index === 4
                              ? "bg-muted"
                              : "bg-muted"
                          }`}
                        >
                          {index < 4 ? (
                            <Trophy className="w-5 h-5 text-background" />
                          ) : index === 4 ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {index < 4
                            ? "Completed"
                            : index === 4
                            ? "Today"
                            : "Planned"}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strength" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Strength Progression</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Bench Press</span>
                        <span className="text-sm text-green-600">+15 lbs</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>210 lbs → 225 lbs</span>
                        <span>+7.1%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Squat</span>
                        <span className="text-sm text-green-600">+25 lbs</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>275 lbs → 300 lbs</span>
                        <span>+9.1%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Deadlift</span>
                        <span className="text-sm text-green-600">+20 lbs</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>315 lbs → 335 lbs</span>
                        <span>+6.3%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Overhead Press</span>
                        <span className="text-sm text-green-600">+10 lbs</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>135 lbs → 145 lbs</span>
                        <span>+7.4%</span>
                      </div>
                      <Progress value={71} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Total Volume</span>
                        <Badge variant="secondary">Excellent</Badge>
                      </div>
                      <div className="text-2xl font-bold">+18%</div>
                      <div className="text-sm text-muted-foreground">
                        vs last month
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Training Frequency</span>
                        <Badge variant="secondary">Consistent</Badge>
                      </div>
                      <div className="text-2xl font-bold">4.2x</div>
                      <div className="text-sm text-muted-foreground">
                        per week average
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">
                          Progressive Overload
                        </span>
                        <Badge variant="secondary">On Track</Badge>
                      </div>
                      <div className="text-2xl font-bold">85%</div>
                      <div className="text-sm text-muted-foreground">
                        of sessions progressed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Current Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Bench Press 250 lbs</h4>
                        <Badge variant="secondary">In Progress</Badge>
                      </div>
                      <Progress value={90} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Current: 225 lbs</span>
                        <span>90% Complete</span>
                      </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">30-Day Consistency</h4>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <Progress value={23} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Day 7 of 30</span>
                        <span>23% Complete</span>
                      </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Run 5K under 25 min</h4>
                        <Badge variant="secondary">On Track</Badge>
                      </div>
                      <Progress value={85} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Current: 26:30</span>
                        <span>85% Complete</span>
                      </div>
                    </div>
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
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Trophy className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Squat 300 lbs</div>
                        <div className="text-xs text-muted-foreground">
                          Completed 2 days ago
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Trophy className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">7-Day Streak</div>
                        <div className="text-xs text-muted-foreground">
                          Completed today
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Trophy className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Monthly Target
                        </div>
                        <div className="text-xs text-muted-foreground">
                          16 workouts last month
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4 bg-foreground text-background hover:bg-foreground/90">
                      Set New Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
