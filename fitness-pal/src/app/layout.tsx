import './globals.css'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Navigation from '@/src/components/navigation'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Fitness-pal',
    description: 'CS 411 Team 007',
}

// GLOBAL LAYOUT, CONTAINS DOM ROOT, PERSISTS ACROSS ALL ROUTES.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang='en'>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Navigation />
                {children}
            </body>
        </html>
    )
}
