import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Barang,
  Kategori,
  Satuan,
  Departemen,
  Supplier,
  TransaksiMasuk,
  TransaksiKeluar,
  MutasiStok,
} from '../types';
import { mysql } from '../db/mysqlEngine';
import { useAuth } from './AuthContext';

interface FlashMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface InventoryContextType {
  barang: Barang[];
  kategori: Kategori[];
  satuan: Satuan[];
  departemen: Departemen[];
  supplier: Supplier[];
  transaksiMasuk: TransaksiMasuk[];
  transaksiKeluar: TransaksiKeluar[];
  mutasiStok: MutasiStok[];
  flash: FlashMessage | null;
  setFlash: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  clearFlash: () => void;
  // Item actions
  addBarang: (item: Omit<Barang, 'id' | 'created_at' | 'updated_at'>) => boolean;
  updateBarang: (id: number, item: Partial<Barang>) => boolean;
  deleteBarang: (id: number) => boolean;
  // Transactions & Transfers
  addTransaksiMasuk: (trx: Omit<TransaksiMasuk, 'id' | 'created_at'>) => boolean;
  addTransaksiKeluar: (trx: Omit<TransaksiKeluar, 'id' | 'created_at'>) => { success: boolean; message: string };
  updateTransaksiKeluar: (id: number, item: Partial<TransaksiKeluar>) => boolean;
  recallTransaksiKeluar: (id: number, alasan: string, kondisiBaru?: 'Baik' | 'Perbaikan' | 'Rusak') => { success: boolean; message: string };
  transferBarangRak: (barangId: number, rakTujuan: string, jumlah: number, catatan: string) => { success: boolean; message: string };
  simulateRealtimeMovement: () => { success: boolean; message: string };
  // Master data
  addKategori: (kat: Omit<Kategori, 'id'>) => boolean;
  updateKategori: (id: number, kat: Partial<Kategori>) => boolean;
  deleteKategori: (id: number) => boolean;
  addSatuan: (sat: Omit<Satuan, 'id'>) => boolean;
  updateSatuan: (id: number, sat: Partial<Satuan>) => boolean;
  deleteSatuan: (id: number) => boolean;
  addDepartemen: (dept: Omit<Departemen, 'id'>) => boolean;
  updateDepartemen: (id: number, dept: Partial<Departemen>) => boolean;
  deleteDepartemen: (id: number) => { success: boolean; message?: string };
  addSupplier: (sup: Omit<Supplier, 'id'>) => boolean;
  updateSupplier: (id: number, sup: Partial<Supplier>) => boolean;
  deleteSupplier: (id: number) => boolean;
  // Reload
  reloadState: () => void;
  // Stats
  stats: {
    totalJenisBarang: number;
    totalStokFisik: number;
    totalNilaiAset: number;
    barangKritis: Barang[];
    barangHabis: Barang[];
    totalMasukBulanIni: number;
    totalKeluarBulanIni: number;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logActivity } = useAuth();
  const [dbState, setDbState] = useState(mysql.getState());
  const [flash, setFlashState] = useState<FlashMessage | null>(null);

  const setFlash = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setFlashState({ type, message });
    setTimeout(() => {
      setFlashState((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  const clearFlash = () => setFlashState(null);

  const reloadState = () => {
    const fresh = mysql.getState();
    setDbState({ ...fresh });
  };

  useEffect(() => {
    reloadState();
    const handleCloudSync = () => {
      reloadState();
    };
    window.addEventListener('db_synced_from_cloud', handleCloudSync);
    return () => {
      window.removeEventListener('db_synced_from_cloud', handleCloudSync);
    };
  }, []);

  // BARANG CRUD
  const addBarang = (itemData: Omit<Barang, 'id' | 'created_at' | 'updated_at'>): boolean => {
    const t0 = performance.now();
    const state = mysql.getState();
    const newId = state.barang.length > 0 ? Math.max(...state.barang.map((b) => b.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newBarang: Barang = {
      ...itemData,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    state.barang.unshift(newBarang);

    // Always record registration mutation in mutasi_stok so it appears in live activity tracker
    const mutasiId = state.mutasi_stok.length > 0 ? Math.max(...state.mutasi_stok.map((m) => m.id)) + 1 : 1;
    state.mutasi_stok.unshift({
      id: mutasiId,
      tanggal: now,
      barang_id: newId,
      jenis: 'Penyesuaian',
      jumlah: newBarang.stok,
      stok_sebelum: 0,
      stok_sesudah: newBarang.stok,
      referensi: 'REGISTRASI',
      keterangan: `Pencatatan SKU & pendaftaran barang baru (${newBarang.nama_barang})`,
      petugas_id: user ? user.id : 1,
      asal: 'Registrasi SKU Baru',
      tujuan: newBarang.lokasi_rak || 'Gudang Utama',
    });

    mysql.setState(state);
    reloadState();

    mysql.logQuery(`INSERT INTO tbl_barang (kode_barang, nama_barang, stok, stok_min, harga_beli, ...) VALUES ('${newBarang.kode_barang}', '${newBarang.nama_barang}', ${newBarang.stok}, ...)`, performance.now() - t0, 1);
    logActivity('INSERT_BARANG', 'INVENTARIS', `Menambahkan barang baru: ${newBarang.kode_barang} - ${newBarang.nama_barang}`);
    setFlash('success', `Data barang '${newBarang.nama_barang}' berhasil disimpan ke database! (CodeIgniter Model: BarangModel::save)`);
    return true;
  };

  const updateBarang = (id: number, itemData: Partial<Barang>): boolean => {
    const t0 = performance.now();
    const state = mysql.getState();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    state.barang = state.barang.map((b) => (b.id === id ? { ...b, ...itemData, updated_at: now } : b));
    mysql.setState(state);
    reloadState();

    mysql.logQuery(`UPDATE tbl_barang SET updated_at = NOW() WHERE id = ${id}`, performance.now() - t0, 1);
    logActivity('UPDATE_BARANG', 'INVENTARIS', `Memperbarui rincian data barang ID #${id}`);
    setFlash('info', `Perubahan data barang berhasil diperbarui ke database.`);
    return true;
  };

  const deleteBarang = (id: number): boolean => {
    const t0 = performance.now();
    const state = mysql.getState();
    const target = state.barang.find((b) => b.id === id);
    if (!target) return false;

    state.barang = state.barang.filter((b) => b.id !== id);
    mysql.setState(state);
    reloadState();

    mysql.logQuery(`DELETE FROM tbl_barang WHERE id = ${id}`, performance.now() - t0, 1);
    logActivity('DELETE_BARANG', 'INVENTARIS', `Menghapus data barang ${target.kode_barang} (${target.nama_barang})`);
    setFlash('warning', `Data barang ${target.kode_barang} telah dihapus dari tabel tbl_barang.`);
    return true;
  };

  // INBOUND TRANSACTIONS
  const addTransaksiMasuk = (trxData: Omit<TransaksiMasuk, 'id' | 'created_at'>): boolean => {
    const t0 = performance.now();
    const state = mysql.getState();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newId = state.transaksi_masuk.length > 0 ? Math.max(...state.transaksi_masuk.map((t) => t.id)) + 1 : 1;

    const newTrx: TransaksiMasuk = {
      ...trxData,
      id: newId,
      created_at: now,
    };

    // Update item stock in table
    const targetItem = state.barang.find((b) => b.id === trxData.barang_id);
    if (!targetItem) return false;

    const stokSebelum = targetItem.stok;
    const stokSesudah = targetItem.stok + trxData.jumlah;
    targetItem.stok = stokSesudah;
    targetItem.updated_at = now;

    // Get supplier info for provenance
    const sup = state.supplier.find((s) => s.id === trxData.supplier_id);
    const asalLokasi = sup?.nama_supplier ? `${sup.nama_supplier} (Pemasok)` : 'Pemasok / Vendor Eksternal';
    const tujuanLokasi = targetItem.lokasi_rak || 'Gudang Utama';

    // Record mutation
    const mutasiId = state.mutasi_stok.length > 0 ? Math.max(...state.mutasi_stok.map((m) => m.id)) + 1 : 1;
    state.mutasi_stok.unshift({
      id: mutasiId,
      tanggal: now,
      barang_id: targetItem.id,
      jenis: 'Masuk',
      jumlah: trxData.jumlah,
      stok_sebelum: stokSebelum,
      stok_sesudah: stokSesudah,
      referensi: trxData.no_faktur,
      keterangan: `Penerimaan barang masuk (Faktur: ${trxData.no_faktur})`,
      petugas_id: trxData.petugas_id,
      asal: asalLokasi,
      tujuan: tujuanLokasi,
    });

    state.transaksi_masuk.unshift(newTrx);
    mysql.setState(state);
    reloadState();

    mysql.logQuery(`START TRANSACTION; INSERT INTO tbl_transaksi_masuk VALUES (...); UPDATE tbl_barang SET stok = stok + ${trxData.jumlah} WHERE id = ${targetItem.id}; COMMIT;`, performance.now() - t0, 2);
    logActivity('INSERT_TRX_MASUK', 'TRANSAKSI', `Input transaksi masuk ${newTrx.no_faktur} (+${trxData.jumlah} ${targetItem.nama_barang})`);
    setFlash('success', `Transaksi masuk ${newTrx.no_faktur} berhasil dicatat. Stok ${targetItem.nama_barang} bertambah menjadi ${stokSesudah}.`);
    return true;
  };

  // OUTBOUND TRANSACTIONS & PERPINDAHAN BARANG
  const addTransaksiKeluar = (trxData: Omit<TransaksiKeluar, 'id' | 'created_at'>): { success: boolean; message: string } => {
    const t0 = performance.now();
    const state = mysql.getState();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const targetItem = state.barang.find((b) => b.id === trxData.barang_id);
    if (!targetItem) {
      return { success: false, message: 'Barang tidak ditemukan dalam database!' };
    }

    const isTransfer = trxData.no_transaksi.startsWith('TRF-');

    // Validasi kecukupan stok hanya dilakukan untuk barang keluar fisik baru (OUT-...).
    // Untuk perpindahan barang (TRF-...), unit berasal dari pemindahan barang yang sudah beredar/didistribusikan
    // sehingga tidak mengambil dari sisa stok gudang dan tidak boleh diblokir oleh sisa stok.
    if (!isTransfer && targetItem.stok < trxData.jumlah) {
      return {
        success: false,
        message: `Stok tidak mencukupi! Stok ${targetItem.nama_barang} saat ini: ${targetItem.stok}, permintaan: ${trxData.jumlah}.`,
      };
    }

    const newId = state.transaksi_keluar.length > 0 ? Math.max(...state.transaksi_keluar.map((t) => t.id)) + 1 : 1;
    const newTrx: TransaksiKeluar = {
      ...trxData,
      id: newId,
      created_at: now,
    };

    const stokSebelum = targetItem.stok;
    // ATURAN PENTING: Untuk status perpindahan barang, JANGAN kurangi sisa stok.
    // Sisa stok gudang tetap dipertahankan. Stok hanya berkurang bila ada barang keluar (OUT-...).
    const stokSesudah = isTransfer ? targetItem.stok : targetItem.stok - trxData.jumlah;
    if (!isTransfer) {
      targetItem.stok = stokSesudah;
    }
    targetItem.updated_at = now;

    const asalLokasi = targetItem.lokasi_rak || 'Gudang Utama';
    const tujuanLokasi =
      trxData.departemen && trxData.departemen !== '-'
        ? `${trxData.departemen} (${trxData.penerima})`
        : trxData.penerima;

    // Record mutation
    const mutasiId = state.mutasi_stok.length > 0 ? Math.max(...state.mutasi_stok.map((m) => m.id)) + 1 : 1;
    state.mutasi_stok.unshift({
      id: mutasiId,
      tanggal: now,
      barang_id: targetItem.id,
      jenis: isTransfer ? 'Transfer' : 'Keluar',
      jumlah: trxData.jumlah,
      stok_sebelum: stokSebelum,
      stok_sesudah: stokSesudah,
      referensi: trxData.no_transaksi,
      keterangan: isTransfer
        ? `Perpindahan barang ke ${trxData.penerima} (Sisa stok gudang tetap ${targetItem.stok} unit)`
        : `Pengeluaran barang (${trxData.departemen && trxData.departemen !== '-' ? trxData.departemen + ' - ' : ''}${trxData.penerima})`,
      petugas_id: trxData.petugas_id,
      asal: asalLokasi,
      tujuan: tujuanLokasi,
    });

    state.transaksi_keluar.unshift(newTrx);
    mysql.setState(state);
    reloadState();

    if (isTransfer) {
      mysql.logQuery(
        `START TRANSACTION; INSERT INTO tbl_transaksi_keluar VALUES (...); -- Perpindahan barang (stok gudang tetap: ${targetItem.stok}); COMMIT;`,
        performance.now() - t0,
        1
      );
      logActivity(
        'TRANSFER_BARANG',
        'TRANSAKSI',
        `Perpindahan barang ${newTrx.no_transaksi} (${trxData.jumlah} unit ${targetItem.nama_barang} ke ${trxData.penerima}, sisa stok gudang tetap: ${targetItem.stok})`
      );
      setFlash(
        'success',
        `Perpindahan barang ${newTrx.no_transaksi} berhasil dicatat. Sisa stok ${targetItem.nama_barang} di gudang tetap ${targetItem.stok} unit (tidak berkurang).`
      );
    } else {
      mysql.logQuery(
        `START TRANSACTION; INSERT INTO tbl_transaksi_keluar VALUES (...); UPDATE tbl_barang SET stok = stok - ${trxData.jumlah} WHERE id = ${targetItem.id}; COMMIT;`,
        performance.now() - t0,
        2
      );
      logActivity(
        'INSERT_TRX_KELUAR',
        'TRANSAKSI',
        `Input transaksi keluar ${newTrx.no_transaksi} (-${trxData.jumlah} ${targetItem.nama_barang})`
      );
      setFlash(
        'success',
        `Pengeluaran barang ${newTrx.no_transaksi} berhasil dicatat. Sisa stok ${targetItem.nama_barang}: ${stokSesudah}.`
      );
    }
    return { success: true, message: 'Transaksi berhasil disimpan!' };
  };

  const updateTransaksiKeluar = (id: number, itemData: Partial<TransaksiKeluar>): boolean => {
    const t0 = performance.now();
    const state = mysql.getState();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    state.transaksi_keluar = state.transaksi_keluar.map((t) => 
      t.id === id ? { ...t, ...itemData } : t
    );
    
    mysql.setState(state);
    reloadState();

    mysql.logQuery(`UPDATE tbl_transaksi_keluar SET penerima = ... WHERE id = ${id}`, performance.now() - t0, 1);
    logActivity('UPDATE_TRX_KELUAR', 'TRANSAKSI', `Memperbarui rincian transaksi keluar ID #${id}`);
    return true;
  };

  const recallTransaksiKeluar = (
    id: number, 
    alasan: string, 
    kondisiBaru?: 'Baik' | 'Perbaikan' | 'Rusak'
  ): { success: boolean; message: string } => {
    const t0 = performance.now();
    const state = mysql.getState();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const trxIndex = state.transaksi_keluar.findIndex((t) => t.id === id);
    if (trxIndex === -1) {
      return { success: false, message: 'Data transaksi tidak ditemukan!' };
    }

    const trx = state.transaksi_keluar[trxIndex];
    const targetItem = state.barang.find((b) => b.id === trx.barang_id);
    if (!targetItem) {
      return { success: false, message: 'Barang terkait sudah dihapus dari database!' };
    }

    const isTransfer = trx.no_transaksi.startsWith('TRF-');
    const stokSebelum = targetItem.stok;
    
    // ATURAN: Jika bukan transfer (berarti barang benar-benar keluar), kembalikan stok.
    // Jika transfer, sisa stok gudang tidak pernah berkurang, jadi tidak perlu ditambah.
    const stokSesudah = isTransfer ? targetItem.stok : targetItem.stok + trx.jumlah;
    
    if (!isTransfer) {
      targetItem.stok = stokSesudah;
    }
    
    // Update physical condition if provided during recall
    if (kondisiBaru) {
      targetItem.kondisi = kondisiBaru;
    }
    
    targetItem.updated_at = now;

    // Record mutation for the Recall
    const mutasiId = state.mutasi_stok.length > 0 ? Math.max(...state.mutasi_stok.map((m) => m.id)) + 1 : 1;
    state.mutasi_stok.unshift({
      id: mutasiId,
      tanggal: now,
      barang_id: targetItem.id,
      jenis: 'Masuk',
      jumlah: trx.jumlah,
      stok_sebelum: stokSebelum,
      stok_sesudah: stokSesudah,
      referensi: `RECALL-${trx.no_transaksi}`,
      keterangan: `Penarikan kembali (Recall) barang dari ${trx.penerima}. Alasan: ${alasan || 'Tidak disebutkan'}`,
      petugas_id: user ? user.id : 1,
      asal: `${trx.penerima} (${trx.departemen})`,
      tujuan: targetItem.lokasi_rak || 'Gudang Utama',
    });

    // Remove the transaction record
    state.transaksi_keluar.splice(trxIndex, 1);

    mysql.setState(state);
    reloadState();

    mysql.logQuery(
      `START TRANSACTION; DELETE FROM tbl_transaksi_keluar WHERE id = ${id}; ${!isTransfer ? `UPDATE tbl_barang SET stok = stok + ${trx.jumlah} WHERE id = ${targetItem.id};` : ''} COMMIT;`,
      performance.now() - t0,
      2
    );

    logActivity(
      'RECALL_BARANG',
      'TRANSAKSI',
      `Tarik kembali barang ${trx.no_transaksi} (${trx.jumlah} unit ${targetItem.nama_barang} dari ${trx.penerima})`
    );

    setFlash(
      'warning',
      `Berhasil menarik kembali barang ${trx.no_transaksi}. Stok ${targetItem.nama_barang} kini: ${stokSesudah}.`
    );

    return { success: true, message: 'Barang berhasil ditarik kembali ke gudang.' };
  };

  // INTERNAL RACK TRANSFER (RELOCATION)
  const transferBarangRak = (
    barangId: number,
    rakTujuan: string,
    jumlah: number,
    catatan: string
  ): { success: boolean; message: string } => {
    const t0 = performance.now();
    const state = mysql.getState();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const targetItem = state.barang.find((b) => b.id === barangId);
    if (!targetItem) {
      return { success: false, message: 'Barang tidak ditemukan!' };
    }

    if (jumlah <= 0) {
      return { success: false, message: 'Jumlah perpindahan minimal 1!' };
    }

    if (targetItem.stok < jumlah) {
      return {
        success: false,
        message: `Stok tidak mencukupi untuk transfer! Stok saat ini: ${targetItem.stok}`,
      };
    }

    const rakLama = targetItem.lokasi_rak || 'Gudang Utama';
    if (rakLama.trim().toLowerCase() === rakTujuan.trim().toLowerCase()) {
      return { success: false, message: 'Lokasi rak tujuan harus berbeda dengan rak asal!' };
    }

    // Update rack position
    targetItem.lokasi_rak = rakTujuan;
    targetItem.updated_at = now;

    const nextSeq = state.mutasi_stok.filter((m) => m.jenis === 'Transfer').length + 1;
    const yyyymm = new Date().toISOString().slice(0, 7).replace('-', '');
    const refNo = `TRF-${yyyymm}-${String(nextSeq).padStart(3, '0')}`;

    const mutasiId = state.mutasi_stok.length > 0 ? Math.max(...state.mutasi_stok.map((m) => m.id)) + 1 : 1;
    state.mutasi_stok.unshift({
      id: mutasiId,
      tanggal: now,
      barang_id: targetItem.id,
      jenis: 'Transfer',
      jumlah,
      stok_sebelum: targetItem.stok,
      stok_sesudah: targetItem.stok,
      referensi: refNo,
      keterangan: catatan ? `Relokasi: ${catatan}` : `Perpindahan fisik dari ${rakLama} ke ${rakTujuan}`,
      petugas_id: user ? user.id : 1,
      asal: rakLama,
      tujuan: rakTujuan,
    });

    mysql.setState(state);
    reloadState();

    mysql.logQuery(
      `UPDATE tbl_barang SET lokasi_rak = '${rakTujuan}', updated_at = NOW() WHERE id = ${targetItem.id}; INSERT INTO tbl_mutasi_stok (...)`,
      performance.now() - t0,
      1
    );
    logActivity('TRANSFER_RAK', 'LOGISTIK', `Transfer ${jumlah} unit ${targetItem.nama_barang} dari ${rakLama} ke ${rakTujuan}`);
    setFlash('success', `Perpindahan barang ${targetItem.nama_barang} dari ${rakLama} ke ${rakTujuan} berhasil dicatat.`);
    return { success: true, message: `Barang berhasil dipindahkan ke ${rakTujuan}` };
  };

  // REALTIME MOVEMENT SIMULATOR (to demonstrate live streaming updates)
  const simulateRealtimeMovement = (): { success: boolean; message: string } => {
    const state = mysql.getState();
    if (state.barang.length === 0) return { success: false, message: 'Tidak ada barang untuk disimulasikan' };

    // Choose random available item
    const availableItems = state.barang.filter((b) => b.stok > 1);
    const targetItem = availableItems[Math.floor(Math.random() * availableItems.length)] || state.barang[0];

    const departments = [
      'Divisi Pengembangan TI (Bpk. Bambang)',
      'Human Resources & GA (Ibu Sarah)',
      'Operasional & Distribusi (Doni)',
      'Finance & Akuntansi (Rina M.)',
      'Tim Project Site B (Ahmad)',
      'Maintenance Lab (Wahyu)',
    ];

    const racks = [
      'Rak A-2 (Gudang Elektronik)',
      'Rak B-3 (Gudang ATK)',
      'Rak C-2 (Peralatan Teknisi)',
      'Rak D-1 (Area Packing Logistik)',
      'Rak E-4 (Gudang Transit Lantai 2)',
    ];

    const isTransfer = Math.random() > 0.5;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const mutasiId = state.mutasi_stok.length > 0 ? Math.max(...state.mutasi_stok.map((m) => m.id)) + 1 : 1;

    if (isTransfer) {
      const rakLama = targetItem.lokasi_rak || 'Rak A-1';
      const rakBaru = racks[Math.floor(Math.random() * racks.length)];
      targetItem.lokasi_rak = rakBaru;
      targetItem.updated_at = now;

      const refNo = `TRF-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;
      state.mutasi_stok.unshift({
        id: mutasiId,
        tanggal: now,
        barang_id: targetItem.id,
        jenis: 'Transfer',
        jumlah: 1,
        stok_sebelum: targetItem.stok,
        stok_sesudah: targetItem.stok,
        referensi: refNo,
        keterangan: `[SIMULASI LIVE] Relokasi cepat rak penyimpanan`,
        petugas_id: user ? user.id : 1,
        asal: rakLama,
        tujuan: rakBaru,
      });

      mysql.setState(state);
      reloadState();
      return { success: true, message: `[LIVE] ${targetItem.nama_barang} dipindahkan dari ${rakLama} ke ${rakBaru}` };
    } else {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const asal = targetItem.lokasi_rak || 'Gudang Utama';
      const refNo = `OUT-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;

      const stokSebelum = targetItem.stok;
      targetItem.stok = Math.max(1, targetItem.stok - 1);
      targetItem.updated_at = now;

      state.mutasi_stok.unshift({
        id: mutasiId,
        tanggal: now,
        barang_id: targetItem.id,
        jenis: 'Keluar',
        jumlah: 1,
        stok_sebelum: stokSebelum,
        stok_sesudah: targetItem.stok,
        referensi: refNo,
        keterangan: `[SIMULASI LIVE] Distribusi unit ke departemen pemohon`,
        petugas_id: user ? user.id : 1,
        asal: asal,
        tujuan: dept,
      });

      mysql.setState(state);
      reloadState();
      return { success: true, message: `[LIVE] 1 unit ${targetItem.nama_barang} dikirim ke ${dept}` };
    }
  };

  // KATEGORI CRUD
  const addKategori = (katData: Omit<Kategori, 'id'>): boolean => {
    const state = mysql.getState();
    const newId = state.kategori.length > 0 ? Math.max(...state.kategori.map((k) => k.id)) + 1 : 1;
    state.kategori.push({ ...katData, id: newId });
    mysql.setState(state);
    reloadState();
    logActivity('INSERT_KATEGORI', 'MASTER_DATA', `Menambahkan kategori: ${katData.nama_kategori}`);
    setFlash('success', `Kategori '${katData.nama_kategori}' berhasil ditambahkan.`);
    return true;
  };

  const updateKategori = (id: number, katData: Partial<Kategori>): boolean => {
    const state = mysql.getState();
    state.kategori = state.kategori.map((k) => (k.id === id ? { ...k, ...katData } : k));
    mysql.setState(state);
    reloadState();
    logActivity('UPDATE_KATEGORI', 'MASTER_DATA', `Memperbarui kategori ID #${id}`);
    setFlash('info', `Data kategori berhasil diperbarui.`);
    return true;
  };

  const deleteKategori = (id: number): boolean => {
    const state = mysql.getState();
    const hasItems = state.barang.some((b) => b.kategori_id === id);
    if (hasItems) {
      setFlash('error', 'Kategori ini tidak dapat dihapus karena masih digunakan oleh beberapa barang!');
      return false;
    }
    state.kategori = state.kategori.filter((k) => k.id !== id);
    mysql.setState(state);
    reloadState();
    logActivity('DELETE_KATEGORI', 'MASTER_DATA', `Menghapus kategori ID #${id}`);
    setFlash('warning', 'Kategori berhasil dihapus.');
    return true;
  };

  // SATUAN CRUD
  const addSatuan = (satData: Omit<Satuan, 'id'>): boolean => {
    const state = mysql.getState();
    const newId = state.satuan.length > 0 ? Math.max(...state.satuan.map((s) => s.id)) + 1 : 1;
    state.satuan.push({ ...satData, id: newId });
    mysql.setState(state);
    reloadState();
    logActivity('INSERT_SATUAN', 'MASTER_DATA', `Menambahkan satuan: ${satData.nama_satuan}`);
    setFlash('success', `Satuan '${satData.nama_satuan}' berhasil ditambahkan.`);
    return true;
  };

  const updateSatuan = (id: number, satData: Partial<Satuan>): boolean => {
    const state = mysql.getState();
    state.satuan = state.satuan.map((s) => (s.id === id ? { ...s, ...satData } : s));
    mysql.setState(state);
    reloadState();
    logActivity('UPDATE_SATUAN', 'MASTER_DATA', `Memperbarui satuan ID #${id}`);
    setFlash('info', `Data satuan berhasil diperbarui.`);
    return true;
  };

  const deleteSatuan = (id: number): boolean => {
    const state = mysql.getState();
    const hasItems = state.barang.some((b) => b.satuan_id === id);
    if (hasItems) {
      setFlash('error', 'Satuan ini tidak dapat dihapus karena masih digunakan oleh beberapa barang!');
      return false;
    }
    state.satuan = state.satuan.filter((s) => s.id !== id);
    mysql.setState(state);
    reloadState();
    logActivity('DELETE_SATUAN', 'MASTER_DATA', `Menghapus satuan ID #${id}`);
    setFlash('warning', 'Satuan berhasil dihapus.');
    return true;
  };

  // DEPARTEMEN / DIVISI CRUD
  const addDepartemen = (deptData: Omit<Departemen, 'id'>): boolean => {
    const state = mysql.getState();
    if (!state.departemen) state.departemen = [];
    const newId = state.departemen.length > 0 ? Math.max(...state.departemen.map((d) => d.id)) + 1 : 1;
    state.departemen.push({ ...deptData, id: newId });
    mysql.setState(state);
    reloadState();
    logActivity('INSERT_DEPARTEMEN', 'MASTER_DATA', `Menambahkan departemen: ${deptData.nama_departemen}`);
    setFlash('success', `Departemen '${deptData.nama_departemen}' berhasil ditambahkan.`);
    return true;
  };

  const updateDepartemen = (id: number, deptData: Partial<Departemen>): boolean => {
    const state = mysql.getState();
    if (!state.departemen) return false;
    const oldDept = state.departemen.find((d) => d.id === id);
    const oldName = oldDept?.nama_departemen;

    state.departemen = state.departemen.map((d) => (d.id === id ? { ...d, ...deptData } : d));

    // Update transactions referencing old name
    if (oldName && deptData.nama_departemen && oldName !== deptData.nama_departemen) {
      state.transaksi_keluar = state.transaksi_keluar.map((t) =>
        t.departemen === oldName ? { ...t, departemen: deptData.nama_departemen! } : t
      );
    }

    mysql.setState(state);
    reloadState();
    logActivity('UPDATE_DEPARTEMEN', 'MASTER_DATA', `Memperbarui departemen ID #${id}`);
    setFlash('info', `Data departemen berhasil diperbarui.`);
    return true;
  };

  const deleteDepartemen = (id: number): { success: boolean; message?: string } => {
    const state = mysql.getState();
    if (!state.departemen) return { success: false, message: 'Data departemen tidak ditemukan.' };
    const deptToDelete = state.departemen.find((d) => d.id === id);
    if (!deptToDelete) return { success: false, message: 'Departemen tidak ditemukan.' };

    const inUse = state.transaksi_keluar.some((t) => t.departemen === deptToDelete.nama_departemen);
    if (inUse) {
      setFlash('error', `Departemen '${deptToDelete.nama_departemen}' tidak dapat dihapus karena masih digunakan pada data transaksi barang keluar.`);
      return { success: false, message: 'Departemen masih memiliki relasi transaksi pengeluaran.' };
    }

    state.departemen = state.departemen.filter((d) => d.id !== id);
    mysql.setState(state);
    reloadState();
    logActivity('DELETE_DEPARTEMEN', 'MASTER_DATA', `Menghapus departemen: ${deptToDelete.nama_departemen}`);
    setFlash('warning', `Departemen '${deptToDelete.nama_departemen}' berhasil dihapus.`);
    return { success: true };
  };

  // SUPPLIER CRUD
  const addSupplier = (supData: Omit<Supplier, 'id'>): boolean => {
    const state = mysql.getState();
    const newId = state.supplier.length > 0 ? Math.max(...state.supplier.map((s) => s.id)) + 1 : 1;
    state.supplier.push({ ...supData, id: newId });
    mysql.setState(state);
    reloadState();
    logActivity('INSERT_SUPPLIER', 'MASTER_DATA', `Menambahkan pemasok: ${supData.nama_supplier}`);
    setFlash('success', `Pemasok '${supData.nama_supplier}' berhasil ditambahkan.`);
    return true;
  };

  const updateSupplier = (id: number, supData: Partial<Supplier>): boolean => {
    const state = mysql.getState();
    state.supplier = state.supplier.map((s) => (s.id === id ? { ...s, ...supData } : s));
    mysql.setState(state);
    reloadState();
    logActivity('UPDATE_SUPPLIER', 'MASTER_DATA', `Memperbarui data pemasok ID #${id}`);
    setFlash('info', `Data pemasok berhasil diperbarui.`);
    return true;
  };

  const deleteSupplier = (id: number): boolean => {
    const state = mysql.getState();
    state.supplier = state.supplier.filter((s) => s.id !== id);
    mysql.setState(state);
    reloadState();
    logActivity('DELETE_SUPPLIER', 'MASTER_DATA', `Menghapus pemasok ID #${id}`);
    setFlash('warning', 'Pemasok berhasil dihapus.');
    return true;
  };

  // CALCULATE STATS
  const totalJenisBarang = dbState.barang.length;
  const totalStokFisik = dbState.barang.reduce((acc, b) => acc + b.stok, 0);
  const totalNilaiAset = dbState.barang.reduce((acc, b) => acc + b.stok * b.harga_beli, 0);
  const barangKritis = dbState.barang.filter((b) => b.stok > 0 && b.stok <= b.stok_min);
  const barangHabis = dbState.barang.filter((b) => b.stok === 0);
  const totalMasukBulanIni = dbState.transaksi_masuk.reduce((acc, t) => acc + t.jumlah, 0);
  const totalKeluarBulanIni = dbState.transaksi_keluar
    .filter((t) => !t.no_transaksi.startsWith('TRF-'))
    .reduce((acc, t) => acc + t.jumlah, 0);

  return (
    <InventoryContext.Provider
      value={{
        barang: dbState.barang,
        kategori: dbState.kategori,
        satuan: dbState.satuan,
        departemen: dbState.departemen || [],
        supplier: dbState.supplier,
        transaksiMasuk: dbState.transaksi_masuk,
        transaksiKeluar: dbState.transaksi_keluar,
        mutasiStok: dbState.mutasi_stok,
        flash,
        setFlash,
        clearFlash,
        addBarang,
        updateBarang,
        deleteBarang,
        addTransaksiMasuk,
        addTransaksiKeluar,
        updateTransaksiKeluar,
        recallTransaksiKeluar,
        transferBarangRak,
        simulateRealtimeMovement,
        addKategori,
        updateKategori,
        deleteKategori,
        addSatuan,
        updateSatuan,
        deleteSatuan,
        addDepartemen,
        updateDepartemen,
        deleteDepartemen,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        reloadState,
        stats: {
          totalJenisBarang,
          totalStokFisik,
          totalNilaiAset,
          barangKritis,
          barangHabis,
          totalMasukBulanIni,
          totalKeluarBulanIni,
        },
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
