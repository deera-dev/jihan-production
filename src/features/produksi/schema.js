// Zod schema validasi input fitur `produksi`.
// Dipakai bersama react-hook-form (resolver) di komponen form.
// Sumber aturan: CLAUDE.md § Aturan Bisnis Kritis & § Aturan Input (Global)
// (ingat: text biasa selalu UPPERCASE, number pakai slider+input manual).

import { z } from 'zod'

export const buatProduksiSchema = z.object({
  kode_bahan: z
    .string()
    .min(3, 'Kode bahan 3 huruf')
    .max(3, 'Kode bahan maks 3 huruf')
    .regex(/^[A-Za-z]+$/, 'Hanya huruf, contoh: IMA'),
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  catatan: z.string().optional(),
})

export const suratJalanSchema = z.object({
  nomor_surat_jalan: z.string().optional(),
  tanggal_terima: z.string().min(1, 'Tanggal terima wajib diisi'),
  pengirim: z.string().optional(),
  catatan: z.string().optional(),
})

export const bahanSchema = z.object({
  jenis_bahan: z.string().min(1, 'Jenis bahan wajib diisi'),
  tipe_bahan: z.enum(['primer', 'sekunder'], { required_error: 'Pilih tipe bahan' }),
  satuan: z.enum(['yard', 'panel'], { required_error: 'Pilih satuan' }),
  harga_per_satuan: z
    .number({ invalid_type_error: 'Harga wajib diisi' })
    .positive('Harga harus lebih dari 0'),
  jumlah_dibeli: z.number().positive('Jumlah harus lebih dari 0').optional(),
})

export const warnaBahanSchema = z.object({
  nama_warna: z.string().min(1, 'Nama warna wajib diisi'),
  yard_tersedia: z.number().positive('Yard harus lebih dari 0').optional(),
})
