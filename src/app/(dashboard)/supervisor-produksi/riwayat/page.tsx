"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
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

export default function RiwayatProduksiPage() {
  const [produksi, setProduksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/produksi?${params}`);
    const data = await res.json();
    setProduksi(data.produksi || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [filterStatus]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1729]">Riwayat Produksi</h1>
          <p className="text-gray-500 text-sm mt-1">Semua data batch produksi</p>
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
            <option value="">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="MENUNGGU_APPROVAL">Menunggu Approval</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
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
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">Belum ada data produksi</div>
        ) : produksi.map((p: any) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{p.nomorBatch}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(p.tanggalMulai)} · {p.user.namaLengkap}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.totalOutputKg && (
                  <p className="text-sm text-gray-500">{formatNumber(p.totalOutputKg)} kg output</p>
                )}
                {p.efisiensi && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                    {p.efisiensi}% efisiensi
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[p.status]}`}>
                  {statusLabel[p.status]}
                </span>
                {expanded === p.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
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
                  <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">Catatan: {p.catatan}</p>
                )}
                {p.approval && (
                  <div className={`mt-3 pt-3 border-t border-gray-100 text-xs ${p.approval.status === "DISETUJUI" ? "text-green-600" : p.approval.status === "DITOLAK" ? "text-red-600" : "text-amber-600"}`}>
                    {p.approval.status === "PENDING" ? "Menunggu persetujuan Manager" :
                      p.approval.status === "DISETUJUI" ? `Disetujui oleh ${p.approval.user?.namaLengkap}` :
                        `Ditolak oleh ${p.approval.user?.namaLengkap}${p.approval.catatan ? ` — ${p.approval.catatan}` : ""}`}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}