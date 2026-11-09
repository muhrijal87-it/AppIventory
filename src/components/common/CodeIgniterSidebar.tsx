import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  History,
  Layers,
  Printer,
  Database,
  Terminal,
  Users,
  ShieldCheck,
  Flame,
  Settings,
  X,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const CodeIgniterSidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, can } = useAuth();
  const { barang, transaksiKeluar, appSettings, mutasiStok } = useInventory();

  const handleNavClick = (view: string) => {
    onNavigate(view);
    onCloseMobile();
  };

  const isNavActive = (viewKey: string) => {
    if (currentView === viewKey) return true;
    if (viewKey === 'master_data' && currentView.startsWith('master_')) return true;
    if (viewKey === 'laporan_system' && currentView.startsWith('laporan_')) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-15 left-0 z-40 h-full lg:h-[calc(100vh-3.75rem)] w-68 bg-slate-900 text-slate-300 border-r border-slate-800/80 flex flex-col shrink-0 transition-transform duration-200 ease-in-out print:hidden shadow-2xl lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Desktop Brand Header */}
        <div className="hidden lg:flex items-center justify-between px-5 h-15 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 p-0.5 border border-slate-700/60 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={appSettings.logo_url}
                alt="Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-white text-sm tracking-tight truncate leading-tight">
                {appSettings.nama_pendek || 'InvSystem'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>CodeIgniter 4.5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950 lg:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={appSettings.logo_url}
              alt="Logo"
              className="w-7 h-7 rounded-lg object-cover border border-slate-700"
            />
            <div className="min-w-0">
              <div className="font-bold text-white text-xs truncate">
                {appSettings.nama_aplikasi || 'CI-Inventaris'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Mobile Navigation</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Mini Card */}
        <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-800/40 border border-slate-700/50 shadow-inner flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0 border border-red-500/30">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'CI'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate leading-snug">
              {user?.nama_lengkap?.split(' ')[0] || user?.username}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50"></span>
              <span className="text-[10px] text-slate-300 font-mono capitalize">
                {user?.role === 'admin' ? 'Super Admin' : user?.role === 'staff' ? 'Staff Gudang' : 'Manajer'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section Container */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin">
          {/* GROUP 1: MENU UTAMA */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span>Menu Utama</span>
              <div className="flex-1 h-px bg-slate-800/80" />
            </div>
            <nav className="space-y-1">
              {/* Dashboard */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isNavActive('dashboard')
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('dashboard') ? 'bg-white/20 text-white' : 'bg-red-950/60 text-red-400 border border-red-900/50'}`}>
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  </div>
                  <span>Dashboard</span>
                </div>
              </button>

              {/* Katalog Barang */}
              <button
                onClick={() => handleNavClick('barang')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isNavActive('barang')
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('barang') ? 'bg-white/20 text-white' : 'bg-blue-950/60 text-blue-400 border border-blue-900/50'}`}>
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <span>Katalog Barang</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isNavActive('barang') ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700/60'}`}>
                  {barang.length} SKU
                </span>
              </button>

              {/* Barang Masuk */}
              <button
                onClick={() => handleNavClick('transaksi_masuk')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isNavActive('transaksi_masuk')
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('transaksi_masuk') ? 'bg-white/20 text-white' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'}`}>
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                  </div>
                  <span>Barang Masuk (In)</span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${isNavActive('transaksi_masuk') ? 'bg-white/20 text-white' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'}`}>
                  INBOUND
                </span>
              </button>

              {/* Barang Keluar */}
              <button
                onClick={() => handleNavClick('transaksi_keluar')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isNavActive('transaksi_keluar')
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('transaksi_keluar') ? 'bg-white/20 text-white' : 'bg-orange-950/60 text-orange-400 border border-orange-900/50'}`}>
                    <ArrowUpFromLine className="w-3.5 h-3.5" />
                  </div>
                  <span>Barang Keluar (Out)</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isNavActive('transaksi_keluar') ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700/60'}`}>
                  {transaksiKeluar.filter((t) => !t.no_transaksi.startsWith('TRF-')).length}
                </span>
              </button>

              {/* Perpindahan Barang */}
              <button
                onClick={() => handleNavClick('perpindahan_barang')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isNavActive('perpindahan_barang')
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('perpindahan_barang') ? 'bg-white/20 text-white' : 'bg-purple-950/60 text-purple-400 border border-purple-900/50'}`}>
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </div>
                  <span>Perpindahan Barang</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isNavActive('perpindahan_barang') ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700/60'}`}>
                  {transaksiKeluar.filter((t) => t.no_transaksi.startsWith('TRF-')).length}
                </span>
              </button>

              {/* Barang Ditarik (Recall) */}
              <button
                onClick={() => handleNavClick('barang_ditarik')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isNavActive('barang_ditarik')
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('barang_ditarik') ? 'bg-white/20 text-white' : 'bg-orange-950/60 text-orange-400 border border-orange-900/50'}`}>
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span>Barang Ditarik (Recall)</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isNavActive('barang_ditarik') ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700/60'}`}>
                  {mutasiStok.filter((m) => m.referensi.startsWith('RECALL-')).length}
                </span>
              </button>

              {/* Histori Alur Real-Time */}
              <button
                onClick={() => handleNavClick('mutasi_stok')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isNavActive('mutasi_stok')
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('mutasi_stok') ? 'bg-white/20 text-white' : 'bg-cyan-950/60 text-cyan-400 border border-cyan-900/50'}`}>
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <span>Histori Alur Real-Time</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-xs shadow-emerald-400" />
              </button>
            </nav>
          </div>

          {/* GROUP 2: MASTER DATA */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span>Master Data</span>
              <div className="flex-1 h-px bg-slate-800/80" />
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('master_data')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isNavActive('master_data')
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('master_data') ? 'bg-white/20 text-white' : 'bg-violet-950/60 text-violet-400 border border-violet-900/50'}`}>
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span>Master Data System</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isNavActive('master_data') ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700/60'}`}>
                  4 Tabel
                </span>
              </button>
            </nav>
          </div>

          {/* GROUP 3: LAPORAN & CETAK */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span>Laporan &amp; Cetak</span>
              <div className="flex-1 h-px bg-slate-800/80" />
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('laporan_system')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isNavActive('laporan_system')
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('laporan_system') ? 'bg-white/20 text-white' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'}`}>
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <span>Laporan &amp; Cetak Dokumen</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isNavActive('laporan_system') ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700/60'}`}>
                  3 Laporan
                </span>
              </button>
            </nav>
          </div>

          {/* GROUP 4: DATABASE MYSQL */}
          {(can('backup_db') || can('reset_db') || can('query_db')) && (
            <div>
              <div className="px-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span>Database MySQL</span>
                <div className="flex-1 h-px bg-slate-800/80" />
              </div>
              <nav className="space-y-1">
                {(can('backup_db') || can('reset_db')) && (
                  <button
                    onClick={() => handleNavClick('database_backup')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      isNavActive('database_backup')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('database_backup') ? 'bg-white/20 text-white' : 'bg-cyan-950/60 text-cyan-400 border border-cyan-900/50'}`}>
                        <Database className="w-3.5 h-3.5" />
                      </div>
                      <span>{can('reset_db') ? 'Backup & Reset MySQL' : 'Backup Database (SQL)'}</span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${isNavActive('database_backup') ? 'bg-white/20 text-white' : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'}`}>
                      SQL
                    </span>
                  </button>
                )}

                {can('query_db') && (
                  <button
                    onClick={() => handleNavClick('database_query')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      isNavActive('database_query')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('database_query') ? 'bg-white/20 text-white' : 'bg-amber-950/60 text-amber-400 border border-amber-900/50'}`}>
                        <Terminal className="w-3.5 h-3.5" />
                      </div>
                      <span>SQL Query Runner</span>
                    </div>
                  </button>
                )}
              </nav>
            </div>
          )}

          {/* GROUP 5: SISTEM & PENGATURAN */}
          {(can('manage_users') || can('view_audit_logs') || user?.role === 'admin') && (
            <div>
              <div className="px-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span>Sistem &amp; Pengaturan</span>
                <div className="flex-1 h-px bg-slate-800/80" />
              </div>
              <nav className="space-y-1">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('app_settings')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      isNavActive('app_settings')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('app_settings') ? 'bg-white/20 text-white' : 'bg-rose-950/60 text-rose-400 border border-rose-900/50'}`}>
                        <Settings className="w-3.5 h-3.5" />
                      </div>
                      <span>Pengaturan Aplikasi</span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${isNavActive('app_settings') ? 'bg-white/20 text-white' : 'bg-rose-950 text-rose-300 border border-rose-800/60'}`}>
                      Brand
                    </span>
                  </button>
                )}

                {can('manage_users') && (
                  <button
                    onClick={() => handleNavClick('user_management')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      isNavActive('user_management')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('user_management') ? 'bg-white/20 text-white' : 'bg-indigo-950/60 text-indigo-400 border border-indigo-900/50'}`}>
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span>Manajemen Pengguna</span>
                    </div>
                  </button>
                )}

                {can('view_audit_logs') && (
                  <button
                    onClick={() => handleNavClick('activity_logs')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      isNavActive('activity_logs')
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isNavActive('activity_logs') ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700/50'}`}>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span>Log Aktivitas (Audit)</span>
                    </div>
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Bottom System Info Widget */}
        <div className="p-3.5 border-t border-slate-800/80 text-[11px] text-slate-400 bg-slate-950/60">
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Database className="w-3 h-3 text-cyan-400" />
              <span>MySQL 8.0</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
            <span>db_ci_inventaris</span>
            <span className="text-slate-400">utf8mb4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
