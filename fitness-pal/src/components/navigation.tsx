"use client";

import SmartPrefetchLink from "./smartPrefetchLink"
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navigation() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        router.push(`/exercises?search=${searchTerm}`);
    };

    return (
        <nav className='h-10 flex flex-row rounded justify-between items-center'>
            <SmartPrefetchLink href='/' />
            <SmartPrefetchLink href='/login' />
            <SmartPrefetchLink href='/dashboard' />
            <SmartPrefetchLink href='/exercises' />
            <SmartPrefetchLink href='/workouts' />
            <form onSubmit={handleSearchSubmit} className="mr-2">
                <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-white rounded text-black"
                />
                <button type="submit" className="hover:bg-green-300 hover:text-black rounded">Search</button>
            </form>
        </nav>
    )
}
