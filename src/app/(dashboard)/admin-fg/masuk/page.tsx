"use client";

import { useEffect, useState } from "react";
import { Plus, X, RefreshCw } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function BarangMasukFGPage() {
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [jenisSemen, setJenisSemen] = useState<any[]>([]);
  const [gudang, setGudang] = useState<any[]>([]);

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    jenisSemenId: "",
    jumlah: "",
    satuan: "SAK",
    gudangId: "",
    keterangan: "",
  });

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    setLoading(true);
    const [transaksiRes, masterRes] = await Promise.all([
      fetch("/api/fg/transaksi?jenis=MASUK"),
      fetch("/api/master-data"),
    ]);
    const transaksiData = await transaksiRes.json();
    const masterData = await masterRes.json();
    setTransaksi(transaksiData.transaksi || []);
    setJenisSemen(masterData.jenisSemen?.filter((j: any) => j.aktif) || []);
    setGudang(masterData.gudang?.filter((g: any) => g.aktif && g.tipe === "FG") || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSubmit() {
    if (!form.jenisSemenId || !form.jumlah || !form.gudangId) {
      return showToast("Jenis semen, jumlah, dan gudang wajib diisi", "error");
    }
    setSubmitting(true);
    const res = await fetch("/api/fg/transaksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, jenis: "MASUK" }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return showToast(data.error || "Gagal menyimpan", "error");
    showToast("Transaksi masuk berhasil dicatat");
    setModal(false);
    setForm({ tanggal: new Date().toISOString().split("T")[0], jenisSemenId: "", jumlah: "", satuan: "SAK", gudangId: "", keterangan: "" });
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
          <h1 className="text-2xl font-bold text-[#0f1729]">Barang Masuk FG</h1>
          <p className="text-gray-500 text-sm mt-1">Penerimaan semen dari hasil produksi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-[#0f1729] hover:bg-[#1a2744] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Input Barang Masuk
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3">
        <p className="text-sm text-amber-700">
          Barang masuk FG biasanya otomatis tercatat saat Manager menyetujui produksi. Input manual hanya untuk penyesuaian stok.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">No. Dokumen</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Jenis Semen</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Dicatat Oleh</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Memuat data...</td></tr>
            ) : transaksi.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Belum ada transaksi masuk</td></tr>
            ) : transaksi.map((t: any) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3 text-sm font-mono text-gray-600">{t.nomorDokumen}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{formatDateTime(t.tanggal)}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{t.jenisSemen.nama}</td>
                <td className="px-5 py-3 text-sm text-gray-800">{formatNumber(t.jumlah)} {t.satuan}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{t.user.namaLengkap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">Input Barang Masuk FG</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Jenis Semen</label>
                <select value={form.jenisSemenId} onChange={(e) => setForm({ ...form, jenisSemenId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                  <option value="">Pilih jenis semen</option>
                  {jenisSemen.map((j: any) => <option key={j.id} value={j.id}>{j.nama} — {j.kemasan.replace("_", " ")}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Jumlah</label>
                  <input type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                    placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Satuan</label>
                  <select value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                    {["SAK", "TON", "KG"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Gudang Tujuan</label>
                <select value={form.gudangId} onChange={(e) => setForm({ ...form, gudangId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                  <option value="">Pilih gudang</option>
                  {gudang.map((g: any) => <option key={g.id} value={g.id}>{g.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Keterangan</label>
                <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  placeholder="Keterangan (opsional)" rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#0f1729] text-white rounded-lg text-sm font-medium hover:bg-[#1a2744] transition disabled:opacity-60">
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}