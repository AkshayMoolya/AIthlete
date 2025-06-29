"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
  Globe,
  Lock,
  User,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Workout } from "@/lib/types";

export default function Workouts() {
  const { data: session } = useSession();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [publicWorkouts, setPublicWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchWorkouts();
    fetchPublicWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch("/api/workouts");
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicWorkouts = async () => {
    try {
      const response = await fetch("/api/workouts?public=true");
      if (response.ok) {
        const data = await response.json();
        setPublicWorkouts(data);
      }
    } catch (error) {
      console.error("Error fetching public workouts:", error);
    }
  };

  const filteredWorkouts = workouts.filter(
    (workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublicWorkouts = publicWorkouts.filter(
    (workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const WorkoutCard = ({
    workout,
    isPublic = false,
  }: {
    workout: Workout;
    isPublic?: boolean;
  }) => (
    <Card className="border-0 bg-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-3 flex items-center space-x-2">
              <span>{workout.name}</span>
              {workout.isPublic ? (
                <Globe className="w-4 h-4 text-green-600" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
            </CardTitle>
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="outline">{workout.difficulty}</Badge>
              {workout.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {workout.description || "No description provided"}
            </p>
            {isPublic && (
              <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>by {workout.user.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
          <span className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{workout.estimatedDuration || 45} min</span>
          </span>
          <span className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>{workout.exercises.length} exercises</span>
          </span>
          <span className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(workout.createdAt).toLocaleDateString()}</span>
          </span>
        </div>

        <div className="flex space-x-3">
          <Button
            className="flex-1 bg-foreground text-background hover:bg-foreground/90"
            asChild
          >
            <Link href={`/workouts/${workout.id}/start`}>
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/workouts/${workout.id}`}>
              <Calendar className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading workouts...</p>
        </div>
      </div>
    );
  }

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
              Create, track and share your fitness routines
            </p>
          </div>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90"
            asChild
          >
            <Link href="/workouts/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Workout
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search workouts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>

        <Tabs defaultValue="my-workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-workouts">My Workouts</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="my-workouts" className="space-y-6">
            {/* My Workouts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkouts.length > 0 ? (
                filteredWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No workouts found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Create your first workout to get started"}
                  </p>
                  <Button asChild>
                    <Link href="/workouts/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Workout
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            {/* Community Workouts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicWorkouts.length > 0 ? (
                filteredPublicWorkouts.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} isPublic />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No public workouts found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Be the first to share a workout with the community!"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
