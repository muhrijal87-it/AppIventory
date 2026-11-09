import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Ruler,
  Truck,
  Plus,
  Edit,
  Trash2,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  FolderPlus,
  UserCheck,
  Building,
  Search,
  Filter,
  ArrowRight,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  Info,
  Hash,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Kategori, Satuan, Supplier, Departemen } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { Pagination } from '../common/Pagination';

export const MasterDataView: React.FC<{ initialTab?: 'kategori' | 'satuan' | 'supplier' | 'departemen' }> = ({
  initialTab = 'kategori',
}) => {
  const {
    kategori,
    satuan,
    supplier,
    departemen,
    barang,
    transaksiKeluar,
    addKategori,
    updateKategori,
    deleteKategori,
    addSatuan,
    updateSatuan,
    deleteSatuan,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addDepartemen,
    updateDepartemen,
    deleteDepartemen,
  } = useInventory();
  const { can } = useAuth();

  const [activeTab, setActiveTab] = useState<'kategori' | 'satuan' | 'supplier' | 'departemen'>(
    initialTab || 'kategori'
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Sync active tab if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Modals & Form States
  const [showKatModal, setShowKatModal] = useState(false);
  const [editingKat, setEditingKat] = useState<Kategori | null>(null);
  const [katKode, setKatKode] = useState('');
  const [katNama, setKatNama] = useState('');
  const [katDeskripsi, setKatDeskripsi] = useState('');

  const [showSatModal, setShowSatModal] = useState(false);
  const [editingSat, setEditingSat] = useState<Satuan | null>(null);
  const [satKode, setSatKode] = useState('');
  const [satNama, setSatNama] = useState('');

  const [showSupModal, setShowSupModal] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [supKode, setSupKode] = useState('');
  const [supNama, setSupNama] = useState('');
  const [supPic, setSupPic] = useState('');
  const [supTelp, setSupTelp] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAlamat, setSupAlamat] = useState('');

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Departemen | null>(null);
  const [deptKode, setDeptKode] = useState('');
  const [deptNama, setDeptNama] = useState('');
  const [deptPic, setDeptPic] = useState('');
  const [deptLokasi, setDeptLokasi] = useState('');
  const [deptKeterangan, setDeptKeterangan] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'kategori' | 'satuan' | 'supplier' | 'departemen';
    id: number;
    title: string;
  } | null>(null);

  const handleExecuteDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'kategori') deleteKategori(deleteConfirm.id);
    else if (deleteConfirm.type === 'satuan') deleteSatuan(deleteConfirm.id);
    else if (deleteConfirm.type === 'supplier') deleteSupplier(deleteConfirm.id);
    else if (deleteConfirm.type === 'departemen') deleteDepartemen(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  // Handlers for Add/Edit
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

  const openAddDepartemen = () => {
    setEditingDept(null);
    const seq = (departemen?.length || 0) + 1;
    setDeptKode(`DPT-${String(seq).padStart(2, '0')}`);
    setDeptNama('');
    setDeptPic('');
    setDeptLokasi('');
    setDeptKeterangan('');
    setShowDeptModal(true);
  };

  const openEditDepartemen = (d: Departemen) => {
    setEditingDept(d);
    setDeptKode(d.kode_departemen);
    setDeptNama(d.nama_departemen);
    setDeptPic(d.penanggung_jawab || '');
    setDeptLokasi(d.lokasi_gedung || '');
    setDeptKeterangan(d.keterangan || '');
    setShowDeptModal(true);
  };

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

  // Submit Handlers
  const handleKatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKat) updateKategori(editingKat.id, { kode_kategori: katKode.toUpperCase(), nama_kategori: katNama, deskripsi: katDeskripsi });
    else addKategori({ kode_kategori: katKode.toUpperCase(), nama_kategori: katNama, deskripsi: katDeskripsi });
    setShowKatModal(false);
  };

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { kode_departemen: deptKode.toUpperCase(), nama_departemen: deptNama, penanggung_jawab: deptPic, lokasi_gedung: deptLokasi, keterangan: deptKeterangan };
    if (editingDept) updateDepartemen(editingDept.id, data);
    else addDepartemen(data);
    setShowDeptModal(false);
  };

  const handleSatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSat) updateSatuan(editingSat.id, { kode_satuan: satKode.toUpperCase(), nama_satuan: satNama });
    else addSatuan({ kode_satuan: satKode.toUpperCase(), nama_satuan: satNama });
    setShowSatModal(false);
  };

  const handleSupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { kode_supplier: supKode.toUpperCase(), nama_supplier: supNama, kontak_pic: supPic, no_telepon: supTelp, email: supEmail, alamat: supAlamat };
    if (editingSup) updateSupplier(editingSup.id, data);
    else addSupplier(data);
    setShowSupModal(false);
  };

  // Filtered Data Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (activeTab === 'kategori') return kategori.filter(k => k.nama_kategori.toLowerCase().includes(s) || k.kode_kategori.toLowerCase().includes(s));
    if (activeTab === 'departemen') return (departemen || []).filter(d => d.nama_departemen.toLowerCase().includes(s) || d.kode_departemen.toLowerCase().includes(s));
    if (activeTab === 'satuan') return satuan.filter(s_ => s_.nama_satuan.toLowerCase().includes(s) || s_.kode_satuan.toLowerCase().includes(s));
    if (activeTab === 'supplier') return supplier.filter(sup => sup.nama_supplier.toLowerCase().includes(s) || sup.kode_supplier.toLowerCase().includes(s));
    return [];
  }, [activeTab, searchTerm, kategori, departemen, satuan, supplier]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset page on search or tab change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <Building className="w-3.5 h-3.5" />
            <span>Master Registry</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Master Data System
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Kelola data referensi utama aplikasi untuk memastikan konsistensi inventaris, alur distribusi, dan manajemen pemasok.
          </p>
        </div>

        {can('manage_master_data') && (
          <button
            onClick={() => {
              if (activeTab === 'kategori') openAddKategori();
              else if (activeTab === 'departemen') openAddDepartemen();
              else if (activeTab === 'satuan') openAddSatuan();
              else if (activeTab === 'supplier') openAddSupplier();
            }}
            className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-red-600 hover:bg-slate-800 dark:hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-200 dark:shadow-red-950/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Tambah Data {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          </button>
        )}
      </div>

      {/* Navigation & Search Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
          {[
            { id: 'kategori', label: 'Kategori Barang', icon: Layers, count: kategori.length },
            { id: 'departemen', label: 'Departemen / Divisi', icon: Building2, count: (departemen || []).length },
            { id: 'satuan', label: 'Satuan Unit', icon: Ruler, count: satuan.length },
            { id: 'supplier', label: 'Pemasok / Supplier', icon: Truck, count: supplier.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchTerm('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-w-fit ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-red-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                activeTab === tab.id ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white dark:bg-slate-900">
          <div className="relative group max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <input
              type="text"
              placeholder={`Cari data ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all outline-hidden placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Main Content Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Informasi Utama</th>
                {activeTab === 'kategori' && <th className="px-6 py-4">Deskripsi</th>}
                {activeTab === 'departemen' && (
                  <>
                    <th className="px-6 py-4">Lokasi & PIC</th>
                    <th className="px-6 py-4 text-center">Aktivitas</th>
                  </>
                )}
                {activeTab === 'supplier' && (
                  <>
                    <th className="px-6 py-4">Kontak & PIC</th>
                    <th className="px-6 py-4">Alamat</th>
                  </>
                )}
                {(activeTab === 'kategori' || activeTab === 'satuan') && <th className="px-6 py-4 text-center">Relasi Barang</th>}
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-400">Data Tidak Ditemukan</p>
                        <p className="text-xs text-slate-500">Tidak ada data {activeTab} yang sesuai dengan pencarian Anda.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const actualIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                  const itemCount = (activeTab === 'kategori' || activeTab === 'satuan') 
                    ? barang.filter(b => (activeTab === 'kategori' ? b.kategori_id : b.satuan_id) === item.id).length 
                    : 0;
                  const usageCount = activeTab === 'departemen' 
                    ? transaksiKeluar.filter(t => t.departemen === (item as Departemen).nama_departemen).length 
                    : 0;

                  return (
                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-5 text-[10px] font-mono text-slate-400 text-center">{actualIdx}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 ${
                            activeTab === 'kategori' ? 'bg-orange-50 text-orange-500' :
                            activeTab === 'departemen' ? 'bg-purple-50 text-purple-500' :
                            activeTab === 'satuan' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                          }`}>
                            {activeTab === 'kategori' ? <Layers className="w-4 h-4" /> :
                             activeTab === 'departemen' ? <Building2 className="w-4 h-4" /> :
                             activeTab === 'satuan' ? <Ruler className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                              {(item as any).nama_kategori || (item as any).nama_departemen || (item as any).nama_satuan || (item as any).nama_supplier}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">
                              {(item as any).kode_kategori || (item as any).kode_departemen || (item as any).kode_satuan || (item as any).kode_supplier}
                            </div>
                          </div>
                        </div>
                      </td>

                      {activeTab === 'kategori' && (
                        <td className="px-6 py-5 max-w-sm">
                          <p className="text-[11px] text-slate-500 italic leading-relaxed line-clamp-2">{(item as any).deskripsi || 'Tidak ada deskripsi.'}</p>
                        </td>
                      )}

                      {activeTab === 'departemen' && (
                        <>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                <UserCheck className="w-3 h-3 text-slate-400" />
                                <span>{(item as Departemen).penanggung_jawab || '-'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono italic">
                                <MapPin className="w-3 h-3" />
                                <span>{(item as Departemen).lokasi_gedung || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums ${usageCount > 0 ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900' : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                              {usageCount} TRF
                            </span>
                          </td>
                        </>
                      )}

                      {activeTab === 'supplier' && (
                        <>
                          <td className="px-6 py-5">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                                <UserCheck className="w-3 h-3 text-slate-400" />
                                <span>{(item as Supplier).kontak_pic}</span>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                  <Phone className="w-3 h-3" />
                                  <span>{(item as Supplier).no_telepon}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                  <Mail className="w-3 h-3" />
                                  <span>{(item as Supplier).email}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 max-w-xs">
                            <p className="text-[11px] text-slate-500 leading-tight">{(item as Supplier).alamat}</p>
                          </td>
                        </>
                      )}

                      {(activeTab === 'kategori' || activeTab === 'satuan') && (
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <span className="text-[11px] font-black tabular-nums text-slate-700 dark:text-slate-300">{itemCount}</span>
                             <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">SKU</span>
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1.5">
                          {can('manage_master_data') && (
                            <button
                              onClick={() => {
                                if (activeTab === 'kategori') openEditKategori(item as Kategori);
                                else if (activeTab === 'departemen') openEditDepartemen(item as Departemen);
                                else if (activeTab === 'satuan') openEditSatuan(item as Satuan);
                                else if (activeTab === 'supplier') openEditSupplier(item as Supplier);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
                              title="Sunting Data"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {can('delete_master_data') && (
                            <button
                              onClick={() => setDeleteConfirm({ 
                                type: activeTab, 
                                id: item.id, 
                                title: (item as any).nama_kategori || (item as any).nama_departemen || (item as any).nama_satuan || (item as any).nama_supplier 
                              })}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          colorScheme="red"
        />
      </div>

      {/* Info Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl flex gap-5">
           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
             <Info className="w-6 h-6 text-red-500" />
           </div>
           <div>
             <h4 className="font-bold text-sm">Integritas Master Data</h4>
             <p className="text-xs text-slate-400 mt-1 leading-relaxed">
               Data master adalah pondasi aplikasi. Pastikan Kategori, Departemen, dan Satuan Unit diisi dengan benar sebelum melakukan input transaksi barang untuk mencegah redundansi.
             </p>
           </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex gap-5">
           <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
             <ExternalLink className="w-6 h-6 text-slate-600 dark:text-slate-400" />
           </div>
           <div>
             <h4 className="font-bold text-sm text-slate-900 dark:text-white">Relasi & Ketergantungan</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
               Beberapa data master tidak dapat dihapus jika masih memiliki relasi aktif pada tabel transaksi atau katalog barang guna menjaga integritas referensi database (Foreign Key Constraint).
             </p>
           </div>
        </div>
      </div>

      {/* Forms & Modals (Restyled) */}
      {(showKatModal || showDeptModal || showSatModal || showSupModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {showKatModal ? 'Kategori Barang' : showDeptModal ? 'Departemen / Divisi' : showSatModal ? 'Satuan Unit' : 'Data Pemasok'}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Entri Data Referensi</p>
                </div>
              </div>
              <button onClick={() => { setShowKatModal(false); setShowDeptModal(false); setShowSatModal(false); setShowSupModal(false); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {showKatModal && (
                <form onSubmit={handleKatSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kode Kategori</label>
                    <input type="text" required value={katKode} onChange={e => setKatKode(e.target.value)} className="w-full px-4 py-2.5 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Kategori</label>
                    <input type="text" required value={katNama} onChange={e => setKatNama(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Deskripsi</label>
                    <textarea rows={3} value={katDeskripsi} onChange={e => setKatDeskripsi(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none" />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowKatModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">Batal</button>
                    <button type="submit" className="flex-[2] px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/20 active:scale-95 transition-all">Simpan Kategori</button>
                  </div>
                </form>
              )}

              {showDeptModal && (
                <form onSubmit={handleDeptSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kode Dept</label>
                    <input type="text" required value={deptKode} onChange={e => setDeptKode(e.target.value)} className="w-full px-4 py-2.5 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Departemen</label>
                    <input type="text" required value={deptNama} onChange={e => setDeptNama(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">PIC</label>
                      <input type="text" value={deptPic} onChange={e => setDeptPic(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lokasi</label>
                      <input type="text" value={deptLokasi} onChange={e => setDeptLokasi(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden" />
                    </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowDeptModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">Batal</button>
                    <button type="submit" className="flex-[2] px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/20 active:scale-95 transition-all">Simpan Departemen</button>
                  </div>
                </form>
              )}

              {showSatModal && (
                <form onSubmit={handleSatSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kode Satuan</label>
                    <input type="text" required value={satKode} onChange={e => setSatKode(e.target.value)} placeholder="Misal: PCS" className="w-full px-4 py-2.5 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Satuan</label>
                    <input type="text" required value={satNama} onChange={e => setSatNama(e.target.value)} placeholder="Misal: Pieces" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all" />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowSatModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">Batal</button>
                    <button type="submit" className="flex-[2] px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/20 active:scale-95 transition-all">Simpan Satuan</button>
                  </div>
                </form>
              )}

              {showSupModal && (
                <form onSubmit={handleSupSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kode</label>
                      <input type="text" required value={supKode} onChange={e => setSupKode(e.target.value)} className="w-full px-4 py-2.5 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Perusahaan</label>
                      <input type="text" required value={supNama} onChange={e => setSupNama(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kontak PIC</label>
                      <input type="text" value={supPic} onChange={e => setSupPic(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Telepon</label>
                      <input type="text" value={supTelp} onChange={e => setSupTelp(e.target.value)} className="w-full px-4 py-2.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                    <input type="email" value={supEmail} onChange={e => setSupEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Alamat</label>
                    <textarea rows={2} value={supAlamat} onChange={e => setSupAlamat(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden resize-none" />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowSupModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">Batal</button>
                    <button type="submit" className="flex-[2] px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/20 active:scale-95 transition-all">Simpan Pemasok</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl p-8 text-center scale-in-95 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-6 border border-red-100 dark:border-red-900 shadow-sm">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Hapus Data Terseleksi?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Anda akan menghapus <strong className="text-slate-900 dark:text-white font-bold italic">"{deleteConfirm.title}"</strong>. Tindakan ini tidak dapat dibatalkan jika data telah dihapus dari MySQL.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg shadow-red-950/20 transition-all active:scale-95"
              >
                Konfirmasi Hapus
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="w-full py-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
