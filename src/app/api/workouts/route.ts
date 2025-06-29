import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get("public") === "true";
    const userId = searchParams.get("userId");

    // If not requesting public workouts, ensure user is authenticated
    if (!isPublic && !session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const workouts = await db.workout.findMany({
      where: {
        ...(isPublic ? { isPublic: true } : { userId: session?.user?.id }),
        ...(userId && { userId }),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { sessions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, description, isPublic, estimatedDuration, tags, exercises } =
      await request.json();

    const workout = await db.workout.create({
      data: {
        name,
        description,
        isPublic: isPublic || false,
        estimatedDuration,
        tags: tags || [],
        userId: session.user.id,
        exercises: {
          create:
            exercises?.map((ex: any, index: number) => ({
              exerciseId: ex.exerciseId,
              order: index + 1,
              sets: ex.sets,
              reps: Array.isArray(ex.reps) ? ex.reps : [ex.reps], // Ensure reps is always an array
              weight: ex.weight,
              restTime: ex.restTime,
              notes: ex.notes,
              autoIncrease: ex.autoIncrease || false,
              increaseAmount: ex.increaseAmount,
              increaseAfterSessions: ex.increaseAfterSessions || 1,
            })) || [],
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
