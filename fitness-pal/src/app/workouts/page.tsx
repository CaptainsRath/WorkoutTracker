export const dynamic = 'force-dynamic'; // Needed to make the cards reload if the back button is pressed after a card is deleted

import { env } from "@/src/env";
import { createConnection, RowDataPacket, Connection } from "mysql2/promise";
import DeleteCard from '@/src/components/deleteCard'
import CreateWorkoutButton from '@/src/components/CreateWorkoutButton'

// DB data used for the cards
interface WorkoutTemplateData extends RowDataPacket {
    workoutId: number;
    lastDate: Date;
    name: string;
}

function getTimeSince(date: Date): string {
    const now = new Date();
    const secondsSince = (now.getTime() - date.getTime()) / 1000;
    
    // seconds is the amount of 1 full unit of specified time in seconds
    const timeVars = [
        {unit: "year",   seconds: 60 * 60 * 24 * 365},
        {unit: "week",   seconds: 60 * 60 * 24 * 7},
        {unit: "day",    seconds: 60 * 60 * 24},
        {unit: "hour",   seconds: 60 * 60},
        {unit: "minute", seconds: 60},
        {unit: "second", seconds: 1},
    ]

    // Return the time since in the greatest unit of time
    for (const currVar of timeVars) {
        const amount = Math.floor(secondsSince / currVar.seconds);
        if (amount > 0) {
            var timeStr = currVar.unit;
            if (amount > 1) timeStr = `${timeStr}s`;
            return `About ${amount} ${timeStr} ago`;
        }
    }
    return "Now"
}

// Shows all workouts
export default async function Workouts() {
    let conn: Connection | undefined;
    try {
        conn = await createConnection(env.DATABASE_URL);
        // Query for the ID and name of all exercises
        const userId = 1; // TODO: replace with a paramter passed into the file
        const [workoutTemplates] = await conn.execute<WorkoutTemplateData[]>(
            `SELECT workoutId, lastDate, name 
            FROM WorkoutTemplates 
            WHERE userId = ? 
            ORDER BY lastDate DESC`,
            [userId]
        );
        
        return (
            <main className='w-full h-fit flex-wrap bg-blue-700 rounded'>
                <h1 className='font-bold w-full text-center'>WORKOUTS</h1>
                <div className="text-center my-4">
                    <CreateWorkoutButton/>
                </div>
                <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-blue-500'>
                    {workoutTemplates.map((workoutTemplate) => {
                        return (
                            <DeleteCard
                                href={`/workouts/${workoutTemplate.workoutId}`}
                                key={workoutTemplate.workoutId}
                                workoutId={workoutTemplate.workoutId}
                                userId={userId}
                                deleteRoute="/api/deleteWorkout"
                            >
                                <div className="font-bold">{workoutTemplate.name}</div>
                                <div className="text-sm text-gray-100">{getTimeSince(workoutTemplate.lastDate)}</div>
                            </DeleteCard>
                        )
                    })}
                </section>
            </main>
        )
    } catch (error) {
        console.error("Failed to fetch workouts:", error);
        return (
            <main className='w-full h-fit flex-wrap bg-red-700 rounded p-4'>
                <h1 className='font-bold w-full text-center text-white'>Error</h1>
                <p className="text-center text-white">Could not load workouts. Please try again later.</p>
            </main>
        );
    } finally {
        if (conn) await conn.end();
    }
}