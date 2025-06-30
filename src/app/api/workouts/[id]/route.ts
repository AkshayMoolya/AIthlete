import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  id: string;
}

// Get a specific workout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> } // Note the Promise type
) {
  try {
    const session = await auth();
    const { id } = await params; // Await the params

    const workout = await db.workout.findUnique({
      where: { id },
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
      },
    });

    if (!workout) {
      return NextResponse.json(
        { message: "Workout not found" },
        { status: 404 }
      );
    }

    // Always require authentication, then check if workout is accessible
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if the workout is public or belongs to the current user
    if (!workout.isPublic && workout.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error fetching workout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a workout
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> } // Note the Promise type
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await the params
    const { name, description, isPublic, estimatedDuration, tags, exercises } =
      await request.json();

    // First verify the workout belongs to the user
    const existingWorkout = await db.workout.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingWorkout) {
      return NextResponse.json(
        { message: "Workout not found" },
        { status: 404 }
      );
    }

    if (existingWorkout.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Update the workout
    // First, delete existing exercises to avoid duplicates
    await db.workoutExercise.deleteMany({
      where: { workoutId: id },
    });

    const workout = await db.workout.update({
      where: { id },
      data: {
        name,
        description,
        isPublic: isPublic || false,
        estimatedDuration,
        tags: tags || [],
        exercises: {
          create:
            exercises?.map((ex: any, index: number) => ({
              exerciseId: ex.exerciseId,
              order: index + 1,
              sets: ex.sets,
              reps: ex.reps, // Now handling as a single value
              weight: ex.weight,
              restTime: ex.restTime,
              notes: ex.notes,
              autoIncrease: ex.autoIncrease || false,
              increaseAmount: ex.increaseAmount,
              increaseAfterSessions: ex.increaseAfterSessions || 1,
            })) || [],
        },
      },
    });

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a workout
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> } // Note the Promise type
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await the params

    // First verify the workout belongs to the user
    const workout = await db.workout.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!workout) {
      return NextResponse.json(
        { message: "Workout not found" },
        { status: 404 }
      );
    }

    if (workout.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete the workout
    await db.workout.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
