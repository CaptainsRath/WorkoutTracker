// src/app/exercises/page.tsx

import { createConnection } from "mysql2/promise";
import { env } from "@/src/env";
import GenericCard from '@/src/components/genericCard';

// Define a type for the data you expect from the DB
interface ExerciseData {
    exerciseId: number;
    name: string;
}

// Define the props type for the page component
interface ExercisesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Exercises({ searchParams }: ExercisesPageProps) {
    const resolvedSearchParams = await searchParams;

    // Get the search term from searchParams
    const searchTerm = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';
    
    console.log('Search term:', searchTerm); 

    const conn = await createConnection(env.DATABASE_URL);
    
    let query = 'SELECT exerciseId, name FROM Exercises';
    const queryParams: string[] = [];
    
    if (searchTerm && searchTerm.trim()) {
        query += ` WHERE (ownerId = 1 OR ownerId IS NULL) AND name LIKE ?`;
        queryParams.push(`%${searchTerm.trim()}%`);
        console.log('Query with search:', query, queryParams); 
    }
    
    query += ' ORDER BY exerciseId ASC';
    
    //Type error shows here, no idea why but it still works
    const [exercises, _] = await conn.execute<ExerciseData[]>(query, queryParams);
    await conn.end();

    console.log('Found exercises:', exercises.length); 

    return (
        <main className='w-full h-fit flex-wrap bg-emerald-700 rounded'>
            <h1 className='font-bold w-full text-center'>EXERCISES</h1>
            {searchTerm && (
                <p className='text-center text-white mb-2'>
                    Search results for: "{searchTerm}" ({exercises.length} found)
                </p>
            )}
            <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-emerald-500'>
                {exercises?.map((exercise) => {
                    return (
                        <GenericCard href={`/exercises/${exercise.exerciseId}`} key={exercise.exerciseId}>
                            {exercise.name}
                        </GenericCard>
                    )
                })}
            </section>
            {exercises.length === 0 && searchTerm && (
                <p className='text-center text-white'>No exercises found matching "{searchTerm}"</p>
            )}
        </main>
    )
}