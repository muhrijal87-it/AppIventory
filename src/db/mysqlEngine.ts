import {
  User,
  Kategori,
  Satuan,
  Supplier,
  Barang,
  TransaksiMasuk,
  TransaksiKeluar,
  MutasiStok,
  ActivityLog,
  DatabaseQueryLog,
  TableInfo
} from '../types';

export interface DatabaseState {
  version: string;
  lastUpdated: string;
  users: User[];
  kategori: Kategori[];
  satuan: Satuan[];
  supplier: Supplier[];
  barang: Barang[];
  transaksi_masuk: TransaksiMasuk[];
  transaksi_keluar: TransaksiKeluar[];
  mutasi_stok: MutasiStok[];
  activity_logs: ActivityLog[];
}

const STORAGE_KEY = 'ci_inventaris_mysql_db';
const QUERY_LOG_KEY = 'ci_profiler_query_logs';

export const INITIAL_SEED_DATA: DatabaseState = {
  version: '8.0.35-CodeIgniter4',
  lastUpdated: '2026-10-30T06:00:00.000Z',
  users: [
    {
      id: 1,
      username: 'admin',
      nama_lengkap: 'Ahmad Fauzi (Super Administrator)',
      email: 'admin@ci-inventaris.id',
      role: 'admin',
      is_active: true,
      created_at: '2026-01-15 08:30:00',
      last_login: '2026-10-30 07:15:00',
    },
    {
      id: 2,
      username: 'gudang',
      nama_lengkap: 'Budi Santoso (Staff Gudang & Logistik)',
      email: 'budi.gudang@ci-inventaris.id',
      role: 'staff',
      is_active: true,
      created_at: '2026-02-01 09:00:00',
      last_login: '2026-10-29 16:40:00',
    },
    {
      id: 3,
      username: 'manajer',
      nama_lengkap: 'Citra Dewi (Manajer Operasional & Aset)',
      email: 'citra.manajer@ci-inventaris.id',
      role: 'manager',
      is_active: true,
      created_at: '2026-02-10 10:15:00',
      last_login: '2026-10-28 14:20:00',
    },
  ],
  kategori: [
    { id: 1, kode_kategori: 'ELEK', nama_kategori: 'Elektronik & Komputer', deskripsi: 'Peralatan komputasi, gadget, dan aksesoris kantor' },
    { id: 2, kode_kategori: 'ATK', nama_kategori: 'Alat Tulis Kantor', deskripsi: 'Kertas, pena, map, binder, dan perlengkapan administrasi' },
    { id: 3, kode_kategori: 'PRK', nama_kategori: 'Perkakas & Maintenance', deskripsi: 'Alat-alat teknisi, perlengkapan pemeliharaan gedung' },
    { id: 4, kode_kategori: 'BHM', nama_kategori: 'Bahan Kemasan & Logistik', deskripsi: 'Kardus, lakban, bubble wrap, plastik packaging' },
    { id: 5, kode_kategori: 'SPR', nama_kategori: 'Sparepart & Komponen', deskripsi: 'Suku cadang mesin, kabel instalasi, dan komponen elektrik' },
  ],
  satuan: [
    { id: 1, kode_satuan: 'UNIT', nama_satuan: 'Unit' },
    { id: 2, kode_satuan: 'PCS', nama_satuan: 'Pcs (Pieces)' },
    { id: 3, kode_satuan: 'BOX', nama_satuan: 'Box / Kotak' },
    { id: 4, kode_satuan: 'PACK', nama_satuan: 'Pack' },
    { id: 5, kode_satuan: 'RIM', nama_satuan: 'Rim' },
    { id: 6, kode_satuan: 'ROLL', nama_satuan: 'Roll' },
    { id: 7, kode_satuan: 'SET', nama_satuan: 'Set' },
  ],
  supplier: [
    {
      id: 1,
      kode_supplier: 'SUP-001',
      nama_supplier: 'PT Mega Komputindo Mandiri',
      kontak_pic: 'Hendro Prasetyo',
      no_telepon: '0812-3456-7890',
      email: 'sales@megakomputindo.co.id',
      alamat: 'Harco Mangga Dua Blok B2 No. 15, Jakarta Pusat',
    },
    {
      id: 2,
      kode_supplier: 'SUP-002',
      nama_supplier: 'CV Stationery Sukses Bersama',
      kontak_pic: 'Dewi Lestari',
      no_telepon: '0857-9876-5432',
      email: 'order@stationerysukses.id',
      alamat: 'Kawasan Industri Pulogadung No. 45, Jakarta Timur',
    },
    {
      id: 3,
      kode_supplier: 'SUP-003',
      nama_supplier: 'PT Perkakas Presisi Indonesia',
      kontak_pic: 'Agus Wibowo',
      no_telepon: '0821-1122-3344',
      email: 'agus@perkakas-presisi.com',
      alamat: 'Jl. Raden Inten II No. 88, Duren Sawit, Jakarta Timur',
    },
    {
      id: 4,
      kode_supplier: 'SUP-004',
      nama_supplier: 'PT Packindo Logistic Supplies',
      kontak_pic: 'Siti Rahmawati',
      no_telepon: '0813-7788-9900',
      email: 'info@packindosupplies.co.id',
      alamat: 'Jl. Rungkut Industri III No. 12, Surabaya',
    },
  ],
  barang: [
    {
      id: 1,
      kode_barang: 'BRG-001',
      nama_barang: 'Radio RIG Hytera MD788G Digital DMR',
      kategori_id: 1,
      satuan_id: 1,
      stok: 56,
      stok_min: 5,
      harga_beli: 4800000,
      harga_jual: 5600000,
      lokasi_rak: 'Rak A-1 (Lantai 2 - Elektronik)',
      kondisi: 'Baik',
      model: 'MD788G DMR Digital Mobile Radio',
      serial_number: 'SN-HYT-2026-001, SN-HYT-2026-002, SN-HYT-2026-003, SN-HYT-2026-004',
      deskripsi: 'Radio RIG Komunikasi Bergerak Hytera MD788G VHF/UHF DMR Tier II & III GPS',
      barcode: '8991001000018',
      created_at: '2026-03-01 10:00:00',
      updated_at: '2026-10-15 11:30:00',
    },
    {
      id: 2,
      kode_barang: 'BRG-002',
      nama_barang: 'Monitor Dell 24 Inch IPS Full HD (S2421HN)',
      kategori_id: 1,
      satuan_id: 1,
      stok: 12,
      stok_min: 5,
      harga_beli: 1750000,
      harga_jual: 2100000,
      lokasi_rak: 'Rak A-2 (Lantai 2)',
      kondisi: 'Baik',
      model: 'Dell S2421HN IPS Full HD 75Hz',
      serial_number: 'CN-0K711T-72872-91A-001, CN-0K711T-72872-91A-002',
      deskripsi: 'Resolusi 1920x1080, 75Hz, Dual HDMI, AMD FreeSync, Bezel tipis',
      barcode: '8991001000025',
      created_at: '2026-03-05 11:00:00',
      updated_at: '2026-10-10 09:15:00',
    },
    {
      id: 3,
      kode_barang: 'BRG-003',
      nama_barang: 'Mouse Wireless Silent Click Logitech M220',
      kategori_id: 1,
      satuan_id: 2,
      stok: 24,
      stok_min: 10,
      harga_beli: 165000,
      harga_jual: 215000,
      lokasi_rak: 'Rak A-3 (Lantai 2)',
      kondisi: 'Baik',
      deskripsi: 'Koneksi 2.4GHz USB Dongle, Jangkauan 10m, Baterai AA awet 18 bulan',
      barcode: '8991001000032',
      created_at: '2026-03-10 14:00:00',
      updated_at: '2026-10-20 15:45:00',
    },
    {
      id: 4,
      kode_barang: 'BRG-004',
      nama_barang: 'Kertas HVS A4 80gr Sinar Dunia (SiDU)',
      kategori_id: 2,
      satuan_id: 5,
      stok: 4, // Low stock alert! (min 10)
      stok_min: 10,
      harga_beli: 46000,
      harga_jual: 55000,
      lokasi_rak: 'Rak B-1 (Gudang ATK)',
      kondisi: 'Baik',
      deskripsi: 'Kertas HVS putih bersih 80gsm, 500 lembar per rim, ideal fotokopi & cetak laporan',
      barcode: '8991001000049',
      created_at: '2026-03-15 09:30:00',
      updated_at: '2026-10-28 13:20:00',
    },
    {
      id: 5,
      kode_barang: 'BRG-005',
      nama_barang: 'Kertas Continuous Form 3 Ply Wartel NCR',
      kategori_id: 2,
      satuan_id: 3,
      stok: 2, // Critical low stock alert! (min 5)
      stok_min: 5,
      harga_beli: 275000,
      harga_jual: 320000,
      lokasi_rak: 'Rak B-2 (Gudang ATK)',
      kondisi: 'Baik',
      deskripsi: 'Kertas formulir faktur 3 ply (Putih-Merah-Kuning) 9.5 x 11 inch',
      barcode: '8991001000056',
      created_at: '2026-03-20 10:00:00',
      updated_at: '2026-10-25 10:10:00',
    },
    {
      id: 6,
      kode_barang: 'BRG-006',
      nama_barang: 'Tinta Botol Epson 003 Black Original',
      kategori_id: 2,
      satuan_id: 2,
      stok: 16,
      stok_min: 5,
      harga_beli: 82000,
      harga_jual: 98000,
      lokasi_rak: 'Rak B-3 (Gudang ATK)',
      kondisi: 'Baik',
      deskripsi: 'Tinta original Epson L3110, L3150, L1110, L3210 volume 65ml',
      barcode: '8991001000063',
      created_at: '2026-04-01 13:00:00',
      updated_at: '2026-10-18 16:00:00',
    },
    {
      id: 7,
      kode_barang: 'BRG-007',
      nama_barang: 'Mesin Bor Listrik Bosch GSB 550 Impact Drill',
      kategori_id: 3,
      satuan_id: 1,
      stok: 6,
      stok_min: 2,
      harga_beli: 620000,
      harga_jual: 750000,
      lokasi_rak: 'Rak C-1 (Peralatan Teknisi)',
      kondisi: 'Baik',
      deskripsi: 'Daya 550W, kapasitas bor beton 13mm, putaran bolak balik variabel kecepatan',
      barcode: '8991001000070',
      created_at: '2026-04-10 11:30:00',
      updated_at: '2026-10-12 11:00:00',
    },
    {
      id: 8,
      kode_barang: 'BRG-008',
      nama_barang: 'Obeng Set Presisi 32-in-1 Jakemy JM-8101',
      kategori_id: 3,
      satuan_id: 7,
      stok: 14,
      stok_min: 5,
      harga_beli: 75000,
      harga_jual: 95000,
      lokasi_rak: 'Rak C-2 (Peralatan Teknisi)',
      kondisi: 'Baik',
      deskripsi: 'Material Chrome Vanadium Steel, magnetik, box portable serbaguna',
      barcode: '8991001000087',
      created_at: '2026-04-15 15:00:00',
      updated_at: '2026-10-05 14:30:00',
    },
    {
      id: 9,
      kode_barang: 'BRG-009',
      nama_barang: 'Kabel UTP Cat6 Belden Original 305 Meter',
      kategori_id: 5,
      satuan_id: 6,
      stok: 3,
      stok_min: 2,
      harga_beli: 1850000,
      harga_jual: 2150000,
      lokasi_rak: 'Rak D-1 (Komponen & Kabel)',
      kondisi: 'Baik',
      deskripsi: 'Roll 1000ft (305m), speed Gigabit 1000Mbps, tembaga murni 23AWG',
      barcode: '8991001000094',
      created_at: '2026-05-01 10:20:00',
      updated_at: '2026-10-22 09:40:00',
    },
    {
      id: 10,
      kode_barang: 'BRG-010',
      nama_barang: 'Lakban Bening Nachi Tape 48mm x 100M',
      kategori_id: 4,
      satuan_id: 6,
      stok: 48,
      stok_min: 20,
      harga_beli: 11500,
      harga_jual: 14500,
      lokasi_rak: 'Rak E-1 (Kemasan & Logistik)',
      kondisi: 'Baik',
      deskripsi: 'Daya rekat kuat opp tape 45 micron, tidak mudah sobek, isi 72 roll/dus',
      barcode: '8991001000100',
      created_at: '2026-05-10 14:00:00',
      updated_at: '2026-10-24 16:15:00',
    },
    {
      id: 11,
      kode_barang: 'BRG-011',
      nama_barang: 'Kardus Box Corrugated Double Wall Master (50x40x35cm)',
      kategori_id: 4,
      satuan_id: 2,
      stok: 120,
      stok_min: 50,
      harga_beli: 14000,
      harga_jual: 18000,
      lokasi_rak: 'Pallet P-2 (Gudang Bawah)',
      kondisi: 'Baik',
      deskripsi: 'Tebal 7mm K150/M125x3/K150 B/C Flute, menahan beban hingga 30kg',
      barcode: '8991001000117',
      created_at: '2026-05-15 09:00:00',
      updated_at: '2026-10-20 11:20:00',
    },
    {
      id: 12,
      kode_barang: 'BRG-012',
      nama_barang: 'SSD NVMe M.2 512GB Kingston NV2 PCIe 4.0',
      kategori_id: 5,
      satuan_id: 2,
      stok: 9,
      stok_min: 4,
      harga_beli: 520000,
      harga_jual: 620000,
      lokasi_rak: 'Rak D-2 (Komponen)',
      kondisi: 'Baik',
      deskripsi: 'Read up to 3500MB/s, Write up to 2100MB/s, Garansi distributor 3 tahun',
      barcode: '8991001000124',
      created_at: '2026-06-01 11:00:00',
      updated_at: '2026-10-15 13:45:00',
    },
  ],
  transaksi_masuk: [
    {
      id: 1,
      no_faktur: 'IN-202610-001',
      tanggal: '2026-10-05',
      supplier_id: 1,
      barang_id: 1,
      jumlah: 5,
      harga_satuan: 12500000,
      total_harga: 62500000,
      catatan: 'Pengadaan laptop workstation untuk tim engineering batch 1',
      petugas_id: 2,
      created_at: '2026-10-05 10:30:00',
    },
    {
      id: 2,
      no_faktur: 'IN-202610-002',
      tanggal: '2026-10-12',
      supplier_id: 2,
      barang_id: 6,
      jumlah: 10,
      harga_satuan: 82000,
      total_harga: 820000,
      catatan: 'Restok tinta printer divisi operasional kantor',
      petugas_id: 2,
      created_at: '2026-10-12 11:45:00',
    },
    {
      id: 3,
      no_faktur: 'IN-202610-003',
      tanggal: '2026-10-20',
      supplier_id: 4,
      barang_id: 10,
      jumlah: 36,
      harga_satuan: 11500,
      total_harga: 414000,
      catatan: 'Pengadaan lakban packaging akhir bulan',
      petugas_id: 2,
      created_at: '2026-10-20 14:10:00',
    },
  ],
  transaksi_keluar: [
    {
      id: 1,
      no_transaksi: 'OUT-202610-001',
      tanggal: '2026-10-08',
      penerima: 'Riko Gunawan',
      departemen: 'Divisi Pengembangan TI',
      barang_id: 1,
      jumlah: 2,
      model: 'Lenovo ThinkPad L14 Gen 4 (Core i7)',
      serial_number: 'SN-LNVO-99214A, SN-LNVO-99215B',
      keperluan: 'Penyaluran unit laptop untuk onboarding staff baru backend engineer',
      petugas_id: 2,
      created_at: '2026-10-08 14:20:00',
    },
    {
      id: 2,
      no_transaksi: 'OUT-202610-002',
      tanggal: '2026-10-15',
      penerima: 'Rina Marlina',
      departemen: 'Finance & HRD',
      barang_id: 4,
      jumlah: 6,
      model: 'SiDU A4 80gsm Standard Paper',
      serial_number: 'LOT-2026-B812',
      keperluan: 'Pencetakan laporan audit perpajakan tahunan',
      petugas_id: 2,
      created_at: '2026-10-15 09:30:00',
    },
    {
      id: 3,
      no_transaksi: 'OUT-202610-003',
      tanggal: '2026-10-22',
      penerima: 'Doni Pratama',
      departemen: 'Logistik & Pengiriman',
      barang_id: 10,
      jumlah: 12,
      model: 'Daimaru 2 inch x 100m Coklat',
      serial_number: 'BATCH-2026-10X',
      keperluan: 'Operasional packing pesanan konsumen marketplace',
      petugas_id: 2,
      created_at: '2026-10-22 13:15:00',
    },
  ],
  mutasi_stok: [
    {
      id: 1,
      tanggal: '2026-10-05 10:30:00',
      barang_id: 1,
      jenis: 'Masuk',
      jumlah: 5,
      stok_sebelum: 5,
      stok_sesudah: 10,
      referensi: 'IN-202610-001',
      keterangan: 'Penerimaan barang dari PT Mega Komputindo Mandiri',
      petugas_id: 2,
      asal: 'PT Mega Komputindo Mandiri (Pemasok)',
      tujuan: 'Rak A-1 (Gudang Utama)',
    },
    {
      id: 2,
      tanggal: '2026-10-08 14:20:00',
      barang_id: 1,
      jenis: 'Keluar',
      jumlah: 2,
      stok_sebelum: 10,
      stok_sesudah: 8,
      referensi: 'OUT-202610-001',
      keterangan: 'Distribusi ke Divisi TI (Onboarding Staff)',
      petugas_id: 2,
      asal: 'Rak A-1 (Gudang Utama)',
      tujuan: 'Divisi Pengembangan TI (Riko Gunawan)',
    },
    {
      id: 3,
      tanggal: '2026-10-12 11:45:00',
      barang_id: 6,
      jenis: 'Masuk',
      jumlah: 10,
      stok_sebelum: 6,
      stok_sesudah: 16,
      referensi: 'IN-202610-002',
      keterangan: 'Restock tinta printer operasional',
      petugas_id: 2,
      asal: 'CV Sumber Makmur Paper (Pemasok)',
      tujuan: 'Rak B-3 (Gudang ATK)',
    },
    {
      id: 4,
      tanggal: '2026-10-15 09:30:00',
      barang_id: 4,
      jenis: 'Keluar',
      jumlah: 6,
      stok_sebelum: 10,
      stok_sesudah: 4,
      referensi: 'OUT-202610-002',
      keterangan: 'Pengambilan kertas HVS oleh Bagian Finance',
      petugas_id: 2,
      asal: 'Rak B-1 (Gudang ATK)',
      tujuan: 'Finance & Akuntansi (Rina Marlina)',
    },
    {
      id: 5,
      tanggal: '2026-10-20 14:10:00',
      barang_id: 10,
      jenis: 'Masuk',
      jumlah: 36,
      stok_sebelum: 24,
      stok_sesudah: 60,
      referensi: 'IN-202610-003',
      keterangan: 'Penerimaan pengadaan lakban dari PT Packindo',
      petugas_id: 2,
      asal: 'PT Packindo Jaya Sentosa (Pemasok)',
      tujuan: 'Rak D-1 (Area Packing Logistik)',
    },
    {
      id: 6,
      tanggal: '2026-10-22 13:15:00',
      barang_id: 10,
      jenis: 'Keluar',
      jumlah: 12,
      stok_sebelum: 60,
      stok_sesudah: 48,
      referensi: 'OUT-202610-003',
      keterangan: 'Pengeluaran lakban untuk tim packaging',
      petugas_id: 2,
      asal: 'Rak D-1 (Area Packing Logistik)',
      tujuan: 'Operasional & Logistik (Doni Pratama)',
    },
  ],
  activity_logs: [
    {
      id: 1,
      user_id: 1,
      username: 'admin',
      action: 'SYSTEM_INIT',
      module: 'DATABASE',
      detail: 'Inisialisasi skema tabel MySQL dan data awal master inventaris',
      ip_address: '127.0.0.1',
      timestamp: '2026-10-01 08:00:00',
    },
    {
      id: 2,
      user_id: 2,
      username: 'gudang',
      action: 'INSERT_TRANSAKSI_MASUK',
      module: 'TRANSAKSI',
      detail: 'Mencatat faktur masuk IN-202610-001 sebanyak 5 unit Laptop ThinkPad L14',
      ip_address: '192.168.1.42',
      timestamp: '2026-10-05 10:30:15',
    },
    {
      id: 3,
      user_id: 2,
      username: 'gudang',
      action: 'INSERT_TRANSAKSI_KELUAR',
      module: 'TRANSAKSI',
      detail: 'Mencatat pengeluaran OUT-202610-001 untuk Divisi TI (2 unit Laptop)',
      ip_address: '192.168.1.42',
      timestamp: '2026-10-08 14:20:44',
    },
    {
      id: 4,
      user_id: 1,
      username: 'admin',
      action: 'BACKUP_DATABASE',
      module: 'DATABASE',
      detail: 'Ekspor database dump MySQL (backup_db_ci_inventaris_20261015.sql)',
      ip_address: '127.0.0.1',
      timestamp: '2026-10-15 17:00:00',
    },
  ],
};

// Database schema specifications
export const TABLE_DEFINITIONS: TableInfo[] = [
  {
    name: 'tbl_users',
    columns: [
      { name: 'id', type: 'INT(11)', key: 'PRI', extra: 'auto_increment' },
      { name: 'username', type: 'VARCHAR(50)', key: 'UNI' },
      { name: 'nama_lengkap', type: 'VARCHAR(100)' },
      { name: 'email', type: 'VARCHAR(100)', key: 'UNI' },
      { name: 'role', type: "ENUM('admin','staff','manager')" },
      { name: 'is_active', type: 'TINYINT(1)' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'last_login', type: 'DATETIME' },
    ],
    rowCount: 3,
  },
  {
    name: 'tbl_kategori',
    columns: [
      { name: 'id', type: 'INT(11)', key: 'PRI', extra: 'auto_increment' },
      { name: 'kode_kategori', type: 'VARCHAR(10)', key: 'UNI' },
      { name: 'nama_kategori', type: 'VARCHAR(100)' },
      { name: 'deskripsi', type: 'TEXT' },
    ],
    rowCount: 5,
  },
  {
    name: 'tbl_satuan',
    columns: [
      { name: 'id', type: 'INT(11)', key: 'PRI', extra: 'auto_increment' },
      { name: 'kode_satuan', type: 'VARCHAR(10)', key: 'UNI' },
      { name: 'nama_satuan', type: 'VARCHAR(50)' },
    ],
    rowCount: 7,
  },
  {
    name: 'tbl_supplier',
    columns: [
      { name: 'id', type: 'INT(11)', key: 'PRI', extra: 'auto_increment' },
      { name: 'kode_supplier', type: 'VARCHAR(20)', key: 'UNI' },
      { name: 'nama_supplier', type: 'VARCHAR(150)' },
      { name: 'kontak_pic', type: 'VARCHAR(100)' },
      { name: 'no_telepon', type: 'VARCHAR(25)' },
      { name: 'email', type: 'VARCHAR(100)' },
      { name: 'alamat', type: 'TEXT' },
    ],
    rowCount: 4,
  },
  {
    name: 'tbl_barang',
    columns: [
      { name: 'id', type: 'INT(11)', key: 'PRI', extra: 'auto_increment' },
      { name: 'kode_barang', type: 'VARCHAR(25)', key: 'UNI' },
      { name: 'nama_barang', type: 'VARCHAR(200)' },
      { name: 'kategori_id', type: 'INT(11)', key: 'MUL' },
      { name: 'satuan_id', type: 'INT(11)', key: 'MUL' },
      { name: 'stok', type: 'INT(11)' },
      { name: 'stok_min', type: 'INT(11)' },
      { name: 'harga_beli', type: 'DECIMAL(15,2)' },
      { name: 'harga_jual', type: 'DECIMAL(15,2)' },
      { name: 'lokasi_rak', type: 'VARCHAR(100)' },
      { name: 'kondisi', type: "ENUM('Baik','Perbaikan','Rusak')" },
      { name: 'deskripsi', type: 'TEXT' },
      { name: 'barcode', type: 'VARCHAR(50)' },
      { name: 'model', type: 'VARCHAR(100)' },
      { name: 'serial_number', type: 'VARCHAR(255)' },
      { name: 'foto', type: 'LONGTEXT' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' },
    ],
    rowCount: 12,
  },
  {
    name: 'tbl_transaksi_masuk',
    columns: [
      { name: 'id', type: 'INT(11)', key: 'PRI', extra: 'auto_increment' },
      { name: 'no_faktur', type: 'VARCHAR(50)', key: 'UNI' },
      { name: 'tanggal', type: 'DATE' },
      { name: 'supplier_id', type: 'INT(11)', key: 'MUL' },
      { name: 'barang_id', type: 'INT(11)', key: 'MUL' },
      { name: 'jumlah', type: 'INT(11)' },
      { name: 'harga_satuan', type: 'DECIMAL(15,2)' },
      { name: 'total_harga', type: 'DECIMAL(15,2)' },
      { name: 'catatan', type: 'TEXT' },
      { name: 'petugas_id', type: 'INT(11)' },
      { name: 'foto_nota', type: 'LONGTEXT' },
      { name: 'created_at', type: 'DATETIME' },
    ],
    rowCount: 3,
  },
  {
    name: 'tbl_transaksi_keluar',
    columns: [
      { name: 'id', type: 'INT(11)', key: 'PRI', extra: 'auto_increment' },
      { name: 'no_transaksi', type: 'VARCHAR(50)', key: 'UNI' },
      { name: 'tanggal', type: 'DATE' },
      { name: 'penerima', type: 'VARCHAR(100)' },
      { name: 'departemen', type: 'VARCHAR(100)' },
      { name: 'barang_id', type: 'INT(11)', key: 'MUL' },
      { name: 'jumlah', type: 'INT(11)' },
      { name: 'model', type: 'VARCHAR(100)' },
      { name: 'serial_number', type: 'VARCHAR(100)' },
      { name: 'keperluan', type: 'TEXT' },
      { name: 'petugas_id', type: 'INT(11)' },
      { name: 'foto_bukti', type: 'LONGTEXT' },
      { name: 'created_at', type: 'DATETIME' },
    ],
    rowCount: 3,
  },
  {
    name: 'tbl_mutasi_stok',
    columns: [
      { name: 'id', type: 'INT(11)', key: 'PRI', extra: 'auto_increment' },
      { name: 'tanggal', type: 'DATETIME' },
      { name: 'barang_id', type: 'INT(11)', key: 'MUL' },
      { name: 'jenis', type: "ENUM('Masuk','Keluar','Penyesuaian','Reset','Transfer')" },
      { name: 'jumlah', type: 'INT(11)' },
      { name: 'stok_sebelum', type: 'INT(11)' },
      { name: 'stok_sesudah', type: 'INT(11)' },
      { name: 'referensi', type: 'VARCHAR(50)' },
      { name: 'keterangan', type: 'VARCHAR(255)' },
      { name: 'petugas_id', type: 'INT(11)' },
      { name: 'asal', type: 'VARCHAR(150)' },
      { name: 'tujuan', type: 'VARCHAR(150)' },
    ],
    rowCount: 6,
  },
  {
    name: 'tbl_activity_logs',
    columns: [
      { name: 'id', type: 'INT(11)', key: 'PRI', extra: 'auto_increment' },
      { name: 'user_id', type: 'INT(11)' },
      { name: 'username', type: 'VARCHAR(50)' },
      { name: 'action', type: 'VARCHAR(50)' },
      { name: 'module', type: 'VARCHAR(50)' },
      { name: 'detail', type: 'TEXT' },
      { name: 'ip_address', type: 'VARCHAR(45)' },
      { name: 'timestamp', type: 'DATETIME' },
    ],
    rowCount: 4,
  },
];

class MySQLEngine {
  private state: DatabaseState;
  private queryLogs: DatabaseQueryLog[] = [];

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.barang && Array.isArray(parsed.barang)) {
          parsed.barang = parsed.barang.map((b: any) => {
            const seedMatch = INITIAL_SEED_DATA.barang.find(
              (sb) => sb.id === b.id || sb.kode_barang === b.kode_barang
            );
            return {
              ...b,
              model: b.model !== undefined && b.model !== '' ? b.model : (seedMatch?.model || ''),
              serial_number:
                b.serial_number !== undefined && b.serial_number !== ''
                  ? b.serial_number
                  : (seedMatch?.serial_number || ''),
            };
          });
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  }

  public saveToStorage(): void {
    try {
      this.state.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public setState(newState: DatabaseState): void {
    this.state = newState;
    this.saveToStorage();
  }

  public logQuery(sql: string, durationMs: number, affectedRows: number = 0, status: 'SUCCESS' | 'ERROR' = 'SUCCESS'): void {
    const log: DatabaseQueryLog = {
      id: Math.random().toString(36).substring(2, 9),
      sql,
      duration_ms: Math.round(durationMs * 100) / 100,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      affected_rows: affectedRows,
      status,
    };
    this.queryLogs.unshift(log);
    if (this.queryLogs.length > 50) {
      this.queryLogs.pop();
    }
  }

  public getQueryLogs(): DatabaseQueryLog[] {
    return this.queryLogs;
  }

  public clearQueryLogs(): void {
    this.queryLogs = [];
  }

  /**
   * Generates a standard MySQL .sql dump file format compatible with MySQL 8.0 & phpMyAdmin
   */
  public generateSQLDump(): string {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let sql = `-- ===================================================================\n`;
    sql += `-- CodeIgniter 4 Web Inventory System - MySQL Database Dump\n`;
    sql += `-- Host: 127.0.0.1    Database: db_ci_inventaris\n`;
    sql += `-- Server version: MySQL 8.0.35-CodeIgniter4-Storage\n`;
    sql += `-- Generated at: ${timestamp}\n`;
    sql += `-- ===================================================================\n\n`;

    sql += `SET FOREIGN_KEY_CHECKS=0;\n`;
    sql += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
    sql += `START TRANSACTION;\n`;
    sql += `SET time_zone = "+07:00";\n\n`;

    // Dump users
    sql += this.tableToSQL('tbl_users', this.state.users, [
      'id INT(11) AUTO_INCREMENT PRIMARY KEY',
      'username VARCHAR(50) NOT NULL UNIQUE',
      'nama_lengkap VARCHAR(100) NOT NULL',
      'email VARCHAR(100) NOT NULL UNIQUE',
      "role ENUM('admin','staff','manager') NOT NULL DEFAULT 'staff'",
      'is_active TINYINT(1) NOT NULL DEFAULT 1',
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
      'last_login DATETIME NULL',
    ]);

    // Dump kategori
    sql += this.tableToSQL('tbl_kategori', this.state.kategori, [
      'id INT(11) AUTO_INCREMENT PRIMARY KEY',
      'kode_kategori VARCHAR(10) NOT NULL UNIQUE',
      'nama_kategori VARCHAR(100) NOT NULL',
      'deskripsi TEXT NULL',
    ]);

    // Dump satuan
    sql += this.tableToSQL('tbl_satuan', this.state.satuan, [
      'id INT(11) AUTO_INCREMENT PRIMARY KEY',
      'kode_satuan VARCHAR(10) NOT NULL UNIQUE',
      'nama_satuan VARCHAR(50) NOT NULL',
    ]);

    // Dump supplier
    sql += this.tableToSQL('tbl_supplier', this.state.supplier, [
      'id INT(11) AUTO_INCREMENT PRIMARY KEY',
      'kode_supplier VARCHAR(20) NOT NULL UNIQUE',
      'nama_supplier VARCHAR(150) NOT NULL',
      'kontak_pic VARCHAR(100) NULL',
      'no_telepon VARCHAR(25) NULL',
      'email VARCHAR(100) NULL',
      'alamat TEXT NULL',
    ]);

    // Dump barang
    sql += this.tableToSQL('tbl_barang', this.state.barang, [
      'id INT(11) AUTO_INCREMENT PRIMARY KEY',
      'kode_barang VARCHAR(25) NOT NULL UNIQUE',
      'nama_barang VARCHAR(200) NOT NULL',
      'kategori_id INT(11) NOT NULL',
      'satuan_id INT(11) NOT NULL',
      'stok INT(11) NOT NULL DEFAULT 0',
      'stok_min INT(11) NOT NULL DEFAULT 5',
      'harga_beli DECIMAL(15,2) NOT NULL DEFAULT 0.00',
      'harga_jual DECIMAL(15,2) NOT NULL DEFAULT 0.00',
      'lokasi_rak VARCHAR(100) NULL',
      "kondisi ENUM('Baik','Perbaikan','Rusak') NOT NULL DEFAULT 'Baik'",
      'deskripsi TEXT NULL',
      'barcode VARCHAR(50) NULL',
      'model VARCHAR(100) NULL',
      'serial_number VARCHAR(255) NULL',
      'foto LONGTEXT NULL',
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
      'updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    ]);

    // Dump transaksi masuk
    sql += this.tableToSQL('tbl_transaksi_masuk', this.state.transaksi_masuk, [
      'id INT(11) AUTO_INCREMENT PRIMARY KEY',
      'no_faktur VARCHAR(50) NOT NULL UNIQUE',
      'tanggal DATE NOT NULL',
      'supplier_id INT(11) NOT NULL',
      'barang_id INT(11) NOT NULL',
      'jumlah INT(11) NOT NULL',
      'harga_satuan DECIMAL(15,2) NOT NULL',
      'total_harga DECIMAL(15,2) NOT NULL',
      'catatan TEXT NULL',
      'petugas_id INT(11) NOT NULL',
      'foto_nota LONGTEXT NULL',
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
    ]);

    // Dump transaksi keluar
    sql += this.tableToSQL('tbl_transaksi_keluar', this.state.transaksi_keluar, [
      'id INT(11) AUTO_INCREMENT PRIMARY KEY',
      'no_transaksi VARCHAR(50) NOT NULL UNIQUE',
      'tanggal DATE NOT NULL',
      'penerima VARCHAR(100) NOT NULL',
      'departemen VARCHAR(100) NOT NULL',
      'barang_id INT(11) NOT NULL',
      'jumlah INT(11) NOT NULL',
      'model VARCHAR(100) NULL',
      'serial_number VARCHAR(100) NULL',
      'keperluan TEXT NULL',
      'petugas_id INT(11) NOT NULL',
      'foto_bukti LONGTEXT NULL',
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP',
    ]);

    // Dump mutasi stok
    sql += this.tableToSQL('tbl_mutasi_stok', this.state.mutasi_stok, [
      'id INT(11) AUTO_INCREMENT PRIMARY KEY',
      'tanggal DATETIME NOT NULL',
      'barang_id INT(11) NOT NULL',
      "jenis ENUM('Masuk','Keluar','Penyesuaian','Reset','Transfer') NOT NULL",
      'jumlah INT(11) NOT NULL',
      'stok_sebelum INT(11) NOT NULL',
      'stok_sesudah INT(11) NOT NULL',
      'referensi VARCHAR(50) NOT NULL',
      'keterangan VARCHAR(255) NULL',
      'petugas_id INT(11) NOT NULL',
      'asal VARCHAR(150) NULL',
      'tujuan VARCHAR(150) NULL',
    ]);

    // Dump activity logs
    sql += this.tableToSQL('tbl_activity_logs', this.state.activity_logs, [
      'id INT(11) AUTO_INCREMENT PRIMARY KEY',
      'user_id INT(11) NOT NULL',
      'username VARCHAR(50) NOT NULL',
      'action VARCHAR(50) NOT NULL',
      'module VARCHAR(50) NOT NULL',
      'detail TEXT NULL',
      'ip_address VARCHAR(45) NOT NULL',
      'timestamp DATETIME DEFAULT CURRENT_TIMESTAMP',
    ]);

    sql += `SET FOREIGN_KEY_CHECKS=1;\n`;
    sql += `COMMIT;\n`;
    sql += `-- Dump completed on ${timestamp}\n`;

    return sql;
  }

  private tableToSQL(tableName: string, data: any[], colDefs: string[]): string {
    let out = `-- --------------------------------------------------------\n`;
    out += `-- Struktur dari tabel \`${tableName}\`\n`;
    out += `-- --------------------------------------------------------\n\n`;
    out += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    out += `CREATE TABLE \`${tableName}\` (\n`;
    out += colDefs.map((def) => `  ${def}`).join(',\n');
    out += `\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    if (data.length > 0) {
      out += `-- Dumping data untuk tabel \`${tableName}\`\n`;
      const cols = Object.keys(data[0]);
      out += `INSERT INTO \`${tableName}\` (\`${cols.join('`, `')}\`) VALUES\n`;
      const rows = data.map((row) => {
        const values = cols.map((c) => {
          const val = row[c];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'boolean') return val ? 1 : 0;
          return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
        });
        return `(${values.join(', ')})`;
      });
      out += rows.join(',\n') + ';\n\n';
    }

    return out;
  }

  /**
   * Resets database to pristine initial seed state or completely blank state
   */
  public resetDatabase(toDefaultSeed: boolean = true, currentUser?: User): void {
    const t0 = performance.now();
    if (toDefaultSeed) {
      this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    } else {
      this.state = {
        version: '8.0.35-CodeIgniter4',
        lastUpdated: new Date().toISOString(),
        users: currentUser ? [currentUser] : JSON.parse(JSON.stringify(INITIAL_SEED_DATA.users)),
        kategori: [],
        satuan: [],
        supplier: [],
        barang: [],
        transaksi_masuk: [],
        transaksi_keluar: [],
        mutasi_stok: [],
        activity_logs: [
          {
            id: 1,
            user_id: currentUser ? currentUser.id : 1,
            username: currentUser ? currentUser.username : 'admin',
            action: 'RESET_DATABASE_CLEAN',
            module: 'DATABASE',
            detail: 'Database MySQL direset ke kondisi bersih (kosong)',
            ip_address: '127.0.0.1',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          },
        ],
      };
    }
    this.saveToStorage();
    const duration = performance.now() - t0;
    this.logQuery(`CALL sp_reset_database('${toDefaultSeed ? 'DEFAULT_SEED' : 'BLANK'}')`, duration, 1);
  }

  /**
   * Restores database from a SQL string dump or JSON backup
   */
  /**
   * Restores database from a SQL string dump or JSON backup with full multi-line,
   * escaped string, and parenthesis tolerance
   */
  public restoreFromContent(content: string, currentUser?: User): { success: boolean; message: string; stats?: any } {
    const t0 = performance.now();
    try {
      if (!content || !content.trim()) {
        return { success: false, message: 'File atau skrip cadangan kosong!' };
      }

      // Remove BOM if present
      let cleanContent = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
      cleanContent = cleanContent.trim();

      // 1. ATTEMPT JSON RESTORE
      if ((cleanContent.startsWith('{') && cleanContent.endsWith('}')) || (cleanContent.startsWith('[') && cleanContent.endsWith(']'))) {
        try {
          const parsed = JSON.parse(cleanContent);
          const stateData = parsed.state || parsed.data || parsed;

          // Check if it contains at least one recognized table array
          const candidateBarang = stateData.barang || stateData.tbl_barang;
          const candidateKategori = stateData.kategori || stateData.tbl_kategori;

          if (Array.isArray(candidateBarang) || Array.isArray(candidateKategori)) {
            if (Array.isArray(stateData.users || stateData.tbl_users)) {
              this.state.users = stateData.users || stateData.tbl_users;
            }
            if (Array.isArray(candidateKategori)) {
              this.state.kategori = candidateKategori;
            }
            if (Array.isArray(stateData.satuan || stateData.tbl_satuan)) {
              this.state.satuan = stateData.satuan || stateData.tbl_satuan;
            }
            if (Array.isArray(stateData.supplier || stateData.tbl_supplier)) {
              this.state.supplier = stateData.supplier || stateData.tbl_supplier;
            }
            if (Array.isArray(candidateBarang)) {
              this.state.barang = candidateBarang.map((b: any) => ({
                ...b,
                id: Number(b.id) || 1,
                stok: Number(b.stok) || 0,
                stok_min: Number(b.stok_min) || 5,
                harga_beli: Number(b.harga_beli) || 0,
                harga_jual: Number(b.harga_jual) || 0,
                model: b.model || '',
                serial_number: b.serial_number || '',
              }));
            }
            if (Array.isArray(stateData.transaksi_masuk || stateData.tbl_transaksi_masuk)) {
              this.state.transaksi_masuk = stateData.transaksi_masuk || stateData.tbl_transaksi_masuk;
            }
            if (Array.isArray(stateData.transaksi_keluar || stateData.tbl_transaksi_keluar)) {
              this.state.transaksi_keluar = stateData.transaksi_keluar || stateData.tbl_transaksi_keluar;
            }
            if (Array.isArray(stateData.mutasi_stok || stateData.tbl_mutasi_stok)) {
              this.state.mutasi_stok = stateData.mutasi_stok || stateData.tbl_mutasi_stok;
            }

            this.state.activity_logs.unshift({
              id: Date.now(),
              user_id: currentUser ? currentUser.id : 1,
              username: currentUser ? currentUser.username : 'admin',
              action: 'RESTORE_DATABASE_JSON',
              module: 'DATABASE',
              detail: `Database berhasil dipulihkan dari cadangan JSON (${this.state.barang.length} barang, ${this.state.kategori.length} kategori)`,
              ip_address: '127.0.0.1',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            });

            this.saveToStorage();
            const duration = performance.now() - t0;
            this.logQuery(`RESTORE DATABASE FROM JSON DUMP`, duration, this.state.barang.length);

            return {
              success: true,
              message: `Database berhasil dipulihkan dari cadangan JSON! (${this.state.barang.length} barang, ${this.state.kategori.length} kategori, ${this.state.transaksi_keluar.length} transaksi keluar dimuat)`,
              stats: {
                barang: this.state.barang.length,
                kategori: this.state.kategori.length,
                transaksi: this.state.transaksi_masuk.length + this.state.transaksi_keluar.length,
              },
            };
          }
        } catch {
          // If JSON parse fails, fall through to SQL parsing
        }
      }

      // 2. ATTEMPT ROBUST SQL DUMP RESTORE
      const tableMap: { [key: string]: string } = {
        tbl_users: 'users',
        users: 'users',
        tbl_kategori: 'kategori',
        kategori: 'kategori',
        tbl_satuan: 'satuan',
        satuan: 'satuan',
        tbl_supplier: 'supplier',
        supplier: 'supplier',
        tbl_barang: 'barang',
        barang: 'barang',
        tbl_transaksi_masuk: 'transaksi_masuk',
        transaksi_masuk: 'transaksi_masuk',
        tbl_transaksi_keluar: 'transaksi_keluar',
        transaksi_keluar: 'transaksi_keluar',
        tbl_mutasi_stok: 'mutasi_stok',
        mutasi_stok: 'mutasi_stok',
        tbl_activity_logs: 'activity_logs',
        activity_logs: 'activity_logs',
      };

      const extractedTables: { [stateKey: string]: any[] } = {
        users: [],
        kategori: [],
        satuan: [],
        supplier: [],
        barang: [],
        transaksi_masuk: [],
        transaksi_keluar: [],
        mutasi_stok: [],
        activity_logs: [],
      };

      // Table default columns ordered for dumps without explicit column lists
      const defaultCols: { [key: string]: string[] } = {
        users: ['id', 'username', 'nama_lengkap', 'email', 'role', 'is_active', 'created_at', 'last_login'],
        kategori: ['id', 'kode_kategori', 'nama_kategori', 'deskripsi'],
        satuan: ['id', 'kode_satuan', 'nama_satuan'],
        supplier: ['id', 'kode_supplier', 'nama_supplier', 'kontak_pic', 'no_telepon', 'email', 'alamat'],
        barang: ['id', 'kode_barang', 'nama_barang', 'kategori_id', 'satuan_id', 'stok', 'stok_min', 'harga_beli', 'harga_jual', 'lokasi_rak', 'kondisi', 'deskripsi', 'barcode', 'model', 'serial_number', 'foto', 'created_at', 'updated_at'],
        transaksi_masuk: ['id', 'no_faktur', 'tanggal', 'supplier_id', 'barang_id', 'jumlah', 'harga_satuan', 'total_harga', 'catatan', 'petugas_id', 'foto_nota', 'created_at'],
        transaksi_keluar: ['id', 'no_transaksi', 'tanggal', 'penerima', 'departemen', 'barang_id', 'jumlah', 'model', 'serial_number', 'keperluan', 'petugas_id', 'foto_bukti', 'created_at'],
        mutasi_stok: ['id', 'tanggal', 'barang_id', 'jenis', 'jumlah', 'stok_sebelum', 'stok_sesudah', 'referensi', 'keterangan', 'petugas_id', 'asal', 'tujuan'],
        activity_logs: ['id', 'user_id', 'username', 'action', 'module', 'detail', 'ip_address', 'timestamp'],
      };

      // Strip SQL line comments (-- or #) and multiline comments (/* ... */) while preserving strings
      const cleanedSql = this.stripSQLComments(cleanContent);

      // Find all INSERT INTO statements using regex to locate start, then tokenizing VALUES tuples
      const insertRegex = /INSERT\s+INTO\s+(?:`?[\w-]+`?\.)?`?([\w-]+)`?\s*(?:\(([^)]+)\))?\s*VALUES\s*/gi;
      let match: RegExpExecArray | null;

      while ((match = insertRegex.exec(cleanedSql)) !== null) {
        const rawTableName = match[1].toLowerCase();
        const stateKey = tableMap[rawTableName];
        if (!stateKey) continue;

        let colNames: string[] = [];
        if (match[2]) {
          colNames = match[2]
            .split(',')
            .map((c) => c.trim().replace(/[`"']/g, ''));
        } else {
          colNames = defaultCols[stateKey] || [];
        }

        // Start scanning tuples right after match.index + match[0].length
        let idx = match.index + match[0].length;
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let inTuple = false;
        let tupleChars = '';

        while (idx < cleanedSql.length) {
          const ch = cleanedSql[idx];
          const prev = idx > 0 ? cleanedSql[idx - 1] : '';

          if (ch === "'" && !inDoubleQuote && prev !== '\\') {
            inSingleQuote = !inSingleQuote;
            if (inTuple) tupleChars += ch;
          } else if (ch === '"' && !inSingleQuote && prev !== '\\') {
            inDoubleQuote = !inDoubleQuote;
            if (inTuple) tupleChars += ch;
          } else if (!inSingleQuote && !inDoubleQuote) {
            if (ch === '(' && !inTuple) {
              inTuple = true;
              tupleChars = '';
            } else if (ch === ')' && inTuple) {
              inTuple = false;
              // Parse tuple content
              const rawVals = this.parseTupleValues(tupleChars);
              if (rawVals.length > 0) {
                const rowObj: any = {};
                // If colNames length doesn't match rawVals length, map by position or defaultCols
                const effectiveCols = colNames.length === rawVals.length ? colNames : (defaultCols[stateKey] || colNames);

                effectiveCols.forEach((col, cIdx) => {
                  if (cIdx < rawVals.length) {
                    rowObj[col] = rawVals[cIdx];
                  }
                });

                // Post-process type conversions for known numeric fields
                if (rowObj.id !== undefined) rowObj.id = Number(rowObj.id) || Date.now();
                if (rowObj.stok !== undefined) rowObj.stok = Number(rowObj.stok) || 0;
                if (rowObj.stok_min !== undefined) rowObj.stok_min = Number(rowObj.stok_min) || 5;
                if (rowObj.harga_beli !== undefined) rowObj.harga_beli = Number(rowObj.harga_beli) || 0;
                if (rowObj.harga_jual !== undefined) rowObj.harga_jual = Number(rowObj.harga_jual) || 0;
                if (rowObj.jumlah !== undefined) rowObj.jumlah = Number(rowObj.jumlah) || 1;
                if (rowObj.kategori_id !== undefined) rowObj.kategori_id = Number(rowObj.kategori_id) || 1;
                if (rowObj.satuan_id !== undefined) rowObj.satuan_id = Number(rowObj.satuan_id) || 1;
                if (rowObj.supplier_id !== undefined) rowObj.supplier_id = Number(rowObj.supplier_id) || 1;
                if (rowObj.barang_id !== undefined) rowObj.barang_id = Number(rowObj.barang_id) || 1;
                if (rowObj.petugas_id !== undefined) rowObj.petugas_id = Number(rowObj.petugas_id) || 1;

                extractedTables[stateKey].push(rowObj);
              }
            } else if (inTuple) {
              tupleChars += ch;
            } else if (ch === ';') {
              // End of this INSERT statement
              break;
            }
          } else if (inTuple) {
            tupleChars += ch;
          }

          idx++;
        }
      }

      // Check if any tables were extracted
      const totalExtracted =
        extractedTables.barang.length +
        extractedTables.kategori.length +
        extractedTables.satuan.length +
        extractedTables.supplier.length +
        extractedTables.transaksi_keluar.length;

      if (totalExtracted > 0) {
        if (extractedTables.users.length > 0) this.state.users = extractedTables.users;
        if (extractedTables.kategori.length > 0) this.state.kategori = extractedTables.kategori;
        if (extractedTables.satuan.length > 0) this.state.satuan = extractedTables.satuan;
        if (extractedTables.supplier.length > 0) this.state.supplier = extractedTables.supplier;
        if (extractedTables.barang.length > 0) this.state.barang = extractedTables.barang;
        if (extractedTables.transaksi_masuk.length > 0) this.state.transaksi_masuk = extractedTables.transaksi_masuk;
        if (extractedTables.transaksi_keluar.length > 0) this.state.transaksi_keluar = extractedTables.transaksi_keluar;
        if (extractedTables.mutasi_stok.length > 0) this.state.mutasi_stok = extractedTables.mutasi_stok;

        this.state.activity_logs.unshift({
          id: Date.now(),
          user_id: currentUser ? currentUser.id : 1,
          username: currentUser ? currentUser.username : 'admin',
          action: 'RESTORE_DATABASE_SQL',
          module: 'DATABASE',
          detail: `Database berhasil dipulihkan dari skrip SQL (${extractedTables.barang.length} barang, ${extractedTables.kategori.length} kategori, ${extractedTables.transaksi_keluar.length} transaksi keluar)`,
          ip_address: '127.0.0.1',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        });

        this.saveToStorage();
        const duration = performance.now() - t0;
        this.logQuery(`SOURCE backup_restore.sql; -- Executed restore`, duration, extractedTables.barang.length);

        return {
          success: true,
          message: `Database MySQL berhasil dipulihkan! Dimuat: ${extractedTables.barang.length} barang, ${extractedTables.kategori.length} kategori, ${extractedTables.transaksi_keluar.length} transaksi keluar.`,
          stats: {
            barang: extractedTables.barang.length,
            kategori: extractedTables.kategori.length,
            supplier: extractedTables.supplier.length,
            transaksi_keluar: extractedTables.transaksi_keluar.length,
          },
        };
      }

      return {
        success: false,
        message: 'Format SQL atau data tidak dikenali. Pastikan file berisi pernyataan INSERT INTO tabel inventaris (tbl_barang, tbl_kategori, dsb).',
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal memproses file cadangan: ' + (err.message || 'Error tidak diketahui'),
      };
    }
  }

  /**
   * Helper to strip comments from SQL while strictly respecting quotes
   */
  private stripSQLComments(sql: string): string {
    let out = '';
    let inSingle = false;
    let inDouble = false;
    let i = 0;

    while (i < sql.length) {
      const ch = sql[i];
      const next = i + 1 < sql.length ? sql[i + 1] : '';
      const prev = i > 0 ? sql[i - 1] : '';

      if (ch === "'" && !inDouble && prev !== '\\') {
        inSingle = !inSingle;
        out += ch;
        i++;
      } else if (ch === '"' && !inSingle && prev !== '\\') {
        inDouble = !inDouble;
        out += ch;
        i++;
      } else if (!inSingle && !inDouble) {
        // Line comment: -- or #
        if ((ch === '-' && next === '-') || ch === '#') {
          // skip to newline
          while (i < sql.length && sql[i] !== '\n') {
            i++;
          }
        } else if (ch === '/' && next === '*') {
          // Block comment /* ... */
          i += 2;
          while (i < sql.length - 1 && !(sql[i] === '*' && sql[i + 1] === '/')) {
            i++;
          }
          i += 2;
        } else {
          out += ch;
          i++;
        }
      } else {
        out += ch;
        i++;
      }
    }

    return out;
  }

  /**
   * Parses comma-separated values inside a single SQL tuple (v1, v2, v3)
   * cleanly handling escaped quotes, NULL, numbers, and strings with parentheses/commas
   */
  private parseTupleValues(tupleContent: string): any[] {
    const values: any[] = [];
    let current = '';
    let inSingle = false;
    let inDouble = false;
    let i = 0;

    while (i < tupleContent.length) {
      const ch = tupleContent[i];
      const next = i + 1 < tupleContent.length ? tupleContent[i + 1] : '';
      const prev = i > 0 ? tupleContent[i - 1] : '';

      if (ch === "'" && !inDouble && prev !== '\\') {
        // Check for double single quotes '' representing an escaped quote in standard SQL
        if (inSingle && next === "'") {
          current += "'";
          i += 2;
          continue;
        }
        inSingle = !inSingle;
        current += ch;
        i++;
      } else if (ch === '"' && !inSingle && prev !== '\\') {
        inDouble = !inDouble;
        current += ch;
        i++;
      } else if (ch === ',' && !inSingle && !inDouble) {
        values.push(this.formatSQLValue(current.trim()));
        current = '';
        i++;
      } else {
        current += ch;
        i++;
      }
    }

    if (current.trim().length > 0) {
      values.push(this.formatSQLValue(current.trim()));
    }

    return values;
  }

  /**
   * Formats a raw token into JavaScript string, number, boolean, or null
   */
  private formatSQLValue(raw: string): any {
    if (!raw || raw.toUpperCase() === 'NULL') {
      return null;
    }

    // Single quoted string
    if (raw.startsWith("'") && raw.endsWith("'") && raw.length >= 2) {
      const inner = raw.slice(1, -1);
      return inner
        .replace(/\\'/g, "'")
        .replace(/''/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r');
    }

    // Double quoted string
    if (raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2) {
      const inner = raw.slice(1, -1);
      return inner.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    // Numeric
    if (!isNaN(Number(raw))) {
      return Number(raw);
    }

    // Boolean
    if (raw.toUpperCase() === 'TRUE') return 1;
    if (raw.toUpperCase() === 'FALSE') return 0;

    return raw;
  }

  /**
   * Executes interactive SQL queries (SELECT, SHOW TABLES, DESCRIBE, etc.) for the DB Console
   */
  public executeQuery(rawSql: string): {
    success: boolean;
    columns: string[];
    rows: any[];
    executionTimeMs: number;
    affectedRows?: number;
    message?: string;
  } {
    const t0 = performance.now();
    const cleanSql = rawSql.trim().replace(/;+$/, '');
    const upper = cleanSql.toUpperCase();

    try {
      if (upper === 'SHOW TABLES' || upper.startsWith('SHOW TABLES')) {
        const rows = TABLE_DEFINITIONS.map((t) => ({
          Tables_in_db_ci_inventaris: t.name,
          Table_Type: 'BASE TABLE',
          Row_Count: this.getTableRowCount(t.name),
        }));
        const duration = performance.now() - t0;
        this.logQuery(rawSql, duration, rows.length);
        return {
          success: true,
          columns: ['Tables_in_db_ci_inventaris', 'Table_Type', 'Row_Count'],
          rows,
          executionTimeMs: Math.round(duration * 100) / 100,
        };
      }

      if (upper.startsWith('DESCRIBE ') || upper.startsWith('DESC ')) {
        const parts = cleanSql.split(/\s+/);
        const tblName = parts[1]?.replace(/[`']/g, '');
        const tableDef = TABLE_DEFINITIONS.find((t) => t.name.toLowerCase() === tblName?.toLowerCase());
        if (!tableDef) {
          throw new Error(`Table 'db_ci_inventaris.${tblName}' doesn't exist`);
        }
        const rows = tableDef.columns.map((c) => ({
          Field: c.name,
          Type: c.type,
          Null: c.key === 'PRI' ? 'NO' : 'YES',
          Key: c.key || '',
          Default: c.key === 'PRI' ? 'NULL' : '',
          Extra: c.extra || '',
        }));
        const duration = performance.now() - t0;
        this.logQuery(rawSql, duration, rows.length);
        return {
          success: true,
          columns: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'],
          rows,
          executionTimeMs: Math.round(duration * 100) / 100,
        };
      }

      if (upper.startsWith('SELECT')) {
        // Match table
        let targetTable = '';
        if (upper.includes('FROM TBL_BARANG')) targetTable = 'tbl_barang';
        else if (upper.includes('FROM TBL_KATEGORI')) targetTable = 'tbl_kategori';
        else if (upper.includes('FROM TBL_SATUAN')) targetTable = 'tbl_satuan';
        else if (upper.includes('FROM TBL_SUPPLIER')) targetTable = 'tbl_supplier';
        else if (upper.includes('FROM TBL_USERS')) targetTable = 'tbl_users';
        else if (upper.includes('FROM TBL_TRANSAKSI_MASUK')) targetTable = 'tbl_transaksi_masuk';
        else if (upper.includes('FROM TBL_TRANSAKSI_KELUAR')) targetTable = 'tbl_transaksi_keluar';
        else if (upper.includes('FROM TBL_MUTASI_STOK')) targetTable = 'tbl_mutasi_stok';
        else if (upper.includes('FROM TBL_ACTIVITY_LOGS')) targetTable = 'tbl_activity_logs';

        let rawRows: any[] = [];
        if (targetTable) {
          rawRows = (this.state as any)[targetTable.replace('tbl_', '')] || [];
        } else if (upper.includes('VERSION()')) {
          const duration = performance.now() - t0;
          this.logQuery(rawSql, duration, 1);
          return {
            success: true,
            columns: ['VERSION()', 'DATABASE()', 'USER()'],
            rows: [{ 'VERSION()': '8.0.35-CodeIgniter4-Relational', 'DATABASE()': 'db_ci_inventaris', 'USER()': 'ci_app@localhost' }],
            executionTimeMs: Math.round(duration * 100) / 100,
          };
        } else {
          // Default to barang if generic
          rawRows = this.state.barang;
        }

        // Apply WHERE filter simulation if applicable
        let filtered = [...rawRows];
        if (upper.includes('WHERE STOK < STOK_MIN') || upper.includes('WHERE STOK <= STOK_MIN')) {
          filtered = filtered.filter((b) => b.stok <= b.stok_min);
        } else if (upper.includes('WHERE KONDISI = \'BAIK\'') || upper.includes('WHERE KONDISI="BAIK"')) {
          filtered = filtered.filter((b) => b.kondisi === 'Baik');
        }

        // Apply LIMIT
        const limitMatch = upper.match(/LIMIT\s+(\d+)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1], 10);
          filtered = filtered.slice(0, limit);
        }

        const columns = filtered.length > 0 ? Object.keys(filtered[0]) : ['id', 'status', 'info'];
        const duration = performance.now() - t0;
        this.logQuery(rawSql, duration, filtered.length);

        return {
          success: true,
          columns,
          rows: filtered,
          executionTimeMs: Math.round(duration * 100) / 100,
          message: `${filtered.length} baris dikembalikan dalam ${Math.round(duration * 100) / 100} ms`,
        };
      }

      // Fallback response for mock unsupported write statements
      const duration = performance.now() - t0;
      this.logQuery(rawSql, duration, 1);
      return {
        success: true,
        columns: ['Status', 'Executed_Command', 'Engine'],
        rows: [{ Status: 'Query OK, 0 rows affected', Executed_Command: cleanSql.substring(0, 40) + '...', Engine: 'MySQL 8.0 / InnoDB' }],
        executionTimeMs: Math.round(duration * 100) / 100,
        message: `Query OK. (0.01 sec)`,
      };
    } catch (err: any) {
      const duration = performance.now() - t0;
      this.logQuery(rawSql, duration, 0, 'ERROR');
      return {
        success: false,
        columns: ['Error_Code', 'Error_Message'],
        rows: [{ Error_Code: 1064, Error_Message: err.message || 'Syntax error in SQL statement' }],
        executionTimeMs: Math.round(duration * 100) / 100,
        message: err.message,
      };
    }
  }

  public getTableRowCount(tableName: string): number {
    const key = tableName.replace('tbl_', '');
    const data = (this.state as any)[key];
    return Array.isArray(data) ? data.length : 0;
  }
}

export const mysql = new MySQLEngine();
