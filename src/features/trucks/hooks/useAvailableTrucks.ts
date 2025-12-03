import { useQuery } from '@tanstack/react-query'
import { getDocs, query, where } from 'firebase/firestore'
import { trucksCollection } from '../../../lib'
import type { TruckDocument } from '../../../types'

export const useAvailableTrucks = () => {
    return useQuery({
        queryKey: ['trucks', 'available'],
        queryFn: async () => {
            // Fetch trucks where driverId is null or empty
            // OBS: Firestore doesn't support OR queries easily for null/empty string in one go without composite indexes sometimes,
            // but typically we store null. Let's assume null for unlinked.
            const q = query(trucksCollection, where('driverId', '==', null))
            const snapshot = await getDocs(q)
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as TruckDocument[]
        },
    })
}
