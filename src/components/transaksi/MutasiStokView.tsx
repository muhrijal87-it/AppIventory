import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Package,
  ArrowRight,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Building,
  MapPin,
  UserCheck,
  Radio,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  X,
  Truck,
  TrendingUp,
  Boxes,
  Camera,
  Barcode,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { PillNotification } from '../common/PillNotification';

export const MutasiStokView: React.FC = () => {
  const { mutasiStok, barang, transferBarangRak } = useInventory();
  const { users, can } = useAuth();

  // View mode: 'flow' (visual flow cards Dari -> Ke) or 'table' (buku besar mutasi)
  const [viewMode, setViewMode] = useState<'flow' | 'table'>('flow');

  // Filters
  const [selectedBarangId, setSelectedBarangId] = useState<string>('all');
  const [selectedJenis, setSelectedJenis] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Real-time live monitoring state
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [recentHighlightedId, setRecentHighlightedId] = useState<number | null>(null);

  // Transfer Rak Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferBarang, setTransferBarang] = useState<number>(barang[0]?.id || 1);
  const [transferRakTujuan, setTransferRakTujuan] = useState('');
  const [transferJumlah, setTransferJumlah] = useState<number>(1);
  const [transferCatatan, setTransferCatatan] = useState('');
  const [transferError, setTransferError] = useState('');

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'search' | 'transfer_barang'>('search');
  const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  const handleScan = (scannedVal: string) => {
    const cleanVal = scannedVal.trim();
    if (!cleanVal) return;

    if (scannerMode === 'transfer_barang') {
      const matched = barang.find(
        (b) =>
          (b.barcode && b.barcode.toLowerCase() === cleanVal.toLowerCase()) ||
          b.kode_barang.toLowerCase() === cleanVal.toLowerCase() ||
          (b.serial_number && b.serial_number.toLowerCase().includes(cleanVal.toLowerCase()))
      );

      if (matched) {
        setTransferBarang(matched.id);
        setTransferError('');
        setScanFeedback({
          type: 'success',
          message: `Barang relokasi terpilih: "${matched.nama_barang}" (${matched.kode_barang}) - Rak asal: ${matched.lokasi_rak || 'Gudang Utama'}`,
        });
      } else {
        setTransferError(`Barcode "${cleanVal}" tidak cocok dengan barang di katalog.`);
      }
      setTimeout(() => setScanFeedback(null), 4000);
    } else if (scannerMode === 'search') {
      const matched = barang.find(
        (b) =>
          (b.barcode && b.barcode.toLowerCase() === cleanVal.toLowerCase()) ||
          b.kode_barang.toLowerCase() === cleanVal.toLowerCase()
      );

      if (matched) {
        setSelectedBarangId(String(matched.id));
        setSearchTerm('');
        setScanFeedback({
          type: 'success',
          message: `Menampilkan riwayat mutasi alur untuk "${matched.nama_barang}" (${matched.kode_barang})`,
        });
      } else {
        setSearchTerm(cleanVal);
        setScanFeedback({
          type: 'info',
          message: `Menyaring mutasi stok dengan kata kunci: "${cleanVal}"`,
        });
      }
      setTimeout(() => setScanFeedback(null), 4000);
    }
  };

  // Preset rack options for quick transfer
  const rackPresets = [
    'Rak A-1 (Gudang Utama - Elektronik)',
    'Rak A-2 (Gudang Utama - Peripheral)',
    'Rak B-1 (Gudang ATK - Kertas & Dokumen)',
    'Rak B-2 (Gudang ATK - Formulir & Kasir)',
    'Rak B-3 (Gudang ATK - Tinta & Toner)',
    'Rak C-1 (Peralatan Teknisi & Tooling)',
    'Rak C-2 (Peralatan Teknisi - Tool Presisi)',
    'Rak D-1 (Area Packing Logistik & Distribusi)',
    'Rak E-1 (Gudang Karantina & Quality Control)',
    'Rak Transit Lantai 2 (Temporary Staging)',
  ];

  // Highlight first item when mutasiStok changes
  useEffect(() => {
    if (mutasiStok.length > 0) {
      setRecentHighlightedId(mutasiStok[0].id);
      const timer = setTimeout(() => {
        setRecentHighlightedId(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [mutasiStok]);

  const handleOpenTransfer = () => {
    const defaultItem = barang[0];
    setTransferBarang(defaultItem?.id || 1);
    setTransferRakTujuan(rackPresets[1] || 'Rak A-2');
    setTransferJumlah(1);
    setTransferCatatan('Penyusunan ulang penataan rak gudang');
    setTransferError('');
    setShowTransferModal(true);
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    const target = barang.find((b) => b.id === Number(transferBarang));
    if (!target) {
      setTransferError('Barang tidak ditemukan!');
      return;
    }

    if (!transferRakTujuan.trim()) {
      setTransferError('Lokasi rak tujuan wajib dipilih atau diisi!');
      return;
    }

    if (transferJumlah <= 0) {
      setTransferError('Jumlah barang dipindahkan minimal 1!');
      return;
    }

    if (target.stok < transferJumlah) {
      setTransferError(`Stok tidak mencukupi! Stok saat ini: ${target.stok}`);
      return;
    }

    const res = transferBarangRak(
      Number(transferBarang),
      transferRakTujuan.trim(),
      Number(transferJumlah),
      transferCatatan
    );

    if (res.success) {
      setShowTransferModal(false);
      setLastSynced(new Date());
    } else {
      setTransferError(res.message);
    }
  };

  // Filtered mutations
  const filteredMutasi = mutasiStok.filter((m) => {
    const itm = barang.find((b) => b.id === m.barang_id);
    const matchesBarang = selectedBarangId === 'all' || m.barang_id === Number(selectedBarangId);
    const matchesJenis = selectedJenis === 'all' || m.jenis === selectedJenis;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      m.referensi.toLowerCase().includes(search) ||
      m.keterangan.toLowerCase().includes(search) ||
      (m.asal && m.asal.toLowerCase().includes(search)) ||
      (m.tujuan && m.tujuan.toLowerCase().includes(search)) ||
      (itm && itm.nama_barang.toLowerCase().includes(search)) ||
      (itm && itm.kode_barang.toLowerCase().includes(search));

    return matchesBarang && matchesJenis && matchesSearch;
  });

  // Calculate flow metrics
  const totalMasuk = mutasiStok.filter((m) => m.jenis === 'Masuk').reduce((acc, m) => acc + m.jumlah, 0);
  const totalKeluar = mutasiStok.filter((m) => m.jenis === 'Keluar').reduce((acc, m) => acc + m.jumlah, 0);
  const totalTransfer = mutasiStok.filter((m) => m.jenis === 'Transfer').reduce((acc, m) => acc + m.jumlah, 0);

  const exportCSV = () => {
    const headers = [
      'Waktu',
      'Kode Barang',
      'Nama Barang',
      'Jenis Mutasi',
      'Dari Mana (Asal)',
      'Ke Mana (Tujuan)',
      'Stok Sebelum',
      'Jumlah Fisik',
      'Stok Sesudah',
      'Referensi',
      'Keterangan',
      'Petugas',
    ];
    const rows = filteredMutasi.map((m) => {
      const itm = barang.find((b) => b.id === m.barang_id);
      const user = users.find((u) => u.id === m.petugas_id);
      return [
        m.tanggal,
        itm?.kode_barang || '-',
        `"${(itm?.nama_barang || '').replace(/"/g, '""')}"`,
        m.jenis,
        `"${(m.asal || '-').replace(/"/g, '""')}"`,
        `"${(m.tujuan || '-').replace(/"/g, '""')}"`,
        m.stok_sebelum,
        m.jumlah,
        m.stok_sesudah,
        m.referensi,
        `"${(m.keterangan || '').replace(/"/g, '""')}"`,
        user?.username || '-',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `histori_alur_barang_realtime_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedItemObj = selectedBarangId !== 'all' ? barang.find((b) => b.id === Number(selectedBarangId)) : null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-Time Stream Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-red-600" />
              <span>Histori &amp; Pelacakan Alur Barang (Dari Mana ke Mana)</span>
            </h2>
            {/* Live indicator badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE TRACKING REAL-TIME</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau pergerakan fisik barang secara langsung: sumber asal (supplier/rak) menuju tujuan akhir (departemen/rak transit) dengan stempel waktu presisi.
          </p>
        </div>

        {/* Real-time Controls & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setScannerMode('search');
              setShowScanner(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors shadow-xs"
            title="Scan Barcode / QR untuk melacak histori mutasi barang"
          >
            <Barcode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Scan Barcode / QR</span>
          </button>

          {can('manage_inventory') && (
            <button
              onClick={handleOpenTransfer}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors shadow-xs"
              title="Pindahkan barang dari satu rak ke rak lain"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Pindah Rak (Relokasi)</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            title="Unduh seluruh data histori pergerakan"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Barcode Scan Feedback Alert (Capsule Pill styling) */}
      {scanFeedback && (
        <div className="flex justify-start">
          <PillNotification
            type={scanFeedback.type}
            title={scanFeedback.type === 'success' ? 'Barang Teridentifikasi' : 'Info Pemindai'}
            message={scanFeedback.message}
            onClose={() => setScanFeedback(null)}
            className="w-full max-w-xl"
          />
        </div>
      )}

      {/* 3 Metric Cards for Flow Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Inbound Flow */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Pemasukan (Supplier ➔ Gudang)</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              +{totalMasuk} Unit
            </div>
            <span className="text-[10px] text-slate-400">Total volume masuk dari vendor</span>
          </div>
        </div>

        {/* Metric 2: Outbound Flow */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
            <ArrowUpFromLine className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Distribusi (Gudang ➔ Departemen)</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              -{totalKeluar} Unit
            </div>
            <span className="text-[10px] text-slate-400">Tersalurkan ke unit kerja / user</span>
          </div>
        </div>

        {/* Metric 3: Internal Transfer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Relokasi Fisik (Rak ➔ Rak)</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {totalTransfer} Unit
            </div>
            <span className="text-[10px] text-slate-400">Perpindahan rak internal gudang</span>
          </div>
        </div>
      </div>

      {/* Filter and Switch View Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Switch tabs: Visual Flow vs Table */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('flow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'flow'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-red-500" />
              <span>Diagram Alur (Dari Mana ➔ Ke Mana)</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tabel Buku Besar MySQL</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Terakhir sinkron: {lastSynced.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari asal, tujuan, SKU, atau referensi..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500"
            />
            <button
              type="button"
              onClick={() => {
                setScannerMode('search');
                setShowScanner(true);
              }}
              className="absolute right-2 top-2 text-slate-400 hover:text-indigo-600 transition-colors p-0.5"
              title="Scan Barcode / QR Barang"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <select
              value={selectedBarangId}
              onChange={(e) => setSelectedBarangId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="all">🔍 Telusuri Semua Barang</option>
              {barang.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.kode_barang} - {b.nama_barang} (Stok: {b.stok})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">Semua Tipe Pergerakan</option>
              <option value="Masuk">Masuk (Supplier ➔ Rak)</option>
              <option value="Keluar">Keluar (Rak ➔ Departemen)</option>
              <option value="Transfer">Transfer (Rak ➔ Rak Lain)</option>
              <option value="Penyesuaian">Penyesuaian / Saldo Awal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Specific Item Journey Banner (if a single item is filtered) */}
      {selectedItemObj && (
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {selectedItemObj.foto ? (
              <img
                src={selectedItemObj.foto}
                alt={selectedItemObj.nama_barang}
                className="w-12 h-12 object-cover rounded-lg border border-blue-300 dark:border-blue-800 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                <Package className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                  {selectedItemObj.kode_barang}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedItemObj.nama_barang}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Posisi Fisik Saat Ini: <strong className="text-blue-800 dark:text-blue-200">{selectedItemObj.lokasi_rak}</strong> · Sisa Kuantitas: <strong>{selectedItemObj.stok} unit</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono">
              Total Riwayat Perjalanan: <strong>{filteredMutasi.length} Titik</strong>
            </span>
            <button
              onClick={() => setSelectedBarangId('all')}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 text-[11px]"
            >
              Reset Filter Barang
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: VISUAL FLOW CARDS (DARI MANA ➔ KE MANA) */}
      {viewMode === 'flow' ? (
        <div className="space-y-3">
          {filteredMutasi.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400">
              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Belum ada rekaman pergerakan alur barang</p>
              <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Simulasi Live" atau catat transaksi masuk/keluar untuk memicu data real-time.</p>
            </div>
          ) : (
            filteredMutasi.map((m) => {
              const itm = barang.find((b) => b.id === m.barang_id);
              const petugas = users.find((u) => u.id === m.petugas_id);
              const isRecent = recentHighlightedId === m.id;

              return (
                <div
                  key={m.id}
                  className={`bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all duration-500 shadow-xs ${
                    isRecent
                      ? 'border-amber-400 dark:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-400/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Item Information */}
                    <div className="flex items-center gap-3 min-w-[240px]">
                      {itm?.foto ? (
                        <img
                          src={itm.foto}
                          alt={itm.nama_barang}
                          className="w-11 h-11 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-red-600 dark:text-red-400">
                            {itm?.kode_barang || `BRG-${m.barang_id}`}
                          </span>
                          {isRecent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white animate-pulse">
                              BARU
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] mt-0.5">
                          {itm?.nama_barang || `Barang #${m.barang_id}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Ref: {m.referensi}
                        </div>
                      </div>
                    </div>

                    {/* JOURNEY FLOW PIPELINE: DARI MANA ──▶ KE MANA */}
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                      {/* DARI MANA (ORIGIN) */}
                      <div className="flex-1 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>DARI (ASAL):</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={m.asal || 'Gudang Utama'}>
                          {m.asal || 'Gudang Utama'}
                        </div>
                      </div>

                      {/* ARROW & QUANTITY BADGE */}
                      <div className="flex sm:flex-col items-center justify-center gap-1 px-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            m.jenis === 'Masuk'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : m.jenis === 'Keluar'
                              ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {m.jenis === 'Masuk' ? `+${m.jumlah}` : m.jenis === 'Keluar' ? `-${m.jumlah}` : `↔ ${m.jumlah}`} Unit
                        </span>
                        <div className="flex items-center text-slate-400 font-bold text-xs">
                          <span className="hidden sm:inline">────────</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        </div>
                      </div>

                      {/* KE MANA (DESTINATION) */}
                      <div className="flex-1 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>KE (TUJUAN):</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={m.tujuan || 'Gudang Utama'}>
                          {m.tujuan || 'Gudang Utama'}
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Timestamp */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-1 shrink-0 text-xs text-right">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.tanggal}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sisa Fisik: <strong className="font-mono text-slate-800 dark:text-slate-200">{m.stok_sesudah}</strong>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        PIC: {petugas?.username || 'Staff'}
                      </div>
                    </div>
                  </div>

                  {m.keterangan && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="font-semibold text-slate-400">Catatan:</span>
                      <span>{m.keterangan}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* VIEW MODE 2: TABEL BUKU BESAR MUTASI LENGKAP */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-3.5 py-3">Waktu Transaksi</th>
                  <th className="px-3.5 py-3">Barang &amp; SKU</th>
                  <th className="px-3.5 py-3 text-center">Jenis</th>
                  <th className="px-3.5 py-3">Dari Mana (Asal)</th>
                  <th className="px-3.5 py-3">Ke Mana (Tujuan)</th>
                  <th className="px-3.5 py-3 text-right">Qty</th>
                  <th className="px-3.5 py-3 text-right">Sisa Stok</th>
                  <th className="px-3.5 py-3">No. Referensi</th>
                  <th className="px-3.5 py-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMutasi.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      Belum ada rekaman riwayat alur barang untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredMutasi.map((m) => {
                    const itm = barang.find((b) => b.id === m.barang_id);
                    const petugas = users.find((u) => u.id === m.petugas_id);

                    return (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                        <td className="px-3.5 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {m.tanggal}
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {itm?.nama_barang || `Barang #${m.barang_id}`}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {itm?.kode_barang}
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              m.jenis === 'Masuk'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : m.jenis === 'Keluar'
                                ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {m.jenis}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 font-medium text-slate-700 dark:text-slate-300">
                          {m.asal || '-'}
                        </td>
                        <td className="px-3.5 py-3 font-medium text-slate-900 dark:text-white">
                          {m.tujuan || '-'}
                        </td>
                        <td
                          className={`px-3.5 py-3 text-right font-mono font-bold whitespace-nowrap ${
                            m.jenis === 'Masuk'
                              ? 'text-emerald-600'
                              : m.jenis === 'Keluar'
                              ? 'text-orange-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {m.jenis === 'Masuk' ? `+${m.jumlah}` : m.jenis === 'Keluar' ? `-${m.jumlah}` : `↔ ${m.jumlah}`}
                        </td>
                        <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {m.stok_sesudah}
                        </td>
                        <td className="px-3.5 py-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {m.referensi}
                        </td>
                        <td className="px-3.5 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {petugas?.username || 'Staff'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Pindah Rak / Relokasi Barang Fisik */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Formulir Relokasi Fisik (Pindah Rak / Gudang)
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferError && (
              <div className="mx-6 mt-4">
                <PillNotification
                  type="error"
                  title="Gagal Mutasi Rak"
                  message={transferError}
                  onClose={() => setTransferError('')}
                />
              </div>
            )}

            <form onSubmit={handleSubmitTransfer} className="p-6 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Pilih Barang yang Dipindahkan <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerMode('transfer_barang');
                      setShowScanner(true);
                    }}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    title="Scan barcode kemasan atau label rak barang"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Barcode</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <select
                    value={transferBarang}
                    onChange={(e) => setTransferBarang(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium flex-1"
                  >
                    {barang.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.kode_barang} - {b.nama_barang} (Rak Asal: {b.lokasi_rak || 'Gudang Utama'}, Stok: {b.stok})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerMode('transfer_barang');
                      setShowScanner(true);
                    }}
                    className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
                    title="Scan Barcode / QR Barang"
                  >
                    <Barcode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current origin info */}
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] flex justify-between items-center">
                <span className="text-slate-500">Lokasi Rak Saat Ini (Asal):</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {barang.find((b) => b.id === Number(transferBarang))?.lokasi_rak || 'Gudang Utama'}
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih / Ketik Lokasi Rak Tujuan Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="rack-presets"
                  value={transferRakTujuan}
                  onChange={(e) => setTransferRakTujuan(e.target.value)}
                  placeholder="Contoh: Rak B-3 (Gudang Transit Lantai 2)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
                <datalist id="rack-presets">
                  {rackPresets.map((r, i) => (
                    <option key={i} value={r} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Unit yang Dipindahkan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={barang.find((b) => b.id === Number(transferBarang))?.stok || 1}
                  required
                  value={transferJumlah}
                  onChange={(e) => setTransferJumlah(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Alasan / Keterangan Perpindahan
                </label>
                <textarea
                  rows={2}
                  value={transferCatatan}
                  onChange={(e) => setTransferCatatan(e.target.value)}
                  placeholder="Contoh: Penataan ulang kapasitas rak, pemindahan ke area transit..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Perpindahan Rak</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode / QR Code Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title={
          scannerMode === 'transfer_barang'
            ? 'Scan Barcode / QR Barang yang Dipindahkan'
            : 'Scan Barcode / QR Lacak Riwayat Alur'
        }
        registeredSerials={
          barang
            .map((b) => b.barcode)
            .filter(Boolean) as string[]
        }
      />
    </div>
  );
};
