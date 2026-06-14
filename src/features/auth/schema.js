// Zod schema validasi input fitur `auth`.
// Dipakai bersama react-hook-form (resolver) di komponen form.

import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
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
