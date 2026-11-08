import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem, NotificationCategory } from '../types/notification';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  unreadMessageCount: number;
  unreadSystemCount: number;
  activeToasts: NotificationItem[];
  soundEnabled: boolean;
  toggleSound: () => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
  simulateIncoming: (presetType?: 'message' | 'stock' | 'system') => void;
  selectedNotification: NotificationItem | null;
  setSelectedNotification: (item: NotificationItem | null) => void;
  isCenterModalOpen: boolean;
  setIsCenterModalOpen: (open: boolean) => void;
  formatRelativeTime: (createdAt: number) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'saas_inventory_notifications_v1';
const SOUND_PREF_KEY = 'saas_notif_sound_enabled';

// High-fidelity initial seed notifications
const INITIAL_SEED: NotificationItem[] = [
  {
    id: 'notif-1',
    senderName: 'Sarah Jenkins',
    senderRole: 'Logistics Supervisor',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    category: 'messages',
    type: 'direct_message',
    title: 'Verifikasi Fisik Unit Hytera',
    message: 'Hai Tim Gudang, stok Radio Rig Hytera perlu kita verifikasi fisik sore ini sebelum pengiriman gelombang 2 ke divisi lapangan. Mohon pastikan serial number unit sesuai dengan kartu stok.',
    preview: 'Hai Tim Gudang, stok Radio Rig Hytera perlu kita verifikasi fisik sore ini...',
    timestamp: '5m ago',
    createdAt: Date.now() - 5 * 60 * 1000,
    isRead: false,
    actionUrl: 'barang',
    actionLabel: 'Lihat Stok Barang',
    metadata: {
      itemCode: 'BRG-001',
      itemName: 'Radio Rig Hytera',
      department: 'Logistik Operasional',
    },
  },
  {
    id: 'notif-2',
    senderName: 'Sistem Kontrol Stok',
    senderRole: 'Automated Monitor',
    category: 'system',
    type: 'stock_alert',
    title: 'Peringatan Stok Menipis: Kabel UTP Cat6',
    message: 'Kuantitas persediaan fisik untuk Kabel UTP Cat6 (BRG-003) saat ini tersisa 2 Roll, telah menyentuh batas stok minimum (5 Roll). Disarankan segera membuat PO pengadaan restok kepada supplier PT Telko Prima.',
    preview: 'Kuantitas persediaan fisik Kabel UTP Cat6 tersisa 2 Roll (di bawah batas minimum 5 Roll)...',
    timestamp: '25m ago',
    createdAt: Date.now() - 25 * 60 * 1000,
    isRead: false,
    actionUrl: 'barang',
    actionLabel: 'Katalog Barang',
    metadata: {
      itemCode: 'BRG-003',
      itemName: 'Kabel UTP Cat6',
      stockRemaining: 2,
    },
  },
  {
    id: 'notif-3',
    senderName: 'Bpk. Bambang Sutrisno',
    senderRole: 'Manajer Operasional',
    senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    category: 'messages',
    type: 'direct_message',
    title: 'Persetujuan Surat Jalan Keluar',
    message: 'Surat Jalan pengeluaran unit laptop ThinkPad (TRX-OUT-202611-001) sudah saya verifikasi dan setujui. Dokumen bukti serah terima silakan diarsipkan pada sistem.',
    preview: 'Surat Jalan pengeluaran unit laptop ThinkPad sudah saya verifikasi dan setujui...',
    timestamp: '2h ago',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    isRead: false,
    actionUrl: 'transaksi_keluar',
    actionLabel: 'Buka Transaksi Keluar',
    metadata: {
      referenceNo: 'TRX-OUT-202611-001',
    },
  },
  {
    id: 'notif-4',
    senderName: 'MySQL Engine Bot',
    senderRole: 'Database Service',
    category: 'system',
    type: 'system_update',
    title: 'Pencadangan Database Otomatis Selesai',
    message: 'Cadangan data penuh (Full SQL Dump) snapshot harian database inventaris berhasil dieksekusi dan disimpan dengan status integritas 100% OK.',
    preview: 'Cadangan data penuh snapshot harian database inventaris berhasil dieksekusi...',
    timestamp: 'Yesterday',
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    isRead: true,
    actionUrl: 'database_backup',
    actionLabel: 'Manajer Database',
  },
  {
    id: 'notif-5',
    senderName: 'Dian Prasetyo',
    senderRole: 'Staff Logistik Lapangan',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isOnline: false,
    category: 'messages',
    type: 'transfer_notice',
    title: 'Konfirmasi Serah Terima Monitor Dell',
    message: '1 unit Monitor Dell UltraSharp 27 Inch telah diterima di ruang teknisi IT dalam kondisi prima tanpa cacat. Terima kasih atas respon cepatnya.',
    preview: '1 unit Monitor Dell UltraSharp 27 Inch telah diterima di ruang teknisi IT...',
    timestamp: '2 days ago',
    createdAt: Date.now() - 48 * 60 * 60 * 1000,
    isRead: true,
    actionUrl: 'perpindahan_barang',
    actionLabel: 'Lihat Distribusi',
  },
];

// Soft synthesizer chime using Web Audio API (no external mp3 dependency)
const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  } catch {
    // Audio autoplay restrictions or unsupported
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return INITIAL_SEED;
  });

  const [activeToasts, setActiveToasts] = useState<NotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem(SOUND_PREF_KEY) !== 'false';
  });

  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Storage quota or private mode
    }
  }, [notifications]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_PREF_KEY, String(next));
      return next;
    });
  };

  const formatRelativeTime = useCallback((createdAt: number): string => {
    const diffMs = Date.now() - createdAt;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessageCount = notifications.filter((n) => !n.isRead && n.category === 'messages').length;
  const unreadSystemCount = notifications.filter((n) => !n.isRead && n.category === 'system').length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(null);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setActiveToasts([]);
    setSelectedNotification(null);
  };

  const dismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotification = useCallback(
    (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead' | 'timestamp'>) => {
      const now = Date.now();
      const newItem: NotificationItem = {
        ...item,
        id: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        timestamp: 'Just now',
        isRead: false,
      };

      setNotifications((prev) => [newItem, ...prev]);
      setActiveToasts((prev) => [newItem, ...prev.slice(0, 3)]); // Keep up to 4 toasts visible

      if (soundEnabled) {
        playChime();
      }
    },
    [soundEnabled]
  );

  const simulateIncoming = (presetType: 'message' | 'stock' | 'system' = 'message') => {
    if (presetType === 'message') {
      const teamSenders = [
        {
          name: 'Rian Firmansyah',
          role: 'Teknisi Jaringan & Hardware',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          title: 'Permintaan Kabel Patch Cord Tambahan',
          message: 'Halo mas, instalasi switch lantai 3 butuh 8 pcs Patch Cord Cat6 tambahan. Apakah bisa disiapkan sebelum jam makan siang?',
          preview: 'Instalasi switch lantai 3 butuh 8 pcs Patch Cord Cat6 tambahan...',
          actionUrl: 'transaksi_keluar',
          actionLabel: 'Buat Transaksi Keluar',
        },
        {
          name: 'Alissa Wardani',
          role: 'Procurement Specialist',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          title: 'Konfirmasi Pengiriman Supplier',
          message: 'PT Multi Elektronika sudah mengonfirmasi jadwal pengiriman 15 unit Radio Rig besok pagi jam 09.30 WIB. Mohon disiapkan tanda terima PO.',
          preview: 'PT Multi Elektronika konfirmasi kirim 15 unit Radio Rig besok pagi...',
          actionUrl: 'transaksi_masuk',
          actionLabel: 'Penerimaan Barang',
        },
      ];
      const selected = teamSenders[Math.floor(Math.random() * teamSenders.length)];
      addNotification({
        senderName: selected.name,
        senderRole: selected.role,
        senderAvatar: selected.avatar,
        isOnline: true,
        category: 'messages',
        type: 'direct_message',
        title: selected.title,
        message: selected.message,
        preview: selected.preview,
        actionUrl: selected.actionUrl,
        actionLabel: selected.actionLabel,
      });
    } else if (presetType === 'stock') {
      addNotification({
        senderName: 'Smart Stock Monitor',
        senderRole: 'Inventory Alert',
        category: 'system',
        type: 'stock_alert',
        title: 'Peringatan Stok Menipis!',
        message: 'Stok barang "Connector RJ-45 Cat6" tersisa 15 Pcs di Rak C-2. Segera lakukan pengadaan restok untuk menghindari kehabisan stok saat operasional.',
        preview: 'Stok Connector RJ-45 Cat6 tersisa 15 Pcs di Rak C-2 (Kritis)...',
        actionUrl: 'barang',
        actionLabel: 'Cek Data Barang',
      });
    } else {
      addNotification({
        senderName: 'Keamanan Sistem',
        senderRole: 'Security Audit',
        category: 'system',
        type: 'security_alert',
        title: 'Verifikasi Integritas Data Sukses',
        message: 'Pengecekan konsistensi tabel MySQL InnoDB dan referensi kunci asing transaksi berhasil tanpa anomali terdeteksi.',
        preview: 'Pengecekan konsistensi tabel MySQL InnoDB sukses 100%...',
        actionUrl: 'activity_logs',
        actionLabel: 'Buka Log Aktivitas',
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadMessageCount,
        unreadSystemCount,
        activeToasts,
        soundEnabled,
        toggleSound,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        dismissToast,
        simulateIncoming,
        selectedNotification,
        setSelectedNotification,
        isCenterModalOpen,
        setIsCenterModalOpen,
        formatRelativeTime,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
