import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  Lock,
  User,
  Database,
  ArrowRight
} from 'lucide-react';
import { mysql } from '../../db/mysqlEngine';

export const ActivityLogView: React.FC = () => {
  const dbState = mysql.getState();
  const logs = dbState.activity_logs || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const filteredLogs = logs.filter((l) => {
    const matchesModule = selectedModule === 'all' || l.module === selectedModule;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      l.username.toLowerCase().includes(search) ||
      l.action.toLowerCase().includes(search) ||
      l.detail.toLowerCase().includes(search) ||
      l.ip_address.includes(search);

    return matchesModule && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ['Waktu', 'Username', 'Modul', 'Tindakan (Action)', 'Detail Aktivitas', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.username,
      l.module,
      l.action,
      `"${l.detail.replace(/"/g, '""')}"`,
      l.ip_address,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_log_keamanan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Log Audit Aktivitas &amp; Keamanan Sistem
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
              tbl_activity_logs ({filteredLogs.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail pencatatan aktivitas pengguna secara otomatis (login, mutasi inventaris, cadangan &amp; reset database).
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Ekspor Audit CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari user, action, atau detail..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500"
            />
          </div>

          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="all">Semua Modul Sistem</option>
              <option value="AUTENTIKASI">Modul Autentikasi (Login/Logout)</option>
              <option value="INVENTARIS">Modul Inventaris Barang</option>
              <option value="TRANSAKSI">Modul Transaksi Masuk/Keluar</option>
              <option value="DATABASE">Modul Database MySQL (Backup/Reset)</option>
              <option value="USER_MANAGEMENT">Modul Manajemen Pengguna</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Waktu &amp; Tanggal</th>
                <th className="px-4 py-3">Pengguna</th>
                <th className="px-4 py-3">Modul</th>
                <th className="px-4 py-3">Action Identifier</th>
                <th className="px-4 py-3">Rincian Aktivitas</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-sans text-xs">
                    Tidak ada log aktivitas yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      @{log.username}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-slate-700 dark:text-slate-300 max-w-md">
                      {log.detail}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {log.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
