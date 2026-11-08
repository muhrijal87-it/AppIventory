# 📦 CI-Inventaris - Sistem Inventaris Barang & Pergudangan

Aplikasi manajemen inventaris barang dan logistik berbasis web dengan arsitektur & styling khas **CodeIgniter 4**, engine database **MySQL**, autentikasi berjenjang (Role-Based Access Control), serta **Modern Smart Notification System**.

---

## 🚀 3 Cara Menjalankan Aplikasi Melalui GitHub

Anda dapat menjalankan aplikasi ini langsung melalui GitHub dengan salah satu dari 3 cara berikut:

### 🌟 Cara 1: Menjalankan Langsung di Browser (GitHub Pages - Gratis)

Aplikasi ini telah dikonfigurasi dengan `base: './'` sehingga dapat langsung berjalan di GitHub Pages.

**Cara mengaktifkan di GitHub:**
1. Di repositori GitHub Anda, klik menu **Actions** > **New workflow** > **Static HTML** (atau buat file `.github/workflows/deploy.yml` langsung di GitHub).
2. Atau jalankan build secara lokal dengan `npm run build` dan push folder `dist` ke branch `gh-pages`.
3. Masuk ke **Settings** > **Pages** di repositori GitHub Anda untuk mengaktifkan URL publik:
   ```
   https://<username-anda>.github.io/<nama-repo>/
   ```

---

### 💻 Cara 2: Menjalankan Langsung via GitHub Codespaces (1-Click Cloud IDE)

Anda dapat menjalankan dan menguji aplikasi langsung di cloud tanpa menginstal apapun di komputer lokal:

1. Di halaman repositori GitHub, klik tombol hijau **`<> Code`**.
2. Pilih tab **Codespaces**, lalu klik **Create codespace on main**.
3. GitHub akan menyiapkan environment container Node.js secara otomatis.
4. Tunggu terminal menyelesaikan perintah otomatis `npm install`.
5. Jalankan server dev di terminal Codespaces:
   ```bash
   npm run dev
   ```
6. Pop-up pratinjau browser akan muncul otomatis di port `3000`. Klik **Open in Browser**.

---

### 🖥️ Cara 3: Menjalankan di Komputer Lokal (Clone dari GitHub)

Jika Anda ingin menjalankan di komputer lokal / laptop Anda:

#### Prasyarat:
- [Node.js](https://nodejs.org/) (versi 18 atau 20+ LTS)
- Git

#### Langkah-langkah:
1. **Clone repositori dari GitHub:**
   ```bash
   git clone https://github.com/<username-anda>/<nama-repo>.git
   cd <nama-repo>
   ```

2. **Install semua dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```

4. **Buka di browser:**
   Akses [http://localhost:3000](http://localhost:3000)

---

### ⚠️ Solusi Error Windows PowerShell (`npm.ps1 cannot be loaded`)

Jika saat mengetik `npm install` di PowerShell muncul pesan merah:
> *npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.*

Gunakan salah satu dari cara berikut:

- **Cara A (Rekomendasi - Beri izin script PowerShell):**
  Jalankan perintah ini di PowerShell:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
  Lalu tekan `Y` (Yes) dan tekan Enter. Setelah itu coba ketik `npm install` lagi.

- **Cara B (Gunakan `npm.cmd` langsung tanpa ubah setting):**
  Ketik `npm.cmd` sebagai ganti `npm`:
  ```powershell
  npm.cmd install
  npm.cmd run dev
  ```

- **Cara C (Klik 2x File Bawaan Proyek):**
  Cukup klik ganda (double-click) file:
  - `install.bat` untuk menginstall paket.
  - `run.bat` untuk menjalankan aplikasi di browser.

- **Cara D (Gunakan Terminal Command Prompt / CMD):**
  Di VS Code, klik panah dropdown di samping tombol `+` pada panel terminal, lalu pilih **Command Prompt** (bukan PowerShell). Lalu jalankan `npm install`.

---

## 🔑 Akun Login Bawaan (Default Credentials)

Aplikasi memiliki autentikasi berbasis role (RBAC) dengan hak akses berbeda:

| Role | Username | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin123` | Akses penuh seluruh modul, kelola user, database SQL, master data |
| **Petugas Gudang** | `staff` | `staff123` | Transaksi barang masuk, barang keluar, serial number, cetak DO |
| **Manajer Operasional** | `manajer` | `manajer123` | Laporan mutasi stok, audit trail, valuasi aset, monitoring |

---

## 📤 Panduan Push Proyek ini ke GitHub Pertama Kali

Jika Anda baru membuat repositori baru di GitHub:

```bash
# 1. Inisialisasi git (jika belum)
git init

# 2. Tambahkan seluruh file ke stage
git add .

# 3. Buat commit pertama
git commit -m "feat: inisialisasi CI-Inventaris aplikasi web"

# 4. Ubah nama branch utama menjadi main
git branch -M main

# 5. Hubungkan ke repositori GitHub Anda
git remote add origin https://github.com/<username-anda>/<nama-repo>.git

# 6. Push kode ke GitHub
git push -u origin main
```

---

## 🛠️ Perintah Skrip Tersedia

- `npm run dev` : Menjalankan server pengembangan lokal di port 3000.
- `npm run build` : Mem-build aplikasi siap produksi ke folder `dist/`.
- `npm run preview` : Menjalankan pratinjau hasil build lokal.
- `npm run lint` : Memeriksa kesesuaian tipe data dan sintaks TypeScript (`tsc --noEmit`).

---

## 💡 Fitur Unggulan Sistem
- **Katalog Barang & Serial Number:** Pencatatan stok fisik, nomor seri (SN), dan status unit.
- **Transaksi Masuk & Keluar:** Formulir penerimaan & pengeluaran (Surat Jalan / DO).
- **Distribusi & Pindah Barang:** Pelacakan mutasi antar-lokasi dan serah terima unit.
- **Modern Notification System:** Notifikasi pesan tim, peringatan stok kritis, dan log sistem real-time dengan audio chime & floating toast.
- **Database MySQL Engine:** Backup SQL Dump, restore otomatis, dan SQL Query runner interaktif.
- **CodeIgniter 4 MVC Inspector:** Panel visual penjelajah Controller, Model, View, dan Routes.
