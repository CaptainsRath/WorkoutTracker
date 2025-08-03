'use client';

import { useRouter } from 'next/navigation';

interface Props {
  workoutId: number;
}

export default function FinishWorkoutButton({ workoutId }: Props) {
  const router = useRouter();

  // The below hard coded example demonstrates how the 
  // stored procedure explicitly ignores the "order"
  // parameters and litterally goes off of the 
  // order of the exercises in the exercises array
  // and order of the sets in the sets array
  // (see discord for pic of output)
  const handleClick = async () => {
    const res = await fetch('/api/finishedWorkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workoutId: workoutId,
        workoutData: {
          name: 'Finished Workout With Hardcoded Values',
          lastDate: new Date().toISOString(),
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

    const result = await res.json();

    if (result.redirect) {
      router.push(result.redirect);
    } else {
      alert(result.error || 'Workout saved');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-blue-500 text-white py-2 px-4 rounded"
    >
      Finish Workout
    </button>
  );
}