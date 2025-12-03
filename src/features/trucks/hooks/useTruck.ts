import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { trucksCollection } from '../../../lib'
import type { TruckDocument } from '../../../types'

// Get a truck by ID
export const useTruck = (truckId?: string | null) => {
    return useQuery({
        queryKey: ['truck', truckId],
        queryFn: async () => {
            if (!truckId) return null
            const docRef = doc(trucksCollection, truckId)
            const snapshot = await getDoc(docRef)
            if (!snapshot.exists()) return null
            return {
                id: snapshot.id,
                ...snapshot.data(),
            } as TruckDocument
        },
        enabled: !!truckId, // Only fetch if truckId is provided
    })
}
