// Edge function: tanda tangani upload Cloudinary agar API secret tidak terekspos ke client.
// Caller: `lib/cloudinary.js` di frontend via `getSignedParams`.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'node:crypto'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    // Verifikasi caller adalah user yang sudah login (Deera atau Jihan)
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: CORS })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return new Response('Unauthorized', { status: 401, headers: CORS })

    // Buat signed params
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')!
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY')!
    const { folder = 'sampel' } = await req.json().catch(() => ({}))

    const timestamp = Math.round(Date.now() / 1000)
    // Cloudinary signed upload: SHA1(params_sorted_asc + api_secret)
    // Tidak pakai upload_preset — cukup folder + timestamp
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    const signature = createHash('sha1').update(toSign).digest('hex')

    return new Response(
      JSON.stringify({ signature, timestamp, apiKey }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
