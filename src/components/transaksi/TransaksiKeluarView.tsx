import React, { useState } from 'react';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
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
  Undo2,
} from 'lucide-react';
import { TransaksiKeluar } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

interface TransaksiKeluarViewProps {
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
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden"
  />
);

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden"
  />
);

export const TransaksiKeluarView: React.FC<TransaksiKeluarViewProps> = ({ onNavigate }) => {
  const { transaksiKeluar, barang, departemen: masterDepartemen, addTransaksiKeluar, updateTransaksiKeluar, recallTransaksiKeluar } = useInventory();
  const { user, users, can } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDO, setSelectedDO] = useState<TransaksiKeluar | null>(null);
  const [validationError, setValidationError] = useState('');
  const [viewingImage, setViewingImage] = useState<{ title: string; url: string } | null>(null);

  // Form State for Barang Keluar
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

  // Transfer (Pindah Barang) Modal States
  const [transferModalItem, setTransferModalItem] = useState<TransaksiKeluar | null>(null);
  const [transferNoTransaksi, setTransferNoTransaksi] = useState('');
  const [transferTanggal, setTransferTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [transferPenerimaBaru, setTransferPenerimaBaru] = useState('');
  const [transferJumlah, setTransferJumlah] = useState(1);
  const [transferModel, setTransferModel] = useState('');
  const [transferSN, setTransferSN] = useState('');
  const [transferKeperluan, setTransferKeperluan] = useState('');
  const [transferFotoBukti, setTransferFotoBukti] = useState<string>('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [transferError, setTransferError] = useState('');

  // Recall (Tarik Kembali) States
  const [recallModalItem, setRecallModalItem] = useState<TransaksiKeluar | null>(null);
  const [recallReason, setRecallReason] = useState('');
  const [recallCondition, setRecallCondition] = useState<'Baik' | 'Perbaikan' | 'Rusak'>('Baik');
  const [recallError, setRecallError] = useState('');

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

  // Map of serial numbers already issued in prior OUT- transactions
  const issuedSerialsMap = React.useMemo(() => {
    const map: Record<string, { no_transaksi: string; penerima: string; tanggal: string }> = {};
    transaksiKeluar.forEach((t) => {
      if (t.serial_number && !t.no_transaksi.startsWith('TRF-')) {
        const sns = t.serial_number.split(/[,;\n]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
        sns.forEach((sn) => {
          map[sn] = {
            no_transaksi: t.no_transaksi,
            penerima: t.penerima,
            tanggal: t.tanggal,
          };
        });
      }
    });
    return map;
  }, [transaksiKeluar]);

  // Parsed current serial numbers in form input
  const parsedCurrentSNs = React.useMemo(() => {
    return serialNumber
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [serialNumber]);

  // Check if user entered duplicate SNs in same input
  const internalDuplicateSN = React.useMemo(() => {
    const upperList = parsedCurrentSNs.map((s) => s.toUpperCase());
    return parsedCurrentSNs.find((sn, idx) => upperList.indexOf(sn.toUpperCase()) !== idx);
  }, [parsedCurrentSNs]);

  // Check if any SN in input has already been issued
  const alreadyIssuedSN = React.useMemo(() => {
    return parsedCurrentSNs.find((sn) => issuedSerialsMap[sn.toUpperCase()]);
  }, [parsedCurrentSNs, issuedSerialsMap]);

  const handleOpenAdd = () => {
    const nextSeq = transaksiKeluar.length + 1;
    const today = new Date();
    const yyyymm = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const initialItem = barang[0];
    const initialId = initialItem?.id || 1;

    setNoTransaksi(`OUT-${yyyymm}-${String(nextSeq).padStart(3, '0')}`);
    setTanggal(new Date().toISOString().slice(0, 10));
    setPenerima('');
    setDepartemen(departemenList[0] || 'Divisi Pengembangan TI');
    setBarangId(initialId);
    setJumlah(1);
    setModel(initialItem?.model || '');

    // Auto-fetch first AVAILABLE (non-issued) serial number from item data
    if (initialItem?.serial_number) {
      const sns = initialItem.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
      const avail = sns.find((sn) => !issuedSerialsMap[sn.toUpperCase()]);
      setSerialNumber(avail || '');
    } else {
      setSerialNumber('');
    }

    setKeperluan('Kebutuhan operasional unit kerja');
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
      if (targetItem.serial_number) {
        const sns = targetItem.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
        const avail = sns.find((sn) => !issuedSerialsMap[sn.toUpperCase()]);
        setSerialNumber(avail || '');
      } else {
        setSerialNumber('');
      }
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

  const handleRemoveImage = () => {
    setFotoBukti('');
  };

  // Handlers for Pindah Barang (Transfer)
  const handleOpenTransferModal = (trx: TransaksiKeluar) => {
    const nextSeq = transaksiKeluar.length + 1;
    const today = new Date();
    const yyyymm = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const targetItem = barang.find((b) => b.id === trx.barang_id);

    setTransferModalItem(trx);
    setTransferNoTransaksi(`TRF-${yyyymm}-${String(nextSeq).padStart(3, '0')}`);
    setTransferTanggal(new Date().toISOString().slice(0, 10));
    setTransferPenerimaBaru('');

    setTransferJumlah(trx.jumlah || 1);
    setTransferModel(trx.model || targetItem?.model || '');
    setTransferSN(trx.serial_number || '');
    setTransferKeperluan(`Perpindahan serah terima unit dari ${trx.penerima}`);
    setTransferFotoBukti('');
    setTransferError('');
  };

  const handleFetchTransferSerial = () => {
    if (!transferModalItem) return;

    const sourceSNs = transferModalItem.serial_number
      ? transferModalItem.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
      : [];

    const currentSNs = transferSN
      .split(/[,;\n]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    // Find first SN from source that is NOT in current input
    const nextSN = sourceSNs.find((sn) => !currentSNs.includes(sn.toUpperCase()));

    if (nextSN) {
      setTransferSN((prev) => (prev ? `${prev}, ${nextSN}` : nextSN));
      setTransferError('');
    } else if (sourceSNs.length > 0) {
      setTransferError('Semua Serial Number dari transaksi asal sudah dimasukkan ke formulir.');
    } else {
      setTransferError('Transaksi asal tidak memiliki data Serial Number.');
    }
  };

  const handleTransferImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setTransferError('Ukuran foto bukti transfer maksimal 2 MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setTransferFotoBukti(dataUrl);
      setTransferError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalItem) return;

    if (!transferPenerimaBaru.trim()) {
      setTransferError('Nama Penerima / PIC Baru wajib diisi!');
      return;
    }

    const newTrx: TransaksiKeluar = {
      id: Date.now(),
      no_transaksi: transferNoTransaksi,
      tanggal: transferTanggal,
      penerima: transferPenerimaBaru.trim(),
      departemen: transferModalItem.departemen || 'Operasional',
      barang_id: transferModalItem.barang_id,
      jumlah: transferJumlah > 0 ? transferJumlah : 1,
      model: transferModel.trim() || undefined,
      serial_number: transferSN.trim() || undefined,
      keperluan: transferKeperluan.trim() || `Perpindahan serah terima unit ke ${transferPenerimaBaru.trim()}`,
      foto_bukti: transferFotoBukti || undefined,
      petugas_id: user?.id || 1,
      created_at: new Date().toISOString(),
    };

    const res = addTransaksiKeluar(newTrx);
    if (res.success) {
      // Synchronize the original outbound record with the new recipient
      updateTransaksiKeluar(transferModalItem.id, {
        penerima: transferPenerimaBaru.trim(),
        departemen: transferModalItem.departemen || 'Operasional'
      });
      
      setTransferModalItem(null);
      setSelectedDO(newTrx);
    } else {
      setTransferError(res.message);
    }
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
      setValidationError('Jumlah barang keluar minimal 1!');
      return;
    }

    if (targetItem.stok < jumlah) {
      setValidationError(
        `Stok tidak mencukupi! Stok saat ini untuk "${targetItem.nama_barang}" hanya ${targetItem.stok} unit.`
      );
      return;
    }

    if (internalDuplicateSN) {
      setValidationError(`Serial Number "${internalDuplicateSN}" ditulis ganda/dobel pada formulir ini. Harap hapus duplikatnya.`);
      return;
    }

    if (alreadyIssuedSN) {
      const prev = issuedSerialsMap[alreadyIssuedSN.toUpperCase()];
      setValidationError(`Serial Number "${alreadyIssuedSN}" TIDAK DAPAT DIGUNAKAN karena sudah pernah dikeluarkan pada transaksi ${prev.no_transaksi} (${prev.penerima} - ${prev.tanggal}).`);
      return;
    }

    const res = addTransaksiKeluar({
      no_transaksi: noTransaksi,
      tanggal,
      penerima,
      departemen: departemen || 'Divisi Pengembangan TI',
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

  const handleExecuteRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallModalItem) return;
    if (!recallReason.trim()) {
      setRecallError('Alasan penarikan barang wajib diisi!');
      return;
    }

    const res = recallTransaksiKeluar(recallModalItem.id, recallReason, recallCondition);
    if (res.success) {
      setRecallModalItem(null);
      setRecallReason('');
      setRecallCondition('Baik');
    } else {
      setRecallError(res.message);
    }
  };

  const filteredTransactions = transaksiKeluar.filter((t) => {
    // Filter: Only show standard Outbound (OUT-), exclude Transfers (TRF-)
    if (t.no_transaksi.startsWith('TRF-')) return false;

    const itm = barang.find((b) => b.id === t.barang_id);
    const search = searchTerm.toLowerCase();
    return (
      t.no_transaksi.toLowerCase().includes(search) ||
      t.penerima.toLowerCase().includes(search) ||
      t.departemen.toLowerCase().includes(search) ||
      (t.model && t.model.toLowerCase().includes(search)) ||
      (t.serial_number && t.serial_number.toLowerCase().includes(search)) ||
      (itm && itm.nama_barang.toLowerCase().includes(search))
    );
  });

  const getLatestRecipient = (originalTrx: TransaksiKeluar) => {
    if (!originalTrx.serial_number) return { penerima: originalTrx.penerima, departemen: originalTrx.departemen };

    const sns = originalTrx.serial_number
      .split(/[,;\n]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    // Find the latest transaction that contains any of these SNs
    const latest = [...transaksiKeluar]
      .filter((t) => t.serial_number)
      .filter((t) => {
        const tSns = t.serial_number!.split(/[,;\n]+/).map((s) => s.trim().toUpperCase());
        return sns.some((sn) => tSns.includes(sn));
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    return latest
      ? { penerima: latest.penerima, departemen: latest.departemen, isMoved: latest.id !== originalTrx.id }
      : { penerima: originalTrx.penerima, departemen: originalTrx.departemen, isMoved: false };
  };

  const selectedItemStock = barang.find((b) => b.id === Number(barangId))?.stok || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Transaksi Barang Keluar
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan distribusi barang ke departemen/divisi dengan validasi stok ketat.
          </p>
        </div>

        {can('manage_inventory') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-2xl shadow-lg shadow-orange-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Barang Keluar</span>
          </button>
        )}
      </div>

      {/* Table Outbound */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari no transaksi, penerima, atau divisi..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">No. Transaksi</th>
                <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                <th className="px-6 py-4 whitespace-nowrap">Penerima</th>
                <th className="px-6 py-4 whitespace-nowrap">Barang</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Jumlah</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Foto</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Cetak</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    Belum ada rekaman transaksi barang keluar.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const itm = barang.find((b) => b.id === trx.barang_id);
                  const petugas = users.find((u) => u.id === trx.petugas_id);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {trx.no_transaksi}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono whitespace-nowrap">
                        {trx.tanggal}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {(() => {
                          const latest = getLatestRecipient(trx);
                          return (
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1.5">
                                {latest.penerima}
                                {latest.isMoved && (
                                  <span className="text-[9px] bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full font-bold">
                                    Pindahan
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {latest.departemen}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {itm?.nama_barang || `Barang #${trx.barang_id}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {itm?.kode_barang}
                          {trx.model && ` · ${trx.model}`}
                        </div>
                        {trx.serial_number && (
                          <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono font-bold mt-0.5 whitespace-nowrap">
                            SN: {trx.serial_number}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-black font-mono text-sm whitespace-nowrap">
                        <span className="text-orange-600 dark:text-orange-400">-{trx.jumlah}</span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {trx.foto_bukti ? (
                          <button
                            onClick={() =>
                              setViewingImage({
                                title: `Foto Bukti ${trx.no_transaksi}`,
                                url: trx.foto_bukti!,
                              })
                            }
                            className="p-1 rounded bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-orange-950/40"
                          >
                            <ImageIcon className="w-4 h-4 text-orange-600" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDO(trx)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenTransferModal(trx)}
                            className="p-1.5 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900 transition-all active:scale-90"
                            title="Pindah Barang"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setRecallModalItem(trx);
                              setRecallReason('');
                              setRecallError('');
                            }}
                            className="p-1.5 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900 transition-all active:scale-90"
                            title="Tarik Kembali"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
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

      {/* Modal: Input Barang Keluar */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Pengeluaran Barang (DO)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>

            {validationError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel required>No. Transaksi</FormLabel>
                  <FormInput type="text" required value={noTransaksi} onChange={(e) => setNoTransaksi(e.target.value)} readOnly className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono uppercase" />
                </div>
                <div>
                  <FormLabel required>Tanggal</FormLabel>
                  <FormInput type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
                </div>
              </div>

              <div>
                <FormLabel required>Penerima</FormLabel>
                <FormInput type="text" required value={penerima} onChange={(e) => setPenerima(e.target.value)} placeholder="Nama Penerima / PIC" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <FormLabel required>Departemen</FormLabel>
                    <FormSelect value={departemen} onChange={(e) => setDepartemen(e.target.value)} required>
                      {departemenList.map(d => <option key={d} value={d}>{d}</option>)}
                    </FormSelect>
                 </div>
                 <div>
                    <FormLabel required>Barang</FormLabel>
                    <FormSelect value={barangId} onChange={(e) => handleBarangChange(Number(e.target.value))} required>
                      {barang.map(b => <option key={b.id} value={b.id}>{b.nama_barang} (Stok: {b.stok})</option>)}
                    </FormSelect>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel>Model / Tipe</FormLabel>
                  <FormInput type="text" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
                <div>
                  <FormLabel>Serial Number</FormLabel>
                  <div className="relative">
                    <FormInput type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono" />
                    <button type="button" onClick={() => setShowQRScanner(true)} className="absolute right-3 top-2.5 text-slate-400 hover:text-orange-600"><Camera className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <div>
                <FormLabel required>Jumlah Barang</FormLabel>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500">Stok Tersedia: <strong className="text-slate-800 dark:text-slate-200">{selectedItemStock}</strong></span>
                </div>
                <FormInput type="number" min="1" max={selectedItemStock} required value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-orange-600" />
              </div>

              <div>
                <FormLabel required>Keperluan</FormLabel>
                <textarea
                  rows={2}
                  required
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Alasan pengeluaran barang..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500/20 transition-all outline-hidden"
                />
              </div>

              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <FormLabel>Foto Bukti</FormLabel>
                <label className="flex items-center gap-3 cursor-pointer mt-2 hover:opacity-80">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-orange-600 overflow-hidden">
                    {fotoBukti ? <img src={fotoBukti} className="w-full h-full object-cover" /> : <Camera className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-bold text-slate-500">{fotoBukti ? 'Ganti Foto' : 'Ambil Foto Bukti...'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 transition-all active:scale-95">Simpan Transaksi</button>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal Integration */}
      <BarcodeScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={(scannedVal) => {
          if (issuedSerialsMap[scannedVal.toUpperCase()]) {
            const prev = issuedSerialsMap[scannedVal.toUpperCase()];
            setValidationError(`Barcode ${scannedVal} SUDAH PERNAH DIKELUARKAN pada transaksi ${prev.no_transaksi}!`);
          } else {
            setSerialNumber((prev) => (prev ? `${prev}, ${scannedVal}` : scannedVal));
            setValidationError('');
          }
        }}
        title="Scan Serial Number"
        registeredSerials={
          barang
            .find((b) => b.id === Number(barangId))
            ?.serial_number?.split(/[,;\n]+/)
            .map((s) => s.trim())
            .filter(Boolean) || []
        }
      />

      {/* Modal: Pindah Barang */}
      {transferModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-purple-50/30 dark:bg-purple-950/20">
              <div className="flex items-center gap-2">
                 <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                 <h3 className="text-base font-black text-slate-900 dark:text-white">Perpindahan Barang</h3>
              </div>
              <button onClick={() => setTransferModalItem(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>

            {transferError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{transferError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTransfer} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-2">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Informasi Asal</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                   <div>
                      <div className="text-slate-500">Barang:</div>
                      <div className="font-bold">{barang.find(b => b.id === transferModalItem.barang_id)?.nama_barang}</div>
                   </div>
                   <div>
                      <div className="text-slate-500">PIC Asal:</div>
                      <div className="font-bold">{transferModalItem.penerima}</div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel required>No. Dokumen</FormLabel>
                  <FormInput type="text" value={transferNoTransaksi} onChange={(e) => setTransferNoTransaksi(e.target.value)} required readOnly className="bg-slate-50 dark:bg-slate-800 font-mono" />
                </div>
                <div>
                  <FormLabel required>Tanggal</FormLabel>
                  <FormInput type="date" value={transferTanggal} onChange={(e) => setTransferTanggal(e.target.value)} required />
                </div>
              </div>

              <div>
                <FormLabel required>Penerima / PIC Baru</FormLabel>
                <FormInput type="text" required value={transferPenerimaBaru} onChange={(e) => setTransferPenerimaBaru(e.target.value)} placeholder="Nama PIC Baru" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <FormLabel required>Jumlah</FormLabel>
                    <FormInput type="number" min="1" value={transferJumlah} onChange={(e) => setTransferJumlah(Number(e.target.value))} required />
                 </div>
                 <div>
                    <FormLabel>Serial Number</FormLabel>
                    <div className="flex gap-1">
                      <FormInput type="text" value={transferSN} onChange={(e) => setTransferSN(e.target.value)} className="font-mono" />
                      <button type="button" onClick={handleFetchTransferSerial} className="p-2.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-xl hover:bg-purple-200"><Barcode className="w-4 h-4" /></button>
                    </div>
                 </div>
              </div>

              <div>
                <FormLabel required>Alasan Perpindahan</FormLabel>
                <textarea
                  rows={2}
                  required
                  value={transferKeperluan}
                  onChange={(e) => setTransferKeperluan(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all outline-hidden"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition-all active:scale-95">Proses Perpindahan</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Recall */}
      {recallModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/30 dark:bg-amber-950/20">
               <div className="flex items-center gap-2">
                 <RotateCcw className="w-5 h-5 text-amber-600" />
                 <h3 className="text-base font-black text-slate-900 dark:text-white">Tarik Kembali Barang</h3>
               </div>
               <button onClick={() => setRecallModalItem(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleExecuteRecall} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 text-xs">
                 <div className="font-bold text-amber-700 mb-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Perhatian</div>
                 <p className="text-slate-600 dark:text-slate-400">Anda akan menarik kembali <strong className="text-slate-900 dark:text-white">{recallModalItem.jumlah} unit</strong> barang dari <strong className="text-slate-900 dark:text-white">{recallModalItem.penerima}</strong> ke gudang.</p>
              </div>

              <div>
                <FormLabel required>Kondisi Barang</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                   {(['Baik', 'Perbaikan', 'Rusak'] as const).map(k => (
                     <button
                       key={k}
                       type="button"
                       onClick={() => setRecallCondition(k)}
                       className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                         recallCondition === k
                           ? k === 'Baik' ? 'bg-emerald-600 text-white border-emerald-600' : k === 'Rusak' ? 'bg-red-600 text-white border-red-600' : 'bg-amber-600 text-white border-amber-600'
                           : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                       }`}
                     >
                       {k}
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <FormLabel required>Alasan Penarikan</FormLabel>
                <textarea
                  rows={3}
                  required
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                  placeholder="Keterangan penarikan..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-amber-500/20 transition-all outline-hidden"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                 <Undo2 className="w-4 h-4" />
                 <span>Proses Penarikan</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Full Image */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-2xl overflow-hidden">
               <img src={viewingImage.url} alt={viewingImage.title} className="max-h-[80vh] w-auto rounded-2xl" />
               <div className="p-4 text-center font-bold text-slate-900 dark:text-white">{viewingImage.title}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Print DO */}
      {selectedDO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Cetak Surat Jalan</h3>
              <button onClick={() => setSelectedDO(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-6 text-slate-800 dark:text-slate-200 overflow-y-auto print:p-0">
               <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h1 className="text-xl font-black text-orange-600 tracking-tight">SURAT JALAN</h1>
                    <p className="text-xs text-slate-500 font-mono">{selectedDO.no_transaksi}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold">Unit Logistik</p>
                    <p>{selectedDO.tanggal}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Penerima:</p>
                    <p className="font-bold text-sm">{selectedDO.penerima}</p>
                    <p className="text-slate-500">{selectedDO.departemen}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Keterangan:</p>
                    <p className="italic">{selectedDO.keperluan}</p>
                  </div>
               </div>

               <div className="border-y py-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">
                        <th className="text-left pb-2">Barang</th>
                        <th className="text-right pb-2">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">
                           <p className="font-bold">{barang.find(b => b.id === selectedDO.barang_id)?.nama_barang}</p>
                           <p className="text-slate-500 font-mono text-[10px]">{barang.find(b => b.id === selectedDO.barang_id)?.kode_barang} {selectedDO.serial_number && `· SN: ${selectedDO.serial_number}`}</p>
                        </td>
                        <td className="text-right font-black py-2">{selectedDO.jumlah} Unit</td>
                      </tr>
                    </tbody>
                  </table>
               </div>

               <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
                  <div>
                    <div className="h-16 mb-2"></div>
                    <p className="font-bold border-t pt-1">Kepala Logistik</p>
                  </div>
                  <div>
                    <div className="h-16 mb-2"></div>
                    <p className="font-bold border-t pt-1">Penerima</p>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
              <button onClick={() => setSelectedDO(null)} className="flex-1 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-2xl transition-all">Tutup</button>
              <button onClick={() => window.print()} className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                 <Printer className="w-4 h-4" />
                 <span>Cetak Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
