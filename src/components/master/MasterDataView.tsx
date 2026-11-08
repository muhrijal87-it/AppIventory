import React, { useState } from 'react';
import {
  Layers,
  Ruler,
  Truck,
  Plus,
  Edit,
  Trash2,
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  FolderPlus
} from 'lucide-react';
import { Kategori, Satuan, Supplier, Departemen } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

export const MasterDataView: React.FC<{ initialTab?: 'kategori' | 'satuan' | 'supplier' }> = ({
  initialTab = 'kategori',
}) => {
  const {
    kategori,
    satuan,
    supplier,
    barang,
    addKategori,
    updateKategori,
    deleteKategori,
    addSatuan,
    updateSatuan,
    deleteSatuan,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  } = useInventory();
  const { can } = useAuth();

  const [activeTab, setActiveTab] = useState<'kategori' | 'satuan' | 'supplier'>(
    initialTab === 'kategori' || initialTab === 'satuan' || initialTab === 'supplier' ? initialTab : 'kategori'
  );

  // Kategori Modal & Form
  const [showKatModal, setShowKatModal] = useState(false);
  const [editingKat, setEditingKat] = useState<Kategori | null>(null);
  const [katKode, setKatKode] = useState('');
  const [katNama, setKatNama] = useState('');
  const [katDeskripsi, setKatDeskripsi] = useState('');

  // Satuan Modal & Form
  const [showSatModal, setShowSatModal] = useState(false);
  const [editingSat, setEditingSat] = useState<Satuan | null>(null);
  const [satKode, setSatKode] = useState('');
  const [satNama, setSatNama] = useState('');

  // Supplier Modal & Form
  const [showSupModal, setShowSupModal] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [supKode, setSupKode] = useState('');
  const [supNama, setSupNama] = useState('');
  const [supPic, setSupPic] = useState('');
  const [supTelp, setSupTelp] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAlamat, setSupAlamat] = useState('');

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'kategori' | 'satuan' | 'supplier';
    id: number;
    title: string;
  } | null>(null);

  const handleExecuteDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'kategori') deleteKategori(deleteConfirm.id);
    else if (deleteConfirm.type === 'satuan') deleteSatuan(deleteConfirm.id);
    else if (deleteConfirm.type === 'supplier') deleteSupplier(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  // KATEGORI HANDLERS
  const openAddKategori = () => {
    setEditingKat(null);
    setKatKode(`KAT-${kategori.length + 1}`);
    setKatNama('');
    setKatDeskripsi('');
    setShowKatModal(true);
  };

  const openEditKategori = (k: Kategori) => {
    setEditingKat(k);
    setKatKode(k.kode_kategori);
    setKatNama(k.nama_kategori);
    setKatDeskripsi(k.deskripsi);
    setShowKatModal(true);
  };

  const handleKatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!katNama.trim()) return;
    if (editingKat) {
      updateKategori(editingKat.id, {
        kode_kategori: katKode.toUpperCase(),
        nama_kategori: katNama,
        deskripsi: katDeskripsi,
      });
    } else {
      addKategori({
        kode_kategori: katKode.toUpperCase(),
        nama_kategori: katNama,
        deskripsi: katDeskripsi,
      });
    }
    setShowKatModal(false);
  };

  // SATUAN HANDLERS
  const openAddSatuan = () => {
    setEditingSat(null);
    setSatKode('');
    setSatNama('');
    setShowSatModal(true);
  };

  const openEditSatuan = (s: Satuan) => {
    setEditingSat(s);
    setSatKode(s.kode_satuan);
    setSatNama(s.nama_satuan);
    setShowSatModal(true);
  };

  const handleSatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!satNama.trim()) return;
    if (editingSat) {
      updateSatuan(editingSat.id, {
        kode_satuan: satKode.toUpperCase(),
        nama_satuan: satNama,
      });
    } else {
      addSatuan({
        kode_satuan: satKode.toUpperCase(),
        nama_satuan: satNama,
      });
    }
    setShowSatModal(false);
  };

  // SUPPLIER HANDLERS
  const openAddSupplier = () => {
    setEditingSup(null);
    const seq = supplier.length + 1;
    setSupKode(`SUP-${String(seq).padStart(3, '0')}`);
    setSupNama('');
    setSupPic('');
    setSupTelp('');
    setSupEmail('');
    setSupAlamat('');
    setShowSupModal(true);
  };

  const openEditSupplier = (s: Supplier) => {
    setEditingSup(s);
    setSupKode(s.kode_supplier);
    setSupNama(s.nama_supplier);
    setSupPic(s.kontak_pic);
    setSupTelp(s.no_telepon);
    setSupEmail(s.email);
    setSupAlamat(s.alamat);
    setShowSupModal(true);
  };

  const handleSupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supNama.trim()) return;
    if (editingSup) {
      updateSupplier(editingSup.id, {
        kode_supplier: supKode.toUpperCase(),
        nama_supplier: supNama,
        kontak_pic: supPic,
        no_telepon: supTelp,
        email: supEmail,
        alamat: supAlamat,
      });
    } else {
      addSupplier({
        kode_supplier: supKode.toUpperCase(),
        nama_supplier: supNama,
        kontak_pic: supPic,
        no_telepon: supTelp,
        email: supEmail,
        alamat: supAlamat,
      });
    }
    setShowSupModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Pengelolaan Master Data Inventaris
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi tabel referensi kategori produk, satuan unit barang, dan data rekanan pemasok (supplier).
          </p>
        </div>

        {can('manage_master_data') && (
          <div className="flex items-center gap-2">
            {activeTab === 'kategori' && (
              <button
                onClick={openAddKategori}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </button>
            )}
            {activeTab === 'satuan' && (
              <button
                onClick={openAddSatuan}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Satuan</span>
              </button>
            )}
            {activeTab === 'supplier' && (
              <button
                onClick={openAddSupplier}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pemasok</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 pt-2 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('kategori')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'kategori'
                ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kategori Barang ({kategori.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('satuan')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'satuan'
                ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Satuan Unit ({satuan.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('supplier')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'supplier'
                ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Pemasok / Supplier ({supplier.length})</span>
          </button>
        </div>

        {/* Tab 1: Kategori */}
        {activeTab === 'kategori' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama Kategori</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3 text-center">Total Barang</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {kategori.map((k) => {
                  const itemCount = barang.filter((b) => b.kategori_id === k.id).length;
                  return (
                    <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {k.kode_kategori}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {k.nama_kategori}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-sm">
                        {k.deskripsi || '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {itemCount} Barang
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {can('manage_master_data') && (
                            <button
                              onClick={() => openEditKategori(k)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Kategori"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {can('delete_master_data') && (
                            <button
                              onClick={() => setDeleteConfirm({ type: 'kategori', id: k.id, title: k.nama_kategori })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus Kategori (Hanya Administrator)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Satuan */}
        {activeTab === 'satuan' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Kode Satuan</th>
                  <th className="px-4 py-3">Nama Satuan</th>
                  <th className="px-4 py-3 text-center">Penggunaan pada Barang</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {satuan.map((s) => {
                  const itemCount = barang.filter((b) => b.satuan_id === s.id).length;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {s.kode_satuan}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {s.nama_satuan}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {itemCount} Barang
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {can('manage_master_data') && (
                            <button
                              onClick={() => openEditSatuan(s)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Satuan"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {can('delete_master_data') && (
                            <button
                              onClick={() => setDeleteConfirm({ type: 'satuan', id: s.id, title: s.nama_satuan })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus Satuan (Hanya Administrator)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Supplier */}
        {activeTab === 'supplier' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama Perusahaan Pemasok</th>
                  <th className="px-4 py-3">Kontak PIC</th>
                  <th className="px-4 py-3">No. Telepon &amp; Email</th>
                  <th className="px-4 py-3">Alamat</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {supplier.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {sup.kode_supplier}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {sup.nama_supplier}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {sup.kontak_pic}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <div>{sup.no_telepon}</div>
                      <div className="text-slate-400">{sup.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs">
                      {sup.alamat}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {can('manage_master_data') && (
                          <button
                            onClick={() => openEditSupplier(sup)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Pemasok"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {can('delete_master_data') && (
                          <button
                            onClick={() => setDeleteConfirm({ type: 'supplier', id: sup.id, title: sup.nama_supplier })}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Hapus Pemasok (Hanya Administrator)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Kategori */}
      {showKatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingKat ? 'Edit Kategori Barang' : 'Tambah Kategori Barang'}
              </h3>
              <button onClick={() => setShowKatModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleKatSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Kode Kategori</label>
                <input
                  type="text"
                  required
                  value={katKode}
                  onChange={(e) => setKatKode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 font-mono uppercase bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={katNama}
                  onChange={(e) => setKatNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={katDeskripsi}
                  onChange={(e) => setKatDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKatModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-red-600 text-white font-semibold rounded-lg">
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Satuan */}
      {showSatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingSat ? 'Edit Satuan Unit' : 'Tambah Satuan Unit'}
              </h3>
              <button onClick={() => setShowSatModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSatSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Kode Satuan (Misal: PCS, UNIT)</label>
                <input
                  type="text"
                  required
                  value={satKode}
                  onChange={(e) => setSatKode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 font-mono uppercase bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Nama Satuan (Misal: Pieces, Box)</label>
                <input
                  type="text"
                  required
                  value={satNama}
                  onChange={(e) => setSatNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSatModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-red-600 text-white font-semibold rounded-lg">
                  Simpan Satuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Supplier */}
      {showSupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingSup ? 'Edit Pemasok' : 'Tambah Pemasok (Supplier)'}
              </h3>
              <button onClick={() => setShowSupModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Kode Pemasok</label>
                  <input
                    type="text"
                    required
                    value={supKode}
                    onChange={(e) => setSupKode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 font-mono uppercase bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Nama Perusahaan</label>
                  <input
                    type="text"
                    required
                    value={supNama}
                    onChange={(e) => setSupNama(e.target.value)}
                    placeholder="PT / CV..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Kontak PIC</label>
                  <input
                    type="text"
                    value={supPic}
                    onChange={(e) => setSupPic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">No. Telepon / WA</label>
                  <input
                    type="text"
                    value={supTelp}
                    onChange={(e) => setSupTelp(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Alamat Kantor / Gudang</label>
                <textarea
                  rows={2}
                  value={supAlamat}
                  onChange={(e) => setSupAlamat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-red-600 text-white font-semibold rounded-lg">
                  Simpan Pemasok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Master Data */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hapus {deleteConfirm.type === 'kategori' ? 'Kategori' : deleteConfirm.type === 'satuan' ? 'Satuan' : 'Pemasok'}?
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Apakah Anda yakin ingin menghapus data <strong className="text-slate-800 dark:text-slate-200">"{deleteConfirm.title}"</strong> dari sistem?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
