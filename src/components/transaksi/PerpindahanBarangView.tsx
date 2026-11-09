import React, { useState } from 'react';
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
  Printer
} from 'lucide-react';
import { TransaksiKeluar } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';

interface PerpindahanBarangViewProps {
  onNavigate?: (view: string) => void;
}

// --- Reusable Form Components ---
const FormLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-hidden"
  />
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-hidden"
  />
);

export const PerpindahanBarangView: React.FC<PerpindahanBarangViewProps> = ({ onNavigate }) => {
  const { transaksiKeluar, barang, departemen: masterDepartemen, addTransaksiKeluar, updateTransaksiKeluar } = useInventory();
  const { user, users, can } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSuratJalan, setSelectedSuratJalan] = useState<TransaksiKeluar | null>(null);
  const [viewingImage, setViewingImage] = useState<{ title: string; url: string } | null>(null);
  const [validationError, setValidationError] = useState('');

  // Dynamic departemen list from tbl_departemen
  const departemenList =
    masterDepartemen && masterDepartemen.length > 0
      ? masterDepartemen.map((d) => d.nama_departemen)
      : [
          'Divisi Pengembangan TI',
          'Operasional & Logistik',
          'Finance & Akuntansi',
          'Human Resources (HRD) & GA',
          'Pemasaran & Penjualan (Marketing)',
          'Divisi Pemeliharaan / Maintenance',
          'Manajemen Direksi',
        ];

  // Form State for new Perpindahan Barang
  const [noTransaksi, setNoTransaksi] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [penerima, setPenerima] = useState('');
  const [departemen, setDepartemen] = useState(departemenList[0] || 'Divisi Pengembangan TI');
  const [barangId, setBarangId] = useState<number>(barang[0]?.id || 1);
  const [jumlah, setJumlah] = useState<number>(1);
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [fotoBukti, setFotoBukti] = useState<string>('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Serial numbers recorded in Outbound / Distribusi transactions for the selected item
  const outboundSerialsForItem = React.useMemo(() => {
    const list: { serial: string; no_transaksi: string; penerima: string; departemen: string }[] = [];
    transaksiKeluar.forEach((t) => {
      if (t.barang_id === Number(barangId) && t.serial_number && !t.no_transaksi.startsWith('TRF-')) {
        const sns = t.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
        sns.forEach((sn) => {
          if (!list.some((item) => item.serial.toUpperCase() === sn.toUpperCase())) {
            list.push({
              serial: sn,
              no_transaksi: t.no_transaksi,
              penerima: t.penerima,
              departemen: t.departemen,
            });
          }
        });
      }
    });
    return list;
  }, [transaksiKeluar, barangId]);

  const handleOpenAdd = () => {
    const nextSeq = transaksiKeluar.length + 1;
    const today = new Date();
    const yyyymm = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const initialItem = barang[0];
    const initialId = initialItem?.id || 1;

    setNoTransaksi(`TRF-${yyyymm}-${String(nextSeq).padStart(3, '0')}`);
    setTanggal(new Date().toISOString().slice(0, 10));
    setPenerima('');
    setDepartemen(departemenList[0] || 'Divisi Pengembangan TI');
    setBarangId(initialId);
    setJumlah(1);
    setModel(initialItem?.model || '');

    // Auto-fetch serial number directly from Transaksi Barang Keluar (Outbound) if available
    const initialOutbounds = transaksiKeluar.filter((t) => t.barang_id === initialId && t.serial_number && !t.no_transaksi.startsWith('TRF-'));
    if (initialOutbounds.length > 0 && initialOutbounds[0].serial_number) {
      const sns = initialOutbounds[0].serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
      setSerialNumber(sns[0] || '');
    } else if (initialItem?.serial_number) {
      const sns = initialItem.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
      setSerialNumber(sns[0] || initialItem.serial_number);
    } else {
      setSerialNumber('');
    }

    setKeperluan('Perpindahan dan serah terima unit operasional');
    setFotoBukti('');
    setValidationError('');
    setShowAddModal(true);
  };

  const handleBarangChange = (id: number) => {
    setBarangId(id);
    const targetItem = barang.find((b) => b.id === id);
    if (targetItem) {
      if (targetItem.model) {
        setModel(targetItem.model);
      }
      const outbounds = transaksiKeluar.filter((t) => t.barang_id === id && t.serial_number && !t.no_transaksi.startsWith('TRF-'));
      if (outbounds.length > 0 && outbounds[0].serial_number) {
        const sns = outbounds[0].serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
        setSerialNumber(sns[0] || '');
      } else if (targetItem.serial_number) {
        const sns = targetItem.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
        setSerialNumber(sns[0] || targetItem.serial_number);
      } else {
        setSerialNumber('');
      }
    }
  };

  const handleFetchSerial = () => {
    const targetItem = barang.find((b) => b.id === Number(barangId));
    if (targetItem && targetItem.model) setModel(targetItem.model);

    const currentList = serialNumber
      .split(/[,;\n]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    // 1. Primary Source: Outbound / Distribusi Transactions (transaksiKeluar)
    if (outboundSerialsForItem.length > 0) {
      const nextUnused = outboundSerialsForItem.find((item) => !currentList.includes(item.serial.toUpperCase()));
      if (nextUnused) {
        setSerialNumber((prev) => (prev ? `${prev}, ${nextUnused.serial}` : nextUnused.serial));
        setValidationError('');
        return;
      }
    }

    // 2. Fallback: Master Barang Serial Numbers
    if (targetItem?.serial_number) {
      const sns = targetItem.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
      const nextUnused = sns.find((s) => !currentList.includes(s.toUpperCase()));
      if (nextUnused) {
        setSerialNumber((prev) => (prev ? `${prev}, ${nextUnused}` : nextUnused));
        setValidationError('');
        return;
      }
    }

    // 3. Fallback: Generated SN
    if (targetItem) {
      const newSN = `SN-${targetItem.kode_barang}-${Math.floor(10000 + Math.random() * 90000)}`;
      setSerialNumber((prev) => (prev ? `${prev}, ${newSN}` : newSN));
      setValidationError('');
    }
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
      setFotoBukti(dataUrl);
      setValidationError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const targetItem = barang.find((b) => b.id === Number(barangId));
    if (!targetItem) {
      setValidationError('Barang tidak ditemukan!');
      return;
    }

    if (jumlah <= 0) {
      setValidationError('Jumlah barang dipindahkan minimal 1!');
      return;
    }

    if (!penerima.trim()) {
      setValidationError('Nama penerima / PIC penanggung jawab wajib diisi!');
      return;
    }

    const res = addTransaksiKeluar({
      no_transaksi: noTransaksi,
      tanggal,
      penerima,
      departemen,
      barang_id: Number(barangId),
      jumlah: Number(jumlah),
      model: model.trim() || undefined,
      serial_number: serialNumber.trim() || undefined,
      keperluan,
      petugas_id: user ? user.id : 1,
      foto_bukti: fotoBukti || undefined,
    });

    if (res.success) {
      setShowAddModal(false);
    } else {
      setValidationError(res.message);
    }
  };

  const filteredData = transaksiKeluar.filter((t) => {
    if (!t.no_transaksi.startsWith('TRF-')) return false;

    const itm = barang.find((b) => b.id === t.barang_id);
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      t.no_transaksi.toLowerCase().includes(search) ||
      t.penerima.toLowerCase().includes(search) ||
      t.departemen.toLowerCase().includes(search) ||
      t.keperluan.toLowerCase().includes(search) ||
      (t.model && t.model.toLowerCase().includes(search)) ||
      (t.serial_number && t.serial_number.toLowerCase().includes(search)) ||
      (itm && itm.nama_barang.toLowerCase().includes(search)) ||
      (itm && itm.kode_barang.toLowerCase().includes(search));

    const matchesDept = selectedDeptFilter === 'all' || t.departemen === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const getLatestRecipient = (originalTrx: TransaksiKeluar) => {
    if (!originalTrx.serial_number) return { penerima: originalTrx.penerima, departemen: originalTrx.departemen };

    const sns = originalTrx.serial_number
      .split(/[,;\n]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const latest = [...transaksiKeluar]
      .filter((t) => t.serial_number)
      .filter((t) => {
        const tSns = t.serial_number!.split(/[,;\n]+/).map((s) => s.trim().toUpperCase());
        return sns.some((sn) => tSns.includes(sn));
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || b.id - a.id)[0];

    return latest
      ? { penerima: latest.penerima, departemen: latest.departemen, isMoved: latest.id !== originalTrx.id }
      : { penerima: originalTrx.penerima, departemen: originalTrx.departemen, isMoved: false };
  };

  const transferOnlyRecords = transaksiKeluar.filter(t => t.no_transaksi.startsWith('TRF-'));
  const totalItemTransferred = transferOnlyRecords.reduce((sum, t) => sum + t.jumlah, 0);
  const uniqueDepts = Array.from(new Set(transferOnlyRecords.map((t) => t.departemen))).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-purple-600" />
            <span>Perpindahan Barang</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring alur perpindahan barang antar unit kerja dan lokasi operasional.
          </p>
        </div>

        {can('manage_inventory') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg shadow-purple-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Perpindahan Baru</span>
          </button>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Surat Perpindahan</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{transferOnlyRecords.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume Berpindah</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{totalItemTransferred}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departemen</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{uniqueDepts}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari no surat, penerima, atau barang..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Filter:</span>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="all">Semua Departemen</option>
              {departemenList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">No. Dokumen</th>
                <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                <th className="px-6 py-4">Barang</th>
                <th className="px-6 py-4">Alur (Dari ➔ Ke)</th>
                <th className="px-6 py-4">Penerima (PIC)</th>
                <th className="px-6 py-4 text-right">Jumlah</th>
                <th className="px-6 py-4 text-center">Foto</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    Tidak ditemukan data perpindahan barang.
                  </td>
                </tr>
              ) : (
                filteredData.map((trx) => {
                  const itm = barang.find((b) => b.id === trx.barang_id);
                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">{trx.no_transaksi}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono whitespace-nowrap">{trx.tanggal}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">{itm?.nama_barang}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{itm?.kode_barang} {trx.model && `· ${trx.model}`}</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <span className="text-slate-400">Gudang</span>
                           <ArrowRight className="w-3 h-3 text-purple-400" />
                           <span className="font-bold text-purple-600 dark:text-purple-400">{trx.departemen}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{trx.penerima}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-black font-mono text-purple-600">{trx.jumlah}</td>
                      <td className="px-6 py-4 text-center">
                        {trx.foto_bukti ? (
                          <button onClick={() => setViewingImage({ title: `Bukti ${trx.no_transaksi}`, url: trx.foto_bukti! })} className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                             <ImageIcon className="w-4 h-4 text-purple-600" />
                          </button>
                        ) : <span className="text-[10px] text-slate-400 italic">No</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setSelectedSuratJalan(trx)} className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors"><Printer className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Perpindahan */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
               <h3 className="text-base font-black text-slate-900 dark:text-white">Perpindahan Barang</h3>
               <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel required>No. Dokumen</FormLabel>
                    <FormInput type="text" value={noTransaksi} onChange={(e) => setNoTransaksi(e.target.value)} required readOnly className="bg-slate-50 dark:bg-slate-800" />
                  </div>
                  <div>
                    <FormLabel required>Tanggal</FormLabel>
                    <FormInput type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                  </div>
               </div>

               <div>
                  <FormLabel required>Pilih Barang</FormLabel>
                  <FormSelect value={barangId} onChange={(e) => handleBarangChange(Number(e.target.value))} required>
                    {barang.map(b => <option key={b.id} value={b.id}>{b.nama_barang} (Stok: {b.stok})</option>)}
                  </FormSelect>
                  <p className="text-[10px] text-purple-600 font-bold mt-1">Stok fisik tidak berkurang pada perpindahan alur.</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Model / Tipe</FormLabel>
                    <FormInput type="text" value={model} onChange={(e) => setModel(e.target.value)} />
                  </div>
                  <div>
                    <FormLabel>Serial Number</FormLabel>
                    <div className="flex gap-1">
                       <FormInput type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="font-mono" />
                       <button type="button" onClick={handleFetchSerial} className="p-2.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-xl hover:bg-purple-200"><Barcode className="w-4 h-4" /></button>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel required>Ke Unit/Dept</FormLabel>
                    <FormSelect value={departemen} onChange={(e) => setDepartemen(e.target.value)} required>
                      {departemenList.map(d => <option key={d} value={d}>{d}</option>)}
                    </FormSelect>
                  </div>
                  <div>
                    <FormLabel required>Penerima (PIC)</FormLabel>
                    <FormInput type="text" required value={penerima} onChange={(e) => setPenerima(e.target.value)} placeholder="Nama Staf" />
                  </div>
               </div>

               <div>
                  <FormLabel required>Jumlah Unit</FormLabel>
                  <FormInput type="number" min="1" required value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} className="font-bold text-purple-600" />
               </div>

               <div>
                  <FormLabel>Keperluan</FormLabel>
                  <textarea
                    rows={2}
                    value={keperluan}
                    onChange={(e) => setKeperluan(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all outline-hidden"
                  />
               </div>

               <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <FormLabel>Foto Serah Terima</FormLabel>
                  <label className="flex items-center gap-3 cursor-pointer mt-2 hover:opacity-80">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-purple-600 overflow-hidden">
                      {fotoBukti ? <img src={fotoBukti} className="w-full h-full object-cover" /> : <Camera className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-bold text-slate-500">{fotoBukti ? 'Ganti Foto' : 'Ambil Foto...'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
               </div>

               <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition-all active:scale-95">Simpan Perpindahan</button>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal Integration */}
      <BarcodeScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={(scannedVal) => setSerialNumber(scannedVal)}
        title="Scan Serial Number"
        registeredSerials={
          outboundSerialsForItem.length > 0
            ? outboundSerialsForItem.map((i) => i.serial)
            : barang
                .find((b) => b.id === Number(barangId))
                ?.serial_number?.split(/[,;\n]+/)
                .map((s) => s.trim())
                .filter(Boolean) || []
        }
      />

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

      {/* Modal: Print Surat Jalan Perpindahan */}
      {selectedSuratJalan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
               <h3 className="text-base font-black text-slate-900 dark:text-white">Dokumen Perpindahan</h3>
               <button onClick={() => setSelectedSuratJalan(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
             </div>
             
             <div className="p-8 space-y-6 text-slate-800 dark:text-slate-200 overflow-y-auto">
                <div className="flex justify-between items-start border-b pb-4">
                   <div>
                     <h1 className="text-xl font-black text-purple-600 tracking-tight">BERITA ACARA PINDAH</h1>
                     <p className="text-xs text-slate-500 font-mono">{selectedSuratJalan.no_transaksi}</p>
                   </div>
                   <div className="text-right text-xs">
                     <p className="font-bold">Unit Gudang</p>
                     <p>{selectedSuratJalan.tanggal}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-xs">
                   <div>
                     <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Dari:</p>
                     <p className="font-bold">Gudang Utama</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Tujuan:</p>
                     <p className="font-bold text-purple-600">{selectedSuratJalan.departemen}</p>
                     <p className="text-slate-500">Penerima: {selectedSuratJalan.penerima}</p>
                   </div>
                </div>

                <div className="border-y py-4">
                   <table className="w-full text-xs">
                     <thead>
                       <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                         <th className="text-left pb-2">Barang</th>
                         <th className="text-right pb-2">Volume</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr>
                         <td className="py-2">
                            <p className="font-bold">{barang.find(b => b.id === selectedSuratJalan.barang_id)?.nama_barang}</p>
                            <p className="text-slate-500 font-mono text-[10px]">{barang.find(b => b.id === selectedSuratJalan.barang_id)?.kode_barang} {selectedSuratJalan.serial_number && `· SN: ${selectedSuratJalan.serial_number}`}</p>
                         </td>
                         <td className="text-right font-black py-2">{selectedSuratJalan.jumlah} Unit</td>
                       </tr>
                     </tbody>
                   </table>
                </div>

                <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
                   <div>
                     <div className="h-16 mb-2"></div>
                     <p className="font-bold border-t pt-1">Gudang Pengirim</p>
                   </div>
                   <div>
                     <div className="h-16 mb-2"></div>
                     <p className="font-bold border-t pt-1">Penerima Mutasi</p>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
               <button onClick={() => setSelectedSuratJalan(null)} className="flex-1 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-2xl transition-all">Tutup</button>
               <button onClick={() => window.print()} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen</span>
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
