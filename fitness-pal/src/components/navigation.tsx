import NoPrefetchLink from '@/src/components/noPrefetchLink'

export default function Navigation() {
    return (
        <nav className='h-10 flex flex-row rounded'>
            <NoPrefetchLink href='/' />
            <NoPrefetchLink href='/dashboard' />
            <NoPrefetchLink href='/exercises' />
            <NoPrefetchLink href='/workouts' />
        </nav>
    )
}
