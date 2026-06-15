// Task #62 — Nota Biaya (menggantikan HPP Kalkulator).
// Hanya Deera yang bisa akses (route guard + RLS).

import { useState, useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import {
  useNotaByProduksi,
  useBuatNota,
  useHapusNota,
  useUpdateNota,
} from "./hooks/useNota";
import { useDaftarProduksi } from "../produksi/hooks/useProduksi";
import {
  useAuthStore,
  selectProfile,
  selectIsDeera,
  selectIsMaster,
} from "../../store/useAuthStore";
import { formatRp } from "../../utils/formatRp";
import { formatTanggal } from "../../utils/formatTanggal";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const AKSESORIS_DEFAULT = [
  { nama: "Label Besar", harga_per_baju: 150 },
  { nama: "Label Kecil", harga_per_baju: 50 },
  { nama: "Hangtag", harga_per_baju: 150 },
  { nama: "Plastik", harga_per_baju: 1750 },
  { nama: "Plat Besi (Pin)", harga_per_baju: 2500 },
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

// Hitung nilai semua bahan (primer + sekunder) per baju dari data produksi
function hitungNilaiBahan(nota) {
  const semuaBahan = nota.produksi?.produksi_bahan ?? [];
  const totalPcs = (nota.nota_kode ?? []).reduce((sum, nk) => {
    return (
      sum +
      (nk.kode?.kode_ukuran ?? []).reduce(
        (s2, uk) =>
          s2 +
          (uk.kode_ukuran_warna ?? []).reduce(
            (s3, w) => s3 + (w.jumlah_pcs || 0),
            0,
          ),
        0,
      )
    );
  }, 0);
  if (totalPcs === 0) return null;
  const totalNilai = semuaBahan.reduce((sum, b) => {
    if (b.tipe_bahan === "primer") {
      const yard = (b.produksi_bahan_warna ?? []).reduce(
        (s, w) => s + (w.yard_terpakai || 0),
        0,
      );
      return sum + yard * (b.harga_per_satuan || 0);
    } else {
      // sekunder: konsumsi_per_pcs * harga_per_satuan * totalPcs
      return (
        sum + (b.konsumsi_per_pcs || 0) * (b.harga_per_satuan || 0) * totalPcs
      );
    }
  }, 0);
  if (totalNilai === 0) return null;
  return Math.round(totalNilai / totalPcs);
}

function NotaCard({ nota, isDeera, isMaster, onEdit, onHapus }) {
  const [buka, setBuka] = useState(false);
  const [konfirmHapus, setKonfirmHapus] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareRef = useRef(null);
  const bp = nota.biaya_produksi || {};
  const totalBP = totalBiayaProduksi(bp);
  const totalAksesoris = (nota.aksesoris || []).reduce(
    (s, a) => s + (a.harga_per_baju || 0),
    0,
  );
  const nilaiBahan = hitungNilaiBahan(nota);
  const totalPcsNota = useMemo(() => {
    return (nota.nota_kode ?? []).reduce(
      (sum, nk) =>
        sum +
        (nk.kode?.kode_ukuran ?? []).reduce(
          (s2, uk) =>
            s2 +
            (uk.kode_ukuran_warna ?? []).reduce(
              (s3, w) => s3 + (w.jumlah_pcs || 0),
              0,
            ),
          0,
        ),
      0,
    );
  }, [nota]);
  const kodeList =
    nota.nota_kode?.map((nk) => nk.kode?.kode_desain).filter(Boolean) ?? [];

  // Sampel foto: ambil foto_url dari sampel terbaru tiap kode (yang ada fotonya)
  const sampelFotoUrls = useMemo(() => {
    const urls = [];
    (nota.nota_kode ?? []).forEach((nk) => {
      const sampelList = nk.kode?.sampel ?? [];
      // Cari sampel dengan foto_url, prioritaskan yang approved
      const withFoto = sampelList.filter((s) => s.foto_url);
      if (!withFoto.length) return;
      const approved = withFoto.find((s) => s.status === "approved");
      const picked = approved || withFoto[withFoto.length - 1];
      if (picked.foto_url && !urls.includes(picked.foto_url))
        urls.push(picked.foto_url);
      if (picked.foto_url_2 && !urls.includes(picked.foto_url_2))
        urls.push(picked.foto_url_2);
    });
    return urls.slice(0, 4); // maks 4 foto
  }, [nota]);

  // Tanggal & nama file untuk share
  const tglShare = nota.tanggal
    ? new Date(nota.tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
  const namaFile = `nota-${kodeList.join("-")}-${(nota.tanggal || "").replace(/-/g, "")}.png`;

  async function handleShare() {
    if (!shareRef.current || sharing) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: "#F8F3EA",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        const file = new File([blob], namaFile, { type: "image/png" });
        const shareTitle = `Nota Biaya ${kodeList.join(", ")} — ${tglShare}`;
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: shareTitle });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = namaFile;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch (e) {
      console.error("Share error:", e);
    } finally {
      setSharing(false);
    }
  }

  const semuaBahan = nota.produksi?.produksi_bahan ?? [];
  const totalNilaiBahan = totalAksesoris + (nilaiBahan || 0);
  const totalJasa = totalBP + (nota.biaya_jual_beli || 20000);
  const grandTotal = totalNilaiBahan + totalJasa;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <button
        onClick={() => setBuka(!buka)}
        className="w-full flex items-center justify-between px-4 py-4 active:opacity-70"
      >
        <div className="text-left">
          <p className="font-sans text-sm font-semibold text-navy-900">
            {formatTanggal(nota.tanggal)}
          </p>
          <p className="mt-0.5 font-sans text-xs text-charcoal-300">
            {kodeList.join(", ") || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDeera &&
            (isMaster ||
              nota.status === "draft" ||
              nota.status === "ditolak") && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(nota);
                  }}
                  className="rounded-lg bg-champagne-200 px-2.5 py-1 font-sans text-xs font-semibold text-navy-900"
                >
                  EDIT
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setKonfirmHapus(true);
                  }}
                  className="rounded-lg bg-danger/10 px-2.5 py-1 font-sans text-xs font-semibold text-danger"
                >
                  HAPUS
                </button>
              </>
            )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            disabled={sharing}
            className="rounded-lg bg-champagne-200 px-2.5 py-1 font-sans text-xs font-semibold text-navy-900 disabled:opacity-40"
          >
            {sharing ? "..." : "BAGIKAN"}
          </button>
          <span className="font-sans text-xs text-charcoal-300">
            {buka ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {/* Konfirmasi hapus */}
      {konfirmHapus &&
        isDeera &&
        (isMaster || nota.status === "draft" || nota.status === "ditolak") && (
          <div className="border-t border-border px-4 py-3 bg-red-50 flex items-center justify-between gap-3">
            <p className="font-sans text-xs text-red-700 flex-1">
              Hapus nota ini? Tidak bisa dikembalikan.
            </p>
            <button
              onClick={() => setKonfirmHapus(false)}
              className="font-sans text-xs text-charcoal-600 px-3 py-1.5 rounded-lg bg-champagne-200"
            >
              BATAL
            </button>
            <button
              onClick={() => {
                onHapus(nota.id);
                setKonfirmHapus(false);
              }}
              className="font-sans text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-danger"
            >
              HAPUS
            </button>
          </div>
        )}

      {buka && (
        <div className="border-t border-border px-4 pb-4 pt-4 space-y-4">
          {/* ── DARI JIHAN ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-charcoal-300">
                Dari Jihan
              </span>
              <div className="flex-1 h-px bg-border" />
              <span className="font-sans text-xs font-bold text-charcoal-600">
                {formatRp(totalNilaiBahan)}/baju
              </span>
            </div>
            {nilaiBahan !== null && (
              <div className="flex justify-between pl-1">
                <span className="font-sans text-xs text-charcoal-600">
                  Bahan
                </span>
                <span className="font-sans text-xs text-navy-900">
                  {formatRp(nilaiBahan)}/baju
                </span>
              </div>
            )}
            {(nota.aksesoris || []).map((a, i) => (
              <div key={i} className="flex justify-between pl-1">
                <span className="font-sans text-xs text-charcoal-600">
                  {a.nama}
                </span>
                <span className="font-sans text-xs text-navy-900">
                  {formatRp(a.harga_per_baju)}/baju
                </span>
              </div>
            ))}
          </div>

          {/* ── JASA DEERA ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gold-500">
                Jasa Deera
              </span>
              <div className="flex-1 h-px bg-border" />
              <span className="font-sans text-xs font-bold text-charcoal-600">
                {formatRp(totalJasa)}/baju
              </span>
            </div>
            {bp.tampilkan_rincian ? (
              <>
                {[
                  ["Jahit", bp.jahit],
                  ["Potong", bp.potong],
                  ["Finishing", bp.finishing],
                  ["ATK", bp.atk],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between pl-1">
                    <span className="font-sans text-xs text-charcoal-600">
                      {label}
                    </span>
                    <span className="font-sans text-xs text-navy-900">
                      {formatRp(val)}/baju
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pl-1 border-t border-border/40 pt-1.5">
                  <span className="font-sans text-xs text-charcoal-600">
                    Subtotal produksi
                  </span>
                  <span className="font-sans text-xs text-navy-900">
                    {formatRp(totalBP)}/baju
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between pl-1">
                <span className="font-sans text-xs text-charcoal-600">
                  Biaya produksi
                </span>
                <span className="font-sans text-xs text-navy-900">
                  {formatRp(totalBP)}/baju
                </span>
              </div>
            )}
            <div className="flex justify-between pl-1">
              <span className="font-sans text-xs text-charcoal-600">
                Biaya jual beli
              </span>
              <span className="font-sans text-xs text-navy-900">
                {formatRp(nota.biaya_jual_beli || 20000)}/baju
              </span>
            </div>
          </div>

          {/* ── TOTAL ── */}
          <div className="flex items-center justify-between rounded-2xl bg-navy-900 px-4 py-3">
            <span className="font-sans text-xs font-bold tracking-wide text-champagne-100">
              TOTAL / BAJU
            </span>
            <span className="font-heading text-lg font-bold text-gold-300">
              {formatRp(grandTotal)}
            </span>
          </div>

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

      {/* ── ShareCard (off-screen, untuk html2canvas) ── */}
      <div
        ref={shareRef}
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          width: 390,
          zIndex: -1,
        }}
        className="bg-champagne-100 p-5 space-y-4"
      >
        {/* Header */}
        <div className="space-y-0.5">
          <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-gold-500">
            NOTA BIAYA
          </p>
          <p className="font-heading text-xl font-bold text-navy-900">
            {kodeList.join(" · ") || "—"}
          </p>
          <p className="font-sans text-xs text-charcoal-300">{tglShare}</p>
        </div>

        {/* Foto sampel */}
        {sampelFotoUrls.length > 0 && (
          <div
            className={`grid gap-2 ${sampelFotoUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {sampelFotoUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Sampel ${i + 1}`}
                crossOrigin="anonymous"
                className="w-full rounded-xl object-cover"
                style={{ aspectRatio: "4/3" }}
              />
            ))}
          </div>
        )}

        {/* DARI JIHAN */}
        <div className="rounded-2xl bg-white/70 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-charcoal-300">
              Dari Jihan
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="font-sans text-xs font-bold text-charcoal-600">
              {formatRp(totalNilaiBahan)}/baju
            </span>
          </div>

          {/* Detail bahan — primer: ringkas satu baris; sekunder: konsumsi × harga */}
          {semuaBahan.map((b, bi) => {
            if (b.tipe_bahan === "primer") {
              const totalYard = (b.produksi_bahan_warna || []).reduce(
                (s, w) => s + (w.yard_terpakai || 0),
                0,
              );
              const yardPerBaju =
                totalPcsNota > 0 ? totalYard / totalPcsNota : 0;
              return (
                <div
                  key={bi}
                  className="flex items-start justify-between gap-2"
                >
                  <div>
                    <p className="font-sans text-xs font-semibold text-navy-900">
                      {b.jenis_bahan || "BAHAN MOTIF"}
                    </p>
                    <p className="font-sans text-[10px] text-charcoal-300">
                      {yardPerBaju.toFixed(2)} yard/baju &times;{" "}
                      {formatRp(b.harga_per_satuan)}/yard
                    </p>
                  </div>
                  <span className="shrink-0 font-sans text-xs text-navy-900">
                    {formatRp(
                      Math.round(yardPerBaju * (b.harga_per_satuan || 0)),
                    )}
                    /baju
                  </span>
                </div>
              );
            }
            return (
              <div key={bi} className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-sans text-xs font-semibold text-navy-900">
                    {b.jenis_bahan || "BAHAN TAMBAHAN"}
                  </p>
                  <p className="font-sans text-[10px] text-charcoal-300">
                    {b.konsumsi_per_pcs || 0} {b.satuan_konsumsi || "yard"}/baju
                    &times; {formatRp(b.harga_per_satuan)}/
                    {b.satuan_konsumsi || "yard"}
                  </p>
                </div>
                <span className="shrink-0 font-sans text-xs text-navy-900">
                  {formatRp(
                    Math.round(
                      (b.konsumsi_per_pcs || 0) * (b.harga_per_satuan || 0),
                    ),
                  )}
                  /baju
                </span>
              </div>
            );
          })}

          {/* Aksesoris */}
          {(nota.aksesoris || []).length > 0 && (
            <div className="space-y-1 border-t border-border/40 pt-2">
              {(nota.aksesoris || []).map((a, i) => (
                <div key={i} className="flex justify-between">
                  <span className="font-sans text-xs text-charcoal-600">
                    {a.nama}
                  </span>
                  <span className="font-sans text-xs text-navy-900">
                    {formatRp(a.harga_per_baju)}/baju
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* JASA DEERA */}
        <div className="rounded-2xl bg-white/70 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gold-500">
              Jasa Deera
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="font-sans text-xs font-bold text-charcoal-600">
              {formatRp(totalJasa)}/baju
            </span>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="font-sans text-xs text-charcoal-600">
                Biaya produksi
              </p>
              <p className="font-sans text-[10px] text-charcoal-300">
                {formatRp(35000)} – {formatRp(45000)}/baju
              </p>
            </div>
            <span className="font-sans text-xs text-navy-900">
              {formatRp(totalBP)}/baju
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans text-xs text-charcoal-600">
              Biaya jual beli
            </span>
            <span className="font-sans text-xs text-navy-900">
              {formatRp(nota.biaya_jual_beli || 20000)}/baju
            </span>
          </div>
        </div>

        {/* TOTAL */}
        <div className="flex items-center justify-between rounded-2xl bg-navy-900 px-4 py-4">
          <span className="font-sans text-xs font-bold tracking-wide text-champagne-100">
            TOTAL / BAJU
          </span>
          <span className="font-heading text-2xl font-bold text-gold-300">
            {formatRp(grandTotal)}
          </span>
        </div>

        {/* Footer */}
        <p className="text-center font-sans text-[9px] text-charcoal-300">
          Jihan Production
        </p>
      </div>
    </div>
  );
}

// ─── Form Buat Nota ───────────────────────────────────────────────────────────

function FormBuatNota({ produksiList, onBatal, onSimpan, isSaving }) {
  const [produksiId, setProduksiId] = useState("");
  const [kodeIds, setKodeIds] = useState([]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [aksesoris, setAksesoris] = useState(
    AKSESORIS_DEFAULT.map((a) => ({ ...a })),
  );
  const [biayaProduksi, setBiayaProduksi] = useState({
    ...BIAYA_PRODUKSI_DEFAULT,
  });
  const [biayaJualBeli, setBiayaJualBeli] = useState(20000);

  const produksiTerpilih = produksiList.find((p) => p.id === produksiId);

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

  // Nilai semua bahan (primer + sekunder) per baju — auto dari data produksi
  const nilaiBahanPerBaju = useMemo(() => {
    if (!produksiTerpilih || totalPcs === 0) return 0;
    let total = 0;
    (produksiTerpilih.produksi_bahan || []).forEach((b) => {
      if (b.tipe_bahan === "primer") {
        const yard = (b.produksi_bahan_warna || []).reduce(
          (s, w) => s + (w.yard_terpakai || 0),
          0,
        );
        total += yard * (b.harga_per_satuan || 0);
      } else {
        // sekunder: konsumsi_per_pcs * harga_per_satuan = nilai per baju
        total +=
          (b.konsumsi_per_pcs || 0) * (b.harga_per_satuan || 0) * totalPcs;
      }
    });
    return totalPcs > 0 ? Math.round(total / totalPcs) : 0;
  }, [produksiTerpilih, totalPcs]);

  const kodeList = produksiTerpilih?.kode || [];
  const totalBP = totalBiayaProduksi(biayaProduksi);

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

      {/* Bahan — auto dari data produksi (semua tipe) */}
      {produksiTerpilih &&
        (produksiTerpilih.produksi_bahan || []).length > 0 && (
          <div>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-navy-900">
              BAHAN
            </p>
            <div className="rounded-xl border border-border bg-surface px-4 py-3 space-y-1.5">
              {(produksiTerpilih.produksi_bahan || []).map((b, i) => {
                let detail = "";
                let nilaiPerBaju = null;
                if (b.tipe_bahan === "primer") {
                  const yard = (b.produksi_bahan_warna || []).reduce(
                    (s, w) => s + (w.yard_terpakai || 0),
                    0,
                  );
                  detail = `${yard} yard × ${formatRp(b.harga_per_satuan)}`;
                  nilaiPerBaju =
                    totalPcs > 0
                      ? Math.round(
                          (yard * (b.harga_per_satuan || 0)) / totalPcs,
                        )
                      : null;
                } else {
                  detail = `${b.konsumsi_per_pcs || 0} ${b.satuan_konsumsi || b.satuan || "yard"}/baju`;
                  nilaiPerBaju = Math.round(
                    (b.konsumsi_per_pcs || 0) * (b.harga_per_satuan || 0),
                  );
                }
                return (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-sans text-xs font-semibold text-navy-900">
                        {b.jenis_bahan}
                      </p>
                      <p className="font-sans text-xs text-charcoal-300">
                        {detail}
                      </p>
                    </div>
                    {nilaiPerBaju !== null && nilaiPerBaju > 0 && (
                      <span className="shrink-0 font-sans text-xs font-semibold text-navy-900">
                        {formatRp(nilaiPerBaju)}/baju
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-between border-t border-border pt-1.5 mt-1">
                <span className="font-sans text-xs font-semibold text-navy-900">
                  Total nilai bahan / baju
                </span>
                <span className="font-sans text-xs font-semibold text-gold-500">
                  {kodeIds.length > 0
                    ? formatRp(nilaiBahanPerBaju) + "/baju"
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        )}

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
              {formatRp(35000)} – {formatRp(45000)}/baju
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
          {nilaiBahanPerBaju > 0 && (
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-white/70">Bahan</span>
              <span className="font-sans text-xs font-semibold text-white">
                {formatRp(nilaiBahanPerBaju)}/baju
              </span>
            </div>
          )}
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
                nilaiBahanPerBaju +
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

// ─── Form Edit Nota (editable fields only, produksi/kode sudah fixed) ─────────

function FormEditNota({ nota, onBatal, onSimpan, isSaving }) {
  const bp0 = nota.biaya_produksi || {};
  const [tanggal, setTanggal] = useState(
    nota.tanggal || new Date().toISOString().slice(0, 10),
  );
  const [aksesoris, setAksesoris] = useState(
    (nota.aksesoris || []).map((a) => ({ ...a })),
  );
  const [biayaProduksi, setBiayaProduksi] = useState({
    ...BIAYA_PRODUKSI_DEFAULT,
    ...bp0,
  });
  const [biayaJualBeli, setBiayaJualBeli] = useState(
    nota.biaya_jual_beli || 20000,
  );

  const kodeList =
    nota.nota_kode?.map((nk) => nk.kode?.kode_desain).filter(Boolean) ?? [];
  const totalBP = totalBiayaProduksi(biayaProduksi);

  async function handleSimpan() {
    await onSimpan({
      tanggal,
      aksesoris,
      biaya_produksi: biayaProduksi,
      biaya_jual_beli: biayaJualBeli,
    });
  }

  return (
    <div className="space-y-5 rounded-2xl bg-surface border border-border p-4">
      <div>
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-500">
          EDIT NOTA
        </p>
        <p className="font-sans text-xs text-charcoal-300 mt-0.5">
          {kodeList.join(" · ")}
        </p>
      </div>

      {/* Tanggal */}
      <div>
        <p className="mb-1 font-sans text-xs font-semibold uppercase text-charcoal-600">
          TANGGAL
        </p>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3 py-2 font-sans text-sm text-navy-900"
        />
      </div>

      {/* Aksesoris */}
      <div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase text-charcoal-600">
          AKSESORIS (PER BAJU)
        </p>
        <div className="space-y-2">
          {aksesoris.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={a.nama}
                onChange={(e) => {
                  const arr = [...aksesoris];
                  arr[i] = { ...a, nama: e.target.value.toUpperCase() };
                  setAksesoris(arr);
                }}
                className="flex-1 min-w-0 rounded-lg border border-border px-3 py-2 font-sans text-xs text-navy-900 uppercase outline-none focus:border-gold-500"
                placeholder="NAMA"
              />
              <input
                type="number"
                value={a.harga_per_baju}
                onChange={(e) => {
                  const arr = [...aksesoris];
                  arr[i] = { ...a, harga_per_baju: Number(e.target.value) };
                  setAksesoris(arr);
                }}
                className="w-24 rounded-lg border border-border px-2 py-2 font-sans text-xs text-navy-900 text-right outline-none focus:border-gold-500"
              />
              <button
                onClick={() =>
                  setAksesoris(aksesoris.filter((_, j) => j !== i))
                }
                className="shrink-0 font-sans text-sm font-bold text-danger"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setAksesoris([...aksesoris, { nama: "", harga_per_baju: 0 }])
            }
            className="font-sans text-xs text-gold-500 font-semibold"
          >
            + TAMBAH ITEM
          </button>
        </div>
      </div>

      {/* Biaya produksi */}
      <div>
        <p className="mb-2 font-sans text-xs font-semibold uppercase text-charcoal-600">
          BIAYA PRODUKSI / BAJU
        </p>
        <div className="space-y-2">
          {[
            ["jahit", "Jahit"],
            ["potong", "Potong"],
            ["finishing", "Finishing"],
            ["atk", "ATK"],
          ].map(([k, label]) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <span className="font-sans text-xs text-charcoal-600 w-20">
                {label}
              </span>
              <input
                type="number"
                value={biayaProduksi[k] || ""}
                onChange={(e) =>
                  setBiayaProduksi({
                    ...biayaProduksi,
                    [k]: Number(e.target.value),
                  })
                }
                className="flex-1 rounded-lg border border-border px-3 py-2 font-sans text-xs text-right text-navy-900 outline-none focus:border-gold-500"
                placeholder="0"
              />
            </div>
          ))}
          <div className="flex justify-between pt-1 border-t border-border/50">
            <span className="font-sans text-xs font-semibold text-charcoal-600">
              Total
            </span>
            <span className="font-sans text-xs font-semibold text-navy-900">
              {formatRp(totalBP)}/baju
            </span>
          </div>
        </div>
      </div>

      {/* Biaya jual beli */}
      <div>
        <p className="mb-1 font-sans text-xs font-semibold uppercase text-charcoal-600">
          BIAYA JUAL BELI / BAJU
        </p>
        <input
          type="number"
          value={biayaJualBeli}
          onChange={(e) => setBiayaJualBeli(Number(e.target.value))}
          className="w-full rounded-xl border border-border bg-white px-3 py-2 font-sans text-sm text-right text-navy-900"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBatal}
          className="flex-1 rounded-2xl border-2 border-border py-3 font-sans text-xs font-bold text-charcoal-600"
        >
          BATAL
        </button>
        <button
          onClick={handleSimpan}
          disabled={isSaving}
          className="flex-1 rounded-2xl bg-navy-900 py-3 font-sans text-xs font-bold text-champagne-100 disabled:opacity-40"
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
  const isDeera = useAuthStore(selectIsDeera);
  const isMaster = useAuthStore(selectIsMaster);
  const { data: produksiList = [], isLoading: loadingProduksi } =
    useDaftarProduksi();
  const [produksiFilterId, setProduksiFilterId] = useState("");
  const { data: notaList = [], isLoading: loadingNota } =
    useNotaByProduksi(produksiFilterId);
  const buatNotaMut = useBuatNota();
  const hapusNotaMut = useHapusNota();
  const updateNotaMut = useUpdateNota();
  const [showForm, setShowForm] = useState(false);
  const [editingNota, setEditingNota] = useState(null);

  async function handleSimpan(payload) {
    await buatNotaMut.mutateAsync({ ...payload, created_by: profile?.id });
    setShowForm(false);
  }

  async function handleUpdate(payload) {
    await updateNotaMut.mutateAsync({ notaId: editingNota.id, payload });
    setEditingNota(null);
  }

  function handleEdit(nota) {
    setEditingNota(nota);
    setShowForm(false);
  }
  function handleHapus(notaId) {
    const target = notaList.find((n) => n.id === notaId);
    if (!target) return;
    if (!isMaster && !["draft", "ditolak"].includes(target.status)) return;
    hapusNotaMut.mutate(notaId);
  }

  return (
    <div className="bg-champagne-100 overflow-x-hidden">
      <div className="sticky top-0 z-10 bg-champagne-100 px-4 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-500">
              NOTA BIAYA
            </p>
            <h1 className="font-heading text-heading text-navy-900">NOTA</h1>
          </div>
          {!showForm && !editingNota && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-2xl bg-navy-900 px-4 py-2.5 font-sans text-xs font-bold tracking-wide text-champagne-100 active:opacity-80"
            >
              + BUAT NOTA
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-24 space-y-4">
        {editingNota ? (
          <FormEditNota
            nota={editingNota}
            onBatal={() => setEditingNota(null)}
            onSimpan={handleUpdate}
            isSaving={updateNotaMut.isPending}
          />
        ) : showForm ? (
          <FormBuatNota
            produksiList={produksiList}
            onBatal={() => setShowForm(false)}
            onSimpan={handleSimpan}
            isSaving={buatNotaMut.isPending}
          />
        ) : (
          <>
            <select
              className="w-full rounded-xl border border-border bg-surface px-3 py-3 font-sans text-sm text-navy-900"
              value={produksiFilterId}
              onChange={(e) => setProduksiFilterId(e.target.value)}
            >
              <option value="">Pilih produksi untuk lihat nota</option>
              {produksiList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.kode_bahan} - {formatTanggal(p.tanggal)}
                </option>
              ))}
            </select>
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
                  <NotaCard
                    key={nota.id}
                    nota={nota}
                    isDeera={isDeera}
                                       onEdit={(nota) => {
                      setEditingNota(nota);
                      setShowForm(true);
                    }}
                    onHapus={handleHapus}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
