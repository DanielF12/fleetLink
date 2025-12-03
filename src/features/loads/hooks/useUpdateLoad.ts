import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateLoad } from '../services/loadService'
import type { LoadDocument } from '../../../types'

export const useUpdateLoad = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<LoadDocument> }) => updateLoad(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loads'] })
        },
    })
}
