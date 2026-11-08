import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, FileCode, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ForbiddenAccessViewProps {
  onBack: () => void;
}

export const ForbiddenAccessView: React.FC<ForbiddenAccessViewProps> = ({ onBack }) => {
  const { user } = useAuth();

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator (Super Admin)';
      case 'staff':
        return 'Staff Gudang / Petugas Logistik';
      case 'manager':
        return 'Manajer Operasional / Pimpinan';
      default:
        return 'Tamu (Guest)';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-8 shadow-xl relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500" />

        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="font-mono text-xs px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 font-bold uppercase">
          HTTP 403 · Access Forbidden
        </span>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">
          Izin Akses Terbatas
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          Akun Anda <strong className="text-slate-900 dark:text-white">@{user?.username}</strong> dengan peran{' '}
          <strong className="text-red-600 dark:text-red-400 font-semibold">{getRoleLabel(user?.role)}</strong> tidak
          memiliki hak akses untuk membuka halaman atau modul administratif ini.
        </p>

        {/* CodeIgniter Filter Security Card */}
        <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700/60 text-left text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>App\Filters\RoleAuthFilter.php</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Pembatasan peran (RBAC) diterapkan sesuai aturan manajemen penggunaan demi melindungi integritas database dan data sistem.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
