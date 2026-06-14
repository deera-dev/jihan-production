// Regenerasi src/lib/database.types.d.ts dari supabase/migrations/*.sql
// Jalankan: node scripts/gen-db-types.mjs
//
// Catatan: ini adalah generator ringan berbasis parsing teks CREATE TABLE —
// cukup untuk skema saat ini (kolom tipe dasar Postgres). Kalau skema makin
// kompleks (enum custom, domain, dll), pertimbangkan migrasi ke
// `supabase gen types typescript` resmi yang membaca langsung dari database.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MIGRATIONS_DIR = join(ROOT, 'supabase', 'migrations')
const OUT_FILE = join(ROOT, 'src', 'lib', 'database.types.d.ts')

const PG_TO_TS = {
  uuid: 'string',
  text: 'string',
  date: 'string',        // ISO date string
  timestamptz: 'string', // ISO timestamp string
  time: 'string',
  integer: 'number',
  numeric: 'number',
  boolean: 'boolean',
  jsonb: 'Json',
}

const COL_RE = /^(\w+)\s+(uuid|text|integer|numeric|boolean|timestamptz|date|time|jsonb)(\([^)]*\))?/
const TABLE_RE = /create table public\.(\w+)\s*\(([\s\S]*?)\n\);/g
const VIEW_RE = /create view public\.(\w+)/g

const tables = []
const views = []

const files = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()

for (const file of files) {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')

  for (const m of sql.matchAll(TABLE_RE)) {
    const [, tableName, body] = m
    const cols = []
    for (const raw of body.split('\n')) {
      const line = raw.trim().replace(/,$/, '')
      if (!line || /^(--|unique|check|foreign)/i.test(line)) continue
      const cm = line.match(COL_RE)
      if (!cm) continue
      const [, col, pgType] = cm
      const nullable = !/not null/i.test(line) && !/primary key/i.test(line)
      cols.push({ col, ts: PG_TO_TS[pgType], nullable })
    }
    tables.push({ name: tableName, cols })
  }

  for (const m of sql.matchAll(VIEW_RE)) {
    views.push(m[1])
  }
}

const lines = []
lines.push('// AUTO-GENERATED dari supabase/migrations/*.sql — JANGAN edit manual.')
lines.push('// Regenerasi: jalankan `node scripts/gen-db-types.mjs` setiap skema berubah.')
lines.push('// Dipakai via JSDoc utk type-checking di repository layer (proyek tetap .jsx, bukan full TS).')
lines.push('//   contoh: /** @type {import("./database.types").Tables<"kode">} */')
lines.push('')
lines.push('export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]')
lines.push('')
lines.push('export interface Database {')
lines.push('  public: {')
lines.push('    Tables: {')
for (const { name, cols } of tables) {
  lines.push(`      ${name}: {`)
  lines.push('        Row: {')
  for (const { col, ts, nullable } of cols) {
    lines.push(`          ${col}: ${ts}${nullable ? ' | null' : ''}`)
  }
  lines.push('        }')
  lines.push('      }')
}
lines.push('    }')
lines.push('    Views: {')
for (const v of views) {
  lines.push(`      ${v}: { Row: Record<string, Json> }`)
}
lines.push('    }')
lines.push('  }')
lines.push('}')
lines.push('')
lines.push('export type Tables<T extends keyof Database["public"]["Tables"]> =')
lines.push('  Database["public"]["Tables"][T]["Row"]')
lines.push('')
lines.push('export type Views<T extends keyof Database["public"]["Views"]> =')
lines.push('  Database["public"]["Views"][T]["Row"]')
lines.push('')

writeFileSync(OUT_FILE, lines.join('\n'))
console.log(`✓ Generated ${tables.length} table types + ${views.length} view types → ${OUT_FILE}`)
