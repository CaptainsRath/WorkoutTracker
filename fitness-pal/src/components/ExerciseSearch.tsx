"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of a single muscle object
interface Muscle {
    muscleId: number;
    name: string;
}

// Update the component's props
interface ExerciseSearchProps {
    initialSearchTerm: string;
    initialSelectedMuscle: string;
    muscles: Muscle[];
}

export default function ExerciseSearch({ 
    initialSearchTerm, 
    initialSelectedMuscle, 
    muscles 
}: ExerciseSearchProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    // Add state for the selected muscle
    const [selectedMuscle, setSelectedMuscle] = useState(initialSelectedMuscle);
    const router = useRouter();

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        // Use URLSearchParams to easily construct the query string
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        }
        if (selectedMuscle) {
            params.set('muscle', selectedMuscle);
        }
        
        router.push(`/exercises?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearchSubmit} className="w-full flex justify-center items-center my-4 gap-2">
            {/* The dropdown menu for muscles */}
            <select 
                value={selectedMuscle} 
                onChange={(e) => setSelectedMuscle(e.target.value)}
                className="bg-white rounded text-black px-2 py-1"
            >
                <option value="">All Muscles</option>
                {muscles.map((muscle) => (
                    <option key={muscle.muscleId} value={muscle.muscleId}>
                        {muscle.name}
                    </option>
                ))}
            </select>

            <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white rounded text-black px-2 py-1 w-1/3"
            />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-1 px-3 rounded">
                Search
            </button>
        </form>
    );
}