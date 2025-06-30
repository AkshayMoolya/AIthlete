"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Play,
  Edit,
  Share2,
  Clock,
  Target,
  Calendar,
  User,
  Globe,
  Lock,
  Dumbbell,
  MoreVertical,
  Copy,
  Trash2,
  Heart,
  MessageCircle,
  Trophy,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Workout, WorkoutExercise } from "@/lib/types";

interface WorkoutDetailsProps {
  params: {
    id: string;
  };
}

export default function WorkoutDetails({ params }: WorkoutDetailsProps) {
  const { data: session } = useSession();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchWorkout();
  }, [params.id]);

  const fetchWorkout = async () => {
    try {
      const response = await fetch(`/api/workouts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkout(data);
        // Mock like data - replace with actual API calls
        setLikeCount(Math.floor(Math.random() * 50) + 5);
        setIsLiked(Math.random() > 0.7);
      } else {
        toast.error("Failed to load workout");
      }
    } catch (error) {
      console.error("Error fetching workout:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    // Toggle like state
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    // Mock API call - replace with actual implementation
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  };

  const handleShare = async () => {
    if (navigator.share && workout) {
      try {
        await navigator.share({
          title: workout.name,
          text: workout.description || "Check out this workout!",
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } else {
      // Fallback for browsers without Web Share API
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const isOwner = session?.user?.id === workout?.userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workout not found</h2>
          <p className="text-muted-foreground mb-4">
            The workout you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/workouts">Back to Workouts</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/workouts">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Workouts
                </Link>
              </Button>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/workouts/${workout.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Workout
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShare}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Workout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Workout Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-3 pr-4">
                    {workout.name}
                  </h1>

                  <div className="flex items-center flex-wrap gap-3 mb-4">
                    {workout.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    <Badge variant={workout.isPublic ? "default" : "outline"}>
                      {workout.isPublic ? (
                        <>
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>
                  </div>

                  {workout.description && (
                    <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                      {workout.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={workout.user?.image || ""} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {workout.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(workout.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className="space-x-1"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isLiked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    <span>{likeCount}</span>
                  </Button>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span>12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">
                        {workout.estimatedDuration || 45}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Minutes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">
                        {workout.exercises.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Exercises
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                        <Trophy className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">
                        {workout.exercises.reduce(
                          (acc, ex) => acc + ex.sets,
                          0
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Sets
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exercises List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Dumbbell className="w-5 h-5" />
                    <span>Exercises ({workout.exercises.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workout.exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {exercise.exercise.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {exercise.exercise.category} •{" "}
                              {exercise.exercise.equipment}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {exercise.sets} sets
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {exercise.restTime || 60}s rest
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="bg-muted/30 p-2 rounded">
                          <div className="text-xs text-muted-foreground mb-1">
                            Reps
                          </div>
                          <div className="font-medium">
                            {Array.isArray(exercise.reps)
                              ? exercise.reps.join(", ")
                              : exercise.reps || "10"}
                          </div>
                        </div>
                        {exercise.weight && (
                          <div className="bg-muted/30 p-2 rounded">
                            <div className="text-xs text-muted-foreground mb-1">
                              Weight
                            </div>
                            <div className="font-medium">
                              {Array.isArray(exercise.weight)
                                ? `${exercise.weight[0]} kg`
                                : `${exercise.weight} kg`}
                            </div>
                          </div>
                        )}
                        <div className="bg-muted/30 p-2 rounded">
                          <div className="text-xs text-muted-foreground mb-1">
                            Rest
                          </div>
                          <div className="font-medium">
                            {exercise.restTime || 60}s
                          </div>
                        </div>
                        <div className="bg-muted/30 p-2 rounded">
                          <div className="text-xs text-muted-foreground mb-1">
                            Volume
                          </div>
                          <div className="font-medium">
                            {exercise.sets *
                              (Array.isArray(exercise.reps)
                                ? exercise.reps[0]
                                : exercise.reps || 10)}
                          </div>
                        </div>
                      </div>

                      {exercise.notes && (
                        <div className="mt-3 p-2 bg-muted/30 rounded">
                          <div className="text-xs text-muted-foreground mb-1">
                            Notes
                          </div>
                          <div className="text-sm">{exercise.notes}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Button
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    asChild
                  >
                    <Link href={`/workouts/${workout.id}/start`}>
                      <Play className="w-5 h-5 mr-2" />
                      Start Workout
                    </Link>
                  </Button>

                  {isOwner && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/workouts/${workout.id}/edit`}>
                        <Edit className="w-5 h-5 mr-2" />
                        Edit Workout
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full"
                    onClick={handleLike}
                  >
                    <Heart
                      className={`w-5 h-5 mr-2 ${
                        isLiked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    {isLiked ? "Favorited" : "Add to Favorites"}
                  </Button>
                </CardContent>
              </Card>

              {/* Workout Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workout Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge variant="outline">Intermediate</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Equipment</span>
                      <span className="text-sm">
                        {Array.from(
                          new Set(
                            workout.exercises.map((e) => e.exercise.equipment)
                          )
                        ).join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Focus Areas</span>
                      <span className="text-sm">
                        {Array.from(
                          new Set(
                            workout.exercises.map((e) => e.exercise.category)
                          )
                        ).join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Volume
                      </span>
                      <span className="text-sm font-medium">
                        {workout.exercises.reduce(
                          (acc, ex) =>
                            acc +
                            ex.sets *
                              (Array.isArray(ex.reps)
                                ? ex.reps[0] || 0
                                : ex.reps || 0),
                          0
                        )}{" "}
                        reps
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-muted-foreground">
                        Last completed 2 days ago
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-muted-foreground">
                        Completed 5 times this month
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-muted-foreground">
                        Average duration: 42 min
                      </span>
                    </div>
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
