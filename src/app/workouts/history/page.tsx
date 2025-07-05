"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  Target,
  Trophy,
  TrendingUp,
  Filter,
  Search,
  Eye,
  BarChart3,
  Flame,
  Activity,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkoutSession {
  id: string;
  workoutId: string;
  workout: {
    name: string;
    description?: string;
  };
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  completed: boolean;
  exerciseCount: number;
  totalSets: number;
  totalReps: number;
  notes?: string;
}

interface HistoryStats {
  totalWorkouts: number;
  totalTime: number; // in minutes
  averageDuration: number;
  currentStreak: number;
  longestStreak: number;
  thisWeek: number;
  thisMonth: number;
}

export default function WorkoutHistory() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      const [sessionsResponse, statsResponse] = await Promise.all([
        fetch("/api/workout-sessions"),
        fetch("/api/workout-sessions/stats"),
      ]);

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching workout history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.workout.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const sessionDate = new Date(session.startTime);
    const now = new Date();

    switch (filterPeriod) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessionDate >= monthAgo;
      case "3months":
        const threeMonthsAgo = new Date(
          now.getTime() - 90 * 24 * 60 * 60 * 1000
        );
        return sessionDate >= threeMonthsAgo;
      default:
        return true;
    }
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
      case "oldest":
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      case "duration":
        return b.duration - a.duration;
      case "name":
        return a.workout.name.localeCompare(b.workout.name);
      default:
        return 0;
    }
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading workout history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Workout History
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Track your progress and review past workout sessions
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                <div className="text-xs text-muted-foreground">
                  Total Workouts
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {formatDuration(stats.totalTime)}
                </div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {formatDuration(stats.averageDuration)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Avg Duration
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">
                  Current Streak
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.thisWeek}</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search workouts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="3months">Past 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Workout Sessions List */}
        <div className="space-y-4">
          {sortedSessions.length > 0 ? (
            sortedSessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {session.workout.name}
                        </h3>
                        <Badge
                          variant={session.completed ? "default" : "secondary"}
                        >
                          {session.completed ? "Completed" : "Incomplete"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(session.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(session.duration)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>{session.exerciseCount} exercises</span>
                        </div>
                      </div>

                      {session.workout.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {session.workout.description}
                        </p>
                      )}

                      {/* Progress indicators */}
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Sets completed</span>
                            <span>{session.totalSets} sets</span>
                          </div>
                          <Progress
                            value={session.completed ? 100 : 75}
                            className="h-2"
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {session.totalReps}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            total reps
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/workout-sessions/${session.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/workouts/${session.workoutId}`}>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No workout sessions found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterPeriod !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "Start your first workout to see your progress here"}
                </p>
                <Button asChild>
                  <Link href="/workouts">
                    {sessions.length === 0
                      ? "Browse Workouts"
                      : "Clear Filters"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Load more button if needed */}
        {sortedSessions.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Showing {sortedSessions.length} of {sessions.length} workout
              sessions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
