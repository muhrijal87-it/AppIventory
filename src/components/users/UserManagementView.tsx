import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  X,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

export const UserManagementView: React.FC = () => {
  const { user: activeUser, users, addUser, updateUser, deleteUser, toggleUserStatus } = useAuth();
  const { setFlash } = useInventory();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [isActive, setIsActive] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setNamaLengkap('');
    setEmail('');
    setRole('staff');
    setIsActive(true);
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (target: User) => {
    setEditingUser(target);
    setUsername(target.username);
    setNamaLengkap(target.nama_lengkap);
    setEmail(target.email);
    setRole(target.role);
    setIsActive(target.is_active);
    setFormError('');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!username.trim() || !namaLengkap.trim()) {
      setFormError('Username dan Nama Lengkap wajib diisi!');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        nama_lengkap: namaLengkap,
        email,
        role,
        is_active: isActive,
      });
      setFlash('success', `Data pengguna '${username}' berhasil diperbarui!`);
    } else {
      // Check duplicate username
      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        setFormError('Username sudah terdaftar! Gunakan username lain.');
        return;
      }

      addUser({
        username: username.toLowerCase().trim(),
        nama_lengkap: namaLengkap,
        email,
        role,
        is_active: isActive,
      });
      setFlash('success', `Pengguna baru '${username}' berhasil ditambahkan ke database!`);
    }
    setShowAddModal(false);
  };

  const handleDelete = (target: User) => {
    if (activeUser && activeUser.id === target.id) {
      setFlash('error', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan!');
      return;
    }
    setUserToDelete(target);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setFlash('warning', `Akun ${userToDelete.username} telah dihapus dari sistem.`);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Manajemen Pengguna &amp; Hak Akses (RBAC)
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              tbl_users ({users.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola otentikasi berjenjang (Administrator, Staff Gudang, Manajer Operasional) untuk menjamin keamanan data inventaris.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Role Capabilities Guide Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrator (admin)</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Akses tak terbatas: Kelola semua modul inventaris, transaksi masuk/keluar, manajemen user, ekspor backup SQL, dan reset database.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1">
            <Shield className="w-4 h-4" />
            <span>Staff Gudang (staff)</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Operasional logistik: Menambah barang, mencatat penerimaan barang masuk, mencatat surat jalan pengeluaran, dan melihat kartu stok.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
            <Shield className="w-4 h-4" />
            <span>Manajer / Pimpinan (manager)</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Audit &amp; Pengawasan: Memantau dashboard, melihat laporan valuasi aset inventaris, ekspor laporan spreadsheet, dan unduh backup database.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Pengguna</th>
                <th className="px-4 py-3">Username &amp; Email</th>
                <th className="px-4 py-3">Peran Akses (Role)</th>
                <th className="px-4 py-3 text-center">Status Akun</th>
                <th className="px-4 py-3">Terakhir Login</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => {
                const isCurrent = activeUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                          {u.username.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.nama_lengkap}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">ID #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">@{u.username}</div>
                      <div className="text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-semibold font-mono uppercase ${
                          u.role === 'admin'
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : u.role === 'staff'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        disabled={isCurrent}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          u.is_active
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                        } ${isCurrent ? 'cursor-not-allowed opacity-75' : ''}`}
                      >
                        {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{u.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {u.last_login || 'Belum pernah'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Pengguna"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={isCurrent}
                          className={`p-1 text-red-600 hover:bg-red-50 rounded ${
                            isCurrent ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingUser ? `Edit Pengguna: @${editingUser.username}` : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">
                  Username Login <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: staf_gudang2"
                  className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Dedi Kurniawan, S.Kom"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dedi@perusahaan.co.id"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Tingkat Hak Akses (Role) <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
                >
                  <option value="staff">Staff Gudang (Pengelolaan Barang &amp; Transaksi)</option>
                  <option value="manager">Manajer Operasional (Pelaporan &amp; Pengawasan)</option>
                  <option value="admin">Administrator (Akses Penuh Sistem &amp; Database)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="user_active_check"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <label htmlFor="user_active_check" className="font-medium text-slate-700 dark:text-slate-300">
                  Akun Aktif (Dapat Login ke Sistem)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingUser ? 'Perbarui Pengguna' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pengguna */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hapus Akun Pengguna?
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Apakah Anda yakin ingin menghapus akun <strong className="text-slate-800 dark:text-slate-200">{userToDelete.nama_lengkap} (@{userToDelete.username})</strong> secara permanen?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
