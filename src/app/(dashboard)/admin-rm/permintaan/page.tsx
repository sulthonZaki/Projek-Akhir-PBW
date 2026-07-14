"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  DISETUJUI: "bg-blue-100 text-blue-700",
  DITOLAK: "bg-red-100 text-red-700",
  SELESAI: "bg-green-100 text-green-700",
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
  SELESAI: "Selesai",
};

export default function PermintaanBBAdminRMPage() {
  const [permintaan, setPermintaan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [modal, setModal] = useState<{ type: "approve" | "reject"; item: any } | null>(null);
  const [gudang, setGudang] = useState<any[]>([]);
  const [selectedGudang, setSelectedGudang] = useState("");
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    const [permintaanRes, masterRes] = await Promise.all([
      fetch(`/api/permintaan-bb?${params}`),
      fetch("/api/master-data"),
    ]);
    const permintaanData = await permintaanRes.json();
    const masterData = await masterRes.json();
    setPermintaan(permintaanData);
    setGudang(masterData.gudang?.filter((g: any) => g.aktif && g.tipe === "RM") || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [filterStatus]);

  async function handleAction(type: "approve" | "reject") {
    if (type === "approve" && !selectedGudang) {
      return showToast("Pilih gudang asal bahan baku", "error");
    }
    setSubmitting(true);
    const res = await fetch(`/api/permintaan-bb/${modal?.item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: type, catatanAdmin: catatan, gudangId: selectedGudang }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return showToast(data.error || "Gagal memproses", "error");
    showToast(data.message);
    setModal(null);
    setCatatan("");
    setSelectedGudang("");
    fetchData();
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 50,
          padding: "12px 16px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          backgroundColor: toast.type === "success" ? "#22c55e" : "#ef4444",
          color: "white", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px"
        }}>
          {toast.msg}
          <button onClick={() => setToast(null)}><X style={{ width: 12, height: 12 }} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1729]">Permintaan Bahan Baku</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola permintaan bahan baku dari Supervisor Produksi</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="SELESAI">Selesai</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
          <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Alert pending */}
      {permintaan.filter((p) => p.status === "PENDING").length > 0 && filterStatus === "PENDING" && (
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#fbbf24", flexShrink: 0, display: "inline-block" }} />
          <p style={{ fontSize: 14, color: "#b45309" }}>
            Ada <strong>{permintaan.filter((p) => p.status === "PENDING").length} permintaan</strong> yang menunggu persetujuan kamu
          </p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">Memuat data...</div>
        ) : permintaan.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            {filterStatus === "PENDING" ? "Tidak ada permintaan yang menunggu" : "Tidak ada data permintaan"}
          </div>
        ) : permintaan.map((p: any) => (
          <div key={p.id} style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #f3f4f6", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px" }}>
              {/* Info + status */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>{p.nomorPermintaan}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    {formatDateTime(p.tanggal)} · dari {p.user.namaLengkap}
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{p.keperluanProduksi}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusBadge[p.status]}`}>
                  {statusLabel[p.status]}
                </span>
              </div>

              {/* Tombol aksi */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {p.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => { setModal({ type: "approve", item: p }); setCatatan(""); setSelectedGudang(""); }}
                      style={{ backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <CheckCircle style={{ width: 14, height: 14 }} /> Setujui
                    </button>
                    <button
                      onClick={() => { setModal({ type: "reject", item: p }); setCatatan(""); }}
                      style={{ backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <XCircle style={{ width: 14, height: 14 }} /> Tolak
                    </button>
                  </>
                )}
                <button
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  style={{ border: "1px solid #e5e7eb", backgroundColor: "white", borderRadius: "8px", padding: "6px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {expanded === p.id ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                  {expanded === p.id ? "Sembunyikan" : "Lihat Detail"}
                </button>
              </div>
            </div>

            {/* Detail */}
            {expanded === p.id && (
              <div style={{ borderTop: "1px solid #f3f4f6", padding: "16px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                  Detail Bahan Baku yang Diminta
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.details.map((d: any) => (
                    <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f9fafb", borderRadius: 8, padding: "10px 16px" }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", margin: 0 }}>{d.jenisBahanBaku.nama}</p>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>{d.jumlah} {d.satuan}</p>
                        {d.keterangan && <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{d.keterangan}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                {p.catatanAdmin && (
                  <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, fontSize: 12, backgroundColor: p.status === "DITOLAK" ? "#fef2f2" : "#eff6ff", color: p.status === "DITOLAK" ? "#dc2626" : "#2563eb" }}>
                    <strong>Catatan kamu:</strong> {p.catatanAdmin}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Approve */}
      {modal?.type === "approve" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ backgroundColor: "white", borderRadius: 12, width: "100%", maxWidth: 448, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, color: "#0f1729", margin: 0 }}>Setujui Permintaan</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 20, height: 20, color: "#9ca3af" }} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
              Menyetujui permintaan <strong style={{ color: "#111827" }}>{modal.item.nomorPermintaan}</strong>. Barang keluar akan otomatis tercatat.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", marginBottom: 6 }}>Gudang Asal</label>
                <select value={selectedGudang} onChange={(e) => setSelectedGudang(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, backgroundColor: "white" }}>
                  <option value="">Pilih gudang</option>
                  {gudang.map((g: any) => <option key={g.id} value={g.id}>{g.nama}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", marginBottom: 6 }}>Catatan (opsional)</label>
                <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan untuk supervisor..." rows={2}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, resize: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setModal(null)}
                style={{ flex: 1, padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#4b5563", backgroundColor: "white", cursor: "pointer" }}>
                Batal
              </button>
              <button onClick={() => handleAction("approve")} disabled={submitting}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "white", backgroundColor: "#22c55e", border: "none", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "Memproses..." : "Setujui & Keluarkan Barang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {modal?.type === "reject" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ backgroundColor: "white", borderRadius: 12, width: "100%", maxWidth: 448, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, color: "#0f1729", margin: 0 }}>Tolak Permintaan</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 20, height: 20, color: "#9ca3af" }} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
              Tolak permintaan <strong style={{ color: "#111827" }}>{modal.item.nomorPermintaan}</strong> dari {modal.item.user.namaLengkap}.
            </p>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", marginBottom: 6 }}>Alasan Penolakan</label>
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                placeholder="Berikan alasan penolakan..." rows={3}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, resize: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setModal(null)}
                style={{ flex: 1, padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#4b5563", backgroundColor: "white", cursor: "pointer" }}>
                Batal
              </button>
              <button onClick={() => handleAction("reject")} disabled={submitting}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "white", backgroundColor: "#ef4444", border: "none", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "Memproses..." : "Tolak Permintaan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}