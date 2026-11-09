import React, { useState } from 'react';
import {
  Flame,
  Lock,
  User,
  Shield,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Database,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PillNotification } from '../common/PillNotification';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Silakan masukkan nama pengguna (username).');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(username, password);
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const handleQuickDemo = async (userKey: string) => {
    setUsername(userKey);
    setPassword('password123');
    setLoading(true);
    setError('');
    const res = await login(userKey, 'password123');
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Subtle Ambience */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 text-slate-100">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 items-center justify-center text-white shadow-lg mb-3">
            <Flame className="w-8 h-8 fill-current" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-white">CI-Inventaris</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-semibold border border-red-800">
              CI 4.5.3
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sistem Informasi Manajemen Inventaris Gudang &amp; Relasional MySQL
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5">
            <PillNotification
              type="error"
              title="Gagal Masuk"
              message={error}
              onClose={() => setError('')}
            />
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Nama Pengguna (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin / gudang / manajer"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-red-600"
              />
              <span>Ingat Sesi Saya</span>
            </label>
            <span className="text-slate-500 font-mono">Shield Auth Filter</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Memverifikasi Sesi...</span>
            ) : (
              <>
                <span>Masuk ke Sistem (Login)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium mb-2.5 text-center">
            Uji Coba Cepat (Pilih Akun Demo):
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              onClick={() => handleQuickDemo('admin')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-center transition-colors group"
            >
              <div className="font-bold text-red-400 group-hover:text-red-300">Admin</div>
              <div className="text-slate-400 text-[9px] mt-0.5">Superuser</div>
            </button>

            <button
              onClick={() => handleQuickDemo('gudang')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-center transition-colors group"
            >
              <div className="font-bold text-blue-400 group-hover:text-blue-300">Staff</div>
              <div className="text-slate-400 text-[9px] mt-0.5">Logistik</div>
            </button>

            <button
              onClick={() => handleQuickDemo('manajer')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-center transition-colors group"
            >
              <div className="font-bold text-emerald-400 group-hover:text-emerald-300">Manajer</div>
              <div className="text-slate-400 text-[9px] mt-0.5">Laporan</div>
            </button>
          </div>
        </div>

        {/* Security Footer Details */}
        <div className="mt-6 text-center text-[10px] text-slate-400 font-mono">
          <div className="flex items-center justify-center gap-2">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>RBAC Protected</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-400" />
              <span>MySQL 8.0 InnoDB</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
