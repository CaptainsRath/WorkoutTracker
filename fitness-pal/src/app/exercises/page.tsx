import { createConnection, RowDataPacket } from "mysql2/promise";
import { env } from "@/src/env";
import GenericCard from '@/src/components/genericCard';
import ExerciseSearch from '@/src/components/ExerciseSearch';

interface ExerciseData {
    exerciseId: number;
    name: string;
    muscles: string[];
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
    const keywords = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';
    const muscleIds = typeof resolvedSearchParams.muscle === 'string' ? resolvedSearchParams.muscle : '';
    const ownerId = 1;

    const conn = await createConnection(env.DATABASE_URL);

    const [muscles] = await conn.execute<MuscleData[] & RowDataPacket[]>(
        'SELECT muscleId, name FROM Muscles ORDER BY name ASC'
    );

    const query = `
        SELECT
            exers.exerciseId, exers.name,
            JSON_ARRAYAGG(musc.name) AS muscles
        FROM Exercises exers
        JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId
        JOIN Muscles musc ON ems.muscleId = musc.muscleId
        WHERE
            (exers.ownerId IS NULL OR exers.ownerId = ?)
            AND (? = '' OR FIND_IN_SET(musc.muscleId, ?))
            AND (? = '' OR MATCH(exers.name, exers.description) AGAINST(?))
        GROUP BY exers.exerciseId, exers.name
        ORDER BY
            CASE WHEN ? != '' THEN MATCH(exers.name, exers.description) AGAINST(?) ELSE 0 END DESC,
            exers.exerciseId ASC
    `;

    const queryParams = [
        ownerId,         
        muscleIds,       
        muscleIds,       
        keywords,        
        keywords,        
        keywords,        
        keywords,        
    ];

    const [exercises] = await conn.execute<ExerciseData[] & RowDataPacket[]>(query, queryParams);
    await conn.end();

    return (
        <main className='w-full h-fit flex-wrap bg-emerald-700 rounded'>
            <h1 className='font-bold w-full text-center'>EXERCISES</h1>
            <ExerciseSearch
                initialSearchTerm={keywords}
                initialSelectedMuscle={muscleIds}
                muscles={muscles}
            />
            { (keywords || muscleIds) && (
                <p className='text-center text-white mb-2'>
                    Found {exercises.length} results.
                </p>
            )}
            <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-emerald-500'>
                {exercises?.map((exercise) => {
                    const displayableMuscles = exercise.muscles?.filter(muscle => muscle !== "name\r") || [];

                    return (
                        <GenericCard href={`/exercises/${exercise.exerciseId}`} key={exercise.exerciseId}>
                            <div className="flex flex-col p-2">
                                <span className="font-bold">{exercise.name}</span>
                                
                                {displayableMuscles.length > 0 && (
                                    <span className="text-sm italic text-gray-200">
                                        {displayableMuscles.join(', ')}
                                    </span>
                                )}
                            </div>
                        </GenericCard>
                    );
                })}
            </section>
            {exercises.length === 0 && (keywords || muscleIds) && (
                <p className='text-center text-white'>No exercises found matching your criteria.</p>
            )}
        </main>
    );
}