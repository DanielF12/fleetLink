import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createDriver } from '../services/driverService'
import type { DriverDocument } from '../../../types'

export const useCreateDriver = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Omit<DriverDocument, 'id' | 'createdAt' | 'updatedAt'>) => createDriver(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] })
            toast.success('Driver created successfully!')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error creating driver')
        },
    })
}
