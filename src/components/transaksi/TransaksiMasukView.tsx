import React, { useState } from 'react';
import {
  ArrowDownToLine,
  Plus,
  Search,
  Calendar,
  Truck,
  Package,
  Printer,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Camera,
  Trash2,
  Eye,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { TransaksiMasuk } from '../../types';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

export const TransaksiMasukView: React.FC = () => {
  const { transaksiMasuk, barang, supplier, addTransaksiMasuk } = useInventory();
  const { user, users, can } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TransaksiMasuk | null>(null);
  const [viewingImage, setViewingImage] = useState<{ title: string; url: string } | null>(null);

  // Form State
  const [noFaktur, setNoFaktur] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState<number>(supplier[0]?.id || 1);
  const [barangId, setBarangId] = useState<number>(barang[0]?.id || 1);
  const [jumlah, setJumlah] = useState<number>(5);
  const [catatan, setCatatan] = useState('');
  const [fotoNota, setFotoNota] = useState<string>('');
  const [validationError, setValidationError] = useState('');

  const handleOpenAdd = () => {
    const nextSeq = transaksiMasuk.length + 1;
    const today = new Date();
    const yyyymm = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    setNoFaktur(`IN-${yyyymm}-${String(nextSeq).padStart(3, '0')}`);
    setTanggal(new Date().toISOString().slice(0, 10));
    setSupplierId(supplier[0]?.id || 1);
    const initialBarang = barang[0];
    setBarangId(initialBarang?.id || 1);
    setJumlah(5);
    setCatatan('Restok pengadaan barang inventaris rutin');
    setFotoNota('');
    setValidationError('');
    setShowAddModal(true);
  };

  const handleBarangChange = (id: number) => {
    setBarangId(id);
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
      setFotoNota(dataUrl);
      setValidationError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    if (jumlah <= 0) {
      setValidationError('Jumlah barang masuk minimal 1 unit!');
      return;
    }

    addTransaksiMasuk({
      no_faktur: noFaktur,
      tanggal,
      supplier_id: Number(supplierId),
      barang_id: Number(barangId),
      jumlah: Number(jumlah),
      harga_satuan: 0,
      total_harga: 0,
      catatan,
      petugas_id: user ? user.id : 1,
      foto_nota: fotoNota || undefined,
    });

    setShowAddModal(false);
  };

  const filteredTransactions = transaksiMasuk.filter((t) => {
    const itm = barang.find((b) => b.id === t.barang_id);
    const sup = supplier.find((s) => s.id === t.supplier_id);
    const search = searchTerm.toLowerCase();
    return (
      t.no_faktur.toLowerCase().includes(search) ||
      (itm && itm.nama_barang.toLowerCase().includes(search)) ||
      (sup && sup.nama_supplier.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Transaksi Barang Masuk (Inbound / Restok)
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              tbl_transaksi_masuk ({transaksiMasuk.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan pengadaan barang dari supplier, otomatis memperbarui stok fisik, kartu mutasi, dan bukti foto nota.
          </p>
        </div>

        {can('manage_inventory') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Barang Masuk</span>
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
            placeholder="Cari no faktur, supplier, atau barang..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">No. Faktur</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Pemasok (Supplier)</th>
                <th className="px-4 py-3">Barang Diterima</th>
                <th className="px-4 py-3 text-right">Jumlah Masuk</th>
                <th className="px-4 py-3 text-center">Foto Nota</th>
                <th className="px-4 py-3">Petugas</th>
                <th className="px-4 py-3 text-center">Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Belum ada rekaman transaksi barang masuk yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const itm = barang.find((b) => b.id === trx.barang_id);
                  const sup = supplier.find((s) => s.id === trx.supplier_id);
                  const petugas = users.find((u) => u.id === trx.petugas_id);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {trx.no_faktur}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                        {trx.tanggal}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {sup?.nama_supplier || `Supplier #${trx.supplier_id}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {itm?.nama_barang || `Barang #${trx.barang_id}`}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {itm?.kode_barang}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 text-sm whitespace-nowrap">
                        +{trx.jumlah}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {trx.foto_nota ? (
                          <button
                            onClick={() =>
                              setViewingImage({
                                title: `Foto Faktur/Nota ${trx.no_faktur}`,
                                url: trx.foto_nota!,
                              })
                            }
                            className="group relative inline-block p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Klik untuk melihat foto faktur"
                          >
                            <img
                              src={trx.foto_nota}
                              alt="Nota"
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
                          onClick={() => setSelectedInvoice(trx)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="Cetak Bukti Penerimaan Barang"
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

      {/* Modal: Input Barang Masuk (with Image Upload) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Formulir Penerimaan Barang Masuk (Inbound)
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto scrollbar-thin flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    No. Faktur / Referensi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={noFaktur}
                    onChange={(e) => setNoFaktur(e.target.value)}
                    className="w-full px-3 py-2 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Penerimaan <span className="text-red-500">*</span>
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
                  Pemasok (Supplier) <span className="text-red-500">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {supplier.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama_supplier} ({s.kode_supplier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Barang yang Diterima <span className="text-red-500">*</span>
                </label>
                <select
                  value={barangId}
                  onChange={(e) => handleBarangChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  {barang.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.kode_barang} - {b.nama_barang} (Stok Saat Ini: {b.stok})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Masuk (Kuantitas Fisik) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Catatan / Keterangan
                </label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Pengadaan batch 1 untuk persiapan operasional..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* INPUT GAMBAR / FOTO FAKTUR PEMBELIAN */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
                <label className="block font-semibold text-slate-800 dark:text-slate-200">
                  Foto Bukti Faktur / Nota Penerimaan Barang Fisik
                </label>
                <p className="text-[11px] text-slate-500">
                  Unggah foto nota supplier, kuitansi, atau resi pengiriman sebagai bukti audit akuntansi.
                </p>

                {fotoNota ? (
                  <div className="relative mt-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <img
                      src={fotoNota}
                      alt="Preview Faktur"
                      className="w-16 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                      onClick={() => setViewingImage({ title: 'Preview Foto Faktur', url: fotoNota })}
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
                        onClick={() => setViewingImage({ title: 'Preview Foto Faktur', url: fotoNota })}
                        className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Lihat ukuran penuh"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFotoNota('')}
                        className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white dark:bg-slate-900">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                          Klik untuk memilih foto nota/faktur
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Simpan Transaksi Masuk
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

      {/* Invoice Receipt Print Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-xl w-full max-w-lg p-6 shadow-2xl text-xs print:p-0 print:shadow-none max-h-[90vh] overflow-y-auto">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">BUKTI PENERIMAAN BARANG</h2>
                <p className="text-[11px] text-slate-500">Sistem Inventaris CodeIgniter &amp; MySQL</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-red-600">{selectedInvoice.no_faktur}</span>
                <p className="text-[11px] text-slate-500">{selectedInvoice.tanggal}</p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b text-[11px]">
              <div>
                <span className="text-slate-400 block">Pemasok / Supplier:</span>
                <span className="font-bold text-slate-800">
                  {supplier.find((s) => s.id === selectedInvoice.supplier_id)?.nama_supplier}
                </span>
                <p className="text-slate-500">{supplier.find((s) => s.id === selectedInvoice.supplier_id)?.alamat}</p>
              </div>
              <div>
                <span className="text-slate-400 block">Diterima Oleh:</span>
                <span className="font-bold text-slate-800">Bagian Gudang &amp; Logistik</span>
                <p className="text-slate-500">Kondisi: Sesuai Purchase Order</p>
              </div>
            </div>

            {/* Item Table */}
            <div className="py-4">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 font-semibold">
                  <tr>
                    <th className="p-2">Item Barang</th>
                    <th className="p-2 text-right">Jumlah (Qty Fisik)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">
                      {barang.find((b) => b.id === selectedInvoice.barang_id)?.nama_barang}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-600">
                      +{selectedInvoice.jumlah}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Attached Photo if present */}
            {selectedInvoice.foto_nota && (
              <div className="my-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-[11px] text-slate-700 block mb-1.5">
                  Lampiran Foto Faktur / Nota Pembelian:
                </span>
                <img
                  src={selectedInvoice.foto_nota}
                  alt="Lampiran Nota"
                  className="max-h-40 w-auto rounded border border-slate-300 object-contain mx-auto"
                />
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 pb-4 text-center text-[11px]">
              <div>
                <div className="text-slate-500 mb-12">Petugas Pengirim</div>
                <div className="border-t border-slate-300 pt-1 font-semibold">( Supplier PIC )</div>
              </div>
              <div>
                <div className="text-slate-500 mb-12">Petugas Penerima</div>
                <div className="border-t border-slate-300 pt-1 font-semibold">( Petugas Gudang )</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t no-print">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Nota</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
