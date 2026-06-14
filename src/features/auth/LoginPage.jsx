// Route-level component fitur `auth` — entry point login.
// TODO: lengkapi UI sesuai wireframe.md (S-01 Login) & design-system.md
// (warna navy/gold, tombol besar, mobile-first dari 390px).

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useLocation } from 'react-router-dom'

import { useSession } from './hooks/useSession'
import { useLogin } from './hooks/useLogin'
import { loginSchema } from './schema'

export function LoginPage() {
  const { profile } = useSession()
  const location = useLocation()
  const [errorServer, setErrorServer] = useState(/** @type {string | null} */ (null))

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const { mutate, isPending } = useLogin()

  if (profile) {
    const tujuan = location.state?.from?.pathname ?? '/'
    return <Navigate to={tujuan} replace />
  }

  function onSubmit(values) {
    setErrorServer(null)
    mutate(values, {
      onError: (err) => setErrorServer(err.message ?? 'Login gagal. Periksa email & password.'),
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-champagne-100 px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-heading text-heading text-navy-900">
          JIHAN PRODUCTION
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block font-sans text-label text-charcoal-600">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 font-sans text-label text-danger">{errors.email.message}</p>
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
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 font-sans text-label text-danger">{errors.password.message}</p>
            )}
          </div>

          {errorServer && <p className="font-sans text-label text-danger">{errorServer}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-navy-900 px-4 py-3 font-sans text-button text-champagne-100 transition-colors hover:bg-navy-700 disabled:opacity-60"
          >
            {isPending ? 'MEMPROSES...' : 'MASUK'}
          </button>
        </form>
      </div>
    </main>
  )
}
