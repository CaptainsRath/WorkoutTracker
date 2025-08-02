import { NextRequest, NextResponse } from 'next/server'
import { createConnection } from 'mysql2/promise'
import { env } from '@/src/env'
import { ResultSetHeader } from 'mysql2/promise'

export async function POST(req: NextRequest) {
  const userId = 1 // TODO: Replace with cookie or something later
  const now = new Date();

  const conn = await createConnection(env.DATABASE_URL);

  const [insertResults] = await conn.execute<ResultSetHeader>(
      "INSERT INTO WorkoutTemplates(userId, lastDate, name) VALUES(?, ?, 'New Workout Template');",
      [userId, now]
  );
  await conn.end();

  return NextResponse.json({ workoutId: insertResults.insertId }, { status: 201 })
}
