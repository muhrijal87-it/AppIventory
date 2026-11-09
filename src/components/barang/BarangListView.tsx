import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Download,
  Barcode,
  X,
  MapPin,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Barang, Kategori, Satuan } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { mysql } from '../../db/mysqlEngine';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { PillNotification } from '../common/PillNotification';

// --- Reusable Form Components ---
const FormLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-hidden"
  />
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-hidden"
  />
);

export const BarangListView: React.FC = () => {
  const { barang, kategori, satuan, addBarang, updateBarang, deleteBarang, reloadState } = useInventory();
  const { can } = useAuth();

  const handleRestoreSeedData = () => {
    mysql.resetDatabase(true);
    reloadState();
  };

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

  // Barcode / QR Scanner state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerMode, setScannerMode] = useState<'search' | 'form_barcode'>('search');
  const [scanNotification, setScanNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const handleScan = (scannedVal: string) => {
    const cleanVal = scannedVal.trim();
    if (!cleanVal) return;

    if (scannerMode === 'search') {
      // Find matching item by barcode, kode_barang, or serial_number
      const matched = barang.find(
        (b) =>
          (b.barcode && b.barcode.toLowerCase() === cleanVal.toLowerCase()) ||
          b.kode_barang.toLowerCase() === cleanVal.toLowerCase() ||
          (b.serial_number && b.serial_number.toLowerCase().includes(cleanVal.toLowerCase()))
      );

      setSearchTerm(cleanVal);
      if (matched) {
        setSelectedItem(matched);
        setShowDetailModal(true);
        setScanNotification({
          type: 'success',
          message: `Barang teridentifikasi: "${matched.nama_barang}" (${matched.kode_barang})`,
        });
      } else {
        setScanNotification({
          type: 'info',
          message: `Barcode/QR "${cleanVal}" terbaca. Menampilkan hasil filter katalog...`,
        });
      }
      setTimeout(() => setScanNotification(null), 5000);
    } else if (scannerMode === 'form_barcode') {
      setFormState((prev) => ({ ...prev, barcode: cleanVal }));
      setScanNotification({
        type: 'success',
        message: `Barcode berhasil dimasukkan: ${cleanVal}`,
      });
      setTimeout(() => setScanNotification(null), 4000);
    }
  };

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

    if (file.size > 5 * 1024 * 1024) {
      setModalError('Ukuran foto terlalu besar! Maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setFormState((prev) => ({ ...prev, foto: compressedDataUrl }));
          setModalError('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Katalog Data Barang
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data master inventaris, foto barang, dan kontrol stok minimum.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setScannerMode('search');
              setShowScannerModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl transition-all shadow-xs active:scale-95"
            title="Scan barcode atau QR code fisik untuk mencari barang seketika"
          >
            <Barcode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Scan Barcode / QR</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          {can('manage_inventory') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Barcode Scan Notification Alert (Capsule Pill styling) */}
      {scanNotification && (
        <div className="flex justify-start">
          <PillNotification
            type={scanNotification.type}
            title={scanNotification.type === 'success' ? 'Barcode Berhasil Dipindai' : 'Informasi Scanner'}
            message={scanNotification.message}
            onClose={() => setScanNotification(null)}
            className="w-full max-w-xl"
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode, nama, atau rak..."
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 transition-all"
            />
            <button
              type="button"
              onClick={() => {
                setScannerMode('search');
                setShowScannerModal(true);
              }}
              className="absolute right-2.5 top-2 p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Scan Barcode / QR dengan Kamera"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 transition-all"
          >
            <option value="all">Semua Kategori</option>
            {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
          </select>

          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value)}
            className="px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 transition-all"
          >
            <option value="all">Semua Status Stok</option>
            <option value="aman">Stok Aman</option>
            <option value="kritis">Stok Kritis</option>
            <option value="habis">Stok Habis</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500 transition-all"
          >
            <option value="id_desc">Terbaru</option>
            <option value="stok_asc">Stok Terkecil</option>
            <option value="stok_desc">Stok Terbanyak</option>
            <option value="nama_asc">Nama (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4">Kode / SKU</th>
                <th className="px-6 py-4">Barang &amp; Foto</th>
                <th className="px-6 py-4 text-center">Stok Fisik</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Lokasi Rak</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <Package className="w-12 h-12 text-slate-200" />
                       <p className="text-slate-400 italic">Data barang tidak ditemukan.</p>
                       {barang.length === 0 && (
                         <button onClick={handleRestoreSeedData} className="px-4 py-2 text-[10px] font-bold text-red-600 bg-red-50 rounded-xl border border-red-100">Muat Data Seed</button>
                       )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const kat = kategori.find((k) => k.id === item.kategori_id);
                  const sat = satuan.find((s) => s.id === item.satuan_id);
                  const isKritis = item.stok > 0 && item.stok <= item.stok_min;
                  const isHabis = item.stok === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <button onClick={() => handleOpenDetail(item)} className="hover:text-red-600">{item.kode_barang}</button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                            {item.foto ? <img src={item.foto} className="w-full h-full object-cover" /> : <Package className="w-5 h-5" />}
                          </div>
                          <div>
                            <div onClick={() => handleOpenDetail(item)} className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-red-600">{item.nama_barang}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.model || 'No Model'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black font-mono ${
                          isHabis ? 'bg-red-100 text-red-600' : isKritis ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {item.stok} <span className="text-[9px] font-normal">{sat?.nama_satuan}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{kat?.nama_kategori}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {item.lokasi_rak}</div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          item.kondisi === 'Baik' ? 'bg-emerald-50 text-emerald-600' : item.kondisi === 'Perbaikan' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {item.kondisi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                           <button onClick={() => handleOpenDetail(item)} className="p-1.5 text-slate-400 hover:text-slate-600"><Eye className="w-4 h-4" /></button>
                           {can('manage_inventory') && <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-red-600"><Edit className="w-4 h-4" /></button>}
                           {can('delete_inventory') && (
                             <button onClick={() => setItemToDelete(item)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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

      {/* Modal: Add/Edit */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
               <h3 className="text-base font-black text-slate-900 dark:text-white">{showAddModal ? 'Tambah Barang' : 'Edit Barang'}</h3>
               <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
             </div>
             
             {modalError && (
               <div className="mx-6 mt-4">
                 <PillNotification
                   type="error"
                   title="Validasi Formulir Gagal"
                   message={modalError}
                   onClose={() => setModalError('')}
                 />
               </div>
             )}

             <form onSubmit={showAddModal ? handleSubmitAdd : handleSubmitEdit} className="p-6 space-y-4 overflow-y-auto scrollbar-thin flex-1">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <FormLabel required>Kode Barang</FormLabel>
                      <FormInput type="text" value={formState.kode_barang} onChange={(e) => setFormState({ ...formState, kode_barang: e.target.value.toUpperCase() })} required readOnly={showEditModal} className="bg-slate-50 font-mono uppercase" />
                   </div>
                   <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <FormLabel>Barcode EAN-13</FormLabel>
                        <button
                          type="button"
                          onClick={() => {
                            setScannerMode('form_barcode');
                            setShowScannerModal(true);
                          }}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                          title="Buka kamera untuk scan barcode langsung"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Scan Kamera</span>
                        </button>
                      </div>
                      <div className="relative">
                        <FormInput
                          type="text"
                          value={formState.barcode}
                          onChange={(e) => setFormState({ ...formState, barcode: e.target.value })}
                          placeholder="Contoh: 899100100001"
                          className="font-mono pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setScannerMode('form_barcode');
                            setShowScannerModal(true);
                          }}
                          className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Scan Barcode / QR dengan Kamera"
                        >
                          <Barcode className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                </div>

                <div>
                   <FormLabel required>Nama Barang</FormLabel>
                   <FormInput type="text" required value={formState.nama_barang} onChange={(e) => setFormState({ ...formState, nama_barang: e.target.value })} placeholder="Nama Lengkap Barang" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <FormLabel>Model / Tipe</FormLabel>
                      <FormInput type="text" value={formState.model} onChange={(e) => setFormState({ ...formState, model: e.target.value })} />
                   </div>
                   <div>
                      <FormLabel required>Kategori</FormLabel>
                      <FormSelect value={formState.kategori_id} onChange={(e) => setFormState({ ...formState, kategori_id: Number(e.target.value) })} required>
                        {kategori.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
                      </FormSelect>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <FormLabel required>Satuan</FormLabel>
                      <FormSelect value={formState.satuan_id} onChange={(e) => setFormState({ ...formState, satuan_id: Number(e.target.value) })} required>
                        {satuan.map(s => <option key={s.id} value={s.id}>{s.nama_satuan}</option>)}
                      </FormSelect>
                   </div>
                   <div>
                      <FormLabel required>Lokasi Rak</FormLabel>
                      <FormInput type="text" value={formState.lokasi_rak} onChange={(e) => setFormState({ ...formState, lokasi_rak: e.target.value })} required />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div>
                      <FormLabel required>Stok Awal</FormLabel>
                      <FormInput type="number" min="0" value={formState.stok} onChange={(e) => setFormState({ ...formState, stok: Number(e.target.value) })} required />
                   </div>
                   <div>
                      <FormLabel required>Stok Min</FormLabel>
                      <FormInput type="number" min="0" value={formState.stok_min} onChange={(e) => setFormState({ ...formState, stok_min: Number(e.target.value) })} required />
                   </div>
                   <div>
                      <FormLabel required>Kondisi</FormLabel>
                      <FormSelect value={formState.kondisi} onChange={(e) => setFormState({ ...formState, kondisi: e.target.value as any })} required>
                        <option value="Baik">Baik</option>
                        <option value="Perbaikan">Perbaikan</option>
                        <option value="Rusak">Rusak</option>
                      </FormSelect>
                   </div>
                </div>

                <div>
                   <FormLabel>Deskripsi</FormLabel>
                   <textarea
                     rows={2}
                     value={formState.deskripsi}
                     onChange={(e) => setFormState({ ...formState, deskripsi: e.target.value })}
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-red-500/20 transition-all outline-hidden"
                   />
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                   <FormLabel>Foto Produk</FormLabel>
                   <label className="flex items-center gap-3 cursor-pointer mt-2">
                     <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-600 overflow-hidden shrink-0">
                       {formState.foto ? <img src={formState.foto} className="w-full h-full object-cover" /> : <Camera className="w-5 h-5" />}
                     </div>
                     <span className="text-xs font-bold text-slate-500">{formState.foto ? 'Ganti Foto' : 'Pilih Foto...'}</span>
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                   </label>
                </div>

                <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-95">
                   {showAddModal ? 'Simpan Barang' : 'Perbarui Barang'}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Modal: Detail */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Detail Barang</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
             </div>
             <div className="p-8">
                <div className="flex items-center gap-6 mb-8">
                   <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {selectedItem.foto ? <img src={selectedItem.foto} className="w-full h-full object-cover" /> : <Package className="w-10 h-10 text-slate-200" />}
                   </div>
                   <div>
                      <div className="text-xs font-bold text-red-600 font-mono mb-1">{selectedItem.kode_barang}</div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{selectedItem.nama_barang}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">{kategori.find(k => k.id === selectedItem.kategori_id)?.nama_kategori}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${selectedItem.kondisi === 'Baik' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{selectedItem.kondisi}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stok Fisik</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">{selectedItem.stok} <span className="text-xs font-normal text-slate-500">{satuan.find(s => s.id === selectedItem.satuan_id)?.nama_satuan}</span></div>
                   </div>
                   <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lokasi Rak</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-600" /> {selectedItem.lokasi_rak}</div>
                   </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-950 text-white shadow-xl mb-6">
                   <div className="flex flex-col items-center gap-4">
                      <div className="flex justify-center items-center h-16 space-x-1">
                        {[4, 2, 6, 2, 8, 4, 2, 6, 4, 8, 2, 4, 6, 2, 8, 4, 2, 6, 4, 8, 2, 4].map((h, idx) => (
                          <div key={idx} className="bg-white w-1.5 rounded-full" style={{ height: `${h * 6}px` }} />
                        ))}
                      </div>
                      <div className="font-mono text-sm tracking-[0.3em] font-bold">{selectedItem.barcode || selectedItem.kode_barang}</div>
                   </div>
                </div>

                <button onClick={() => setShowDetailModal(false)} className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-bold rounded-2xl transition-all">Tutup Detail</button>
             </div>
          </div>
        </div>
      )}

       {/* Modal: Confirm Delete */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Hapus Barang?</h3>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed">Apakah Anda yakin ingin menghapus <strong>{itemToDelete.nama_barang}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                 <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-2xl">Batal</button>
                 <button onClick={() => { deleteBarang(itemToDelete.id); setItemToDelete(null); }} className="flex-1 py-3 font-bold text-white bg-red-600 rounded-2xl shadow-lg shadow-red-600/20">Hapus</button>
              </div>
           </div>
        </div>
      )}

      {/* Barcode / QR Code Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScan={handleScan}
        title={
          scannerMode === 'search'
            ? 'Scan Barcode / QR untuk Cari Barang'
            : 'Scan Barcode / QR Produk Baru'
        }
        registeredSerials={
          scannerMode === 'search'
            ? barang
                .map((b) => b.barcode)
                .filter(Boolean) as string[]
            : []
        }
      />
    </div>
  );
};
