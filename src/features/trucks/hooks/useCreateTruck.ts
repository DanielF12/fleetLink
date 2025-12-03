import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { createTruck } from '../services/truckService'

export const useCreateTruck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const { documentFile, ...truckData } = data

      // 1. Create truck first to get an ID (or generate one)
      // Strategy: We will let createTruck handle the creation. 
      // But we need the ID for the file path.
      // Create the truck first without the document URL.
      const truckId = await createTruck(truckData)

      // 2. If there is a file, upload it
      if (documentFile && documentFile.length > 0) {
        const file = documentFile[0]
        const { uploadTruckDocument, updateTruck } = await import('../services/truckService')
        const downloadUrl = await uploadTruckDocument(truckId, file)

        // 3. Update the truck with the document URL
        await updateTruck(truckId, { documentUrl: downloadUrl })
      }

      return truckId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] })
      toast.success('Truck created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error creating truck')
    },
  })
}

