import React, { useState } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Code2,
  Bookmark
} from 'lucide-react';
import { mysql } from '../../db/mysqlEngine';

export const SQLQueryRunnerView: React.FC = () => {
  const [query, setQuery] = useState<string>('SELECT id, kode_barang, nama_barang, stok, stok_min, harga_beli FROM tbl_barang WHERE stok <= stok_min;');
  const [result, setResult] = useState<{
    success: boolean;
    columns: string[];
    rows: any[];
    executionTimeMs: number;
    affectedRows?: number;
    message?: string;
  } | null>(null);

  const sampleQueries = [
    {
      title: 'Daftar Semua Tabel',
      sql: 'SHOW TABLES;',
    },
    {
      title: 'Struktur Tabel Barang',
      sql: 'DESCRIBE tbl_barang;',
    },
    {
      title: 'Barang Stok Kritis (dibawah min)',
      sql: 'SELECT id, kode_barang, nama_barang, stok, stok_min, lokasi_rak FROM tbl_barang WHERE stok <= stok_min;',
    },
    {
      title: 'Daftar Pengguna Sistem',
      sql: 'SELECT id, username, nama_lengkap, email, role, is_active FROM tbl_users;',
    },
    {
      title: 'Barang dengan Kondisi Baik',
      sql: "SELECT kode_barang, nama_barang, stok, harga_beli, kondisi FROM tbl_barang WHERE kondisi = 'Baik' LIMIT 10;",
    },
    {
      title: 'Cek Versi MySQL Server',
      sql: 'SELECT VERSION(), DATABASE(), USER();',
    },
  ];

  const handleExecute = () => {
    if (!query.trim()) return;
    const res = mysql.executeQuery(query);
    setResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-mono">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              MySQL SQL Query Runner &amp; Console
            </h2>
            <p className="text-xs text-slate-500">
              Jalankan perintah SQL langsung terhadap database <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">db_ci_inventaris</span> (SELECT, SHOW TABLES, DESCRIBE, JOIN).
            </p>
          </div>
        </div>
      </div>

      {/* Editor & Presets Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Query Editor */}
        <div className="lg:col-span-3 space-y-3">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-xs">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono font-medium text-slate-300">db_ci_inventaris &gt; SQL Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuery('')}
                  className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  Bersihkan
                </button>
              </div>
            </div>

            {/* SQL Textarea */}
            <textarea
              rows={6}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tuliskan query SQL di sini (akhiri dengan titik koma ;)..."
              className="w-full p-4 font-mono text-xs bg-slate-950 text-cyan-300 focus:outline-hidden leading-relaxed resize-y"
            />

            {/* Editor Action Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">Tekan tombol Jalankan untuk mengeksekusi kueri</span>
              <button
                onClick={handleExecute}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Jalankan SQL (Execute)</span>
              </button>
            </div>
          </div>

          {/* Execution Results View */}
          {result && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  {result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={result.success ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-red-600 font-semibold'}>
                    {result.message || (result.success ? 'Kueri berhasil dieksekusi' : 'Kueri gagal')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{result.executionTimeMs} ms</span>
                </div>
              </div>

              {/* Table Data */}
              {result.rows.length > 0 ? (
                <div className="overflow-x-auto max-h-80 scrollbar-thin">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                      <tr>
                        {result.columns.map((c) => (
                          <th key={c} className="px-3.5 py-2 whitespace-nowrap">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] text-slate-800 dark:text-slate-200">
                      {result.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                          {result.columns.map((c) => (
                            <td key={c} className="px-3.5 py-1.5 whitespace-nowrap">
                              {row[c] === null ? (
                                <span className="text-slate-400 italic">NULL</span>
                              ) : (
                                String(row[c])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Query berhasil dieksekusi, tidak ada baris yang dikembalikan (0 rows returned).
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Preset SQL Query Shortcuts */}
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Contoh Query MySQL</span>
            </h3>

            <div className="space-y-2">
              {sampleQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(item.sql);
                    const res = mysql.executeQuery(item.sql);
                    setResult(res);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    {item.title}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                    {item.sql}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
