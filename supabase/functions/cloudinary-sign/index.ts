// Edge function: tanda tangani upload Cloudinary agar API secret tidak terekspos ke client.
// Caller: `lib/cloudinary.js` di frontend via `getSignedParams`.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'node:crypto'

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
    const uploadPreset = Deno.env.get('CLOUDINARY_UPLOAD_PRESET')!
    const { folder = 'sampel' } = await req.json().catch(() => ({}))

    const timestamp = Math.round(Date.now() / 1000)
    const toSign = `folder=${folder}&timestamp=${timestamp}&upload_preset=${uploadPreset}${apiSecret}`
    const signature = createHmac('sha256', apiSecret).update(toSign).digest('hex')

    return new Response(
      JSON.stringify({ signature, timestamp, apiKey, uploadPreset }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
