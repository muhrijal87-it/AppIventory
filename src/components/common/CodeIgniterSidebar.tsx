import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  History,
  Layers,
  FileSpreadsheet,
  Printer,
  Database,
  Terminal,
  Code2,
  Users,
  ShieldCheck,
  ChevronRight,
  Flame,
  AlertCircle
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
  const { stats, barang, transaksiKeluar } = useInventory();

  const handleNavClick = (view: string) => {
    onNavigate(view);
    onCloseMobile();
  };

  const navItemClass = (viewKey: string) => {
    const isActive = currentView === viewKey;
    return `w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all ${
      isActive
        ? 'bg-red-600 text-white font-semibold shadow-xs'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
    }`;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-15 left-0 z-40 h-full lg:h-[calc(100vh-3.75rem)] w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 fill-current" />
            <span className="font-bold text-white text-sm">CodeIgniter 4</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-3.5 m-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'CI'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">
              {user?.nama_lengkap?.split(' ')[0] || user?.username}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-slate-400 font-mono capitalize">
                {user?.role || 'Guest'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 text-slate-400 scrollbar-thin">
          {/* Group: MENU UTAMA */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={navItemClass('dashboard')}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('barang')}
                className={navItemClass('barang')}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Katalog Barang</span>
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {barang.length}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('transaksi_masuk')}
                className={navItemClass('transaksi_masuk')}
              >
                <div className="flex items-center gap-2.5">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                  <span>Barang Masuk (In)</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('transaksi_keluar')}
                className={navItemClass('transaksi_keluar')}
              >
                <div className="flex items-center gap-2.5">
                  <ArrowUpFromLine className="w-4 h-4 text-orange-400" />
                  <span>Barang Keluar (Out)</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('perpindahan_barang')}
                className={navItemClass('perpindahan_barang')}
              >
                <div className="flex items-center gap-2.5">
                  <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                  <span>Perpindahan Barang</span>
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {transaksiKeluar.length}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('mutasi_stok')}
                className={navItemClass('mutasi_stok')}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span>Histori Alur Real-Time</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
              </button>
            </nav>
          </div>

          {/* Group: MASTER DATA */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Master Data
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNavClick('master_kategori')}
                className={navItemClass('master_kategori')}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Sub Kategori</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Group: LAPORAN & CETAK */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Laporan &amp; Cetak
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNavClick('laporan_stok')}
                className={navItemClass('laporan_stok')}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Laporan Stok Fisik</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('laporan_transaksi')}
                className={navItemClass('laporan_transaksi')}
              >
                <div className="flex items-center gap-2.5">
                  <Printer className="w-4 h-4" />
                  <span>Laporan Transaksi</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Group: DATABASE MYSQL */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Database MySQL
            </div>
            <nav className="space-y-0.5">
              <button
                onClick={() => handleNavClick('database_backup')}
                className={navItemClass('database_backup')}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Backup &amp; Reset MySQL</span>
                </div>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SQL
                </span>
              </button>

              <button
                onClick={() => handleNavClick('database_query')}
                className={navItemClass('database_query')}
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>SQL Query Runner</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Group: KEAMANAN & PENGGUNA */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Keamanan &amp; Akun
            </div>
            <nav className="space-y-0.5">
              {can('manage_users') && (
                <button
                  onClick={() => handleNavClick('user_management')}
                  className={navItemClass('user_management')}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>Manajemen Pengguna</span>
                  </div>
                </button>
              )}

              <button
                onClick={() => handleNavClick('activity_logs')}
                className={navItemClass('activity_logs')}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Log Aktivitas (Audit)</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom System Info Widget */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/50">
          <div className="flex items-center justify-between font-mono">
            <span>MySQL 8.0 / InnoDB</span>
            <span className="text-emerald-400 font-semibold">Aktif</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            db_ci_inventaris (utf8mb4)
          </div>
        </div>
      </aside>
    </>
  );
};
