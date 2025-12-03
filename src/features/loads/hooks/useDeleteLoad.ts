import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteLoad } from '../services/loadService'

export const useDeleteLoad = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteLoad(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loads'] })
        },
    })
}
