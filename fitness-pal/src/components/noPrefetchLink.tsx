'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function NoPrefetchLink({ href }: { href: string }) {
    const [active, setActive] = useState(false)
    return (
        <Link
            href={href}
            prefetch={active ? null : false}
            onMouseEnter={() => {setActive(true)}}
            className='px-4 flex h-full items-center justify-center font-bold hover:cursor-pointer hover:underline'
        >
            {href.slice(1) || "home"}
        </Link>
    )
}
