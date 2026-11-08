import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
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
import { ForbiddenAccessView } from './components/common/ForbiddenAccessView';
import { Menu } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isAuthenticated, can } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMVCModalOpen, setIsMVCModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} onOpenMVCModal={() => setIsMVCModalOpen(true)} />;
      case 'barang':
        return <BarangListView />;
      case 'transaksi_masuk':
        return <TransaksiMasukView />;
      case 'transaksi_keluar':
        return <TransaksiKeluarView onNavigate={setCurrentView} />;
      case 'perpindahan_barang':
        return <PerpindahanBarangView onNavigate={setCurrentView} />;
      case 'mutasi_stok':
        return <MutasiStokView />;
      case 'master_kategori':
      case 'master_departemen':
        return <MasterDataView initialTab="kategori" />;
      case 'master_supplier':
        return <MasterDataView initialTab="supplier" />;
      case 'laporan_stok':
        return <ReportsView type="stok" />;
      case 'laporan_transaksi':
        return <ReportsView type="transaksi" />;
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
      default:
        return <DashboardView onNavigate={setCurrentView} onOpenMVCModal={() => setIsMVCModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* CodeIgniter Top Navbar */}
      <CodeIgniterHeader
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenMVCModal={() => setIsMVCModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Mobile Top Subbar with menu hamburger */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-slate-900 text-white border-b border-slate-800 text-xs">
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
      <div className="flex-1 flex w-full">
        {/* CodeIgniter Sidebar */}
        <CodeIgniterSidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1700px] mx-auto pb-20 overflow-y-auto">
          {renderActiveView()}
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

      {/* Modern Slide-in Toast Notifications */}
      <NotificationToastContainer onNavigate={setCurrentView} />

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
