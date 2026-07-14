"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  MENUNGGU_APPROVAL: "Menunggu Approval",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
};

const statusColor: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: "#f3f4f6", color: "#4b5563" },
  MENUNGGU_APPROVAL: { bg: "#fef3c7", color: "#92400e" },
  DISETUJUI: { bg: "#dcfce7", color: "#166534" },
  DITOLAK: { bg: "#fee2e2", color: "#991b1b" },
};

export default function ApprovalPage() {
  const [produksi, setProduksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("MENUNGGU_APPROVAL");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [modal, setModal] = useState<{ type: "approve" | "reject"; item: any } | null>(null);
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/manager/approval?status=${filterStatus}`);
    const data = await res.json();
    setProduksi(data);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [filterStatus]);

  async function handleAction(type: "approve" | "reject") {
    setSubmitting(true);
    const res = await fetch(`/api/produksi/${modal?.item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: type, catatan }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return showToast(data.error || "Gagal memproses", "error");
    showToast(data.message);
    setModal(null);
    setCatatan("");
    fetchData();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 50,
          padding: "12px 16px", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          backgroundColor: toast.type === "success" ? "#22c55e" : "#ef4444",
          color: "white", fontSize: 14, display: "flex", alignItems: "center", gap: 8
        }}>
          {toast.msg}
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "white" }}>
            <X style={{ width: 12, height: 12 }} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f1729", margin: 0 }}>Approval Produksi</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>Review dan setujui hasil produksi dari Supervisor</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, backgroundColor: "white" }}
          >
            <option value="MENUNGGU_APPROVAL">Menunggu Approval</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
            <option value="">Semua</option>
          </select>
          <button onClick={fetchData}
            style={{ padding: 10, border: "1px solid #e5e7eb", borderRadius: 8, backgroundColor: "white", cursor: "pointer" }}>
            <RefreshCw style={{ width: 16, height: 16, color: "#6b7280" }} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div style={{ backgroundColor: "white", borderRadius: 12, border: "1px solid #f3f4f6", padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
            Memuat data...
          </div>
        ) : produksi.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: 12, border: "1px solid #f3f4f6", padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
            Tidak ada produksi yang perlu di-review
          </div>
        ) : produksi.map((p: any) => (
          <div key={p.id} style={{ backgroundColor: "white", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px" }}>
              {/* Info + status */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>{p.nomorBatch}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    {formatDateTime(p.tanggalMulai)} · oleh {p.user.namaLengkap}
                  </p>
                  {p.totalOutputKg && (
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      Output: <strong>{formatNumber(p.totalOutputKg)} kg</strong>
                      {p.efisiensi && <span style={{ marginLeft: 8, color: "#3b82f6" }}>{p.efisiensi}% efisiensi</span>}
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 500, flexShrink: 0,
                  backgroundColor: statusColor[p.status]?.bg || "#f3f4f6",
                  color: statusColor[p.status]?.color || "#4b5563"
                }}>
                  {statusLabel[p.status]}
                </span>
              </div>

              {/* Tombol aksi */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {p.status === "MENUNGGU_APPROVAL" && (
                  <>
                    <button
                      onClick={() => { setModal({ type: "approve", item: p }); setCatatan(""); }}
                      style={{ backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <CheckCircle style={{ width: 14, height: 14 }} /> Setujui
                    </button>
                    <button
                      onClick={() => { setModal({ type: "reject", item: p }); setCatatan(""); }}
                      style={{ backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <XCircle style={{ width: 14, height: 14 }} /> Tolak
                    </button>
                  </>
                )}
                <button
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  style={{ border: "1px solid #e5e7eb", backgroundColor: "white", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  {expanded === p.id ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                  {expanded === p.id ? "Sembunyikan" : "Lihat Detail"}
                </button>
              </div>
            </div>

            {/* Detail */}
            {expanded === p.id && (
              <div style={{ borderTop: "1px solid #f3f4f6", padding: "16px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Bahan Baku Terpakai</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {p.detailRM.map((d: any) => (
                        <div key={d.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                          <span style={{ color: "#4b5563" }}>{d.jenisBahanBaku.nama}</span>
                          <span style={{ fontWeight: 500 }}>{formatNumber(d.jumlahTerpakai)} {d.satuan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Output Semen</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {p.detailFG.map((d: any) => (
                        <div key={d.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                          <span style={{ color: "#4b5563" }}>{d.jenisSemen.nama}</span>
                          <span style={{ fontWeight: 500 }}>{formatNumber(d.jumlahOutput)} {d.satuan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {p.catatan && (
                  <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                    Catatan Supervisor: {p.catatan}
                  </p>
                )}

                {p.approval && p.approval.status !== "PENDING" && (
                  <div style={{
                    marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6", fontSize: 12,
                    color: p.approval.status === "DISETUJUI" ? "#16a34a" : "#dc2626"
                  }}>
                    {p.approval.status === "DISETUJUI" ? "✓ Disetujui" : "✗ Ditolak"}
                    {p.approval.catatan && ` — ${p.approval.catatan}`}
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
              <h3 style={{ fontWeight: 700, color: "#0f1729", margin: 0 }}>Setujui Produksi</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 20, height: 20, color: "#9ca3af" }} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
              Menyetujui batch <strong style={{ color: "#111827" }}>{modal.item.nomorBatch}</strong>. Stok semen FG akan otomatis bertambah.
            </p>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#4b5563", textTransform: "uppercase", marginBottom: 6 }}>Catatan (opsional)</label>
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan approval..." rows={2}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, resize: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setModal(null)}
                style={{ flex: 1, padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#4b5563", backgroundColor: "white", cursor: "pointer" }}>
                Batal
              </button>
              <button onClick={() => handleAction("approve")} disabled={submitting}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "white", backgroundColor: "#22c55e", border: "none", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "Memproses..." : "Setujui & Tambah Stok FG"}
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
              <h3 style={{ fontWeight: 700, color: "#0f1729", margin: 0 }}>Tolak Produksi</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 20, height: 20, color: "#9ca3af" }} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
              Tolak batch <strong style={{ color: "#111827" }}>{modal.item.nomorBatch}</strong>. Stok FG tidak akan bertambah.
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
                {submitting ? "Memproses..." : "Tolak Produksi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}