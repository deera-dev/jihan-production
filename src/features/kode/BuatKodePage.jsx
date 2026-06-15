// S-08 Buat Kode Baru — form tambah kode ke dalam suatu produksi.

// Hanya diakses Tim Deera. Biasanya navigasi dari ProduksiDetailPage.



import { useEffect } from 'react'

import { useNavigate, useSearchParams } from 'react-router-dom'

import { useForm, Controller } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { buatKodeSchema, UKURAN_OPTIONS } from './schema'

import { useBuatKode } from './hooks/useKode'

import { useNomorKodeBerikutnya } from '../produksi/hooks/useProduksi'

import { useDetailProduksi } from '../produksi/hooks/useProduksi'



export function BuatKodePage() {

  const navigate = useNavigate()

  const [params] = useSearchParams()

  const produksiId = params.get('produksiId')



  const { data: produksi } = useDetailProduksi(produksiId)

  const { data: nomorBerikutnya } = useNomorKodeBerikutnya()

  const buatKodeMutation = useBuatKode()



  const {

    register,

    handleSubmit,

    control,

    watch,

    setValue,

    formState: { errors, isSubmitting },

  } = useForm({

    resolver: zodResolver(buatKodeSchema),

    defaultValues: {

      nomor: '',

      kode_bahan: produksi?.kode_bahan ?? '',

      ukuran: [],

      catatan: '',

    },

  })



  // Pre-fill nomor saat data tersedia

  useEffect(() => {

    if (nomorBerikutnya) {

      setValue('nomor', String(nomorBerikutnya).padStart(3, '0'))

    }

  }, [nomorBerikutnya, setValue])



  // Sync kode_bahan dari produksi

  useEffect(() => {

    if (produksi?.kode_bahan) setValue('kode_bahan', produksi.kode_bahan)

  }, [produksi, setValue])



  const nomor = watch('nomor')

  const kodeBahan = watch('kode_bahan')?.toUpperCase()

  const preview = nomor && kodeBahan ? `J-${nomor}-${kodeBahan}` : '\u2014'



  async function onSubmit(values) {

    const kode_desain = `J-${values.nomor}-${values.kode_bahan.toUpperCase()}`

    const kode = await buatKodeMutation.mutateAsync({

      produksi_id: produksiId,

      kode_desain,

      ukuran: values.ukuran,

      catatan: values.catatan || null,

      urutan: 1,

    })

    navigate(`/kode/${kode.id}`)

  }



  return (

    <div className="bg-champagne-100">

      {/* Header */}

      <div className="sticky top-0 z-30 flex items-center gap-3 bg-navy-900 px-4 py-5">

        <button

          onClick={() => navigate(-1)}

          className="font-sans text-sm text-champagne-100 opacity-70 active:opacity-100"

        >

          &#8592; KEMBALI

        </button>

        <h1 className="font-heading text-heading text-champagne-100">KODE BARU</h1>

      </div>



      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-6 space-y-6">



        {/* Preview kode */}

        <div className="rounded-xl bg-navy-900 px-5 py-4 text-center">

          <p className="font-sans text-label text-champagne-100 opacity-60 uppercase">Preview kode</p>

          <p className="mt-1 font-heading text-2xl text-gold-500 tracking-widest">{preview}</p>

        </div>



        {/* Nomor urut */}

        <div>

          <label className="block font-sans text-label font-semibold text-charcoal-600 uppercase mb-1.5">

            Nomor Urut

          </label>

          <input

            {...register('nomor')}

            maxLength={3}

            placeholder="001"

            onChange={(e) => setValue('nomor', e.target.value.replace(/\D/g, ''))}

            className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-mono text-body text-navy-900 outline-none focus:border-gold-500"

          />

          {errors.nomor && (

            <p className="mt-1 font-sans text-xs text-danger">{errors.nomor.message}</p>

          )}

        </div>



        {/* Kode Bahan */}

        <div>

          <label className="block font-sans text-label font-semibold text-charcoal-600 uppercase mb-1.5">

            Kode Bahan

          </label>

          <input

            {...register('kode_bahan')}

            maxLength={3}

            placeholder="IMA"

            onChange={(e) =>

              setValue('kode_bahan', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))

            }

            className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-mono text-body text-navy-900 uppercase outline-none focus:border-gold-500"

          />

          {errors.kode_bahan && (

            <p className="mt-1 font-sans text-xs text-danger">{errors.kode_bahan.message}</p>

          )}

        </div>



        {/* Ukuran */}

        <div>

          <label className="block font-sans text-label font-semibold text-charcoal-600 uppercase mb-2">

            Ukuran

          </label>

          <Controller

            name="ukuran"

            control={control}

            render={({ field }) => (

              <div className="grid grid-cols-2 gap-2">

                {UKURAN_OPTIONS.map((u) => {

                  const checked = field.value.includes(u)

                  return (

                    <button

                      key={u}

                      type="button"

                      onClick={() => {

                        if (checked) {

                          field.onChange(field.value.filter((v) => v !== u))

                        } else {

                          field.onChange([...field.value, u])

                        }

                      }}

                      className={[

                        'rounded-xl border px-4 py-3 font-sans text-label font-semibold transition-colors',

                        checked

                          ? 'border-gold-500 bg-gold-500/10 text-navy-900'

                          : 'border-border bg-surface text-charcoal-600',

                      ].join(' ')}

                    >

                      {u}

                    </button>

                  )

                })}

              </div>

            )}

          />

          {errors.ukuran && (

            <p className="mt-1.5 font-sans text-xs text-danger">{errors.ukuran.message}</p>

          )}

        </div>



        {/* Catatan opsional */}

        <div>

          <label className="block font-sans text-label font-semibold text-charcoal-600 uppercase mb-1.5">

            Catatan{' '}

            <span className="font-normal text-charcoal-300 normal-case">(opsional)</span>

          </label>

          <textarea

            {...register('catatan')}

            rows={3}

            onChange={(e) => setValue('catatan', e.target.value.toUpperCase())}

            className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500 resize-none"

          />

        </div>



        {/* Error global */}

        {buatKodeMutation.error && (

          <p className="rounded-xl bg-danger/10 px-4 py-3 font-sans text-label text-danger">

            {buatKodeMutation.error.message}

          </p>

        )}



        {/* Submit */}

        <button

          type="submit"

          disabled={isSubmitting || buatKodeMutation.isPending}

          className="w-full rounded-xl bg-gold-500 py-4 font-sans text-body font-semibold text-navy-900 disabled:opacity-50"

        >

          {buatKodeMutation.isPending ? 'MENYIMPAN...' : 'SIMPAN KODE'}

        </button>

      </form>

    </div>

  )

}

