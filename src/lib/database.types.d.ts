// AUTO-GENERATED dari supabase/migrations/*.sql — JANGAN edit manual.
// Regenerasi: jalankan `node scripts/gen-db-types.mjs` setiap skema berubah.
// Dipakai via JSDoc utk type-checking di repository layer (proyek tetap .jsx, bukan full TS).
//   contoh: /** @type {import("./database.types").Tables<"kode">} */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: string
          nama_lengkap: string | null
          created_at: string
        }
      }
      produksi: {
        Row: {
          id: string
          kode_bahan: string
          tanggal: string
          catatan: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
      }
      surat_jalan: {
        Row: {
          id: string
          produksi_id: string
          nomor_surat_jalan: string | null
          tanggal_terima: string
          pengirim: string | null
          catatan: string | null
          created_by: string | null
          created_at: string
        }
      }
      produksi_bahan: {
        Row: {
          id: string
          produksi_id: string
          surat_jalan_id: string | null
          jenis_bahan: string
          tipe_bahan: string
          satuan: string
          harga_per_satuan: number
          jumlah_dibeli: number | null
          konsumsi_per_pcs: number | null
          satuan_konsumsi: string | null
          urutan: number
          created_at: string
          updated_at: string
        }
      }
      produksi_bahan_warna: {
        Row: {
          id: string
          produksi_bahan_id: string
          nama_warna: string
          yard_tersedia: number | null
          yard_terpakai: number | null
          urutan: number
          created_at: string
        }
      }
      kode_sequence: {
        Row: {
          id: string
          last_number: number
          updated_at: string
        }
      }
      kode: {
        Row: {
          id: string
          produksi_id: string
          kode_desain: string
          harga_jual_target: number | null
          catatan: string | null
          urutan: number
          status: string
          status_sebelum_dibatalkan: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
      }
      kode_ukuran: {
        Row: {
          id: string
          kode_id: string
          ukuran: string
          urutan: number
        }
      }
      kode_ukuran_warna: {
        Row: {
          id: string
          kode_ukuran_id: string
          nama_warna: string
          jumlah_pcs: number
        }
      }
      sampel: {
        Row: {
          id: string
          kode_id: string
          foto_depan_url: string
          foto_belakang_url: string
          status: string
          alasan_ditolak: string | null
          versi: number
          created_by: string | null
          created_at: string
        }
      }
      sampel_catatan: {
        Row: {
          id: string
          sampel_id: string
          user_id: string | null
          isi: string
          created_at: string
        }
      }
      hpp: {
        Row: {
          id: string
          kode_id: string | null
          jasa_komponen: Json | null
          snapshot_bahan_primer: Json | null
          snapshot_bahan_sekunder: Json | null
          snapshot_bahan_baku: Json | null
          total_hpp_jasa: number | null
          total_nilai_bahan: number | null
          total_bahan_baku: number | null
          total_hpp_per_baju: number | null
          status: string
          alasan_tolak: string | null
          submitted_at: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
      }
      hpp_revisi: {
        Row: {
          id: string
          hpp_id: string
          komponen: string
          nilai_lama: Json | null
          nilai_baru: Json | null
          alasan: string | null
          changed_by: string | null
          created_at: string
        }
      }
      hpp_template_komponen: {
        Row: {
          id: string
          nama: string
          nilai_min: number
          nilai_max: number
          urutan: number
          is_default: boolean
          updated_by: string | null
          updated_at: string
        }
      }
      katalog_bahan_baku: {
        Row: {
          id: string
          nama: string
          tipe: string
          satuan: string | null
          harga_terkini: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      nota_pembelian: {
        Row: {
          id: string
          tanggal: string
          catatan: string | null
          total_nilai: number | null
          created_by: string | null
          created_at: string
        }
      }
      nota_item: {
        Row: {
          id: string
          nota_id: string
          katalog_id: string | null
          nama_custom: string | null
          tipe: string
          qty: number | null
          harga_satuan: number | null
          total_nilai: number
          created_at: string
        }
      }
      nota_item_kode: {
        Row: {
          id: string
          nota_item_id: string
          kode_id: string
        }
      }
      tracking_produksi: {
        Row: {
          id: string
          kode_ukuran_warna_id: string
          tahap: string
          pcs_done: number
          updated_by: string | null
          updated_at: string
        }
      }
      tracking_reject: {
        Row: {
          id: string
          tracking_produksi_id: string
          pcs_reject: number
          alasan: string
          nasib: string
          bahan_tersedia: boolean | null
          catatan: string | null
          created_by: string | null
          created_at: string
        }
      }
      pengiriman: {
        Row: {
          id: string
          kode_id: string
          tanggal: string | null
          catatan: string | null
          status_approval: string
          approved_by: string | null
          approved_at: string | null
          created_by: string | null
          created_at: string
        }
      }
      pengiriman_item: {
        Row: {
          id: string
          pengiriman_id: string
          nama_warna: string
          jumlah_pcs: number
        }
      }
      kasbon: {
        Row: {
          id: string
          tanggal: string
          tipe: string
          nominal: number
          kode_id: string | null
          catatan: string | null
          created_by: string | null
          created_at: string
          deleted_at: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          judul: string
          isi: string
          entity_type: string | null
          entity_id: string | null
          is_read: boolean
          created_at: string
          deleted_at: string | null
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          mode: string
          jam_digest: string
          updated_at: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          aksi: string
          entity_type: string | null
          entity_id: string | null
          deskripsi: string
          data_before: Json | null
          data_after: Json | null
          created_at: string
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
      }
    }
    Views: {
      kasbon_dengan_saldo_berjalan: { Row: Record<string, Json> }
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"]
