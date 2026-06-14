import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ambilSemuaNota, ambilKatalogBahanBaku, buatNota } from '../api/notaRepository'

export function useDaftarNota() {
  return useQuery({ queryKey: ['nota'], queryFn: ambilSemuaNota })
}

export function useKatalogBahanBaku() {
  return useQuery({
    queryKey: ['katalog-bahan-baku'],
    queryFn: ambilKatalogBahanBaku,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBuatNota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: buatNota,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nota'] }),
  })
}
