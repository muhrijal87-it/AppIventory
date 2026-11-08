import React, { useState } from 'react';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import {
  ArrowUpFromLine,
  Plus,
  Search,
  Printer,
  X,
  AlertCircle,
  UserCheck,
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  Camera,
  CheckCircle2,
  Barcode,
  ArrowRightLeft,
  ArrowRight,
  Package,
  Layers,
} from 'lucide-react';
import { TransaksiKeluar } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

interface TransaksiKeluarViewProps {
  onNavigate?: (view: string) => void;
}

export const TransaksiKeluarView: React.FC<TransaksiKeluarViewProps> = ({ onNavigate }) => {
  const { transaksiKeluar, barang, departemen: masterDepartemen, addTransaksiKeluar } = useInventory();
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
  const [departemen, setDepartemen] = useState(
    masterDepartemen && masterDepartemen.length > 0
      ? masterDepartemen[0].nama_departemen
      : 'Divisi Pengembangan TI'
  );
  const [barangId, setBarangId] = useState<number>(barang[0]?.id || 1);
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

    // Auto-fetch serial number from item data
    if (initialItem?.serial_number) {
      const sns = initialItem.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
      setSerialNumber(sns[0] || initialItem.serial_number);
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
        setSerialNumber(sns[0] || targetItem.serial_number);
      } else {
        setSerialNumber('');
      }
    }
  };

  const handleFetchSerial = () => {
    const targetItem = barang.find((b) => b.id === Number(barangId));
    if (targetItem) {
      if (targetItem.model) setModel(targetItem.model);
      if (targetItem.serial_number) {
        const sns = targetItem.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
        setSerialNumber(sns[0] || targetItem.serial_number);
      } else {
        setSerialNumber(`SN-${targetItem.kode_barang}-${Math.floor(1000 + Math.random() * 9000)}`);
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

    const res = addTransaksiKeluar({
      no_transaksi: noTransaksi,
      tanggal,
      penerima,
      departemen: '-',
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

  const filteredTransactions = transaksiKeluar.filter((t) => {
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

  const selectedItemStock = barang.find((b) => b.id === Number(barangId))?.stok || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Transaksi Barang Keluar (Outbound / Distribusi)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan distribusi barang ke departemen/divisi dengan validasi stok ketat dan lampiran foto bukti penyerahan.
          </p>
        </div>

        {can('manage_inventory') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Barang Keluar</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari no transaksi, penerima, atau divisi..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* Table Outbound */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3.5 py-3 whitespace-nowrap">No. Transaksi</th>
                <th className="px-3 py-3 whitespace-nowrap">Tanggal</th>
                <th className="px-3 py-3 whitespace-nowrap">Penerima</th>
                <th className="px-3.5 py-3 whitespace-nowrap">Barang Dikeluarkan</th>
                <th className="px-2.5 py-3 text-right whitespace-nowrap">Jumlah</th>
                <th className="px-2.5 py-3 text-center whitespace-nowrap">Foto Bukti</th>
                <th className="px-3 py-3 whitespace-nowrap">Keperluan</th>
                <th className="px-2.5 py-3 whitespace-nowrap">Petugas</th>
                <th className="px-2.5 py-3 text-center whitespace-nowrap">Cetak</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">Pindah Barang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Belum ada rekaman transaksi barang keluar yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const itm = barang.find((b) => b.id === trx.barang_id);
                  const petugas = users.find((u) => u.id === trx.petugas_id);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {trx.no_transaksi}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 font-mono whitespace-nowrap">
                        {trx.tanggal}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {trx.penerima}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          {itm?.nama_barang || `Barang #${trx.barang_id}`}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {itm?.kode_barang}
                          {trx.model && ` · Model: ${trx.model}`}
                        </div>
                        {trx.serial_number && (
                          <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono font-medium mt-0.5 whitespace-nowrap">
                            SN: {trx.serial_number}
                          </div>
                        )}
                      </td>
                      <td className="px-2.5 py-2.5 text-right font-mono font-bold text-sm whitespace-nowrap">
                        {trx.no_transaksi.startsWith('TRF-') ? (
                          <div className="flex flex-col items-end">
                            <span className="text-purple-600 dark:text-purple-400 font-bold">{trx.jumlah} unit</span>
                            <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                              Pindah · Stok Tetap
                            </span>
                          </div>
                        ) : (
                          <span className="text-orange-600 dark:text-orange-400 font-bold">-{trx.jumlah}</span>
                        )}
                      </td>
                      <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                        {trx.foto_bukti ? (
                          <button
                            onClick={() =>
                              setViewingImage({
                                title: `Foto Bukti Pengeluaran ${trx.no_transaksi}`,
                                url: trx.foto_bukti!,
                              })
                            }
                            className="group relative inline-block p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Klik untuk melihat foto bukti"
                          >
                            <img
                              src={trx.foto_bukti}
                              alt="Bukti"
                              className="w-8 h-8 object-cover rounded border border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform"
                            />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Tanpa foto</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 max-w-[200px] truncate" title={trx.keperluan}>
                        {trx.keperluan || '-'}
                      </td>
                      <td className="px-2.5 py-2.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {petugas?.username || 'Staff'}
                      </td>
                      <td className="px-2.5 py-2.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDO(trx)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs"
                          title="Cetak Surat Jalan / Bukti Pengeluaran"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenTransferModal(trx)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 dark:text-purple-300 dark:bg-purple-950/70 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 transition-all shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap"
                          title="Pindahkan barang ini ke divisi / departemen lain"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Pindah Barang</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Input Barang Keluar (with Image Upload) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <ArrowUpFromLine className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Formulir Pengeluaran Barang (Surat Jalan / DO)
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {validationError && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto scrollbar-thin flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    No. Transaksi / DO <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={noTransaksi}
                    onChange={(e) => setNoTransaksi(e.target.value)}
                    className="w-full px-3 py-2 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Pengeluaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Penerima <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={penerima}
                  onChange={(e) => setPenerima(e.target.value)}
                  placeholder="Contoh: Bpk. Bambang Sutrisno"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Barang yang Dikeluarkan <span className="text-red-500">*</span>
                </label>
                <select
                  value={barangId}
                  onChange={(e) => handleBarangChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  {barang.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.kode_barang} - {b.nama_barang} (Tersedia: {b.stok} unit)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Model / Tipe Barang
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Contoh: Hytera MD788G / ThinkPad L14"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-medium text-slate-700 dark:text-slate-300">
                      Serial Number
                    </label>
                    <button
                      type="button"
                      onClick={handleFetchSerial}
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline flex items-center gap-1"
                      title="Ambil data serial number dari master barang"
                    >
                      <Barcode className="w-3.5 h-3.5" />
                      <span>Ambil Serial Number</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Contoh: SN-8829104-X, SN-8829105-Y"
                      className="w-full pl-3 pr-10 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQRScanner(true)}
                      className="absolute right-2 top-2 p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Scan Barcode/QR"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <BarcodeScannerModal
                    isOpen={showQRScanner}
                    onClose={() => setShowQRScanner(false)}
                    onScan={(scannedVal) => setSerialNumber(scannedVal)}
                    title="Scan Barcode / QR Serial Number"
                    registeredSerials={
                      barang
                        .find((b) => b.id === Number(barangId))
                        ?.serial_number?.split(/[,;\n]+/)
                        .map((s) => s.trim())
                        .filter(Boolean) || []
                    }
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    Jumlah Barang Dikeluarkan <span className="text-red-500">*</span>
                  </label>
                  <span className="text-slate-500 text-[11px] font-mono">
                    Stok Tersedia Saat Ini: <strong className="text-slate-800 dark:text-slate-200">{selectedItemStock}</strong>
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedItemStock}
                  required
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-orange-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Keperluan / Deskripsi Distribusi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Contoh: Penggantian perangkat monitor staf finance, disposisi pimpinan..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* INPUT GAMBAR / FOTO BUKTI PENGELUARAN */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
                <label className="block font-semibold text-slate-800 dark:text-slate-200">
                  Foto Bukti Penyerahan / Dokumentasi Surat Jalan Fisik
                </label>
                <p className="text-[11px] text-slate-500">
                  Unggah foto tanda tangan penerima, foto serah terima fisik barang, atau nota pengeluaran (format JPG, PNG, WebP).
                </p>

                {fotoBukti ? (
                  <div className="relative mt-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <img
                      src={fotoBukti}
                      alt="Preview Bukti"
                      className="w-16 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                      onClick={() => setViewingImage({ title: 'Preview Foto Bukti', url: fotoBukti })}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Foto Berhasil Dimuat</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Tersimpan dalam database rekaman transaksi (base64 string).
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewingImage({ title: 'Preview Foto Bukti', url: fotoBukti })}
                        className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Lihat ukuran penuh"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white dark:bg-slate-900">
                      <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-orange-600 dark:text-orange-400 hover:underline">
                          Klik untuk memilih foto
                        </span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Atau seret file gambar langsung ke sini (Maks. 2 MB)
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
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors"
                >
                  Simpan Transaksi Keluar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-4 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
              <span className="font-semibold">{viewingImage.title}</span>
              <button
                onClick={() => setViewingImage(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center items-center max-h-[70vh] overflow-hidden rounded-lg bg-black/40">
              <img
                src={viewingImage.url}
                alt="Full View"
                className="max-h-[68vh] max-w-full object-contain rounded"
              />
            </div>
            <div className="flex justify-end pt-3 mt-2 border-t border-slate-800">
              <button
                onClick={() => setViewingImage(null)}
                className="px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Pindah Barang Antar Departemen */}
      {transferModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-300">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Formulir Perpindahan Barang Antar Departemen
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mutasi dan serah terima unit operasional ke departemen / divisi lain
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTransferModalItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner */}
            {transferError && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{transferError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveTransfer} className="p-6 space-y-4 text-xs overflow-y-auto scrollbar-thin flex-1">
              {/* Unit Info Card */}
              {(() => {
                const targetBarang = barang.find((b) => b.id === transferModalItem.barang_id);
                const allSNs = targetBarang?.serial_number
                  ? targetBarang.serial_number.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
                  : [];

                return (
                  <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        Informasi Unit yang Dipindahkan
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-purple-100 dark:border-purple-900">
                        Ref Asal: {transferModalItem.no_transaksi}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                      <div>
                        <div className="text-slate-400">Nama Barang:</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {targetBarang?.nama_barang || `Barang #${transferModalItem.barang_id}`}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {targetBarang?.kode_barang}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Departemen / PIC Saat Ini:</div>
                        <div className="font-semibold text-purple-700 dark:text-purple-300">
                          {transferModalItem.departemen}
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400">
                          PIC Asal: <span className="font-medium">{transferModalItem.penerima}</span>
                        </div>
                      </div>
                    </div>

                    {allSNs.length > 0 && (
                      <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
                        <span className="text-[10px] text-slate-500 block mb-1">
                          Pilih Serial Number Unit dari Data:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {allSNs.map((sn, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setTransferSN(sn)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                transferSN === sn
                                  ? 'bg-purple-600 text-white font-bold'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-purple-400'
                              }`}
                            >
                              {sn}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2 font-medium">
                <ArrowRightLeft className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Info Perpindahan:</span> Perpindahan barang tidak mengurangi sisa stok di gudang. Jumlah sisa stok tetap dipertahankan.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    No. Dokumen Perpindahan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transferNoTransaksi}
                    onChange={(e) => setTransferNoTransaksi(e.target.value)}
                    className="w-full px-3 py-2 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Perpindahan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={transferTanggal}
                    onChange={(e) => setTransferTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Penerima / PIC Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Riko Gunawan, S.Kom"
                    value={transferPenerimaBaru}
                    onChange={(e) => setTransferPenerimaBaru(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Jumlah Unit Dipindahkan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={transferJumlah}
                    onChange={(e) => setTransferJumlah(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Model and Serial Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Model Barang
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Hytera MD788G"
                    value={transferModel}
                    onChange={(e) => setTransferModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Serial Number (SN) Unit
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 23016A0157"
                    value={transferSN}
                    onChange={(e) => setTransferSN(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Keperluan / Catatan Perpindahan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={transferKeperluan}
                  onChange={(e) => setTransferKeperluan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  placeholder="Keterangan alokasi pemindahan atau mutasi antar divisi..."
                />
              </div>

              {/* Foto Bukti Serah Terima */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40">
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Foto Bukti Serah Terima / Nota Mutasi Fisik
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Unggah foto fisik tanda tangan serah terima, foto unit, atau dokumen perpindahan.
                </p>

                {transferFotoBukti ? (
                  <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <img
                      src={transferFotoBukti}
                      alt="Bukti Transfer"
                      className="w-16 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap Dilampirkan
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTransferFotoBukti('')}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-colors">
                    <Camera className="w-6 h-6 text-purple-600 mb-1" />
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      Klik untuk memilih foto
                    </span>
                    <span className="text-[10px] text-slate-400">Maksimal 2 MB (JPG, PNG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTransferImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferModalItem(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Simpan &amp; Proses Pindah Barang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Delivery Order (Surat Jalan) Modal */}
      {selectedDO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-xl w-full max-w-lg p-6 shadow-2xl text-xs print:p-0 print:shadow-none max-h-[90vh] overflow-y-auto">
            {/* DO Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedDO.no_transaksi.startsWith('TRF-')
                    ? 'SURAT BUKTI PERPINDAHAN BARANG'
                    : 'SURAT PENGELUARAN BARANG (DO)'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {selectedDO.no_transaksi.startsWith('TRF-')
                    ? 'Serah Terima & Mutasi Antar Unit/Departemen'
                    : 'Unit Logistik & Gudang Inventaris'}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-orange-600">{selectedDO.no_transaksi}</span>
                <p className="text-[11px] text-slate-500">{selectedDO.tanggal}</p>
              </div>
            </div>

            {/* DO Meta */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b text-[11px]">
              <div>
                <span className="text-slate-400 block">Nama Penerima:</span>
                <span className="font-bold text-slate-800">{selectedDO.penerima}</span>
                {selectedDO.departemen && selectedDO.departemen !== '-' && (
                  <p className="text-slate-600">Departemen: {selectedDO.departemen}</p>
                )}
              </div>
              <div>
                <span className="text-slate-400 block">Keperluan:</span>
                <span className="font-medium text-slate-800">{selectedDO.keperluan}</span>
              </div>
            </div>

            {/* Item Table */}
            <div className="py-4">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 font-semibold">
                  <tr>
                    <th className="p-2">Kode</th>
                    <th className="p-2">Item Barang</th>
                    <th className="p-2 text-right">Jumlah Dikeluarkan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-mono">
                      {barang.find((b) => b.id === selectedDO.barang_id)?.kode_barang}
                    </td>
                    <td className="p-2 font-medium">
                      <div>{barang.find((b) => b.id === selectedDO.barang_id)?.nama_barang}</div>
                      {selectedDO.model && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Model: {selectedDO.model}
                        </div>
                      )}
                      {selectedDO.serial_number && (
                        <div className="text-[10px] text-slate-700 font-mono font-semibold">
                          SN: {selectedDO.serial_number}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-orange-600">
                      {selectedDO.jumlah} Unit
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Attached Image on DO if present */}
            {selectedDO.foto_bukti && (
              <div className="my-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-[11px] text-slate-700 block mb-1.5">
                  Lampiran Foto Bukti Penyerahan:
                </span>
                <img
                  src={selectedDO.foto_bukti}
                  alt="Lampiran Bukti"
                  className="max-h-40 w-auto rounded border border-slate-300 object-contain mx-auto"
                />
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 pb-4 text-center text-[11px]">
              <div>
                <div className="text-slate-500 mb-12">Petugas Gudang</div>
                <div className="border-t border-slate-300 pt-1 font-semibold">( Kepala Logistik )</div>
              </div>
              <div>
                <div className="text-slate-500 mb-12">Yang Menerima</div>
                <div className="border-t border-slate-300 pt-1 font-semibold">({selectedDO.penerima})</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t no-print">
              <button
                onClick={() => setSelectedDO(null)}
                className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Surat Jalan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
