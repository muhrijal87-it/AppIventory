import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Download,
  Package,
  ArrowRight,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Building,
  MapPin,
  Radio,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  X,
  TrendingUp,
  Camera,
  Barcode,
  ArrowRightLeft,
  ChevronRight,
  User,
  AlertCircle,
  Hash,
  Box,
  CornerDownRight
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { PillNotification } from '../common/PillNotification';
import { CenteredAlertModal } from '../common/CenteredAlertModal';

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
  const [successModalMessage, setSuccessModalMessage] = useState<string | null>(null);

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'search' | 'transfer_barang'>('search');
  const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

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
          message: `Barang terpilih: "${matched.nama_barang}"`,
        });
      } else {
        setTransferError(`Barcode "${cleanVal}" tidak cocok.`);
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
      } else {
        setSearchTerm(cleanVal);
      }
    }
  };

  const handleOpenTransfer = () => {
    const defaultItem = barang[0];
    setTransferBarang(defaultItem?.id || 1);
    setTransferRakTujuan(rackPresets[1] || 'Rak A-2');
    setTransferJumlah(1);
    setTransferCatatan('Relokasi penataan gudang');
    setTransferError('');
    setShowTransferModal(true);
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const res = transferBarangRak(
      Number(transferBarang),
      transferRakTujuan.trim(),
      Number(transferJumlah),
      transferCatatan
    );

    if (res.success) {
      setShowTransferModal(false);
      setLastSynced(new Date());
      setSuccessModalMessage(`Berhasil memindahkan unit ke ${transferRakTujuan}`);
    } else {
      setTransferError(res.message);
    }
  };

  // Filtered Data
  const filteredMutasi = useMemo(() => {
    return mutasiStok.filter((m) => {
      const itm = barang.find((b) => b.id === m.barang_id);
      const matchesBarang = selectedBarangId === 'all' || m.barang_id === Number(selectedBarangId);
      const matchesJenis = selectedJenis === 'all' || m.jenis === selectedJenis;
      const s = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        m.referensi.toLowerCase().includes(s) ||
        m.keterangan.toLowerCase().includes(s) ||
        (m.asal && m.asal.toLowerCase().includes(s)) ||
        (m.tujuan && m.tujuan.toLowerCase().includes(s)) ||
        (itm && (itm.nama_barang.toLowerCase().includes(s) || itm.kode_barang.toLowerCase().includes(s)));

      return matchesBarang && matchesJenis && matchesSearch;
    });
  }, [mutasiStok, barang, selectedBarangId, selectedJenis, searchTerm]);

  const stats = useMemo(() => ({
    masuk: mutasiStok.filter(m => m.jenis === 'Masuk').reduce((a, b) => a + b.jumlah, 0),
    keluar: mutasiStok.filter(m => m.jenis === 'Keluar').reduce((a, b) => a + b.jumlah, 0),
    transfer: mutasiStok.filter(m => m.jenis === 'Transfer').reduce((a, b) => a + b.jumlah, 0),
  }), [mutasiStok]);

  const handleExportCSV = () => {
    const headers = ['Waktu', 'Barang', 'Tipe', 'Asal', 'Tujuan', 'Qty', 'Sisa', 'Ref'];
    const rows = filteredMutasi.map((m) => {
      const itm = barang.find(b => b.id === m.barang_id);
      return [m.tanggal, `"${itm?.nama_barang}"`, m.jenis, `"${m.asal}"`, `"${m.tujuan}"`, m.jumlah, m.stok_sesudah, m.referensi];
    });
    const content = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(content));
    link.setAttribute('download', `history_mutasi_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedItemObj = selectedBarangId !== 'all' ? barang.find(b => b.id === Number(selectedBarangId)) : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Tracking Active</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">
            Histori Alur Real-Time
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Monitor pergerakan aset fisik secara instan. Lacak perpindahan dari pemasok ke gudang hingga distribusi ke unit kerja dengan presisi logistik.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setScannerMode('search'); setShowScanner(true); }}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <Barcode className="w-4 h-4 text-indigo-500" />
            <span>Scan Unit</span>
          </button>
          
          {can('manage_inventory') && (
            <button
              onClick={handleOpenTransfer}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Relokasi Rak</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-red-600 hover:bg-slate-800 dark:hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-200 dark:shadow-red-950/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor History</span>
          </button>
        </div>
      </div>

      {/* Metric Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pemasukan (Inbound)', value: stats.masuk, icon: ArrowDownToLine, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Distribusi (Outbound)', value: stats.keluar, icon: ArrowUpFromLine, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
          { label: 'Relokasi (Internal)', value: stats.transfer, icon: ArrowLeftRight, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-5">
            <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>
              <m.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                {i < 2 ? (i === 0 ? '+' : '-') : ''}{m.value} <span className="text-xs text-slate-400 font-medium">Units</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Control & Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* View Mode Switcher */}
        <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1">
            {[
              { id: 'flow', label: 'Alur Visual', icon: Radio },
              { id: 'table', label: 'Buku Besar', icon: Layers },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                  viewMode === mode.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <mode.icon className={`w-3.5 h-3.5 ${viewMode === mode.id ? 'text-red-500' : 'text-slate-400'}`} />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
          <div className="px-4 text-[10px] font-mono text-slate-400 flex items-center gap-2 uppercase">
            <Clock className="w-3 h-3" />
            <span>Updated: {lastSynced.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>

        {/* Toolbar Filters */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <input
              type="text"
              placeholder="Cari Ref, SKU, Lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:border-slate-400 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <select
            value={selectedBarangId}
            onChange={(e) => setSelectedBarangId(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden cursor-pointer font-bold text-slate-700 dark:text-slate-300 appearance-none"
          >
            <option value="all">🔍 Telusuri Per Barang</option>
            {barang.map(b => (
              <option key={b.id} value={b.id}>{b.kode_barang} · {b.nama_barang}</option>
            ))}
          </select>

          <select
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden cursor-pointer font-bold text-slate-700 dark:text-slate-300 appearance-none"
          >
            <option value="all">⚡ Semua Tipe Alur</option>
            <option value="Masuk">Inbound (Masuk)</option>
            <option value="Keluar">Outbound (Keluar)</option>
            <option value="Transfer">Internal (Pindah Rak)</option>
            <option value="Penyesuaian">Penyesuaian Data</option>
          </select>
        </div>
      </div>

      {/* Selected Item Focus Banner */}
      {selectedItemObj && (
        <div className="bg-blue-600 p-6 rounded-2xl shadow-xl shadow-blue-900/20 text-white flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
               {selectedItemObj.foto ? <img src={selectedItemObj.foto} className="w-full h-full object-cover rounded-2xl" /> : <Box className="w-8 h-8" />}
            </div>
            <div>
               <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Unit Focused</span>
                 <span className="font-mono text-xs font-bold text-blue-100">{selectedItemObj.kode_barang}</span>
               </div>
               <h3 className="text-xl font-black mt-1">{selectedItemObj.nama_barang}</h3>
               <p className="text-xs text-blue-100/80 mt-1 flex items-center gap-3">
                 <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedItemObj.lokasi_rak || 'Gudang'}</span>
                 <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                 <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Stok: {selectedItemObj.stok} Unit</span>
               </p>
            </div>
          </div>
          <button onClick={() => setSelectedBarangId('all')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all border border-white/10">Lepas Fokus</button>
        </div>
      )}

      {/* Main Stream View */}
      {viewMode === 'flow' ? (
        <div className="space-y-4">
          {filteredMutasi.length === 0 ? (
            <div className="py-24 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
               <Activity className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Activity Stream Found</p>
            </div>
          ) : (
            filteredMutasi.map((m) => {
              const itm = barang.find(b => b.id === m.barang_id);
              const userObj = users.find(u => u.id === m.petugas_id);
              const isRecent = recentHighlightedId === m.id;

              return (
                <div
                  key={m.id}
                  className={`relative group bg-white dark:bg-slate-900 border transition-all duration-700 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row gap-6 ${
                    isRecent ? 'border-amber-400 dark:border-amber-500/50 shadow-2xl shadow-amber-500/10 scale-102 z-10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${
                    m.jenis === 'Masuk' ? 'bg-emerald-500' : m.jenis === 'Keluar' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />

                  {/* Left Column: Item & Meta */}
                  <div className="flex items-start gap-4 md:w-1/3 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-red-500 transition-colors">
                      {itm?.foto ? <img src={itm.foto} className="w-full h-full object-cover rounded-2xl" /> : <Package className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0">
                       <div className="flex items-center gap-2">
                         <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{itm?.kode_barang}</span>
                         {isRecent && <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] font-black animate-pulse">LATEST</span>}
                       </div>
                       <h4 className="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">{itm?.nama_barang || 'Unknown'}</h4>
                       <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                          <Hash className="w-3 h-3" />
                          <span>REF: {m.referensi}</span>
                       </div>
                    </div>
                  </div>

                  {/* Center Column: Flow Visual */}
                  <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4">
                     <div className="flex-1 w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/50">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Origin (Asal)</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                           <Building className="w-3 h-3 opacity-50" />
                           <span className="truncate">{m.asal || 'Registry'}</span>
                        </div>
                     </div>

                     <div className="flex flex-col items-center shrink-0">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black tabular-nums border mb-2 ${
                          m.jenis === 'Masuk' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          m.jenis === 'Keluar' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {m.jenis === 'Masuk' ? '+' : m.jenis === 'Keluar' ? '-' : '↔'}{m.jumlah} UNIT
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                        <ArrowDownToLine className="w-4 h-4 text-slate-300 sm:hidden" />
                     </div>

                     <div className="flex-1 w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/50">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Destination (Tujuan)</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-900 dark:text-white">
                           <MapPin className="w-3 h-3 text-red-500" />
                           <span className="truncate">{m.tujuan || 'Storage'}</span>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Audit Info */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-slate-50 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                     <div className="text-right">
                        <div className="flex items-center md:justify-end gap-1.5 text-[10px] font-mono text-slate-500">
                           <Clock className="w-3 h-3" />
                           <span>{m.tanggal.split(' ')[1]}</span>
                        </div>
                        <div className="text-[9px] font-medium text-slate-400 mt-0.5">{m.tanggal.split(' ')[0]}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-black text-slate-900 dark:text-slate-100 tabular-nums">STOCK: {m.stok_sesudah}</div>
                        <div className="flex items-center md:justify-end gap-1 text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                           <User className="w-2.5 h-2.5" />
                           <span>{userObj?.username || 'Staff'}</span>
                        </div>
                     </div>
                  </div>

                  {/* Note Tooltip for hover */}
                  {m.keterangan && (
                    <div className="absolute -bottom-2 right-12 px-3 py-1 bg-slate-800 text-[9px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 shadow-xl z-20">
                      <CornerDownRight className="w-3 h-3 text-slate-400" />
                      <span>{m.keterangan}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Informasi Barang</th>
                  <th className="px-6 py-4 text-center">Tipe</th>
                  <th className="px-6 py-4">Alur (Dari ➔ Ke)</th>
                  <th className="px-6 py-4 text-right">Volume</th>
                  <th className="px-6 py-4 text-right">Sisa Stok</th>
                  <th className="px-6 py-4">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMutasi.map((m) => {
                  const itm = barang.find(b => b.id === m.barang_id);
                  return (
                    <tr key={m.id} className="group hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-4 text-[10px] font-mono text-slate-500 whitespace-nowrap">{m.tanggal}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{itm?.nama_barang}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{itm?.kode_barang}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                          m.jenis === 'Masuk' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          m.jenis === 'Keluar' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {m.jenis.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            <span className="truncate max-w-[120px]">{m.asal || '-'}</span>
                            <ArrowRight className="w-3 h-3 opacity-30 shrink-0" />
                            <span className="truncate max-w-[120px] font-bold text-slate-900 dark:text-white">{m.tujuan || '-'}</span>
                         </div>
                      </td>
                      <td className={`px-6 py-4 text-right font-black tabular-nums text-sm ${m.jenis === 'Masuk' ? 'text-emerald-600' : m.jenis === 'Keluar' ? 'text-red-600' : 'text-blue-600'}`}>
                         {m.jenis === 'Masuk' ? '+' : m.jenis === 'Keluar' ? '-' : ''}{m.jumlah}
                      </td>
                      <td className="px-6 py-4 text-right font-bold tabular-nums text-slate-900 dark:text-white">{m.stok_sesudah}</td>
                      <td className="px-6 py-4">
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{users.find(u => u.id === m.petugas_id)?.username || 'Staff'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Relocation Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Relokasi Fisik</h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Pemindahan Internal Antar Rak</p>
                </div>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransfer} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pilih Barang</label>
                <div className="flex gap-2">
                   <select value={transferBarang} onChange={e => setTransferBarang(Number(e.target.value))} className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold">
                      {barang.map(b => <option key={b.id} value={b.id}>{b.kode_barang} · {b.nama_barang}</option>)}
                   </select>
                   <button type="button" onClick={() => { setScannerMode('transfer_barang'); setShowScanner(true); }} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-90 transition-all"><Barcode className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest mb-2">
                    <span>Current Station</span>
                    <span>Rak Asal</span>
                 </div>
                 <div className="text-sm font-black text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 opacity-50" />
                    {barang.find(b => b.id === Number(transferBarang))?.lokasi_rak || 'Gudang Utama'}
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rak Tujuan Baru</label>
                <input type="text" list="rack-options" required value={transferRakTujuan} onChange={e => setTransferRakTujuan(e.target.value)} placeholder="Misal: Rak C-2..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-bold" />
                <datalist id="rack-options">{rackPresets.map((r, i) => <option key={i} value={r} />)}</datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Jumlah Unit</label>
                    <input type="number" required value={transferJumlah} onChange={e => setTransferJumlah(Number(e.target.value))} min="1" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black tabular-nums outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Referential Check</label>
                    <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center justify-center border border-slate-200 dark:border-slate-700">Ready to sync</div>
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setShowTransferModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black text-slate-500 hover:text-slate-700 transition-colors">Batal</button>
                 <button type="submit" className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Konfirmasi Pindah</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner */}
      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title={scannerMode === 'transfer_barang' ? 'Scan Unit Relokasi' : 'Lacak Histori Unit'}
        registeredSerials={barang.map(b => b.barcode).filter(Boolean) as string[]}
      />

      {/* Feedback Notification */}
      {scanFeedback && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <PillNotification
            type={scanFeedback.type}
            title="Scan Result"
            message={scanFeedback.message}
            onClose={() => setScanFeedback(null)}
          />
        </div>
      )}

      {/* Success Alert */}
      <CenteredAlertModal
        isOpen={!!successModalMessage}
        type="success"
        title="Sinkronisasi Berhasil"
        message={successModalMessage || ''}
        onClose={() => setSuccessModalMessage(null)}
      />
    </div>
  );
};
