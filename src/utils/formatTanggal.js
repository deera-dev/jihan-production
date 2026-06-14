/**
 * Format tanggal ke bentuk "5 Juni 2026".
 * @param {string | Date} tanggal
 * @returns {string}
 */
export function formatTanggal(tanggal) {
  if (!tanggal) return '—'
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format tanggal pendek: "5 Jun 2026".
 * @param {string | Date} tanggal
 * @returns {string}
 */
export function formatTanggalPendek(tanggal) {
  if (!tanggal) return '—'
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format tanggal relatif (hari ini, kemarin, atau tanggal lengkap).
 * @param {string | Date} tanggal
 * @returns {string}
 */
export function formatTanggalRelatif(tanggal) {
  if (!tanggal) return '—'
  const d = new Date(tanggal)
  const sekarang = new Date()
  const diffHari = Math.floor((sekarang - d) / 86400000)
  if (diffHari === 0) return 'Hari ini'
  if (diffHari === 1) return 'Kemarin'
  return formatTanggal(tanggal)
}
