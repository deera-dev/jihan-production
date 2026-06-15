import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation } from 'react-router-dom'

import { useSession } from './hooks/useSession'
import { useLogin } from './hooks/useLogin'
import { loginSchema } from './schema'

export function LoginPage() {
  const { profile } = useSession()
  const location = useLocation()
  const [errorServer, setErrorServer] = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const { mutate, isPending } = useLogin()

  if (profile) {
    // Pending user → halaman menunggu
    if (profile.status === 'pending') return <Navigate to="/menunggu" replace />
    const tujuan = location.state?.from?.pathname ?? '/'
    return <Navigate to={tujuan} replace />
  }

  function onSubmit(values) {
    setErrorServer(null)
    mutate(values, {
      onError: (err) => {
        const msg = err.message ?? ''
        setErrorServer(
          msg.includes('Invalid login') || msg.includes('invalid_credentials')
            ? 'Email/username atau password salah.'
            : msg || 'Login gagal. Periksa kembali data Anda.'
        )
      },
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-champagne-100 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-500">
            SELAMAT DATANG
          </p>
          <h1 className="font-heading text-heading text-navy-900">JIHAN PRODUCTION</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="identifier" className="mb-1 block font-sans text-label text-charcoal-600">
              EMAIL ATAU USERNAME
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              {...register('identifier')}
            />
            {errors.identifier && (
              <p className="mt-1 font-sans text-label text-danger">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-sans text-label text-charcoal-600">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 font-sans text-label text-danger">{errors.password.message}</p>
            )}
          </div>

          {errorServer && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 font-sans text-label text-danger">
              {errorServer}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-navy-900 px-4 py-3.5 font-sans text-button font-bold tracking-wide text-champagne-100 disabled:opacity-60 active:opacity-80"
          >
            {isPending ? 'MEMPROSES...' : 'MASUK'}
          </button>
        </form>

        <p className="mt-6 text-center font-sans text-sm text-charcoal-300">
          Belum punya akun?{' '}
          <Link to="/daftar" className="font-semibold text-gold-500">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  )
}
