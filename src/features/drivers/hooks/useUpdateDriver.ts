import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { updateDriver } from '../services/driverService'
import type { DriverDocument } from '../../../types'

export const useUpdateDriver = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<DriverDocument> }) => updateDriver(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] })
            toast.success('Driver updated successfully!')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error updating driver')
        },
    })
}
