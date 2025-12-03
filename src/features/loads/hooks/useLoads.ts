import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { onSnapshot, query, orderBy } from 'firebase/firestore'
import { loadsCollection } from '../../../lib'
import { getLoads } from '../services/loadService'
import type { LoadDocument } from '../../../types'

export const useLoads = () => {
    const queryClient = useQueryClient()

    useEffect(() => {
        const q = query(loadsCollection, orderBy('createdAt', 'desc'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loads = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as LoadDocument[]

            queryClient.setQueryData(['loads'], loads)
        })

        return () => unsubscribe()
    }, [queryClient])

    return useQuery({
        queryKey: ['loads'],
        queryFn: getLoads,
        staleTime: Infinity,
    })
}
