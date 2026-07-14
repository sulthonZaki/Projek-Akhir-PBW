"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";

const statusBadge: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  MENUNGGU_APPROVAL: "bg-amber-100 text-amber-700",
  DISETUJUI: "bg-green-100 text-green-700",
  DITOLAK: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  MENUNGGU_APPROVAL: "Menunggu Approval",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
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
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}<button onClick={() => setToast(null)}><X className="w-3 h-3" /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1729]">Approval Produksi</h1>
          <p className="text-gray-500 text-sm mt-1">Review dan setujui hasil produksi dari Supervisor</p>
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
            <option value="MENUNGGU_APPROVAL">Menunggu Approval</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
            <option value="">Semua</option>
          </select>
          <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">Memuat data...</div>
        ) : produksi.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            Tidak ada produksi yang perlu di-review
          </div>
        ) : produksi.map((p: any) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{p.nomorBatch}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateTime(p.tanggalMulai)} · oleh {p.user.namaLengkap}
                  </p>
                  {p.totalOutputKg && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Output: <span className="font-medium">{formatNumber(p.totalOutputKg)} kg</span>
                      {p.efisiensi && <span className="ml-2 text-blue-500">{p.efisiensi}% efisiensi</span>}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusBadge[p.status]}`}>
                  {statusLabel[p.status]}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {p.status === "MENUNGGU_APPROVAL" && (
                  <>
                    <button
                      onClick={() => { setModal({ type: "approve", item: p }); setCatatan(""); }}
                      className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition font-medium"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Setujui
                    </button>
                    <button
                      onClick={() => { setModal({ type: "reject", item: p }); setCatatan(""); }}
                      className="flex items-center gap-1.5 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition font-medium"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak
                    </button>
                  </>
                )}
                <button
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                >
                  {expanded === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {expanded === p.id ? "Sembunyikan" : "Lihat Detail"}
                </button>
              </div>
            </div>

            {expanded === p.id && (
              <div className="border-t border-gray-100 px-5 py-4">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bahan Baku Terpakai</p>
                    <div className="space-y-1.5">
                      {p.detailRM.map((d: any) => (
                        <div key={d.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{d.jenisBahanBaku.nama}</span>
                          <span className="font-medium">{formatNumber(d.jumlahTerpakai)} {d.satuan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Output Semen</p>
                    <div className="space-y-1.5">
                      {p.detailFG.map((d: any) => (
                        <div key={d.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{d.jenisSemen.nama}</span>
                          <span className="font-medium">{formatNumber(d.jumlahOutput)} {d.satuan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {p.catatan && (
                  <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                    Catatan Supervisor: {p.catatan}
                  </p>
                )}

                {p.approval && p.approval.status !== "PENDING" && (
                  <div className={`mt-3 pt-3 border-t border-gray-100 text-xs ${p.approval.status === "DISETUJUI" ? "text-green-600" : "text-red-600"}`}>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">Setujui Produksi</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Menyetujui batch <span className="font-semibold text-gray-800">{modal.item.nomorBatch}</span>.
              Stok semen FG akan otomatis bertambah.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Catatan (opsional)</label>
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan approval..." rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] resize-none" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={() => handleAction("approve")} disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
                {submitting ? "Memproses..." : "Setujui & Tambah Stok FG"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {modal?.type === "reject" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">Tolak Produksi</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Tolak batch <span className="font-semibold text-gray-800">{modal.item.nomorBatch}</span>.
              Stok FG tidak akan bertambah.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Alasan Penolakan</label>
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                placeholder="Berikan alasan penolakan..." rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] resize-none" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={() => handleAction("reject")} disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
                {submitting ? "Memproses..." : "Tolak Produksi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}