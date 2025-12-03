import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadTruckDocument } from '../services/truckService'

type UploadPayload = {
  truckId: string
  file: File
}

export const useUploadTruckDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ truckId, file }: UploadPayload) => uploadTruckDocument(truckId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] })
    },
  })
}

