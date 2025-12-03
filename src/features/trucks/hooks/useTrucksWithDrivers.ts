import { useQuery } from '@tanstack/react-query'
import { getDocs, query, where } from 'firebase/firestore'
import { trucksCollection } from '../../../lib'
import type { TruckDocument } from '../../../types'

// Get trucks with drivers
export const useTrucksWithDrivers = () => {
    return useQuery({
        queryKey: ['trucks', 'with-drivers'],
        queryFn: async () => {
            // Fetch trucks where driverId is NOT null
            const q = query(trucksCollection, where('driverId', '!=', null))
            const snapshot = await getDocs(q)
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as TruckDocument[]
        },
    })
}
