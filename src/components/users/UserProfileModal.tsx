import React, { useState } from 'react';
import { X, User, Key, Mail, Shield, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const { setFlash } = useInventory();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [namaLengkap, setNamaLengkap] = useState(user?.nama_lengkap || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !user) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim() || !email.trim()) {
      setError('Nama lengkap dan email tidak boleh kosong.');
      return;
    }

    updateProfile(namaLengkap, email);
    setSuccess('Profil berhasil diperbarui!');
    setFlash('success', 'Profil pengguna berhasil diperbarui ke database.');
    setTimeout(() => {
      setSuccess('');
      onClose();
    }, 1200);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    changePassword(currentPassword, newPassword);
    setSuccess('Kata sandi berhasil diubah!');
    setFlash('success', 'Kata sandi akun Anda telah berhasil diperbarui.');
    setTimeout(() => {
      setSuccess('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengaturan Akun Pengguna</h3>
              <p className="text-xs text-slate-500 font-mono">@{user.username} · {user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2">
          <button
            onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
            className={`pb-2.5 text-xs font-medium border-b-2 mr-6 transition-colors ${
              activeTab === 'profile'
                ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Informasi Profil
          </button>
          <button
            onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Ganti Kata Sandi
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-2.5 text-xs rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-2.5 text-xs rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username (ID Sistem)
                </label>
                <input
                  type="text"
                  disabled
                  value={user.username}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-red-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-xs"
                >
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ulangi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:border-red-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-xs"
                >
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
