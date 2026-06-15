// Zod schema validasi input fitur `auth`.

import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email atau username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const daftarSchema = z
  .object({
    nama_panggilan: z.string().min(1, 'Nama panggilan wajib diisi').max(50),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    username: z
      .string()
      .min(3, 'Username minimal 3 karakter')
      .max(30, 'Username maksimal 30 karakter')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    konfirmasiPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['konfirmasiPassword'],
  })

export const terimaUndanganSchema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter'),
    konfirmasiPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['konfirmasiPassword'],
  })
