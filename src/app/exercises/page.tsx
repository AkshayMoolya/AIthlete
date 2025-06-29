"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Search,
  Filter,
  Plus,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";

interface Exercise {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  equipment: string;
  lastWeight?: string;
  bestSet?: string;
  trend?: string;
  description?: string;
}

interface RecentActivity {
  id: string;
  exerciseName: string;
  weight: string;
  reps: number;
  improvement: string;
  date: string;
}

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchExercises();
    fetchRecentActivity();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/exercises");
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch("/api/exercises/recent-activity");
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      }
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Replace custom header with reusable Header component */}
      <Header variant="dashboard" />

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-3">Exercises</h1>
            <p className="text-muted-foreground text-lg">
              Track your exercise progress and personal records
            </p>
          </div>
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search exercises..."
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

        {/* Exercise Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="border-0 bg-card hover:shadow-lg transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {exercise.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="outline">{exercise.category}</Badge>
                        <Badge variant="secondary">{exercise.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {exercise.equipment}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-medium">
                        {exercise.trend}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Last Weight:
                      </span>
                      <span className="font-medium">{exercise.lastWeight}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Best Set:</span>
                      <span className="font-medium">{exercise.bestSet}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90">
                      <Target className="w-4 h-4 mr-2" />
                      Log Set
                    </Button>
                    <Button variant="outline" size="icon">
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Add your first exercise to get started"}
              </p>
              <Button asChild>
                <Link href="/exercises/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <Card className="border-0 bg-card mt-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Clock className="w-6 h-6" />
              <span className="text-2xl">Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{activity.exerciseName}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.weight} × {activity.reps} reps
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600">
                        {activity.improvement}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.date}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
