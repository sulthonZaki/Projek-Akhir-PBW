"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw, Plus, X } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function SuratJalanPage() {
  const [suratJalan, setSuratJalan] = useState<any[]>([]);
  const [transaksiKeluar, setTransaksiKeluar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ transaksiId: "", nomorSJ: "" });

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    setLoading(true);
    const [sjRes, transaksiRes] = await Promise.all([
      fetch("/api/surat-jalan"),
      fetch("/api/fg/transaksi?jenis=KELUAR"),
    ]);
    const sjData = await sjRes.json();
    const transaksiData = await transaksiRes.json();
    setSuratJalan(sjData);
    setTransaksiKeluar(transaksiData.transaksi?.filter((t: any) => !t.nomorSJ) || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSubmit() {
    if (!form.transaksiId || !form.nomorSJ) {
      return showToast("Pilih transaksi dan isi nomor surat jalan", "error");
    }
    setSubmitting(true);
    const res = await fetch("/api/surat-jalan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return showToast(data.error || "Gagal menyimpan", "error");
    showToast("Surat jalan berhasil dibuat");
    setModal(false);
    setForm({ transaksiId: "", nomorSJ: "" });
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
          <h1 className="text-2xl font-bold text-[#0f1729]">Surat Jalan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola surat jalan pengiriman semen ke customer</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-[#0f1729] hover:bg-[#1a2744] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Buat Surat Jalan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">No. Surat Jalan</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">No. Dokumen</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Jenis Semen</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Memuat data...</td></tr>
            ) : suratJalan.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Belum ada surat jalan</td></tr>
            ) : suratJalan.map((sj: any) => (
              <tr key={sj.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3 text-sm font-mono font-semibold text-[#E8A020]">{sj.nomorSJ}</td>
                <td className="px-5 py-3 text-sm font-mono text-gray-600">{sj.nomorDokumen}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDateTime(sj.tanggal)}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{sj.jenisSemen.nama}</td>
                <td className="px-5 py-3 text-sm text-gray-800">{formatNumber(sj.jumlah)} {sj.satuan}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{sj.customer?.nama || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">Buat Surat Jalan</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Pilih Transaksi Keluar</label>
                <select value={form.transaksiId} onChange={(e) => setForm({ ...form, transaksiId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                  <option value="">Pilih transaksi</option>
                  {transaksiKeluar.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.nomorDokumen} — {t.jenisSemen.nama} ({formatNumber(t.jumlah)} {t.satuan})
                    </option>
                  ))}
                </select>
                {transaksiKeluar.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Semua transaksi keluar sudah memiliki surat jalan</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Nomor Surat Jalan</label>
                <input type="text" value={form.nomorSJ} onChange={(e) => setForm({ ...form, nomorSJ: e.target.value })}
                  placeholder="SJ/2026/07/001"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#0f1729] text-white rounded-lg text-sm font-medium hover:bg-[#1a2744] transition disabled:opacity-60">
                {submitting ? "Menyimpan..." : "Buat Surat Jalan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}