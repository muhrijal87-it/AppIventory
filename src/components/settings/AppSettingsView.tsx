import React, { useState } from 'react';
import {
  Settings,
  Image as ImageIcon,
  Type,
  Upload,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Eye,
  Sliders,
  Flame,
  Shield,
  Layout,
  FileCode2,
  Check,
  RotateCcw
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { DEFAULT_APP_SETTINGS } from '../../db/mysqlEngine';

export const AppSettingsView: React.FC = () => {
  const { appSettings, updateAppSettings, setFlash } = useInventory();

  // Local state for editing
  const [activeTab, setActiveTab] = useState<'logo' | 'name' | 'preview'>('name');
  
  // Name settings form
  const [namaAplikasi, setNamaAplikasi] = useState(appSettings.nama_aplikasi || 'CI-Inventaris');
  const [namaPendek, setNamaPendek] = useState(appSettings.nama_pendek || 'InvSystem');
  const [tagline, setTagline] = useState(appSettings.tagline || 'Sistem Informasi Manajemen Inventaris Gudang & Relasional MySQL');
  const [versiAplikasi, setVersiAplikasi] = useState(appSettings.versi_aplikasi || 'CI 4.5.3');

  // Logo settings form
  const [logoUrl, setLogoUrl] = useState(appSettings.logo_url || '/assets/inventory_logo_v2.jpg');
  const [dragActive, setDragActive] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Sample preset logos for quick selection
  const presetLogos = [
    { id: 'default', name: 'Default Inventory Logo', url: '/assets/inventory_logo_v2.jpg' },
    { id: 'tech', name: 'Tech Box Badge', url: '/assets/aistudio/image_024a7438.png' },
    { id: 'minimal', name: 'Logistics Shield', url: '/assets/aistudio/image_0bd41000.png' },
    { id: 'orange', name: 'Warehouse Vector', url: '/assets/aistudio/image_1824caa4.png' },
  ];

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAplikasi.trim() || !namaPendek.trim()) {
      setFlash('error', 'Nama aplikasi dan nama singkat tidak boleh kosong!');
      return;
    }

    updateAppSettings({
      nama_aplikasi: namaAplikasi.trim(),
      nama_pendek: namaPendek.trim(),
      tagline: tagline.trim(),
      versi_aplikasi: versiAplikasi.trim(),
    });
  };

  const handleSaveLogo = (urlToSave?: string) => {
    const finalUrl = urlToSave || logoUrl;
    if (!finalUrl) {
      setFlash('error', 'URL logo tidak valid!');
      return;
    }

    updateAppSettings({
      logo_url: finalUrl,
    });
    setLogoUrl(finalUrl);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFlash('error', 'File harus berupa gambar (PNG, JPG, SVG, WebP)!');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFlash('error', 'Ukuran gambar maksimal 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setLogoUrl(dataUrl);
        updateAppSettings({ logo_url: dataUrl });
        setFlash('success', 'Logo aplikasi berhasil diunggah dan disimpan!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefault = () => {
    setNamaAplikasi(DEFAULT_APP_SETTINGS.nama_aplikasi);
    setNamaPendek(DEFAULT_APP_SETTINGS.nama_pendek);
    setTagline(DEFAULT_APP_SETTINGS.tagline);
    setVersiAplikasi(DEFAULT_APP_SETTINGS.versi_aplikasi || 'CI 4.5.3');
    setLogoUrl(DEFAULT_APP_SETTINGS.logo_url);

    updateAppSettings({ ...DEFAULT_APP_SETTINGS });
    setFlash('info', 'Pengaturan aplikasi dikembalikan ke kondisi bawaan.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Top Controller Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center shadow-lg shrink-0">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Pengaturan Aplikasi</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 font-semibold border border-red-800">
                  SettingsController.php
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Konfigurasi identitas visual sistem inventaris CodeIgniter 4. Ubah nama aplikasi, akronim header, tagline, dan logo resmi aplikasi secara real-time.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetDefault}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors self-start md:self-auto shrink-0"
            title="Kembalikan ke pengaturan awal (Reset Default)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            <span>Reset Bawaan</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('name')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'name'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Edit Nama Aplikasi</span>
        </button>

        <button
          onClick={() => setActiveTab('logo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logo'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Edit Logo Aplikasi</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'preview'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Prinjauan Real-Time (Preview)</span>
        </button>
      </div>

      {/* TAB 1: EDIT NAMA APLIKASI */}
      {activeTab === 'name' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Type className="w-4 h-4 text-red-500" />
                  <span>Formulir Pengaturan Nama Aplikasi</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Atur judul utama, brand header, tagline, dan penanda versi sistem.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                app_settings.json
              </span>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap Aplikasi (Full Application Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaAplikasi}
                  onChange={(e) => setNamaAplikasi(e.target.value)}
                  placeholder="Contoh: Sistem Informasi Inventaris Gudang"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500 focus:ring-4 focus:ring-red-500/10 font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ditampilkan pada halaman Login, cetak laporan resmi, dan metadata sistem.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Singkat / Brand Header (Short Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaPendek}
                  onChange={(e) => setNamaPendek(e.target.value)}
                  placeholder="Contoh: InvSystem atau CI-Inventaris"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500 focus:ring-4 focus:ring-red-500/10 font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ditampilkan pada Top Header Navbar dan Sidebar navigasi desktop/mobile.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi / Tagline Aplikasi
                </label>
                <textarea
                  rows={3}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Contoh: Sistem Informasi Manajemen Inventaris Gudang & Relasional MySQL"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ditampilkan pada sub-judul layar login dan header pengantar dokumen.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tag Versi Framework / Release Build
                </label>
                <input
                  type="text"
                  value={versiAplikasi}
                  onChange={(e) => setVersiAplikasi(e.target.value)}
                  placeholder="Contoh: CI 4.5.3"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Nama Aplikasi</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Side Box */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Eye className="w-3.5 h-3.5 text-red-400" /> Preview Header Navbar
              </div>
              <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-700/60 flex items-center gap-3">
                <img src={logoUrl} alt="Logo Preview" className="w-7 h-7 rounded-lg object-cover shadow-xs" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {namaPendek || 'InvSystem'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {versiAplikasi || 'CI 4.5.3'}
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 pt-2">
                <Layout className="w-3.5 h-3.5 text-orange-400" /> Preview Login Header
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                <img src={logoUrl} alt="Logo Login" className="w-10 h-10 rounded-xl object-cover mx-auto shadow-md" />
                <div className="text-sm font-bold text-white leading-tight">
                  {namaAplikasi || 'CI-Inventaris'}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {tagline}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT LOGO APLIKASI */}
      {activeTab === 'logo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo Upload Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-red-500" />
                  <span>Formulir Pengaturan Logo Aplikasi</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Unggah logo perusahaan/sistem baru (PNG, JPG, SVG) atau pilih preset logo resmi.
                </p>
              </div>
            </div>

            {/* Current Logo Preview Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                  <img src={logoUrl} alt="Current App Logo" className="w-full h-full object-contain rounded-lg" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logo Aktif Saat Ini</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-xs mt-0.5">
                    {logoUrl.startsWith('data:') ? 'Custom Uploaded Data (Base64 Image)' : logoUrl}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Siap digunakan di Header, Sidebar &amp; Cetakan Laporan
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSaveLogo('/assets/inventory_logo_v2.jpg')}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 transition-colors shrink-0"
              >
                Reset ke Logo Awal
              </button>
            </div>

            {/* Drag & Drop File Upload Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Opsi 1: Unggah File Gambar Logo Baru (PNG / JPG / SVG)
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-500 bg-slate-50/50 dark:bg-slate-800/20'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="logo-file-input"
                />
                <label htmlFor="logo-file-input" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Klik atau Seret (Drag &amp; Drop) Gambar Logo di Sini
                  </div>
                  <div className="text-xs text-slate-500">
                    Format disarankan: PNG Transparan atau SVG square, maksimal 2MB.
                  </div>
                </label>
              </div>
            </div>

            {/* URL Input option */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Opsi 2: Gunakan URL Gambar Web (Web Image Link)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://domain-anda.com/assets/logo.png"
                  className="flex-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-red-500"
                />
                <button
                  onClick={() => {
                    if (customUrlInput.trim()) {
                      handleSaveLogo(customUrlInput.trim());
                      setCustomUrlInput('');
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Terapkan URL
                </button>
              </div>
            </div>

            {/* Presets Gallery */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Opsi 3: Pilih dari Galeri Preset Logo Sistem
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presetLogos.map((preset) => {
                  const isSelected = logoUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSaveLogo(preset.url)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 group ${
                        isSelected
                          ? 'border-red-500 bg-red-50/40 dark:bg-red-950/30 ring-2 ring-red-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-850'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-10 h-10 object-contain rounded-md" />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-600 text-white">
                          Aktif
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Logo Context Preview Side Box */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <Eye className="w-3.5 h-3.5 text-red-400" /> Pengujian Logo di Berbagai Latar
              </div>

              {/* Dark Sidebar view */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-mono">1. Dark Sidebar Header:</div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                  <img src={logoUrl} alt="Logo Sidebar" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                  <span className="font-bold text-white text-sm">{appSettings.nama_pendek || 'InvSystem'}</span>
                </div>
              </div>

              {/* Light Header view */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-mono">2. Light Top Navbar:</div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <img src={logoUrl} alt="Logo Header" className="w-7 h-7 rounded-lg object-cover shadow-xs" />
                  <span className="font-bold text-slate-800 text-sm">{appSettings.nama_pendek || 'InvSystem'}</span>
                </div>
              </div>

              {/* Print Document Header view */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-mono">3. Cetakan Dokumen Laporan:</div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-900 flex items-center gap-3">
                  <img src={logoUrl} alt="Logo Print" className="w-9 h-9 rounded object-cover border border-slate-300" />
                  <div>
                    <div className="text-xs font-bold uppercase">{appSettings.nama_aplikasi || 'CI-Inventaris'}</div>
                    <div className="text-[9px] text-slate-500">Laporan Resmi Stok Inventaris Gudang</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FULL REALTIME PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-red-500" />
                <span>Prinjauan Tampilan Sistem Real-Time (Full Layout Preview)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulasi tampilan header, sidebar, footer, dan dokumen cetak dengan logo &amp; nama aplikasi aktif.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header Mockup */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-blue-500" /> 1. Header Bar Top Navigation
              </div>
              <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg shadow-xs object-cover" />
                  <span className="font-bold text-slate-900 dark:text-white text-base">{namaPendek}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {versiAplikasi}
                </div>
              </div>
            </div>

            {/* Sidebar Mockup */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-orange-500" /> 2. Sidebar Navigation Panel
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-3">
                <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg shadow-md object-cover" />
                <div>
                  <div className="font-bold text-white text-sm">{namaPendek}</div>
                  <div className="text-[10px] text-slate-400">CodeIgniter 4 Inventory</div>
                </div>
              </div>
            </div>

            {/* Login Card Mockup */}
            <div className="md:col-span-2 space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> 3. Halaman Autentikasi Login (Login Screen)
              </div>
              <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg text-center max-w-md mx-auto space-y-3">
                <img src={logoUrl} alt="Logo" className="w-14 h-14 rounded-2xl object-cover mx-auto shadow-xl" />
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-bold text-white">{namaAplikasi}</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-semibold border border-red-800">
                    {versiAplikasi}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{tagline}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
