import { createConnection } from "mysql2/promise"
import { env } from "@/src/env"
import { Suspense } from 'react'
import VideoComponent from './video_component'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
    params: { id: string }
}

// Show a single exercise
export default async function Exercise({ params }: Props) {
    const { id } = params;
    // In a real application, this would come from an authentication session
    const currentUserId = 1; 

    const conn = await createConnection(env.DATABASE_URL)
    const [rows, _] = await conn.execute<any[]>(
        `SELECT exers.exerciseId, exers.name, exers.description, exers.ownerId, JSON_ARRAYAGG(musc.name) AS muscles
         FROM Exercises exers
         JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId 
         JOIN Muscles musc ON ems.muscleId = musc.muscleId
         WHERE exers.exerciseId = ? AND (exers.ownerId = ? OR exers.ownerId IS NULL)
         GROUP BY exers.exerciseId, exers.name, exers.description, exers.ownerId`,
        [Number(id), currentUserId]
    )
    await conn.end();

    if (rows.length === 0) {
        notFound();
    }

    const exercise = rows[0];
    const isOwner = exercise.ownerId === currentUserId;

    const name = exercise.name;
    const desc = exercise.description;
    const muscles: string[] = exercise.muscles ?? [];

    const showMuscles = !(muscles.length === 1 && muscles[0] === "name\r");

    return (
        <main className='w-full h-full flex-wrap bg-emerald-700 rounded'>
            <div className="flex justify-between items-center p-4 gap-4">
                <div className="flex-1"></div> {/* Left Spacer */}
                <h1 className='font-bold text-center text-2xl flex-grow'>{name}</h1>
                <div className="flex-1 text-right">
                    {isOwner && (
                        <Link href={`/exercises/${id}/edit`} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded whitespace-nowrap">
                            Edit Exercise
                        </Link>
                    )}
                </div>
            </div>
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