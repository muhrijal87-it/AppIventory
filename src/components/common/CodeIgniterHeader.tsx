import React, { useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  Shield,
  KeyRound,
  FileCode2,
  Database,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Bell,
  Search,
  ArrowRight,
  History,
  Package,
  FileText
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
    flash, 
    clearFlash, 
    stats, 
    barang, 
    transaksiMasuk, 
    transaksiKeluar, 
    mutasiStok 
  } = useInventory();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Close search on ESC or click away
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSearchResults(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      case 'master_kategori':
      case 'master_supplier':
      case 'master_departemen':
        return ['Master Data', 'Sub Kategori'];
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
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/assets/inventory_logo_v2.jpg" alt="Inventory Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-bold text-slate-800 dark:text-white hidden sm:inline">InvSystem</span>
          </div>

          <div className="hidden md:flex items-center text-xs text-slate-400 dark:text-slate-500 pl-3 border-l border-slate-200 dark:border-slate-800">
            <span>{breadcrumbs[0]}</span>
            <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{breadcrumbs[1]}</span>
          </div>
        </div>

        {/* Center: Global Predictive Search */}
        <div ref={searchRef} className="flex-1 max-w-md relative hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 1);
              }}
              onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
              placeholder="Cari SKU, No Transaksi, atau Nama Barang..."
              className="w-full bg-slate-100 dark:bg-slate-800 border-transparent border focus:border-red-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-red-500/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 transition-all outline-hidden"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
                {/* 1. Items Section */}
                {(() => {
                  const query = searchQuery.toLowerCase();
                  const matchedItems = barang.filter(b => 
                    b.nama_barang.toLowerCase().includes(query) || 
                    b.kode_barang.toLowerCase().includes(query) ||
                    (b.serial_number && b.serial_number.toLowerCase().includes(query))
                  ).slice(0, 5);

                  if (matchedItems.length === 0) return null;

                  return (
                    <div className="p-2">
                      <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Package className="w-3 h-3" /> Inventaris (SKU)
                      </div>
                      {matchedItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onNavigate('barang');
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 shrink-0">
                            {item.foto ? <img src={item.foto} className="w-10 h-10 object-cover rounded-lg" /> : <Package className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.nama_barang}</div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                              <span>{item.kode_barang}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className={item.stok > item.stok_min ? 'text-emerald-500' : 'text-red-500'}>Stok: {item.stok}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* 2. Transactions Section */}
                {(() => {
                  const query = searchQuery.toLowerCase();
                  const matchedOut = transaksiKeluar.filter(t => 
                    t.no_transaksi.toLowerCase().includes(query) ||
                    t.penerima.toLowerCase().includes(query)
                  ).slice(0, 3);
                  
                  const matchedIn = transaksiMasuk.filter(t => 
                    t.no_faktur.toLowerCase().includes(query)
                  ).slice(0, 3);

                  if (matchedOut.length === 0 && matchedIn.length === 0) return null;

                  return (
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Transaksi
                      </div>
                      {matchedOut.map(t => (
                        <button
                          key={`out-${t.id}`}
                          onClick={() => {
                            onNavigate(t.no_transaksi.startsWith('TRF-') ? 'perpindahan_barang' : 'transaksi_keluar');
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 shrink-0 font-bold text-[10px] font-mono">
                            {t.no_transaksi.startsWith('TRF-') ? 'TRF' : 'OUT'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{t.no_transaksi}</div>
                            <div className="text-[10px] text-slate-500">Penerima: {t.penerima} ({t.tanggal})</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                      {matchedIn.map(t => (
                        <button
                          key={`in-${t.id}`}
                          onClick={() => {
                            onNavigate('transaksi_masuk');
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-[10px] font-mono">
                            IN
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{t.no_faktur}</div>
                            <div className="text-[10px] text-slate-500">Barang Masuk ({t.tanggal})</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* 3. History/Logs Section */}
                {(() => {
                  const query = searchQuery.toLowerCase();
                  const matchedLogs = mutasiStok.filter(m => 
                    m.keterangan.toLowerCase().includes(query) ||
                    m.referensi.toLowerCase().includes(query)
                  ).slice(0, 3);

                  if (matchedLogs.length === 0) return null;

                  return (
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-3 h-3" /> Histori & Alur
                      </div>
                      {matchedLogs.map(m => (
                        <button
                          key={`log-${m.id}`}
                          onClick={() => {
                            onNavigate('mutasi_stok');
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 shrink-0">
                            <History className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{m.keterangan}</div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase">{m.jenis} - Ref: {m.referensi}</div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* No Results */}
                {(() => {
                  const query = searchQuery.toLowerCase();
                  const hasItems = barang.some(b => b.nama_barang.toLowerCase().includes(query) || b.kode_barang.toLowerCase().includes(query));
                  const hasOut = transaksiKeluar.some(t => t.no_transaksi.toLowerCase().includes(query));
                  const hasIn = transaksiMasuk.some(t => t.no_faktur.toLowerCase().includes(query));
                  const hasLogs = mutasiStok.some(m => m.keterangan.toLowerCase().includes(query));
                  
                  if (!hasItems && !hasOut && !hasIn && !hasLogs) {
                    return (
                      <div className="p-10 text-center">
                        <Search className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                        <div className="text-sm font-bold text-slate-400 italic">Tidak ditemukan hasil untuk "{searchQuery}"</div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 text-center border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gunakan ESC untuk menutup hasil pencarian</span>
              </div>
            </div>
          )}
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
