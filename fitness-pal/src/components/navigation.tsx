"use client";

import SmartPrefetchLink from "./smartPrefetchLink"
// No longer need useState or useRouter here

export default function Navigation() {
    return (
        <nav className='h-10 flex flex-row rounded justify-between items-center'>
            <SmartPrefetchLink href='/' />
            <SmartPrefetchLink href='/login' />
            <SmartPrefetchLink href='/dashboard' />
            <SmartPrefetchLink href='/exercises' />
            <SmartPrefetchLink href='/workouts' />
            {/* The search form has been removed */}
        </nav>
    )
}