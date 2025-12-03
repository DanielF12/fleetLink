import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { updateTruck } from '../services/truckService'

export const useUpdateTruck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ truckId, data }: any) => {
      const { documentFile, ...truckData } = data

      // 1. If there is a new file, upload it
      if (documentFile && documentFile.length > 0) {
        const file = documentFile[0]
        const { uploadTruckDocument } = await import('../services/truckService')
        const downloadUrl = await uploadTruckDocument(truckId, file)

        // Add URL to update data
        truckData.documentUrl = downloadUrl
      }

      // 2. Update truck
      await updateTruck(truckId, truckData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] })
      toast.success('Truck updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error updating truck')
    },
  })
}

