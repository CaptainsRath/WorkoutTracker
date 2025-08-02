'use client'

import Link from 'next/link'
import { useState } from 'react'

interface WorkoutData {
    lastDate: Date;
    name: string;
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

interface Props {
    workoutId: string
    userId: React.ReactNode | string
    workoutData: WorkoutData
    exercises: ExerciseData[]
}

export default function EditableWorkout({ workoutId, userId, workoutData, exercises }: Props) {

    // Functions for component here. May need to put 

    return (
        // Front end code here
    )
}
