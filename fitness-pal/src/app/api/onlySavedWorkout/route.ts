import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from 'mysql2/promise';
import { env } from '@/src/env';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { workoutId, workoutData, exercises } = body;
        const userId = 1; // TODO: Use actual user ID

        const conn = await createConnection(env.DATABASE_URL);

        // Call the stored procedure
        await conn.execute(
          'CALL UpdateInsertCompletedWorkout(?, ?, ?, ?)',
          [
            parseInt(workoutId),
            userId,
            JSON.stringify(workoutData),
            JSON.stringify(exercises),
          ]
        );

        await conn.end();

        return NextResponse.json({ message: 'Workout Template has been saved' }, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/completedWorkout:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}