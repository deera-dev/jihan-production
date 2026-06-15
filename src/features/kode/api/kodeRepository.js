// Repository fitur `kode` — queries untuk data kode produk, ukuran, warna,
// sampel, HPP, tracking, dan pengiriman.
// Komponen & hook TIDAK BOLEH import `supabase` langsung (Dependency Inversion).

import { supabase } from '../../../lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// KODE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ambil satu kode lengkap dengan semua relasi (ukuran, warna, sampel, hpp, tracking).
 * @param {string} kodeId
 */
export async function ambilKodeById(kodeId) {
  const { data, error } = await supabase
    .from('kode')
    .select(`
      id,
      produksi_id,
      kode_desain,
      harga_jual_target,
      catatan,
      status,
      status_sebelum_dibatalkan,
      created_at,
      updated_at,
      produksi:produksi_id (
        id,
        kode_bahan,
        tanggal,
        produksi_bahan (
          id,
          jenis_bahan,
          tipe_bahan,
          satuan,
          harga_per_satuan,
          jumlah_dibeli,
          konsumsi_per_pcs,
          satuan_konsumsi,
          produksi_bahan_warna (
            id,
            nama_warna,
            yard_tersedia,
            yard_terpakai
          )
        )
      ),
      kode_ukuran (
        id,
        ukuran,
        urutan,
        kode_ukuran_warna (
          id,
          nama_warna,
          jumlah_pcs,
          tracking_produksi (
            id,
            tahap,
            pcs_done,
            updated_at,
            tracking_reject (
              id,
              pcs_reject,
              alasan,
              nasib,
              bahan_tersedia,
              catatan,
              created_at
            )
          )
        )
      ),
      sampel (
        id,
        foto_depan_url,
        foto_belakang_url,
        status,
        alasan_ditolak,
        versi,
        created_at,
        sampel_catatan (
          id,
          user_id,
          isi,
          created_at
        )
      ),
      hpp (
        id,
        jasa_komponen,
        snapshot_bahan_primer,
        snapshot_bahan_sekunder,
        snapshot_bahan_baku,
        total_hpp_jasa,
        total_nilai_bahan,
        total_bahan_baku,
        total_hpp_per_baju,
        status,
        alasan_tolak,
        submitted_at,
        approved_at,
        hpp_revisi (
          id,
          komponen,
          nilai_lama,
          nilai_baru,
          alasan,
          changed_by,
          created_at
        )
      )
    `)
    .eq('id', kodeId)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Buat kode baru dalam suatu produksi.
 * @param {{ produksi_id: string, kode_desain: string, harga_jual_target?: number, catatan?: string, ukuran: string[], created_by: string }} payload
 */
export async function buatKode({ produksi_id, kode_desain, harga_jual_target, catatan, ukuran, urutan }) {
  // 1. Insert kode
  const { data: kode, error: errKode } = await supabase
    .from('kode')
    .insert({
      produksi_id,
      kode_desain: kode_desain.toUpperCase(),
      harga_jual_target: harga_jual_target || null,
      catatan: catatan?.toUpperCase() || null,
      status: 'sampel_dibuat',
      urutan: urutan ?? 1,
    })
    .select()
    .single()
  if (errKode) throw errKode

  // 2. Insert kode_ukuran untuk tiap ukuran yang dipilih
  if (ukuran?.length) {
    const ukuranRows = ukuran.map((u, i) => ({
      kode_id: kode.id,
      ukuran: u,
      urutan: i + 1,
    }))
    const { error: errUkuran } = await supabase.from('kode_ukuran').insert(ukuranRows)
    if (errUkuran) throw errUkuran
  }

  return kode
}

/**
 * Update status kode — validasi transisi di sisi server (trigger) & client (hook).
 * @param {string} kodeId
 * @param {{ status: string, status_sebelum_dibatalkan?: string }} perubahan
 */
export async function updateStatusKode(kodeId, perubahan) {
  const { data, error } = await supabase
    .from('kode')
    .update(perubahan)
    .eq('id', kodeId)
    .select('id, status, status_sebelum_dibatalkan')
    .single()
  if (error) throw error
  return data
}

/**
 * Sync status ke semua kode dalam produksi yang sama (yang masih di dariStatus).
 * Dipakai untuk tahap bersama: proses_potong, input_buku_potong, input_nota.
 */
async function syncStatusSeProduksi(kodeId, dariStatus, keStatus) {
  const { data: kode, error: e1 } = await supabase
    .from('kode')
    .select('produksi_id')
    .eq('id', kodeId)
    .single()
  if (e1) throw e1

  const { error: e2 } = await supabase
    .from('kode')
    .update({ status: keStatus })
    .eq('produksi_id', kode.produksi_id)
    .eq('status', dariStatus)
  if (e2) throw e2
}

/**
 * Tambah warna ke kode_ukuran (biasanya setelah input buku potong).
 */
export async function tambahWarnaKode({ kode_ukuran_id, nama_warna, jumlah_pcs }) {
  const { data, error } = await supabase
    .from('kode_ukuran_warna')
    .insert({ kode_ukuran_id, nama_warna: nama_warna.toUpperCase(), jumlah_pcs: jumlah_pcs ?? 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Update jumlah pcs pada kode_ukuran_warna (dari buku potong).
 */
export async function updatePcsWarna(id, jumlah_pcs) {
  const { data, error } = await supabase
    .from('kode_ukuran_warna')
    .update({ jumlah_pcs })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// SAMPEL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload sampel baru (setelah foto sudah di-upload ke Cloudinary, masukkan URL-nya).
 */
export async function buatSampel({ kode_id, foto_depan_url, foto_belakang_url, versi, created_by }) {
  const { data, error } = await supabase
    .from('sampel')
    .insert({ kode_id, foto_depan_url, foto_belakang_url, versi: versi ?? 1, created_by, status: 'aktif' })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Approve sampel → ubah status kode ke sampel_approved → estimasi_pemakaian.
 */
export async function approveSampel(sampelId, kodeId) {
  const { error: errSampel } = await supabase
    .from('sampel')
    .update({ status: 'aktif' })  // tetap aktif, status approval di kode
    .eq('id', sampelId)
  if (errSampel) throw errSampel

  return updateStatusKode(kodeId, { status: 'estimasi_pemakaian' })
}

/**
 * Tolak sampel → tandai sampel ditolak, kode kembali ke sampel_dibuat.
 */
export async function tolakSampel(sampelId, kodeId, alasan) {
  const { error: errSampel } = await supabase
    .from('sampel')
    .update({ status: 'ditolak', alasan_ditolak: alasan?.toUpperCase() ?? null })
    .eq('id', sampelId)
  if (errSampel) throw errSampel

  return updateStatusKode(kodeId, { status: 'sampel_dibuat' })
}

/**
 * Tambah catatan sampel (boleh Deera maupun Jihan).
 */
export async function tambahCatatanSampel({ sampel_id, user_id, isi }) {
  const { data, error } = await supabase
    .from('sampel_catatan')
    .insert({ sampel_id, user_id, isi: isi.toUpperCase() })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// HPP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ambil template komponen HPP global.
 */
export async function ambilTemplateHPP() {
  const { data, error } = await supabase
    .from('hpp_template_komponen')
    .select('id, nama, nilai_min, nilai_max, urutan, is_default')
    .order('urutan')
  if (error) throw error
  return data ?? []
}

/**
 * Simpan / update HPP suatu kode (draft atau submit untuk review).
 * @param {string} kodeId
 * @param {object} payload
 * @param {boolean} submitUntukReview — jika true, ubah status HPP ke 'review' & kode ke 'review_hpp'
 */
export async function simpanHPP(kodeId, payload, submitUntukReview = false) {
  const hppData = {
    kode_id: kodeId,
    jasa_komponen: payload.jasa_komponen,
    snapshot_bahan_primer: payload.snapshot_bahan_primer,
    snapshot_bahan_sekunder: payload.snapshot_bahan_sekunder,
    snapshot_bahan_baku: payload.snapshot_bahan_baku,
    total_hpp_jasa: payload.total_hpp_jasa,
    total_nilai_bahan: payload.total_nilai_bahan,
    total_bahan_baku: payload.total_bahan_baku,
    total_hpp_per_baju: payload.total_hpp_per_baju,
    status: submitUntukReview ? 'review' : 'draft',
    submitted_at: submitUntukReview ? new Date().toISOString() : null,
  }

  const { data, error } = await supabase
    .from('hpp')
    .upsert(hppData, { onConflict: 'kode_id' })
    .select()
    .single()
  if (error) throw error

  if (submitUntukReview) {
    await updateStatusKode(kodeId, { status: 'review_hpp' })
  }

  return data
}

/**
 * Approve HPP → freeze (status 'approved'), kode lanjut ke 'produksi'.
 */
export async function approveHPP(hppId, kodeId) {
  const { error } = await supabase
    .from('hpp')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', hppId)
  if (error) throw error

  await updateStatusKode(kodeId, { status: 'produksi' })

  // Buat tracking_produksi untuk setiap kode_ukuran_warna × 4 tahap
  const TAHAP = ['dipotong', 'dijahit', 'finishing', 'siap_kirim']
  const { data: ukuranList } = await supabase
    .from('kode_ukuran')
    .select('id, kode_ukuran_warna(id)')
    .eq('kode_id', kodeId)
  if (ukuranList) {
    const rows = []
    for (const uk of ukuranList) {
      for (const w of uk.kode_ukuran_warna ?? []) {
        for (const tahap of TAHAP) {
          rows.push({ kode_ukuran_warna_id: w.id, tahap, pcs_done: 0 })
        }
      }
    }
    if (rows.length > 0) {
      await supabase.from('tracking_produksi').upsert(rows, {
        onConflict: 'kode_ukuran_warna_id,tahap',
        ignoreDuplicates: true,
      })
    }
  }
  return { ok: true }
}

/**
 * Tolak HPP → kembali ke input_hpp untuk edit.
 */
export async function tolakHPP(hppId, kodeId, alasan) {
  const { error } = await supabase
    .from('hpp')
    .update({ status: 'ditolak', alasan_tolak: alasan?.toUpperCase() ?? null })
    .eq('id', hppId)
  if (error) throw error
  return updateStatusKode(kodeId, { status: 'input_hpp' })
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACKING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update pcs_done pada satu tracking_produksi row.
 */
export async function updateTracking(trackingId, pcs_done, updated_by) {
  const { data, error } = await supabase
    .from('tracking_produksi')
    .update({ pcs_done, updated_by })
    .eq('id', trackingId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Catat reject — wajib isi nasib (dipermak/produksi_ulang/waste).
 */
export async function catatReject({ tracking_produksi_id, pcs_reject, alasan, nasib, bahan_tersedia, catatan, created_by }) {
  const { data, error } = await supabase
    .from('tracking_reject')
    .insert({
      tracking_produksi_id,
      pcs_reject,
      alasan: alasan.toUpperCase(),
      nasib,
      bahan_tersedia: nasib === 'produksi_ulang' ? bahan_tersedia : null,
      catatan: catatan?.toUpperCase() ?? null,
      created_by,
    })
    .select()
    .single()
  if (error) throw error
  return data
}


// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORT dari sampel repository — kodeRepository adalah titik masuk tunggal
// untuk semua operasi yang memengaruhi kode (termasuk sampel yang mengubah status kode).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload sampel baru DAN transisi kode ke status review_sampel.
 * Menggabungkan: insert sampel + update status kode dalam satu operasi atomik.
 */
export async function buatSampelDanAjukanReview({
  kode_id, foto_depan_url, foto_belakang_url, versi, created_by
}) {
  // 1. Insert sampel
  const { data: sampel, error: errSampel } = await supabase
    .from('sampel')
    .insert({
      kode_id,
      foto_depan_url,
      foto_belakang_url,
      versi: versi ?? 1,
      created_by,
      status: 'aktif',
    })
    .select()
    .single()
  if (errSampel) throw errSampel

  // 2. Update kode status → proses_potong (langsung, tanpa review/estimasi)
  await updateStatusKode(kode_id, { status: 'proses_potong' })

  return sampel
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTIMASI, KONFIRMASI, PROSES POTONG (transisi status flow)
// ─────────────────────────────────────────────────────────────────────────────

/** Konfirmasi estimasi → proses_potong (sync semua kode di produksi yg sama). */
export async function konfirmasiEstimasi(kodeId) {
  await syncStatusSeProduksi(kodeId, 'estimasi_pemakaian', 'proses_potong')
  await syncStatusSeProduksi(kodeId, 'konfirmasi_pemakaian', 'proses_potong')
  return updateStatusKode(kodeId, { status: 'proses_potong' })
}

/** Lanjutkan dari konfirmasi_pemakaian → proses_potong (sync semua kode). */
export async function lanjutkanKeProsesPotong(kodeId) {
  await syncStatusSeProduksi(kodeId, 'konfirmasi_pemakaian', 'proses_potong')
  await syncStatusSeProduksi(kodeId, 'estimasi_pemakaian', 'proses_potong')
  return updateStatusKode(kodeId, { status: 'proses_potong' })
}

/** Batalkan kode (estimasi terlalu besar) — simpan status lama. */
export async function batalkanKode(kodeId, statusSaatIni) {
  return updateStatusKode(kodeId, {
    status: 'dibatalkan',
    status_sebelum_dibatalkan: statusSaatIni,
  })
}

/** Revisi & lanjutkan kembali dari dibatalkan ke status_sebelum_dibatalkan. */
export async function lanjutkanDariBatalkan(kodeId, statusSebelumDibatalkan) {
  return updateStatusKode(kodeId, {
    status: statusSebelumDibatalkan,
    status_sebelum_dibatalkan: null,
  })
}

/** Mulai proses potong → input_buku_potong (sync semua kode). */
export async function mulaiInputBukuPotong(kodeId) {
  await syncStatusSeProduksi(kodeId, 'proses_potong', 'input_buku_potong')
  return updateStatusKode(kodeId, { status: 'input_buku_potong' })
}

/** Selesai buku potong → input_nota (sync semua kode). */
export async function lanjutKeInputNota(kodeId) {
  await syncStatusSeProduksi(kodeId, 'input_buku_potong', 'input_nota')
  return updateStatusKode(kodeId, { status: 'input_nota' })
}

/** Skip sampel → langsung ke proses_potong. */
export async function lanjutTanpaSampel(kodeId) {
  return updateStatusKode(kodeId, { status: 'proses_potong' })
}

/** Recovery: kode stuck di input_nota padahal nota sudah approved → langsung ke produksi. */
export async function lanjutKeProduksiSetelahNota(kodeId) {
  return updateStatusKode(kodeId, { status: 'produksi' })
}
