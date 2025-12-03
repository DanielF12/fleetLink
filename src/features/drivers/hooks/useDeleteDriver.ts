import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { deleteDriver } from '../services/driverService'

export const useDeleteDriver = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteDriver(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] })
            toast.success('Driver removed successfully!')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Error removing driver')
        },
    })
}
