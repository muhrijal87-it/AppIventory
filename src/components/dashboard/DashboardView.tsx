import React from 'react';
import {
  Package,
  Boxes,
  Coins,
  AlertTriangle,
  Plus,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenMVCModal: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ onNavigate, onOpenMVCModal }) => {
  const { user, can } = useAuth();
  const { stats, barang, kategori, mutasiStok, transaksiMasuk, transaksiKeluar } = useInventory();

  // Category stock breakdown
  const categoryStats = kategori.map((k) => {
    const items = barang.filter((b) => b.kategori_id === k.id);
    const totalQty = items.reduce((acc, i) => acc + i.stok, 0);
    return {
      id: k.id,
      name: k.nama_kategori,
      itemCount: items.length,
      totalQty,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Summary Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-mono">
              CodeIgniter 4.5.3 + MySQL 8.0
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Sistem Manajemen Gudang &amp; Logistik</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            Selamat Datang, {user?.nama_lengkap || 'Pengguna'}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ringkasan data inventaris barang terintegrasi, mutasi stok, dan pencadangan database MySQL.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {can('manage_inventory') && (
            <>
              <button
                onClick={() => onNavigate('barang')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Barang</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {stats.barangKritis.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Peringatan Stok Kritis: {stats.barangKritis.length} Barang Mencapai / Di Bawah Batas Minimum
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                {stats.barangKritis.map((b) => `${b.nama_barang} (Sisa: ${b.stok}, Min: ${b.stok_min})`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('transaksi_masuk')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors shadow-xs"
          >
            Restock Sekarang
          </button>
        </div>
      )}

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Barang */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Jenis SKU</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {stats.totalJenisBarang}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Terdaftar di</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">tbl_barang</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Stok Fisik */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Kuantitas Fisik</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {stats.totalStokFisik.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Unit / Pcs / Box tersimpan di gudang
            </div>
          </div>
        </div>

        {/* Metric 3: Kondisi Barang Baik */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kondisi Siap Pakai (Baik)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {barang.filter((b) => b.kondisi === 'Baik').length} SKU
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Status fisik normal &amp; siap didistribusikan</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Mutasi Bulan Ini */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Aktivitas Transaksi</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div>
              <span className="text-[11px] text-emerald-600 block">Masuk</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                +{stats.totalMasukBulanIni}
              </span>
            </div>
            <div className="text-slate-300">/</div>
            <div>
              <span className="text-[11px] text-orange-600 block">Keluar</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                -{stats.totalKeluarBulanIni}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Distribution & Recent Stock Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Recent Stock Mutations */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Alur Pergerakan Barang Real-Time (Dari ➔ Ke)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('mutasi_stok')}
              className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline flex items-center gap-1"
            >
              <span>Buka Live Tracker</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-3 py-2">Waktu</th>
                  <th className="px-3 py-2">Nama Barang &amp; Ref</th>
                  <th className="px-3 py-2">Alur Fisik (Dari ➔ Ke)</th>
                  <th className="px-3 py-2 text-right">Jumlah</th>
                  <th className="px-3 py-2 text-right">Sisa Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mutasiStok.slice(0, 6).map((m) => {
                  const itm = barang.find((b) => b.id === m.barang_id);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-3 py-2.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {m.tanggal.split(' ')[0]}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        <div className="font-semibold">{itm?.nama_barang || `Barang #${m.barang_id}`}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.referensi}</div>
                      </td>
                      <td className="px-3 py-2.5 text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]" title={m.asal || 'Gudang'}>
                            {m.asal || 'Gudang'}
                          </span>
                          <span className="text-slate-400 font-bold">➔</span>
                          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]" title={m.tujuan || 'Gudang'}>
                            {m.tujuan || 'Gudang'}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-mono font-bold ${
                          m.jenis === 'Masuk'
                            ? 'text-emerald-600'
                            : m.jenis === 'Keluar'
                            ? 'text-orange-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {m.jenis === 'Masuk' ? `+${m.jumlah}` : m.jenis === 'Keluar' ? `-${m.jumlah}` : `↔ ${m.jumlah}`}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300 font-bold">
                        {m.stok_sesudah}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 Col): Categories Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sebaran Kategori Barang
              </h3>
              <span className="text-xs text-slate-400 font-mono">{kategori.length} Kategori</span>
            </div>

            <div className="space-y-3.5">
              {categoryStats.map((cat) => {
                const percentage = stats.totalStokFisik > 0 ? Math.round((cat.totalQty / stats.totalStokFisik) * 100) : 0;
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                        {cat.name}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {cat.totalQty} unit ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('master_kategori')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-center"
            >
              Kelola Sub Kategori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
