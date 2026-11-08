import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Upload, Check, SwitchCamera } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedValue: string) => void;
  title?: string;
  registeredSerials?: string[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan Barcode / QR Code',
  registeredSerials = [],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isStarting, setIsStarting] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;
    let animationFrameId: number;
    let isCancelled = false;

    const startCamera = async () => {
      setIsStarting(true);
      setErrorMsg('');

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Browser ini tidak mendukung akses kamera langsung (getUserMedia).');
        }

        // Try environment camera first, fallback to user camera
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback without constraints if specific facingMode fails
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true'); // essential for iOS
          await videoRef.current.play();
          setIsStarting(false);
        }

        // Native BarcodeDetector API detection (Chrome Android / Desktop)
        if ('BarcodeDetector' in window) {
          const detector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a'],
          });

          const scanLoop = async () => {
            if (isCancelled) return;

            if (videoRef.current && videoRef.current.readyState >= 2) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawVal = barcodes[0].rawValue;
                  if (rawVal) {
                    onScan(rawVal.trim());
                    onClose();
                    return;
                  }
                }
              } catch (detectErr) {
                // Ignore transient frame detect errors
              }
            }

            animationFrameId = requestAnimationFrame(scanLoop);
          };

          animationFrameId = requestAnimationFrame(scanLoop);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setIsStarting(false);
          const name = err.name || '';
          if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
            setErrorMsg('Izin akses kamera ditolak. Berikan izin kamera pada browser Anda atau masukkan nomor seri secara manual.');
          } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
            setErrorMsg('Kamera tidak ditemukan pada perangkat ini.');
          } else {
            setErrorMsg(err.message || 'Gagal memulai video kamera.');
          }
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode, onScan, onClose]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      onClose();
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use BarcodeDetector on image if supported
    if ('BarcodeDetector' in window) {
      const img = new Image();
      img.onload = async () => {
        try {
          const detector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a'],
          });
          const barcodes = await detector.detect(img);
          if (barcodes && barcodes.length > 0) {
            onScan(barcodes[0].rawValue.trim());
            onClose();
            return;
          }
          alert('Barcode/QR tidak terdeteksi dari foto ini. Silakan coba lagi atau masukkan kode secara manual.');
        } catch (err) {
          alert('Gagal memproses gambar barcode.');
        }
      };
      img.src = URL.createObjectURL(file);
    } else {
      alert('File foto diterima. Jika barcode tidak terbaca otomatis di browser ini, silakan ketik nomor serial di kolom input.');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative bg-black w-full aspect-4/3 overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Scanner Crosshair Reticle Overlay */}
          {!errorMsg && !isStarting && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-indigo-500/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                {/* Corner accents */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

                {/* Animated scanning line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_#818cf8] animate-[bounce_2s_infinite]" />
              </div>

              <div className="absolute bottom-3 text-center px-4 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                Arahkan kamera ke Barcode / QR Code
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isStarting && !errorMsg && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 text-white">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-xs">Mengaktifkan kamera...</span>
            </div>
          )}

          {/* Error Message Screen */}
          {errorMsg && (
            <div className="absolute inset-0 bg-slate-900 p-5 flex flex-col items-center justify-center text-center text-white">
              <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
              <p className="text-xs text-slate-300 max-w-xs mb-3">{errorMsg}</p>
              <label className="cursor-pointer px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload Foto Barcode / QR</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoCapture}
                />
              </label>
            </div>
          )}

          {/* Switch Camera Button (if multiple cameras) */}
          {!errorMsg && (
            <button
              type="button"
              onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
              title="Ganti Kamera Depan/Belakang"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Alternative / Manual Options */}
        <div className="p-4 space-y-3 bg-white dark:bg-slate-900">
          {/* Quick upload photo option */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Atau ambil foto dari galeri:</span>
            <label className="cursor-pointer font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih Gambar</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
              />
            </label>
          </div>

          {/* Registered SN presets if available */}
          {registeredSerials.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Pilih dari SN Unit Terdaftar:
              </span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {registeredSerials.map((sn) => (
                  <button
                    key={sn}
                    type="button"
                    onClick={() => {
                      onScan(sn);
                      onClose();
                    }}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                  >
                    <span>{sn}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Manual Entry Form */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Atau ketik nomor seri manual..."
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl transition-colors shrink-0"
            >
              Gunakan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
