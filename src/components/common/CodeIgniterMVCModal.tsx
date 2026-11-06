import React, { useState } from 'react';
import {
  FileCode2,
  FolderTree,
  Copy,
  Check,
  X,
  Code,
  Layers,
  Database,
  ExternalLink,
  Flame
} from 'lucide-react';

interface MVCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeIgniterMVCModal: React.FC<MVCModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<string>('controller_barang');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filesContent: Record<string, { path: string; language: string; description: string; code: string }> = {
    controller_barang: {
      path: 'app/Controllers/Barang.php',
      language: 'php',
      description: 'Controller untuk mengelola logika bisnis inventaris barang (CRUD, Validasi, Mutasi Stok)',
      code: `<?php

namespace App\\Controllers;

use App\\Models\\BarangModel;
use App\\Models\\KategoriModel;
use App\\Models\\SatuanModel;
use App\\Models\\MutasiStokModel;
use CodeIgniter\\RESTful\\ResourceController;

class Barang extends BaseController
{
    protected $barangModel;
    protected $kategoriModel;
    protected $satuanModel;
    protected $mutasiModel;

    public function __construct()
    {
        $this->barangModel   = new BarangModel();
        $this->kategoriModel = new KategoriModel();
        $this->satuanModel   = new SatuanModel();
        $this->mutasiModel   = new MutasiStokModel();
    }

    /**
     * Menampilkan daftar katalog seluruh inventaris barang
     */
    public function index()
    {
        $keyword  = $this->request->getGet('keyword');
        $kategori = $this->request->getGet('kategori_id');

        $builder = $this->barangModel->select('tbl_barang.*, tbl_kategori.nama_kategori, tbl_satuan.nama_satuan')
            ->join('tbl_kategori', 'tbl_kategori.id = tbl_barang.kategori_id', 'left')
            ->join('tbl_satuan', 'tbl_satuan.id = tbl_barang.satuan_id', 'left');

        if ($keyword) {
            $builder->groupStart()
                ->like('tbl_barang.nama_barang', $keyword)
                ->orLike('tbl_barang.kode_barang', $keyword)
                ->groupEnd();
        }

        if ($kategori) {
            $builder->where('tbl_barang.kategori_id', $kategori);
        }

        $data = [
            'title'       => 'Katalog Data Barang Inventaris',
            'barang'      => $builder->orderBy('tbl_barang.id', 'DESC')->findAll(),
            'kategori'    => $this->kategoriModel->findAll(),
            'satuan'      => $this->satuanModel->findAll(),
            'breadcrumbs' => ['Inventaris', 'Data Barang']
        ];

        return view('barang/index', $data);
    }

    /**
     * Menyimpan data barang baru dengan validasi rules CodeIgniter 4
     */
    public function simpan()
    {
        $rules = [
            'kode_barang' => 'required|is_unique[tbl_barang.kode_barang]|min_length[3]|max_length[25]',
            'nama_barang' => 'required|min_length[3]|max_length[200]',
            'kategori_id' => 'required|numeric',
            'satuan_id'   => 'required|numeric',
            'stok'        => 'required|numeric|greater_than_equal_to[0]',
            'stok_min'    => 'required|numeric',
        ];

        if (!$this->validate($rules)) {
            return redirect()->back()->withInput()->with('errors', $this->validator->getErrors());
        }

        $postData = [
            'kode_barang' => strtoupper($this->request->getPost('kode_barang')),
            'nama_barang' => $this->request->getPost('nama_barang'),
            'kategori_id' => $this->request->getPost('kategori_id'),
            'satuan_id'   => $this->request->getPost('satuan_id'),
            'stok'        => $this->request->getPost('stok'),
            'stok_min'    => $this->request->getPost('stok_min'),
            'lokasi_rak'  => $this->request->getPost('lokasi_rak'),
            'kondisi'     => $this->request->getPost('kondisi') ?? 'Baik',
            'deskripsi'   => $this->request->getPost('deskripsi'),
            'barcode'     => $this->request->getPost('barcode'),
        ];

        $this->barangModel->insert($postData);
        $insertId = $this->barangModel->getInsertID();

        // Catat saldo awal jika stok > 0
        if ($postData['stok'] > 0) {
            $this->mutasiModel->insert([
                'barang_id'     => $insertId,
                'jenis'         => 'Penyesuaian',
                'jumlah'        => $postData['stok'],
                'stok_sebelum'  => 0,
                'stok_sesudah'  => $postData['stok'],
                'referensi'     => 'SALDO-AWAL',
                'keterangan'    => 'Pencatatan stok saldo awal barang baru',
                'petugas_id'    => session()->get('user_id'),
            ]);
        }

        session()->setFlashdata('success', 'Data barang inventaris berhasil ditambahkan!');
        return redirect()->to('/barang');
    }
}`,
    },
    model_barang: {
      path: 'app/Models/BarangModel.php',
      language: 'php',
      description: 'Model CodeIgniter 4 dengan integrasi query builder MySQL, timestamps & validation',
      code: `<?php

namespace App\\Models;

use CodeIgniter\\Model;

class BarangModel extends Model
{
    protected $table            = 'tbl_barang';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'kode_barang',
        'nama_barang',
        'kategori_id',
        'satuan_id',
        'stok',
        'stok_min',
        'harga_beli',
        'harga_jual',
        'lokasi_rak',
        'kondisi',
        'deskripsi',
        'barcode',
        'foto',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    /**
     * Ambil barang yang berada di bawah atau sama dengan stok minimum (stok kritis)
     */
    public function getLowStockItems()
    {
        return $this->select('tbl_barang.*, tbl_kategori.nama_kategori, tbl_satuan.nama_satuan')
            ->join('tbl_kategori', 'tbl_kategori.id = tbl_barang.kategori_id', 'left')
            ->join('tbl_satuan', 'tbl_satuan.id = tbl_barang.satuan_id', 'left')
            ->where('stok <= stok_min')
            ->orderBy('stok', 'ASC')
            ->findAll();
    }

    /**
     * Hitung total valuasi aset barang (stok * harga_beli)
     */
    public function getTotalAssetValue()
    {
        $query = $this->db->query("SELECT SUM(stok * harga_beli) as total_aset, SUM(stok) as total_fisik FROM tbl_barang");
        return $query->getRow();
    }
}`,
    },
    view_barang: {
      path: 'app/Views/barang/index.php',
      language: 'php',
      description: 'Tampilan View CodeIgniter yang memanfaatkan template inheritance layout/main',
      code: `<?= $this->extend('layout/main') ?>

<?= $this->section('content') ?>
<div class="row">
    <div class="col-12">
        <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h6 class="m-0 font-weight-bold text-primary">
                    <i class="fas fa-boxes mr-1"></i> Data Inventaris Barang
                </h6>
                <div>
                    <a href="<?= base_url('barang/tambah') ?>" class="btn btn-primary btn-sm">
                        <i class="fas fa-plus mr-1"></i> Tambah Barang
                    </a>
                    <a href="<?= base_url('database/backup') ?>" class="btn btn-outline-secondary btn-sm ml-2">
                        <i class="fas fa-database mr-1"></i> Backup MySQL (.sql)
                    </a>
                </div>
            </div>
            
            <div class="card-body">
                <!-- Flash Message Notification -->
                <?php if (session()->getFlashdata('success')) : ?>
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <?= session()->getFlashdata('success') ?>
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                <?php endif; ?>

                <div class="table-responsive">
                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0">
                        <thead class="thead-light">
                            <tr>
                                <th>No</th>
                                <th>Kode</th>
                                <th>Nama Barang</th>
                                <th>Kategori</th>
                                <th>Stok Fisik</th>
                                <th>Lokasi Rak</th>
                                <th>Status Fisik</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php $no = 1; foreach ($barang as $b) : ?>
                                <tr>
                                    <td><?= $no++ ?></td>
                                    <td><span class="badge badge-light"><?= esc($b['kode_barang']) ?></span></td>
                                    <td class="font-weight-bold"><?= esc($b['nama_barang']) ?></td>
                                    <td><?= esc($b['nama_kategori'] ?? '-') ?></td>
                                    <td>
                                        <?php if ($b['stok'] <= $b['stok_min']) : ?>
                                            <span class="badge badge-danger"><?= $b['stok'] ?> (Kritis)</span>
                                        <?php else : ?>
                                            <span class="badge badge-success"><?= $b['stok'] ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td><?= esc($b['lokasi_rak']) ?></td>
                                    <td>
                                        <span class="badge badge-info"><?= esc($b['kondisi']) ?></span>
                                    </td>
                                    <td>
                                        <a href="<?= base_url('barang/edit/' . $b['id']) ?>" class="btn btn-warning btn-sm btn-circle">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <a href="<?= base_url('barang/hapus/' . $b['id']) ?>" class="btn btn-danger btn-sm btn-circle" onclick="return confirm('Hapus barang ini?')">
                                            <i class="fas fa-trash"></i>
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
<?= $this->endSection() ?>`,
    },
    routes_config: {
      path: 'app/Config/Routes.php',
      language: 'php',
      description: 'Definisi routing HTTP request ke controller method dan filter autentikasi',
      code: `<?php

use CodeIgniter\\Router\\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Auth routes (Login & Logout)
$routes->group('auth', function ($routes) {
    $routes->get('login', 'Auth::login');
    $routes->post('process', 'Auth::processLogin');
    $routes->get('logout', 'Auth::logout');
});

// Protected routes (Harus login via AuthFilter)
$routes->group('', ['filter' => 'auth'], function ($routes) {
    $routes->get('dashboard', 'Dashboard::index');

    // Modul Barang
    $routes->group('barang', function ($routes) {
        $routes->get('', 'Barang::index');
        $routes->get('tambah', 'Barang::tambah');
        $routes->post('simpan', 'Barang::simpan');
        $routes->get('edit/(:num)', 'Barang::edit/$1');
        $routes->post('update/(:num)', 'Barang::update/$1');
        $routes->get('hapus/(:num)', 'Barang::hapus/$1');
    });

    // Transaksi Masuk & Keluar
    $routes->group('transaksi', function ($routes) {
        $routes->get('masuk', 'Transaksi::masuk');
        $routes->post('simpan-masuk', 'Transaksi::simpanMasuk');
        $routes->get('keluar', 'Transaksi::keluar');
        $routes->post('simpan-keluar', 'Transaksi::simpanKeluar');
    });

    // Database Backup, Reset & SQL Tool (Khusus Admin)
    $routes->group('database', ['filter' => 'role:admin'], function ($routes) {
        $routes->get('backup', 'DatabaseTool::backup');
        $routes->get('download-sql', 'DatabaseTool::downloadSQL');
        $routes->post('restore', 'DatabaseTool::restore');
        $routes->post('reset', 'DatabaseTool::reset');
        $routes->match(['get', 'post'], 'sql', 'DatabaseTool::queryRunner');
    });
});`,
    },
    env_config: {
      path: '.env (CodeIgniter Environment)',
      language: 'ini',
      description: 'Konfigurasi environment dan koneksi database MySQL di CodeIgniter 4',
      code: `#--------------------------------------------------------------------
# ENVIRONMENT & APP CONFIG
#--------------------------------------------------------------------
CI_ENVIRONMENT = development

app.baseURL = 'http://localhost:8080/'
app.forceGlobalSecureRequests = false

#--------------------------------------------------------------------
# DATABASE CONFIGURATION (MySQL 8.0)
#--------------------------------------------------------------------
database.default.hostname = localhost
database.default.database = db_ci_inventaris
database.default.username = root
database.default.password = 
database.default.DBDriver = MySQLi
database.default.DBPrefix = tbl_
database.default.port     = 3306
database.default.charset  = utf8mb4
database.default.DBCollat = utf8mb4_unicode_ci

#--------------------------------------------------------------------
# SESSION & SECURITY
#--------------------------------------------------------------------
app.sessionDriver = 'CodeIgniter\\Session\\Handlers\\FileHandler'
app.sessionCookieName = 'ci_session'
app.sessionExpiration = 7200
app.sessionSavePath = WRITEPATH . 'session'`,
    },
  };

  const handleCopy = () => {
    const code = filesContent[activeFile]?.code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Struktur Arsitektur CodeIgniter 4 &amp; MySQL
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  MVC Architecture
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pola struktur Controller, Model, View, Routes, dan Database Migration yang kompatibel penuh dengan CI4
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left: File Tree Explorer */}
          <div className="w-64 bg-slate-950/80 border-r border-slate-800 p-3 flex flex-col shrink-0 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400 font-sans font-bold uppercase text-[10px] tracking-wider mb-2 px-2">
              <FolderTree className="w-3.5 h-3.5" />
              <span>CI4 Project Tree</span>
            </div>

            <div className="space-y-1 overflow-y-auto flex-1">
              <div className="text-[11px] text-slate-400 px-2 py-1 font-bold">Controllers</div>
              <button
                onClick={() => setActiveFile('controller_barang')}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeFile === 'controller_barang'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-red-400" />
                <span className="truncate">Barang.php</span>
              </button>

              <div className="text-[11px] text-slate-400 px-2 py-1 font-bold mt-2">Models</div>
              <button
                onClick={() => setActiveFile('model_barang')}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeFile === 'model_barang'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">BarangModel.php</span>
              </button>

              <div className="text-[11px] text-slate-400 px-2 py-1 font-bold mt-2">Views</div>
              <button
                onClick={() => setActiveFile('view_barang')}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeFile === 'view_barang'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">barang/index.php</span>
              </button>

              <div className="text-[11px] text-slate-400 px-2 py-1 font-bold mt-2">Config &amp; Routes</div>
              <button
                onClick={() => setActiveFile('routes_config')}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeFile === 'routes_config'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">Routes.php</span>
              </button>

              <button
                onClick={() => setActiveFile('env_config')}
                className={`w-full text-left px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeFile === 'env_config'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate">.env</span>
              </button>
            </div>
          </div>

          {/* Right: Code Viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
            {/* File info bar */}
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-white font-bold">{filesContent[activeFile]?.path}</span>
                <span className="text-slate-400 text-[11px] ml-2 hidden sm:inline">
                  — {filesContent[activeFile]?.description}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode PHP'}</span>
              </button>
            </div>

            {/* Code container */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 bg-slate-950 scrollbar-thin">
              <pre className="whitespace-pre">{filesContent[activeFile]?.code}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
