import { useState, useEffect, useReducer, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ROLES = { DEERA: "deera", JIHAN: "jihan", TIM: "tim" };

const STATUS_ORDER = [
  { key: "sampel", label: "Sampel", icon: "✂️", color: "bg-purple-100 text-purple-700" },
  { key: "review_hpp", label: "Review HPP", icon: "📊", color: "bg-yellow-100 text-yellow-700" },
  { key: "approved", label: "Disetujui", icon: "✅", color: "bg-blue-100 text-blue-700" },
  { key: "produksi", label: "Produksi", icon: "🧵", color: "bg-orange-100 text-orange-700" },
  { key: "siap_kirim", label: "Siap Kirim", icon: "📦", color: "bg-teal-100 text-teal-700" },
  { key: "selesai", label: "Selesai", icon: "🎉", color: "bg-green-100 text-green-700" },
  { key: "ditolak", label: "Ditolak", icon: "❌", color: "bg-red-100 text-red-700" },
];

const STATUS_MAP = Object.fromEntries(STATUS_ORDER.map((s) => [s.key, s]));

const TAHAP_PRODUKSI = [
  { key: "dipotong", label: "Dipotong", icon: "✂️" },
  { key: "dijahit", label: "Dijahit", icon: "🧵" },
  { key: "finishing", label: "Finishing", icon: "✨" },
  { key: "siap_kirim", label: "Siap Kirim", icon: "📦" },
];

const SAMPLE_ORDERS = [
  {
    id: "ORD-001",
    namaDesain: "Gamis Raya Syari",
    jumlahPcs: 50,
    status: "produksi",
    hargaJualTarget: 185000,
    hpp: { bahan: 65000, jahit: 25000, finishing: 8000, lainlain: 5000 },
    produksi: { dipotong: 50, dijahit: 32, finishing: 20, siap_kirim: 10 },
    catatan: "Ukuran M, L, XL — masing2 15, 20, 15 pcs",
    createdAt: "2026-05-28",
    updatedAt: "2026-06-04",
  },
  {
    id: "ORD-002",
    namaDesain: "Gamis Casual Polos",
    jumlahPcs: 30,
    status: "review_hpp",
    hargaJualTarget: 130000,
    hpp: { bahan: 42000, jahit: 18000, finishing: 5000, lainlain: 3000 },
    produksi: { dipotong: 0, dijahit: 0, finishing: 0, siap_kirim: 0 },
    catatan: "Warna navy, hitam, mocca",
    createdAt: "2026-06-02",
    updatedAt: "2026-06-02",
  },
  {
    id: "ORD-003",
    namaDesain: "Gamis Bordir Premium",
    jumlahPcs: 20,
    status: "sampel",
    hargaJualTarget: 250000,
    hpp: { bahan: 0, jahit: 0, finishing: 0, lainlain: 0 },
    produksi: { dipotong: 0, dijahit: 0, finishing: 0, siap_kirim: 0 },
    catatan: "Bordir di bagian dada dan lengan",
    createdAt: "2026-06-05",
    updatedAt: "2026-06-05",
  },
];

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────
const LS_ORDERS = "jihan_orders";
const LS_ROLE = "jihan_role";

function loadOrders() {
  try {
    const raw = localStorage.getItem(LS_ORDERS);
    return raw ? JSON.parse(raw) : SAMPLE_ORDERS;
  } catch {
    return SAMPLE_ORDERS;
  }
}
function saveOrders(orders) {
  localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function totalHPP(hpp) {
  return (hpp.bahan || 0) + (hpp.jahit || 0) + (hpp.finishing || 0) + (hpp.lainlain || 0);
}
function margin(hpp, hargaJual) {
  const total = totalHPP(hpp);
  if (!total || !hargaJual) return null;
  return (((hargaJual - total) / hargaJual) * 100).toFixed(1);
}
function formatRp(n) {
  if (!n && n !== 0) return "—";
  return "Rp " + Number(n).toLocaleString("id-ID");
}
function today() {
  return new Date().toISOString().split("T")[0];
}
function genId(orders) {
  const num = orders.length + 1;
  return "ORD-" + String(num).padStart(3, "0");
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────
function ordersReducer(state, action) {
  let next;
  switch (action.type) {
    case "ADD":
      next = [...state, action.order];
      break;
    case "UPDATE":
      next = state.map((o) => (o.id === action.id ? { ...o, ...action.patch, updatedAt: today() } : o));
      break;
    case "DELETE":
      next = state.filter((o) => o.id !== action.id);
      break;
    default:
      return state;
  }
  saveOrders(next);
  return next;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

// Badge status
function StatusBadge({ status, small }) {
  const s = STATUS_MAP[status] || { label: status, icon: "•", color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${s.color} ${small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}>
      {s.icon} {s.label}
    </span>
  );
}

// Progress bar produksi
function ProduksiBar({ produksi, jumlahPcs }) {
  return (
    <div className="space-y-1.5">
      {TAHAP_PRODUKSI.map((t) => {
        const val = produksi[t.key] || 0;
        const pct = jumlahPcs > 0 ? Math.min((val / jumlahPcs) * 100, 100) : 0;
        return (
          <div key={t.key}>
            <div className="flex justify-between text-xs text-gray-500 mb-0.5">
              <span>{t.icon} {t.label}</span>
              <span className="font-medium text-gray-700">{val}/{jumlahPcs} pcs</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct >= 100 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#6366f1",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SCREEN: DASHBOARD ────────────────────────────────────────────────────────
function Dashboard({ orders, role, onOrderClick }) {
  const aktif = orders.filter((o) => !["selesai", "ditolak"].includes(o.status));
  const selesai = orders.filter((o) => o.status === "selesai").length;
  const needReview = orders.filter((o) => o.status === "review_hpp");

  const totalProduksi = aktif
    .filter((o) => o.status === "produksi")
    .reduce(
      (acc, o) => ({
        dipotong: acc.dipotong + (o.produksi.dipotong || 0),
        dijahit: acc.dijahit + (o.produksi.dijahit || 0),
        finishing: acc.finishing + (o.produksi.finishing || 0),
        siap_kirim: acc.siap_kirim + (o.produksi.siap_kirim || 0),
        total: acc.total + o.jumlahPcs,
      }),
      { dipotong: 0, dijahit: 0, finishing: 0, siap_kirim: 0, total: 0 }
    );

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
        <p className="text-indigo-200 text-sm">Halo, {role === ROLES.JIHAN ? "Jihan 👗" : role === ROLES.DEERA ? "Deera 🧵" : "Tim Produksi 👷"}</p>
        <h1 className="text-2xl font-bold mt-0.5">Jihan Production</h1>
        <p className="text-indigo-200 text-xs mt-1">Dashboard Operasional Gamis</p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{aktif.length}</div>
            <div className="text-xs text-indigo-100 mt-0.5">Order Aktif</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{needReview.length}</div>
            <div className="text-xs text-indigo-100 mt-0.5">Review HPP</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{selesai}</div>
            <div className="text-xs text-indigo-100 mt-0.5">Selesai</div>
          </div>
        </div>
      </div>

      {/* Alert review HPP */}
      {needReview.length > 0 && role === ROLES.JIHAN && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-yellow-800 font-semibold text-sm mb-2">
            <span>📊</span> {needReview.length} Order Menunggu Review HPP
          </div>
          {needReview.map((o) => (
            <button
              key={o.id}
              onClick={() => onOrderClick(o.id)}
              className="w-full text-left bg-white border border-yellow-200 rounded-xl p-3 mt-2 active:bg-yellow-50"
            >
              <div className="font-medium text-sm text-gray-800">{o.namaDesain}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                HPP: {formatRp(totalHPP(o.hpp))} | Target Jual: {formatRp(o.hargaJualTarget)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Ringkasan Produksi */}
      {totalProduksi.total > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>🧵</span> Produksi Berjalan
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {TAHAP_PRODUKSI.map((t) => (
              <div key={t.key} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500">{t.icon} {t.label}</div>
                <div className="text-xl font-bold text-gray-800 mt-1">{totalProduksi[t.key]}</div>
                <div className="text-xs text-gray-400">dari {totalProduksi.total} pcs</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order aktif */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3 px-1">Order Aktif</h2>
        {aktif.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">Belum ada order aktif</div>
        ) : (
          <div className="space-y-3">
            {aktif.map((o) => (
              <OrderCard key={o.id} order={o} onClick={() => onOrderClick(o.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ORDER CARD ───────────────────────────────────────────────────────────────
function OrderCard({ order, onClick }) {
  const total = totalHPP(order.hpp);
  const m = margin(order.hpp, order.hargaJualTarget);
  const pctDone =
    order.status === "produksi" && order.jumlahPcs > 0
      ? Math.round(((order.produksi.siap_kirim || 0) / order.jumlahPcs) * 100)
      : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm active:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 truncate">{order.namaDesain}</div>
          <div className="text-xs text-gray-400 mt-0.5">{order.id} · {order.jumlahPcs} pcs</div>
        </div>
        <StatusBadge status={order.status} small />
      </div>
      {total > 0 && (
        <div className="flex gap-4 mt-3 text-xs text-gray-600">
          <span>HPP: <span className="font-semibold text-gray-800">{formatRp(total)}</span></span>
          {order.hargaJualTarget > 0 && (
            <span>
              Margin:{" "}
              <span className={`font-semibold ${m >= 30 ? "text-green-600" : m >= 15 ? "text-yellow-600" : "text-red-600"}`}>
                {m}%
              </span>
            </span>
          )}
        </div>
      )}
      {order.status === "produksi" && pctDone !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress Produksi</span>
            <span>{pctDone}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${pctDone}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

// ─── SCREEN: ORDER LIST ───────────────────────────────────────────────────────
function OrderList({ orders, role, onOrderClick, onAdd }) {
  const [filter, setFilter] = useState("all");
  const filters = [
    { key: "all", label: "Semua" },
    { key: "aktif", label: "Aktif" },
    { key: "selesai", label: "Selesai" },
  ];
  const shown =
    filter === "aktif"
      ? orders.filter((o) => !["selesai", "ditolak"].includes(o.status))
      : filter === "selesai"
      ? orders.filter((o) => ["selesai", "ditolak"].includes(o.status))
      : orders;

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Order</h2>
        {role === ROLES.DEERA && (
          <button
            onClick={onAdd}
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl font-medium active:bg-indigo-700"
          >
            + Baru
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              filter === f.key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="text-center text-gray-400 py-12 text-sm">Tidak ada order</div>
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <OrderCard key={o.id} order={o} onClick={() => onOrderClick(o.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: ORDER DETAIL ─────────────────────────────────────────────────────
function OrderDetail({ order, role, dispatch, onBack }) {
  const [editProduksi, setEditProduksi] = useState(false);
  const [prodTemp, setProdTemp] = useState({ ...order.produksi });
  const [editHPP, setEditHPP] = useState(false);
  const [hppTemp, setHppTemp] = useState({ ...order.hpp });
  const [editCatatan, setEditCatatan] = useState(false);
  const [catatanTemp, setCatatanTemp] = useState(order.catatan || "");

  const total = totalHPP(order.hpp);
  const m = margin(order.hpp, order.hargaJualTarget);

  function handleStatusChange(newStatus) {
    dispatch({ type: "UPDATE", id: order.id, patch: { status: newStatus } });
  }
  function saveProduksi() {
    dispatch({ type: "UPDATE", id: order.id, patch: { produksi: prodTemp } });
    setEditProduksi(false);
  }
  function saveHPP() {
    dispatch({ type: "UPDATE", id: order.id, patch: { hpp: hppTemp } });
    setEditHPP(false);
  }
  function saveCatatan() {
    dispatch({ type: "UPDATE", id: order.id, patch: { catatan: catatanTemp } });
    setEditCatatan(false);
  }

  const canEditHPP = role === ROLES.DEERA;
  const canEditProduksi = role === ROLES.DEERA || role === ROLES.TIM;
  const canApprove = role === ROLES.JIHAN && order.status === "review_hpp";
  const canStartProduksi = role === ROLES.DEERA && order.status === "approved";
  const canMarkSiapKirim = role === ROLES.DEERA && order.status === "produksi";
  const canMarkSelesai = role === ROLES.DEERA && order.status === "siap_kirim";

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-800 truncate">{order.namaDesain}</h2>
          <div className="text-xs text-gray-400">{order.id}</div>
        </div>
        <StatusBadge status={order.status} small />
      </div>

      {/* Info dasar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-400">Jumlah</div>
            <div className="font-semibold text-gray-800">{order.jumlahPcs} pcs</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Target Jual Jihan</div>
            <div className="font-semibold text-gray-800">{formatRp(order.hargaJualTarget)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Dibuat</div>
            <div className="font-semibold text-gray-800">{order.createdAt}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Diupdate</div>
            <div className="font-semibold text-gray-800">{order.updatedAt}</div>
          </div>
        </div>
        {/* Catatan */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-400">Catatan</div>
            {(role === ROLES.DEERA || role === ROLES.JIHAN) && !editCatatan && (
              <button onClick={() => setEditCatatan(true)} className="text-xs text-indigo-600">Edit</button>
            )}
          </div>
          {editCatatan ? (
            <div className="space-y-2">
              <textarea
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={3}
                value={catatanTemp}
                onChange={(e) => setCatatanTemp(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={saveCatatan} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium">Simpan</button>
                <button onClick={() => setEditCatatan(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm">Batal</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700">{order.catatan || <span className="text-gray-400 italic">Belum ada catatan</span>}</p>
          )}
        </div>
      </div>

      {/* HPP */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">📊 HPP (per pcs)</h3>
          {canEditHPP && !editHPP && (
            <button onClick={() => setEditHPP(true)} className="text-xs text-indigo-600 font-medium">Edit</button>
          )}
        </div>
        {editHPP ? (
          <div className="space-y-3">
            {[
              { key: "bahan", label: "Bahan" },
              { key: "jahit", label: "Jahit" },
              { key: "finishing", label: "Finishing" },
              { key: "lainlain", label: "Lain-lain" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">Rp</span>
                  <input
                    type="number"
                    className="flex-1 px-3 py-2 text-sm focus:outline-none"
                    value={hppTemp[f.key] || ""}
                    onChange={(e) => setHppTemp((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                  />
                </div>
              </div>
            ))}
            <div className="bg-indigo-50 rounded-xl p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total HPP</span>
                <span className="font-bold text-indigo-700">{formatRp(totalHPP(hppTemp))}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveHPP} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium">Simpan</button>
              <button onClick={() => setEditHPP(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm">Batal</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { key: "bahan", label: "Bahan" },
              { key: "jahit", label: "Jahit" },
              { key: "finishing", label: "Finishing" },
              { key: "lainlain", label: "Lain-lain" },
            ].map((f) => (
              <div key={f.key} className="flex justify-between text-sm">
                <span className="text-gray-500">{f.label}</span>
                <span className="font-medium text-gray-800">{formatRp(order.hpp[f.key])}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-semibold">
              <span className="text-gray-700">Total HPP</span>
              <span className="text-indigo-700">{formatRp(total)}</span>
            </div>
            {order.hargaJualTarget > 0 && total > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 mt-1 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Harga Jual Target</span>
                  <span className="font-medium">{formatRp(order.hargaJualTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Margin</span>
                  <span className={`font-bold ${m >= 30 ? "text-green-600" : m >= 15 ? "text-yellow-600" : "text-red-600"}`}>
                    {m}% {m >= 30 ? "✅" : m >= 15 ? "⚠️" : "❌"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Laba per pcs</span>
                  <span className="font-medium text-gray-800">{formatRp(order.hargaJualTarget - total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Laba ({order.jumlahPcs} pcs)</span>
                  <span className="font-bold text-gray-800">{formatRp((order.hargaJualTarget - total) * order.jumlahPcs)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tracking Produksi */}
      {["approved", "produksi", "siap_kirim", "selesai"].includes(order.status) && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">🧵 Progress Produksi</h3>
            {canEditProduksi && !editProduksi && (
              <button onClick={() => setEditProduksi(true)} className="text-xs text-indigo-600 font-medium">Update</button>
            )}
          </div>
          {editProduksi ? (
            <div className="space-y-3">
              {TAHAP_PRODUKSI.map((t) => (
                <div key={t.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{t.icon} {t.label} (pcs)</label>
                  <input
                    type="number"
                    max={order.jumlahPcs}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={prodTemp[t.key] || ""}
                    onChange={(e) =>
                      setProdTemp((prev) => ({ ...prev, [t.key]: Math.min(Number(e.target.value), order.jumlahPcs) }))
                    }
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={saveProduksi} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium">Simpan</button>
                <button onClick={() => setEditProduksi(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm">Batal</button>
              </div>
            </div>
          ) : (
            <ProduksiBar produksi={order.produksi} jumlahPcs={order.jumlahPcs} />
          )}
        </div>
      )}

      {/* Timeline Status */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold text-gray-800 mb-3">🗂 Alur Status</h3>
        <div className="relative">
          {["sampel", "review_hpp", "approved", "produksi", "siap_kirim", "selesai"].map((s, i) => {
            const statusInfo = STATUS_MAP[s];
            const isCurrent = order.status === s;
            const isDone =
              ["sampel", "review_hpp", "approved", "produksi", "siap_kirim", "selesai"].indexOf(order.status) > i;
            return (
              <div key={s} className="flex items-center gap-3 mb-3 last:mb-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                      : isDone
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? "✓" : statusInfo.icon}
                </div>
                <span className={`text-sm ${isCurrent ? "font-bold text-indigo-700" : isDone ? "text-gray-600" : "text-gray-400"}`}>
                  {statusInfo.label}
                </span>
                {isCurrent && <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Sekarang</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {canApprove && (
          <>
            <button
              onClick={() => handleStatusChange("approved")}
              className="w-full bg-green-600 text-white py-3 rounded-2xl font-semibold text-sm active:bg-green-700"
            >
              ✅ Setujui & Lanjut Produksi
            </button>
            <button
              onClick={() => handleStatusChange("ditolak")}
              className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-2xl font-semibold text-sm active:bg-red-100"
            >
              ❌ Tolak (HPP Tidak Sesuai)
            </button>
          </>
        )}
        {canStartProduksi && (
          <button
            onClick={() => handleStatusChange("produksi")}
            className="w-full bg-orange-500 text-white py-3 rounded-2xl font-semibold text-sm active:bg-orange-600"
          >
            🧵 Mulai Produksi
          </button>
        )}
        {canMarkSiapKirim && (
          <button
            onClick={() => handleStatusChange("siap_kirim")}
            className="w-full bg-teal-600 text-white py-3 rounded-2xl font-semibold text-sm active:bg-teal-700"
          >
            📦 Tandai Siap Kirim
          </button>
        )}
        {canMarkSelesai && (
          <button
            onClick={() => handleStatusChange("selesai")}
            className="w-full bg-green-600 text-white py-3 rounded-2xl font-semibold text-sm active:bg-green-700"
          >
            🎉 Tandai Selesai (Sudah Dikirim)
          </button>
        )}
        {role === ROLES.DEERA && order.status === "sampel" && (
          <button
            onClick={() => handleStatusChange("review_hpp")}
            className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-semibold text-sm active:bg-indigo-700"
          >
            📊 Kirim ke Jihan untuk Review HPP
          </button>
        )}
      </div>
    </div>
  );
}

// ─── SCREEN: TAMBAH ORDER ─────────────────────────────────────────────────────
function TambahOrder({ orders, dispatch, onBack }) {
  const [form, setForm] = useState({
    namaDesain: "",
    jumlahPcs: "",
    hargaJualTarget: "",
    catatan: "",
    hpp: { bahan: "", jahit: "", finishing: "", lainlain: "" },
  });

  function set(key, val) {
    setForm((p) => ({ ...p, [key]: val }));
  }
  function setHpp(key, val) {
    setForm((p) => ({ ...p, hpp: { ...p.hpp, [key]: val } }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.namaDesain || !form.jumlahPcs) return;
    const newOrder = {
      id: genId(orders),
      namaDesain: form.namaDesain,
      jumlahPcs: Number(form.jumlahPcs),
      status: "sampel",
      hargaJualTarget: Number(form.hargaJualTarget) || 0,
      hpp: {
        bahan: Number(form.hpp.bahan) || 0,
        jahit: Number(form.hpp.jahit) || 0,
        finishing: Number(form.hpp.finishing) || 0,
        lainlain: Number(form.hpp.lainlain) || 0,
      },
      produksi: { dipotong: 0, dijahit: 0, finishing: 0, siap_kirim: 0 },
      catatan: form.catatan,
      createdAt: today(),
      updatedAt: today(),
    };
    dispatch({ type: "ADD", order: newOrder });
    onBack();
  }

  const totalPreview = (Number(form.hpp.bahan) || 0) + (Number(form.hpp.jahit) || 0) + (Number(form.hpp.finishing) || 0) + (Number(form.hpp.lainlain) || 0);
  const mPreview = form.hargaJualTarget && totalPreview ? (((Number(form.hargaJualTarget) - totalPreview) / Number(form.hargaJualTarget)) * 100).toFixed(1) : null;

  return (
    <form onSubmit={submit} className="pb-24 space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <button type="button" onClick={onBack} className="p-2 rounded-xl bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-bold text-gray-800 text-xl">Order Baru</h2>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4 shadow-sm">
        <h3 className="font-semibold text-gray-700 text-sm">Info Produk</h3>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nama Desain / Produk *</label>
          <input
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="cth: Gamis Raya Syari"
            value={form.namaDesain}
            onChange={(e) => set("namaDesain", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Jumlah (pcs) *</label>
            <input
              required
              type="number"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="50"
              value={form.jumlahPcs}
              onChange={(e) => set("jumlahPcs", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Target Jual Jihan</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <span className="px-2 py-2.5 bg-gray-50 text-gray-400 text-xs border-r border-gray-200">Rp</span>
              <input
                type="number"
                className="flex-1 px-2 py-2.5 text-sm focus:outline-none"
                placeholder="185000"
                value={form.hargaJualTarget}
                onChange={(e) => set("hargaJualTarget", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Catatan</label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            rows={2}
            placeholder="Ukuran, warna, detail lainnya..."
            value={form.catatan}
            onChange={(e) => set("catatan", e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4 shadow-sm">
        <h3 className="font-semibold text-gray-700 text-sm">HPP (per pcs) — opsional</h3>
        {[
          { key: "bahan", label: "Bahan" },
          { key: "jahit", label: "Jahit" },
          { key: "finishing", label: "Finishing" },
          { key: "lainlain", label: "Lain-lain" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">Rp</span>
              <input
                type="number"
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                value={form.hpp[f.key]}
                onChange={(e) => setHpp(f.key, e.target.value)}
              />
            </div>
          </div>
        ))}
        {totalPreview > 0 && (
          <div className="bg-indigo-50 rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Total HPP</span>
              <span className="font-bold text-indigo-700">{formatRp(totalPreview)}</span>
            </div>
            {mPreview && (
              <div className="flex justify-between">
                <span className="text-gray-600">Margin</span>
                <span className={`font-bold ${mPreview >= 30 ? "text-green-600" : mPreview >= 15 ? "text-yellow-600" : "text-red-600"}`}>
                  {mPreview}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-semibold text-sm active:bg-indigo-700"
      >
        ✓ Buat Order
      </button>
    </form>
  );
}

// ─── SCREEN: HPP KALKULATOR ───────────────────────────────────────────────────
function HPPKalkulator() {
  const [form, setForm] = useState({ bahan: "", jahit: "", finishing: "", lainlain: "", hargaJual: "", pcs: "1" });

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  const hpp = (Number(form.bahan) || 0) + (Number(form.jahit) || 0) + (Number(form.finishing) || 0) + (Number(form.lainlain) || 0);
  const hargaJual = Number(form.hargaJual) || 0;
  const pcs = Number(form.pcs) || 1;
  const m = hargaJual && hpp ? (((hargaJual - hpp) / hargaJual) * 100).toFixed(1) : null;
  const labaPerPcs = hargaJual - hpp;
  const labaTotal = labaPerPcs * pcs;

  return (
    <div className="pb-24 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">🧮 Kalkulator HPP</h2>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">Komponen Biaya (per pcs)</h3>
        {[
          { key: "bahan", label: "Bahan", placeholder: "65000" },
          { key: "jahit", label: "Ongkos Jahit", placeholder: "25000" },
          { key: "finishing", label: "Finishing", placeholder: "8000" },
          { key: "lainlain", label: "Lain-lain (plastik, hangtag, dll)", placeholder: "5000" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">Rp</span>
              <input
                type="number"
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">Target Penjualan</h3>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Harga Jual Target</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">Rp</span>
            <input
              type="number"
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
              placeholder="185000"
              value={form.hargaJual}
              onChange={(e) => set("hargaJual", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Jumlah Produksi (pcs)</label>
          <input
            type="number"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            value={form.pcs}
            onChange={(e) => set("pcs", e.target.value)}
          />
        </div>
      </div>

      {hpp > 0 && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
          <h3 className="font-semibold text-indigo-100 text-sm mb-3">Hasil Kalkulasi</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-indigo-200">Total HPP / pcs</span>
              <span className="font-bold text-white">{formatRp(hpp)}</span>
            </div>
            {hargaJual > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">Harga Jual</span>
                  <span className="font-bold text-white">{formatRp(hargaJual)}</span>
                </div>
                <div className="border-t border-white/20 pt-2.5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Margin</span>
                    <span className={`font-bold text-lg ${m >= 30 ? "text-green-300" : m >= 15 ? "text-yellow-300" : "text-red-300"}`}>
                      {m}% {m >= 30 ? "✅" : m >= 15 ? "⚠️" : "❌"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Laba / pcs</span>
                    <span className="font-bold">{formatRp(labaPerPcs)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Total Laba ({pcs} pcs)</span>
                    <span className="font-bold text-lg">{formatRp(labaTotal)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          {m !== null && (
            <div className={`mt-3 rounded-xl p-3 text-sm font-medium text-center ${m >= 30 ? "bg-green-500/30" : m >= 15 ? "bg-yellow-500/30" : "bg-red-500/30"}`}>
              {m >= 30 ? "💚 Margin bagus! HPP layak dilanjutkan" : m >= 15 ? "🟡 Margin tipis, pertimbangkan lagi" : "🔴 Margin terlalu kecil, HPP perlu ditekan"}
            </div>
          )}
        </div>
      )}

      {hpp === 0 && (
        <div className="text-center text-gray-400 py-6 text-sm">
          Isi komponen biaya di atas untuk melihat kalkulasi
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: SETTINGS / GANTI ROLE ───────────────────────────────────────────
function Settings({ role, setRole }) {
  const roles = [
    { key: ROLES.DEERA, label: "Deera (Produsen)", desc: "Buat order, isi HPP, update produksi", icon: "🧵" },
    { key: ROLES.JIHAN, label: "Jihan (Klien)", desc: "Review HPP, setujui/tolak order", icon: "👗" },
    { key: ROLES.TIM, label: "Tim Produksi", desc: "Update progress tahap produksi", icon: "👷" },
  ];
  return (
    <div className="pb-24 space-y-5">
      <h2 className="text-xl font-bold text-gray-800">⚙️ Pengaturan</h2>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-700 text-sm mb-3">Masuk sebagai</h3>
        <div className="space-y-2">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setRole(r.key);
                localStorage.setItem(LS_ROLE, r.key);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                role === r.key ? "border-indigo-600 bg-indigo-50" : "border-gray-200 bg-white active:bg-gray-50"
              }`}
            >
              <span className="text-2xl">{r.icon}</span>
              <div>
                <div className={`font-semibold text-sm ${role === r.key ? "text-indigo-700" : "text-gray-800"}`}>{r.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
              </div>
              {role === r.key && <span className="ml-auto text-indigo-600">✓</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-500 space-y-1">
        <div className="font-semibold text-gray-600">Jihan Production v1.0</div>
        <div>Sistem manajemen operasional gamis</div>
        <div>Kerjasama Deera & Jihan</div>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ active, onChange }) {
  const items = [
    { key: "dashboard", label: "Beranda", icon: "🏠" },
    { key: "orders", label: "Order", icon: "📋" },
    { key: "hpp", label: "HPP", icon: "🧮" },
    { key: "settings", label: "Akun", icon: "⚙️" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 max-w-md mx-auto">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
            active === item.key ? "text-indigo-600" : "text-gray-400"
          }`}
        >
          <span className="text-xl leading-none">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
          {active === item.key && <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />}
        </button>
      ))}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [orders, dispatch] = useReducer(ordersReducer, null, loadOrders);
  const [role, setRole] = useState(() => localStorage.getItem(LS_ROLE) || ROLES.DEERA);
  const [tab, setTab] = useState("dashboard");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showAddOrder, setShowAddOrder] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  function handleOrderClick(id) {
    setSelectedOrderId(id);
    setTab("orders");
  }
  function handleTabChange(t) {
    setTab(t);
    setSelectedOrderId(null);
    setShowAddOrder(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 pt-6">
        {tab === "dashboard" && (
          <Dashboard orders={orders} role={role} onOrderClick={handleOrderClick} />
        )}
        {tab === "orders" && !selectedOrder && !showAddOrder && (
          <OrderList
            orders={orders}
            role={role}
            onOrderClick={(id) => setSelectedOrderId(id)}
            onAdd={() => setShowAddOrder(true)}
          />
        )}
        {tab === "orders" && selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            role={role}
            dispatch={dispatch}
            onBack={() => setSelectedOrderId(null)}
          />
        )}
        {tab === "orders" && showAddOrder && (
          <TambahOrder
            orders={orders}
            dispatch={dispatch}
            onBack={() => setShowAddOrder(false)}
          />
        )}
        {tab === "hpp" && <HPPKalkulator />}
        {tab === "settings" && <Settings role={role} setRole={setRole} />}
      </div>
      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  );
}
