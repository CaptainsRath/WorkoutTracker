// c:/Users/Rami SCHOOL/Desktop/su25-cs411-team007-FutureLegends/fitness-pal/src/app/api/workouts/[workoutId]/end/route.ts
import { env } from "@/src/env";
import { createConnection, Connection } from "mysql2/promise";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: any // Using `any` to bypass a Next.js type-checking bug in older versions
) {
  let conn: Connection | undefined;
  try {
    const { duration } = await request.json();
    const { workoutId } = context.params as { workoutId: string };
    const userId = 1; // TODO: Get this from an auth session

    if (duration === undefined || !workoutId) {
      return NextResponse.json(
        { error: "Missing duration or workoutId" },
        { status: 400 }
      );
    }

    conn = await createConnection(env.DATABASE_URL);

    console.log(
      `Ending workout ${workoutId} for user ${userId} with duration ${duration}s`
    );

    const now = new Date();
    await conn.execute(
      "UPDATE WorkoutTemplates SET lastDuration = ?, lastDate = ? WHERE workoutId = ? AND userId = ?",
      [duration, now, workoutId, userId]
    );

    revalidatePath("/dashboard");
    revalidatePath("/workouts");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error ending workout:", error);
    return NextResponse.json(
      { error: "Failed to end workout" },
      { status: 500 }
    );
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}
