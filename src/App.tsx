import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationToastContainer } from './components/notifications/NotificationToastContainer';
import { NotificationCenterModal } from './components/notifications/NotificationCenterModal';
import { LoginView } from './components/auth/LoginView';
import { CodeIgniterHeader } from './components/common/CodeIgniterHeader';
import { CodeIgniterSidebar } from './components/common/CodeIgniterSidebar';
import { CodeIgniterProfiler } from './components/common/CodeIgniterProfiler';
import { CodeIgniterMVCModal } from './components/common/CodeIgniterMVCModal';
import { UserProfileModal } from './components/users/UserProfileModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { BarangListView } from './components/barang/BarangListView';
import { BarangDitarikView } from './components/barang/BarangDitarikView';
import { TransaksiMasukView } from './components/transaksi/TransaksiMasukView';
import { TransaksiKeluarView } from './components/transaksi/TransaksiKeluarView';
import { PerpindahanBarangView } from './components/transaksi/PerpindahanBarangView';
import { MutasiStokView } from './components/transaksi/MutasiStokView';
import { MasterDataView } from './components/master/MasterDataView';
import { DatabaseManagerView } from './components/database/DatabaseManagerView';
import { SQLQueryRunnerView } from './components/database/SQLQueryRunnerView';
import { UserManagementView } from './components/users/UserManagementView';
import { ActivityLogView } from './components/users/ActivityLogView';
import { ReportsView } from './components/reports/ReportsView';
import { AppSettingsView } from './components/settings/AppSettingsView';
import { ForbiddenAccessView } from './components/common/ForbiddenAccessView';
import { Menu } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isAuthenticated, can, user } = useAuth();
  const { appSettings } = useInventory();
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMVCModalOpen, setIsMVCModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  React.useEffect(() => {
    // We want to show the loading screen for at least 1.2s for UX "boot" feel
    const minLoadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    const handleSync = () => {
      // If synced early, we still wait for min timer for visual consistency
      // but this event ensures we have the latest data before proceeding
      console.log('Database synced from cloud during boot.');
    };

    window.addEventListener('db_synced_from_cloud', handleSync);
    return () => {
      clearTimeout(minLoadingTimer);
      window.removeEventListener('db_synced_from_cloud', handleSync);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative">
        {/* Animated background elements for CI feel */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-pulse"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative flex flex-col items-center gap-8 text-center px-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-3 transform rotate-3 animate-bounce shadow-red-500/20">
              <img 
                src="/assets/inventory_logo_v2.jpg" 
                alt="CI Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                   // Fallback if image fails
                   e.currentTarget.src = "https://www.codeigniter.com/assets/images/ci-logo-big.png";
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              REMIX<span className="text-red-500">CI</span> INVENTARI
            </h1>
            <div className="flex flex-col items-center gap-2">
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
              </div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                Inisialisasi Database MySQL...
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            <span>CodeIgniter 4.5.3</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            <span>PHP 8.2 Runtime</span>
          </div>
        </div>

        <style>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
        `}</style>
      </div>
    );
  }


  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} onOpenMVCModal={() => setIsMVCModalOpen(true)} />;
      case 'barang':
        return <BarangListView />;
      case 'barang_ditarik':
        return <BarangDitarikView />;
      case 'transaksi_masuk':
        return <TransaksiMasukView />;
      case 'transaksi_keluar':
        return <TransaksiKeluarView onNavigate={setCurrentView} />;
      case 'perpindahan_barang':
        return <PerpindahanBarangView onNavigate={setCurrentView} />;
      case 'mutasi_stok':
        return <MutasiStokView />;
      case 'master_data':
      case 'master_kategori':
        return <MasterDataView initialTab="kategori" />;
      case 'master_departemen':
        return <MasterDataView initialTab="departemen" />;
      case 'master_supplier':
        return <MasterDataView initialTab="supplier" />;
      case 'master_satuan':
        return <MasterDataView initialTab="satuan" />;
      case 'laporan_system':
      case 'laporan_stok':
        return <ReportsView type="stok" />;
      case 'laporan_transaksi':
        return <ReportsView type="transaksi" />;
      case 'laporan_perpindahan':
        return <ReportsView type="perpindahan" />;
      case 'database_backup':
        if (!can('backup_db') && !can('reset_db')) {
          return <ForbiddenAccessView onBack={() => setCurrentView('dashboard')} />;
        }
        return <DatabaseManagerView />;
      case 'database_query':
        if (!can('query_db')) {
          return <ForbiddenAccessView onBack={() => setCurrentView('dashboard')} />;
        }
        return <SQLQueryRunnerView />;
      case 'user_management':
        if (!can('manage_users')) {
          return <ForbiddenAccessView onBack={() => setCurrentView('dashboard')} />;
        }
        return <UserManagementView />;
      case 'activity_logs':
        if (!can('view_audit_logs')) {
          return <ForbiddenAccessView onBack={() => setCurrentView('dashboard')} />;
        }
        return <ActivityLogView />;
      case 'app_settings':
      case 'settings':
        if (user?.role !== 'admin') {
          return <ForbiddenAccessView onBack={() => setCurrentView('dashboard')} />;
        }
        return <AppSettingsView />;
      default:
        return <DashboardView onNavigate={setCurrentView} onOpenMVCModal={() => setIsMVCModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans print:bg-white print:min-h-0 print:block">
      {/* CodeIgniter Top Navbar */}
      <CodeIgniterHeader
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenMVCModal={() => setIsMVCModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Mobile Top Subbar with menu hamburger */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-slate-900 text-white border-b border-slate-800 text-xs print:hidden">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-2 p-1.5 rounded bg-slate-800 text-slate-200"
        >
          <Menu className="w-4 h-4" />
          <span>Menu Navigasi</span>
        </button>
        <span className="font-mono text-[11px] text-slate-400 capitalize">
          {currentView.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex w-full print:block print:w-full print:m-0 print:p-0">
        {/* CodeIgniter Sidebar */}
        <CodeIgniterSidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1700px] mx-auto pb-8 overflow-y-auto print:p-0 print:m-0 print:max-w-none print:overflow-visible print:w-full flex flex-col justify-between">
          <div className="space-y-6">
            {renderActiveView()}
          </div>

          <footer className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium gap-2 print:hidden">
            <div>
              © {new Date().getFullYear()} <strong className="text-slate-600 dark:text-slate-400 font-bold">{appSettings.nama_aplikasi}</strong> — {appSettings.tagline}
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">{appSettings.versi_aplikasi || 'v4.5.3'}</span>
              <span>Framework CodeIgniter 4</span>
            </div>
          </footer>
        </main>
      </div>

      {/* CodeIgniter Debug Toolbar / Profiler */}
      <CodeIgniterProfiler currentView={currentView} />

      {/* CodeIgniter Architecture Inspector Modal */}
      <CodeIgniterMVCModal
        isOpen={isMVCModalOpen}
        onClose={() => setIsMVCModalOpen(false)}
      />

      {/* User Profile & Password Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Modern Full Notification & Message Center Modal */}
      <NotificationCenterModal onNavigate={setCurrentView} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <NotificationProvider>
          <MainLayout />
        </NotificationProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}
