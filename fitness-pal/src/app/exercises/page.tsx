// src/app/exercises/page.tsx

import { createConnection } from "mysql2/promise";
import { env } from "@/src/env";
import GenericCard from '@/src/components/genericCard';

// Define a type for the data you expect from the DB
interface ExerciseData {
    exerciseId: number;
    name: string;
}

// Shows all exercises by fetching them from the database
export default async function Exercises() {
    const conn = await createConnection(env.DATABASE_URL);
    // Query for the ID and name of all exercises
    const [exercises, _] = await conn.execute<any[]>(
        'SELECT exerciseId, name FROM Exercises ORDER BY exerciseId ASC'
    );
    await conn.end();

    return (
        <main className='w-full h-fit flex-wrap bg-emerald-700 rounded'>
            <h1 className='font-bold w-full text-center'>EXERCISES</h1>
            <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-emerald-500'>
                {/* Map over the fetched exercises instead of a static array */}
                {exercises.map((exercise) => {
                    return (
                        <GenericCard href={`/exercises/${exercise.exerciseId}`} key={exercise.exerciseId}>
                            {/* Display the exercise name */}
                            {exercise.name}
                        </GenericCard>
                    )
                })}
            </section>
        </main>
    )
}