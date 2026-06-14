import { useMutation, useQueryClient } from '@tanstack/react-query'
import { simpanBukuPotong } from '../api/bukuPotongRepository'

export function useBukuPotongMutations(kodeId) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: simpanBukuPotong,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
  return {
    simpanBukuPotong: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
