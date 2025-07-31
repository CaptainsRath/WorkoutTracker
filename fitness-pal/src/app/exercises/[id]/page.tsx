import { createConnection } from "mysql2/promise"
import { env } from "@/src/env"
import { Suspense } from 'react'
import VideoComponent from './video_component'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ id: string }>
}

// Show a single exercise
export default async function Exercise({ params }: Props) {
    const { id } = await params
    const conn = await createConnection(env.DATABASE_URL)
    const [rows, _] = await conn.execute<any[]>(
        `SELECT exers.exerciseId, exers.name, exers.description, JSON_ARRAYAGG(musc.name) AS muscles
         FROM Exercises exers
         JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId 
         JOIN Muscles musc ON ems.muscleId = musc.muscleId
         WHERE exers.exerciseId = ?
         GROUP BY exers.exerciseId, exers.name, exers.description`,
        [Number(id)]
    )
    await conn.end();

    if (rows.length === 0) {
        notFound();
    }

    const exercise = rows[0];

    const name = exercise.name;
    const desc = exercise.description;
    const muscles: string[] = exercise.muscles ?? [];

    const showMuscles = !(muscles.length === 1 && muscles[0] === "name\r");

    return (
        <main className='w-full h-full flex-wrap bg-emerald-700 rounded'>
            <h1 className='font-bold w-full text-center'>EXERCISE ROUTE {id}</h1>
            <h1 className='font-bold w-full text-center'>{name}</h1>
            <p className='font-semibold w-full text-center'>{desc}</p>
            
            {showMuscles && (
                <div className='w-full text-center mt-4'>
                    <h2 className='font-bold'>Targeted Muscles:</h2>
                    <p className='font-semibold'>{muscles.join(', ')}</p>
                </div>
            )}

            <Suspense fallback={<p>Loading video...</p>}>
                <VideoComponent exerciseName={name} />
            </Suspense>
        </main>
    )
}