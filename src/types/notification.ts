export type NotificationCategory = 'all' | 'messages' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationItem {
  id: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  isOnline?: boolean;
  category: 'messages' | 'system';
  type:
    | 'direct_message'
    | 'stock_alert'
    | 'transfer_notice'
    | 'approval_request'
    | 'security_alert'
    | 'system_update';
  title: string;
  message: string;
  preview: string;
  timestamp: string; // e.g. "Just now", "5m ago", "1h ago", "Yesterday"
  createdAt: number; // Date.now() timestamp
  isRead: boolean;
  actionUrl?: string; // Route identifier in App (e.g. 'barang', 'transaksi_masuk', 'transaksi_keluar', 'activity_logs', 'database_backup')
  actionLabel?: string;
  metadata?: {
    itemCode?: string;
    itemName?: string;
    stockRemaining?: number;
    referenceNo?: string;
    senderId?: number;
    department?: string;
  };
}
