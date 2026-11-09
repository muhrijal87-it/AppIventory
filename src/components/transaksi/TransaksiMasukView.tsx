import React, { useState } from 'react';
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
} from 'lucide-react';
import { TransaksiMasuk } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { PillNotification } from '../common/PillNotification';
import { CenteredAlertModal } from '../common/CenteredAlertModal';

// --- Reusable Form Components ---
const FormLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-hidden"
  />
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-hidden"
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
      // Find matching item in inventory catalog
      const matched = barang.find(
        (b) =>
          (b.barcode && b.barcode.toLowerCase() === cleanVal.toLowerCase()) ||
          b.kode_barang.toLowerCase() === cleanVal.toLowerCase() ||
          (b.serial_number && b.serial_number.toLowerCase().includes(cleanVal.toLowerCase())) ||
          (b.model && b.model.toLowerCase() === cleanVal.toLowerCase())
      );

      if (matched) {
        setBarangId(matched.id);
        setValidationError('');
        setScanFeedback({
          type: 'success',
          message: `Barang terpilih: "${matched.nama_barang}" (${matched.kode_barang}) [Barcode: ${cleanVal}]`,
        });
      } else {
        setScanFeedback({
          type: 'warning',
          message: `Barcode "${cleanVal}" tidak cocok dengan barang di katalog. Anda dapat memilih barang secara manual.`,
        });
      }
      setTimeout(() => setScanFeedback(null), 5000);
    } else if (scannerMode === 'search') {
      // Search list or auto-detect item to create transaction
      const matched = barang.find(
        (b) =>
          (b.barcode && b.barcode.toLowerCase() === cleanVal.toLowerCase()) ||
          b.kode_barang.toLowerCase() === cleanVal.toLowerCase()
      );

      setSearchTerm(cleanVal);
      if (matched) {
        setScanFeedback({
          type: 'success',
          message: `Barcode "${cleanVal}" terdeteksi untuk "${matched.nama_barang}". Memfilter riwayat faktur masuk...`,
        });
      } else {
        setScanFeedback({
          type: 'info',
          message: `Menyaring transaksi dengan kata kunci: "${cleanVal}"`,
        });
      }
      setTimeout(() => setScanFeedback(null), 5000);
    }
  };

  const handleOpenAdd = () => {
    const nextSeq = transaksiMasuk.length + 1;
    const today = new Date();
    const yyyymm = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    setNoFaktur(`IN-${yyyymm}-${String(nextSeq).padStart(3, '0')}`);
    setTanggal(new Date().toISOString().slice(0, 10));
    setSupplierId(supplier[0]?.id || 1);
    const initialBarang = barang[0];
    setBarangId(initialBarang?.id || 1);
    setJumlah(5);
    setCatatan('Restok pengadaan barang inventaris rutin');
    setFotoNota('');
    setValidationError('');
    setShowAddModal(true);
  };

  const handleBarangChange = (id: number) => {
    setBarangId(id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setValidationError('Ukuran foto terlalu besar! Maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFotoNota(dataUrl);
      setValidationError('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
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
    setSuccessModalMessage(`Penerimaan barang dengan No. Faktur ${noFaktur} berhasil dicatat ke dalam database inventaris!`);
  };

  const filteredTransactions = transaksiMasuk.filter((t) => {
    const itm = barang.find((b) => b.id === t.barang_id);
    const sup = supplier.find((s) => s.id === t.supplier_id);
    const search = searchTerm.toLowerCase();
    return (
      t.no_faktur.toLowerCase().includes(search) ||
      (itm && itm.nama_barang.toLowerCase().includes(search)) ||
      (sup && sup.nama_supplier.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Transaksi Barang Masuk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan pengadaan barang dari supplier ke stok gudang.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setScannerMode('search');
              setShowScanner(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl transition-all shadow-xs active:scale-95"
            title="Scan barcode atau QR code untuk pencarian cepat faktur"
          >
            <Barcode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Scan Barcode / QR</span>
          </button>

          {can('manage_inventory') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Barang Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari faktur, supplier, atau nama barang..."
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => {
                setScannerMode('search');
                setShowScanner(true);
              }}
              className="absolute right-2.5 top-2 p-1 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title="Scan Barcode / QR dengan Kamera"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px] shadow-xs">
              <tr>
                <th className="px-6 py-4">No. Faktur</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Pemasok</th>
                <th className="px-6 py-4">Barang</th>
                <th className="px-6 py-4 text-right">Jumlah</th>
                <th className="px-6 py-4 text-center">Foto Nota</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Belum ada data transaksi.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const itm = barang.find((b) => b.id === trx.barang_id);
                  const sup = supplier.find((s) => s.id === trx.supplier_id);
                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">{trx.no_faktur}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono whitespace-nowrap">{trx.tanggal}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{sup?.nama_supplier}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{itm?.nama_barang}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{itm?.kode_barang}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-black font-mono text-emerald-600 text-sm">+{trx.jumlah}</td>
                      <td className="px-6 py-4 text-center">
                        {trx.foto_nota ? (
                           <button onClick={() => setViewingImage({ title: `Nota ${trx.no_faktur}`, url: trx.foto_nota! })} className="p-1 rounded bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40">
                             <ImageIcon className="w-4 h-4 text-emerald-600" />
                           </button>
                        ) : <span className="text-[10px] text-slate-400 italic">No</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setSelectedInvoice(trx)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><Printer className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Penerimaan Barang</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>

            {validationError && (
              <div className="mx-6 mt-4">
                <PillNotification
                  type="error"
                  title="Validasi Gagal"
                  message={validationError}
                  onClose={() => setValidationError('')}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel required>No. Faktur</FormLabel>
                  <FormInput type="text" value={noFaktur} onChange={(e) => setNoFaktur(e.target.value)} required readOnly />
                </div>
                <div>
                  <FormLabel required>Tanggal</FormLabel>
                  <FormInput type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                </div>
              </div>
              <div>
                <FormLabel required>Supplier</FormLabel>
                <FormSelect value={supplierId} onChange={(e) => setSupplierId(Number(e.target.value))} required>
                  {supplier.map(s => <option key={s.id} value={s.id}>{s.nama_supplier}</option>)}
                </FormSelect>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <FormLabel required>Pilih Barang</FormLabel>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerMode('select_barang');
                      setShowScanner(true);
                    }}
                    className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Buka kamera untuk scan barcode kemasan barang"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Scan Barcode Kemasan</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <FormSelect value={barangId} onChange={(e) => handleBarangChange(Number(e.target.value))} required className="flex-1">
                    {barang.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.nama_barang} (Stok: {b.stok}) · {b.kode_barang} {b.barcode ? `[EAN: ${b.barcode}]` : ''}
                      </option>
                    ))}
                  </FormSelect>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerMode('select_barang');
                      setShowScanner(true);
                    }}
                    className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shrink-0"
                    title="Scan Barcode / QR Barang dengan Kamera"
                  >
                    <Barcode className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <FormLabel required>Jumlah</FormLabel>
                <FormInput type="number" min="1" value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} required />
              </div>
              <div>
                <FormLabel>Catatan</FormLabel>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
                />
              </div>
              {/* Photo Input (Redesign) */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <FormLabel>Foto Bukti</FormLabel>
                <label className="flex items-center gap-3 cursor-pointer mt-2 hover:opacity-80">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-600">
                    {fotoNota ? <img src={fotoNota} className="w-full h-full object-cover rounded-xl" /> : <Camera className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-bold text-slate-500">{fotoNota ? 'Ganti Foto' : 'Pilih Foto...'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all active:scale-95">Simpan</button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Image Viewer */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingImage(null)} className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300">
               <X className="w-6 h-6" />
            </button>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-2xl overflow-hidden">
               <img src={viewingImage.url} alt={viewingImage.title} className="max-h-[80vh] w-auto rounded-2xl" />
               <div className="p-4 text-center font-bold text-slate-900 dark:text-white">{viewingImage.title}</div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode / QR Code Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title={
          scannerMode === 'select_barang'
            ? 'Scan Barcode / QR Barang Masuk'
            : 'Scan Barcode / QR Faktur / Barang'
        }
        registeredSerials={
          barang
            .map((b) => b.barcode)
            .filter(Boolean) as string[]
        }
      />

      {/* Centered Success / Alert Modal */}
      <CenteredAlertModal
        isOpen={!!successModalMessage}
        type="success"
        title="Berhasil!"
        message={successModalMessage || ''}
        onClose={() => setSuccessModalMessage(null)}
      />
    </div>
  );
};
