import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { exerciseUnits } = await request.json();

    // Store the exercise units in user metadata
    await db.user.update({
      where: { id: session.user.id },
      data: {
        exerciseUnitPreferences: exerciseUnits,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving exercise units:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
