import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLoad } from '../services/loadService'
import type { LoadDocument } from '../../../types'

export const useCreateLoad = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Omit<LoadDocument, 'id' | 'createdAt' | 'updatedAt'>) => createLoad(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loads'] })
        },
    })
}
