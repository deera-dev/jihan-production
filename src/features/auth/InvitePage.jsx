// Route-level component fitur `auth` — entry point penerimaan undangan.
// Diakses lewat link undangan email (lihat architecture.md § Invitation Flow:
// Deera undang Tim Jihan → user buat password pertama kali di sini).
// TODO: lengkapi UI sesuai wireframe.md & validasi token undangan dari URL.

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import { terimaUndangan } from './api/authRepository'
import { terimaUndanganSchema } from './schema'

export function InvitePage() {
  const navigate = useNavigate()
  const [errorServer, setErrorServer] = useState(/** @type {string | null} */ (null))

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(terimaUndanganSchema) })

  async function onSubmit(values) {
    setErrorServer(null)
    try {
      await terimaUndangan(values.password)
      navigate('/', { replace: true })
    } catch (err) {
      setErrorServer(err?.message ?? 'Gagal menyimpan password. Coba lagi.')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-champagne-100 px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-heading text-heading text-navy-900">
          SELAMAT DATANG
        </h1>
        <p className="mb-8 text-center font-sans text-body text-charcoal-600">
          BUAT PASSWORD UNTUK MENGAKTIFKAN AKUN ANDA
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="password" className="mb-1 block font-sans text-label text-charcoal-600">
              PASSWORD BARU
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 font-sans text-label text-danger">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="konfirmasiPassword" className="mb-1 block font-sans text-label text-charcoal-600">
              KONFIRMASI PASSWORD
            </label>
            <input
              id="konfirmasiPassword"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              {...register('konfirmasiPassword')}
            />
            {errors.konfirmasiPassword && (
              <p className="mt-1 font-sans text-label text-danger">{errors.konfirmasiPassword.message}</p>
            )}
          </div>

          {errorServer && <p className="font-sans text-label text-danger">{errorServer}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-navy-900 px-4 py-3 font-sans text-button text-champagne-100 transition-colors hover:bg-navy-700 disabled:opacity-60"
          >
            {isSubmitting ? 'MENYIMPAN...' : 'AKTIFKAN AKUN'}
          </button>
        </form>
      </div>
    </main>
  )
}
