// Zod schema validasi input fitur `kode`.

import { z } from 'zod'

export const UKURAN_OPTIONS = ['MIDI', 'GAMIS', 'MIDI JUMBO', 'GAMIS JUMBO']

export const buatKodeSchema = z.object({
  nomor: z
    .string()
    .regex(/^\d{3}$/, 'Nomor harus 3 digit, contoh: 001'),
  kode_bahan: z
    .string()
    .min(3, 'Kode bahan 3 huruf')
    .max(3, 'Kode bahan maks 3 huruf')
    .regex(/^[A-Za-z]+$/, 'Hanya huruf, contoh: IMA'),
  ukuran: z
    .array(z.enum(['MIDI', 'GAMIS', 'MIDI JUMBO', 'GAMIS JUMBO']))
    .min(1, 'Pilih minimal 1 ukuran'),
  harga_jual_target: z.number().positive('Harga harus > 0').optional().nullable(),
  catatan: z.string().optional(),
})

export const sampelSchema = z.object({
  foto_depan_url: z.string().url('URL foto depan tidak valid').min(1, 'Foto depan wajib diisi'),
  foto_belakang_url: z.string().url('URL foto belakang tidak valid').min(1, 'Foto belakang wajib diisi'),
})

export const catatanSampelSchema = z.object({
  isi: z.string().min(1, 'Catatan tidak boleh kosong'),
})

export const tolakSampelSchema = z.object({
  alasan: z.string().min(1, 'Alasan penolakan wajib diisi'),
})

export const tolakHPPSchema = z.object({
  alasan: z.string().min(1, 'Alasan penolakan wajib diisi'),
})

export const rejectSchema = z.object({
  pcs_reject: z
    .number({ invalid_type_error: 'Jumlah wajib diisi' })
    .int()
    .positive('Harus > 0'),
  alasan: z.string().min(1, 'Alasan wajib diisi'),
  nasib: z.enum(['dipermak', 'produksi_ulang', 'waste'], { required_error: 'Pilih nasib reject' }),
  bahan_tersedia: z.boolean().optional(),
  catatan: z.string().optional(),
})
