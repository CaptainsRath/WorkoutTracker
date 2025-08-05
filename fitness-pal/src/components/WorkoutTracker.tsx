// src/components/WorkoutTracker.tsx
'use client'

import { useState, useEffect, memo } from 'react';

// Define the props to be accepted from EditableWorkout
interface WorkoutTrackerProps {
  initialDuration: number;
  onDurationChange: (duration: number) => void;
  // We can use isSaving to pause the timer display if needed, though not strictly required.
  isSaving: boolean; 
}

// Helper function to format seconds into MM:SS
const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

function WorkoutTracker({ initialDuration, onDurationChange, isSaving }: WorkoutTrackerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialDuration);

  useEffect(() => {
    // Start a timer interval when the component mounts.
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    // Clean up the interval when the component is unmounted.
    return () => clearInterval(interval);
  }, []); // The empty dependency array ensures this effect runs only once.

  useEffect(() => {
    // Whenever the timer ticks, report the new duration back to the parent component.
    onDurationChange(elapsedSeconds);
  }, [elapsedSeconds, onDurationChange]);

  // Use a simple span for displaying the time. This avoids the <div> in <p> hydration error.
  return (
    <span className="tabular-nums font-medium">
      {formatTime(elapsedSeconds)}
    </span>
  );
}

// Use memo to prevent re-rendering if the props haven't changed.
export default memo(WorkoutTracker);