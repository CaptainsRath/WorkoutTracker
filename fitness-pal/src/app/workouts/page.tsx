import GenericCard from '@/src/components/genericCard'

// Shows all workouts
export default async function Workouts() {
    return (
        <main className='w-full h-fit flex-wrap bg-blue-700 rounded'>
            <h1 className='font-bold w-full text-center'>WORKOUTS ROUTE</h1>
            <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-blue-500'>
                {Array.from({ length: 20 }).map((_, idx) => {
                    return (
                        <GenericCard href={`/workouts/${idx}`} key={`workout-id-${idx}`}>
                            Workout {idx}
                        </GenericCard>
                    )
                })}
            </section>
        </main>
    )
}
