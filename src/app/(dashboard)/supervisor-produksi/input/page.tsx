"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Factory } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InputProduksiPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [jenisBahanBaku, setJenisBahanBaku] = useState<any[]>([]);
  const [jenisSemen, setJenisSemen] = useState<any[]>([]);

  const [form, setForm] = useState({
    tanggalMulai: new Date().toISOString().split("T")[0],
    tanggalSelesai: new Date().toISOString().split("T")[0],
    catatan: "",
  });

  const [detailRM, setDetailRM] = useState([
    { jenisBahanBakuId: "", jumlahTerpakai: "", satuan: "TON" },
  ]);

  const [detailFG, setDetailFG] = useState([
    { jenisSemenId: "", jumlahOutput: "", satuan: "KG" },
  ]);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    fetch("/api/master-data").then((r) => r.json()).then((d) => {
      setJenisBahanBaku(d.jenisBahanBaku?.filter((j: any) => j.aktif) || []);
      setJenisSemen(d.jenisSemen?.filter((j: any) => j.aktif) || []);
    });
  }, []);

  function addDetailRM() {
    setDetailRM([...detailRM, { jenisBahanBakuId: "", jumlahTerpakai: "", satuan: "TON" }]);
  }

  function removeDetailRM(index: number) {
    setDetailRM(detailRM.filter((_, i) => i !== index));
  }

  function addDetailFG() {
    setDetailFG([...detailFG, { jenisSemenId: "", jumlahOutput: "", satuan: "KG" }]);
  }

  function removeDetailFG(index: number) {
    setDetailFG(detailFG.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!form.tanggalMulai) return showToast("Tanggal mulai wajib diisi", "error");
    if (detailRM.some((d) => !d.jenisBahanBakuId || !d.jumlahTerpakai)) {
      return showToast("Lengkapi semua data bahan baku", "error");
    }
    if (detailFG.some((d) => !d.jenisSemenId || !d.jumlahOutput)) {
      return showToast("Lengkapi semua data hasil produksi", "error");
    }

    setSubmitting(true);
    const res = await fetch("/api/produksi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, detailRM, detailFG }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) return showToast(data.error || "Gagal menyimpan", "error");
    showToast("Data produksi berhasil diinput, menunggu approval Manager");
    setTimeout(() => router.push("/supervisor-produksi/riwayat"), 1500);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#0f1729]">Input Produksi</h1>
        <p className="text-gray-500 text-sm mt-1">Catat pemakaian bahan baku dan hasil produksi</p>
      </div>

      {/* Info produksi */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-[#0f1729] text-sm flex items-center gap-2">
          <Factory className="w-4 h-4 text-[#E8A020]" /> Informasi Produksi
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Tanggal Mulai</label>
            <input type="date" value={form.tanggalMulai}
              onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Tanggal Selesai</label>
            <input type="date" value={form.tanggalSelesai}
              onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Catatan</label>
          <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            placeholder="Catatan produksi (opsional)" rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] resize-none" />
        </div>
      </div>

      {/* Detail RM terpakai */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#0f1729] text-sm">Bahan Baku Terpakai</h2>
          <button onClick={addDetailRM}
            className="flex items-center gap-1.5 text-xs text-[#E8A020] hover:text-[#d4911a] font-medium transition">
            <Plus className="w-3.5 h-3.5" /> Tambah Bahan Baku
          </button>
        </div>
        <div className="space-y-3">
          {detailRM.map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Bahan Baku</label>
                <select value={d.jenisBahanBakuId}
                  onChange={(e) => { const arr = [...detailRM]; arr[i].jenisBahanBakuId = e.target.value; setDetailRM(arr); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                  <option value="">Pilih bahan baku</option>
                  {jenisBahanBaku.map((j: any) => <option key={j.id} value={j.id}>{j.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Jumlah</label>
                <input type="number" value={d.jumlahTerpakai} placeholder="0"
                  onChange={(e) => { const arr = [...detailRM]; arr[i].jumlahTerpakai = e.target.value; setDetailRM(arr); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Satuan</label>
                <select value={d.satuan}
                  onChange={(e) => { const arr = [...detailRM]; arr[i].satuan = e.target.value; setDetailRM(arr); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                  {["TON", "KG"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={() => removeDetailRM(i)} disabled={detailRM.length === 1}
                className="p-2.5 text-red-400 hover:bg-red-50 rounded-lg transition disabled:opacity-30">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detail FG output */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#0f1729] text-sm">Hasil Produksi (Output Semen)</h2>
          <button onClick={addDetailFG}
            className="flex items-center gap-1.5 text-xs text-[#E8A020] hover:text-[#d4911a] font-medium transition">
            <Plus className="w-3.5 h-3.5" /> Tambah Output
          </button>
        </div>
        <div className="space-y-3">
          {detailFG.map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Jenis Semen</label>
                <select value={d.jenisSemenId}
                  onChange={(e) => { const arr = [...detailFG]; arr[i].jenisSemenId = e.target.value; setDetailFG(arr); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                  <option value="">Pilih jenis semen</option>
                  {jenisSemen.map((j: any) => <option key={j.id} value={j.id}>{j.nama} - {j.kemasan.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Jumlah</label>
                <input type="number" value={d.jumlahOutput} placeholder="0"
                  onChange={(e) => { const arr = [...detailFG]; arr[i].jumlahOutput = e.target.value; setDetailFG(arr); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Satuan</label>
                <select value={d.satuan}
                  onChange={(e) => { const arr = [...detailFG]; arr[i].satuan = e.target.value; setDetailFG(arr); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white">
                  {["KG", "TON", "SAK"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={() => removeDetailFG(i)} disabled={detailFG.length === 1}
                className="p-2.5 text-red-400 hover:bg-red-50 rounded-lg transition disabled:opacity-30">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
          Batal
        </button>
        <button onClick={handleSubmit} disabled={submitting}
          className="flex-1 bg-[#0f1729] hover:bg-[#1a2744] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60">
          {submitting ? "Menyimpan..." : "Submit ke Manager untuk Approval"}
        </button>
      </div>
    </div>
  );
}