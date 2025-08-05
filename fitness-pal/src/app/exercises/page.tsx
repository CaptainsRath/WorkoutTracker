import { createConnection, RowDataPacket } from "mysql2/promise";
import { env } from "@/src/env";
import GenericCard from '@/src/components/genericCard';
import DeleteCard from "@/src/components/deleteCard";
import Link from "next/link";
import ExerciseSearch from '@/src/components/ExerciseSearch';
import { auth } from "@/src/utils/auth";
import { redirect } from "next/navigation";

interface ExerciseData {
    exerciseId: number;
    name: string;
    muscles: string[];
    ownerId: number | null;
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

    const session = await auth();
    if (!session?.user?.id) {
        // Redirect to sign-in, but come back to the exercises page
        redirect("/api/auth/signin?callbackUrl=/exercises");
    }
    const ownerId = session.user.id;

    const conn = await createConnection(env.DATABASE_URL);

    const [muscles] = await conn.execute<MuscleData[] & RowDataPacket[]>(
        'SELECT muscleId, name FROM Muscles ORDER BY name ASC'
    );

    const query = `
        SELECT
            exers.exerciseId, exers.name, exers.ownerId,
            JSON_ARRAYAGG(musc.name) AS muscles
        FROM Exercises exers
        JOIN ExercisesMuscles ems ON ems.exerciseId = exers.exerciseId
        JOIN Muscles musc ON ems.muscleId = musc.muscleId
        WHERE
            (exers.ownerId IS NULL OR exers.ownerId = ?)
            AND (? = '' OR FIND_IN_SET(musc.muscleId, ?))
            AND (? = '' OR MATCH(exers.name, exers.description) AGAINST(?))
        GROUP BY exers.exerciseId, exers.name, exers.ownerId
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
            <div className="flex justify-center items-center p-4">
                <h1 className='font-bold text-xl'>EXERCISES</h1>
            </div>
            <div className="flex justify-center items-center pb-4 gap-2">
                <div className="w-full max-w-4xl">
                    <ExerciseSearch
                        initialSearchTerm={keywords}
                        initialSelectedMuscle={muscleIds}
                        muscles={muscles}
                    />
                </div>
                <Link href="/exercises/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap">
                    Create Exercise
                </Link>
            </div>
            { (keywords || muscleIds) && (
                <p className='text-center text-white mb-2'>
                    Found {exercises.length} results.
                </p>
            )}
            <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-emerald-500'>
                {exercises?.map((exercise) => {
                    const displayableMuscles = exercise.muscles?.filter(muscle => muscle !== "name\r") || [];
                    const cardContent = (                        <div className="flex flex-col">
                            <span className="font-bold">{exercise.name}</span>
                            
                            {displayableMuscles.length > 0 && (
                                <span className="text-sm italic text-gray-200">
                                    {displayableMuscles.join(', ')}
                                </span>
                            )}
                        </div>
                    );

                    if (exercise.ownerId === Number(ownerId)) {
                        // This is a user-owned exercise, so we render it with a delete button.
                        return (
                            <DeleteCard
                                href={`/exercises/${exercise.exerciseId}`}
                                key={exercise.exerciseId}
                                workoutId={exercise.exerciseId}
                                userId={Number(ownerId)}
                                deleteRoute="/api/exercises/delete"
                                buttonBgClass="bg-emerald-700"
                                title="Delete exercise"
                            >
                                {cardContent}
                            </DeleteCard>
                        );
                    }

                    // This is a public exercise, render it without a delete button.
                    return (
                        <GenericCard href={`/exercises/${exercise.exerciseId}`} key={exercise.exerciseId}>
                            {cardContent}
                        </GenericCard>
                    )
                })}
            </section>
            {exercises.length === 0 && (keywords || muscleIds) && (
                <p className='text-center text-white'>No exercises found matching your criteria.</p>
            )}
        </main>
    );
}