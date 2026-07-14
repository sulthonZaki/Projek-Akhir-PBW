"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
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

export default function PermintaanBBSupervisorPage() {
  const [permintaan, setPermintaan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [jenisBahanBaku, setJenisBahanBaku] = useState<any[]>([]);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    keperluanProduksi: "",
  });

  const [details, setDetails] = useState([
    { jenisBahanBakuId: "", jumlah: "", satuan: "TON", keterangan: "" },
  ]);

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
    setJenisBahanBaku(
      masterData.jenisBahanBaku?.filter((j: any) => j.aktif) || [],
    );
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  function addDetail() {
    setDetails([
      ...details,
      { jenisBahanBakuId: "", jumlah: "", satuan: "TON", keterangan: "" },
    ]);
  }

  function removeDetail(index: number) {
    setDetails(details.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!form.keperluanProduksi)
      return showToast("Keperluan produksi wajib diisi", "error");
    if (details.some((d) => !d.jenisBahanBakuId || !d.jumlah)) {
      return showToast("Lengkapi semua detail bahan baku", "error");
    }

    setSubmitting(true);
    const res = await fetch("/api/permintaan-bb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, details }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) return showToast(data.error || "Gagal menyimpan", "error");
    showToast("Permintaan bahan baku berhasil dikirim ke Admin RM");
    setModal(false);
    setForm({
      tanggal: new Date().toISOString().split("T")[0],
      keperluanProduksi: "",
    });
    setDetails([
      { jenisBahanBakuId: "", jumlah: "", satuan: "TON", keterangan: "" },
    ]);
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
            Ajukan permintaan bahan baku ke Admin Gudang RM
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
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
            <option value="SELESAI">Selesai</option>
          </select>
          <button
            onClick={fetchData}
            className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-[#0f1729] hover:bg-[#1a2744] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" /> Buat Permintaan
          </button>
        </div>
      </div>

      {/* List permintaan */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            Memuat data...
          </div>
        ) : permintaan.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
            Belum ada permintaan bahan baku
          </div>
        ) : (
          permintaan.map((p: any) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {p.nomorPermintaan}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateTime(p.tanggal)} · {p.keperluanProduksi}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[p.status]}`}
                  >
                    {statusLabel[p.status]}
                  </span>
                  {expanded === p.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {expanded === p.id && (
                <div className="border-t border-gray-100 px-5 py-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                    Detail Bahan Baku
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
                        <p className="text-sm text-gray-600">
                          {d.jumlah} {d.satuan}
                        </p>
                      </div>
                    ))}
                  </div>
                  {p.catatanAdmin && (
                    <div
                      className={`mt-3 p-3 rounded-lg text-xs ${p.status === "DITOLAK" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                    >
                      <span className="font-semibold">Catatan Admin RM:</span>{" "}
                      {p.catatanAdmin}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal buat permintaan */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">
                Buat Permintaan Bahan Baku
              </h3>
              <button onClick={() => setModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Tanggal Kebutuhan
                </label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm({ ...form, tanggal: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Keperluan Produksi
                </label>
                <textarea
                  value={form.keperluanProduksi}
                  onChange={(e) =>
                    setForm({ ...form, keperluanProduksi: e.target.value })
                  }
                  placeholder="Contoh: Produksi Portland Cement batch minggu ini"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Detail Bahan Baku
                  </label>
                  <button
                    onClick={addDetail}
                    className="flex items-center gap-1 text-xs text-[#E8A020] font-medium hover:text-[#d4911a]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>

                <div className="space-y-2">
                  {details.map((d, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-lg p-3 space-y-2"
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: "0.5rem",
                          alignItems: "start",
                        }}
                      >
                        <select
                          value={d.jenisBahanBakuId}
                          onChange={(e) => {
                            const arr = [...details];
                            arr[i].jenisBahanBakuId = e.target.value;
                            setDetails(arr);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                        >
                          <option value="">Pilih bahan baku</option>
                          {jenisBahanBaku.map((j: any) => (
                            <option key={j.id} value={j.id}>
                              {j.nama}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeDetail(i)}
                          disabled={details.length === 1}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 100px",
                          gap: "0.5rem",
                        }}
                      >
                        <input
                          type="number"
                          value={d.jumlah}
                          placeholder="Jumlah"
                          onChange={(e) => {
                            const arr = [...details];
                            arr[i].jumlah = e.target.value;
                            setDetails(arr);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]"
                        />
                        <select
                          value={d.satuan}
                          onChange={(e) => {
                            const arr = [...details];
                            arr[i].satuan = e.target.value;
                            setDetails(arr);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                        >
                          {["TON", "KG"].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        value={d.keterangan}
                        placeholder="Keterangan (opsional)"
                        onChange={(e) => {
                          const arr = [...details];
                          arr[i].keterangan = e.target.value;
                          setDetails(arr);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#0f1729] text-white rounded-lg text-sm font-medium hover:bg-[#1a2744] transition disabled:opacity-60"
              >
                {submitting ? "Mengirim..." : "Kirim Permintaan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
