// S-06 Buat Produksi — form satu halaman panjang dengan beberapa seksi.
// Info Produksi → Surat Jalan → Bahan dari Jihan (bisa banyak bahan)

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/useAuthStore'
import { useBuatProduksi, useBuatSuratJalan, useTambahBahan, useTambahWarnaBahan } from './hooks/useProduksi'
import { NumberInput } from '../../components/ui/NumberInput'

const formSchema = z.object({
  kode_bahan: z
    .string()
    .min(3, 'Kode bahan 3 huruf')
    .max(3, 'Kode bahan maks 3 huruf')
    .regex(/^[A-Za-z]+$/, 'Hanya huruf, contoh: IMA'),
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  catatan: z.string().optional(),
  nomor_surat_jalan: z.string().optional(),
  tanggal_terima: z.string().optional(),
  pengirim: z.string().optional(),
  catatan_sj: z.string().optional(),
  bahan: z.array(
    z.object({
      jenis_bahan: z.string().min(1, 'Wajib diisi'),
      tipe_bahan: z.enum(['primer', 'sekunder']),
      satuan: z.enum(['yard', 'panel']),
      harga_per_satuan: z.coerce.number().positive('Harus > 0'),
      jumlah_dibeli: z.coerce.number().positive('Harus > 0').optional().or(z.literal('')),
      warna: z.array(
        z.object({
          nama_warna: z.string().min(1, 'Wajib diisi'),
          yard_tersedia: z.coerce.number().positive('Harus > 0').optional().or(z.literal('')),
        })
      ).optional(),
    })
  ).optional(),
})

const bahanAwal = () => ({
  jenis_bahan: '',
  tipe_bahan: 'primer',
  satuan: 'yard',
  harga_per_satuan: '',
  jumlah_dibeli: '',
  warna: [{ nama_warna: '', yard_tersedia: '' }],
})

export function BuatProduksiPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [errorServer, setErrorServer] = useState(null)

  const { mutateAsync: buatProduksi, isPending: loadingProduksi } = useBuatProduksi()
  const { mutateAsync: buatSuratJalan } = useBuatSuratJalan(null)
  const { mutateAsync: tambahBahan } = useTambahBahan(null)
  const { mutateAsync: tambahWarnaBahan } = useTambahWarnaBahan(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode_bahan: '',
      tanggal: new Date().toISOString().slice(0, 10),
      catatan: '',
      nomor_surat_jalan: '',
      tanggal_terima: new Date().toISOString().slice(0, 10),
      pengirim: 'TIM JIHAN',
      catatan_sj: '',
      bahan: [bahanAwal()],
    },
  })

  const { fields: bahanFields, append: appendBahan, remove: removeBahan } = useFieldArray({
    control,
    name: 'bahan',
  })

  async function onSubmit(values) {
    setErrorServer(null)
    try {
      const produksi = await buatProduksi({
        kode_bahan: values.kode_bahan.toUpperCase(),
        tanggal: values.tanggal,
        catatan: values.catatan || undefined,
        created_by: user.id,
      })

      let suratJalanId = null
      if (values.tanggal_terima) {
        const sj = await buatSuratJalan({
          produksi_id: produksi.id,
          nomor_surat_jalan: values.nomor_surat_jalan || undefined,
          tanggal_terima: values.tanggal_terima,
          pengirim: values.pengirim || undefined,
          catatan: values.catatan_sj || undefined,
          created_by: user.id,
        })
        suratJalanId = sj.id
      }

      for (let i = 0; i < (values.bahan ?? []).length; i++) {
        const b = values.bahan[i]
        const bahan = await tambahBahan({
          produksi_id: produksi.id,
          surat_jalan_id: suratJalanId,
          jenis_bahan: b.jenis_bahan,
          tipe_bahan: b.tipe_bahan,
          satuan: b.satuan,
          harga_per_satuan: Number(b.harga_per_satuan),
          jumlah_dibeli: b.jumlah_dibeli ? Number(b.jumlah_dibeli) : undefined,
          urutan: i + 1,
        })

        if (b.tipe_bahan === 'primer' && b.warna?.length) {
          for (let j = 0; j < b.warna.length; j++) {
            const w = b.warna[j]
            if (w.nama_warna) {
              await tambahWarnaBahan({
                produksi_bahan_id: bahan.id,
                nama_warna: w.nama_warna,
                yard_tersedia: w.yard_tersedia ? Number(w.yard_tersedia) : undefined,
                urutan: j + 1,
              })
            }
          }
        }
      }

      navigate(`/produksi/${produksi.id}`, { replace: true })
    } catch (err) {
      setErrorServer(err?.message ?? 'Gagal menyimpan. Coba lagi.')
    }
  }

  const isProsesing = loadingProduksi || isSubmitting

  return (
    <div className="min-h-screen bg-champagne-100">
      <div className="flex items-center gap-3 bg-navy-900 px-4 py-5">
        <button onClick={() => navigate(-1)} className="font-sans text-body text-champagne-100">&#8592;</button>
        <h1 className="font-heading text-heading text-champagne-100">BUAT PRODUKSI</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-5 space-y-6" noValidate>

        <section>
          <p className="mb-3 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">INFO PRODUKSI</p>
          <div className="rounded-xl bg-surface border border-border p-4 space-y-4">

            <div>
              <label className="mb-1 block font-sans text-label text-charcoal-600">KODE BAHAN (3 HURUF) *</label>
              <input
                className="w-full rounded-lg border border-border bg-champagne-100 px-4 py-3 font-sans text-body uppercase text-navy-900 outline-none focus:border-gold-500"
                maxLength={3}
                {...register('kode_bahan')}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase()
                  register('kode_bahan').onChange(e)
                }}
              />
              <p className="mt-1 font-sans text-xs text-charcoal-300">
                Suffix kode desain: J-001-{watch('kode_bahan')?.toUpperCase() || 'IMA'}
              </p>
              {errors.kode_bahan && <p className="mt-1 font-sans text-label text-danger">{errors.kode_bahan.message}</p>}
            </div>

            <div>
              <label className="mb-1 block font-sans text-label text-charcoal-600">TANGGAL *</label>
              <input
                type="date"
                className="w-full rounded-lg border border-border bg-champagne-100 px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
                {...register('tanggal')}
              />
              {errors.tanggal && <p className="mt-1 font-sans text-label text-danger">{errors.tanggal.message}</p>}
            </div>

            <div>
              <label className="mb-1 block font-sans text-label text-charcoal-600">CATATAN</label>
              <input
                className="w-full rounded-lg border border-border bg-champagne-100 px-4 py-3 font-sans text-body uppercase text-navy-900 outline-none focus:border-gold-500"
                {...register('catatan')}
                onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register('catatan').onChange(e) }}
              />
            </div>
          </div>
        </section>

        <section>
          <p className="mb-3 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">SURAT JALAN</p>
          <div className="rounded-xl bg-surface border border-border p-4 space-y-4">

            <div>
              <label className="mb-1 block font-sans text-label text-charcoal-600">NOMOR SURAT JALAN</label>
              <input
                className="w-full rounded-lg border border-border bg-champagne-100 px-4 py-3 font-sans text-body uppercase text-navy-900 outline-none focus:border-gold-500"
                {...register('nomor_surat_jalan')}
                onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register('nomor_surat_jalan').onChange(e) }}
              />
            </div>

            <div>
              <label className="mb-1 block font-sans text-label text-charcoal-600">TANGGAL TERIMA *</label>
              <input
                type="date"
                className="w-full rounded-lg border border-border bg-champagne-100 px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
                {...register('tanggal_terima')}
              />
            </div>

            <div>
              <label className="mb-1 block font-sans text-label text-charcoal-600">PENGIRIM</label>
              <input
                className="w-full rounded-lg border border-border bg-champagne-100 px-4 py-3 font-sans text-body uppercase text-navy-900 outline-none focus:border-gold-500"
                {...register('pengirim')}
                onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register('pengirim').onChange(e) }}
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">BAHAN DARI JIHAN</p>
            <button
              type="button"
              onClick={() => appendBahan(bahanAwal())}
              className="font-sans text-label font-semibold text-gold-500"
            >
              + TAMBAH BAHAN
            </button>
          </div>

          <div className="space-y-4">
            {bahanFields.map((field, i) => {
              const tipe = watch(`bahan.${i}.tipe_bahan`)
              return (
                <BahanItem
                  key={field.id}
                  index={i}
                  tipe={tipe}
                  register={register}
                  control={control}
                  errors={errors?.bahan?.[i]}
                  watch={watch}
                  onHapus={bahanFields.length > 1 ? () => removeBahan(i) : null}
                />
              )
            })}
          </div>
        </section>

        {errorServer && (
          <p className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 font-sans text-label text-danger">
            {errorServer}
          </p>
        )}

        <button
          type="submit"
          disabled={isProsesing}
          className="w-full rounded-xl bg-navy-900 py-4 font-sans text-button font-semibold text-champagne-100 disabled:opacity-60"
        >
          {isProsesing ? 'MENYIMPAN...' : 'SIMPAN PRODUKSI'}
        </button>

        <div className="h-4" />
      </form>
    </div>
  )
}

function BahanItem({ index, tipe, register, control, errors, watch, onHapus }) {
  const { fields: warnaFields, append: appendWarna, remove: removeWarna } = useFieldArray({
    control,
    name: `bahan.${index}.warna`,
  })

  return (
    <div className="rounded-xl bg-surface border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-sans text-label font-semibold text-navy-900">BAHAN {index + 1}</p>
        {onHapus && (
          <button type="button" onClick={onHapus} className="font-sans text-label text-danger">
            HAPUS
          </button>
        )}
      </div>

      <div>
        <label className="mb-1 block font-sans text-label text-charcoal-600">JENIS BAHAN *</label>
        <input
          className="w-full rounded-lg border border-border bg-champagne-100 px-4 py-3 font-sans text-body uppercase text-navy-900 outline-none focus:border-gold-500"
          placeholder="MOTIF IMA, POLOS, PURING..."
          {...register(`bahan.${index}.jenis_bahan`)}
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase()
            register(`bahan.${index}.jenis_bahan`).onChange(e)
          }}
        />
        {errors?.jenis_bahan && <p className="mt-1 font-sans text-label text-danger">{errors.jenis_bahan.message}</p>}
      </div>

      <div>
        <label className="mb-2 block font-sans text-label text-charcoal-600">TIPE BAHAN *</label>
        <div className="flex gap-3">
          {[{ v: 'primer', l: 'PRIMER (MOTIF)' }, { v: 'sekunder', l: 'SEKUNDER (POLOS/PURING)' }].map(({ v, l }) => (
            <label key={v} className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-border bg-champagne-100 px-3 py-2.5 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-500/10">
              <input type="radio" value={v} {...register(`bahan.${index}.tipe_bahan`)} className="accent-gold-500" />
              <span className="font-sans text-xs text-navy-900">{l}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block font-sans text-label text-charcoal-600">SATUAN *</label>
        <div className="flex gap-3">
          {[{ v: 'yard', l: 'YARD' }, { v: 'panel', l: 'PANEL' }].map(({ v, l }) => (
            <label key={v} className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-border bg-champagne-100 px-3 py-2.5 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-500/10">
              <input type="radio" value={v} {...register(`bahan.${index}.satuan`)} className="accent-gold-500" />
              <span className="font-sans text-xs text-navy-900">{l}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block font-sans text-label text-charcoal-600">
          HARGA PER {watch(`bahan.${index}.satuan`)?.toUpperCase() ?? 'SATUAN'} (Rp) *
        </label>
        <Controller
          control={control}
          name={`bahan.${index}.harga_per_satuan`}
          render={({ field }) => (
            <NumberInput
              value={field.value}
              onChange={field.onChange}
              min={0}
              max={500000}
              step={500}
            />
          )}
        />
        {errors?.harga_per_satuan && <p className="mt-1 font-sans text-label text-danger">{errors.harga_per_satuan.message}</p>}
      </div>

      {tipe === 'sekunder' && (
        <div>
          <label className="mb-1 block font-sans text-label text-charcoal-600">
            JUMLAH DITERIMA ({watch(`bahan.${index}.satuan`)?.toUpperCase() ?? 'SATUAN'})
          </label>
          <Controller
            control={control}
            name={`bahan.${index}.jumlah_dibeli`}
            render={({ field }) => (
              <NumberInput
                value={field.value}
                onChange={field.onChange}
                min={0}
                max={9999}
                step={0.5}
                decimal
              />
            )}
          />
        </div>
      )}

      {tipe === 'primer' && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="font-sans text-label text-charcoal-600">WARNA BAHAN</label>
            <button
              type="button"
              onClick={() => appendWarna({ nama_warna: '', yard_tersedia: '' })}
              className="font-sans text-label font-semibold text-gold-500"
            >
              + WARNA
            </button>
          </div>
          <div className="space-y-3">
            {warnaFields.map((wf, j) => (
              <div key={wf.id} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    className="w-full rounded-lg border border-border bg-champagne-100 px-3 py-2.5 font-sans text-body uppercase text-navy-900 outline-none focus:border-gold-500"
                    placeholder="NAMA WARNA"
                    {...register(`bahan.${index}.warna.${j}.nama_warna`)}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase()
                      register(`bahan.${index}.warna.${j}.nama_warna`).onChange(e)
                    }}
                  />
                  <Controller
                    control={control}
                    name={`bahan.${index}.warna.${j}.yard_tersedia`}
                    render={({ field }) => (
                      <NumberInput
                        value={field.value}
                        onChange={field.onChange}
                        min={0}
                        max={9999}
                        step={0.5}
                        decimal
                        placeholder="YARD TERSEDIA"
                      />
                    )}
                  />
                </div>
                {warnaFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWarna(j)}
                    className="mt-2.5 font-sans text-label text-danger"
                  >
                    &#10005;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
