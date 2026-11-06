import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Download,
  Barcode,
  X,
  MapPin,
  Tag,
  ArrowUpDown,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Barang, Kategori, Satuan } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

export const BarangListView: React.FC = () => {
  const { barang, kategori, satuan, addBarang, updateBarang, deleteBarang, mutasiStok } = useInventory();
  const { can } = useAuth();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id_desc');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Barang | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Barang | null>(null);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formState, setFormState] = useState({
    kode_barang: '',
    nama_barang: '',
    kategori_id: 1,
    satuan_id: 1,
    stok: 10,
    stok_min: 5,
    harga_beli: 0,
    harga_jual: 0,
    lokasi_rak: 'Rak A-1',
    kondisi: 'Baik' as 'Baik' | 'Perbaikan' | 'Rusak',
    deskripsi: '',
    barcode: '',
    model: '',
    serial_number: '',
    foto: '',
  });

  // Filtered and sorted items
  const filteredItems = barang.filter((item) => {
    const matchesSearch =
      item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi_rak.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.serial_number && item.serial_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesKategori =
      selectedKategori === 'all' || item.kategori_id === parseInt(selectedKategori, 10);

    const matchesStock =
      selectedStockFilter === 'all' ||
      (selectedStockFilter === 'kritis' && item.stok > 0 && item.stok <= item.stok_min) ||
      (selectedStockFilter === 'habis' && item.stok === 0) ||
      (selectedStockFilter === 'aman' && item.stok > item.stok_min);

    return matchesSearch && matchesKategori && matchesStock;
  }).sort((a, b) => {
    if (sortBy === 'stok_asc') return a.stok - b.stok;
    if (sortBy === 'stok_desc') return b.stok - a.stok;
    if (sortBy === 'nama_asc') return a.nama_barang.localeCompare(b.nama_barang);
    return b.id - a.id;
  });

  const handleOpenAdd = () => {
    const nextNumber = barang.length > 0 ? Math.max(...barang.map((b) => b.id)) + 1 : 1;
    const padded = String(nextNumber).padStart(3, '0');
    setFormState({
      kode_barang: `BRG-${padded}`,
      nama_barang: '',
      kategori_id: kategori[0]?.id || 1,
      satuan_id: satuan[0]?.id || 1,
      stok: 10,
      stok_min: 5,
      harga_beli: 0,
      harga_jual: 0,
      lokasi_rak: 'Rak A-1 (Gudang Utama)',
      kondisi: 'Baik',
      deskripsi: '',
      barcode: `8991001${String(nextNumber).padStart(6, '0')}`,
      model: '',
      serial_number: '',
      foto: '',
    });
    setModalError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: Barang) => {
    setSelectedItem(item);
    setFormState({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      kategori_id: item.kategori_id,
      satuan_id: item.satuan_id,
      stok: item.stok,
      stok_min: item.stok_min,
      harga_beli: 0,
      harga_jual: 0,
      lokasi_rak: item.lokasi_rak,
      kondisi: item.kondisi,
      deskripsi: item.deskripsi,
      barcode: item.barcode,
      model: item.model || '',
      serial_number: item.serial_number || '',
      foto: item.foto || '',
    });
    setModalError('');
    setShowEditModal(true);
  };

  const handleOpenDetail = (item: Barang) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setModalError('Ukuran foto terlalu besar! Maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormState((prev) => ({ ...prev, foto: dataUrl }));
      setModalError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nama_barang.trim()) {
      setModalError('Nama barang wajib diisi!');
      return;
    }
    addBarang({
      kode_barang: formState.kode_barang,
      nama_barang: formState.nama_barang,
      kategori_id: Number(formState.kategori_id),
      satuan_id: Number(formState.satuan_id),
      stok: Number(formState.stok),
      stok_min: Number(formState.stok_min),
      harga_beli: Number(formState.harga_beli),
      harga_jual: Number(formState.harga_jual),
      lokasi_rak: formState.lokasi_rak,
      kondisi: formState.kondisi,
      deskripsi: formState.deskripsi,
      barcode: formState.barcode,
      foto: formState.foto || undefined,
      model: formState.model || undefined,
    });
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    updateBarang(selectedItem.id, {
      nama_barang: formState.nama_barang,
      kategori_id: Number(formState.kategori_id),
      satuan_id: Number(formState.satuan_id),
      stok: Number(formState.stok),
      stok_min: Number(formState.stok_min),
      harga_beli: Number(formState.harga_beli),
      harga_jual: Number(formState.harga_jual),
      lokasi_rak: formState.lokasi_rak,
      kondisi: formState.kondisi,
      deskripsi: formState.deskripsi,
      barcode: formState.barcode,
      foto: formState.foto || undefined,
      model: formState.model || undefined,
    });
    setShowEditModal(false);
  };

  const handleDelete = (item: Barang) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteBarang(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Kode Barang', 'Nama Barang', 'Kategori', 'Satuan', 'Stok', 'Stok Min', 'Lokasi Rak', 'Kondisi'];
    const rows = filteredItems.map((b) => {
      const kat = kategori.find((k) => k.id === b.kategori_id)?.nama_kategori || '-';
      const sat = satuan.find((s) => s.id === b.satuan_id)?.nama_satuan || '-';
      return [
        b.kode_barang,
        `"${b.nama_barang.replace(/"/g, '""')}"`,
        `"${kat}"`,
        `"${sat}"`,
        b.stok,
        b.stok_min,
        `"${b.lokasi_rak}"`,
        b.kondisi,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `katalog_barang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Katalog Data Barang Inventaris
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
              tbl_barang ({filteredItems.length} items)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola inventaris fisik, foto produk, kontrol stok minimum, rak penyimpanan, dan kode barcode.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          {can('manage_inventory') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode, nama, atau rak..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500"
            />
          </div>

          {/* Filter by Category */}
          <div>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Kategori</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Stock Level */}
          <div>
            <select
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Status Stok</option>
              <option value="aman">Stok Aman (&gt; Min)</option>
              <option value="kritis">Stok Kritis (≤ Min)</option>
              <option value="habis">Stok Habis (0)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="id_desc">Terbaru Ditambahkan</option>
              <option value="stok_asc">Stok Paling Sedikit</option>
              <option value="stok_desc">Stok Paling Banyak</option>
              <option value="nama_asc">Nama Barang (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Table with Product Photo Thumbnail */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode / SKU</th>
                <th className="px-4 py-3">Barang &amp; Foto</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Stok Fisik</th>
                <th className="px-4 py-3">Lokasi Rak</th>
                <th className="px-4 py-3 text-center">Kondisi</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada barang yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const kat = kategori.find((k) => k.id === item.kategori_id);
                  const sat = satuan.find((s) => s.id === item.satuan_id);
                  const isLow = item.stok > 0 && item.stok <= item.stok_min;
                  const isOut = item.stok === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="hover:text-red-600 transition-colors"
                        >
                          {item.kode_barang}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.foto ? (
                            <img
                              src={item.foto}
                              alt={item.nama_barang}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => handleOpenDetail(item)}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div
                              onClick={() => handleOpenDetail(item)}
                              className="font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-red-600 transition-colors"
                            >
                              {item.nama_barang}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {item.model ? `Model: ${item.model}` : item.deskripsi || '-'}
                            </div>
                            {item.serial_number && (
                              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono mt-0.5 font-medium truncate max-w-xs">
                                SN: {item.serial_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {kat?.nama_kategori || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                        <span
                          className={`font-bold text-sm ${
                            isOut
                              ? 'text-red-600'
                              : isLow
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.stok}
                        </span>{' '}
                        <span className="text-[11px] text-slate-400">{sat?.nama_satuan || 'Unit'}</span>
                        {isLow && (
                          <span className="block text-[10px] text-amber-600 font-sans font-medium">
                            Kritis (Min: {item.stok_min})
                          </span>
                        )}
                        {isOut && (
                          <span className="block text-[10px] text-red-600 font-sans font-medium">
                            Habis
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.lokasi_rak}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.kondisi === 'Baik'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : item.kondisi === 'Perbaikan'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {item.kondisi}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            title="Detail & Foto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {can('manage_inventory') && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 transition-colors"
                                title="Edit Data Barang"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors"
                                title="Hapus Barang"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah & Edit Barang (with Product Image Upload) */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {showAddModal ? 'Tambah Barang Inventaris Baru' : `Edit Barang: ${selectedItem?.kode_barang}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Body */}
            <form onSubmit={showAddModal ? handleSubmitAdd : handleSubmitEdit} className="p-6 overflow-y-auto space-y-4 text-xs scrollbar-thin flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kode Barang (SKU / Barcode ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.kode_barang}
                    onChange={(e) => setFormState({ ...formState, kode_barang: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Barcode EAN-13
                  </label>
                  <input
                    type="text"
                    value={formState.barcode}
                    onChange={(e) => setFormState({ ...formState, barcode: e.target.value })}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Barang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.nama_barang}
                  onChange={(e) => setFormState({ ...formState, nama_barang: e.target.value })}
                  placeholder="Contoh: Laptop Lenovo ThinkPad L14 Gen 4"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Model / Tipe Barang
                </label>
                <input
                  type="text"
                  value={formState.model}
                  onChange={(e) => setFormState({ ...formState, model: e.target.value })}
                  placeholder="Contoh: MD788G DMR Digital / ThinkPad L14"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Barang <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formState.kategori_id}
                    onChange={(e) => setFormState({ ...formState, kategori_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {kategori.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Satuan Barang <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formState.satuan_id}
                    onChange={(e) => setFormState({ ...formState, satuan_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {satuan.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama_satuan} ({s.kode_satuan})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Stok Sekarang (Fisik) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formState.stok}
                    onChange={(e) => setFormState({ ...formState, stok: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Stok Minimum (Safety Stock) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formState.stok_min}
                    onChange={(e) => setFormState({ ...formState, stok_min: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Lokasi Rak / Penyimpanan
                  </label>
                  <input
                    type="text"
                    value={formState.lokasi_rak}
                    onChange={(e) => setFormState({ ...formState, lokasi_rak: e.target.value })}
                    placeholder="Contoh: Rak B-2 (Gudang ATK)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kondisi Fisik Barang
                  </label>
                  <select
                    value={formState.kondisi}
                    onChange={(e) => setFormState({ ...formState, kondisi: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Baik">Baik (Normal)</option>
                    <option value="Perbaikan">Perbaikan (Dalam Maintenance)</option>
                    <option value="Rusak">Rusak (Afkir)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Spesifikasi Lengkap
                </label>
                <textarea
                  rows={2}
                  value={formState.deskripsi}
                  onChange={(e) => setFormState({ ...formState, deskripsi: e.target.value })}
                  placeholder="Keterangan spesifikasi teknis atau nomor serial..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* INPUT GAMBAR / FOTO BARANG */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
                <label className="block font-semibold text-slate-800 dark:text-slate-200">
                  Foto / Gambar Fisik Barang
                </label>
                <p className="text-[11px] text-slate-500">
                  Unggah gambar produk untuk mempermudah identifikasi staf gudang (JPG, PNG, WebP).
                </p>

                {formState.foto ? (
                  <div className="relative mt-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <img
                      src={formState.foto}
                      alt="Preview Produk"
                      className="w-16 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Gambar Berhasil Dipilih</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Akan ditampilkan di katalog dan kartu detail barang.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormState((prev) => ({ ...prev, foto: '' }))}
                      className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white dark:bg-slate-900">
                      <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-red-600 dark:text-red-400 hover:underline">
                          Pilih foto produk barang
                        </span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Seret atau klik untuk mengunggah file (Maks. 2 MB)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
                >
                  {showAddModal ? 'Simpan Data Barang' : 'Perbarui Data Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detail Barang & Barcode with Image Preview */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-red-600 font-bold">{selectedItem.kode_barang}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedItem.nama_barang}</h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Photo if exists */}
            {selectedItem.foto && (
              <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-center items-center p-2">
                <img
                  src={selectedItem.foto}
                  alt={selectedItem.nama_barang}
                  className="max-h-52 w-auto object-contain rounded-lg"
                />
              </div>
            )}

            {/* Barcode Render SVG Simulation */}
            <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
              <div className="flex justify-center items-center h-14 space-x-1">
                {[4, 2, 6, 2, 8, 4, 2, 6, 4, 8, 2, 4, 6, 2, 8, 4, 2, 6, 4, 8, 2, 4].map((h, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 dark:bg-slate-100 w-1 rounded-xs"
                    style={{ height: `${h * 5}px` }}
                  />
                ))}
              </div>
              <div className="font-mono text-xs tracking-widest text-slate-600 dark:text-slate-400 mt-1.5 font-bold">
                {selectedItem.barcode || selectedItem.kode_barang}
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Stok Saat Ini</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {selectedItem.stok} {satuan.find((s) => s.id === selectedItem.satuan_id)?.nama_satuan}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Batas Minimum</span>
                <span className="font-mono font-bold text-sm text-amber-600">
                  {selectedItem.stok_min}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Kondisi Fisik</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedItem.kondisi}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Lokasi Rak</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedItem.lokasi_rak}
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 rounded bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold block mb-0.5">Spesifikasi / Catatan:</span>
              <p>{selectedItem.deskripsi || 'Tidak ada catatan tambahan.'}</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 rounded-lg hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Barang */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-red-50 dark:ring-red-950/20">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Data Barang?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus data inventaris berikut dari database MySQL?
              </p>

              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kode SKU:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{itemToDelete.kode_barang}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Barang:</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[200px] truncate">{itemToDelete.nama_barang}</span>
                </div>
                {itemToDelete.model && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model:</span>
                    <span className="text-slate-700 dark:text-slate-300">{itemToDelete.model}</span>
                  </div>
                )}
                {itemToDelete.serial_number && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Serial Number:</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 text-right max-w-[200px] truncate">{itemToDelete.serial_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Stok Fisik:</span>
                  <span className="font-mono font-bold text-orange-600">{itemToDelete.stok} Unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lokasi Rak:</span>
                  <span className="text-slate-700 dark:text-slate-300">{itemToDelete.lokasi_rak || '-'}</span>
                </div>
              </div>

              <p className="text-[11px] text-red-600 dark:text-red-400 mt-3 font-medium">
                Peringatan: Tindakan ini permanen dan akan menghapus baris data dari tabel `tbl_barang`.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Barang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
