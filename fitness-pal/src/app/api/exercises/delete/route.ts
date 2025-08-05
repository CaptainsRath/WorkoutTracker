import { env } from "@/src/env";
import { createConnection, Connection, ResultSetHeader } from "mysql2/promise";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  let conn: Connection | undefined;
  try {
    // The DeleteCard component sends `workoutId` as the key.
    // We are reusing it here, but it represents `exerciseId`.
    const { workoutId: exerciseId, userId } = await request.json();

    if (!exerciseId || !userId) {
      return NextResponse.json(
        { message: "Missing exerciseId or userId" },
        { status: 400 }
      );
    }

    conn = await createConnection(env.DATABASE_URL);
    await conn.beginTransaction();

    // Then, delete from the junction table `ExercisesMuscles`
    await conn.execute(
        'DELETE FROM ExercisesMuscles WHERE exerciseId = ?',
        [exerciseId]
    );

    // Finally, delete the exercise itself, ensuring the owner matches.
    const [result] = await conn.execute<ResultSetHeader>(
      'DELETE FROM Exercises WHERE exerciseId = ? AND ownerId = ?',
      [exerciseId, userId]
    );

    if (result.affectedRows === 0) {
        await conn.rollback();
        return NextResponse.json({ message: "Exercise not found or you don't have permission to delete it." }, { status: 404 });
    }

    await conn.commit();

    revalidatePath('/exercises');
    return NextResponse.json({ success: true });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error deleting exercise:", error);
    return NextResponse.json({ message: "Failed to delete exercise" }, { status: 500 });
  } finally {
    if (conn) await conn.end();
  }
}