'use client'

import { useContext } from 'react'
import { AppStateContext } from '@/src/contexts/appStateContext'
import { AppStateDispatchContext } from '@/src/contexts/appStateContext'

export default function Home() {
    const user = useContext(AppStateContext)
    const dispatch = useContext(AppStateDispatchContext)
    if (dispatch == undefined || user == undefined) {
        throw new Error('dispatch and or user cannot be undefined!')
    }

    return (
        <main className='w-full h-full flex flex-col text-center bg-gray-700 rounded'>
            <h1 className='font-bold'>HOME ROUTE</h1>
            <label className='w-50 h-6 mx-auto rounded my-5'>Name is: {user.UserFirstName}</label>
            <input
                type='text'
                className='bg-white h-6 w-50 rounded mx-auto my-5 text-black p-2'
                value={user.UserFirstName}
                onChange={(e) => {
                    dispatch({ type: 'changeFirstName', payload: e.target.value })
                }}
            />
        </main>
    )
}
