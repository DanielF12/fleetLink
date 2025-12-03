import { useQuery } from '@tanstack/react-query'
import { getTruckActiveLoads } from '../services/loadService'

// Fetch active loads for a specific truck
export const useTruckActiveLoads = (truckId?: string) => {
    return useQuery({
        queryKey: ['truck-active-loads', truckId],
        queryFn: () => getTruckActiveLoads(truckId!),
        enabled: !!truckId, // Only fetch if truckId is provided
    })
}
