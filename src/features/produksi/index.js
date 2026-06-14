// Public surface fitur `produksi` — slice lain HANYA boleh import dari sini,
// tidak boleh menjangkau langsung ke dalam internal (components/, api/, hooks/).

export { ProduksiListPage } from './ProduksiListPage'
export { ProduksiDetailPage } from './ProduksiDetailPage'
export { BuatProduksiPage } from './BuatProduksiPage'

export {
  useDaftarProduksi,
  useDetailProduksi,
  useNomorKodeBerikutnya,
  useBuatProduksi,
  useUpdateProduksi,
  useHapusProduksi,
} from './hooks/useProduksi'
