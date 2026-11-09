import React, { useState, useMemo } from 'react';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { PillNotification } from '../common/PillNotification';
import { CenteredAlertModal } from '../common/CenteredAlertModal';
import { Pagination } from '../common/Pagination';
import {
  ArrowUpFromLine,
  Plus,
  Search,
  Printer,
  X,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Eye,
  Camera,
  CheckCircle2,
  Barcode,
  ArrowRightLeft,
  Package,
  RotateCcw,
  Edit,
  Undo2,
  ExternalLink,
  Clock,
  User,
  Hash,
  Box,
  ChevronRight,
  TrendingUp,
  FileText,
  Building
} from 'lucide-react';
import { TransaksiKeluar } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

interface TransaksiKeluarViewProps {
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
    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all outline-hidden font-medium"
  />
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all outline-hidden cursor-pointer font-bold appearance-none"
  />
);

export const TransaksiKeluarView: React.FC<TransaksiKeluarViewProps> = ({ onNavigate }) => {
  const { transaksiKeluar, barang, departemen: masterDepartemen, addTransaksiKeluar, updateTransaksiKeluar, recallTransaksiKeluar } = useInventory();
  const { user, users, can } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<TransaksiKeluar | null>(null);
  const [selectedDO, setSelectedDO] = useState<TransaksiKeluar | null>(null);
  const [validationError, setValidationError] = useState('');
  const [viewingImage, setViewingImage] = useState<{ title: string; url: string } | null>(null);

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
  const [scannerMode, setScannerMode] = useState<'serial' | 'barang' | 'search'>('serial');
  const [successModalMessage, setSuccessModalMessage] = useState<string | null>(null);

  const [recallModalItem, setRecallModalItem] = useState<TransaksiKeluar | null>(null);
  const [recallReason, setRecallReason] = useState('');
  const [recallCondition, setRecallCondition] = useState<'Baik' | 'Perbaikan' | 'Rusak'>('Baik');

  const departemenList = useMemo(() => masterDepartemen?.map(d => d.nama_departemen) || [], [masterDepartemen]);

  const issuedSerialsMap = useMemo(() => {
    const map: Record<string, any> = {};
    transaksiKeluar.forEach((t) => {
      if (t.serial_number && !t.no_transaksi.startsWith('TRF-')) {
        const sns = t.serial_number.split(/[,;\n]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
        sns.forEach(sn => map[sn] = t);
      }
    });
    return map;
  }, [transaksiKeluar]);

  const handleOpenAdd = () => {
    const nextSeq = transaksiKeluar.length + 1;
    const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '');
    setNoTransaksi(`OUT-${yyyymm}-${String(nextSeq).padStart(3, '0')}`);
    setTanggal(new Date().toISOString().slice(0, 10));
    setPenerima('');
    setDepartemen(departemenList[0] || 'Operasional');
    setBarangId(barang[0]?.id || 1);
    setJumlah(1);
    setModel(barang[0]?.model || '');
    setSerialNumber('');
    setKeperluan('Kebutuhan operasional unit');
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
    const targetItem = barang.find(b => b.id === Number(barangId));
    if (!targetItem || targetItem.stok < jumlah) {
      setValidationError('Stok tidak mencukupi!');
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
    if (res.success) {
      setShowAddModal(false);
      setSuccessModalMessage(`Distribusi ${noTransaksi} berhasil dicatat.`);
    } else {
      setValidationError(res.message);
    }
  };

  const handleExecuteRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallModalItem || !recallReason.trim()) return;
    const res = recallTransaksiKeluar(recallModalItem.id, recallReason, recallCondition);
    if (res.success) setRecallModalItem(null);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredTransactions = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return transaksiKeluar.filter(t => !t.no_transaksi.startsWith('TRF-')).filter(t => {
      const itm = barang.find(b => b.id === t.barang_id);
      return t.no_transaksi.toLowerCase().includes(s) || t.penerima.toLowerCase().includes(s) || (itm && itm.nama_barang.toLowerCase().includes(s));
    });
  }, [transaksiKeluar, searchTerm, barang]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Reset page on search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>Outbound Logistics</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Barang Keluar (Out)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Kelola distribusi unit ke departemen kerja. Pantau sisa stok dan validasi Serial Number unit operasional.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setScannerMode('search'); setShowQRScanner(true); }}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-orange-700 dark:text-orange-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Barcode className="w-4 h-4 text-orange-500" />
            <span>Scan DO</span>
          </button>
          
          {can('manage_inventory') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-200 dark:shadow-orange-950/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Input Barang Keluar</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative group flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari No. DO, Penerima, atau Barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:border-orange-400 transition-all font-medium"
            />
         </div>
         <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest px-4 border-l border-slate-100 dark:border-slate-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Latest Issue: {transaksiKeluar.find(t=>!t.no_transaksi.startsWith('TRF-'))?.tanggal || '-'}</span>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">No. Transaksi</th>
                <th className="px-6 py-4">Penerima & Divisi</th>
                <th className="px-6 py-4">Barang Distribusi</th>
                <th className="px-6 py-4 text-right">Volume</th>
                <th className="px-6 py-4 text-center">Berkas</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-24 text-center text-slate-400 italic">Belum ada rekaman transaksi keluar.</td>
                </tr>
              ) : (
                paginatedTransactions.map((trx) => {
                  const itm = barang.find(b => b.id === trx.barang_id);
                  const petugas = users.find(u => u.id === trx.petugas_id);

                  return (
                    <tr key={trx.id} className="group hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className="font-mono text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{trx.no_transaksi}</span>
                            <span className="text-[10px] text-slate-400 mt-1 font-medium italic">{trx.tanggal}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{trx.penerima}</span>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-medium">
                               <Building className="w-3 h-3" />
                               <span>{trx.departemen}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">{itm?.nama_barang}</span>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-mono text-slate-400 uppercase">{itm?.kode_barang}</span>
                               {trx.serial_number && <span className="text-[9px] font-black bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 uppercase">SN Locked</span>}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black tabular-nums text-orange-600 text-sm">
                         -{trx.jumlah}
                      </td>
                      <td className="px-6 py-5 text-center">
                         {trx.foto_bukti ? (
                           <button onClick={() => setViewingImage({ title: `Bukti ${trx.no_transaksi}`, url: trx.foto_bukti! })} className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 hover:scale-110 transition-all">
                              <ImageIcon className="w-4 h-4" />
                           </button>
                         ) : <span className="text-[10px] text-slate-300 italic">No File</span>}
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setSelectedDO(trx)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><Printer className="w-4 h-4" /></button>
                            <button onClick={() => { setRecallModalItem(trx); setRecallReason(''); }} className="p-2 text-slate-400 hover:text-red-500 transition-all"><RotateCcw className="w-4 h-4" /></button>
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
          totalItems={filteredTransactions.length}
          itemsPerPage={itemsPerPage}
          colorScheme="orange"
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col scale-in-95 animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600">
                       <ArrowUpFromLine className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 dark:text-white">Pengeluaran Barang (DO)</h3>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Pencatatan Distribusi Unit</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                 {validationError && (
                   <div className="mb-6">
                      <PillNotification type="error" title="Distribusi Gagal" message={validationError} onClose={() => setValidationError('')} />
                   </div>
                 )}

                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <FormLabel required>No. Transaksi</FormLabel>
                          <FormInput value={noTransaksi} readOnly className="font-mono bg-slate-100 dark:bg-slate-800" />
                       </div>
                       <div className="space-y-2">
                          <FormLabel required>Tanggal Keluar</FormLabel>
                          <FormInput type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <FormLabel required>Penerima / PIC</FormLabel>
                          <FormInput value={penerima} onChange={e => setPenerima(e.target.value)} required placeholder="Nama Lengkap" />
                       </div>
                       <div className="space-y-2">
                          <FormLabel required>Departemen</FormLabel>
                          <FormSelect value={departemen} onChange={e => setDepartemen(e.target.value)} required>
                             {departemenList.map(d => <option key={d} value={d}>{d}</option>)}
                          </FormSelect>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex items-center justify-between mb-1.5">
                          <FormLabel required>Pilih Item</FormLabel>
                          <button type="button" onClick={() => { setScannerMode('barang'); setShowQRScanner(true); }} className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">Scan Katalog</button>
                       </div>
                       <div className="flex gap-2">
                          <FormSelect value={barangId} onChange={(e) => handleBarangChange(Number(e.target.value))} required className="flex-1">
                             {barang.map(b => <option key={b.id} value={b.id}>{b.nama_barang} (Tersedia: {b.stok})</option>)}
                          </FormSelect>
                          <button type="button" onClick={() => { setScannerMode('barang'); setShowQRScanner(true); }} className="p-2.5 bg-orange-600 text-white rounded-xl shadow-lg active:scale-90 transition-all"><Barcode className="w-5 h-5" /></button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <FormLabel required>Jumlah Unit</FormLabel>
                          <FormInput type="number" min="1" value={jumlah} onChange={e => setJumlah(Number(e.target.value))} required className="font-black text-lg text-orange-600 tabular-nums" />
                       </div>
                       <div className="space-y-2">
                          <div className="flex items-center justify-between">
                             <FormLabel>Serial Number</FormLabel>
                             <button type="button" onClick={() => { setScannerMode('serial'); setShowQRScanner(true); }} className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Scan Unit</button>
                          </div>
                          <FormInput value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="SN1, SN2..." className="font-mono" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <FormLabel required>Keperluan / Alasan</FormLabel>
                       <textarea rows={2} value={keperluan} onChange={e => setKeperluan(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-hidden focus:border-orange-500 transition-all resize-none" />
                    </div>

                    <div className="p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 bg-orange-50/10">
                       <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                          {fotoBukti ? <img src={fotoBukti} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-orange-200" />}
                       </div>
                       <label className="mt-2 inline-block px-4 py-2 bg-orange-600 text-white text-[10px] font-black rounded-xl cursor-pointer hover:bg-orange-700 transition-all shadow-md">
                          AMBIL FOTO SERAH TERIMA
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                       </label>
                    </div>

                    <button type="submit" className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-950/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
                       Validasi & Distribusikan
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Recall Modal */}
      {recallModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6 mx-auto"><RotateCcw className="w-8 h-8" /></div>
              <h3 className="text-xl font-black text-center text-slate-900 dark:text-white">Tarik Kembali (Recall)</h3>
              <p className="text-xs text-center text-slate-500 mt-2">Menarik kembali unit <strong>{recallModalItem.no_transaksi}</strong> dari <strong>{recallModalItem.penerima}</strong> ke gudang pusat.</p>
              
              <form onSubmit={handleExecuteRecall} className="mt-8 space-y-4">
                 <div className="space-y-2">
                    <FormLabel required>Alasan Penarikan</FormLabel>
                    <textarea rows={3} value={recallReason} onChange={e => setRecallReason(e.target.value)} required placeholder="Contoh: Unit rusak, salah distribusi..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-hidden" />
                 </div>
                 <div className="space-y-2">
                    <FormLabel required>Kondisi Terakhir Unit</FormLabel>
                    <FormSelect value={recallCondition} onChange={e => setRecallCondition(e.target.value as any)}>
                       <option value="Baik">✅ Masih Baik</option>
                       <option value="Perbaikan">🛠️ Perlu Servis</option>
                       <option value="Rusak">❌ Rusak Total</option>
                    </FormSelect>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setRecallModalItem(null)} className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 rounded-2xl text-xs">Batal</button>
                    <button type="submit" className="flex-1 py-3 font-black text-white bg-red-600 rounded-2xl text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all">EKSEKUSI RECALL</button>
                 </div>
              </form>
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
               <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <ImageIcon className="w-5 h-5 text-orange-500" />
                     <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{viewingImage.title}</span>
                  </div>
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
        title="Logistic Scanner"
        registeredSerials={barang.map(b=>b.barcode).filter(Boolean) as string[]}
      />

      <CenteredAlertModal
        isOpen={!!successModalMessage}
        type="success"
        title="Sinkronisasi Selesai"
        message={successModalMessage || ''}
        onClose={() => setSuccessModalMessage(null)}
      />
    </div>
  );
};
