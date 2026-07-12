"use client";

import { useState } from "react";
import { Save, Shield, Bell, Database, Info } from "lucide-react";

export default function SettingsPage() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"sistem" | "notifikasi" | "keamanan" | "tentang">("sistem");

  const [sistemForm, setSistemForm] = useState({
    namaPerusahaan: "CemTrack Industries",
    alamat: "Jl. Industri No. 1, Semarang",
    telepon: "024-123456",
    email: "admin@cemtrack.co.id",
    tahunBerdiri: "2025",
  });

  const [notifForm, setNotifForm] = useState({
    stokMinimumAlert: true,
    approvalAlert: true,
    loginAlert: false,
    emailNotif: false,
  });

  const [keamananForm, setKeamananForm] = useState({
    sessionTimeout: "8",
    maxLoginAttempt: "5",
    requireStrongPassword: true,
  });

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleSave() {
    showToast("Pengaturan berhasil disimpan");
  }

  const tabs = [
    { key: "sistem", label: "Sistem", icon: Database },
    { key: "notifikasi", label: "Notifikasi", icon: Bell },
    { key: "keamanan", label: "Keamanan", icon: Shield },
    { key: "tentang", label: "Tentang", icon: Info },
  ] as const;

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#0f1729]">Pengaturan</h1>
        <p className="text-gray-500 text-sm mt-1">Konfigurasi sistem CemTrack</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Sidebar tabs */}
        <div className="bg-white rounded-xl border border-gray-100 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition mb-0.5 ${
                  activeTab === tab.key
                    ? "bg-[#0f1729] text-white font-medium"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          {activeTab === "sistem" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[#0f1729] text-base border-b border-gray-100 pb-3">
                Informasi Sistem
              </h2>
              {[
                { label: "Nama Perusahaan", key: "namaPerusahaan", placeholder: "Nama perusahaan" },
                { label: "Alamat", key: "alamat", placeholder: "Alamat lengkap" },
                { label: "Telepon", key: "telepon", placeholder: "Nomor telepon" },
                { label: "Email", key: "email", placeholder: "Email perusahaan" },
                { label: "Tahun Berdiri", key: "tahunBerdiri", placeholder: "2025" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={(sistemForm as any)[field.key]}
                    onChange={(e) => setSistemForm({ ...sistemForm, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]"
                  />
                </div>
              ))}
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#0f1729] hover:bg-[#1a2744] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          )}

          {activeTab === "notifikasi" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[#0f1729] text-base border-b border-gray-100 pb-3">
                Pengaturan Notifikasi
              </h2>
              {[
                { key: "stokMinimumAlert", label: "Alert Stok Minimum", desc: "Notifikasi ketika stok bahan baku di bawah minimum" },
                { key: "approvalAlert", label: "Alert Approval", desc: "Notifikasi ketika ada transaksi menunggu persetujuan" },
                { key: "loginAlert", label: "Alert Login", desc: "Notifikasi setiap kali ada user yang login" },
                { key: "emailNotif", label: "Notifikasi Email", desc: "Kirim notifikasi via email" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifForm({ ...notifForm, [item.key]: !(notifForm as any)[item.key] })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${(notifForm as any)[item.key] ? "bg-[#E8A020]" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(notifForm as any)[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#0f1729] hover:bg-[#1a2744] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          )}

          {activeTab === "keamanan" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[#0f1729] text-base border-b border-gray-100 pb-3">
                Pengaturan Keamanan
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Session Timeout (jam)
                </label>
                <select
                  value={keamananForm.sessionTimeout}
                  onChange={(e) => setKeamananForm({ ...keamananForm, sessionTimeout: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                >
                  {["1", "2", "4", "8", "12", "24"].map((v) => (
                    <option key={v} value={v}>{v} jam</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Maks. Percobaan Login
                </label>
                <select
                  value={keamananForm.maxLoginAttempt}
                  onChange={(e) => setKeamananForm({ ...keamananForm, maxLoginAttempt: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
                >
                  {["3", "5", "10"].map((v) => (
                    <option key={v} value={v}>{v} kali</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">Password Kuat</p>
                  <p className="text-xs text-gray-400 mt-0.5">Wajibkan kombinasi huruf, angka, dan simbol</p>
                </div>
                <button
                  onClick={() => setKeamananForm({ ...keamananForm, requireStrongPassword: !keamananForm.requireStrongPassword })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${keamananForm.requireStrongPassword ? "bg-[#E8A020]" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${keamananForm.requireStrongPassword ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#0f1729] hover:bg-[#1a2744] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          )}

          {activeTab === "tentang" && (
            <div className="space-y-5">
              <h2 className="font-semibold text-[#0f1729] text-base border-b border-gray-100 pb-3">
                Tentang Sistem
              </h2>
              <div className="flex items-center gap-4 p-4 bg-[#0f1729] rounded-xl">
                <div className="w-12 h-12 bg-[#E8A020] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">CemTrack</p>
                  <p className="text-gray-400 text-sm">Cement Warehouse Management System</p>
                </div>
              </div>
              {[
                { label: "Versi", value: "v1.0.0" },
                { label: "Framework", value: "Next.js 16 + TypeScript" },
                { label: "Database", value: "MySQL + Prisma ORM v6" },
                { label: "Autentikasi", value: "NextAuth.js v5" },
                { label: "Dikembangkan", value: "2025" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}