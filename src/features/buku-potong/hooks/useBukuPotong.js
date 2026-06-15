import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ambilProduksiBukuPotong, simpanBukuPotongProduksi } from '../api/bukuPotongRepository'

export function useProduksiBukuPotong(produksiId) {
  return useQuery({
    queryKey: ['bukupotong-produksi', produksiId],
    queryFn: () => ambilProduksiBukuPotong(produksiId),
    enabled: !!produksiId,
  })
}

export function useBukuPotongMutations(produksiId) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: simpanBukuPotongProduksi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bukupotong-produksi', produksiId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
      qc.invalidateQueries({ queryKey: ['kode'] })
    },
  })
  return {
    simpanBukuPotong: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}
