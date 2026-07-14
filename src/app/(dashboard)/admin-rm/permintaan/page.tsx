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
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [modal, setModal] = useState<{
    type: "approve" | "reject";
    item: any;
  } | null>(null);
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
    setGudang(
      masterData.gudang?.filter((g: any) => g.aktif && g.tipe === "RM") || [],
    );
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  async function handleAction(type: "approve" | "reject") {
    if (type === "approve" && !selectedGudang) {
      return showToast("Pilih gudang asal bahan baku", "error");
    }

    setSubmitting(true);
    const res = await fetch(`/api/permintaan-bb/${modal?.item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: type,
        catatanAdmin: catatan,
        gudangId: selectedGudang,
      }),
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
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {toast.msg}
          <button onClick={() => setToast(null)}>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1729]">
            Permintaan Bahan Baku
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola permintaan bahan baku dari Supervisor Produksi
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="SELESAI">Selesai</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
          <button
            onClick={fetchData}
            className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Alert pending */}
      {permintaan.filter((p) => p.status === "PENDING").length > 0 &&
        filterStatus === "PENDING" && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Ada{" "}
              <span className="font-semibold">
                {permintaan.filter((p) => p.status === "PENDING").length}{" "}
                permintaan
              </span>{" "}
              yang menunggu persetujuan kamu
            </p>
          </div>
        )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            Memuat data...
          </div>
        ) : permintaan.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            {filterStatus === "PENDING"
              ? "Tidak ada permintaan yang menunggu"
              : "Tidak ada data permintaan"}
          </div>
        ) : (
          permintaan.map((p: any) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {p.nomorPermintaan}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(p.tanggal)} · dari {p.user.namaLengkap}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.keperluanProduksi}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[p.status]}`}
                  >
                    {statusLabel[p.status]}
                  </span>
                  {p.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => {
                          setModal({ type: "approve", item: p });
                          setCatatan("");
                          setSelectedGudang("");
                        }}
                        className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition font-medium"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Setujui
                      </button>
                      <button
                        onClick={() => {
                          setModal({ type: "reject", item: p });
                          setCatatan("");
                        }}
                        className="flex items-center gap-1.5 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition font-medium"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Tolak
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  >
                    {expanded === p.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {expanded === p.id && (
                <div className="border-t border-gray-100 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                    Detail Bahan Baku yang Diminta
                  </p>
                  <div className="space-y-2">
                    {p.details.map((d: any) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5"
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {d.jenisBahanBaku.nama}
                        </p>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-800">
                            {d.jumlah} {d.satuan}
                          </p>
                          {d.keterangan && (
                            <p className="text-xs text-gray-400">
                              {d.keterangan}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {p.catatanAdmin && (
                    <div
                      className={`mt-3 p-3 rounded-lg text-xs ${p.status === "DITOLAK" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                    >
                      <span className="font-semibold">Catatan kamu:</span>{" "}
                      {p.catatanAdmin}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Approve */}
      {modal?.type === "approve" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">Setujui Permintaan</h3>
              <button onClick={() => setModal(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Menyetujui permintaan{" "}
              <span className="font-semibold text-gray-800">
                {modal.item.nomorPermintaan}
              </span>
              . Barang keluar akan otomatis tercatat di sistem.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Gudang Asal
                </label>
                <select
                  value={selectedGudang}
                  onChange={(e) => setSelectedGudang(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                >
                  <option value="">Pilih gudang</option>
                  {gudang.map((g: any) => (
                    <option key={g.id} value={g.id}>
                      {g.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Catatan (opsional)
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan untuk supervisor..."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleAction("approve")}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
              >
                {submitting ? "Memproses..." : "Setujui & Keluarkan Barang"}
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
              <h3 className="font-bold text-[#0f1729]">Tolak Permintaan</h3>
              <button onClick={() => setModal(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Tolak permintaan{" "}
              <span className="font-semibold text-gray-800">
                {modal.item.nomorPermintaan}
              </span>{" "}
              dari {modal.item.user.namaLengkap}.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Alasan Penolakan
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Berikan alasan penolakan..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] resize-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
              >
                {submitting ? "Memproses..." : "Tolak Permintaan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
