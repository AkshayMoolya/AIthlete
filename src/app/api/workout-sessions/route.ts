import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Get workout sessions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const workoutSessions = await db.workoutSession.findMany({
      where: { userId: session.user.id },
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
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json(workoutSessions);
  } catch (error) {
    console.error("Error fetching workout sessions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create workout session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { workoutId, startTime, endTime, completed, notes, exerciseLogs } =
      await request.json();

    // Create the workout session with exercise logs
    const workoutSession = await db.workoutSession.create({
      data: {
        userId: session.user.id,
        workoutId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        completed,
        notes,
        exerciseLogs: {
          create: exerciseLogs.map((log: any) => ({
            exerciseId: log.exerciseId,
            sets: log.sets,
            reps: log.reps,
            weight: log.weight,
            restTime: log.restTime,
            notes: log.notes,
          })),
        },
      },
      include: {
        exerciseLogs: true,
      },
    });

    return NextResponse.json(workoutSession, { status: 201 });
  } catch (error) {
    console.error("Error creating workout session:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
