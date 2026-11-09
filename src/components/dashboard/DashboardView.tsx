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
  Flame,
  ShieldCheck,
  Wrench,
  ShieldAlert,
  Archive,
  Zap,
  Info,
  BarChart3,
  Activity,
  History,
  LayoutDashboard
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { PillNotification } from '../common/PillNotification';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenMVCModal: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ onNavigate, onOpenMVCModal }) => {
  const { user, can } = useAuth();
  const { stats, barang, kategori, satuan, mutasiStok, transaksiMasuk, transaksiKeluar } = useInventory();
  const [dashboardTab, setDashboardTab] = React.useState<'barang' | 'mutasi'>('barang');

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

  // Condition and Status breakdowns
  const conditionStats = {
    baik: barang.filter((b) => b.kondisi === 'Baik').length,
    perbaikan: barang.filter((b) => b.kondisi === 'Perbaikan').length,
    rusak: barang.filter((b) => b.kondisi === 'Rusak').length,
  };

  const statusStats = {
    normal: barang.filter((b) => b.stok > b.stok_min).length,
    kritis: barang.filter((b) => b.stok > 0 && b.stok <= b.stok_min).length,
    habis: barang.filter((b) => b.stok === 0).length,
  };

  // Recall Specific Stats
  const recallMutations = mutasiStok.filter((m) => m.referensi.startsWith('RECALL-'));
  const totalRecallUnits = recallMutations.reduce((acc, m) => acc + m.jumlah, 0);
  const uniqueRecalledBarangIds = Array.from(new Set(recallMutations.map((m) => m.barang_id)));
  const recalledBarang = barang.filter((b) => uniqueRecalledBarangIds.includes(b.id));

  const recallConditionStats = {
    baik: recalledBarang.filter((b) => b.kondisi === 'Baik').length,
    perbaikan: recalledBarang.filter((b) => b.kondisi === 'Perbaikan').length,
    rusak: recalledBarang.filter((b) => b.kondisi === 'Rusak').length,
  };

  const recallStatusStats = {
    normal: recalledBarang.filter((b) => b.stok > b.stok_min).length,
    kritis: recalledBarang.filter((b) => b.stok > 0 && b.stok <= b.stok_min).length,
    habis: recalledBarang.filter((b) => b.stok === 0).length,
  };

  const distributionData = [
    { name: 'Gudang', total: stats.totalStokFisik, fill: '#ef4444' }, 
    { 
      name: 'Keluar', 
      total: transaksiKeluar.filter(t => !t.no_transaksi.startsWith('TRF-')).reduce((acc, t) => acc + t.jumlah, 0), 
      fill: '#f97316' 
    },
    { 
      name: 'Pindah', 
      total: transaksiKeluar.filter(t => t.no_transaksi.startsWith('TRF-')).reduce((acc, t) => acc + t.jumlah, 0), 
      fill: '#8b5cf6' 
    },
    { name: 'Recall', total: totalRecallUnits, fill: '#3b82f6' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-10">
      {/* 1. Header & Welcome Area */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-linear-to-r from-slate-900 via-slate-900 to-red-950 p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3.5 sm:gap-5 relative z-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/40 shrink-0 border border-red-400/30">
            <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-red-500/30">
                Enterprise Inventory OS
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-mono">v3.5 Live</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white truncate">
              Dashboard Overview
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-1 line-clamp-2">
              Selamat datang kembali, <span className="font-bold text-red-400">{user?.nama_lengkap || 'Admin'}</span>. Sistem operasional gudang berjalan optimal hari ini.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 relative z-10 w-full lg:w-auto">
          {can('manage_transactions') && (
            <button
              type="button"
              onClick={() => onNavigate('transaksi_masuk')}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all backdrop-blur-md cursor-pointer shadow-xs active:scale-98"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Penerimaan Masuk</span>
            </button>
          )}
          {can('manage_transactions') && (
            <button
              type="button"
              onClick={() => onNavigate('transaksi_keluar')}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all backdrop-blur-md cursor-pointer shadow-xs active:scale-98"
            >
              <FileText className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Pengeluaran DO</span>
            </button>
          )}
          {can('manage_inventory') && (
            <button
              type="button"
              onClick={() => onNavigate('barang')}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/40 transition-all hover:scale-102 active:scale-95 cursor-pointer border border-red-500/50"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Daftarkan Barang</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Primary KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {[
          { label: 'Total Jenis SKU', value: stats.totalJenisBarang, icon: Package, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', sub: 'Unit Terdaftar' },
          { label: 'Kuantitas Fisik', value: stats.totalStokFisik.toLocaleString('id-ID'), icon: Boxes, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', sub: 'Tersimpan di Gudang' },
          { label: 'Kondisi Baik', value: `${barang.filter(b => b.kondisi === 'Baik').length} SKU`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', sub: 'Siap Distribusi' },
          { label: 'Aktivitas (Keluar)', value: `-${stats.totalKeluarBulanIni}`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20', sub: 'Transaksi Bulan Ini' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs transition-all hover:shadow-xl hover:-translate-y-0.5 group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${kpi.bg} ${kpi.color} border flex items-center justify-center transition-transform group-hover:scale-110 shrink-0`}>
                <kpi.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-none tracking-tight">
                {kpi.value}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span>{kpi.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Alerts Section with Pill Notification Design */}
      {stats.barangKritis.length > 0 && (
        <div className="w-full">
          <PillNotification
            type="warning"
            title={`Peringatan: ${stats.barangKritis.length} SKU Mencapai Batas Stok Minimum!`}
            message={`Item kritis: ${stats.barangKritis.slice(0, 3).map(b => `${b.nama_barang} (sisa ${b.stok})`).join(', ')}${stats.barangKritis.length > 3 ? ` dan ${stats.barangKritis.length - 3} lainnya` : ''}. Segera lakukan restok ketersediaan.`}
            action={{
              label: 'Restok Sekarang',
              onClick: () => onNavigate('transaksi_masuk'),
            }}
            className="w-full shadow-md"
          />
        </div>
      )}

      {/* 4. Analytics Row: Distribution Chart & Category Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Distribution Bar Chart (8/12) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Alur Distribusi &amp; Ketersediaan</span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Analisis visual penyebaran kuantitas unit aset inventaris</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 font-medium">
              <span>Sinkronisasi Otomatis</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[10px] sm:text-[11px]">InnoDB</span>
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distributionData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '10px 14px'
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 sm:mt-6">
            {distributionData.map((item, idx) => (
              <div key={idx} className="bg-slate-50/70 dark:bg-slate-800/40 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800/60 text-center">
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono tabular-nums leading-none">{item.total.toLocaleString('id-ID')}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown (4/12) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-red-600 shrink-0" />
              Top Kategori
            </h3>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{kategori.length} Total</span>
          </div>

          <div className="space-y-4 sm:space-y-5 flex-1">
            {categoryStats.slice(0, 5).map((cat) => {
              const percentage = stats.totalStokFisik > 0 ? Math.round((cat.totalQty / stats.totalStokFisik) * 100) : 0;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px] sm:max-w-[140px]">
                      {cat.name}
                    </span>
                    <span className="font-mono text-slate-500 font-bold text-[10px]">
                      {cat.totalQty} <span className="opacity-50">/ {percentage}%</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('master_kategori')}
            className="mt-5 sm:mt-6 w-full py-2.5 sm:py-3 px-4 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl sm:rounded-2xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Selengkapnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 5. Health Section: Physical Condition & Stock Status */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Physical Condition Hub */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              Kesehatan Fisik Aset
            </h3>
            <span className="text-[9px] sm:text-[10px] bg-slate-100 dark:bg-slate-800 px-2 sm:px-2.5 py-1 rounded-full text-slate-500 font-bold">SKU TOTAL: {barang.length}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { label: 'Kondisi Baik', value: conditionStats.baik, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
              { label: 'Perbaikan', value: conditionStats.perbaikan, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50/50 dark:bg-amber-950/20' },
              { label: 'Rusak Berat', value: conditionStats.rusak, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50/50 dark:bg-red-950/20' },
            ].map((st, i) => (
              <div key={i} className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl ${st.bg} border border-slate-100/50 dark:border-slate-800/50 text-center transition-transform hover:scale-102`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center mx-auto mb-2 sm:mb-3 ${st.color}`}>
                  <st.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-lg sm:text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">{st.value}</div>
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1.5 truncate">{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Availability Hub */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 shrink-0" />
              Status Ketersediaan
            </h3>
            <div className="flex items-center gap-1 group cursor-help">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold">LIMIT MINIMUM</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              { label: 'Stok Aman (Normal)', desc: 'Tersedia melimpah', value: statusStats.normal, color: 'bg-emerald-500', iconColor: 'text-emerald-500' },
              { label: 'Stok Kritis (Low)', desc: 'Dibawah batas aman', value: statusStats.kritis, color: 'bg-amber-500', iconColor: 'text-amber-500' },
              { label: 'Stok Habis (Empty)', desc: 'Wajib restock segera', value: statusStats.habis, color: 'bg-red-600', iconColor: 'text-red-600' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-3 sm:gap-6">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-1 h-7 sm:h-8 rounded-full ${row.color} shrink-0`}></div>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{row.label}</div>
                    <div className="text-[9px] text-slate-400 font-medium truncate hidden sm:block">{row.desc}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xs sm:text-sm font-black font-mono leading-none ${row.iconColor}`}>{row.value} SKU</div>
                  <div className="w-16 sm:w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 sm:mt-2 overflow-hidden border border-slate-200/20 dark:border-slate-700/20">
                    <div 
                      className={`h-full ${row.color} transition-all duration-1000`} 
                      style={{ width: `${barang.length > 0 ? (row.value / barang.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Activity & Recall Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Ledger & Recent Items (8/12) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl sm:rounded-2xl">
              <button
                onClick={() => setDashboardTab('barang')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dashboardTab === 'barang'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>Katalog ({barang.length})</span>
              </button>
              <button
                onClick={() => setDashboardTab('mutasi')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dashboardTab === 'mutasi'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <History className="w-3.5 h-3.5 shrink-0" />
                <span>Log Aktivitas</span>
              </button>
            </div>

            <button
              onClick={() => onNavigate(dashboardTab === 'barang' ? 'barang' : 'mutasi_stok')}
              className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest hover:underline flex items-center gap-1 self-end sm:self-auto cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            {dashboardTab === 'barang' ? (
              <table className="w-full text-left text-xs border-separate border-spacing-y-2 min-w-[480px]">
                <thead className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                  <tr>
                    <th className="px-4 py-2">Barang</th>
                    <th className="px-4 py-2">Kategori</th>
                    <th className="px-4 py-2 text-right">Stok</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {barang.slice(0, 5).map((b) => {
                    const kat = kategori.find((k) => k.id === b.kategori_id);
                    const isKritis = b.stok > 0 && b.stok <= b.stok_min;
                    const isHabis = b.stok === 0;

                    return (
                      <tr key={b.id} className="group transition-all">
                        <td className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 first:rounded-l-2xl last:rounded-r-2xl border-y border-transparent group-hover:border-red-100 dark:group-hover:border-red-900/30 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                          <div className="font-bold text-slate-900 dark:text-white">{b.nama_barang}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{b.kode_barang}</div>
                        </td>
                        <td className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                          <span className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400">{kat?.nama_kategori || '-'}</span>
                        </td>
                        <td className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 text-right font-black font-mono text-slate-900 dark:text-white group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                          {b.stok}
                        </td>
                        <td className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 text-center first:rounded-l-2xl last:rounded-r-2xl group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                            isHabis ? 'bg-red-100 dark:bg-red-900/40 text-red-600' :
                            isKritis ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' :
                            'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                          }`}>
                            {isHabis ? 'Habis' : isKritis ? 'Kritis' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs border-separate border-spacing-y-2 min-w-[480px]">
                <thead className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                  <tr>
                    <th className="px-4 py-2">Waktu</th>
                    <th className="px-4 py-2">Alur Fisik</th>
                    <th className="px-4 py-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {mutasiStok.slice(0, 5).map((m) => {
                    const itm = barang.find((b) => b.id === m.barang_id);
                    return (
                      <tr key={m.id} className="group transition-all">
                        <td className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 first:rounded-l-2xl last:rounded-r-2xl border-y border-transparent group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                          <div className="font-mono text-slate-500 font-bold">{m.tanggal.split(' ')[0]}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{m.referensi}</div>
                        </td>
                        <td className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                          <div className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{itm?.nama_barang || 'Aset'}</div>
                          <div className="text-[10px] flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-400 truncate max-w-[80px]">{m.asal || 'Gudang'}</span>
                            <span className="text-slate-300 font-black">➔</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[80px]">{m.tujuan || 'Unit'}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 bg-slate-50 dark:bg-slate-800/40 first:rounded-l-2xl last:rounded-r-2xl text-right font-black font-mono group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors ${
                          m.jenis === 'Masuk' ? 'text-emerald-600' : m.jenis === 'Keluar' ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                          {m.jenis === 'Masuk' ? `+${m.jumlah}` : m.jenis === 'Keluar' ? `-${m.jumlah}` : `↔ ${m.jumlah}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recall Highlights (4/12) */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6 flex flex-col">
          {/* Recall KPI Mini-Card */}
          <div className="bg-linear-to-br from-orange-500 to-red-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-orange-600/20">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
                <Archive className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Reverse Logistics</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono leading-none">{totalRecallUnits}</div>
            <div className="text-xs font-bold text-white/90 mt-2">Unit Berhasil Ditarik</div>
            <p className="text-[10px] text-white/60 mt-3 sm:mt-4 leading-relaxed font-medium">
              Data unit yang dikembalikan ke gudang karena alasan teknis atau mutasi jabatan.
            </p>
          </div>

          {/* Condition Post-Recall List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Kondisi Hasil Recall
            </h3>
            <div className="space-y-2.5 sm:space-y-3">
              {[
                { label: 'Baik', val: recallConditionStats.baik, color: 'text-emerald-500' },
                { label: 'Servis', val: recallConditionStats.perbaikan, color: 'text-amber-500' },
                { label: 'Rusak', val: recallConditionStats.rusak, color: 'text-red-500' },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{c.label}</span>
                  <span className={`text-xs sm:text-sm font-black font-mono ${c.color}`}>{c.val} unit</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Penarikan Terakhir:</div>
              {recallMutations.length > 0 ? (
                <div className="p-2.5 sm:p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
                  <div className="font-bold text-[10px] text-orange-900 dark:text-orange-200 truncate">
                    {barang.find(b => b.id === recallMutations[0].barang_id)?.nama_barang}
                  </div>
                  <div className="text-[9px] text-orange-600/70 mt-1 italic line-clamp-1">
                    "{recallMutations[0].keterangan.split('Alasan: ')[1]}"
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-300 italic">Belum ada data recall</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
