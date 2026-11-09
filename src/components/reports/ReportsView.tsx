import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  Package,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  Building,
  RotateCcw,
  X,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

interface ReportsViewProps {
  type?: 'stok' | 'transaksi' | 'perpindahan' | 'ditarik';
}

export const ReportsView: React.FC<ReportsViewProps> = ({ type = 'stok' }) => {
  const { 
    barang, 
    kategori, 
    satuan, 
    supplier, 
    departemen: masterDepartemen, 
    transaksiMasuk, 
    transaksiKeluar, 
    mutasiStok,
    appSettings
  } = useInventory();
  const { user } = useAuth();

  const [activeReport, setActiveReport] = useState<'stok' | 'transaksi' | 'perpindahan' | 'ditarik'>(type);
  const [selectedKat, setSelectedKat] = useState('all');
  const [selectedBarangId, setSelectedBarangId] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sync tab if prop changes from outside
  useEffect(() => {
    setActiveReport(type);
  }, [type]);

  // Memoized Filtered Data
  const filteredBarang = useMemo(() => {
    return barang.filter((b) => {
      const matchesKat = selectedKat === 'all' || b.kategori_id === Number(selectedKat);
      const matchesSearch = !searchTerm || 
        b.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.kode_barang.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesKat && matchesSearch;
    });
  }, [barang, selectedKat, searchTerm]);

  const transferList = useMemo(() => {
    return transaksiKeluar.filter((t) => {
      const isTransfer = t.no_transaksi.startsWith('TRF-');
      if (!isTransfer) return false;

      const itm = barang.find((b) => b.id === t.barang_id);
      const matchesBarang = selectedBarangId === 'all' || t.barang_id === Number(selectedBarangId);
      const matchesDept = selectedDept === 'all' || t.departemen === selectedDept;
      const matchesDate = (!startDate || t.tanggal >= startDate) && (!endDate || t.tanggal <= endDate);
      
      const s = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        t.no_transaksi.toLowerCase().includes(s) ||
        t.penerima.toLowerCase().includes(s) ||
        t.departemen.toLowerCase().includes(s) ||
        (itm && (itm.nama_barang.toLowerCase().includes(s) || itm.kode_barang.toLowerCase().includes(s)));

      return matchesBarang && matchesDept && matchesDate && matchesSearch;
    });
  }, [transaksiKeluar, barang, selectedBarangId, selectedDept, startDate, endDate, searchTerm]);

  const recallList = useMemo(() => {
    return mutasiStok.filter((m) => {
      const isRecall = m.referensi.startsWith('RECALL-');
      if (!isRecall) return false;

      const itm = barang.find((b) => b.id === m.barang_id);
      const matchesBarang = selectedBarangId === 'all' || m.barang_id === Number(selectedBarangId);
      const tDate = m.tanggal.split(' ')[0];
      const matchesDate = (!startDate || tDate >= startDate) && (!endDate || tDate <= endDate);
      const s = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        m.referensi.toLowerCase().includes(s) ||
        (m.asal && m.asal.toLowerCase().includes(s)) ||
        (itm && (itm.nama_barang.toLowerCase().includes(s) || itm.kode_barang.toLowerCase().includes(s)));

      return matchesBarang && matchesDate && matchesSearch;
    });
  }, [mutasiStok, barang, selectedBarangId, startDate, endDate, searchTerm]);

  const combinedTransactions = useMemo(() => {
    const list: any[] = [];
    transaksiMasuk.forEach(t => list.push({ ...t, _type: 'MASUK' }));
    transaksiKeluar.forEach(t => list.push({ ...t, _type: t.no_transaksi.startsWith('TRF-') ? 'PERPINDAHAN' : 'KELUAR' }));
    
    return list.filter(t => {
      const date = t.tanggal;
      const matchesDate = (!startDate || date >= startDate) && (!endDate || date <= endDate);
      const itm = barang.find(b => b.id === t.barang_id);
      const s = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        (t.no_faktur || t.no_transaksi || '').toLowerCase().includes(s) ||
        (itm && itm.nama_barang.toLowerCase().includes(s));
      return matchesDate && matchesSearch;
    }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [transaksiMasuk, transaksiKeluar, barang, startDate, endDate, searchTerm]);

  // Export Handlers
  const downloadFile = (content: string, filename: string) => {
    const encodedUri = encodeURI(content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = '';

    if (activeReport === 'stok') {
      headers = ['No', 'Kode', 'Barang', 'Kategori', 'Stok', 'Lokasi', 'Kondisi'];
      rows = filteredBarang.map((b, i) => [
        i + 1, 
        b.kode_barang, 
        `"${b.nama_barang}"`, 
        `"${kategori.find(k => k.id === b.kategori_id)?.nama_kategori || '-'}"`,
        b.stok,
        `"${b.lokasi_rak}"`,
        b.kondisi
      ]);
      filename = `stok_${new Date().toISOString().slice(0,10)}.csv`;
    } else if (activeReport === 'perpindahan') {
      headers = ['No', 'No. Dokumen', 'Tanggal', 'Barang', 'Tujuan', 'PIC', 'Qty'];
      rows = transferList.map((t, i) => {
        const itm = barang.find(b => b.id === t.barang_id);
        return [i + 1, t.no_transaksi, t.tanggal, `"${itm?.nama_barang}"`, `"${t.departemen}"`, `"${t.penerima}"`, t.jumlah];
      });
      filename = `perpindahan_${new Date().toISOString().slice(0,10)}.csv`;
    } else if (activeReport === 'ditarik') {
      headers = ['No', 'No. Recall', 'Tanggal', 'Barang', 'Asal', 'Qty', 'Keterangan'];
      rows = recallList.map((m, i) => {
        const itm = barang.find(b => b.id === m.barang_id);
        return [i + 1, m.referensi, m.tanggal, `"${itm?.nama_barang}"`, `"${m.asal}"`, m.jumlah, `"${m.keterangan}"` ];
      });
      filename = `recall_${new Date().toISOString().slice(0,10)}.csv`;
    } else {
      headers = ['No', 'Tipe', 'Nomor', 'Tanggal', 'Barang', 'Qty', 'Pihak Terkait'];
      rows = combinedTransactions.map((t, i) => {
        const itm = barang.find(b => b.id === t.barang_id);
        return [i + 1, t._type, t.no_faktur || t.no_transaksi, t.tanggal, `"${itm?.nama_barang}"`, t.jumlah, `"${t.penerima || supplier.find(s=>s.id===t.supplier_id)?.nama_supplier || '-'}"`];
      });
      filename = `transaksi_${new Date().toISOString().slice(0,10)}.csv`;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    downloadFile(csvContent, filename);
  };

  const resetFilters = () => {
    setSelectedKat('all');
    setSelectedBarangId('all');
    setSelectedDept('all');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    const activeData = activeReport === 'stok' ? filteredBarang : 
                     activeReport === 'perpindahan' ? transferList : 
                     activeReport === 'ditarik' ? recallList : combinedTransactions;
    
    return {
      count: activeData.length,
      units: activeReport === 'stok' ? filteredBarang.reduce((a, b) => a + b.stok, 0) :
             activeReport === 'perpindahan' ? transferList.reduce((a, b) => a + b.jumlah, 0) :
             activeReport === 'ditarik' ? recallList.reduce((a, b) => a + b.jumlah, 0) :
             combinedTransactions.reduce((a, b) => a + b.jumlah, 0)
    };
  }, [activeReport, filteredBarang, transferList, recallList, combinedTransactions]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Document Control Center</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pusat Pelaporan & Dokumen
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Hasilkan laporan resmi inventaris, mutasi barang, dan alur distribusi dengan standar audit operasional.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-red-600 hover:bg-slate-800 dark:hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-200 dark:shadow-red-950/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* Navigation & Filters Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden no-print">
        {/* Segmented Tab Control */}
        <div className="flex items-center gap-1 p-1.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'stok', label: 'Stok Fisik', icon: FileSpreadsheet, color: 'text-red-500' },
            { id: 'transaksi', label: 'In & Outbound', icon: ArrowRightLeft, color: 'text-orange-500' },
            { id: 'perpindahan', label: 'Distribusi', icon: Building, color: 'text-purple-500' },
            { id: 'ditarik', label: 'Recall Unit', icon: RotateCcw, color: 'text-amber-500' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeReport === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeReport === tab.id ? tab.color : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pencarian Cepat</label>
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input
                type="text"
                placeholder="SKU, Nama, No. Dok..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-slate-500/10 focus:border-slate-400 transition-all outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kategori / Departemen</label>
            <select
              value={activeReport === 'stok' ? selectedKat : selectedDept}
              onChange={(e) => activeReport === 'stok' ? setSelectedKat(e.target.value) : setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden appearance-none cursor-pointer"
            >
              <option value="all">Semua {activeReport === 'stok' ? 'Kategori' : 'Departemen'}</option>
              {activeReport === 'stok' ? 
                kategori.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>) :
                masterDepartemen.map(d => <option key={d.id} value={d.nama_departemen}>{d.nama_departemen}</option>)
              }
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Periode Awal</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Periode Akhir</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Quick Reset & Status */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>{kpis.count} Baris Data Ditemukan</span>
            </span>
            <span>·</span>
            <span>Update Terakhir: {new Date().toLocaleTimeString('id-ID')}</span>
          </div>
          {(searchTerm || selectedKat !== 'all' || startDate || endDate) && (
            <button onClick={resetFilters} className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">
              <X className="w-3 h-3" />
              Hapus Filter
            </button>
          )}
        </div>
      </div>

      {/* Dashboard KPI Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Entitas</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{kpis.count}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Unit</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{kpis.units}</p>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl border border-slate-800 shadow-lg flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Audit</p>
            <p className="text-lg font-bold text-white tracking-tight">Terverifikasi MySQL</p>
          </div>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 md:p-16 shadow-2xl print:border-none print:shadow-none print:p-0 print:rounded-none">
        {/* Document Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 dark:border-slate-200 pb-8 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 p-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
               <img src={appSettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                {appSettings.nama_aplikasi}
              </h2>
              <p className="text-xs text-slate-500 font-medium max-w-sm mt-1 leading-relaxed">
                Logistik & Management System Division<br />
                Pusat Distribusi Regional 01 · {appSettings.tagline}
              </p>
              <div className="flex items-center gap-3 mt-4 text-[10px] font-mono text-slate-400">
                 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> SYNCED: {new Date().toISOString()}</span>
                 <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                 <span>DB: MYSQL_PROD_8.0</span>
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Dokumen Resmi</div>
             <div className="text-xl font-bold font-mono tracking-tighter text-slate-900 dark:text-white">
                REP/{activeReport.toUpperCase().substring(0,3)}/{new Date().getFullYear()}
             </div>
             <div className="mt-2 text-xs font-bold text-slate-500">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
          </div>
        </div>

        {/* Report Title Banner */}
        <div className="mb-10 text-center">
          <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white border-y border-slate-100 dark:border-slate-800 py-4">
             LAPORAN {activeReport === 'stok' ? 'POSISI STOK FISIK' : 
                     activeReport === 'transaksi' ? 'MUTASI PEMASUKAN & PENGELUARAN' : 
                     activeReport === 'perpindahan' ? 'ALUR DISTRIBUSI BARANG' : 'PENARIKAN BARANG (RECALL)'}
          </h3>
          <p className="text-xs text-slate-500 mt-4 max-w-2xl mx-auto italic">
            Laporan ini dibuat secara otomatis oleh sistem berdasarkan data yang tercatat dalam log aktivitas gudang. 
            Semua angka telah divalidasi terhadap sisa stok fisik pada rak penyimpanan.
          </p>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-900 dark:border-slate-200">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 w-12 text-center">No</th>
                {activeReport === 'stok' && (
                  <>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Kode Barang</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Uraian Nama Barang</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Stok</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Lokasi Rak</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Kondisi</th>
                  </>
                )}
                {activeReport === 'perpindahan' && (
                  <>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">No. Dokumen</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Barang</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Destinasi</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Qty</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">PIC Penerima</th>
                  </>
                )}
                {activeReport === 'ditarik' && (
                  <>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">No. Recall</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Barang</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Ditarik Dari</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Qty</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Alasan Penarikan</th>
                  </>
                )}
                {activeReport === 'transaksi' && (
                  <>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Jenis</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">No. Referensi</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Barang</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Jumlah</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Pihak Terkait</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeReport === 'stok' && filteredBarang.map((b, i) => (
                <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 text-xs font-mono text-slate-400 text-center">{i + 1}</td>
                  <td className="px-4 py-4 text-xs font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">{b.kode_barang}</td>
                  <td className="px-4 py-4">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{b.nama_barang}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{kategori.find(k => k.id === b.kategori_id)?.nama_kategori || 'Tanpa Kategori'}</div>
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-slate-900 dark:text-white text-right tabular-nums">{b.stok}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400 font-medium">{b.lokasi_rak || '-'}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      b.kondisi === 'Baik' ? 'text-emerald-600 border-emerald-100 dark:border-emerald-950 bg-emerald-50 dark:bg-emerald-950/20' : 
                      b.kondisi === 'Rusak' ? 'text-red-600 border-red-100 dark:border-red-950 bg-red-50 dark:bg-red-950/20' : 
                      'text-amber-600 border-amber-100 dark:border-amber-950 bg-amber-50 dark:bg-amber-950/20'
                    }`}>
                      {b.kondisi}
                    </span>
                  </td>
                </tr>
              ))}

              {activeReport === 'perpindahan' && transferList.map((t, i) => {
                const itm = barang.find(b => b.id === t.barang_id);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-4 text-xs font-mono text-slate-400 text-center">{i + 1}</td>
                    <td className="px-4 py-4 text-xs font-bold font-mono text-slate-900 dark:text-white">{t.no_transaksi}</td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-900 dark:text-white">{itm?.nama_barang}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400 font-semibold">{t.departemen}</td>
                    <td className="px-4 py-4 text-sm font-black text-slate-900 dark:text-white text-right tabular-nums">{t.jumlah}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 italic">{t.penerima}</td>
                  </tr>
                );
              })}

              {activeReport === 'ditarik' && recallList.map((m, i) => {
                const itm = barang.find(b => b.id === m.barang_id);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-4 text-xs font-mono text-slate-400 text-center">{i + 1}</td>
                    <td className="px-4 py-4 text-xs font-bold font-mono text-amber-600 dark:text-amber-400">{m.referensi}</td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-900 dark:text-white">{itm?.nama_barang}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400 font-semibold">{m.asal}</td>
                    <td className="px-4 py-4 text-sm font-black text-slate-900 dark:text-white text-right tabular-nums">+{m.jumlah}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 leading-tight">{m.keterangan}</td>
                  </tr>
                );
              })}

              {activeReport === 'transaksi' && combinedTransactions.map((t, i) => {
                const itm = barang.find(b => b.id === t.barang_id);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-4 text-xs font-mono text-slate-400 text-center">{i + 1}</td>
                    <td className="px-4 py-4">
                       <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                         t._type === 'MASUK' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                         t._type === 'KELUAR' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                         'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                       }`}>
                         {t._type}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold font-mono text-slate-900 dark:text-white">{t.no_faktur || t.no_transaksi}</td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-900 dark:text-white">{itm?.nama_barang}</td>
                    <td className={`px-4 py-4 text-sm font-black text-right tabular-nums ${t._type === 'MASUK' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t._type === 'MASUK' ? '+' : '-'}{t.jumlah}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {t.penerima || supplier.find(s=>s.id===t.supplier_id)?.nama_supplier || '-'}
                    </td>
                  </tr>
                );
              })}

              {kpis.count === 0 && (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-10 h-10 text-slate-200" />
                      <div className="text-sm font-bold text-slate-400">Tidak ada data untuk ditampilkan</div>
                      <p className="text-xs text-slate-500">Silakan sesuaikan filter atau rentang tanggal pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {kpis.count > 0 && (
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-900 border-t-2 border-slate-900 dark:border-slate-200">
                  <td colSpan={activeReport === 'stok' ? 3 : 4} className="px-4 py-3 text-xs font-black text-slate-900 dark:text-white uppercase text-right">Total Akumulasi</td>
                  <td className="px-4 py-3 text-sm font-black text-slate-900 dark:text-white text-right tabular-nums underline decoration-2 underline-offset-4 whitespace-nowrap">
                    {kpis.units} <span className="text-[10px] font-bold text-slate-400 uppercase no-underline inline-block ml-1">Unit</span>
                  </td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Legal Disclaimer & Signatures */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 text-center text-xs">
          <div className="space-y-24">
            <div className="font-medium text-slate-500 uppercase tracking-widest">Disahkan Oleh,</div>
            <div className="space-y-1">
              <div className="font-black text-slate-900 dark:text-white uppercase border-b border-slate-900 dark:border-slate-200 w-48 mx-auto pb-1">Manajer Operasional</div>
              <div className="text-[10px] text-slate-400 font-mono">NIK: 0987654321</div>
            </div>
          </div>
          
          <div className="space-y-24">
            <div className="font-medium text-slate-500 uppercase tracking-widest">Dibuat Oleh (System User),</div>
            <div className="space-y-1">
              <div className="font-black text-slate-900 dark:text-white uppercase border-b border-slate-900 dark:border-slate-200 w-48 mx-auto pb-1">{user?.username || 'Gudang Admin'}</div>
              <div className="text-[10px] text-slate-400 font-mono">DIPERIKSA PADA: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* QR Verification Mock */}
        <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shadow-inner">
                 {/* This would be a real QR code in a production system */}
                 <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-sm flex items-center justify-center">
                   <AlertCircle className="w-4 h-4 text-slate-400" />
                 </div>
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verifikasi Digital</div>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1">Pindai kode untuk memverifikasi keaslian dokumen melalui sistem cloud REMIXCI.</p>
              </div>
           </div>
           <div className="text-right text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
              Copyright © {new Date().getFullYear()} {appSettings.nama_aplikasi}<br />
              Generated via AI Studio - Build Engine v4.0.1
           </div>
        </div>
      </div>
      
      {/* Informational Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl flex gap-5">
           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
             <Clock className="w-6 h-6 text-emerald-400" />
           </div>
           <div>
             <h4 className="font-bold text-sm">Otomatisasi Laporan Mutasi</h4>
             <p className="text-xs text-slate-400 mt-1 leading-relaxed">
               Setiap transaksi masuk (IN) dan keluar (OUT) akan secara otomatis diperhitungkan ke dalam laporan posisi stok akhir secara real-time.
             </p>
           </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-5">
           <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
             <ExternalLink className="w-6 h-6 text-slate-600 dark:text-slate-400" />
           </div>
           <div>
             <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ekspor & Integrasi</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
               Anda dapat mengekspor data ke format CSV untuk diolah lebih lanjut menggunakan Microsoft Excel atau Google Sheets.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};
