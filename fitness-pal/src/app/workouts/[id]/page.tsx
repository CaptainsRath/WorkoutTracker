// This route implements dynamic nextjs routing

import { env } from "@/src/env";
import { createConnection } from "mysql2/promise";
import EditableWorkout from '@/src/components/EditableWorkout';
import OnlySaveWorkoutButton from '@/src/components/OnlySaveWorkoutButton';
import WorkoutTracker from "@/src/components/WorkoutTracker";

interface Props {
    params: Promise<{ id: number }>
}

// DB data used for the cards
interface WorkoutData {
    lastDate: Date;
    name: string;
    lastDuration: number;
}

interface ExerciseData {
    exerciseId: number;
    name: string;
    like: boolean | null;
    order: number;
    sets: SetData[];
}

interface SetData {
    setId: number;
    order: number;
    lbs: number;
    reps: number;
}

// Show a single exercise
export default async function Workout({ params }: Props) {
    const { id } = await params
    const userId = 1; // TODO: replace with a parameter passed into the file
    let workoutData;
    let exercisesData;

    // Create a transaction to ensure we have a read lock for both queries to execute
    const conn = await createConnection(env.DATABASE_URL);
    try {
        await conn.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        await conn.query('START TRANSACTION');
    
        const [workout] = await conn.execute<WorkoutData[]>(
            `SELECT lastDate, name, lastDuration
            FROM WorkoutTemplates
            WHERE userId = ? and workoutId = ?`,
            [userId, id]
        );
        const [exercises] = await conn.execute<ExerciseData[]>(
            `SELECT exers.exerciseId, exers.name, eLog.\`like\`, conts.\`order\`,
                JSON_ARRAYAGG(
                    JSON_OBJECT('setId', s.setId, 'order', s.\`order\`, 'lbs', s.lbs, 'reps', s.reps)
                ) AS sets
            FROM WorkoutContents conts
            LEFT JOIN Exercises exers ON exers.exerciseId = conts.exerciseId
            LEFT JOIN ExerciseLog eLog ON eLog.userId = conts.userId AND eLog.exerciseId = exers.exerciseId
            LEFT JOIN (SELECT setId, userId, exerciseId, \`order\`, lbs, reps 
                    FROM Sets 
                    ORDER BY \`order\`) s 
                ON s.userId = eLog.userId AND s.exerciseId = eLog.exerciseId
            WHERE conts.userId = ? AND conts.workoutId = ?
            GROUP BY exers.exerciseId, exers.name, eLog.\`like\`, conts.\`order\`
            ORDER BY conts.\`order\``,
            [userId, id]
        );
        workoutData = workout;
        exercisesData = exercises;

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        console.error('Transaction failed on Workouts (Workout List) page', error);
        throw error;
    } finally {
        await conn.end();
    }

    return (<div className="mt-4 text-center">
        <WorkoutTracker workoutId={id} workoutName={workoutData.name} />
        <EditableWorkout 
                workoutId = {id} 
                userId = {userId} 
                workoutData = {workoutData} 
                exercises={exercisesData} 
        />
        <OnlySaveWorkoutButton workoutId={id} />
    </div>);
}