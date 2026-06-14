// Sumber kebenaran: CLAUDE.md § Konvensi Kode → Status Enum
// JANGAN ubah string value-nya — harus selalu sinkron dengan CHECK constraint
// di migration database (supabase/migrations/0003, 0004, dst).

export const STATUS_KODE = {
  SAMPEL_DIBUAT:        'sampel_dibuat',
  REVIEW_SAMPEL:        'review_sampel',
  SAMPEL_DITOLAK:       'sampel_ditolak',
  SAMPEL_APPROVED:      'sampel_approved',
  ESTIMASI_PEMAKAIAN:   'estimasi_pemakaian',
  KONFIRMASI_PEMAKAIAN: 'konfirmasi_pemakaian',
  PROSES_POTONG:        'proses_potong',
  INPUT_BUKU_POTONG:    'input_buku_potong',
  INPUT_NOTA:           'input_nota',
  INPUT_HPP:            'input_hpp',
  REVIEW_HPP:           'review_hpp',
  HPP_DITOLAK:          'hpp_ditolak',
  HPP_APPROVED:         'hpp_approved',
  PRODUKSI:             'produksi',
  SIAP_KIRIM:           'siap_kirim',
  SELESAI:              'selesai',
  DIBATALKAN:           'dibatalkan',
}

export const TIPE_BAHAN = {
  PRIMER:   'primer',
  SEKUNDER: 'sekunder',
}

export const SATUAN_BAHAN = {
  YARD:  'yard',
  PANEL: 'panel',
}

export const UKURAN = {
  MIDI:        'MIDI',
  GAMIS:       'GAMIS',
  MIDI_JUMBO:  'MIDI JUMBO',
  GAMIS_JUMBO: 'GAMIS JUMBO',
}

export const TIPE_BAHAN_BAKU = {
  UNIT:  'unit',
  USAGE: 'usage',
}

export const NASIB_REJECT = {
  DIPERMAK:       'dipermak',
  PRODUKSI_ULANG: 'produksi_ulang',
  WASTE:          'waste',
}

export const ROLE = {
  DEERA:  'deera',
  JIHAN:  'jihan',
  MASTER: 'master',
}

export const TIPE_KASBON = {
  MASUK:             'masuk',
  POTONGAN_OTOMATIS: 'potongan_otomatis',
}

export const STATUS_SAMPEL = {
  AKTIF:   'aktif',
  DITOLAK: 'ditolak',
}

export const STATUS_HPP = {
  DRAFT:    'draft',
  REVIEW:   'review',
  APPROVED: 'approved',
  DITOLAK:  'ditolak',
}

export const STATUS_APPROVAL_PENGIRIMAN = {
  MENUNGGU:  'menunggu',
  DISETUJUI: 'disetujui',
  DITOLAK:   'ditolak',
}

export const TAHAP_PRODUKSI = {
  DIPOTONG:   'dipotong',
  DIJAHIT:    'dijahit',
  FINISHING:  'finishing',
  SIAP_KIRIM: 'siap_kirim',
}

export const MODE_NOTIFIKASI = {
  REALTIME:      'realtime',
  DIGEST_HARIAN: 'digest_harian',
}
