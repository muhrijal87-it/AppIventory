import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Printer,
  X,
  Building,
  UserCheck,
  Calendar,
  Package,
  Layers,
  ArrowRight,
  Eye,
  Camera,
  Trash2,
  CheckCircle2,
  FileText,
  Boxes,
  Truck,
  Barcode
} from 'lucide-react';
import { TransaksiKeluar } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

interface PerpindahanBarangViewProps {
  onNavigate?: (view: string) => void;
}

export const PerpindahanBarangView: React.FC<PerpindahanBarangViewProps> = ({ onNavigate }) => {
  const { transaksiKeluar, barang, departemen: masterDepartemen, addTransaksiKeluar } = useInventory();
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

    // Auto-fetch serial number from item data
    if (initialItem?.serial_number) {
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

    if (targetItem.stok < jumlah) {
      setValidationError(
        `Stok fisik ${targetItem.nama_barang} tidak mencukupi! Tersedia hanya: ${targetItem.stok}`
      );
      return;
    }

    if (!penerima.trim()) {
      setValidationError('Nama penerima / PIC penanggung jawab wajib diisi!');
      return;
    }

    addTransaksiKeluar({
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

    setShowAddModal(false);
  };

  // Filtered transactions (derived directly from Barang Keluar / transaksiKeluar)
  const filteredData = transaksiKeluar.filter((t) => {
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

  // KPI Metrics
  const totalItemTransferred = transaksiKeluar.reduce((sum, t) => sum + t.jumlah, 0);
  const uniqueDepts = Array.from(new Set(transaksiKeluar.map((t) => t.departemen))).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
              <span>Perpindahan Barang (Alur Distribusi)</span>
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
              Data: tbl_transaksi_keluar ({transaksiKeluar.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring dan pencatatan perpindahan barang fisik dari Gudang Utama ke unit kerja, departemen, atau lokasi operasional.
          </p>
        </div>

        {can('manage_inventory') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Perpindahan Baru</span>
          </button>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Surat Perpindahan</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {transaksiKeluar.length} Dokumen
            </div>
            <span className="text-[11px] text-slate-400">Tercatat dalam sistem</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Volume Berpindah</span>
            <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
              {totalItemTransferred.toLocaleString('id-ID')} Unit
            </div>
            <span className="text-[11px] text-slate-400">Terdokumentasi serah terima</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Departemen Tujuan</span>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {uniqueDepts} Unit Kerja
            </div>
            <span className="text-[11px] text-slate-400">Penerima alur barang</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari no surat, penerima, departemen, atau barang..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 whitespace-nowrap">Filter Dept:</span>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Departemen</option>
            {departemenList.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Data Perpindahan Barang */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">No. Dokumen</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Barang yang Dipindahkan</th>
                <th className="px-4 py-3">Alur Perpindahan (Dari ➔ Ke)</th>
                <th className="px-4 py-3">Penerima (PIC)</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3 text-center">Foto Bukti</th>
                <th className="px-4 py-3">Petugas</th>
                <th className="px-4 py-3 text-center">Aksi / Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data perpindahan barang yang cocok.
                  </td>
                </tr>
              ) : (
                filteredData.map((trx) => {
                  const itm = barang.find((b) => b.id === trx.barang_id);
                  const petugas = users.find((u) => u.id === trx.petugas_id);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {trx.no_transaksi}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                        {trx.tanggal}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {itm?.nama_barang || `Barang #${trx.barang_id}`}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          SKU: {itm?.kode_barang}
                          {trx.model && ` · Model: ${trx.model}`}
                        </div>
                        {trx.serial_number && (
                          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-medium mt-0.5">
                            SN: {trx.serial_number}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500 font-medium">Gudang Utama</span>
                          <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="font-semibold text-purple-700 dark:text-purple-300">
                            {trx.departemen}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5" title={trx.keperluan}>
                          Memo: {trx.keperluan || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {trx.penerima}
                        </div>
                        <div className="text-[10px] text-slate-400">Penanggung Jawab</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400 text-sm whitespace-nowrap">
                        -{trx.jumlah}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {trx.foto_bukti ? (
                          <button
                            onClick={() =>
                              setViewingImage({
                                title: `Foto Bukti Serah Terima ${trx.no_transaksi}`,
                                url: trx.foto_bukti!,
                              })
                            }
                            className="group relative inline-block p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Klik untuk melihat foto serah terima"
                          >
                            <img
                              src={trx.foto_bukti}
                              alt="Bukti Serah Terima"
                              className="w-8 h-8 object-cover rounded border border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform"
                            />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Tanpa foto</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {petugas?.username || 'Staff'}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSuratJalan(trx)}
                          className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-purple-950/60 text-purple-600 dark:text-purple-400 transition-colors"
                          title="Cetak Surat Jalan & Berita Acara Perpindahan"
                        >
                          <Printer className="w-4 h-4" />
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

      {/* Modal: Tambah Perpindahan Barang Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Formulir Perpindahan Barang (Alur Distribusi Keluar)
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto scrollbar-thin flex-1">
              {validationError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    No. Dokumen Perpindahan <span className="text-red-500">*</span>
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
                    Tanggal Perpindahan <span className="text-red-500">*</span>
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
                  Pilih Barang yang Dipindahkan <span className="text-red-500">*</span>
                </label>
                <select
                  value={barangId}
                  onChange={(e) => handleBarangChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  {barang.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.kode_barang} - {b.nama_barang} (Stok Tersedia: {b.stok})
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
                      Serial Number (Nomor Seri)
                    </label>
                    <button
                      type="button"
                      onClick={handleFetchSerial}
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                      title="Ambil data serial number dari master barang"
                    >
                      <Barcode className="w-3.5 h-3.5" />
                      <span>Ambil Serial Number</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Contoh: SN-8829104-X, SN-8829105-Y"
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  {barang.find((b) => b.id === Number(barangId))?.serial_number && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-400">Pilih SN Terdaftar:</span>
                      {barang
                        .find((b) => b.id === Number(barangId))!
                        .serial_number!.split(/[,;\n]+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((sn) => (
                          <button
                            key={sn}
                            type="button"
                            onClick={() => setSerialNumber(sn)}
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                              serialNumber === sn
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                            }`}
                          >
                            {sn}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Departemen / Unit Tujuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={departemen}
                    onChange={(e) => setDepartemen(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {departemenList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Penerima / PIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama staf penerima..."
                    value={penerima}
                    onChange={(e) => setPenerima(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah yang Dipindahkan (Unit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-purple-600 dark:text-purple-400"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Keperluan / Catatan Memo
                </label>
                <textarea
                  rows={2}
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Keterangan alokasi atau dasar permohonan perpindahan..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Foto Bukti Serah Terima */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
                <label className="block font-semibold text-slate-800 dark:text-slate-200">
                  Foto Bukti Serah Terima Fisik (Surat Jalan / Tanda Tangan)
                </label>
                <p className="text-[11px] text-slate-500">
                  Lampirkan foto bukti fisik serah terima barang kepada pihak penerima.
                </p>

                {fotoBukti ? (
                  <div className="relative mt-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <img
                      src={fotoBukti}
                      alt="Preview Bukti"
                      className="w-16 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                      onClick={() => setViewingImage({ title: 'Preview Foto Serah Terima', url: fotoBukti })}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Foto Berhasil Dimuat</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Tersimpan dalam database transaksi keluar.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewingImage({ title: 'Preview Foto Serah Terima', url: fotoBukti })}
                        className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Lihat ukuran penuh"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFotoBukti('')}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white dark:bg-slate-900">
                      <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-purple-600 hover:underline">
                          Pilih foto tanda terima / surat jalan
                        </span>
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Atau seret file gambar langsung (Maks. 2 MB)
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors"
                >
                  Simpan Perpindahan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Image Viewer */}
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

      {/* Printable Surat Jalan / Berita Acara Perpindahan Modal */}
      {selectedSuratJalan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-xl w-full max-w-lg p-6 shadow-2xl text-xs print:p-0 print:shadow-none max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  BERITA ACARA PERPINDAHAN BARANG
                </h2>
                <p className="text-[11px] text-slate-500">Surat Jalan Distribusi Internal Inventaris</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-purple-700">{selectedSuratJalan.no_transaksi}</span>
                <p className="text-[11px] text-slate-500">{selectedSuratJalan.tanggal}</p>
              </div>
            </div>

            {/* Meta Alur */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b text-[11px]">
              <div>
                <span className="text-slate-400 block">Unit Pengirim (Asal):</span>
                <span className="font-bold text-slate-800">Gudang Logistik Utama</span>
                <p className="text-slate-500">Penanggung Jawab Inventaris Pusat</p>
              </div>
              <div>
                <span className="text-slate-400 block">Unit Penerima (Tujuan):</span>
                <span className="font-bold text-slate-800">{selectedSuratJalan.departemen}</span>
                <p className="text-slate-600">PIC: <span className="font-semibold">{selectedSuratJalan.penerima}</span></p>
              </div>
            </div>

            {/* Item Table */}
            <div className="py-4">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 font-semibold">
                  <tr>
                    <th className="p-2">Uraian Barang</th>
                    <th className="p-2">Lokasi Rak</th>
                    <th className="p-2 text-right">Jumlah Unit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">
                      <div>{barang.find((b) => b.id === selectedSuratJalan.barang_id)?.nama_barang}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {barang.find((b) => b.id === selectedSuratJalan.barang_id)?.kode_barang}
                        {selectedSuratJalan.model && ` · Model: ${selectedSuratJalan.model}`}
                      </div>
                      {selectedSuratJalan.serial_number && (
                        <div className="text-[10px] text-slate-700 font-mono font-semibold">
                          SN: {selectedSuratJalan.serial_number}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-slate-600">
                      {barang.find((b) => b.id === selectedSuratJalan.barang_id)?.lokasi_rak || 'Gudang'}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-purple-700">
                      {selectedSuratJalan.jumlah} Unit
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 text-[11px] text-slate-500 italic">
                Keperluan: {selectedSuratJalan.keperluan || 'Distribusi kebutuhan operasional'}
              </div>
            </div>

            {/* Attached Photo */}
            {selectedSuratJalan.foto_bukti && (
              <div className="my-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-[11px] text-slate-700 block mb-1.5">
                  Lampiran Bukti Fisik Serah Terima:
                </span>
                <img
                  src={selectedSuratJalan.foto_bukti}
                  alt="Bukti Serah Terima"
                  className="max-h-40 w-auto rounded border border-slate-300 object-contain mx-auto"
                />
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 pb-4 text-center text-[11px]">
              <div>
                <div className="text-slate-500 mb-12">Petugas Pengirim</div>
                <div className="border-t border-slate-300 pt-1 font-semibold">( Petugas Gudang )</div>
              </div>
              <div>
                <div className="text-slate-500 mb-12">Penerima Barang</div>
                <div className="border-t border-slate-300 pt-1 font-semibold">( {selectedSuratJalan.penerima} )</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t no-print">
              <button
                onClick={() => setSelectedSuratJalan(null)}
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
