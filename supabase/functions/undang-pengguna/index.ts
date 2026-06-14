// Edge Function: undang-pengguna
// Dipanggil dari frontend (Deera) untuk mengundang user baru.
// Membutuhkan SUPABASE_SERVICE_ROLE_KEY sebagai environment variable
// (set lewat Supabase Dashboard → Project Settings → Edge Functions).
//
// Deploy: supabase functions deploy undang-pengguna

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Pre-flight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validasi: hanya boleh diakses oleh user yang sudah login (JWT valid)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Tidak terautentikasi' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Client dengan anon key untuk cek role pemanggil
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    // Pastikan pemanggil adalah Tim Deera
    const { data: profil, error: errProfil } = await supabaseClient
      .from('users')
      .select('role')
      .single()
    if (errProfil || profil?.role !== 'deera') {
      return new Response(JSON.stringify({ error: 'Hanya Tim Deera yang bisa mengundang pengguna' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Baca body
    const { email, nama_lengkap, role } = await req.json()

    if (!email || !role || !['deera', 'jihan'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Email dan role wajib diisi (deera / jihan)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Client dengan service role key untuk admin.inviteUserByEmail
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role, nama_lengkap: (nama_lengkap ?? '').toUpperCase() },
    })

    if (error) {
      // Tangani error "user sudah terdaftar" dengan pesan ramah
      const pesan = error.message.includes('already been registered')
        ? 'Email ini sudah terdaftar. Gunakan email lain.'
        : error.message
      return new Response(JSON.stringify({ error: pesan }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ sukses: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
