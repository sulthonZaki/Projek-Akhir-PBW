"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, RefreshCw } from "lucide-react";

type Tab =
  | "supplier"
  | "customer"
  | "jenis-bahan-baku"
  | "jenis-semen"
  | "gudang";

const tabs: { key: Tab; label: string }[] = [
  { key: "supplier", label: "Supplier" },
  { key: "customer", label: "Customer" },
  { key: "jenis-bahan-baku", label: "Jenis Bahan Baku" },
  { key: "jenis-semen", label: "Jenis Semen" },
  { key: "gudang", label: "Gudang" },
];

const satuanOptions = ["TON", "KG", "M3", "LITER", "UNIT"];
const kemasanOptions = ["SAK_40KG", "SAK_50KG", "CURAH"];
const tipeGudangOptions = ["RM", "FG", "PRODUKSI"];

const defaultForm: Record<Tab, any> = {
  supplier: { kode: "", nama: "", alamat: "", telepon: "", email: "" },
  customer: { kode: "", nama: "", alamat: "", telepon: "", email: "" },
  "jenis-bahan-baku": {
    kode: "",
    nama: "",
    satuan: "TON",
    stokMinimum: 0,
    keterangan: "",
  },
  "jenis-semen": {
    kode: "",
    nama: "",
    kemasan: "SAK_40KG",
    beratKg: 40,
    keterangan: "",
  },
  gudang: { kode: "", nama: "", lokasi: "", tipe: "RM" },
};

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>("supplier");
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>(defaultForm[activeTab]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/master-data");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setForm(defaultForm[activeTab]);
  }, [activeTab]);

  function getCurrentData(): any[] {
    const map: Record<Tab, string> = {
      supplier: "suppliers",
      customer: "customers",
      "jenis-bahan-baku": "jenisBahanBaku",
      "jenis-semen": "jenisSemen",
      gudang: "gudang",
    };
    return data[map[activeTab]] || [];
  }

  function openCreate() {
    setForm(defaultForm[activeTab]);
    setModal("create");
  }

  function openEdit(item: any) {
    setSelected(item);
    setForm({ ...item });
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setSelected(null);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const isEdit = modal === "edit";
    const url = `/api/master-data/${activeTab}`;
    const method = isEdit ? "PATCH" : "POST";
    const body = isEdit ? { ...form, id: selected.id } : form;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) return showToast(result.error, "error");
    showToast(isEdit ? "Data berhasil diupdate" : "Data berhasil ditambah");
    closeModal();
    fetchData();
  }

  async function handleDelete(item: any) {
    if (!confirm(`Nonaktifkan "${item.nama}"?`)) return;
    const res = await fetch(`/api/master-data/${activeTab}?id=${item.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("Data dinonaktifkan");
      fetchData();
    } else showToast("Gagal menonaktifkan data", "error");
  }

  function renderForm() {
    switch (activeTab) {
      case "supplier":
      case "customer":
        return (
          <>
            <Field
              label="Kode"
              value={form.kode}
              onChange={(v) => setForm({ ...form, kode: v })}
              placeholder="SUP-001"
            />
            <Field
              label="Nama"
              value={form.nama}
              onChange={(v) => setForm({ ...form, nama: v })}
              placeholder="Nama perusahaan"
            />
            <Field
              label="Alamat"
              value={form.alamat}
              onChange={(v) => setForm({ ...form, alamat: v })}
              placeholder="Alamat lengkap"
            />
            <Field
              label="Telepon"
              value={form.telepon}
              onChange={(v) => setForm({ ...form, telepon: v })}
              placeholder="08xxxxxxxxxx"
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="email@domain.com"
            />
          </>
        );
      case "jenis-bahan-baku":
        return (
          <>
            <Field
              label="Kode"
              value={form.kode}
              onChange={(v) => setForm({ ...form, kode: v })}
              placeholder="BB-001"
            />
            <Field
              label="Nama"
              value={form.nama}
              onChange={(v) => setForm({ ...form, nama: v })}
              placeholder="Batu Kapur"
            />
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Satuan
              </label>
              <select
                value={form.satuan}
                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
              >
                {satuanOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Stok Minimum"
              value={form.stokMinimum}
              onChange={(v) => setForm({ ...form, stokMinimum: Number(v) })}
              type="number"
              placeholder="0"
            />
            <Field
              label="Keterangan"
              value={form.keterangan}
              onChange={(v) => setForm({ ...form, keterangan: v })}
              placeholder="Opsional"
            />
          </>
        );
      case "jenis-semen":
        return (
          <>
            <Field
              label="Kode"
              value={form.kode}
              onChange={(v) => setForm({ ...form, kode: v })}
              placeholder="SEM-001"
            />
            <Field
              label="Nama"
              value={form.nama}
              onChange={(v) => setForm({ ...form, nama: v })}
              placeholder="Portland Cement"
            />
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Kemasan
              </label>
              <select
                value={form.kemasan}
                onChange={(e) => setForm({ ...form, kemasan: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
              >
                {kemasanOptions.map((k) => (
                  <option key={k} value={k}>
                    {k.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Berat (kg)"
              value={form.beratKg}
              onChange={(v) => setForm({ ...form, beratKg: Number(v) })}
              type="number"
              placeholder="40"
            />
            <Field
              label="Keterangan"
              value={form.keterangan}
              onChange={(v) => setForm({ ...form, keterangan: v })}
              placeholder="Opsional"
            />
          </>
        );
      case "gudang":
        return (
          <>
            <Field
              label="Kode"
              value={form.kode}
              onChange={(v) => setForm({ ...form, kode: v })}
              placeholder="GDG-001"
            />
            <Field
              label="Nama"
              value={form.nama}
              onChange={(v) => setForm({ ...form, nama: v })}
              placeholder="Gudang RM Utama"
            />
            <Field
              label="Lokasi"
              value={form.lokasi}
              onChange={(v) => setForm({ ...form, lokasi: v })}
              placeholder="Lokasi gudang"
            />
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Tipe
              </label>
              <select
                value={form.tipe}
                onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
              >
                {tipeGudangOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
    }
  }

  function renderTable() {
    const items = getCurrentData();
    if (loading)
      return (
        <p className="text-center py-12 text-gray-400 text-sm">
          Memuat data...
        </p>
      );
    if (items.length === 0)
      return (
        <p className="text-center py-12 text-gray-400 text-sm">
          Belum ada data
        </p>
      );

    return (
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
              Kode
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
              Nama
            </th>
            {activeTab === "jenis-bahan-baku" && (
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Satuan
              </th>
            )}
            {activeTab === "jenis-semen" && (
              <>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Kemasan
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Berat
                </th>
              </>
            )}
            {activeTab === "gudang" && (
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Tipe
              </th>
            )}
            {(activeTab === "supplier" || activeTab === "customer") && (
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Telepon
              </th>
            )}
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
              Status
            </th>
            <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any) => (
            <tr
              key={item.id}
              className="border-b border-gray-50 hover:bg-gray-50 transition"
            >
              <td className="px-5 py-3 text-sm font-mono text-gray-600">
                {item.kode}
              </td>
              <td className="px-5 py-3 text-sm font-medium text-gray-800">
                {item.nama}
              </td>
              {activeTab === "jenis-bahan-baku" && (
                <td className="px-5 py-3 text-sm text-gray-500">
                  {item.satuan}
                </td>
              )}
              {activeTab === "jenis-semen" && (
                <>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {item.kemasan?.replace("_", " ")}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {item.beratKg} kg
                  </td>
                </>
              )}
              {activeTab === "gudang" && (
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      item.tipe === "RM"
                        ? "bg-blue-100 text-blue-700"
                        : item.tipe === "FG"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.tipe}
                  </span>
                </td>
              )}
              {(activeTab === "supplier" || activeTab === "customer") && (
                <td className="px-5 py-3 text-sm text-gray-500">
                  {item.telepon || "-"}
                </td>
              )}
              <td className="px-5 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${item.aktif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {item.aktif ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {item.aktif && (
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
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
          <h1 className="text-2xl font-bold text-[#0f1729]">Master Data</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola data referensi sistem
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#0f1729] hover:bg-[#1a2744] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" /> Tambah{" "}
            {tabs.find((t) => t.key === activeTab)?.label}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-[#0f1729] text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {renderTable()}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0f1729]">
                {modal === "create" ? "Tambah" : "Edit"}{" "}
                {tabs.find((t) => t.key === activeTab)?.label}
              </h3>
              <button onClick={closeModal}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">{renderForm()}</div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#0f1729] text-white rounded-lg text-sm font-medium hover:bg-[#1a2744] transition disabled:opacity-60"
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]"
      />
    </div>
  );
}
