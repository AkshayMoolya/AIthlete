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
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { Workout } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Workouts() {
  const { data: session } = useSession();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkouts();
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

  const handleDeleteWorkout = async () => {
    if (!deleteWorkoutId) return;

    try {
      const response = await fetch(`/api/workouts/${deleteWorkoutId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove deleted workout from the state
        setWorkouts(workouts.filter((w) => w.id !== deleteWorkoutId));
        setDeleteWorkoutId(null);
      } else {
        console.error("Failed to delete workout");
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  const filteredWorkouts = workouts.filter(
    (workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const WorkoutCard = ({ workout }: { workout: Workout }) => {
    const isOwner = session?.user?.id === workout.userId;

    return (
      <Card className="border-0 bg-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg mb-2 sm:mb-3 flex items-center space-x-2 pr-4">
                <span className="truncate">{workout.name}</span>
                {workout.isPublic ? (
                  <Globe className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </CardTitle>
              <div className="flex items-center flex-wrap gap-2 mb-3">
                {workout.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {workout.description || "No description provided"}
              </p>
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/workouts/${workout.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteWorkoutId(workout.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground mb-6">
            <span className="flex items-center">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>{workout.estimatedDuration || 45}m</span>
            </span>
            <span className="flex items-center">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>{workout.exercises.length}</span>
            </span>
            <span className="flex items-center">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
  };

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
      {/* Replace custom header with reusable Header component */}
      <Header variant="dashboard" />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Workouts</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Create, track and manage your fitness routines
            </p>
          </div>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto"
            asChild
            size="lg"
          >
            <Link href="/workouts/create">
              <Plus className="w-5 h-5 mr-2" />
              Create Workout
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
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

        {/* My Workouts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredWorkouts.length > 0 ? (
            filteredWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No workouts found</h3>
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteWorkoutId}
        onOpenChange={(open) => !open && setDeleteWorkoutId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workout. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkout}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
