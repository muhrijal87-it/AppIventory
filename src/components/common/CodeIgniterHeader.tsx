import React, { useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  Shield,
  KeyRound,
  FileCode2,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { NotificationBell } from '../notifications/NotificationBell';


interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMVCModal: () => void;
  onOpenProfileModal: () => void;
}

export const CodeIgniterHeader: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenMVCModal,
  onOpenProfileModal,
}) => {
  const { user, logout, login } = useAuth();
  const { 
    stats, 
    appSettings
  } = useInventory();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Format Indonesian breadcrumbs
  const getBreadcrumbs = () => {
    switch (currentView) {
      case 'dashboard':
        return ['Beranda', 'Dashboard Utama'];
      case 'barang':
        return ['Inventaris', 'Katalog Data Barang'];
      case 'transaksi_masuk':
        return ['Transaksi', 'Barang Masuk (Inbound / Restock)'];
      case 'transaksi_keluar':
        return ['Transaksi', 'Barang Keluar (Outbound / Distribusi)'];
      case 'perpindahan_barang':
        return ['Menu Utama', 'Perpindahan Barang (Alur Distribusi)'];
      case 'mutasi_stok':
        return ['Pelacakan Alur', 'Histori Barang Real-Time (Dari ➔ Ke)'];
      case 'master_data':
        return ['Master Data', 'Kategori, Departemen, Satuan & Supplier'];
      case 'master_kategori':
        return ['Master Data', 'Sub Kategori Barang'];
      case 'master_departemen':
        return ['Master Data', 'Data Departemen & Divisi'];
      case 'master_supplier':
        return ['Master Data', 'Data Rekanan Pemasok (Supplier)'];
      case 'master_satuan':
        return ['Master Data', 'Satuan Unit'];
      case 'laporan_system':
        return ['Laporan & Cetak', 'Pusat Dokumen Laporan Stok, Transaksi & Mutasi'];
      case 'laporan_stok':
        return ['Laporan', 'Laporan Posisi Stok Fisik'];
      case 'laporan_transaksi':
        return ['Laporan', 'Laporan Mutasi & Transaksi'];
      case 'laporan_perpindahan':
        return ['Laporan & Cetak', 'Laporan Perpindahan Barang'];
      case 'database_backup':
        return ['Database MySQL', 'Backup, Restore & Reset'];
      case 'database_query':
        return ['Database MySQL', 'SQL Query Runner & Console'];
      case 'user_management':
        return ['Keamanan', 'Manajemen Pengguna & Hak Akses'];
      case 'activity_logs':
        return ['Audit Trail', 'Log Aktivitas Sistem'];
      case 'app_settings':
        return ['Sistem', 'Pengaturan Logo & Nama Aplikasi'];
      default:
        return ['Sistem', 'Inventaris'];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  const handleQuickSwitchRole = async (targetUsername: string) => {
    setShowRoleSwitcher(false);
    await login(targetUsername);
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
      {/* Top Main Navbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-15 gap-4">
        {/* Left: Brand & Breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-2.5 shrink-0 text-left hover:opacity-90 transition-opacity"
            title="Kembali ke Dashboard Utama"
          >
            <img src={appSettings.logo_url} alt="Inventory Logo" className="w-8 h-8 rounded-lg shadow-sm object-cover" />
            <span className="font-bold text-slate-800 dark:text-white hidden sm:inline">{appSettings.nama_pendek || 'InvSystem'}</span>
          </button>

          <div className="hidden md:flex items-center text-xs text-slate-400 dark:text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-800">
            <span>{breadcrumbs[0]}</span>
            <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{breadcrumbs[1]}</span>
          </div>
        </div>

        {/* Right: Actions, Role Quick-Switch & User Menu */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Low Stock Quick Alert */}
          {stats.barangKritis.length > 0 && (
            <button
              onClick={() => onNavigate('barang')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md hover:bg-amber-100 transition-colors"
              title={`${stats.barangKritis.length} barang menipis di bawah stok minimum`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">{stats.barangKritis.length} Stok Kritis</span>
            </button>
          )}

          {/* CodeIgniter Architecture Inspector Button */}
          <button
            onClick={onOpenMVCModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Lihat Struktur MVC (Controller, Model, View, Routes) CodeIgniter 4"
          >
            <FileCode2 className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline">Struktur MVC CI4</span>
          </button>

          {/* Quick Role Tester Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
              title="Ganti peran pengguna untuk menguji hak akses"
            >
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Peran:</span>
              <span className="font-mono uppercase text-[11px] text-blue-600 dark:text-blue-400">
                {user?.role || 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Uji Autentikasi &amp; Hak Akses
                </div>
                <button
                  onClick={() => handleQuickSwitchRole('admin')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${user?.role === 'admin' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <div>
                    <div className="font-medium">Administrator (admin)</div>
                    <div className="text-[11px] text-slate-500">Akses Penuh + Reset/Backup DB</div>
                  </div>
                  {user?.role === 'admin' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </button>
                <button
                  onClick={() => handleQuickSwitchRole('gudang')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${user?.role === 'staff' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <div>
                    <div className="font-medium">Staff Gudang (gudang)</div>
                    <div className="text-[11px] text-slate-500">Barang Masuk, Keluar &amp; Stok</div>
                  </div>
                  {user?.role === 'staff' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </button>
                <button
                  onClick={() => handleQuickSwitchRole('manajer')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${user?.role === 'manager' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <div>
                    <div className="font-medium">Manajer Operasional (manajer)</div>
                    <div className="text-[11px] text-slate-500">Lihat Laporan, Valuasi &amp; Audit</div>
                  </div>
                  {user?.role === 'manager' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </button>
              </div>
            )}
          </div>

          {/* Modern Notification Bell */}
          <NotificationBell onNavigate={onNavigate} />

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {user?.username ? user.username.substring(0, 2) : 'US'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user?.nama_lengkap?.split(' ')[0] || user?.username}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none capitalize">
                  {user?.role === 'admin' ? 'Super Admin' : user?.role === 'staff' ? 'Petugas Gudang' : 'Pimpinan'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">{user?.nama_lengkap}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</div>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenProfileModal();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>Profil &amp; Ubah Kata Sandi</span>
                </button>

                {user?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('app_settings');
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Settings className="w-4 h-4 text-red-500" />
                      <span>Pengaturan Logo &amp; Nama Aplikasi</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('user_management');
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      <span>Manajemen Hak Akses User</span>
                    </button>
                  </>
                )}

                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Sistem (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};
