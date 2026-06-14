// Shared kernel — komponen yg MENGANDUNG istilah/logika bisnis Jihan Production
// dan dipakai di ≥3 slice (KodeCard, StatusBadge, HPPBreakdown, ProduksiBar, dll).
// Lihat architecture.md § Prinsip Arsitektur Kode → Shared Kernel utk threshold
// & kapan sesuatu harus "naik" dari features/<slice>/components/ ke sini.

export { StatusBadge } from './StatusBadge'
export { KodeCard } from './KodeCard'
export { HPPBreakdown } from './HPPBreakdown'
export { ProduksiBar } from './ProduksiBar'
