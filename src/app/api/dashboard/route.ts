import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();

    // Get recent workout sessions
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
              },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
      take: 5, // Only get the most recent 5 sessions
    });

    // Calculate weekly stats
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const weekSessions = workoutSessions.filter(
      (session) => new Date(session.startTime) >= oneWeekAgo
    );

    // Calculate monthly stats
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSessions = workoutSessions.filter(
      (session) => new Date(session.startTime) >= startOfMonth
    );

    // Calculate total time spent in workouts this week
    let totalMinutes = 0;
    let totalCalories = 0;

    weekSessions.forEach((session) => {
      if (session.startTime && session.endTime) {
        const durationMs =
          new Date(session.endTime).getTime() -
          new Date(session.startTime).getTime();
        totalMinutes += durationMs / (1000 * 60);

        // Estimate calories (simplified calculation)
        const caloriesPerMinute = 5; // Average estimate
        totalCalories += (durationMs / (1000 * 60)) * caloriesPerMinute;
      }
    });

    const totalTimeHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.round(totalMinutes % 60);
    const totalTimeFormatted = `${totalTimeHours}h ${
      remainingMinutes > 0 ? remainingMinutes + "m" : ""
    }`;

    // Fetch user goals
    const goals = await db.goal.findMany({
      where: {
        userId,
        status: "active",
      },
      orderBy: { createdAt: "desc" },
      take: 3, // Limit to 3 most recent goals
    });

    const formattedGoals = goals.map((goal) => ({
      id: goal.id,
      title: goal.name,
      current:
        goal.type === "weight"
          ? `${goal.currentValue} lbs`
          : `${goal.currentValue} times`,
      target:
        goal.type === "weight"
          ? `${goal.targetValue} lbs`
          : `${goal.targetValue} times`,
      progress: Math.min(
        Math.round((goal.currentValue / goal.targetValue) * 100),
        100
      ),
    }));

    // Calculate current streak
    const workoutDates = [
      ...new Set(
        workoutSessions.map(
          (s) => new Date(s.startTime).toISOString().split("T")[0]
        )
      ),
    ]
      .sort()
      .reverse();

    let currentStreak = 0;
    const today = now.toISOString().split("T")[0];

    if (workoutDates.length > 0) {
      const hasWorkoutToday = workoutDates[0] === today;
      currentStreak = hasWorkoutToday ? 1 : 0;

      for (let i = hasWorkoutToday ? 1 : 0; i < workoutDates.length; i++) {
        const currentDate = new Date(workoutDates[i]);
        const prevDate = new Date(workoutDates[i - 1]);

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

    // Find workout-related goals for weekly/monthly targets
    const workoutGoals = goals.filter(
      (goal) => goal.type === "consistency" || goal.type.includes("workout")
    );

    // Use goal values if available, otherwise use 0
    const weeklyProgressTarget =
      workoutGoals.find((g) => g.name.toLowerCase().includes("week"))
        ?.targetValue || 0;
    const monthlyTarget =
      workoutGoals.find((g) => g.name.toLowerCase().includes("month"))
        ?.targetValue || 0;

    // Calculate progress metrics with appropriate targets
    const weeklyProgress =
      weeklyProgressTarget > 0
        ? Math.min(
            Math.round((weekSessions.length / weeklyProgressTarget) * 100),
            100
          )
        : 0;

    const monthlyProgress =
      monthlyTarget > 0
        ? Math.min(
            Math.round((monthSessions.length / monthlyTarget) * 100),
            100
          )
        : 0;

    // Generate upcoming workouts (combine scheduled workouts and recent templates)
    // In a real app, you'd fetch scheduled workouts from the database
    // For now, we'll create placeholder data based on the user's past workouts
    const upcomingWorkouts = [];

    // Add a "rest day" for today if no workout was done today
    const hasWorkoutToday = workoutSessions.some(
      (s) => new Date(s.startTime).toISOString().split("T")[0] === today
    );

    if (!hasWorkoutToday) {
      upcomingWorkouts.push({
        id: "rest-day",
        date: "Today",
        name: "Rest Day",
        description: "Recovery and stretching",
      });
    }

    // Add upcoming workouts based on user's workout history patterns
    if (workoutSessions.length > 0) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowFormatted = `${tomorrow.getDate()}/${
        tomorrow.getMonth() + 1
      }`;

      upcomingWorkouts.push({
        id: workoutSessions[0].workoutId,
        date: tomorrowFormatted,
        name: workoutSessions[0].workout.name,
        description:
          workoutSessions[0].workout.description || "Continue your progress",
      });

      if (workoutSessions.length > 1) {
        const dayAfterTomorrow = new Date(now);
        dayAfterTomorrow.setDate(now.getDate() + 2);
        const dayAfterTomorrowFormatted = `${dayAfterTomorrow.getDate()}/${
          dayAfterTomorrow.getMonth() + 1
        }`;

        upcomingWorkouts.push({
          id: workoutSessions[1].workoutId,
          date: dayAfterTomorrowFormatted,
          name: workoutSessions[1].workout.name,
          description:
            workoutSessions[1].workout.description || "Keep up the good work",
        });
      }
    }

    // Format recent workouts for the dashboard
    const recentWorkouts = workoutSessions.map((session) => {
      let duration = 0;
      if (session.startTime && session.endTime) {
        duration = Math.round(
          (new Date(session.endTime).getTime() -
            new Date(session.startTime).getTime()) /
            (1000 * 60)
        );
      }

      // Estimate calories
      const caloriesPerMinute = 5; // Average estimate
      const calories = Math.round(duration * caloriesPerMinute);

      return {
        id: session.id,
        name: session.workout.name,
        completedAt: session.endTime || session.startTime,
        duration,
        exerciseCount: session.exerciseLogs.length,
        calories,
      };
    });

    // Build dashboard data object
    const dashboardData = {
      weeklyStats: {
        workouts: weekSessions.length,
        totalTime: totalTimeFormatted,
        calories: Math.round(totalCalories),
      },
      recentWorkouts,
      goals: formattedGoals,
      quickStats: {
        weeklyProgress,
        monthlyProgress,
        currentStreak,
        weeklyGoalCurrent: weekSessions.length,
        weeklyGoalTarget: weeklyProgressTarget,
        monthlyGoalCurrent: monthSessions.length,
        monthlyGoalTarget: monthlyTarget,
      },
      upcomingWorkouts,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
