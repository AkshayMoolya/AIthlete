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
  notes?: string | null;
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

interface Achievement {
  type: string;
  description: string;
  status: string;
  icon: string;
  earnedDate?: string;
}

interface VolumeData {
  name: string;
  volume: number;
  sessions: number;
}

// Enhanced interfaces for better data representation
interface ProgressMetrics {
  workoutConsistency: {
    value: number;
    explanation: string;
    target: number;
  };
  strengthProgression: {
    value: number;
    explanation: string;
    exerciseCount: number;
  };
  goalAchievement: {
    value: number;
    explanation: string;
    activeGoalsCount: number;
  };
}

interface PerformanceMetrics {
  totalVolume: {
    value: number;
    status: string;
    explanation: string;
    previousMonth: number;
  };
  trainingFrequency: {
    value: number;
    status: string;
    explanation: string;
    target: number;
  };
  progressiveOverload: {
    value: number;
    status: string;
    explanation: string;
    sessionCount: number;
  };
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
      where: {
        userId,
        completed: true, // Only count completed sessions
      },
      include: {
        workout: {
          select: {
            name: true,
          },
        },
        exerciseLogs: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    // Get user goals with detailed information
    const userGoals = await db.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Check if user has any data
    if (workoutSessions.length === 0) {
      return NextResponse.json({
        metrics: {
          workoutsCompleted: 0,
          weeklyChange: 0,
          strengthIncrease: 0,
          streak: 0,
          trainingTime: 0,
        },
        progressMetrics: {
          workoutConsistency: {
            value: 0,
            explanation:
              "Complete workouts regularly to build consistency. Aim for 3 workouts per week to start.",
            target:
              userGoals.find(
                (g) =>
                  g.type === "consistency" &&
                  (g.name.toLowerCase().includes("week") ||
                    g.name.toLowerCase().includes("weekly"))
              )?.targetValue || 3,
          },
          strengthProgression: {
            value: 0,
            explanation:
              "Track strength gains by logging progressive overload in your workouts.",
            exerciseCount: 0,
          },
          goalAchievement: {
            value: 0,
            explanation:
              userGoals.length === 0
                ? "Create fitness goals to track your progress and stay motivated."
                : "Work towards your active goals to improve this metric.",
            activeGoalsCount: userGoals.filter((g) => g.status === "active")
              .length,
          },
        },
        achievements: [],
        weekSummary: generateWeekSummary([]),
        strengthProgression: [],
        performanceMetrics: {
          totalVolume: {
            value: 0,
            status: "Getting Started",
            explanation:
              "Total weight lifted = sets × reps × weight across all exercises",
            previousMonth: 0,
          },
          trainingFrequency: {
            value: 0,
            status: "Getting Started",
            explanation: `Start with ${
              userGoals.find(
                (g) =>
                  g.type === "consistency" &&
                  (g.name.toLowerCase().includes("week") ||
                    g.name.toLowerCase().includes("weekly"))
              )?.targetValue || 3
            } workouts per week.`,
            target:
              userGoals.find(
                (g) =>
                  g.type === "consistency" &&
                  (g.name.toLowerCase().includes("week") ||
                    g.name.toLowerCase().includes("weekly"))
              )?.targetValue || 3,
          },
          progressiveOverload: {
            value: 0,
            status: "Getting Started",
            explanation:
              "Percentage of workouts where you increased weight, reps, or sets.",
            sessionCount: 0,
          },
        },
        currentGoals: processActiveGoals(userGoals),
        completedGoals: processCompletedGoals(userGoals),
        recentWorkouts: [],
        volumeData: generateVolumeData([]),
      });
    }

    // Basic metrics
    const workoutsCompleted = workoutSessions.length;

    // Weekly change calculation
    const thisWeekSessions = workoutSessions.filter(
      (s) => new Date(s.startTime) >= oneWeekAgo
    );
    const lastWeekSessions = workoutSessions.filter(
      (s) =>
        new Date(s.startTime) >= twoWeeksAgo &&
        new Date(s.startTime) < oneWeekAgo
    );
    const weeklyChange = thisWeekSessions.length - lastWeekSessions.length;

    // Monthly sessions
    const monthSessions = workoutSessions.filter(
      (s) => new Date(s.startTime) >= startOfMonth
    );
    const lastMonthSessions = workoutSessions.filter(
      (s) =>
        new Date(s.startTime) >= startOfLastMonth &&
        new Date(s.startTime) <= endOfLastMonth
    );

    // Calculate streak
    const currentStreak = calculateWorkoutStreak(workoutSessions);

    // Calculate training time
    const trainingTime = calculateTrainingTime(monthSessions);

    // Collect all exercise logs
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

    // Calculate strength progression
    const strengthProgression = calculateStrengthProgression(allExerciseLogs);
    const avgStrengthIncrease =
      strengthProgression.length > 0
        ? Math.round(
            strengthProgression.reduce((sum, sp) => sum + sp.percentage, 0) /
              strengthProgression.length
          )
        : 0;

    // Calculate enhanced progress metrics with explanations
    const progressMetrics: ProgressMetrics = {
      workoutConsistency: {
        value: calculateWorkoutConsistency(thisWeekSessions.length, userGoals),
        explanation: `Based on ${thisWeekSessions.length} workouts this week. Consistency is key to fitness success.`,
        target:
          userGoals.find(
            (g) =>
              g.type === "consistency" &&
              (g.name.toLowerCase().includes("week") ||
                g.name.toLowerCase().includes("weekly"))
          )?.targetValue || 3,
      },
      strengthProgression: {
        value: Math.min(avgStrengthIncrease, 100),
        explanation:
          strengthProgression.length > 0
            ? `Average strength increase across ${strengthProgression.length} exercises with tracked progress.`
            : "Complete workouts with progressive overload to track strength gains.",
        exerciseCount: strengthProgression.length,
      },
      goalAchievement: {
        value: calculateGoalAchievement(userGoals),
        explanation:
          userGoals.length === 0
            ? "Set specific fitness goals to track your progress more effectively."
            : `Progress across ${
                userGoals.filter((g) => g.status === "active").length
              } active goals.`,
        activeGoalsCount: userGoals.filter((g) => g.status === "active").length,
      },
    };

    // Generate achievements based on actual data
    const achievements = generateAchievements(
      strengthProgression,
      currentStreak,
      monthSessions.length,
      userGoals
    );

    // Calculate volume data
    const volumeData = generateVolumeData(workoutSessions);
    const volumeChange = calculateVolumeChange(
      monthSessions,
      lastMonthSessions
    );
    const lastMonthVolume = calculateVolumeForSessions(lastMonthSessions);

    // Enhanced performance metrics with intelligent handling of missing data
    const weeklyFrequencyTarget =
      userGoals.find(
        (g) =>
          g.type === "consistency" &&
          (g.name.toLowerCase().includes("week") ||
            g.name.toLowerCase().includes("weekly"))
      )?.targetValue || 3;

    // Calculate volume more intelligently
    const thisMonthVolume = calculateVolumeForSessions(monthSessions);

    // Only calculate volume change if there's meaningful data
    let volumeChangeValue = 0;
    let volumeStatus = "Getting Started";
    let volumeExplanation =
      "Complete workouts with tracked weights to see volume progress.";

    if (thisMonthVolume > 0 && lastMonthVolume > 0) {
      volumeChangeValue = volumeChange;
      volumeStatus = getVolumeStatus(volumeChange);
      volumeExplanation = `${
        volumeChange >= 0 ? "Increased" : "Decreased"
      } by ${Math.abs(
        volumeChange
      )}% from last month. Volume = total weight lifted.`;
    } else if (thisMonthVolume > 0 && lastMonthVolume === 0) {
      volumeChangeValue = 100; // First month with data
      volumeStatus = "New Start";
      volumeExplanation = `Started tracking this month! Total volume: ${Math.round(
        thisMonthVolume
      )} lbs lifted.`;
    } else if (monthSessions.length > 0) {
      volumeStatus = "Tracking Started";
      volumeExplanation =
        "Complete workouts with weight tracking to calculate volume progress.";
    }

    const performanceMetrics: PerformanceMetrics = {
      totalVolume: {
        value: volumeChangeValue,
        status: volumeStatus,
        explanation: volumeExplanation,
        previousMonth: lastMonthVolume,
      },
      trainingFrequency: {
        value: parseFloat(thisWeekSessions.length.toFixed(1)),
        status: getFrequencyStatus(
          thisWeekSessions.length,
          weeklyFrequencyTarget
        ),
        explanation: `${thisWeekSessions.length} workouts this week. ${
          weeklyFrequencyTarget > 3
            ? `Your goal is ${weeklyFrequencyTarget} sessions per week.`
            : "Optimal frequency is 3-4 sessions per week."
        }`,
        target: weeklyFrequencyTarget,
      },
      progressiveOverload: {
        value: avgStrengthIncrease,
        status: getProgressiveOverloadStatus(avgStrengthIncrease),
        explanation:
          avgStrengthIncrease > 0
            ? `${avgStrengthIncrease}% average increase in strength across tracked exercises.`
            : monthSessions.length > 0
            ? "Focus on gradually increasing weight, reps, or sets in your workouts."
            : "Complete workouts with progressive overload to track strength gains.",
        sessionCount: monthSessions.length,
      },
    };

    // Get recent completed workouts
    const recentWorkouts = workoutSessions.slice(0, 5).map((session) => ({
      id: session.id,
      name: session.workout.name,
      date: session.endTime || session.startTime,
    }));

    // Generate response with enhanced data
    const progressData = {
      metrics: {
        workoutsCompleted,
        weeklyChange,
        strengthIncrease: avgStrengthIncrease,
        streak: currentStreak,
        trainingTime,
      },
      progressMetrics,
      achievements,
      weekSummary: generateWeekSummary(workoutSessions),
      strengthProgression: strengthProgression.slice(0, 6),
      performanceMetrics,
      currentGoals: processActiveGoals(userGoals),
      completedGoals: processCompletedGoals(userGoals),
      recentWorkouts,
      volumeData,
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

// Helper functions
function calculateWorkoutStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;

  const today = new Date();
  const workoutDates = [
    ...new Set(
      sessions.map((s) => new Date(s.startTime).toISOString().split("T")[0])
    ),
  ]
    .sort()
    .reverse();

  let streak = 0;
  let currentDate = new Date(today);

  for (const workoutDate of workoutDates) {
    const workoutDateObj = new Date(workoutDate);
    const daysDiff = Math.floor(
      (currentDate.getTime() - workoutDateObj.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 1) {
      streak++;
      currentDate = workoutDateObj;
    } else if (daysDiff > 1) {
      break;
    }
  }

  return streak;
}

function calculateTrainingTime(sessions: any[]): number {
  let totalMinutes = 0;
  sessions.forEach((session) => {
    if (session.startTime && session.endTime) {
      const duration =
        (new Date(session.endTime).getTime() -
          new Date(session.startTime).getTime()) /
        (1000 * 60);
      totalMinutes += duration;
    }
  });
  return Math.round(totalMinutes / 60);
}

function calculateStrengthProgression(
  logs: ExerciseLogWithSession[]
): StrengthProgression[] {
  const exerciseMap: Record<string, ExerciseLogWithSession[]> = {};

  logs.forEach((log) => {
    if (!exerciseMap[log.exerciseId]) {
      exerciseMap[log.exerciseId] = [];
    }
    exerciseMap[log.exerciseId].push(log);
  });

  const progressions: StrengthProgression[] = [];

  Object.entries(exerciseMap).forEach(([exerciseId, exerciseLogs]) => {
    if (exerciseLogs.length >= 2) {
      const sortedLogs = exerciseLogs.sort(
        (a, b) =>
          new Date(a.session.startTime).getTime() -
          new Date(b.session.startTime).getTime()
      );

      const firstLog = sortedLogs[0];
      const lastLog = sortedLogs[sortedLogs.length - 1];

      const firstWeight =
        firstLog.weight.length > 0 ? Math.max(...firstLog.weight) : 0;
      const lastWeight =
        lastLog.weight.length > 0 ? Math.max(...lastLog.weight) : 0;

      if (firstWeight > 0 && lastWeight > firstWeight) {
        const increase = lastWeight - firstWeight;
        const percentage = Math.round((increase / firstWeight) * 100);

        progressions.push({
          exercise: firstLog.exercise?.name || "Unknown Exercise",
          previous: firstWeight,
          current: lastWeight,
          increase,
          percentage,
          progress: Math.min(percentage, 100),
        });
      }
    }
  });

  return progressions.sort((a, b) => b.percentage - a.percentage);
}

function calculateWorkoutConsistency(
  thisWeekSessions: number,
  userGoals: any[] = []
): number {
  // Look for user-defined weekly consistency goals first
  const consistencyGoals = userGoals.filter(
    (goal) => goal.type === "consistency"
  );

  const weeklyConsistencyGoal = consistencyGoals.find((goal) => {
    const name = goal.name.toLowerCase();
    return (
      name.includes("week") ||
      name.includes("weekly") ||
      (name.includes("workout") && name.includes("per week"))
    );
  });

  // Use user's goal target or default to 3 workouts per week (more realistic than 4)
  const targetWeeklyWorkouts = weeklyConsistencyGoal?.targetValue || 3;

  return Math.min(
    Math.round((thisWeekSessions / targetWeeklyWorkouts) * 100),
    100
  );
}

function calculateGoalAchievement(goals: any[]): number {
  const activeGoals = goals.filter((goal) => goal.status === "active");

  if (activeGoals.length === 0) {
    return 0; // No goals set = 0% achievement
  }

  const totalProgress = activeGoals.reduce((sum, goal) => {
    const progress = Math.min(
      (goal.currentValue / goal.targetValue) * 100,
      100
    );
    return sum + progress;
  }, 0);

  return Math.round(totalProgress / activeGoals.length);
}

function generateAchievements(
  strengthProgression: StrengthProgression[],
  streak: number,
  monthlyWorkouts: number,
  goals: any[]
): Achievement[] {
  const achievements: Achievement[] = [];

  // Strength achievement
  if (strengthProgression.length > 0) {
    const bestProgression = strengthProgression[0];
    achievements.push({
      type: "Strength PR",
      description: `${bestProgression.exercise}: +${bestProgression.increase} lbs`,
      status: "Recent",
      icon: "trophy",
    });
  }

  // Streak achievement
  if (streak > 0) {
    achievements.push({
      type: "Consistency",
      description: `${streak} day${streak > 1 ? "s" : ""} workout streak`,
      status: streak >= 7 ? "Excellent" : "Good",
      icon: "target",
    });
  }

  // Monthly volume achievement
  if (monthlyWorkouts > 0) {
    achievements.push({
      type: "Monthly Volume",
      description: `${monthlyWorkouts} workouts completed this month`,
      status:
        monthlyWorkouts >= 12
          ? "Excellent"
          : monthlyWorkouts >= 8
          ? "Good"
          : "Getting Started",
      icon: "activity",
    });
  }

  // Goal achievement
  const completedGoalsThisMonth = goals.filter(
    (goal) =>
      goal.status === "completed" &&
      goal.completedDate &&
      new Date(goal.completedDate) >=
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  if (completedGoalsThisMonth.length > 0) {
    achievements.push({
      type: "Goal Achieved",
      description: `Completed ${completedGoalsThisMonth.length} goal${
        completedGoalsThisMonth.length > 1 ? "s" : ""
      } this month`,
      status: "Completed",
      icon: "trophy",
    });
  }

  return achievements;
}

function generateWeekSummary(sessions: any[]) {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const currentDay = now.getDay() || 7;
  const workoutDates = new Set(
    sessions.map((s) => new Date(s.startTime).toISOString().split("T")[0])
  );

  const weekSummary = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - currentDay + i + 1);
    const dateStr = date.toISOString().split("T")[0];
    const today = now.toISOString().split("T")[0];

    weekSummary.push({
      day: weekDays[i],
      status:
        dateStr === today
          ? "today"
          : workoutDates.has(dateStr)
          ? "completed"
          : "planned",
    });
  }

  return weekSummary;
}

function processActiveGoals(goals: any[]) {
  return goals
    .filter((goal) => goal.status === "active")
    .map((goal) => {
      const progress = Math.min(
        Math.round((goal.currentValue / goal.targetValue) * 100),
        100
      );

      return {
        name: goal.name,
        status: progress >= 100 ? "Ready to Complete" : "In Progress",
        progress,
        current: `${goal.currentValue}${goal.type === "weight" ? " lbs" : ""}`,
        target: `Goal: ${goal.targetValue}${
          goal.type === "weight" ? " lbs" : ""
        }`,
      };
    });
}

function processCompletedGoals(goals: any[]) {
  return goals
    .filter((goal) => goal.status === "completed")
    .map((goal) => {
      const completedDate = goal.completedDate
        ? formatRelativeDate(new Date(goal.completedDate))
        : "recently";

      return {
        name: goal.name,
        completedDate,
      };
    });
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return "last month";
  return "a while ago";
}

function generateVolumeData(sessions: any[]): VolumeData[] {
  const last6Months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthSessions = sessions.filter(
      (s) =>
        new Date(s.startTime) >= monthStart && new Date(s.startTime) <= monthEnd
    );

    const volume = calculateVolumeForSessions(monthSessions);

    last6Months.push({
      name: monthStart.toLocaleDateString("en-US", { month: "short" }),
      volume,
      sessions: monthSessions.length,
    });
  }

  return last6Months;
}

function calculateVolumeForSessions(sessions: any[]): number {
  return sessions.reduce((totalVolume, session) => {
    return (
      totalVolume +
      session.exerciseLogs.reduce((sessionVolume: number, log: any) => {
        const logVolume = log.reps.reduce(
          (vol: number, rep: number, index: number) => {
            return vol + rep * (log.weight[index] || 0);
          },
          0
        );
        return sessionVolume + logVolume;
      }, 0)
    );
  }, 0);
}

function calculateVolumeChange(thisMonth: any[], lastMonth: any[]): number {
  const thisMonthVolume = calculateVolumeForSessions(thisMonth);
  const lastMonthVolume = calculateVolumeForSessions(lastMonth);

  if (lastMonthVolume === 0) {
    return thisMonthVolume > 0 ? 100 : 0;
  }

  return Math.round(
    ((thisMonthVolume - lastMonthVolume) / lastMonthVolume) * 100
  );
}

function getVolumeStatus(change: number): string {
  if (change >= 20) return "Excellent Growth";
  if (change >= 10) return "Strong Progress";
  if (change >= 5) return "Good Progress";
  if (change >= 0) return "Steady Progress";
  if (change >= -5) return "Maintaining";
  if (change >= -15) return "Slight Decline";
  return "Needs Attention";
}

function getFrequencyStatus(sessions: number, target: number = 3): string {
  const percentage = (sessions / target) * 100;

  if (sessions === 0) return "Inactive";
  if (percentage >= 120) return "Exceeding Goal";
  if (percentage >= 100) return "Goal Achieved";
  if (percentage >= 80) return "Nearly There";
  if (percentage >= 50) return "Making Progress";
  if (percentage >= 25) return "Getting Started";
  return "Just Started";
}

function getProgressiveOverloadStatus(increase: number): string {
  if (increase >= 25) return "Outstanding";
  if (increase >= 15) return "Excellent";
  if (increase >= 10) return "Very Good";
  if (increase >= 5) return "Good Progress";
  if (increase > 0) return "Some Progress";
  return "Needs Focus";
}
