import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Define interfaces for typed data structures
interface ExerciseLogWithSession {
  id: string;
  sessionId: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    category: string;
  };
  sets: number;
  reps: number[];
  weight: number[];
  restTime?: number[];
  notes?: string | null; // Modified to accept null values
  session: {
    startTime: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface StrengthProgression {
  exercise: string;
  previous: number;
  current: number;
  increase: number;
  percentage: number;
  progress: number;
}

// New interfaces for goals data
interface DbGoal {
  id: string;
  userId: string;
  name: string;
  targetValue: number;
  currentValue: number;
  type: string;
  status: "active" | "completed" | "abandoned";
  deadline?: Date | null;
  startDate: Date;
  completedDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get workout sessions with optimized includes
    const workoutSessions = await db.workoutSession.findMany({
      where: { userId },
      include: {
        workout: true,
        exerciseLogs: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true,
                equipment: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    if (!workoutSessions) {
      return NextResponse.json(
        { message: "No workout data found" },
        { status: 404 }
      );
    }

    // Basic metrics
    const workoutsCompleted = workoutSessions.length;

    // Weekly change calculation (this week vs last week)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekSessions = workoutSessions.filter(
      (s) => new Date(s.startTime) >= oneWeekAgo
    );
    const lastWeekSessions = workoutSessions.filter(
      (s) =>
        new Date(s.startTime) >= twoWeeksAgo &&
        new Date(s.startTime) < oneWeekAgo
    );

    const weeklyChange = thisWeekSessions.length - lastWeekSessions.length;

    // Streak calculation
    let currentStreak = 0;
    const today = new Date().toISOString().split("T")[0];

    // Get unique workout dates and sort them
    const workoutDates = [
      ...new Set(
        workoutSessions.map(
          (s) => new Date(s.startTime).toISOString().split("T")[0]
        )
      ),
    ]
      .sort()
      .reverse(); // Sort in descending order (newest first)

    // Calculate current streak
    if (workoutDates.length > 0) {
      const hasWorkoutToday = workoutDates[0] === today;
      currentStreak = hasWorkoutToday ? 1 : 0;

      for (let i = hasWorkoutToday ? 1 : 0; i < workoutDates.length; i++) {
        const currentDate = new Date(workoutDates[i]);
        const prevDate = new Date(workoutDates[i - 1]);

        // Check if consecutive days
        const dayDiff = Math.round(
          (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Monthly training time (hours)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSessions = workoutSessions.filter(
      (s) => new Date(s.startTime) >= startOfMonth
    );

    let trainingTimeMinutes = 0;
    monthSessions.forEach((session) => {
      if (session.startTime && session.endTime) {
        const duration =
          (new Date(session.endTime).getTime() -
            new Date(session.startTime).getTime()) /
          (1000 * 60);
        trainingTimeMinutes += duration;
      }
    });

    const trainingTime = Math.round(trainingTimeMinutes / 60); // Convert to hours

    // Collect all exercise logs with their related exercise data
    const allExerciseLogs: ExerciseLogWithSession[] = [];
    workoutSessions.forEach((session) => {
      session.exerciseLogs.forEach((log) => {
        allExerciseLogs.push({
          ...log,
          session: {
            startTime: session.startTime,
          },
        });
      });
    });

    // Group logs by exercise
    const exerciseMap: Record<string, ExerciseLogWithSession[]> = {};
    allExerciseLogs.forEach((log) => {
      if (!exerciseMap[log.exerciseId]) {
        exerciseMap[log.exerciseId] = [];
      }
      exerciseMap[log.exerciseId].push(log);
    });

    // Calculate strength progression
    const strengthProgressions: StrengthProgression[] = [];
    let totalStrengthIncrease = 0;
    let progressionCount = 0;

    for (const exerciseId of Object.keys(exerciseMap)) {
      const logs = exerciseMap[exerciseId].sort(
        (a, b) =>
          new Date(a.session.startTime).getTime() -
          new Date(b.session.startTime).getTime()
      );

      if (logs.length >= 2) {
        const firstLog = logs[0];
        const lastLog = logs[logs.length - 1];

        // Get max weight
        const firstWeight =
          firstLog.weight && firstLog.weight.length > 0
            ? Math.max(...firstLog.weight)
            : 0;
        const lastWeight =
          lastLog.weight && lastLog.weight.length > 0
            ? Math.max(...lastLog.weight)
            : 0;

        if (firstWeight > 0 && lastWeight > firstWeight) {
          const increase = lastWeight - firstWeight;
          const percentage = Math.round((increase / firstWeight) * 100);
          totalStrengthIncrease += percentage;
          progressionCount++;

          const exerciseName = logs[0].exercise?.name || "Unknown Exercise";

          strengthProgressions.push({
            exercise: exerciseName,
            previous: firstWeight,
            current: lastWeight,
            increase,
            percentage,
            progress: Math.min(percentage, 100),
          });
        }
      }
    }

    // Sort by highest improvement percentage
    strengthProgressions.sort((a, b) => b.percentage - a.percentage);

    const strengthIncrease =
      progressionCount > 0
        ? Math.round(totalStrengthIncrease / progressionCount)
        : 0;

    // Weekly summary
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDay = now.getDay() || 7; // Convert Sunday (0) to 7 for easier calculation
    const weekSummary = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - currentDay + i + 1); // Start from Monday of current week
      const dateStr = date.toISOString().split("T")[0];

      const hasWorkout = workoutDates.includes(dateStr);
      const isToday = dateStr === today;

      weekSummary.push({
        day: weekDays[i],
        status: isToday ? "today" : hasWorkout ? "completed" : "planned",
      });
    }

    // Fetch goals from database
    const userGoals = await db.goal.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Progress metrics
    const workoutConsistency = Math.min(
      Math.round((thisWeekSessions.length / 7) * 100),
      100
    );
    const strengthProgressionMetric = Math.min(strengthIncrease, 100);

    let goalAchievement = 0;
    const workoutGoals = userGoals.filter(
      (goal) =>
        goal.status === "active" &&
        (goal.type === "consistency" || goal.type.includes("workout"))
    );

    if (workoutGoals.length > 0) {
      // Calculate average progress across all workout-related goals
      const totalProgress = workoutGoals.reduce((sum, goal) => {
        return (
          sum +
          Math.min(
            Math.round((goal.currentValue / goal.targetValue) * 100),
            100
          )
        );
      }, 0);
      goalAchievement = Math.round(totalProgress / workoutGoals.length);
    } else {
      // Fallback calculation based on actual monthly workout frequency
      // Get the user's average workouts per month from historical data
      const monthsWithData = Math.max(
        1,
        Math.ceil(
          (now.getTime() -
            workoutSessions[workoutSessions.length - 1]?.startTime.getTime() ||
            0) /
            (30 * 24 * 60 * 60 * 1000)
        )
      );
      const averageMonthlyTarget =
        Math.round(workoutSessions.length / monthsWithData) || 4;
      const targetWorkoutsPerMonth = Math.max(4, averageMonthlyTarget);
      goalAchievement = Math.min(
        Math.round((monthSessions.length / targetWorkoutsPerMonth) * 100),
        100
      );
    }

    // Process active goals
    const activeGoals = userGoals
      .filter((goal) => goal.status === "active")
      .map((goal) => {
        const progress = Math.min(
          Math.round((goal.currentValue / goal.targetValue) * 100),
          100
        );

        let daysLeft, totalDays;
        if (goal.deadline) {
          const now = new Date();
          const start = new Date(goal.startDate);
          const end = new Date(goal.deadline);

          daysLeft = Math.max(
            0,
            Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          );
          totalDays = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        return {
          name: goal.name,
          status: goal.type === "consistency" ? "Active" : "In Progress",
          progress,
          current: `Current: ${goal.currentValue}${
            goal.type === "weight" ? " lbs" : ""
          }`,
          target: `${progress}% Complete`,
          ...(daysLeft !== undefined && { daysLeft }),
          ...(totalDays !== undefined && { totalDays }),
        };
      });

    // Process completed goals
    const completedGoals = userGoals
      .filter((goal) => goal.status === "completed")
      .map((goal) => {
        let completedDate = "recently";

        if (goal.completedDate) {
          const now = new Date();
          const completed = new Date(goal.completedDate);
          const diffDays = Math.floor(
            (now.getTime() - completed.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 0) {
            completedDate = "today";
          } else if (diffDays === 1) {
            completedDate = "yesterday";
          } else if (diffDays < 7) {
            completedDate = `${diffDays} days ago`;
          } else if (diffDays < 30) {
            completedDate = "last month";
          }
        }

        return {
          name: goal.name,
          completedDate,
        };
      });

    // Calculate goal achievement based on actual user goals, not hardcoded values
    let goalAchievementFallback = 0;
    const workoutGoalsFallback = userGoals.filter(
      (goal) =>
        goal.status === "active" &&
        (goal.type === "consistency" || goal.type.includes("workout"))
    );

    if (workoutGoalsFallback.length > 0) {
      // Calculate average progress across all workout-related goals
      const totalProgress = workoutGoalsFallback.reduce((sum, goal) => {
        return (
          sum +
          Math.min(
            Math.round((goal.currentValue / goal.targetValue) * 100),
            100
          )
        );
      }, 0);
      goalAchievementFallback = Math.round(
        totalProgress / workoutGoalsFallback.length
      );
    } else {
      // Fallback calculation based on actual monthly workout frequency
      // Get the user's average workouts per month from historical data
      const monthsWithData = Math.max(
        1,
        Math.ceil(
          (now.getTime() -
            workoutSessions[workoutSessions.length - 1]?.startTime.getTime() ||
            0) /
            (30 * 24 * 60 * 60 * 1000)
        )
      );
      const averageMonthlyTarget =
        Math.round(workoutSessions.length / monthsWithData) || 4;
      const targetWorkoutsPerMonth = Math.max(4, averageMonthlyTarget);
      goalAchievementFallback = Math.min(
        Math.round((monthSessions.length / targetWorkoutsPerMonth) * 100),
        100
      );
    }

    // Use actual user goals if available, otherwise generate personalized defaults
    const currentGoals = activeGoals.length > 0 ? activeGoals : [];

    // Only use completed goals from database, don't generate defaults
    const recentCompletedGoals =
      completedGoals.length > 0 ? completedGoals : [];

    // Get recent completed workouts
    const recentCompletedWorkouts = await db.workoutSession.findMany({
      where: {
        userId,
        completed: true,
      },
      include: {
        workout: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { endTime: "desc" },
      take: 5,
    });

    // Map to a simplified format for the UI
    const recentWorkouts = recentCompletedWorkouts.map((session) => ({
      id: session.id,
      name: session.workout.name,
      date: session.endTime || session.startTime,
    }));

    // Add exercise frequency analysis
    const exerciseFrequency = {};
    allExerciseLogs.forEach((log) => {
      const exerciseName = log.exercise?.name || "Unknown";
      exerciseFrequency[exerciseName] =
        (exerciseFrequency[exerciseName] || 0) + 1;
    });

    const mostFrequentExercises = Object.entries(exerciseFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Add muscle group analysis
    const muscleGroupWork = {};
    allExerciseLogs.forEach((log) => {
      if (log.exercise?.muscleGroups) {
        log.exercise.muscleGroups.forEach((muscle) => {
          muscleGroupWork[muscle] = (muscleGroupWork[muscle] || 0) + 1;
        });
      }
    });

    // Generate response object
    const progressData = {
      metrics: {
        workoutsCompleted,
        weeklyChange,
        strengthIncrease,
        streak: currentStreak,
        trainingTime,
      },
      progressMetrics: {
        workoutConsistency,
        strengthProgression: strengthProgressionMetric,
        goalAchievement,
        overallProgress: Math.round(
          (workoutConsistency + strengthProgressionMetric + goalAchievement) / 3
        ),
      },
      achievements: [
        {
          type: "Personal Record",
          description:
            strengthProgressions.length > 0
              ? `${strengthProgressions[0].exercise}: ${strengthProgressions[0].current} lbs`
              : "No records yet",
          status: "New",
          icon: "trophy",
        },
        {
          type: "Consistency Streak",
          description: `${currentStreak} days workout streak`,
          status: "Active",
          icon: "target",
        },
        {
          type: "Monthly Goal",
          description: `${monthSessions.length} workouts completed`,
          status:
            userGoals.length > 0 ? "Based on your goals" : "Set custom goals",
          icon: "activity",
        },
      ],
      weekSummary,
      strengthProgression: strengthProgressions.slice(0, 4), // Top 4 only
      performanceMetrics: {
        totalVolume: {
          value: monthSessions.length,
          status:
            monthSessions.length >
            (userGoals.length > 0
              ? Math.max(...workoutGoals.map((g) => g.targetValue)) / 2
              : 12)
              ? "Excellent"
              : "Good",
        },
        trainingFrequency: {
          value: parseFloat((thisWeekSessions.length / 7).toFixed(1)),
          status: thisWeekSessions.length >= 3 ? "Consistent" : "Moderate",
        },
        progressiveOverload: {
          value: strengthIncrease,
          status: strengthIncrease > 10 ? "On Track" : "Needs Focus",
        },
      },
      currentGoals,
      completedGoals: recentCompletedGoals,
      recentWorkouts,
      exerciseAnalytics: {
        mostFrequentExercises,
        muscleGroupDistribution: Object.entries(muscleGroupWork).map(
          ([muscle, count]) => ({ muscle, count })
        ),
      },
    };

    return NextResponse.json(progressData);
  } catch (error) {
    console.error("Error fetching progress data:", error);
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
