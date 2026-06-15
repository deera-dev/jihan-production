// S-31 Kelola Pengguna — khusus Tim Deera (JP-004)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { ambilSemuaUser, undangPengguna } from '../auth'

const undangSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  nama_lengkap: z.string().min(1, 'Nama wajib diisi'),
  role: z.enum(['deera', 'jihan', 'master'], { required_error: 'Pilih role' }),
})

const OPSI_ROLE = [
  { value: 'jihan',  label: 'Tim Jihan',  desc: 'Read-only + approve' },
  { value: 'deera',  label: 'Tim Deera',  desc: 'Full CRUD' },
  { value: 'master', label: 'Master',     desc: 'Lihat semua role' },
]

const LABEL_ROLE = { deera: 'Tim Deera', jihan: 'Tim Jihan', master: 'Master' }

export function KelolaPenggunaPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formTerbuka, setFormTerbuka] = useState(false)
  const [sukses, setSukses] = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: ambilSemuaUser,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(undangSchema),
    defaultValues: { role: 'jihan' },
  })

  const { mutate: kirimUndangan, isPending, error: errorUndang } = useMutation({
    mutationFn: undangPengguna,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      reset()
      setSukses(true)
      setFormTerbuka(false)
    },
  })

  function onSubmit(values) {
    setSukses(false)
    kirimUndangan({ ...values, nama_lengkap: values.nama_lengkap.toUpperCase() })
  }

  return (
    <div className="bg-champagne-100">
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-navy-900 px-4 py-5">
        <button onClick={() => navigate(-1)} className="font-sans text-body text-champagne-100">&#8592;</button>
        <h1 className="font-heading text-heading text-champagne-100">KELOLA PENGGUNA</h1>
        <div className="flex-1" />
        <button
          onClick={() => { setFormTerbuka((v) => !v); setSukses(false) }}
          className="rounded-lg bg-gold-500 px-3 py-1.5 font-sans text-xs font-semibold text-navy-900"
        >
          + UNDANG
        </button>
      </div>

      <div className="px-4 py-5 space-y-4">
        {sukses && (
          <div className="rounded-xl bg-success/10 border border-success/30 px-4 py-3">
            <p className="font-sans text-label font-semibold text-success">
              Undangan berhasil dikirim ke email yang dituju.
            </p>
          </div>
        )}

        {formTerbuka && (
          <div className="rounded-xl bg-surface border border-border p-4 space-y-4">
            <p className="font-sans text-label font-semibold text-charcoal-600 uppercase tracking-widest">
              UNDANG PENGGUNA BARU
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="mb-1 block font-sans text-label text-charcoal-600">EMAIL *</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-border bg-champagne-100 px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
                  {...register('email')}
                />
                {errors.email && <p className="mt-1 font-sans text-label text-danger">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block font-sans text-label text-charcoal-600">NAMA LENGKAP *</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-champagne-100 px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500"
                  {...register('nama_lengkap')}
                />
                {errors.nama_lengkap && <p className="mt-1 font-sans text-label text-danger">{errors.nama_lengkap.message}</p>}
              </div>
              <div>
                <label className="mb-2 block font-sans text-label text-charcoal-600">ROLE *</label>
                <div className="flex flex-col gap-2">
                  {OPSI_ROLE.map((r) => (
                    <label key={r.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-champagne-100 px-4 py-3 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-500/10">
                      <input type="radio" value={r.value} {...register('role')} className="accent-gold-500" />
                      <div>
                        <span className="font-sans text-body font-semibold text-navy-900">{r.label}</span>
                        <span className="ml-2 font-sans text-xs text-charcoal-300">{r.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && <p className="mt-1 font-sans text-label text-danger">{errors.role.message}</p>}
              </div>
              {errorUndang && (
                <p className="font-sans text-label text-danger">
                  {errorUndang.message ?? 'Gagal mengirim undangan. Coba lagi.'}
                </p>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-navy-900 py-3 font-sans text-button text-champagne-100 disabled:opacity-60"
              >
                {isPending ? 'MENGIRIM...' : 'KIRIM UNDANGAN'}
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <p className="py-8 text-center font-sans text-body text-charcoal-300">MEMUAT...</p>
        ) : users.length === 0 ? (
          <p className="py-8 text-center font-sans text-body text-charcoal-300">Belum ada pengguna terdaftar.</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="rounded-xl bg-surface border border-border px-4 py-4">
                <p className="font-sans text-body font-semibold text-navy-900">
                  {u.nama_lengkap ?? '(Belum diisi)'}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-champagne-200 px-2.5 py-0.5 font-sans text-xs font-semibold text-charcoal-600 uppercase">
                    {LABEL_ROLE[u.role] ?? u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
