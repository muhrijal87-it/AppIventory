import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

export const ReportsView: React.FC<{ type?: 'stok' | 'transaksi' }> = ({ type = 'stok' }) => {
  const { barang, kategori, satuan, transaksiMasuk, transaksiKeluar, stats } = useInventory();
  const { user } = useAuth();

  const [activeReport, setActiveReport] = useState<'stok' | 'transaksi'>(type);
  const [selectedKat, setSelectedKat] = useState('all');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const filteredBarang = barang.filter((b) => {
    return selectedKat === 'all' || b.kategori_id === Number(selectedKat);
  });

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
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_stok_inventaris_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Pusat Laporan Stok &amp; Perputaran Barang
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan rekapitulasi posisi kuantitas stok fisik, kondisi barang, dan log transaksi masuk/keluar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportStockCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV (Excel)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs no-print">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveReport('stok')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeReport === 'stok' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Laporan Posisi Stok Fisik
            </button>
            <button
              onClick={() => setActiveReport('transaksi')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeReport === 'transaksi' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Laporan Transaksi Masuk/Keluar
            </button>
          </div>

          {activeReport === 'stok' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Filter Kategori:</span>
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
          )}
        </div>
      </div>

      {/* Summary KPI Strip for Stock Report */}
      {activeReport === 'stok' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-xs text-slate-500">Total Kuantitas Fisik Terdata</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {filteredBarang.reduce((acc, b) => acc + b.stok, 0)} Unit
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-xs text-slate-500">Kondisi Siap Pakai (Baik)</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {filteredBarang.filter((b) => b.kondisi === 'Baik').length} SKU
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-xs text-slate-500">Perlu Perbaikan / Afkir</span>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
              {filteredBarang.filter((b) => b.kondisi !== 'Baik').length} SKU
            </div>
          </div>
        </div>
      )}

      {/* Printable Report Document Card */}
      <div className="bg-white text-slate-900 border border-slate-200 rounded-xl p-8 shadow-xs">
        {/* Printable Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold uppercase tracking-wider text-slate-900">
                LAPORAN INVENTARIS GUDANG &amp; LOGISTIK
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Sistem Informasi Inventaris CodeIgniter 4 &amp; Relational MySQL
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kawasan Industri Pulogadung Blok B No. 12, Jakarta Timur · Telp: (021) 8899-7766
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-mono font-bold text-slate-800">
                DOK: LAP-INV-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
              </div>
              <div className="text-slate-500 text-[11px]">
                Dicetak Oleh: {user?.nama_lengkap || 'Admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        {activeReport === 'stok' ? (
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
        ) : (
          <div>
            <div className="text-xs font-bold uppercase text-slate-700 mb-2">
              Rekapitulasi Transaksi Masuk &amp; Keluar
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Inbound summary */}
              <div className="border border-slate-200 rounded p-3">
                <div className="font-bold text-xs text-emerald-800 mb-2">
                  Barang Masuk Terakhir ({transaksiMasuk.length} Transaksi)
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {transaksiMasuk.map((t) => (
                    <div key={t.id} className="flex justify-between border-b pb-1">
                      <span>{t.no_faktur} ({barang.find((b) => b.id === t.barang_id)?.nama_barang})</span>
                      <span className="font-mono font-bold text-emerald-600">+{t.jumlah}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outbound summary */}
              <div className="border border-slate-200 rounded p-3">
                <div className="font-bold text-xs text-orange-800 mb-2">
                  Barang Keluar Terakhir ({transaksiKeluar.length} Transaksi)
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {transaksiKeluar.map((t) => (
                    <div key={t.id} className="flex justify-between border-b pb-1">
                      <span>{t.no_transaksi} ({t.penerima})</span>
                      <span className="font-mono font-bold text-orange-600">-{t.jumlah}</span>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};
