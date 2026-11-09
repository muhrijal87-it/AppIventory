import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Building,
  Package,
  ArrowRight,
  Eye,
  Camera,
  Trash2,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Boxes,
  Barcode,
  AlertCircle,
  X,
  Printer,
  Clock,
  User,
  Hash,
  Box,
  ChevronRight,
  TrendingUp,
  Building2,
  ArrowLeftRight,
  ExternalLink
} from 'lucide-react';
import { TransaksiKeluar } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { PillNotification } from '../common/PillNotification';
import { Pagination } from '../common/Pagination';

interface PerpindahanBarangViewProps {
  onNavigate?: (view: string) => void;
}

const FormLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all outline-hidden font-medium"
  />
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all outline-hidden cursor-pointer font-bold appearance-none"
  />
);

export const PerpindahanBarangView: React.FC<PerpindahanBarangViewProps> = ({ onNavigate }) => {
  const { transaksiKeluar, barang, departemen: masterDepartemen, addTransaksiKeluar } = useInventory();
  const { user, users, can } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSuratJalan, setSelectedSuratJalan] = useState<TransaksiKeluar | null>(null);
  const [viewingImage, setViewingImage] = useState<{ title: string; url: string } | null>(null);
  const [validationError, setValidationError] = useState('');

  // Form State
  const [noTransaksi, setNoTransaksi] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [penerima, setPenerima] = useState('');
  const [departemen, setDepartemen] = useState('');
  const [barangId, setBarangId] = useState<number>(1);
  const [jumlah, setJumlah] = useState<number>(1);
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [fotoBukti, setFotoBukti] = useState<string>('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'search' | 'barang' | 'serial'>('serial');

  const departemenList = useMemo(() => masterDepartemen?.map(d => d.nama_departemen) || [], [masterDepartemen]);

  const handleOpenAdd = () => {
    const nextSeq = transaksiKeluar.length + 1;
    const today = new Date();
    const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '');
    setNoTransaksi(`TRF-${yyyymm}-${String(nextSeq).padStart(3, '0')}`);
    setTanggal(new Date().toISOString().slice(0, 10));
    setPenerima('');
    setDepartemen(departemenList[0] || 'Operasional');
    setBarangId(barang[0]?.id || 1);
    setJumlah(1);
    setModel(barang[0]?.model || '');
    setSerialNumber('');
    setKeperluan('Serah terima unit operasional antar divisi');
    setFotoBukti('');
    setValidationError('');
    setShowAddModal(true);
  };

  const handleBarangChange = (id: number) => {
    setBarangId(id);
    const target = barang.find(b => b.id === id);
    if (target) {
      setModel(target.model || '');
      setSerialNumber('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setFotoBukti(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!penerima.trim()) {
      setValidationError('Penerima wajib diisi!');
      return;
    }
    const res = addTransaksiKeluar({
      no_transaksi: noTransaksi,
      tanggal,
      penerima,
      departemen,
      barang_id: Number(barangId),
      jumlah: Number(jumlah),
      model: model.trim(),
      serial_number: serialNumber.trim(),
      keperluan,
      petugas_id: user ? user.id : 1,
      foto_bukti: fotoBukti || undefined,
    });
    if (res.success) setShowAddModal(false);
    else setValidationError(res.message);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return transaksiKeluar.filter(t => t.no_transaksi.startsWith('TRF-')).filter((t) => {
      const itm = barang.find(b => b.id === t.barang_id);
      const matchesSearch = t.no_transaksi.toLowerCase().includes(s) || t.penerima.toLowerCase().includes(s) || (itm && itm.nama_barang.toLowerCase().includes(s));
      const matchesDept = selectedDeptFilter === 'all' || t.departemen === selectedDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [transaksiKeluar, searchTerm, selectedDeptFilter, barang]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset page on search or filter
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDeptFilter]);

  const stats = useMemo(() => ({
    count: filteredData.length,
    units: filteredData.reduce((a, b) => a + b.jumlah, 0),
    depts: new Set(filteredData.map(t => t.departemen)).size
  }), [filteredData]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Asset Redistribution</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Perpindahan Barang
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Monitor perpindahan aset antar departemen dan unit kerja. Pastikan berita acara serah terima terdokumentasi dengan bukti visual yang valid.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setScannerMode('search'); setShowQRScanner(true); }}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Barcode className="w-4 h-4 text-purple-500" />
            <span>Scan Berita Acara</span>
          </button>
          
          {can('manage_inventory') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-purple-600 hover:bg-slate-800 dark:hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-200 dark:shadow-purple-950/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Input Perpindahan</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Surat Perpindahan', value: stats.count, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
          { label: 'Volume Berpindah', value: stats.units, icon: Boxes, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
          { label: 'Departemen Terlibat', value: stats.depts, icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-5">
            <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>
              <m.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative group flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari Dokumen, Penerima, atau Barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:border-purple-400 transition-all font-medium"
            />
         </div>
         <select value={selectedDeptFilter} onChange={e => setSelectedDeptFilter(e.target.value)} className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-hidden cursor-pointer appearance-none min-w-[160px]">
            <option value="all">📍 Semua Tujuan</option>
            {departemenList.map(d => <option key={d} value={d}>{d}</option>)}
         </select>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Dokumen Perpindahan</th>
                <th className="px-6 py-4">Item Berpindah</th>
                <th className="px-6 py-4">Alur (Dari ➔ Ke)</th>
                <th className="px-6 py-4">Penerima (PIC)</th>
                <th className="px-6 py-4 text-right">Volume</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-24 text-center text-slate-400 italic">Belum ada rekaman perpindahan barang.</td>
                </tr>
              ) : (
                paginatedData.map((trx) => {
                  const itm = barang.find(b => b.id === trx.barang_id);
                  return (
                    <tr key={trx.id} className="group hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className="font-mono text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{trx.no_transaksi}</span>
                            <span className="text-[10px] text-slate-400 mt-1 font-medium">{trx.tanggal}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">{itm?.nama_barang}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">{itm?.kode_barang}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-300 uppercase">Gudang</span>
                            <ArrowRight className="w-3 h-3 text-purple-400 opacity-50" />
                            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">{trx.departemen}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                               <User className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{trx.penerima}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black tabular-nums text-purple-600 text-sm">
                         {trx.jumlah}
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="flex items-center justify-center gap-2">
                            {trx.foto_bukti && (
                               <button onClick={() => setViewingImage({ title: `Bukti ${trx.no_transaksi}`, url: trx.foto_bukti! })} className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                                  <ImageIcon className="w-4 h-4" />
                               </button>
                            )}
                            <button onClick={() => setSelectedSuratJalan(trx)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><Printer className="w-4 h-4" /></button>
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
          colorScheme="purple"
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col scale-in-95 animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600">
                       <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 dark:text-white">Formulir Perpindahan</h3>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Alur Distribusi Internal</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                 {validationError && (
                   <div className="mb-6">
                      <PillNotification type="error" title="Input Gagal" message={validationError} onClose={() => setValidationError('')} />
                   </div>
                 )}

                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <FormLabel required>No. Dokumen</FormLabel>
                          <FormInput value={noTransaksi} readOnly className="font-mono bg-slate-100 dark:bg-slate-800" />
                       </div>
                       <div className="space-y-2">
                          <FormLabel required>Tanggal Mutasi</FormLabel>
                          <FormInput type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex items-center justify-between mb-1.5">
                          <FormLabel required>Barang yang Dipindahkan</FormLabel>
                          <button type="button" onClick={() => { setScannerMode('barang'); setShowQRScanner(true); }} className="text-[10px] font-black text-purple-600 uppercase tracking-tighter">Scan Unit</button>
                       </div>
                       <FormSelect value={barangId} onChange={(e) => handleBarangChange(Number(e.target.value))} required>
                          {barang.map(b => <option key={b.id} value={b.id}>{b.nama_barang} · {b.kode_barang}</option>)}
                       </FormSelect>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <FormLabel required>Penerima / PIC</FormLabel>
                          <FormInput value={penerima} onChange={e => setPenerima(e.target.value)} required placeholder="Nama Lengkap" />
                       </div>
                       <div className="space-y-2">
                          <FormLabel required>Ke Departemen</FormLabel>
                          <FormSelect value={departemen} onChange={e => setDepartemen(e.target.value)} required>
                             {departemenList.map(d => <option key={d} value={d}>{d}</option>)}
                          </FormSelect>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <FormLabel required>Jumlah Unit</FormLabel>
                          <FormInput type="number" min="1" value={jumlah} onChange={e => setJumlah(Number(e.target.value))} required className="font-black text-lg text-purple-600 tabular-nums" />
                       </div>
                       <div className="space-y-2">
                          <FormLabel>Model / Serial</FormLabel>
                          <FormInput value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Opsional SN..." className="font-mono" />
                       </div>
                    </div>

                    <div className="p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 bg-purple-50/10">
                       <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                          {fotoBukti ? <img src={fotoBukti} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-purple-200" />}
                       </div>
                       <label className="mt-2 inline-block px-4 py-2 bg-purple-600 text-white text-[10px] font-black rounded-xl cursor-pointer hover:bg-purple-700 transition-all shadow-md">
                          UNGGAH BUKTI SERAH TERIMA
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                       </label>
                    </div>

                    <button type="submit" className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl shadow-xl shadow-purple-950/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
                       Simpan Berita Acara
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Print View Modal */}
      {selectedSuratJalan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col scale-in-95 animate-in zoom-in-95 duration-300">
              <div className="p-10 space-y-8 bg-white text-slate-900 min-h-[600px] overflow-y-auto">
                 <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                    <div>
                       <h1 className="text-2xl font-black uppercase tracking-tighter">Berita Acara Perpindahan</h1>
                       <p className="font-mono text-sm text-slate-500">{selectedSuratJalan.no_transaksi}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-xs">Logistik & Inventory Division</p>
                       <p className="text-xs">{selectedSuratJalan.tanggal}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-12 text-sm">
                    <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dari:</p>
                       <div className="font-bold">GUDANG UTAMA</div>
                       <p className="text-xs text-slate-500 leading-relaxed italic">Unit pengelola persediaan pusat (Central Inventory Management).</p>
                    </div>
                    <div className="space-y-4 p-5 bg-purple-50 rounded-2xl border border-purple-100">
                       <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Tujuan:</p>
                       <div className="font-bold text-purple-700">{selectedSuratJalan.departemen.toUpperCase()}</div>
                       <div className="text-xs font-medium">Penerima: {selectedSuratJalan.penerima}</div>
                    </div>
                 </div>

                 <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                       <thead className="bg-slate-900 text-white">
                          <tr>
                             <th className="px-6 py-3 text-left font-black uppercase text-[10px]">Detail Barang</th>
                             <th className="px-6 py-3 text-right font-black uppercase text-[10px]">Volume</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          <tr>
                             <td className="px-6 py-4">
                                <div className="font-bold">{barang.find(b=>b.id===selectedSuratJalan.barang_id)?.nama_barang}</div>
                                <div className="text-[11px] text-slate-500 font-mono mt-1">{barang.find(b=>b.id===selectedSuratJalan.barang_id)?.kode_barang} {selectedSuratJalan.serial_number && ` · SN: ${selectedSuratJalan.serial_number}`}</div>
                             </td>
                             <td className="px-6 py-4 text-right font-black text-lg">{selectedSuratJalan.jumlah} <span className="text-xs font-medium text-slate-400">Unit</span></td>
                          </tr>
                       </tbody>
                    </table>
                 </div>

                 <div className="grid grid-cols-2 gap-12 pt-12 text-center text-xs">
                    <div className="space-y-16">
                       <p className="font-bold uppercase tracking-widest text-slate-400">Pihak Pengirim</p>
                       <div className="border-t border-slate-900 pt-2 font-black uppercase">( Admin Gudang )</div>
                    </div>
                    <div className="space-y-16">
                       <p className="font-bold uppercase tracking-widest text-slate-400">Pihak Penerima</p>
                       <div className="border-t border-slate-900 pt-2 font-black uppercase">( {selectedSuratJalan.penerima} )</div>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-4">
                 <button onClick={() => setSelectedSuratJalan(null)} className="flex-1 py-3 font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] uppercase tracking-widest transition-all">Tutup Dokumen</button>
                 <button onClick={() => window.print()} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" />
                    <span>Cetak Surat Jalan</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Lightbox */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingImage(null)} className="absolute -top-14 right-0 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
               <X className="w-6 h-6" />
            </button>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10">
               <img src={viewingImage.url} alt={viewingImage.title} className="max-h-[75vh] w-auto rounded-2xl" />
               <div className="p-5 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                     <ImageIcon className="w-5 h-5 text-purple-500" />
                     <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{viewingImage.title}</span>
                  </div>
                  <button onClick={() => window.open(viewingImage.url)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><ExternalLink className="w-4 h-4 text-slate-400" /></button>
               </div>
            </div>
          </div>
        </div>
      )}

      <BarcodeScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={(v) => {
          const val = v.trim();
          if (scannerMode === 'barang') {
            const m = barang.find(b => (b.barcode && b.barcode === val) || b.kode_barang === val);
            if (m) handleBarangChange(m.id);
          } else if (scannerMode === 'serial') {
            setSerialNumber(prev => prev ? `${prev}, ${val}` : val);
          } else {
            setSearchTerm(val);
          }
        }}
        title="Distribution Scanner"
        registeredSerials={barang.map(b=>b.barcode).filter(Boolean) as string[]}
      />
    </div>
  );
};
