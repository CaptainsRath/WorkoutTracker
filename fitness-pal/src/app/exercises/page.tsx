import { createConnection, RowDataPacket } from "mysql2/promise";
import { env } from "@/src/env";
import GenericCard from '@/src/components/genericCard';
import ExerciseSearch from '@/src/components/ExerciseSearch';

interface ExerciseData {
    exerciseId: number;
    name: string;
}
interface MuscleData {
    muscleId: number;
    name: string;
}
interface ExercisesPageProps {
    searchParams: Promise<{ [key:string]: string | string[] | undefined }>
}


export default async function Exercises({ searchParams }: ExercisesPageProps) {
    const resolvedSearchParams = await searchParams;
    const searchTerm = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';
    const muscleId = typeof resolvedSearchParams.muscle === 'string' ? resolvedSearchParams.muscle : '';

    const conn = await createConnection(env.DATABASE_URL);

    const [muscles] = await conn.execute<MuscleData[] & RowDataPacket[]>(
        'SELECT muscleId, name FROM Muscles ORDER BY name ASC'
    );

    const query = `
        SELECT E.exerciseId, E.name
        FROM Exercises E
        LEFT JOIN ExercisesMuscles EM ON E.exerciseId = EM.exerciseId
        LEFT JOIN Muscles M ON EM.muscleId = M.muscleId
        WHERE
            (E.ownerId = 1 OR E.ownerId IS NULL)
            AND (? = '' OR E.name LIKE ?)
            AND (? = '' OR EM.muscleId = ?)
        GROUP BY E.exerciseId, E.name
        ORDER BY E.exerciseId ASC;
    `;

    const queryParams = [
        searchTerm,        
        `%${searchTerm}%`, 
        muscleId,          
        muscleId           
    ];

    const [exercises] = await conn.execute<ExerciseData[] & RowDataPacket[]>(query, queryParams);
    await conn.end();

    return (
        <main className='w-full h-fit flex-wrap bg-emerald-700 rounded'>
            <h1 className='font-bold w-full text-center'>EXERCISES</h1>
            <ExerciseSearch
                initialSearchTerm={searchTerm}
                initialSelectedMuscle={muscleId}
                muscles={muscles}
            />
            { (searchTerm || muscleId) && (
                <p className='text-center text-white mb-2'>
                    Found {exercises.length} results.
                </p>
            )}
            <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-emerald-500'>
                {exercises?.map((exercise) => (
                    <GenericCard href={`/exercises/${exercise.exerciseId}`} key={exercise.exerciseId}>
                        {exercise.name}
                    </GenericCard>
                ))}
            </section>
            {exercises.length === 0 && (searchTerm || muscleId) && (
                <p className='text-center text-white'>No exercises found matching your criteria.</p>
            )}
        </main>
    );
}