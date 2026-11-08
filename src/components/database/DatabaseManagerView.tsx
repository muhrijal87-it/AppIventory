import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Server,
  Layers,
  Table,
  Eye,
  Info,
  ShieldAlert
} from 'lucide-react';
import { mysql, TABLE_DEFINITIONS } from '../../db/mysqlEngine';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

export const DatabaseManagerView: React.FC = () => {
  const { user, can } = useAuth();
  const { reloadState, setFlash } = useInventory();

  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'reset' | 'tables'>('backup');
  const [sqlPreview, setSqlPreview] = useState<string>('');
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Restore state
  const [pasteSql, setPasteSql] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Reset state modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetType, setResetType] = useState<'default' | 'clean'>('default');
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetError, setResetError] = useState('');

  // Selected table inspector
  const [inspectedTable, setInspectedTable] = useState<string>('tbl_barang');

  const handleGenerateBackup = () => {
    const dump = mysql.generateSQLDump();
    setSqlPreview(dump);
    setShowSqlPreview(true);
  };

  const handleDownloadBackup = () => {
    const dump = mysql.generateSQLDump();
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const filename = `backup_db_ci_inventaris_${timestamp}.sql`;

    const blob = new Blob([dump], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFlash('success', `File cadangan MySQL '${filename}' berhasil diunduh!`);
  };

  const handleDownloadJSON = () => {
    const state = mysql.getState();
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const filename = `backup_db_ci_inventaris_${timestamp}.json`;

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFlash('success', `File cadangan format JSON '${filename}' berhasil diunduh!`);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlPreview || mysql.generateSQLDump());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        executeRestore(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const executeRestore = (content: string) => {
    const result = mysql.restoreFromContent(content, user || undefined);
    setRestoreStatus(result);
    if (result.success) {
      reloadState();
      setFlash('success', result.message);
    } else {
      setFlash('error', result.message);
    }
  };

  const handleConfirmReset = () => {
    if (resetConfirmText.toLowerCase() !== 'reset') {
      setResetError('Ketik "RESET" dengan benar untuk mengonfirmasi tindakan ini.');
      return;
    }

    mysql.resetDatabase(resetType === 'default', user || undefined);
    reloadState();
    setShowResetModal(false);
    setResetConfirmText('');
    setResetError('');
    setFlash(
      'warning',
      resetType === 'default'
        ? 'Database MySQL telah berhasil direset ke data awal pabrik (Default Demo Seed)!'
        : 'Database MySQL telah direset bersih (seluruh tabel dikosongkan)!'
    );
  };

  const dbState = mysql.getState();
  const totalRows = TABLE_DEFINITIONS.reduce((acc, t) => acc + mysql.getTableRowCount(t.name), 0);

  return (
    <div className="space-y-6">
      {/* Top Database Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white flex items-center justify-center shadow-xs">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Pengelola Database MySQL (db_ci_inventaris)
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                  InnoDB Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Host: <span className="font-mono text-slate-700 dark:text-slate-300">127.0.0.1:3306</span> · Charset: <span className="font-mono">utf8mb4</span> · Terakhir diperbarui: <span className="font-mono">{new Date(dbState.lastUpdated).toLocaleString('id-ID')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Backup .SQL</span>
            </button>
            {can('reset_db') && (
              <button
                onClick={() => {
                  setResetType('default');
                  setShowResetModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Database</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Database Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Total Tabel Database</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">9 Tabel</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Total Baris Record</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{totalRows} Baris</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Koneksi Driver CI4</div>
            <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm mt-0.5">MySQLi / PDO</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Status Integritas</div>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">TERVERIFIKASI</div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 pt-2">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-semibold bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Cadangkan Database (Backup)</span>
          </button>

          {can('restore_db') && (
            <button
              onClick={() => setActiveTab('restore')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'restore'
                  ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-semibold bg-white dark:bg-slate-900 rounded-t-lg'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Pulihkan Database (Restore)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'tables'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-semibold bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Struktur Tabel MySQL</span>
          </button>

          {can('reset_db') && (
            <button
              onClick={() => setActiveTab('reset')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'reset'
                  ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold bg-white dark:bg-slate-900 rounded-t-lg'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-red-500" />
              <span>Reset Database</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="max-w-2xl">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ekspor Cadangan Database MySQL (.sql Dump)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fitur ini menghasilkan file dump MySQL standar berisikan seluruh struktur tabel DDL (CREATE TABLE) dan data rekaman DML (INSERT INTO) yang dapat diimpor langsung ke phpMyAdmin atau server MySQL produksi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SQL Backup Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm mb-3">
                      SQL
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      File Dump Standar MySQL (.sql)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Kompatibel penuh dengan MySQL 5.7/8.0, MariaDB, phpMyAdmin, DBeaver, Navicat, dan CodeIgniter Database Migrations.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={handleDownloadBackup}
                      className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh .SQL Dump</span>
                    </button>
                    <button
                      onClick={handleGenerateBackup}
                      className="py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview SQL</span>
                    </button>
                  </div>
                </div>

                {/* JSON Backup Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
                      JSON
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Cadangan Format JSON (.json)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Format objek ringkas untuk pertukaran data API, backup cepat, atau restorasi cepat antar sesi browser.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={handleDownloadJSON}
                      className="w-full py-2 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-900 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Cadangan JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SQL Preview Box if toggled */}
              {showSqlPreview && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mt-6">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-950 text-slate-300 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono">Preview Dump MySQL (db_ci_inventaris.sql)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopySQL}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Tersalin' : 'Salin SQL'}</span>
                      </button>
                      <button
                        onClick={() => setShowSqlPreview(false)}
                        className="p-1 hover:text-white text-slate-400"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 max-h-80 overflow-y-auto scrollbar-thin">
                    <pre className="whitespace-pre">{sqlPreview}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RESTORE */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              <div className="max-w-2xl">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pulihkan Database dari Cadangan (Restore)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pilih file .sql atau .json yang sebelumnya diunduh, atau tempelkan skrip query MySQL langsung untuk memulihkan tabel inventaris.
                </p>
              </div>

              {restoreStatus && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                    restoreStatus.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                  }`}
                >
                  {restoreStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{restoreStatus.message}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Unggah File Cadangan (.sql atau .json)
                </h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  File dump MySQL otomatis diparsing dan diterapkan ke database aplikasi.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih File dari Komputer</span>
                  <input
                    type="file"
                    accept=".sql,.json,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste SQL text option */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Atau Tempelkan Skrip SQL / JSON Cadangan Secara Manual:
                </label>
                <textarea
                  rows={5}
                  value={pasteSql}
                  onChange={(e) => setPasteSql(e.target.value)}
                  placeholder="Tempelkan isi file .sql atau .json di sini (contoh: INSERT INTO tbl_barang VALUES (...))"
                  className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-cyan-500"
                />
                <div className="flex justify-end">
                  <button
                    disabled={!pasteSql.trim()}
                    onClick={() => executeRestore(pasteSql)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
                  >
                    Eksekusi Pemulihan (Restore Script)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TABLES INSPECTOR */}
          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Inspeksi Skema &amp; Rekaman Tabel MySQL
                  </h3>
                  <p className="text-xs text-slate-500">
                    Melihat definisi kolom, tipe data, kunci primer, dan isi data langsung dari tabel database.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Pilih Tabel:</label>
                  <select
                    value={inspectedTable}
                    onChange={(e) => setInspectedTable(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-800 dark:text-slate-200"
                  >
                    {TABLE_DEFINITIONS.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({mysql.getTableRowCount(t.name)} rows)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table Schema Viewer */}
              {(() => {
                const def = TABLE_DEFINITIONS.find((t) => t.name === inspectedTable);
                const rawKey = inspectedTable.replace('tbl_', '');
                const rows = (dbState as any)[rawKey] || [];

                return (
                  <div className="space-y-4">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-3 py-2">Field (Kolom)</th>
                            <th className="px-3 py-2">Type Data</th>
                            <th className="px-3 py-2">Key</th>
                            <th className="px-3 py-2">Extra</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                          {def?.columns.map((c) => (
                            <tr key={c.name} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                              <td className="px-3 py-1.5 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                              <td className="px-3 py-1.5 text-cyan-600 dark:text-cyan-400">{c.type}</td>
                              <td className="px-3 py-1.5">
                                {c.key === 'PRI' ? (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                                    PRI (PRIMARY)
                                  </span>
                                ) : c.key === 'UNI' ? (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold text-[10px]">
                                    UNI (UNIQUE)
                                  </span>
                                ) : (
                                  c.key || '-'
                                )}
                              </td>
                              <td className="px-3 py-1.5 text-slate-500">{c.extra || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Sample Records in Selected Table */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>Data Rekaman ({rows.length} baris)</span>
                        </h4>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-60 scrollbar-thin">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0 font-semibold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              {rows.length > 0
                                ? Object.keys(rows[0]).map((k) => (
                                    <th key={k} className="px-3 py-1.5 font-mono">
                                      {k}
                                    </th>
                                  ))
                                : <th className="px-3 py-2">Data Kosong</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {rows.map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                                {Object.keys(row).map((k) => (
                                  <td key={k} className="px-3 py-1.5 whitespace-nowrap">
                                    {row[k] === null ? (
                                      <span className="text-slate-400 italic">NULL</span>
                                    ) : typeof row[k] === 'boolean' ? (
                                      row[k] ? '1' : '0'
                                    ) : (
                                      String(row[k])
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: RESET DATABASE */}
          {activeTab === 'reset' && can('reset_db') && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-red-900 dark:text-red-200">Perhatian: Area Berbahaya (Danger Zone)</h4>
                  <p className="text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                    Operasi reset database akan mengubah seluruh data pada tabel MySQL. Pastikan Anda telah membuat salinan cadangan (.sql dump) sebelum melakukan tindakan ini.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reset to Default Seed */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      1. Reset ke Data Default Pabrik (Demo Seed)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Mengembalikan seluruh database ke kondisi awal demo: 12 data barang inventaris, 5 kategori, 7 satuan, 4 supplier, transaksi contoh, dan akun login default (admin, gudang, manajer).
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setResetType('default');
                        setShowResetModal(true);
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset ke Data Demo Awal</span>
                    </button>
                  </div>
                </div>

                {/* Reset to Blank */}
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      2. Reset Bersih (Hapus Seluruh Data)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Mengosongkan semua data transaksi, katalog barang, kategori, satuan, dan log. Hanya mempertahankan akun Administrator yang sedang aktif agar Anda tetap dapat login.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setResetType('clean');
                        setShowResetModal(true);
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Kosongkan Seluruh Database</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Reset Database */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
              Konfirmasi Reset Database MySQL
            </h3>

            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Anda akan melakukan reset:{' '}
              <strong className="text-red-600 dark:text-red-400">
                {resetType === 'default' ? 'Kembali ke Data Awal Demo' : 'Kosongkan Seluruh Tabel'}
              </strong>
              . Seluruh perubahan yang belum dicadangkan akan hilang permanen.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {resetError && (
                <div className="mb-3 p-2 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-[11px]">
                  {resetError}
                </div>
              )}
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                Ketik kata <span className="font-mono font-bold text-red-600">RESET</span> untuk melanjutkan:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => {
                  setResetConfirmText(e.target.value);
                  setResetError('');
                }}
                placeholder="Ketik RESET"
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetConfirmText.toLowerCase() !== 'reset'}
                onClick={handleConfirmReset}
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-lg transition-colors shadow-xs"
              >
                Ya, Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
