import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workoutSession = await db.workoutSession.findUnique({
      where: { id },
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
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!workoutSession) {
      return NextResponse.json(
        { message: "Workout session not found" },
        { status: 404 }
      );
    }

    // Check if this session belongs to the current user
    if (workoutSession.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(workoutSession);
  } catch (error) {
    console.error("Error fetching workout session:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First verify the workout session belongs to the user
    const workoutSession = await db.workoutSession.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!workoutSession) {
      return NextResponse.json(
        { message: "Workout session not found" },
        { status: 404 }
      );
    }

    if (workoutSession.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Delete the workout session
    await db.workoutSession.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Workout session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workout session:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
