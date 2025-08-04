'use server';

import { createConnection, RowDataPacket, Connection } from 'mysql2/promise';
import { env } from '@/src/env';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { notFound } from 'next/navigation';
import { EditExerciseForm } from './EditExerciseForm';

const UpdateExerciseSchema = z.object({
    name: z.string().min(1, "Name is required."),
    description: z.string().optional(),
    muscles: z.array(z.string()).min(1, "At least one muscle must be selected."),
});

export type State = {
    errors?: {
        name?: string[];
        description?: string[];
        muscles?: string[];
    };
    message?: string | null;
};

export async function updateExercise(exerciseId: number, prevState: State, formData: FormData): Promise<State> {
    const validatedFields = UpdateExerciseSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        muscles: formData.getAll('muscles'),
    });
    
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Failed to update exercise. Please check the fields.',
        };
    }

    const { name, description, muscles } = validatedFields.data;
    const ownerId = 1; // TODO: Get from auth session

    let conn: Connection | undefined;
    try {
        conn = await createConnection(env.DATABASE_URL);
        await conn.beginTransaction();

        // Check if user owns the exercise before updating
        const [ownerCheck] = await conn.execute<RowDataPacket[]>(
            'SELECT ownerId FROM Exercises WHERE exerciseId = ?',
            [exerciseId]
        );

        if (ownerCheck.length === 0 || ownerCheck[0].ownerId !== ownerId) {
            await conn.rollback();
            return { message: 'Error: You do not have permission to edit this exercise.' };
        }

        // Update exercise details
        await conn.execute(
            'UPDATE Exercises SET name = ?, description = ? WHERE exerciseId = ? AND ownerId = ?',
            [name, description, exerciseId, ownerId]
        );

        // Delete old muscle associations
        await conn.execute('DELETE FROM ExercisesMuscles WHERE exerciseId = ?', [exerciseId]);

        // Insert new muscle associations
        const muscleValues = muscles.map(muscleId => [exerciseId, parseInt(muscleId, 10)]);
        if (muscleValues.length > 0) {
            await conn.query('INSERT INTO ExercisesMuscles (exerciseId, muscleId) VALUES ?', [muscleValues]);
        }

        await conn.commit();
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Database error:', error);
        return { message: 'Database Error: Failed to update exercise.' };
    } finally {
        if (conn) await conn.end();
    }

    revalidatePath('/exercises');
    revalidatePath(`/exercises/${exerciseId}`);
    redirect(`/exercises/${exerciseId}`);
}

export interface ExerciseData extends RowDataPacket {
    exerciseId: number;
    name: string;
    description: string;
    ownerId: number;
    muscleIds: number[];
}

export interface MuscleData extends RowDataPacket {
    muscleId: number;
    name: string;
}

export default async function EditExercisePage({ params }: { params: { id: string } }) {
    const exerciseId = Number(params.id);
    const userId = 1; // TODO: Get from auth session

    const conn = await createConnection(env.DATABASE_URL);
    
    const [exerciseRows] = await conn.execute<ExerciseData[]>(
        `SELECT e.exerciseId, e.name, e.description, e.ownerId, (SELECT JSON_ARRAYAGG(em.muscleId) FROM ExercisesMuscles em WHERE em.exerciseId = e.exerciseId) as muscleIds FROM Exercises e WHERE e.exerciseId = ? AND e.ownerId = ?`,
        [exerciseId, userId]
    );

    if (exerciseRows.length === 0) notFound();
    const exercise = exerciseRows[0];
    if (!exercise.muscleIds) exercise.muscleIds = [];

    const [allMuscles] = await conn.execute<MuscleData[]>('SELECT muscleId, name FROM Muscles ORDER BY name ASC');
    await conn.end();

    return <EditExerciseForm exercise={exercise} allMuscles={allMuscles} />;
}

