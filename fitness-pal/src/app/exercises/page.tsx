import GenericCard from '@/src/components/genericCard'

// Shows all exercises
export default async function Exercises() {
    return (
        <main className='w-full h-fit flex-wrap bg-emerald-700 rounded'>
            <h1 className='font-bold w-full text-center'>EXERCISES ROUTES</h1>
            <section className='grid grid-flow-row gap-5 grid-cols-3 mx-5 mb-5 [&>*]:bg-emerald-500'>
                {Array.from({ length: 20 }).map((_, idx) => {
                    return (
                        <GenericCard href={`/exercises/${idx}`} key={`exercise-id-${idx}`}>
                            exercise {idx}
                        </GenericCard>
                    )
                })}
            </section>
        </main>
    )
}
