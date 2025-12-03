import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { deleteTruck } from '../services/truckService'

export const useDeleteTruck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTruck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] })
      toast.success('Truck removed successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error removing truck')
    },
  })
}

