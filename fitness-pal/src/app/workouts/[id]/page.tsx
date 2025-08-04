// This route implements dynamic nextjs routinig
import { env } from "@/src/env";
import { createConnection, RowDataPacket } from "mysql2/promise";
import { notFound } from "next/navigation";
import WorkoutTracker from "@/src/components/WorkoutTracker";

interface Props {
    params: { id: string }
}

interface WorkoutTemplate extends RowDataPacket {
    name: string;
}

// Show a single exercise
export default async function Workout({ params }: Props) {
    const { id } = await params;

    const conn = await createConnection(env.DATABASE_URL);
    const [rows] = await conn.execute<WorkoutTemplate[]>(
        'SELECT name FROM WorkoutTemplates WHERE workoutId = ?',
        [id]
    );
    await conn.end();

    if (rows.length === 0) {
        notFound();
    }

    const workoutName = rows[0].name;

    return (
        <main className='w-full h-full flex-wrap bg-blue-700 rounded'>
            <WorkoutTracker workoutId={id} workoutName={workoutName} />
        </main>
    )
}
