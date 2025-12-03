import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { onSnapshot, query, orderBy } from 'firebase/firestore'
import { driversCollection } from '../../../lib'
import { getDrivers } from '../services/driverService'
import type { DriverDocument } from '../../../types'

export const useDrivers = () => {
    const queryClient = useQueryClient()

    useEffect(() => {
        const q = query(driversCollection, orderBy('createdAt', 'desc'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const drivers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as DriverDocument[]

            queryClient.setQueryData(['drivers'], drivers)
        })

        return () => unsubscribe()
    }, [queryClient])

    return useQuery({
        queryKey: ['drivers'],
        queryFn: getDrivers,
        staleTime: Infinity, // keep data fresh for as long as possible
    })
}
