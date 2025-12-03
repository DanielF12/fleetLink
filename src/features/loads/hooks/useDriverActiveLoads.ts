import { useQuery } from '@tanstack/react-query'
import { getDriverActiveLoads } from '../services/loadService'

// Fetch active loads for a specific driver
export const useDriverActiveLoads = (driverId?: string) => {
    return useQuery({
        queryKey: ['driverActiveLoads', driverId],
        queryFn: () => getDriverActiveLoads(driverId!),
        enabled: !!driverId, // Only fetch if driverId is provided
    })
}
