// Edit Profil — semua role bisa edit nama_panggilan & username mereka sendiri
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/useAuthStore'
import { updateProfil, ambilProfil } from '../auth'

const schema = z.object({
  nama_panggilan: z.string().min(1, 'Nama panggilan wajib diisi').max(50),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, dan underscore'),
})

export function EditProfilPage() {
  const navigate = useNavigate()
  const { user, profile, setSession } = useAuthStore()
  const [errorServer, setErrorServer] = useState(null)
  const [sukses, setSukses] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nama_panggilan: profile?.nama_panggilan ?? '',
      username: profile?.username ?? '',
    },
  })

  async function onSubmit(values) {
    setErrorServer(null)
    try {
      await updateProfil(values)
      // Refresh profil di store
      const profilBaru = await ambilProfil(user.id)
      setSession(user, profilBaru)
      setSukses(true)
      setTimeout(() => navigate(-1), 1200)
    } catch (err) {
      setErrorServer(err.message || 'Gagal menyimpan perubahan.')
    }
  }

  return (
    <div className="bg-champagne-100 min-h-screen">
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-navy-900 px-4 py-5">
        <button onClick={() => navigate(-1)} className="font-sans text-body text-champagne-100">
          &#8592;
        </button>
        <h1 className="font-heading text-heading text-champagne-100">EDIT PROFIL</h1>
      </div>

      <div className="px-4 py-6 space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block font-sans text-label text-charcoal-600 uppercase tracking-wide">
              Nama Panggilan
            </label>
            <input
              type="text"
              autoComplete="off"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500"
              {...register('nama_panggilan')}
            />
            {errors.nama_panggilan && (
              <p className="mt-1 font-sans text-label text-danger">{errors.nama_panggilan.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block font-sans text-label text-charcoal-600 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              autoComplete="off"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              {...register('username')}
            />
            {errors.username && (
              <p className="mt-1 font-sans text-label text-danger">{errors.username.message}</p>
            )}
            <p className="mt-1 font-sans text-label text-charcoal-300">
              Digunakan untuk login. Hanya huruf, angka, dan underscore.
            </p>
          </div>

          {errorServer && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 font-sans text-label text-danger">
              {errorServer}
            </p>
          )}

          {sukses && (
            <p className="rounded-xl bg-green-50 px-4 py-3 font-sans text-label text-green-700">
              Profil berhasil disimpan.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || sukses}
            className="w-full rounded-xl bg-navy-900 py-3.5 font-sans text-button font-bold tracking-wide text-champagne-100 disabled:opacity-60"
          >
            {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}
          </button>
        </form>
      </div>
    </div>
  )
}
