// This route implements dynamic nextjs routinig

interface Props {
    params: Promise<{ id: string }>
}

// Show a single exercise
export default async function Workout({ params }: Props) {
    const { id } = await params

    return (
        <main className='w-full h-full flex-wrap bg-blue-700 rounded'>
            <h1 className='font-bold w-full text-center'>WORKOUT ROUTE {id}</h1>
        </main>
    )
}
