'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface WorkoutTrackerProps {
    workoutId: string;
    workoutName: string;
}

function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function WorkoutTracker({ workoutId, workoutName }: WorkoutTrackerProps) {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const router = useRouter();

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && !isPaused) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, isPaused]);

    const handleStartWorkout = useCallback(() => {
        setSeconds(0);
        setIsPaused(false);
        setIsActive(true);
    }, []);

    const handleEndWorkout = useCallback(async () => {
        setIsActive(false);
        try {
            // TODO: REPLACE THE RESPONSE BODY WITH DATA FROM THE ACTUAL PAGE'S FORM
            const response = await fetch('/api/finishedWorkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                workoutId: workoutId,
                workoutData: {
                name: 'Finished Workout With Hardcoded Values',
                lastDate: new Date().toISOString(),
                lastDuration: 500
                },
                exercises: [
                {
                    exerciseId: 1,
                    like: true,
                    order: 1,
                    sets: [
                    { setId: null, order: 1, lbs: 10, reps: 1 },
                    { setId: null, order: 0, lbs: 100, reps: 10 }
                    ]
                },
                {
                    exerciseId: 2,
                    like: false,
                    order: 0,
                    sets: [
                        { setId: null, order: 1, lbs: 10, reps: 1 },
                    { setId: null, order: 0, lbs: 110, reps: 8 }
                    ]
                }
                ]
            })
            });

            if (!response.ok) {
                // Try to get a more specific error message from the server response
                const errorData = await response.json().catch(() => (null));
                throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            router.push(result.redirect);

            alert('Workout finished!');
        } catch (error) {
            console.error("Failed to end workout:", error);
            alert(`Failed to save workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [workoutId, seconds]);

    const handlePauseResume = useCallback(() => {
        setIsPaused(p => !p);
    }, []);

    const buttonBaseClasses = "text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 active:scale-95";

    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <h1 className='font-bold w-full text-center text-2xl mb-8'>{workoutName}</h1>
            <div className="text-6xl font-mono mb-8">{formatTime(seconds)}</div>
            <div className="flex items-center justify-center space-x-4">
                {!isActive ? (
                    <button
                        onClick={handleStartWorkout}
                        className={`${buttonBaseClasses} bg-green-600 hover:bg-green-700`}
                    >
                        Start Workout
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handlePauseResume}
                            className={`${buttonBaseClasses} ${isPaused ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                        >
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                            onClick={handleEndWorkout}
                            className={`${buttonBaseClasses} bg-red-600 hover:bg-red-700`}
                        >
                            End Workout
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}