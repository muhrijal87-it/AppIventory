import React, { useState, useMemo } from 'react';
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
  Image as ImageIcon,
  Filter,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  Hash,
  Box,
  LayoutGrid,
  List,
  FolderPlus
} from 'lucide-react';
import { Barang, Kategori, Satuan } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { mysql } from '../../db/mysqlEngine';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { PillNotification } from '../common/PillNotification';
import { Pagination } from '../common/Pagination';

// --- Reusable Form Components ---
const FormLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all outline-hidden font-medium placeholder:text-slate-400"
  />
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all outline-hidden cursor-pointer font-bold appearance-none"
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

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

  const handleOpenDetail = (item: Barang) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleScan = (scannedVal: string) => {
    const cleanVal = scannedVal.trim();
    if (!cleanVal) return;

    if (scannerMode === 'search') {
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
      }
    } else if (scannerMode === 'form_barcode') {
      setFormState((prev) => ({ ...prev, barcode: cleanVal }));
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
    lokasi_rak: 'Rak A-1',
    kondisi: 'Baik' as 'Baik' | 'Perbaikan' | 'Rusak',
    deskripsi: '',
    barcode: '',
    model: '',
    serial_number: '',
    foto: '',
  });

  // Filtered and sorted items
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredItems = useMemo(() => {
    return barang.filter((item) => {
      const matchesSearch =
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.lokasi_rak || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesKategori = selectedKategori === 'all' || item.kategori_id === parseInt(selectedKategori, 10);
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
  }, [barang, searchTerm, selectedKategori, selectedStockFilter, sortBy]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset page on search or filter
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedKategori, selectedStockFilter, sortBy]);

  const handleOpenAdd = () => {
    const nextNumber = barang.length > 0 ? Math.max(...barang.map((b) => b.id)) + 1 : 1;
    setFormState({
      kode_barang: `BRG-${String(nextNumber).padStart(3, '0')}`,
      nama_barang: '',
      kategori_id: kategori[0]?.id || 1,
      satuan_id: satuan[0]?.id || 1,
      stok: 0,
      stok_min: 5,
      lokasi_rak: 'Gudang Utama',
      kondisi: 'Baik',
      deskripsi: '',
      barcode: '',
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
      lokasi_rak: item.lokasi_rak || '',
      kondisi: item.kondisi,
      deskripsi: item.deskripsi || '',
      barcode: item.barcode || '',
      model: item.model || '',
      serial_number: item.serial_number || '',
      foto: item.foto || '',
    });
    setModalError('');
    setShowEditModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setFormState((prev) => ({ ...prev, foto: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nama_barang.trim()) {
      setModalError('Nama barang wajib diisi!');
      return;
    }
    addBarang({ ...formState, kategori_id: Number(formState.kategori_id), satuan_id: Number(formState.satuan_id) });
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    updateBarang(selectedItem.id, { ...formState, kategori_id: Number(formState.kategori_id), satuan_id: Number(formState.satuan_id) });
    setShowEditModal(false);
  };

  const exportCSV = () => {
    const headers = ['Kode', 'Nama', 'Kategori', 'Stok', 'Min', 'Rak', 'Kondisi'];
    const rows = filteredItems.map(b => [b.kode_barang, `"${b.nama_barang}"`, kategori.find(k=>k.id===b.kategori_id)?.nama_kategori, b.stok, b.stok_min, b.lokasi_rak, b.kondisi]);
    const content = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(content));
    link.setAttribute('download', `katalog_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <Box className="w-3.5 h-3.5" />
            <span>Inventory Master</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Katalog Barang
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Daftar lengkap aset inventaris operasional. Pantau ketersediaan unit, status kondisi fisik, dan lokasi penyimpanan secara terpusat.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setScannerMode('search'); setShowScannerModal(true); }}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Barcode className="w-4 h-4 text-indigo-500" />
            <span>Scan Unit</span>
          </button>
          
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Ekspor CSV</span>
          </button>

          {can('manage_inventory') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-red-600 hover:bg-slate-800 dark:hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-200 dark:shadow-red-950/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah SKU</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Tools Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row gap-4">
           <div className="relative group flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input
                type="text"
                placeholder="Cari SKU, Nama, atau Rak..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:border-slate-400 transition-all font-medium"
              />
              <button onClick={() => { setScannerMode('search'); setShowScannerModal(true); }} className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-indigo-500 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
           </div>

           <div className="flex flex-wrap items-center gap-2">
              <select value={selectedKategori} onChange={(e) => setSelectedKategori(e.target.value)} className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-hidden cursor-pointer appearance-none min-w-[140px]">
                <option value="all">📁 Semua Kategori</option>
                {kategori.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
              </select>

              <select value={selectedStockFilter} onChange={(e) => setSelectedStockFilter(e.target.value)} className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-hidden cursor-pointer appearance-none min-w-[140px]">
                <option value="all">⚖️ Status Stok</option>
                <option value="aman">Aman</option>
                <option value="kritis">Kritis / Tipis</option>
                <option value="habis">Kosong</option>
              </select>

              <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1 hidden md:block" />

              <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                 <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 shadow-sm text-red-500' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
                 <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-red-500' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-4 h-4" /></button>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Informasi Barang</th>
                  <th className="px-6 py-4 text-center">Stok Fisik</th>
                  <th className="px-6 py-4">Lokasi & Rak</th>
                  <th className="px-6 py-4">Kondisi</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-24 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <Package className="w-12 h-12 text-slate-100 dark:text-slate-800" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Katalog Kosong</p>
                          {barang.length === 0 && <button onClick={handleRestoreSeedData} className="text-[10px] font-black text-red-500 underline underline-offset-4">MUAT DATA DEMO</button>}
                       </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, idx) => {
                    const kat = kategori.find(k => k.id === item.kategori_id);
                    const sat = satuan.find(s => s.id === item.satuan_id);
                    const isKritis = item.stok > 0 && item.stok <= item.stok_min;
                    const isHabis = item.stok === 0;

                    return (
                      <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-5 text-[10px] font-mono text-slate-300 text-center">{idx + 1}</td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-red-200 transition-colors">
                                 {item.foto ? <img src={item.foto} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-200" />}
                              </div>
                              <div className="min-w-0">
                                 <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.kode_barang}</span>
                                    {isHabis && <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[8px] font-black uppercase">Out of Stock</span>}
                                 </div>
                                 <h4 onClick={() => handleOpenDetail(item)} className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5 cursor-pointer hover:text-red-600 transition-colors">{item.nama_barang}</h4>
                                 <p className="text-[10px] text-slate-400 truncate font-medium">{kat?.nama_kategori || 'Tanpa Kategori'} · {item.model || 'No Model'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <div className={`inline-flex flex-col items-center justify-center min-w-[60px] py-1.5 rounded-2xl border tabular-nums ${
                             isHabis ? 'bg-red-50 text-red-600 border-red-100' :
                             isKritis ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             'bg-emerald-50 text-emerald-600 border-emerald-100'
                           }`}>
                              <span className="text-sm font-black">{item.stok}</span>
                              <span className="text-[8px] font-bold uppercase opacity-60">{sat?.nama_satuan || 'Unit'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-red-500 opacity-50" />
                              <span>{item.lokasi_rak || 'Gudang Utama'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                             item.kondisi === 'Baik' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             item.kondisi === 'Rusak' ? 'bg-red-50 text-red-600 border-red-100' :
                             'bg-amber-50 text-amber-600 border-amber-100'
                           }`}>
                             {item.kondisi}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => handleOpenDetail(item)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><Eye className="w-4 h-4" /></button>
                              {can('manage_inventory') && (
                                <>
                                  <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => setItemToDelete(item)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            colorScheme="red"
          />
        </div>
      ) : (
        /* Grid View */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {paginatedItems.map(item => (
               <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-none hover:scale-102 transition-all group">
                  <div className="relative aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-4 overflow-hidden">
                     {item.foto ? <img src={item.foto} className="w-full h-full object-cover" /> : <Package className="w-12 h-12 text-slate-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                     <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase shadow-sm border ${
                          item.kondisi === 'Baik' ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-red-600 border-red-100'
                        }`}>{item.kondisi}</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">{item.kode_barang}</span>
                        <span className={`text-[10px] font-black tabular-nums ${item.stok <= item.stok_min ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>QTY: {item.stok}</span>
                     </div>
                     <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-red-600 transition-colors">{item.nama_barang}</h4>
                     <p className="text-[10px] text-slate-500 truncate font-medium">{item.lokasi_rak || 'Gudang'}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                     <button onClick={() => handleOpenDetail(item)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Details</button>
                     <div className="flex items-center gap-2">
                        {can('manage_inventory') && <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600"><Edit className="w-3.5 h-3.5" /></button>}
                        <button onClick={() => handleOpenDetail(item)} className="p-1.5 bg-slate-900 text-white rounded-lg shadow-md"><ChevronRight className="w-3.5 h-3.5" /></button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredItems.length}
              itemsPerPage={itemsPerPage}
              colorScheme="red"
            />
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col scale-in-95 animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600">
                       <FolderPlus className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 dark:text-white">{showAddModal ? 'Tambah Item Baru' : 'Perbarui Data Barang'}</h3>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Inventory Master Registry</p>
                    </div>
                 </div>
                 <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                 <form onSubmit={showAddModal ? handleSubmitAdd : handleSubmitEdit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <FormLabel required>Kode SKU</FormLabel>
                          <FormInput value={formState.kode_barang} onChange={e => setFormState({...formState, kode_barang: e.target.value.toUpperCase()})} required readOnly={showEditModal} className="font-mono uppercase bg-slate-100 dark:bg-slate-800" />
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center justify-between">
                             <FormLabel>Barcode EAN-13</FormLabel>
                             <button type="button" onClick={() => { setScannerMode('form_barcode'); setShowScannerModal(true); }} className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Scan Kamera</button>
                          </div>
                          <div className="relative">
                             <FormInput value={formState.barcode} onChange={e => setFormState({...formState, barcode: e.target.value})} placeholder="Input manual atau scan..." className="pr-12 font-mono" />
                             <Barcode className="w-4 h-4 absolute right-4 top-3 text-slate-300" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <FormLabel required>Deskripsi Nama Barang</FormLabel>
                       <FormInput value={formState.nama_barang} onChange={e => setFormState({...formState, nama_barang: e.target.value})} required placeholder="Contoh: Laptop ThinkPad X1 Carbon Gen 10" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <FormLabel required>Kategori</FormLabel>
                          <div className="relative">
                             <FormSelect value={formState.kategori_id} onChange={e => setFormState({...formState, kategori_id: Number(e.target.value)})} required>
                                {kategori.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
                             </FormSelect>
                             <ChevronRight className="w-4 h-4 absolute right-4 top-3 text-slate-400 rotate-90 pointer-events-none" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <FormLabel required>Satuan</FormLabel>
                          <div className="relative">
                             <FormSelect value={formState.satuan_id} onChange={e => setFormState({...formState, satuan_id: Number(e.target.value)})} required>
                                {satuan.map(s => <option key={s.id} value={s.id}>{s.nama_satuan}</option>)}
                             </FormSelect>
                             <ChevronRight className="w-4 h-4 absolute right-4 top-3 text-slate-400 rotate-90 pointer-events-none" />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                       <div className="space-y-2">
                          <FormLabel required>Stok Fisik</FormLabel>
                          <input type="number" value={formState.stok} onChange={e => setFormState({...formState, stok: Number(e.target.value)})} className="w-full bg-transparent border-none text-xl font-black tabular-nums text-slate-900 dark:text-white outline-hidden" />
                       </div>
                       <div className="space-y-2">
                          <FormLabel required>Minimal</FormLabel>
                          <input type="number" value={formState.stok_min} onChange={e => setFormState({...formState, stok_min: Number(e.target.value)})} className="w-full bg-transparent border-none text-xl font-black tabular-nums text-red-500 outline-hidden" />
                       </div>
                       <div className="space-y-2">
                          <FormLabel required>Kondisi</FormLabel>
                          <select value={formState.kondisi} onChange={e => setFormState({...formState, kondisi: e.target.value as any})} className="w-full bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 outline-hidden">
                             <option value="Baik">✅ Baik</option>
                             <option value="Perbaikan">🛠️ Perbaikan</option>
                             <option value="Rusak">❌ Rusak</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <FormLabel>Penempatan Rak / Gudang</FormLabel>
                       <div className="relative">
                          <FormInput value={formState.lokasi_rak} onChange={e => setFormState({...formState, lokasi_rak: e.target.value})} placeholder="Contoh: Rak B-2 (Gudang Utama)" className="pl-10" />
                          <MapPin className="w-4 h-4 absolute left-4 top-3 text-red-500 opacity-50" />
                       </div>
                    </div>

                    <div className="p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                       <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                          {formState.foto ? <img src={formState.foto} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-slate-200" />}
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto Visual Unit</p>
                          <label className="mt-2 inline-block px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                             UPLOAD GAMBAR
                             <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                          </label>
                       </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-950/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
                       {showAddModal ? 'Daftarkan Barang Baru' : 'Simpan Perubahan Data'}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-300">
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                 {selectedItem.foto ? <img src={selectedItem.foto} className="w-full h-full object-cover" /> : <Package className="w-16 h-16 text-slate-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                 <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"><X className="w-4 h-4" /></button>
                 <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="px-2 py-1 bg-white/90 dark:bg-slate-900/90 rounded-lg text-[10px] font-black shadow-sm uppercase">{selectedItem.kode_barang}</span>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black shadow-sm uppercase ${selectedItem.kondisi === 'Baik' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{selectedItem.kondisi}</span>
                 </div>
              </div>

              <div className="p-8">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedItem.nama_barang}</h2>
                 <p className="text-sm text-slate-500 font-medium mt-1">{kategori.find(k=>k.id===selectedItem.kategori_id)?.nama_kategori} · {selectedItem.model || 'No Model'}</p>
                 
                 <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stock Level</span>
                       <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{selectedItem.stok} <span className="text-xs font-bold text-slate-400">{satuan.find(s=>s.id===selectedItem.satuan_id)?.nama_satuan}</span></div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Placement</span>
                       <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1"><MapPin className="w-4 h-4 text-red-500" /> {selectedItem.lokasi_rak || 'Gudang Utama'}</div>
                    </div>
                 </div>

                 <div className="mt-8 p-6 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white flex flex-col items-center gap-4">
                    <div className="flex gap-1 h-12">
                       {[5,3,7,2,8,4,6,3,9,2,5,3,7,2,8,4,6,3,9,2].map((h, i) => (
                         <div key={i} className="bg-white/90 w-1 rounded-full self-center" style={{ height: `${h * 4}px` }} />
                       ))}
                    </div>
                    <span className="font-mono text-xs font-bold tracking-[0.4em] opacity-80">{selectedItem.barcode || selectedItem.kode_barang}</span>
                 </div>

                 <div className="mt-8 flex gap-3">
                    {can('manage_inventory') && <button onClick={() => { setShowDetailModal(false); handleOpenEdit(selectedItem); }} className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50">Edit Record</button>}
                    <button onClick={() => setShowDetailModal(false)} className="flex-1 py-3 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:bg-slate-800">Close</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl p-8 text-center scale-in-95 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-6 border border-red-100 dark:border-red-900 shadow-sm">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Hapus SKU?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Anda akan menghapus <strong className="text-slate-900 dark:text-white font-bold italic">"{itemToDelete.nama_barang}"</strong> secara permanen dari database master.</p>
            <div className="mt-8 flex flex-col gap-2">
              <button onClick={() => { deleteBarang(itemToDelete.id); setItemToDelete(null); }} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg shadow-red-950/20 transition-all active:scale-95">HAPUS PERMANEN</button>
              <button onClick={() => setItemToDelete(null)} className="w-full py-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">BATALKAN</button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner */}
      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScan={handleScan}
        title={scannerMode === 'search' ? 'Scan Unit Inventaris' : 'Daftarkan Barcode Baru'}
        registeredSerials={scannerMode === 'search' ? barang.map(b => b.barcode).filter(Boolean) as string[] : []}
      />
    </div>
  );
};
