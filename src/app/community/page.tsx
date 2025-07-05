"use client";

import { useEffect, useState } from "react";
import {
  Dumbbell,
  Search,
  Filter,
  Clock,
  Target,
  Calendar,
  Globe,
  User,
  Play,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Workout } from "@/lib/types";

export default function Community() {
  const [publicWorkouts, setPublicWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPublicWorkouts();
  }, []);

  const fetchPublicWorkouts = async () => {
    try {
      const response = await fetch("/api/workouts?public=true");
      if (response.ok) {
        const data = await response.json();
        setPublicWorkouts(data);
      }
    } catch (error) {
      console.error("Error fetching public workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPublicWorkouts = publicWorkouts.filter(
    (workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const WorkoutCard = ({ workout }: { workout: Workout }) => (
    <Card className="border-0 bg-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base sm:text-lg mb-2 sm:mb-3 flex items-center space-x-2">
              <span className="truncate">{workout.name}</span>
              <Globe className="w-4 h-4 text-green-600 flex-shrink-0" />
            </CardTitle>
            <div className="flex items-center space-x-2 mb-3">
              {workout.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {workout.description || "No description provided"}
            </p>
            <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>by {workout.user.name}</span>
            </div>
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
          <p>Loading community workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Replace custom header with reusable Header component */}
      <Header variant="dashboard" />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">
              Community Workouts
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Discover and try workouts created by the community
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search community workouts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>

        {/* Community Workouts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 xl:gap-6">
          {filteredPublicWorkouts.length > 0 ? (
            filteredPublicWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
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
      </div>
    </div>
  );
}
