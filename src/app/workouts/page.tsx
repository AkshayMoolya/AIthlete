import {
  Dumbbell,
  Search,
  Filter,
  Plus,
  Clock,
  Target,
  Calendar,
  CheckCircle,
  Play,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { ThemeToggle } from "@/src/components/theme-toggle";

export default function Workouts() {
  const workouts = [
    {
      id: 1,
      title: "Upper Body Strength",
      type: "Strength",
      duration: "45 min",
      exercises: 8,
      completed: false,
      date: "Today",
      description: "Chest, shoulders, and triceps focus",
    },
    {
      id: 2,
      title: "Morning Cardio",
      type: "Cardio",
      duration: "30 min",
      exercises: 4,
      completed: true,
      date: "Yesterday",
      description: "High-intensity interval training",
    },
    {
      id: 3,
      title: "Lower Body Power",
      type: "Strength",
      duration: "50 min",
      exercises: 6,
      completed: true,
      date: "2 days ago",
      description: "Squats, deadlifts, and leg press",
    },
    {
      id: 4,
      title: "Core & Flexibility",
      type: "Core",
      duration: "25 min",
      exercises: 10,
      completed: false,
      date: "Planned",
      description: "Core strengthening and stretching",
    },
    {
      id: 5,
      title: "Full Body Circuit",
      type: "Circuit",
      duration: "40 min",
      exercises: 12,
      completed: true,
      date: "3 days ago",
      description: "Complete body workout circuit",
    },
    {
      id: 6,
      title: "Recovery Session",
      type: "Recovery",
      duration: "20 min",
      exercises: 5,
      completed: false,
      date: "Planned",
      description: "Light stretching and mobility",
    },
  ];

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
              className="text-foreground font-medium text-sm"
            >
              Workouts
            </Link>
            <Link
              href="/progress"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
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
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-3">Workouts</h1>
            <p className="text-muted-foreground text-lg">
              Track and manage your fitness routines
            </p>
          </div>
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            <Plus className="w-4 h-4 mr-2" />
            New Workout
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search workouts..." className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>

        {/* Workout Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {workouts.map((workout) => (
            <Card
              key={workout.id}
              className="border-0 bg-card hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-3 flex items-center space-x-2">
                      <span>{workout.title}</span>
                    </CardTitle>
                    <Badge variant="outline" className="mb-3">
                      {workout.type}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {workout.description}
                    </p>
                  </div>
                  {workout.completed && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                  <span className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{workout.duration}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>{workout.exercises} exercises</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{workout.date}</span>
                  </span>
                </div>

                <div className="flex space-x-3">
                  {workout.completed ? (
                    <Button variant="outline" className="flex-1" disabled>
                      Completed
                    </Button>
                  ) : (
                    <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90">
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Schedule */}
        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <span className="text-2xl">This Week's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-3">
                      {day}
                    </div>
                    <div
                      className={`p-3 rounded-xl text-xs font-medium ${
                        index === 0
                          ? "bg-foreground text-background"
                          : index === 1
                          ? "bg-muted text-muted-foreground"
                          : index === 2
                          ? "bg-muted text-foreground"
                          : index === 3
                          ? "bg-muted text-muted-foreground"
                          : index === 4
                          ? "bg-muted text-foreground"
                          : index === 5
                          ? "bg-muted text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index === 0
                        ? "Upper Body"
                        : index === 1
                        ? "Rest"
                        : index === 2
                        ? "Lower Body"
                        : index === 3
                        ? "Rest"
                        : index === 4
                        ? "Cardio"
                        : index === 5
                        ? "Full Body"
                        : "Rest"}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
