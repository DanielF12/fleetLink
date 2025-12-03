import { useQuery } from '@tanstack/react-query'
import { doc, getDoc } from 'firebase/firestore'
import { driversCollection } from '../../../lib'
import type { DriverDocument } from '../../../types'


// get driver by id
export const useDriver = (driverId?: string | null) => {
    return useQuery({
        queryKey: ['driver', driverId],
        queryFn: async () => {
            if (!driverId) return null
            const docRef = doc(driversCollection, driverId)
            const snapshot = await getDoc(docRef)
            if (!snapshot.exists()) return null
            return {
                id: snapshot.id,
                ...snapshot.data(),
            } as DriverDocument
        },
        enabled: !!driverId, // only fetch if driverId is not null
    })
}
