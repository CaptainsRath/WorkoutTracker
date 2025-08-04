'use server';

import { createConnection, RowDataPacket, Connection } from 'mysql2/promise';
import { env } from '@/src/env';
import { revalidatePath } from 'next/cache';
import { CreateExerciseForm } from './CreateExerciseForm';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const CreateExerciseSchema = z.object({
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

export async function createExercise(prevState: State, formData: FormData): Promise<State> {
    const validatedFields = CreateExerciseSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        muscles: formData.getAll('muscles'),
    });
    
    if (!validatedFields.success) {
        console.log("Validation failed", validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Failed to create exercise. Please check the fields.',
        };
    }

    const { name, description, muscles } = validatedFields.data;
    // In a real application, you would get this from your authentication system
    const ownerId = 1;

    let conn: Connection | undefined;
    try {
        conn = await createConnection(env.DATABASE_URL);
        await conn.beginTransaction();

        const [result] = await conn.execute(
            'INSERT INTO Exercises (name, description, ownerId) VALUES (?, ?, ?)',
            [name, description, ownerId]
        );

        const exerciseId = (result as any).insertId;

        const muscleValues = muscles.map(muscleId => [exerciseId, parseInt(muscleId, 10)]);
        await conn.query('INSERT INTO ExercisesMuscles (exerciseId, muscleId) VALUES ?', [muscleValues]);

        await conn.commit();
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Database error:', error);
        return { message: 'Database Error: Failed to create exercise.' };
    } finally {
        if (conn) await conn.end();
    }

    revalidatePath('/exercises');
    redirect('/exercises');
}

interface MuscleData extends RowDataPacket {
    muscleId: number;
    name: string;
}

export default async function CreateExercisePage() {
    let conn: Connection | undefined;
    let muscles: MuscleData[] = [];
    try {
        conn = await createConnection(env.DATABASE_URL);
        [muscles] = await conn.execute<MuscleData[]>(
            'SELECT muscleId, name FROM Muscles ORDER BY name ASC'
        );
    } catch (error) {
        console.error("Failed to fetch muscles for create page:", error);
        return <p className="text-center text-white p-4">Could not load page data. Please try again later.</p>;
    } finally {
        if (conn) await conn.end();
    }

    return (
        <CreateExerciseForm muscles={muscles} />
    );
}