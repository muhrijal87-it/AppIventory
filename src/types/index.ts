export type UserRole = 'admin' | 'staff' | 'manager';

export interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

export interface Kategori {
  id: number;
  kode_kategori: string;
  nama_kategori: string;
  deskripsi: string;
}

export interface Satuan {
  id: number;
  kode_satuan: string;
  nama_satuan: string;
}

export interface Departemen {
  id: number;
  kode_departemen: string;
  nama_departemen: string;
  penanggung_jawab?: string;
  lokasi_gedung?: string;
  keterangan?: string;
}

export interface Supplier {
  id: number;
  kode_supplier: string;
  nama_supplier: string;
  kontak_pic: string;
  no_telepon: string;
  email: string;
  alamat: string;
}

export interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  kategori_id: number;
  satuan_id: number;
  stok: number;
  stok_min: number;
  lokasi_rak: string;
  kondisi: 'Baik' | 'Perbaikan' | 'Rusak';
  deskripsi: string;
  barcode: string;
  model?: string;
  serial_number?: string;
  foto?: string;
  created_at: string;
  updated_at: string;
}

export interface TransaksiMasuk {
  id: number;
  no_faktur: string;
  tanggal: string;
  supplier_id: number;
  barang_id: number;
  jumlah: number;
  harga_satuan: number;
  total_harga: number;
  catatan: string;
  petugas_id: number;
  foto_nota?: string;
  created_at: string;
}

export interface TransaksiKeluar {
  id: number;
  no_transaksi: string;
  tanggal: string;
  penerima: string;
  departemen: string;
  barang_id: number;
  jumlah: number;
  model?: string;
  serial_number?: string;
  keperluan: string;
  petugas_id: number;
  foto_bukti?: string;
  created_at: string;
}

export interface MutasiStok {
  id: number;
  tanggal: string;
  barang_id: number;
  jenis: 'Masuk' | 'Keluar' | 'Penyesuaian' | 'Reset' | 'Transfer';
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  referensi: string;
  keterangan: string;
  petugas_id: number;
  asal?: string;
  tujuan?: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  module: string;
  detail: string;
  ip_address: string;
  timestamp: string;
}

export interface DatabaseQueryLog {
  id: string;
  sql: string;
  duration_ms: number;
  timestamp: string;
  affected_rows?: number;
  status: 'SUCCESS' | 'ERROR';
}

export interface TableInfo {
  name: string;
  columns: {
    name: string;
    type: string;
    key?: string;
    extra?: string;
  }[];
  rowCount: number;
}

export interface AppSettings {
  nama_aplikasi: string;
  nama_pendek: string;
  tagline: string;
  logo_url: string;
  versi_aplikasi?: string;
  updated_at?: string;
}

