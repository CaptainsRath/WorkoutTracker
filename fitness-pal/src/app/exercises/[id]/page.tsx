// This route implements dynamic nextjs routinig
import { createConnection } from "mysql2/promise"
import { env } from "@/src/env"

interface Props {
    params: Promise<{ id: string }>
}

// Show a single exercise
export default async function Exercise({ params }: Props) {
    const { id } = await params
    const conn = await createConnection(env.DATABASE_URL)
    const [rows, _] = await conn.execute(
        'select * from Exercises where exerciseId = ?',
        [Number(id)]
    )
    await conn.end();

    // horrible type errors will have to fix later.
    const name = rows[0].name 
    const desc = rows[0].description

    return (
        <main className='w-full h-full flex-wrap bg-emerald-700 rounded'>
            <h1 className='font-bold w-full text-center'>EXERCISE ROUTE {id}</h1>
            <h1 className='font-bold w-full text-center'>{name}</h1>
            <p className='font-semibold w-full text-center'>{desc}</p>
        </main>
    )
}
