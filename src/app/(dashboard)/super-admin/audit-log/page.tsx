"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Log = {
  id: number;
  aksi: string;
  modul: string;
  deskripsi: string;
  ipAddress: string | null;
  createdAt: string;
  user: { namaLengkap: string; role: string; username: string };
};

const aksiColor: Record<string, string> = {
  LOGIN: "bg-blue-100 text-blue-700",
  LOGOUT: "bg-gray-100 text-gray-700",
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

const modulOptions = ["AUTH", "USER", "MASTER", "RM", "PRODUKSI", "FG"];
const aksiOptions = ["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE"];

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_RM: "Admin RM",
  SUPERVISOR_PRODUKSI: "Supervisor",
  ADMIN_FG: "Admin FG",
  MANAGER: "Manager",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterModul, setFilterModul] = useState("");
  const [filterAksi, setFilterAksi] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function fetchLogs() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterModul) params.set("modul", filterModul);
    if (filterAksi) params.set("aksi", filterAksi);
    params.set("page", String(page));
    params.set("limit", "20");

    const res = await fetch(`/api/audit-log?${params}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }

  useEffect(() => { fetchLogs(); }, [search, filterModul, filterAksi, page]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f1729]">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-1">
            Riwayat aktivitas semua pengguna sistem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 bg-white border border-gray-100 px-3 py-2 rounded-lg">
            Total: <span className="font-semibold text-[#0f1729]">{total}</span> log
          </span>
          <button
            onClick={fetchLogs}
            className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari aktivitas atau nama user..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020]"
          />
        </div>
        <select
          value={filterModul}
          onChange={(e) => { setFilterModul(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
        >
          <option value="">Semua Modul</option>
          {modulOptions.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={filterAksi}
          onChange={(e) => { setFilterAksi(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8A020] bg-white"
        >
          <option value="">Semua Aksi</option>
          {aksiOptions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Waktu</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Modul</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  Memuat data...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  Tidak ada log ditemukan
                </td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0f1729] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {log.user.namaLengkap.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-none">
                        {log.user.namaLengkap}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {roleLabel[log.user.role]}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${aksiColor[log.aksi] || "bg-gray-100 text-gray-600"}`}>
                    {log.aksi}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                    {log.modul}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {log.deskripsi}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}