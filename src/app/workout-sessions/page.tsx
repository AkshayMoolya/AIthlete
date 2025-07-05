"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Dumbbell,
  Target,
  Trophy,
  ChevronRight,
  Filter,
  Search,
  CheckCircle,
  PlayCircle,
} from "lucide-react";
import { format, isToday, isYesterday, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { CompletedBadge } from "@/components/workout/completed-badge";

interface WorkoutSession {
  id: string;
  workout: {
    name: string;
    description?: string;
  };
  startTime: string;
  endTime?: string;
  completed: boolean;
  exerciseCount: number;
  duration?: number;
  totalVolume?: number;
}

export default function WorkoutSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/workout-sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching workout sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) =>
    session.workout.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  };

  const calculateDuration = (session: WorkoutSession) => {
    if (!session.startTime || !session.endTime) return null;
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / 60000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading workout sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header variant="dashboard" />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            Workout Sessions
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
            Track your workout history and progress
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 xl:mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search workout sessions..."
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

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const duration = calculateDuration(session);

              return (
                <Link key={session.id} href={`/workout-sessions/${session.id}`}>
                  <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold truncate">
                              {session.workout.name}
                            </h3>
                            <CompletedBadge completed={session.completed} />
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(session.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {format(new Date(session.startTime), "h:mm a")}
                              </span>
                            </div>
                            {duration && (
                              <div className="flex items-center gap-1">
                                <PlayCircle className="w-4 h-4" />
                                <span>{duration} min</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span>
                                {session.exerciseCount || 0} exercises
                              </span>
                            </div>
                            {session.totalVolume && (
                              <div className="flex items-center gap-1">
                                <Trophy className="w-4 h-4 text-green-500" />
                                <span>
                                  {session.totalVolume.toFixed(0)} kg volume
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-muted-foreground ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No workout sessions found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Start your first workout to see sessions here"}
                </p>
                <Button asChild>
                  <Link href="/workouts">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Browse Workouts
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
