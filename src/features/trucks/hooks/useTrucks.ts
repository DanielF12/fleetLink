import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { onSnapshot, query, orderBy } from 'firebase/firestore'
import { trucksCollection } from '../../../lib'
import { getTrucks } from '../services/truckService'
import type { TruckDocument } from '../../../types'

export const useTrucks = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const q = query(trucksCollection, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trucks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TruckDocument[]

      // Update the cache with the snapshot data
      queryClient.setQueryData(['trucks'], trucks)
    })

    return () => unsubscribe()
  }, [queryClient])

  return useQuery({
    queryKey: ['trucks'],
    queryFn: getTrucks,
    staleTime: Infinity,
  })
}
