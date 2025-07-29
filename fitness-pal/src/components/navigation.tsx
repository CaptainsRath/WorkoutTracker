import SmartPrefetchLink from "./smartPrefetchLink"

export default function Navigation() {
    return (
        <nav className='h-10 flex flex-row rounded'>
            <SmartPrefetchLink href='/' />
            <SmartPrefetchLink href='/login' />
            <SmartPrefetchLink href='/dashboard' />
            <SmartPrefetchLink href='/exercises' />
            <SmartPrefetchLink href='/workouts' />
        </nav>
    )
}
