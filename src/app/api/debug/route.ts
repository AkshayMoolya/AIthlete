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

    // Get basic user data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        goals: true,
        workouts: {
          take: 5,
          include: {
            sessions: {
              take: 3,
              include: {
                exerciseLogs: true,
              },
            },
          },
        },
      },
    });

    // Get workout sessions for debugging
    const workoutSessions = await db.workoutSession.findMany({
      where: { userId },
      take: 10,
      orderBy: { startTime: "desc" },
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
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      userId,
      userName: user?.name,
      userEmail: user?.email,
      totalGoals: user?.goals?.length || 0,
      goals: user?.goals || [],
      totalWorkouts: user?.workouts?.length || 0,
      totalWorkoutSessions: workoutSessions?.length || 0,
      workoutSessions: workoutSessions,
      recentSessions: workoutSessions.slice(0, 5),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { message: "Debug error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
