import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { daftar } from './api/authRepository'
import { daftarSchema } from './schema'

export function RegisterPage() {
  const [sukses, setSukses] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(daftarSchema),
  })

  const { mutate, isPending, error: errorServer } = useMutation({
    mutationFn: (values) =>
      daftar({
        email: values.email,
        password: values.password,
        username: values.username,
        nama_panggilan: values.nama_panggilan,
      }),
    onSuccess: () => setSukses(true),
  })

  function onSubmit(values) {
    mutate(values)
  }

  if (sukses) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-champagne-100 px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="font-heading text-heading text-navy-900">PENDAFTARAN BERHASIL</h1>
          <p className="font-sans text-sm text-charcoal-600 leading-relaxed">
            Akun Anda sudah terdaftar dan sedang menunggu persetujuan admin.
            Anda akan mendapat notifikasi setelah akun diaktifkan.
          </p>
          <Link
            to="/login"
            className="block w-full rounded-xl bg-navy-900 px-4 py-3.5 text-center font-sans text-button font-bold tracking-wide text-champagne-100 active:opacity-80"
          >
            KE HALAMAN LOGIN
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-champagne-100 px-6 py-10">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-500">
            BUAT AKUN
          </p>
          <h1 className="font-heading text-heading text-navy-900">DAFTAR</h1>
          <p className="mt-1 font-sans text-sm text-charcoal-300">
            Setelah mendaftar, akun Anda perlu disetujui admin sebelum bisa digunakan.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Nama Panggilan */}
          <div>
            <label className="mb-1 block font-sans text-label text-charcoal-600">
              NAMA PANGGILAN
            </label>
            <input
              type="text"
              autoComplete="given-name"
              placeholder="Contoh: Budi"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-body text-navy-900 uppercase placeholder:normal-case placeholder:text-charcoal-300 outline-none focus:border-gold-500"
              {...register('nama_panggilan')}
            />
            {errors.nama_panggilan && (
              <p className="mt-1 font-sans text-label text-danger">{errors.nama_panggilan.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="mb-1 block font-sans text-label text-charcoal-600">
              USERNAME
            </label>
            <input
              type="text"
              autoComplete="username"
              placeholder="Contoh: budi123"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-body text-navy-900 placeholder:text-charcoal-300 outline-none focus:border-gold-500"
              {...register('username')}
            />
            <p className="mt-1 font-sans text-xs text-charcoal-300">
              Hanya huruf, angka, dan underscore. Dipakai untuk login.
            </p>
            {errors.username && (
              <p className="mt-1 font-sans text-label text-danger">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block font-sans text-label text-charcoal-600">
              EMAIL
            </label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 font-sans text-label text-danger">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block font-sans text-label text-charcoal-600">
              PASSWORD
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-body text-navy-900 placeholder:text-charcoal-300 outline-none focus:border-gold-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 font-sans text-label text-danger">{errors.password.message}</p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="mb-1 block font-sans text-label text-charcoal-600">
              KONFIRMASI PASSWORD
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              {...register('konfirmasiPassword')}
            />
            {errors.konfirmasiPassword && (
              <p className="mt-1 font-sans text-label text-danger">{errors.konfirmasiPassword.message}</p>
            )}
          </div>

          {errorServer && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 font-sans text-label text-danger">
              {errorServer.message || 'Pendaftaran gagal. Coba lagi.'}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-navy-900 px-4 py-3.5 font-sans text-button font-bold tracking-wide text-champagne-100 disabled:opacity-60 active:opacity-80"
          >
            {isPending ? 'MENDAFTAR...' : 'DAFTAR'}
          </button>
        </form>

        <p className="mt-6 text-center font-sans text-sm text-charcoal-300">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-gold-500">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  )
}
