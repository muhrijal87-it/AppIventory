import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Package,
  Layers,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  CheckCircle2,
  Building,
  RotateCcw
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

interface ReportsViewProps {
  type?: 'stok' | 'transaksi' | 'perpindahan';
}

export const ReportsView: React.FC<ReportsViewProps> = ({ type = 'stok' }) => {
  const { barang, kategori, satuan, supplier, departemen: masterDepartemen, transaksiMasuk, transaksiKeluar, mutasiStok } = useInventory();
  const { user, users } = useAuth();

  const [activeReport, setActiveReport] = useState<'stok' | 'transaksi' | 'perpindahan'>(type);
  const [selectedKat, setSelectedKat] = useState('all');
  const [selectedBarangId, setSelectedBarangId] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sync tab if prop changes from outside (e.g. sidebar navigation)
  useEffect(() => {
    setActiveReport(type);
  }, [type]);

  // Dynamic departemen list
  const departemenList =
    masterDepartemen && masterDepartemen.length > 0
      ? masterDepartemen.map((d) => d.nama_departemen)
      : Array.from(new Set(transaksiKeluar.map((t) => t.departemen))).filter(Boolean);

  // 1. FILTERED STOCK DATA
  const filteredBarang = barang.filter((b) => {
    return selectedKat === 'all' || b.kategori_id === Number(selectedKat);
  });

  // 2. FILTERED TRANSFER DATA (Perpindahan Barang / TRF-)
  const transferList = transaksiKeluar.filter((t) => {
    // Only include transfers (prefixed with TRF- or explicitly marked as transfer)
    const isTransfer = t.no_transaksi.startsWith('TRF-');
    if (!isTransfer) return false;

    const itm = barang.find((b) => b.id === t.barang_id);
    const matchesBarang = selectedBarangId === 'all' || t.barang_id === Number(selectedBarangId);
    const matchesDept =
      selectedDept === 'all' ||
      t.departemen === selectedDept ||
      t.penerima.toLowerCase().includes(selectedDept.toLowerCase());

    const tDate = t.tanggal;
    const matchesDate = (!startDate || tDate >= startDate) && (!endDate || tDate <= endDate);

    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      t.no_transaksi.toLowerCase().includes(s) ||
      t.penerima.toLowerCase().includes(s) ||
      t.departemen.toLowerCase().includes(s) ||
      (t.model && t.model.toLowerCase().includes(s)) ||
      (t.serial_number && t.serial_number.toLowerCase().includes(s)) ||
      (t.keperluan && t.keperluan.toLowerCase().includes(s)) ||
      (itm && itm.nama_barang.toLowerCase().includes(s)) ||
      (itm && itm.kode_barang.toLowerCase().includes(s));

    return matchesBarang && matchesDept && matchesDate && matchesSearch;
  });

  // 3. FILTERED TRANSACTION DATA (IN & OUT)
  const filteredTrxMasuk = transaksiMasuk.filter((t) => {
    const tDate = t.tanggal;
    return (!startDate || tDate >= startDate) && (!endDate || tDate <= endDate);
  });

  const filteredTrxKeluar = transaksiKeluar.filter((t) => {
    const tDate = t.tanggal;
    return (!startDate || tDate >= startDate) && (!endDate || tDate <= endDate);
  });

  // EXPORT HANDLERS
  const exportStockCSV = () => {
    const headers = ['No', 'Kode Barang', 'Nama Barang', 'Kategori', 'Satuan', 'Stok Fisik', 'Lokasi Rak', 'Kondisi'];
    const rows = filteredBarang.map((b, idx) => {
      const kat = kategori.find((k) => k.id === b.kategori_id)?.nama_kategori || '-';
      const sat = satuan.find((s) => s.id === b.satuan_id)?.nama_satuan || '-';
      return [
        idx + 1,
        b.kode_barang,
        `"${b.nama_barang.replace(/"/g, '""')}"`,
        `"${kat}"`,
        sat,
        b.stok,
        `"${b.lokasi_rak}"`,
        b.kondisi,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    downloadFile(csvContent, `laporan_stok_inventaris_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportTransferCSV = () => {
    const headers = [
      'No',
      'No Dokumen Perpindahan',
      'Tanggal',
      'Kode Barang',
      'Nama Barang',
      'Model / Tipe',
      'Serial Number (SN)',
      'Unit Pengirim (Asal)',
      'Departemen Tujuan',
      'Nama Penerima / PIC',
      'Jumlah (Unit)',
      'Status Sisa Stok',
      'Keperluan / Catatan Memo',
      'Petugas Gudang'
    ];
    const rows = transferList.map((t, idx) => {
      const itm = barang.find((b) => b.id === t.barang_id);
      const petugas = users.find((u) => u.id === t.petugas_id)?.nama_lengkap || 'Staff';
      return [
        idx + 1,
        t.no_transaksi,
        t.tanggal,
        itm?.kode_barang || '-',
        `"${(itm?.nama_barang || '').replace(/"/g, '""')}"`,
        `"${(t.model || '-').replace(/"/g, '""')}"`,
        `"${(t.serial_number || '-').replace(/"/g, '""')}"`,
        '"Gudang Logistik Utama"',
        `"${(t.departemen || '-').replace(/"/g, '""')}"`,
        `"${(t.penerima || '-').replace(/"/g, '""')}"`,
        t.jumlah,
        '"Stok Gudang Dipertahankan (Tidak Berkurang)"',
        `"${(t.keperluan || '-').replace(/"/g, '""')}"`,
        `"${petugas}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    downloadFile(csvContent, `laporan_perpindahan_barang_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportTransactionCSV = () => {
    const headers = ['No', 'Tipe', 'No Transaksi / Faktur', 'Tanggal', 'Nama Barang', 'Jumlah', 'Pihak Terkait'];
    const rows: (string | number)[][] = [];

    let count = 1;
    filteredTrxMasuk.forEach((t) => {
      const itm = barang.find((b) => b.id === t.barang_id);
      const sup = supplier.find((s) => s.id === t.supplier_id)?.nama_supplier || '-';
      rows.push([
        count++,
        'MASUK',
        t.no_faktur,
        t.tanggal,
        `"${(itm?.nama_barang || '').replace(/"/g, '""')}"`,
        `+${t.jumlah}`,
        `"${sup.replace(/"/g, '""')}"`,
      ]);
    });

    filteredTrxKeluar.forEach((t) => {
      const itm = barang.find((b) => b.id === t.barang_id);
      const isTRF = t.no_transaksi.startsWith('TRF-');
      rows.push([
        count++,
        isTRF ? 'PERPINDAHAN' : 'KELUAR',
        t.no_transaksi,
        t.tanggal,
        `"${(itm?.nama_barang || '').replace(/"/g, '""')}"`,
        isTRF ? `${t.jumlah} (Pindah)` : `-${t.jumlah}`,
        `"${(t.penerima || '-').replace(/"/g, '""')}"`,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    downloadFile(csvContent, `laporan_transaksi_${new Date().toISOString().slice(0, 10)}.csv`);
  };

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
    if (activeReport === 'stok') exportStockCSV();
    else if (activeReport === 'perpindahan') exportTransferCSV();
    else exportTransactionCSV();
  };

  const resetFilters = () => {
    setSelectedKat('all');
    setSelectedBarangId('all');
    setSelectedDept('all');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            {activeReport === 'perpindahan' ? (
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            ) : activeReport === 'stok' ? (
              <FileSpreadsheet className="w-5 h-5 text-red-600" />
            ) : (
              <Printer className="w-5 h-5 text-orange-600" />
            )}
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {activeReport === 'perpindahan'
                ? 'Laporan Perpindahan Barang (Alur Distribusi)'
                : activeReport === 'stok'
                ? 'Laporan Posisi Stok Fisik Inventaris'
                : 'Laporan Rekapitulasi Transaksi Masuk & Keluar'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeReport === 'perpindahan'
              ? 'Laporan audit pergerakan dan mutasi serah terima unit operasional antar divisi/PIC. Perpindahan barang tidak mengurangi sisa stok fisik gudang utama.'
              : activeReport === 'stok'
              ? 'Rekapitulasi posisi kuantitas stok fisik, valuasi aset, dan kondisi barang di seluruh lokasi rak.'
              : 'Rekapitulasi log mutasi barang masuk dari supplier dan barang keluar operasional unit kerja.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Unduh data laporan dalam format CSV / Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV (Excel)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Cetak laporan resmi atau simpan ke PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Report Switcher & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs no-print space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveReport('stok')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                activeReport === 'stok'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Laporan Posisi Stok Fisik</span>
            </button>

            <button
              onClick={() => setActiveReport('transaksi')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                activeReport === 'transaksi'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Laporan Transaksi Masuk/Keluar</span>
            </button>

            <button
              onClick={() => setActiveReport('perpindahan')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                activeReport === 'perpindahan'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Laporan Perpindahan Barang</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                activeReport === 'perpindahan' ? 'bg-purple-800 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
              }`}>
                {transaksiKeluar.filter((t) => t.no_transaksi.startsWith('TRF-')).length}
              </span>
            </button>
          </div>

          {(startDate || endDate || selectedKat !== 'all' || selectedBarangId !== 'all' || selectedDept !== 'all' || searchTerm) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Dynamic Filters depending on Active Report */}
        {activeReport === 'stok' && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Filter Kategori:</span>
              <select
                value={selectedKat}
                onChange={(e) => setSelectedKat(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Kategori</option>
                {kategori.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeReport === 'perpindahan' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Cari Dokumen / SN / Penerima:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik TRF-, SN, penerima..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Filter Barang:
              </label>
              <select
                value={selectedBarangId}
                onChange={(e) => setSelectedBarangId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="all">Semua Barang</option>
                {barang.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.kode_barang} - {b.nama_barang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Departemen / Unit Tujuan:
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="all">Semua Departemen</option>
                {departemenList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Dari Tanggal:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Sampai:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        )}

        {activeReport === 'transaksi' && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Periode:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono text-xs"
              />
              <span className="text-slate-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Strips */}
      {activeReport === 'stok' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Total Kuantitas Fisik Terdata</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {filteredBarang.reduce((acc, b) => acc + b.stok, 0)} Unit
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Kondisi Siap Pakai (Baik)</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {filteredBarang.filter((b) => b.kondisi === 'Baik').length} SKU
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Perlu Perbaikan / Afkir</span>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {filteredBarang.filter((b) => b.kondisi !== 'Baik').length} SKU
            </div>
          </div>
        </div>
      )}

      {activeReport === 'perpindahan' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Total Dokumen Perpindahan</span>
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {transferList.length} Dokumen
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              <span>Total Fisik Unit Dipindahkan</span>
            </span>
            <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
              {transferList.reduce((acc, t) => acc + t.jumlah, 0)} Unit
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>Divisi / PIC Penerima</span>
            </span>
            <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
              {new Set(transferList.map((t) => t.penerima)).size} Penerima
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status Sisa Stok Gudang</span>
            </span>
            <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mt-1">
              Tetap Dipertahankan
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              0 unit berkurang dari stok fisik utama
            </p>
          </div>
        </div>
      )}

      {/* Printable Report Document Card */}
      <div className="bg-white text-slate-900 border border-slate-200 rounded-xl p-8 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:w-full">
        {/* Printable Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img src="/assets/aistudio/image_e544d608.png" alt="Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-lg font-bold uppercase tracking-wider text-slate-900">
                {activeReport === 'perpindahan'
                  ? 'LAPORAN RESMI PERPINDAHAN BARANG (ALUR DISTRIBUSI)'
                  : activeReport === 'stok'
                  ? 'LAPORAN POSISI STOK INVENTARIS GUDANG & LOGISTIK'
                  : 'LAPORAN REKAPITULASI TRANSAKSI MASUK & KELUAR'}
              </h1>
              </div>
            </div>
              <p className="text-xs text-slate-600 font-medium">
                Sistem Informasi Inventaris &amp; Logistik Gudang
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-mono font-bold text-slate-800">
                {activeReport === 'perpindahan'
                  ? `DOK: LAP-TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
                  : `DOK: LAP-INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`}
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
              </div>
              <div className="text-slate-500 text-[11px]">
                Dicetak Oleh: {user?.nama_lengkap || 'Administrator'}
              </div>
            </div>
          </div>

          {/* Official Policy Reminder for Transfers */}
          {activeReport === 'perpindahan' && (
            <div className="mt-4 p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
              <span className="font-bold text-slate-900">Catatan Kebijakan:</span> Perpindahan barang adalah mutasi serah terima fisik unit operasional antar unit/divisi kerja. Transaksi perpindahan barang tidak mengambil dan tidak mengurangi sisa stok fisik di gudang utama (sisa stok gudang tetap dipertahankan).
            </div>
          )}
        </div>

        {/* 1. CONTENT: LAPORAN PERPINDAHAN BARANG */}
        {activeReport === 'perpindahan' && (
          <div>
            <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-700 mb-2">
              <span>Daftar Mutasi &amp; Serah Terima Perpindahan Barang</span>
              <span className="font-mono text-[11px] normal-case text-slate-500">
                Total: {transferList.length} Dokumen Perpindahan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-200 text-center w-10">No</th>
                    <th className="p-2 border-r border-slate-200 whitespace-nowrap">No. Dokumen</th>
                    <th className="p-2 border-r border-slate-200 whitespace-nowrap">Tanggal</th>
                    <th className="p-2 border-r border-slate-200">Uraian Barang &amp; Serial Number</th>
                    <th className="p-2 border-r border-slate-200">Unit Asal</th>
                    <th className="p-2 border-r border-slate-200">Unit / PIC Penerima</th>
                    <th className="p-2 border-r border-slate-200 text-right whitespace-nowrap">Jumlah Unit</th>
                    <th className="p-2 border-r border-slate-200">Keperluan / Memo</th>
                    <th className="p-2 text-center whitespace-nowrap">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {transferList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                        Belum ada data perpindahan barang yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    transferList.map((trx, idx) => {
                      const itm = barang.find((b) => b.id === trx.barang_id);
                      const petugas = users.find((u) => u.id === trx.petugas_id)?.nama_lengkap || 'Staff';

                      return (
                        <tr key={trx.id} className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-mono font-bold text-purple-700 whitespace-nowrap">
                            {trx.no_transaksi}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-mono whitespace-nowrap">
                            {trx.tanggal}
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            <div className="font-bold text-slate-900">{itm?.nama_barang || `Barang #${trx.barang_id}`}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Kode: {itm?.kode_barang} {trx.model && `· Model: ${trx.model}`}
                            </div>
                            {trx.serial_number && (
                              <div className="text-[10px] font-mono font-semibold text-purple-800 mt-0.5">
                                SN: {trx.serial_number}
                              </div>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            <div className="font-medium text-slate-800">Gudang Logistik</div>
                            <div className="text-[10px] text-slate-500">{itm?.lokasi_rak || 'Rak Utama'}</div>
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            <div className="font-bold text-slate-900">{trx.penerima}</div>
                            <div className="text-[10px] text-slate-500">{trx.departemen}</div>
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono whitespace-nowrap">
                            <div className="font-bold text-purple-700 text-xs">{trx.jumlah} Unit</div>
                            <div className="text-[9px] text-slate-500 italic">(Stok Gudang Tetap)</div>
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-600 max-w-[200px]">
                            {trx.keperluan || 'Serah terima unit kerja operasional'}
                          </td>
                          <td className="p-2 text-center text-slate-500 font-mono text-[10px] whitespace-nowrap">
                            {petugas}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={6} className="p-2 text-right border-r border-slate-300">
                      TOTAL UNIT BARANG DIPINDAHKAN:
                    </td>
                    <td className="p-2 text-right font-mono border-r border-slate-300 text-sm text-purple-800 whitespace-nowrap">
                      {transferList.reduce((acc, t) => acc + t.jumlah, 0)} Unit
                    </td>
                    <td colSpan={2} className="p-2 text-slate-500 text-[11px] font-normal italic">
                      * Sisa stok fisik di gudang utama tidak berkurang (tetap dipertahankan)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2. CONTENT: LAPORAN POSISI STOK FISIK */}
        {activeReport === 'stok' && (
          <div>
            <div className="text-xs font-bold uppercase text-slate-700 mb-2">
              Tabel Posisi Stok &amp; Lokasi Fisik Barang
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-200 text-center w-10">No</th>
                    <th className="p-2 border-r border-slate-200">Kode SKU</th>
                    <th className="p-2 border-r border-slate-200">Nama Barang</th>
                    <th className="p-2 border-r border-slate-200">Kategori</th>
                    <th className="p-2 border-r border-slate-200 text-right">Stok Fisik</th>
                    <th className="p-2 border-r border-slate-200">Lokasi Rak</th>
                    <th className="p-2 text-center">Kondisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {filteredBarang.map((b, idx) => {
                    const kat = kategori.find((k) => k.id === b.kategori_id);
                    const sat = satuan.find((s) => s.id === b.satuan_id);

                    return (
                      <tr key={b.id}>
                        <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-mono font-bold">{b.kode_barang}</td>
                        <td className="p-2 border-r border-slate-200 font-medium">{b.nama_barang}</td>
                        <td className="p-2 border-r border-slate-200">{kat?.nama_kategori}</td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">
                          {b.stok} {sat?.nama_satuan}
                        </td>
                        <td className="p-2 border-r border-slate-200">{b.lokasi_rak}</td>
                        <td className="p-2 text-center font-medium">{b.kondisi}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className="p-2 text-right border-r border-slate-300">
                      TOTAL KUANTITAS FISIK KESELURUHAN:
                    </td>
                    <td className="p-2 text-right font-mono border-r border-slate-300 text-sm text-slate-900">
                      {filteredBarang.reduce((acc, b) => acc + b.stok, 0)} Unit
                    </td>
                    <td colSpan={2} className="p-2 text-slate-500 text-[11px]">
                      Tersebar di berbagai lokasi rak &amp; gudang
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 3. CONTENT: LAPORAN TRANSAKSI MASUK & KELUAR */}
        {activeReport === 'transaksi' && (
          <div className="space-y-8">
            {/* 3.1 Tabel Barang Masuk Terakhir */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-700 mb-2">
                <span>Daftar Barang Masuk Terakhir (Inbound)</span>
                <span className="font-mono text-[11px] normal-case text-emerald-700 font-bold">
                  Total: {filteredTrxMasuk.length} Transaksi (+{filteredTrxMasuk.reduce((sum, t) => sum + t.jumlah, 0)} Unit)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-200 text-center w-10">No</th>
                      <th className="p-2 border-r border-slate-200 whitespace-nowrap">No. Faktur / Dokumen</th>
                      <th className="p-2 border-r border-slate-200 whitespace-nowrap">Tanggal</th>
                      <th className="p-2 border-r border-slate-200">Nama Barang &amp; SKU</th>
                      <th className="p-2 border-r border-slate-200 text-right whitespace-nowrap">Jumlah Masuk</th>
                      <th className="p-2 border-r border-slate-200">Supplier / Pihak Terkait</th>
                      <th className="p-2 text-center whitespace-nowrap">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {filteredTrxMasuk.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                          Belum ada data barang masuk.
                        </td>
                      </tr>
                    ) : (
                      filteredTrxMasuk.map((t, idx) => {
                        const itm = barang.find((b) => b.id === t.barang_id);
                        const sup = supplier.find((s) => s.id === t.supplier_id)?.nama_supplier || 'Supplier Umum';
                        return (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                            <td className="p-2 border-r border-slate-200 font-mono font-bold text-emerald-700 whitespace-nowrap">
                              {t.no_faktur}
                            </td>
                            <td className="p-2 border-r border-slate-200 font-mono whitespace-nowrap">{t.tanggal}</td>
                            <td className="p-2 border-r border-slate-200">
                              <div className="font-bold text-slate-900">{itm?.nama_barang || `Barang #${t.barang_id}`}</div>
                              <div className="text-[10px] text-slate-500 font-mono">Kode: {itm?.kode_barang || '-'}</div>
                            </td>
                            <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                              +{t.jumlah} Unit
                            </td>
                            <td className="p-2 border-r border-slate-200 font-medium text-slate-800">{sup}</td>
                            <td className="p-2 text-center text-slate-500 text-[10px]">Penerimaan Gudang</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={4} className="p-2 text-right border-r border-slate-300">
                        TOTAL KUANTITAS MASUK KESELURUHAN:
                      </td>
                      <td className="p-2 text-right font-mono border-r border-slate-300 text-sm text-emerald-700 whitespace-nowrap">
                        +{filteredTrxMasuk.reduce((sum, t) => sum + t.jumlah, 0)} Unit
                      </td>
                      <td colSpan={2} className="p-2 text-slate-500 text-[11px] font-normal italic">
                        Semua barang masuk tercatat ke sistem inventaris utama
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 3.2 Tabel Barang Keluar Terakhir */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-700 mb-2">
                <span>Daftar Barang Keluar Terakhir (Outbound &amp; Distribusi) — {filteredTrxKeluar.length} Transaksi</span>
                <span className="font-mono text-[11px] normal-case text-orange-700 font-bold">
                  Total Keluar: -{filteredTrxKeluar.filter((t) => !t.no_transaksi.startsWith('TRF-')).reduce((sum, t) => sum + t.jumlah, 0)} Unit
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-200 text-center w-10">No</th>
                      <th className="p-2 border-r border-slate-200 whitespace-nowrap">No. Transaksi</th>
                      <th className="p-2 border-r border-slate-200 whitespace-nowrap">Tanggal</th>
                      <th className="p-2 border-r border-slate-200">Uraian Barang &amp; Serial Number</th>
                      <th className="p-2 border-r border-slate-200">Penerima / Departemen</th>
                      <th className="p-2 border-r border-slate-200 text-right whitespace-nowrap">Jumlah</th>
                      <th className="p-2 border-r border-slate-200">Keperluan / Memo</th>
                      <th className="p-2 text-center whitespace-nowrap">Status Tipe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {filteredTrxKeluar.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                          Belum ada data barang keluar.
                        </td>
                      </tr>
                    ) : (
                      filteredTrxKeluar.map((t, idx) => {
                        const itm = barang.find((b) => b.id === t.barang_id);
                        const isTRF = t.no_transaksi.startsWith('TRF-');
                        return (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                            <td className={`p-2 border-r border-slate-200 font-mono font-bold whitespace-nowrap ${isTRF ? 'text-purple-700' : 'text-slate-900'}`}>
                              {t.no_transaksi}
                            </td>
                            <td className="p-2 border-r border-slate-200 font-mono whitespace-nowrap">{t.tanggal}</td>
                            <td className="p-2 border-r border-slate-200">
                              <div className="font-bold text-slate-900">{itm?.nama_barang || `Barang #${t.barang_id}`}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Kode: {itm?.kode_barang} {t.model && `· Model: ${t.model}`}
                              </div>
                              {t.serial_number && (
                                <div className="text-[10px] font-mono font-semibold text-orange-700 mt-0.5">
                                  SN: {t.serial_number}
                                </div>
                              )}
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <div className="font-bold text-slate-900">{t.penerima}</div>
                              <div className="text-[10px] text-slate-500">{t.departemen}</div>
                            </td>
                            <td className={`p-2 border-r border-slate-200 text-right font-mono font-bold whitespace-nowrap ${isTRF ? 'text-purple-700' : 'text-orange-600'}`}>
                              {isTRF ? `${t.jumlah} (Pindah)` : `-${t.jumlah} Unit`}
                            </td>
                            <td className="p-2 border-r border-slate-200 text-slate-600 max-w-[180px]">
                              {t.keperluan || 'Kebutuhan operasional unit'}
                            </td>
                            <td className="p-2 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isTRF ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                {isTRF ? 'PERPINDAHAN' : 'KELUAR'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={5} className="p-2 text-right border-r border-slate-300">
                        TOTAL KUANTITAS KELUAR (STANDAR / OPERASIONAL):
                      </td>
                      <td className="p-2 text-right font-mono border-r border-slate-300 text-sm text-orange-700 whitespace-nowrap">
                        -{filteredTrxKeluar.filter((t) => !t.no_transaksi.startsWith('TRF-')).reduce((sum, t) => sum + t.jumlah, 0)} Unit
                      </td>
                      <td colSpan={2} className="p-2 text-slate-500 text-[11px] font-normal italic">
                        Menampilkan seluruh {filteredTrxKeluar.length} transaksi keluar secara lengkap
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Printable Signatures */}
        <div className="grid grid-cols-2 gap-16 pt-12 text-center text-xs">
          <div>
            <div className="text-slate-500 mb-16">Mengetahui / Menyetujui,</div>
            <div className="border-t border-slate-400 pt-1 font-bold">
              ( Kepala Bagian Gudang &amp; Logistik )
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-16">Penanggung Jawab Inventaris,</div>
            <div className="border-t border-slate-400 pt-1 font-bold">
              ( {user?.nama_lengkap || 'Administrator'} )
            </div>
          </div>
        </div>
      </div>
  );
};
