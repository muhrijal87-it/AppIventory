import React, { useState } from 'react';
import {
  Flame,
  Clock,
  HardDrive,
  Database,
  Route,
  Files,
  ChevronUp,
  ChevronDown,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { mysql } from '../../db/mysqlEngine';
import { useAuth } from '../../context/AuthContext';

interface ProfilerProps {
  currentView: string;
}

export const CodeIgniterProfiler: React.FC<ProfilerProps> = ({ currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'database' | 'timeline' | 'routes' | 'env'>('database');
  const { user } = useAuth();
  const queryLogs = mysql.getQueryLogs();

  const getControllerRoute = () => {
    switch (currentView) {
      case 'dashboard':
        return { controller: 'App\\Controllers\\Home::index', route: 'GET /dashboard', view: 'dashboard/index.php' };
      case 'barang':
        return { controller: 'App\\Controllers\\Barang::index', route: 'GET /barang', view: 'barang/index.php' };
      case 'transaksi_masuk':
        return { controller: 'App\\Controllers\\Transaksi::masuk', route: 'GET /transaksi/masuk', view: 'transaksi/masuk.php' };
      case 'transaksi_keluar':
        return { controller: 'App\\Controllers\\Transaksi::keluar', route: 'GET /transaksi/keluar', view: 'transaksi/keluar.php' };
      case 'mutasi_stok':
        return { controller: 'App\\Controllers\\Laporan::mutasi', route: 'GET /mutasi-stok', view: 'mutasi/index.php' };
      case 'laporan_perpindahan':
        return { controller: 'App\\Controllers\\Laporan::perpindahan', route: 'GET /laporan/perpindahan', view: 'laporan/perpindahan.php' };
      case 'database_backup':
        return { controller: 'App\\Controllers\\DatabaseTool::backup', route: 'GET /database/backup', view: 'database/backup.php' };
      case 'database_query':
        return { controller: 'App\\Controllers\\DatabaseTool::query', route: 'GET /database/sql', view: 'database/sql_runner.php' };
      case 'user_management':
        return { controller: 'App\\Controllers\\User::index', route: 'GET /admin/users', view: 'users/index.php' };
      default:
        return { controller: 'App\\Controllers\\Home::index', route: 'GET /', view: 'layout/main.php' };
    }
  };

  const routeInfo = getControllerRoute();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 font-sans no-print">
      {/* Expanded Profiler Drawer */}
      {isOpen && (
        <div className="bg-slate-900 text-slate-200 border-t-2 border-red-500 shadow-2xl max-h-96 flex flex-col">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1.5 font-bold text-red-500 mr-4">
                <Flame className="w-4 h-4 fill-current" />
                <span>CodeIgniter 4 Debug Toolbar</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('database')}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'database' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Database ({queryLogs.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('routes')}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'routes' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>Routes &amp; Controller</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'timeline' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timeline</span>
                </button>

                <button
                  onClick={() => setActiveTab('env')}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'env' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Environment</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeTab === 'database' && (
                <button
                  onClick={() => mysql.clearQueryLogs()}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                  title="Bersihkan riwayat query"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Queries</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-4 text-xs font-mono scrollbar-thin">
            {activeTab === 'database' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                  <span>Driver: <strong className="text-white">MySQLi (8.0.35)</strong></span>
                  <span>Database: <strong className="text-white">db_ci_inventaris</strong></span>
                  <span>Total Query Logged: <strong className="text-white">{queryLogs.length}</strong></span>
                </div>

                {queryLogs.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    Belum ada kueri SQL yang dieksekusi dalam sesi ini. Lakukan tindakan di aplikasi untuk melihat live SQL logs.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {queryLogs.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-400">#{queryLogs.length - idx}</span>
                            <span className="text-emerald-400">{q.timestamp}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {q.duration_ms} ms
                            </span>
                            {q.affected_rows !== undefined && (
                              <span className="text-slate-400">
                                {q.affected_rows} rows affected
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] ${
                              q.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                            }`}
                          >
                            {q.status}
                          </span>
                        </div>
                        <div className="text-slate-200 overflow-x-auto text-[11px] font-mono whitespace-pre-wrap">
                          {q.sql}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'routes' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-bold">
                      Matched Route
                    </div>
                    <div className="text-red-400 font-semibold">{routeInfo.route}</div>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-bold">
                      Controller Handler
                    </div>
                    <div className="text-amber-400 font-semibold">{routeInfo.controller}</div>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-bold">
                      Rendered View File
                    </div>
                    <div className="text-emerald-400 font-semibold">{routeInfo.view}</div>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-bold">
                      Active User Session
                    </div>
                    <div className="text-blue-400 font-semibold">
                      {user ? `${user.username} (${user.role})` : 'Guest'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 mb-2">Request Execution Timeline</div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">Framework Bootstrap &amp; Autoloader</span>
                    <span className="text-amber-400">4.2 ms</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">Database Connection (MySQL Localhost)</span>
                    <span className="text-cyan-400">3.8 ms</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">Auth Filter &amp; Session Verification</span>
                    <span className="text-emerald-400">2.1 ms</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">Controller Method Execution ({routeInfo.controller})</span>
                    <span className="text-red-400">8.4 ms</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">View Rendering ({routeInfo.view})</span>
                    <span className="text-indigo-400">5.6 ms</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-800 font-bold">
                    <span className="text-white">Total Request Time</span>
                    <span className="text-emerald-400">24.1 ms</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'env' && (
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">CI_ENVIRONMENT</span>
                  <span className="text-emerald-400 font-bold">development</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">PHP Version</span>
                  <span className="text-amber-400 font-bold">8.2.14-cli</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Database Engine</span>
                  <span className="text-cyan-400 font-bold">MySQL 8.0.35 (InnoDB)</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Memory Peak Usage</span>
                  <span className="text-purple-400 font-bold">2.41 MB</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Docked Toolbar Pill Bar */}
      <div className="bg-slate-950/95 text-slate-300 border-t border-slate-800 backdrop-blur-md px-3 py-1 flex items-center justify-between text-[11px]">
        {/* Left: CodeIgniter Badge & Quick Stats */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 font-bold text-red-500 hover:text-red-400 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="font-sans">CI 4.5.3</span>
          </button>

          <div className="hidden sm:flex items-center gap-3 font-mono text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>24.1 ms</span>
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-slate-500" />
              <span>2.4 MB</span>
            </span>
            <button
              onClick={() => {
                setActiveTab('database');
                setIsOpen(true);
              }}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <Database className="w-3 h-3" />
              <span>{queryLogs.length} Queries</span>
            </button>
            <span className="hidden md:flex items-center gap-1 text-amber-400 truncate max-w-xs">
              <Route className="w-3 h-3" />
              <span className="truncate">{routeInfo.route}</span>
            </span>
          </div>
        </div>

        {/* Right: Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
        >
          <span>{isOpen ? 'Tutup Toolbar' : 'Buka Debug Toolbar'}</span>
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
