import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  Download,
  Package,
  Calendar,
  User,
  Info,
  ArrowRight,
  Filter,
  History,
  Building2,
  Undo2
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { Pagination } from '../common/Pagination';
import { MutasiStok } from '../../types';

export const BarangDitarikView: React.FC = () => {
  const { mutasiStok, barang } = useInventory();
  const { users } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter mutations that are "Recall" events
  const recallMutations = mutasiStok.filter((m) => m.referensi.startsWith('RECALL-'));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredRecalls = recallMutations.filter((m) => {
    const itm = barang.find((b) => b.id === m.barang_id);
    const search = searchTerm.toLowerCase();
    return (
      m.referensi.toLowerCase().includes(search) ||
      m.keterangan.toLowerCase().includes(search) ||
      (itm && itm.nama_barang.toLowerCase().includes(search)) ||
      (itm && itm.kode_barang.toLowerCase().includes(search)) ||
      (m.asal && m.asal.toLowerCase().includes(search))
    );
  });

  const totalPages = Math.ceil(filteredRecalls.length / itemsPerPage);
  const paginatedRecalls = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecalls.slice(start, start + itemsPerPage);
  }, [filteredRecalls, currentPage, itemsPerPage]);

  // Reset page on search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const exportCSV = () => {
    const headers = [
      'Waktu Penarikan',
      'No. Referensi (Recall)',
      'Kode Barang',
      'Nama Barang',
      'Jumlah Ditarik',
      'Ditarik Dari (Asal)',
      'Alasan / Keterangan',
      'Petugas Pelaksana'
    ];
    
    const rows = filteredRecalls.map((m) => {
      const itm = barang.find((b) => b.id === m.barang_id);
      const user = users.find((u) => u.id === m.petugas_id);
      return [
        m.tanggal,
        m.referensi,
        itm?.kode_barang || '-',
        `"${(itm?.nama_barang || '').replace(/"/g, '""')}"`,
        m.jumlah,
        `"${(m.asal || '-').replace(/"/g, '""')}"`,
        `"${(m.keterangan || '').replace(/"/g, '""')}"`,
        user?.username || '-'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_barang_ditarik_recall_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0 shadow-sm border border-orange-200 dark:border-orange-800">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Data Penarikan Barang (Recall)</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
                LOGISTIK REVERSE
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Daftar barang yang ditarik kembali dari unit kerja atau departemen ke gudang utama karena alasan tertentu (perbaikan, kesalahan distribusi, atau pengembalian aset).
            </p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm shrink-0 active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Ekspor Laporan Recall</span>
        </button>
      </div>

      {/* Statistics & Filter Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Total Recall Stat */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Total Penarikan</span>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {recallMutations.length}
            </div>
            <div className="text-xs text-slate-400 pb-1.5 font-medium italic">Kasus Tercatat</div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-orange-600 font-bold uppercase tracking-wider">
            <Undo2 className="w-3 h-3" />
            <span>Aktivitas Reverse Logistik</span>
          </div>
        </div>

        {/* Filter Input */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-center">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan No. Recall, Nama Barang, Departemen Asal, atau Keterangan..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span>Filter aktif mencari pada {filteredRecalls.length} data</span>
            </div>
            <span>·</span>
            <span>Gunakan kata kunci spesifik untuk hasil lebih cepat</span>
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Waktu Penarikan</th>
                <th className="px-6 py-4">Barang & SKU</th>
                <th className="px-6 py-4">Asal Departemen</th>
                <th className="px-6 py-4 text-center">Jumlah</th>
                <th className="px-6 py-4">Referensi Recall</th>
                <th className="px-6 py-4">Keterangan / Alasan</th>
                <th className="px-6 py-4">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-300" />
                      </div>
                      <div className="text-slate-400 font-medium">Tidak ada data penarikan barang ditemukan.</div>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Gunakan fitur "Tarik Kembali (Recall)" pada modul Barang Keluar untuk mencatat penarikan fisik barang ke gudang.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecalls.map((m: MutasiStok) => {
                  const itm = barang.find((b) => b.id === m.barang_id);
                  const petugas = users.find((u) => u.id === m.petugas_id);
                  
                  return (
                    <tr key={m.id} className="group hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {m.tanggal.split(' ')[0]}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {m.tanggal.split(' ')[1] || '00:00:00'} WIB
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                            {itm?.foto ? (
                              <img src={itm.foto} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">
                              {itm?.nama_barang || `Barang #${m.barang_id}`}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {itm?.kode_barang || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {m.asal || 'Unit Kerja'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-black font-mono border border-orange-100 dark:border-orange-900">
                          {m.jumlah} Unit
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded border border-blue-100 dark:border-blue-900 inline-block">
                          {m.referensi}
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-xs">
                        <div className="flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-500 leading-relaxed italic">
                            {m.keterangan || 'Tidak ada catatan tambahan.'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300">
                            {petugas?.username?.substring(0, 1).toUpperCase() || 'S'}
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {petugas?.username || 'Staff'}
                          </span>
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
          totalItems={filteredRecalls.length}
          itemsPerPage={itemsPerPage}
          colorScheme="orange"
        />
      </div>

      {/* Info Callout Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Tentang Penarikan Barang</h4>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
              Modul ini melacak aktivitas pengembalian unit dari user ke gudang. 
              Sistem secara otomatis menyesuaikan stok fisik (increment) pada tabel <code className="bg-indigo-100 dark:bg-indigo-900/60 px-1 rounded">tbl_barang</code> saat penarikan divalidasi.
            </p>
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 flex items-center justify-center shrink-0 shadow-sm">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alur Logistik Balik</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Setiap entitas recall memiliki referensi unik bertanda <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">RECALL-</code> 
              yang terhubung dengan nomor transaksi pengeluaran asli untuk kemudahan audit log dan pelacakan unit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
