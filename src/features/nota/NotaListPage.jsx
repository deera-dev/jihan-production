// Task #62 — Nota Biaya (menggantikan HPP Kalkulator).
// Hanya Deera yang bisa akses (route guard + RLS).

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNotaByProduksi, useBuatNota } from "./hooks/useNota";
import { useDaftarProduksi } from "../produksi/hooks/useProduksi";
import { useAuthStore, selectProfile } from "../../store/useAuthStore";
import { formatRp } from "../../utils/formatRp";
import { formatTanggal } from "../../utils/formatTanggal";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const AKSESORIS_DEFAULT = [
  { nama: "LABEL BESAR", harga_per_baju: 150 },
  { nama: "LABEL KECIL", harga_per_baju: 50 },
  { nama: "HANGTAG", harga_per_baju: 150 },
  { nama: "PLASTIK", harga_per_baju: 1750 },
  { nama: "PLAT BESI (PIN)", harga_per_baju: 2500 },
];

const BIAYA_PRODUKSI_DEFAULT = {
  jahit: 25000,
  potong: 4000,
  finishing: 3500,
  atk: 2500,
  tampilkan_rincian: false,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function totalBiayaProduksi(bp) {
  return (
    (bp.jahit || 0) + (bp.potong || 0) + (bp.finishing || 0) + (bp.atk || 0)
  );
}

function hitungBiayaBahan(bahan) {
  // MOTIF: biaya = sum(warna.yard * harga_per_satuan) / pcs_baju
  // TAMBAHAN: biaya = total_pemakaian * harga_per_satuan / pcs_baju
  if (!bahan.harga_per_satuan || !bahan.pcs_baju || bahan.pcs_baju === 0)
    return 0;
  if (bahan.tipe_bahan === "primer") {
    const totalYard = (bahan.pemakaian_warna || []).reduce(
      (s, w) => s + (w.yard || 0),
      0,
    );
    return Math.round((totalYard * bahan.harga_per_satuan) / bahan.pcs_baju);
  }
  return Math.round(
    ((bahan.total_pemakaian || 0) * bahan.harga_per_satuan) / bahan.pcs_baju,
  );
}

// ─── Sub-komponen: ItemBahan ──────────────────────────────────────────────────

function ItemBahan({ item, warnaList, totalPcs, onChange, onHapus }) {
  const biayaPerBaju = hitungBiayaBahan(item);

  function setField(key, val) {
    onChange({ ...item, [key]: val });
  }

  function setWarna(idx, key, val) {
    const warna = [...(item.pemakaian_warna || [])];
    warna[idx] = { ...warna[idx], [key]: val };
    onChange({ ...item, pemakaian_warna: warna });
  }

  function tambahWarna() {
    const warna = [...(item.pemakaian_warna || []), { nama: "", yard: 0 }];
    onChange({ ...item, pemakaian_warna: warna });
  }

  function hapusWarna(idx) {
    const warna = (item.pemakaian_warna || []).filter((_, i) => i !== idx);
    onChange({ ...item, pemakaian_warna: warna });
  }

  const totalYardMotif = (item.pemakaian_warna || []).reduce(
    (s, w) => s + (w.yard || 0),
    0,
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
      {/* Header bahan */}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm font-semibold uppercase text-navy-900 placeholder:normal-case placeholder:font-normal placeholder:text-charcoal-300"
          placeholder="Nama bahan (contoh: TRIKOT MOTIF BUNGA)"
          value={item.nama || ""}
          onChange={(e) => setField("nama", e.target.value.toUpperCase())}
        />
        <button
          onClick={onHapus}
          className="shrink-0 rounded-xl border border-danger px-3 py-2 font-sans text-xs font-bold text-danger active:opacity-70"
        >
          HAPUS
        </button>
      </div>

      {/* Toggle tipe */}
      <div className="flex gap-2">
        <button
          onClick={() =>
            onChange({
              ...item,
              tipe_bahan: "primer",
              pemakaian_warna: item.pemakaian_warna?.length
                ? item.pemakaian_warna
                : warnaList.map((n) => ({ nama: n, yard: 0 })),
            })
          }
          className={[
            "flex-1 rounded-xl border py-2 font-sans text-xs font-bold tracking-wide transition-colors",
            item.tipe_bahan === "primer"
              ? "border-gold-500 bg-gold-500 text-navy-900"
              : "border-border text-charcoal-300",
          ].join(" ")}
        >
          MOTIF
        </button>
        <button
          onClick={() =>
            onChange({ ...item, tipe_bahan: "sekunder", pemakaian_warna: [] })
          }
          className={[
            "flex-1 rounded-xl border py-2 font-sans text-xs font-bold tracking-wide transition-colors",
            item.tipe_bahan === "sekunder"
              ? "border-navy-900 bg-navy-900 text-champagne-100"
              : "border-border text-charcoal-300",
          ].join(" ")}
        >
          TAMBAHAN
        </button>
      </div>

      {/* MOTIF: per-warna */}
      {item.tipe_bahan === "primer" && (
        <div className="space-y-2">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-300">
            PEMAKAIAN PER WARNA (YARD)
          </p>
          {(item.pemakaian_warna || []).map((w, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2 font-sans text-xs uppercase text-navy-900 placeholder:normal-case placeholder:font-normal placeholder:capitalize"
                placeholder="Nama warna"
                value={w.nama || ""}
                onChange={(e) =>
                  setWarna(idx, "nama", e.target.value.toUpperCase())
                }
              />
              <div className="flex w-24 shrink-0 items-center gap-1 rounded-xl border border-border bg-surface px-2 py-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full bg-transparent font-sans text-xs text-navy-900 outline-none"
                  placeholder="0"
                  value={w.yard || ""}
                  onChange={(e) =>
                    setWarna(idx, "yard", parseFloat(e.target.value) || 0)
                  }
                />
                <span className="shrink-0 font-sans text-xs text-charcoal-300">
                  yd
                </span>
              </div>
              <button
                onClick={() => hapusWarna(idx)}
                className="shrink-0 font-sans text-sm font-bold text-danger active:opacity-70"
              >
                &#x2715;
              </button>
            </div>
          ))}
          <button
            onClick={tambahWarna}
            className="font-sans text-xs font-semibold text-gold-500 active:opacity-70"
          >
            + TAMBAH WARNA
          </button>
          <div className="flex items-center justify-between rounded-xl bg-champagne-100 px-3 py-2">
            <span className="font-sans text-xs text-charcoal-600">
              Total {(item.pemakaian_warna || []).length} warna
            </span>
            <span className="font-sans text-xs font-semibold text-navy-900">
              {totalYardMotif.toLocaleString("id-ID")} yard
            </span>
          </div>
        </div>
      )}

      {/* TAMBAHAN: total pemakaian */}
      {item.tipe_bahan === "sekunder" && (
        <div className="space-y-2">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-300">
            TOTAL PEMAKAIAN
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.1"
              className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 font-sans text-sm text-navy-900"
              placeholder="0"
              value={item.total_pemakaian || ""}
              onChange={(e) =>
                setField("total_pemakaian", parseFloat(e.target.value) || 0)
              }
            />
            <span className="font-sans text-xs text-charcoal-300">
              yard / panel
            </span>
          </div>
        </div>
      )}

      {/* Harga & pcs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 font-sans text-xs text-charcoal-300">
            HARGA / YARD
          </p>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-2">
            <span className="font-sans text-xs text-charcoal-300">Rp</span>
            <input
              type="number"
              min="0"
              className="w-full bg-transparent font-sans text-sm text-navy-900 outline-none"
              placeholder="0"
              value={item.harga_per_satuan || ""}
              onChange={(e) =>
                setField("harga_per_satuan", parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>
        <div>
          <p className="mb-1 font-sans text-xs text-charcoal-300">UNTUK BAJU</p>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-2">
            <input
              type="number"
              min="1"
              className="w-full bg-transparent font-sans text-sm text-navy-900 outline-none"
              placeholder={totalPcs || "0"}
              value={item.pcs_baju || ""}
              onChange={(e) =>
                setField("pcs_baju", parseInt(e.target.value) || 0)
              }
            />
            <span className="font-sans text-xs text-charcoal-300">pcs</span>
          </div>
        </div>
      </div>

      {/* Ringkasan biaya */}
      <div className="flex items-center justify-between rounded-xl bg-navy-900 px-4 py-3">
        <div>
          <p className="font-sans text-xs text-white/70">
            {item.tipe_bahan === "primer"
              ? `${totalYardMotif.toLocaleString("id-ID")} yard total`
              : `${(item.total_pemakaian || 0).toLocaleString("id-ID")} yard / panel`}
          </p>
          <p className="font-sans text-xs text-white/60">
            untuk {(item.pcs_baju || totalPcs || 0).toLocaleString("id-ID")}{" "}
            baju
          </p>
        </div>
        <div className="text-right">
          <p className="font-sans text-xs text-white/60">Per baju</p>
          <p className="font-heading text-lg font-bold text-gold-300">
            {formatRp(biayaPerBaju)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-komponen: ItemAksesoris ──────────────────────────────────────────────

function ItemAksesoris({ item, onChange, onHapus }) {
  return (
    <div className="flex items-center gap-2">
      <input
        className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 font-sans text-xs uppercase text-navy-900 placeholder:normal-case placeholder:font-normal"
        placeholder="Nama aksesoris"
        value={item.nama || ""}
        onChange={(e) =>
          onChange({ ...item, nama: e.target.value.toUpperCase() })
        }
      />
      <div className="flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-2 w-32">
        <span className="font-sans text-xs text-charcoal-300">Rp</span>
        <input
          type="number"
          min="0"
          className="w-full bg-transparent font-sans text-xs text-navy-900 outline-none"
          placeholder="0"
          value={item.harga_per_baju || ""}
          onChange={(e) =>
            onChange({ ...item, harga_per_baju: parseInt(e.target.value) || 0 })
          }
        />
      </div>
      <button
        onClick={onHapus}
        className="font-sans text-xs text-danger active:opacity-70 shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Sub-komponen: NotaCard ───────────────────────────────────────────────────

function NotaCard({ nota }) {
  const [buka, setBuka] = useState(false);
  const bp = nota.biaya_produksi || {};
  const totalBP = totalBiayaProduksi(bp);
  const totalAksesoris = (nota.aksesoris || []).reduce(
    (s, a) => s + (a.harga_per_baju || 0),
    0,
  );
  const kodeList =
    nota.nota_kode?.map((nk) => nk.kode?.kode_desain).filter(Boolean) ?? [];

  const badgeColor =
    {
      draft: "bg-champagne-200 text-charcoal-600",
      review: "bg-champagne-200 text-gold-500",
      approved: "bg-green-100 text-green-700",
      ditolak: "bg-red-100 text-red-700",
    }[nota.status] ?? "bg-champagne-100 text-charcoal-600";

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <button
        onClick={() => setBuka(!buka)}
        className="w-full flex items-center justify-between px-4 py-4 active:opacity-70"
      >
        <div className="text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-sans text-sm font-semibold text-navy-900">
              {formatTanggal(nota.tanggal)}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 font-sans text-xs font-bold uppercase ${badgeColor}`}
            >
              {nota.status}
            </span>
          </div>
          <p className="mt-0.5 font-sans text-xs text-charcoal-300">
            {kodeList.join(", ") || "—"}
          </p>
        </div>
        <span className="font-sans text-xs text-charcoal-300">
          {buka ? "▲" : "▼"}
        </span>
      </button>

      {buka && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {/* Aksesoris */}
          {(nota.aksesoris || []).length > 0 && (
            <div>
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
                AKSESORIS
              </p>
              <div className="space-y-1">
                {nota.aksesoris.map((a, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="font-sans text-xs text-charcoal-600">
                      {a.nama}
                    </span>
                    <span className="font-sans text-xs font-semibold text-navy-900">
                      {formatRp(a.harga_per_baju)}/baju
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Biaya produksi */}
          <div>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
              BIAYA PRODUKSI
            </p>
            {bp.tampilkan_rincian ? (
              <div className="space-y-1">
                {[
                  ["Jahit", bp.jahit],
                  ["Potong", bp.potong],
                  ["Finishing", bp.finishing],
                  ["ATK", bp.atk],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="font-sans text-xs text-charcoal-600">
                      {label}
                    </span>
                    <span className="font-sans text-xs text-navy-900">
                      {formatRp(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-xs text-charcoal-600">
                Kisaran {formatRp(35000)} – {formatRp(45000)}/baju
              </p>
            )}
          </div>

          {/* Biaya jual beli */}
          <div className="flex justify-between border-t border-border pt-3">
            <span className="font-sans text-xs text-charcoal-600">
              Biaya Jual Beli
            </span>
            <span className="font-sans text-xs font-semibold text-navy-900">
              {formatRp(nota.biaya_jual_beli || 20000)}/baju
            </span>
          </div>

          {/* Alasan tolak */}
          {nota.alasan_tolak && (
            <div className="rounded-xl bg-red-50 px-3 py-2">
              <p className="font-sans text-xs font-semibold text-red-700">
                ALASAN DITOLAK
              </p>
              <p className="font-sans text-xs text-red-600 mt-0.5">
                {nota.alasan_tolak}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Form Buat Nota ───────────────────────────────────────────────────────────

function FormBuatNota({ produksiList, onBatal, onSimpan, isSaving }) {
  const [produksiId, setProduksiId] = useState("");
  const [kodeIds, setKodeIds] = useState([]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [bahan, setBahan] = useState([]);
  const [aksesoris, setAksesoris] = useState(
    AKSESORIS_DEFAULT.map((a) => ({ ...a })),
  );
  const [biayaProduksi, setBiayaProduksi] = useState({
    ...BIAYA_PRODUKSI_DEFAULT,
  });
  const [biayaJualBeli, setBiayaJualBeli] = useState(20000);

  const produksiTerpilih = produksiList.find((p) => p.id === produksiId);

  // Daftar warna dari bahan primer produksi
  const warnaList = useMemo(() => {
    if (!produksiTerpilih) return [];
    const semuaWarna = new Set();
    (produksiTerpilih.produksi_bahan || [])
      .filter((b) => b.tipe_bahan === "primer")
      .forEach((b) => {
        (b.produksi_bahan_warna || []).forEach((w) => {
          if (w.nama_warna) semuaWarna.add(w.nama_warna);
        });
      });
    return [...semuaWarna];
  }, [produksiTerpilih]);

  // Total pcs dari kode terpilih
  const totalPcs = useMemo(() => {
    if (!produksiTerpilih || !kodeIds.length) return 0;
    let total = 0;
    (produksiTerpilih.kode || [])
      .filter((k) => kodeIds.includes(k.id))
      .forEach((k) => {
        (k.kode_ukuran || []).forEach((u) => {
          (u.kode_ukuran_warna || []).forEach((w) => {
            total += w.jumlah_pcs || 0;
          });
        });
      });
    return total;
  }, [produksiTerpilih, kodeIds]);

  const kodeList = produksiTerpilih?.kode || [];
  const totalBP = totalBiayaProduksi(biayaProduksi);

  function tambahBahan() {
    setBahan([
      ...bahan,
      {
        nama: "",
        tipe_bahan: "primer",
        harga_per_satuan: 0,
        pcs_baju: totalPcs,
        pemakaian_warna: warnaList.map((n) => ({ nama: n, yard: 0 })),
        total_pemakaian: 0,
      },
    ]);
  }

  function ubahBahan(idx, val) {
    const arr = [...bahan];
    arr[idx] = val;
    setBahan(arr);
  }

  function hapusBahan(idx) {
    setBahan(bahan.filter((_, i) => i !== idx));
  }

  function tambahAksesoris() {
    setAksesoris([...aksesoris, { nama: "", harga_per_baju: 0 }]);
  }

  function ubahAksesoris(idx, val) {
    const arr = [...aksesoris];
    arr[idx] = val;
    setAksesoris(arr);
  }

  function hapusAksesoris(idx) {
    setAksesoris(aksesoris.filter((_, i) => i !== idx));
  }

  function toggleKode(kodeId) {
    setKodeIds((prev) =>
      prev.includes(kodeId)
        ? prev.filter((id) => id !== kodeId)
        : [...prev, kodeId],
    );
  }

  async function handleSimpan() {
    if (!produksiId || !kodeIds.length) return;
    await onSimpan({
      produksi_id: produksiId,
      kode_ids: kodeIds,
      tanggal,
      bahan,
      aksesoris,
      biaya_produksi: biayaProduksi,
      biaya_jual_beli: biayaJualBeli,
    });
  }

  return (
    <div className="space-y-6">
      {/* Pilih produksi */}
      <div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
          PRODUKSI
        </p>
        <select
          className="w-full rounded-xl border border-border bg-surface px-3 py-3 font-sans text-sm text-navy-900"
          value={produksiId}
          onChange={(e) => {
            setProduksiId(e.target.value);
            setKodeIds([]);
          }}
        >
          <option value="">— Pilih produksi —</option>
          {produksiList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.kode_bahan} — {formatTanggal(p.tanggal)}
            </option>
          ))}
        </select>
      </div>

      {/* Pilih kode */}
      {produksiTerpilih && (
        <div>
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
            KODE (PILIH SATU ATAU LEBIH)
          </p>
          <div className="flex flex-wrap gap-2">
            {kodeList.map((k) => (
              <button
                key={k.id}
                onClick={() => toggleKode(k.id)}
                className={[
                  "rounded-xl border px-3 py-2 font-sans text-xs font-bold transition-colors",
                  kodeIds.includes(k.id)
                    ? "border-navy-900 bg-navy-900 text-champagne-100"
                    : "border-border text-charcoal-600",
                ].join(" ")}
              >
                {k.kode_desain}
              </button>
            ))}
          </div>
          {totalPcs > 0 && (
            <p className="mt-2 font-sans text-xs text-charcoal-300">
              Total {totalPcs.toLocaleString("id-ID")} pcs dari kode terpilih
            </p>
          )}
        </div>
      )}

      {/* Tanggal */}
      <div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
          TANGGAL
        </p>
        <input
          type="date"
          className="w-full rounded-xl border border-border bg-surface px-3 py-3 font-sans text-sm text-navy-900"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
        />
      </div>

      {/* Bahan */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
            BAHAN
          </p>
          <button
            onClick={tambahBahan}
            className="rounded-xl border border-gold-500 px-3 py-1.5 font-sans text-xs font-bold text-gold-500 active:opacity-70"
          >
            + TAMBAH BAHAN
          </button>
        </div>
        <div className="space-y-3">
          {bahan.map((b, idx) => (
            <ItemBahan
              key={idx}
              item={b}
              warnaList={warnaList}
              totalPcs={totalPcs}
              onChange={(val) => ubahBahan(idx, val)}
              onHapus={() => hapusBahan(idx)}
            />
          ))}
          {bahan.length === 0 && (
            <p className="py-4 text-center font-sans text-xs text-charcoal-300">
              Belum ada bahan. Tekan + TAMBAH BAHAN.
            </p>
          )}
        </div>
      </div>

      {/* Aksesoris */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
            AKSESORIS (PER BAJU)
          </p>
          <button
            onClick={tambahAksesoris}
            className="rounded-xl border border-gold-500 px-3 py-1.5 font-sans text-xs font-bold text-gold-500 active:opacity-70"
          >
            + TAMBAH
          </button>
        </div>
        <div className="space-y-2">
          {aksesoris.map((a, idx) => (
            <ItemAksesoris
              key={idx}
              item={a}
              onChange={(val) => ubahAksesoris(idx, val)}
              onHapus={() => hapusAksesoris(idx)}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between rounded-xl bg-champagne-100 px-3 py-2">
          <span className="font-sans text-xs text-charcoal-600">
            Total aksesoris
          </span>
          <span className="font-sans text-xs font-semibold text-navy-900">
            {formatRp(
              aksesoris.reduce((s, a) => s + (a.harga_per_baju || 0), 0),
            )}
            /baju
          </span>
        </div>
      </div>

      {/* Biaya Produksi */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
            BIAYA PRODUKSI (PER BAJU)
          </p>
          <button
            onClick={() =>
              setBiayaProduksi((prev) => ({
                ...prev,
                tampilkan_rincian: !prev.tampilkan_rincian,
              }))
            }
            className="font-sans text-xs font-semibold text-gold-500 active:opacity-70"
          >
            {biayaProduksi.tampilkan_rincian
              ? "SEMBUNYIKAN RINCIAN"
              : "TAMPILKAN RINCIAN"}
          </button>
        </div>

        {!biayaProduksi.tampilkan_rincian ? (
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="font-sans text-xs text-charcoal-300">
              Kisaran {formatRp(35000)} – {formatRp(45000)}/baju
            </p>
            <p className="mt-1 font-sans text-xs font-semibold text-navy-900">
              Total saat ini: {formatRp(totalBP)}/baju
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { key: "jahit", label: "UPAH JAHIT" },
              { key: "potong", label: "UPAH POTONG" },
              { key: "finishing", label: "FINISHING" },
              { key: "atk", label: "ATK & LAIN-LAIN" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-32 font-sans text-xs text-charcoal-600">
                  {label}
                </span>
                <div className="flex flex-1 items-center gap-1 rounded-xl border border-border bg-surface px-3 py-2">
                  <span className="font-sans text-xs text-charcoal-300">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-transparent font-sans text-sm text-navy-900 outline-none"
                    value={biayaProduksi[key] || ""}
                    onChange={(e) =>
                      setBiayaProduksi((prev) => ({
                        ...prev,
                        [key]: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-between rounded-xl bg-champagne-100 px-3 py-2">
              <span className="font-sans text-xs text-charcoal-600">
                Total biaya produksi
              </span>
              <span className="font-sans text-xs font-semibold text-navy-900">
                {formatRp(totalBP)}/baju
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Biaya Jual Beli */}
      <div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
          BIAYA JUAL BELI (PER BAJU)
        </p>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-3">
          <span className="font-sans text-sm text-charcoal-300">Rp</span>
          <input
            type="number"
            min="0"
            className="flex-1 bg-transparent font-sans text-sm text-navy-900 outline-none"
            value={biayaJualBeli || ""}
            onChange={(e) => setBiayaJualBeli(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Rincian & Total */}
      <div>
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
          RINCIAN & TOTAL
        </p>
        <div className="rounded-2xl bg-navy-900 px-4 py-4 space-y-2.5">
          {bahan.map((b, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <span className="font-sans text-xs text-white/70 truncate">
                {b.nama || `Bahan ${idx + 1}`}
              </span>
              <span className="shrink-0 font-sans text-xs font-semibold text-white">
                {formatRp(hitungBiayaBahan(b))}/baju
              </span>
            </div>
          ))}
          {aksesoris.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-white/70">Aksesoris</span>
              <span className="font-sans text-xs font-semibold text-white">
                {formatRp(
                  aksesoris.reduce((s, a) => s + (a.harga_per_baju || 0), 0),
                )}
                /baju
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs text-white/70">
              Biaya produksi
            </span>
            <span className="font-sans text-xs font-semibold text-white">
              {formatRp(totalBP)}/baju
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs text-white/70">
              Biaya jual beli
            </span>
            <span className="font-sans text-xs font-semibold text-white">
              {formatRp(biayaJualBeli)}/baju
            </span>
          </div>
          <div className="border-t border-white/20 pt-2.5 flex items-center justify-between">
            <span className="font-sans text-sm font-bold text-white">
              TOTAL / BAJU
            </span>
            <span className="font-heading text-xl font-bold text-gold-300">
              {formatRp(
                bahan.reduce((s, b) => s + hitungBiayaBahan(b), 0) +
                  aksesoris.reduce((s, a) => s + (a.harga_per_baju || 0), 0) +
                  totalBP +
                  biayaJualBeli,
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Tombol */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBatal}
          className="flex-1 rounded-2xl border-2 border-border py-4 font-sans text-label font-bold tracking-wide text-charcoal-600 active:opacity-70"
        >
          BATAL
        </button>
        <button
          onClick={handleSimpan}
          disabled={isSaving || !produksiId || !kodeIds.length}
          className="flex-1 rounded-2xl bg-navy-900 py-4 font-sans text-label font-bold tracking-wide text-champagne-100 disabled:opacity-40 active:opacity-80"
        >
          {isSaving ? "MENYIMPAN..." : "SIMPAN"}
        </button>
      </div>
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────

export function NotaListPage() {
  const navigate = useNavigate();
  const profile = useAuthStore(selectProfile);
  const { data: produksiList = [], isLoading: loadingProduksi } =
    useDaftarProduksi();
  const [produksiFilterId, setProduksiFilterId] = useState("");
  const { data: notaList = [], isLoading: loadingNota } =
    useNotaByProduksi(produksiFilterId);
  const buatNotaMut = useBuatNota();
  const [showForm, setShowForm] = useState(false);

  async function handleSimpan(payload) {
    await buatNotaMut.mutateAsync({ ...payload, created_by: profile?.id });
    setShowForm(false);
  }

  return (
    <div className="bg-champagne-100 overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-champagne-100 px-4 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-500">
              NOTA BIAYA
            </p>
            <h1 className="font-heading text-heading text-navy-900">NOTA</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-2xl bg-navy-900 px-4 py-2.5 font-sans text-xs font-bold tracking-wide text-champagne-100 active:opacity-80"
            >
              + BUAT NOTA
            </button>
          )}
        </div>
      </div>

      <div className="px-4  space-y-4">
        {showForm ? (
          <FormBuatNota
            produksiList={produksiList}
            onBatal={() => setShowForm(false)}
            onSimpan={handleSimpan}
            isSaving={buatNotaMut.isPending}
          />
        ) : (
          <>
            {/* Filter produksi */}
            <select
              className="w-full rounded-xl border border-border bg-surface px-3 py-3 font-sans text-sm text-navy-900"
              value={produksiFilterId}
              onChange={(e) => setProduksiFilterId(e.target.value)}
            >
              <option value="">— Pilih produksi untuk lihat nota —</option>
              {produksiList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.kode_bahan} — {formatTanggal(p.tanggal)}
                </option>
              ))}
            </select>

            {/* List nota */}
            {loadingNota ? (
              <p className="py-8 text-center font-sans text-sm text-charcoal-300">
                MEMUAT...
              </p>
            ) : !produksiFilterId ? (
              <p className="py-8 text-center font-sans text-sm text-charcoal-300">
                Pilih produksi untuk melihat nota.
              </p>
            ) : notaList.length === 0 ? (
              <p className="py-8 text-center font-sans text-sm text-charcoal-300">
                Belum ada nota untuk produksi ini.
              </p>
            ) : (
              <div className="space-y-3">
                {notaList.map((nota) => (
                  <NotaCard key={nota.id} nota={nota} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
