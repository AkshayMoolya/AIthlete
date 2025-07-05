import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: {
    id: string;
  };
}

// GET a single goal by ID
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const goal = await db.goal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns the goal
      },
    });

    if (!goal) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error(`Error fetching goal ${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT (update) a goal
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, type, targetValue, currentValue, status, deadline } = await request.json();

    const updatedGoal = await db.goal.updateMany({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns the goal
      },
      data: {
        name,
        type,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
        currentValue: currentValue ? parseFloat(currentValue) : undefined,
        status,
        deadline: deadline ? new Date(deadline) : undefined,
      },
    });

    if (updatedGoal.count === 0) {
        return NextResponse.json({ message: "Goal not found or user not authorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Goal updated successfully" });
  } catch (error) {
    console.error(`Error updating goal ${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a goal
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const deletedGoal = await db.goal.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns the goal
      },
    });

    if (deletedGoal.count === 0) {
        return NextResponse.json({ message: "Goal not found or user not authorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error(`Error deleting goal ${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}