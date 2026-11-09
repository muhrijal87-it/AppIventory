import React, { useState, useMemo } from 'react';
import {
  ArrowDownToLine,
  Plus,
  Search,
  Truck,
  Package,
  Printer,
  X,
  CheckCircle2,
  Camera,
  Trash2,
  Eye,
  AlertCircle,
  Image as ImageIcon,
  Barcode,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Hash,
  User,
  FileText
} from 'lucide-react';
import { TransaksiMasuk } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { PillNotification } from '../common/PillNotification';
import { CenteredAlertModal } from '../common/CenteredAlertModal';
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
    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-hidden font-medium"
  />
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-hidden cursor-pointer font-bold appearance-none"
  />
);

export const TransaksiMasukView: React.FC = () => {
  const { transaksiMasuk, barang, supplier, addTransaksiMasuk } = useInventory();
  const { user, users, can } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TransaksiMasuk | null>(null);
  const [viewingImage, setViewingImage] = useState<{ title: string; url: string } | null>(null);

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'search' | 'select_barang'>('search');
  const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'info' | 'warning'; message: string } | null>(null);

  // Form State
  const [noFaktur, setNoFaktur] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState<number>(supplier[0]?.id || 1);
  const [barangId, setBarangId] = useState<number>(barang[0]?.id || 1);
  const [jumlah, setJumlah] = useState<number>(5);
  const [catatan, setCatatan] = useState('');
  const [fotoNota, setFotoNota] = useState<string>('');
  const [validationError, setValidationError] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState<string | null>(null);

  const handleScan = (scannedVal: string) => {
    const cleanVal = scannedVal.trim();
    if (!cleanVal) return;

    if (scannerMode === 'select_barang') {
      const matched = barang.find(b => 
        (b.barcode && b.barcode.toLowerCase() === cleanVal.toLowerCase()) ||
        b.kode_barang.toLowerCase() === cleanVal.toLowerCase()
      );
      if (matched) {
        setBarangId(matched.id);
        setScanFeedback({ type: 'success', message: `Barang terpilih: ${matched.nama_barang}` });
      } else {
        setScanFeedback({ type: 'warning', message: 'Barcode tidak terdaftar di katalog.' });
      }
      setTimeout(() => setScanFeedback(null), 3000);
    } else {
      setSearchTerm(cleanVal);
    }
  };

  const handleOpenAdd = () => {
    const nextSeq = transaksiMasuk.length + 1;
    const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '');
    setNoFaktur(`IN-${yyyymm}-${String(nextSeq).padStart(3, '0')}`);
    setTanggal(new Date().toISOString().slice(0, 10));
    setSupplierId(supplier[0]?.id || 1);
    setBarangId(barang[0]?.id || 1);
    setJumlah(1);
    setCatatan('Restok unit inventaris rutin');
    setFotoNota('');
    setValidationError('');
    setShowAddModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setFotoNota(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jumlah <= 0) {
      setValidationError('Jumlah barang masuk minimal 1 unit!');
      return;
    }
    addTransaksiMasuk({
      no_faktur: noFaktur,
      tanggal,
      supplier_id: Number(supplierId),
      barang_id: Number(barangId),
      jumlah: Number(jumlah),
      harga_satuan: 0,
      total_harga: 0,
      catatan,
      petugas_id: user ? user.id : 1,
      foto_nota: fotoNota || undefined,
    });
    setShowAddModal(false);
    setSuccessModalMessage(`Penerimaan unit ${noFaktur} telah diverifikasi.`);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredTransactions = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return transaksiMasuk.filter((t) => {
      const itm = barang.find((b) => b.id === t.barang_id);
      const sup = supplier.find((s_) => s_.id === t.supplier_id);
      return t.no_faktur.toLowerCase().includes(s) || (itm && itm.nama_barang.toLowerCase().includes(s)) || (sup && sup.nama_supplier.toLowerCase().includes(s));
    });
  }, [transaksiMasuk, searchTerm, barang, supplier]);

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
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Inbound Logistics</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Barang Masuk (In)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Catat penerimaan aset dari pemasok. Sinkronisasi otomatis ke stok fisik dan mutasi buku besar MySQL.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setScannerMode('search'); setShowScanner(true); }}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Barcode className="w-4 h-4 text-emerald-500" />
            <span>Scan Faktur</span>
          </button>
          
          {can('manage_inventory') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-200 dark:shadow-emerald-950/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Input Barang Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative group flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari Faktur, Supplier, atau Barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:border-emerald-400 transition-all font-medium"
            />
         </div>
         <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest px-4 border-l border-slate-100 dark:border-slate-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Entry: {transaksiMasuk[0]?.tanggal || '-'}</span>
         </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Informasi Faktur</th>
                <th className="px-6 py-4">Pemasok (Supplier)</th>
                <th className="px-6 py-4">Detail Barang</th>
                <th className="px-6 py-4 text-right">Volume</th>
                <th className="px-6 py-4 text-center">Berkas</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-24 text-center text-slate-400 italic">Belum ada rekaman transaksi masuk.</td>
                </tr>
              ) : (
                paginatedTransactions.map((trx) => {
                  const itm = barang.find(b => b.id === trx.barang_id);
                  const sup = supplier.find(s => s.id === trx.supplier_id);
                  const petugas = users.find(u => u.id === trx.petugas_id);

                  return (
                    <tr key={trx.id} className="group hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className="font-mono text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{trx.no_faktur}</span>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-medium">
                               <Clock className="w-3 h-3" />
                               <span>{trx.tanggal}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shrink-0">
                               <Truck className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{sup?.nama_supplier || 'Unknown Supplier'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{itm?.nama_barang || 'Unknown'}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">{itm?.kode_barang}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black tabular-nums text-emerald-600 text-sm">
                         +{trx.jumlah}
                      </td>
                      <td className="px-6 py-5 text-center">
                         {trx.foto_nota ? (
                           <button onClick={() => setViewingImage({ title: `Nota ${trx.no_faktur}`, url: trx.foto_nota! })} className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:scale-110 transition-all">
                              <ImageIcon className="w-4 h-4" />
                           </button>
                         ) : <span className="text-[10px] text-slate-300 italic">No File</span>}
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setSelectedInvoice(trx)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><Printer className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-slate-100 dark:bg-slate-800 mx-1" />
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">BY: {petugas?.username || 'System'}</div>
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
          colorScheme="emerald"
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col scale-in-95 animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                       <ArrowDownToLine className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900 dark:text-white">Registrasi Barang Masuk</h3>
                       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Penambahan Stok Inventaris</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                 {validationError && (
                   <div className="mb-6">
                      <PillNotification type="error" title="Validasi Gagal" message={validationError} onClose={() => setValidationError('')} />
                   </div>
                 )}

                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <FormLabel required>No. Faktur (Auto)</FormLabel>
                          <FormInput value={noFaktur} readOnly className="font-mono bg-slate-100 dark:bg-slate-800" />
                       </div>
                       <div className="space-y-2">
                          <FormLabel required>Tanggal Terima</FormLabel>
                          <FormInput type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <FormLabel required>Pemasok / Supplier</FormLabel>
                       <FormSelect value={supplierId} onChange={e => setSupplierId(Number(e.target.value))} required>
                          {supplier.map(s => <option key={s.id} value={s.id}>{s.nama_supplier}</option>)}
                       </FormSelect>
                    </div>

                    <div className="space-y-2">
                       <div className="flex items-center justify-between mb-1.5">
                          <FormLabel required>Pilih Item Barang</FormLabel>
                          <button type="button" onClick={() => { setScannerMode('select_barang'); setShowScanner(true); }} className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Scan Unit</button>
                       </div>
                       <div className="flex gap-2">
                          <FormSelect value={barangId} onChange={e => setBarangId(Number(e.target.value))} required className="flex-1">
                             {barang.map(b => <option key={b.id} value={b.id}>{b.nama_barang} (Stok: {b.stok})</option>)}
                          </FormSelect>
                          <button type="button" onClick={() => { setScannerMode('select_barang'); setShowScanner(true); }} className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"><Barcode className="w-5 h-5" /></button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <FormLabel required>Jumlah (Quantity)</FormLabel>
                       <FormInput type="number" min="1" value={jumlah} onChange={e => setJumlah(Number(e.target.value))} required className="font-black text-lg text-emerald-600 tabular-nums" />
                    </div>

                    <div className="space-y-2">
                       <FormLabel>Catatan Penerimaan</FormLabel>
                       <textarea rows={2} value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-hidden focus:border-emerald-500 transition-all resize-none" />
                    </div>

                    <div className="p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 bg-emerald-50/10">
                       <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                          {fotoNota ? <img src={fotoNota} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-emerald-200" />}
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unggah Foto Nota / Faktur</p>
                          <label className="mt-2 inline-block px-4 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-xl cursor-pointer hover:bg-emerald-700 transition-all shadow-md">
                             PILIH BERKAS
                             <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                          </label>
                       </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-950/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
                       Konfirmasi Penerimaan
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Lightbox / Image Viewer */}
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
                     <FileText className="w-5 h-5 text-emerald-500" />
                     <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{viewingImage.title}</span>
                  </div>
                  <button onClick={() => window.open(viewingImage.url)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><ExternalLink className="w-4 h-4 text-slate-400" /></button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner */}
      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title={scannerMode === 'select_barang' ? 'Identifikasi Barang' : 'Lacak Histori Faktur'}
        registeredSerials={barang.map(b => b.barcode).filter(Boolean) as string[]}
      />

      {/* Success Alert */}
      <CenteredAlertModal
        isOpen={!!successModalMessage}
        type="success"
        title="Proses Berhasil"
        message={successModalMessage || ''}
        onClose={() => setSuccessModalMessage(null)}
      />
    </div>
  );
};
