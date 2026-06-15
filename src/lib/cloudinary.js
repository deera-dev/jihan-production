/**
 * Helper upload foto ke Cloudinary (signed upload — secret key TIDAK PERNAH
 * berada di client, selalu via Edge Function `cloudinary-sign`).
 *
 * Alur (lihat architecture.md § Cloudinary — File Storage Foto Sampel):
 *   1. Client minta signature dari Edge Function `cloudinary-sign`
 *   2. Client upload langsung ke Cloudinary pakai signature tsb
 *   3. Cloudinary balas URL final (sudah lewat transformasi otomatis)
 */

import { supabase } from './supabase'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

/**
 * Minta signed params dari Edge Function `cloudinary-sign`.
 * Dipanggil tepat sebelum upload — timestamp harus fresh.
 * @param {string} folder - folder Cloudinary tujuan, mis. 'sampel/J-001-IMA'
 */
export async function getSignedParams(folder = 'sampel') {
  const { data, error } = await supabase.functions.invoke('cloudinary-sign', {
    body: { folder },
  })
  if (error) throw new Error(`Gagal mendapatkan signature upload: ${error.message}`)
  return data // { signature, timestamp, apiKey, uploadPreset }
}

/**
 * Upload foto sampel: minta signature dulu, lalu upload ke Cloudinary.
 * Shortcut yang menggabungkan getSignedParams + uploadFoto.
 */
export async function uploadFotoSampel(file, folder = 'sampel') {
  return uploadFoto(file, {
    folder,
    getSignedParams: () => getSignedParams(folder),
  })
}

/**
 * Upload satu file foto ke folder Cloudinary tertentu.
 * @param {File} file
 * @param {{ folder: string, getSignedParams: () => Promise<{ signature: string, timestamp: number, apiKey: string }> }} opts
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadFoto(file, { folder, getSignedParams }) {
  if (!CLOUD_NAME) {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME belum diisi di .env')
  }

  const { signature, timestamp, apiKey } = await getSignedParams()

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)
  // upload_preset tidak dipakai — signed upload pakai folder langsung

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    throw new Error(`Upload foto gagal (${res.status})`)
  }

  const data = await res.json()
  return { url: data.secure_url, publicId: data.public_id }
}
