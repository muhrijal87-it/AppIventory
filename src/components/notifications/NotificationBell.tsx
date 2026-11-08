import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  MessageSquare,
  Server,
  AlertTriangle,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  X,
  Check,
  Circle,
  Inbox
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationCategory, NotificationItem } from '../../types/notification';

interface NotificationBellProps {
  onNavigate?: (view: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const {
    notifications,
    unreadCount,
    unreadMessageCount,
    unreadSystemCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    soundEnabled,
    toggleSound,
    simulateIncoming,
    setSelectedNotification,
    setIsCenterModalOpen,
    formatRelativeTime,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimatingRing, setIsAnimatingRing] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Subtle ring animation when new unread notifications arrive
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimatingRing(true);
      const timer = setTimeout(() => setIsAnimatingRing(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Filter notifications
  const filteredNotifications = notifications.filter((item) => {
    // Tab filter
    if (activeTab === 'messages' && item.category !== 'messages') return false;
    if (activeTab === 'system' && item.category !== 'system') return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.senderName.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q) ||
      (item.metadata?.itemName && item.metadata.itemName.toLowerCase().includes(q))
    );
  });

  const handleItemClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setSelectedNotification(item);

    if (item.actionUrl && onNavigate) {
      onNavigate(item.actionUrl);
      setIsOpen(false);
    } else {
      setIsCenterModalOpen(true);
      setIsOpen(false);
    }
  };

  const getCategoryBadge = (item: NotificationItem) => {
    switch (item.type) {
      case 'direct_message':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            <MessageSquare className="w-2.5 h-2.5" />
            Pesan
          </span>
        );
      case 'stock_alert':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
            <AlertTriangle className="w-2.5 h-2.5" />
            Stok Kritis
          </span>
        );
      case 'transfer_notice':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
            <ArrowRight className="w-2.5 h-2.5" />
            Distribusi
          </span>
        );
      case 'security_alert':
      case 'system_update':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Server className="w-2.5 h-2.5" />
            Sistem
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 focus:outline-hidden ${
          isOpen
            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Pusat Notifikasi & Pesan Tim"
        aria-label="Notifications"
      >
        <Bell
          className={`w-5 h-5 transition-transform duration-300 ${
            isAnimatingRing ? 'animate-bounce text-indigo-600' : ''
          }`}
        />

        {/* Animated Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center">
            {/* Ping glow animation */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-60" />
            <span className="relative inline-flex items-center justify-center rounded-full h-4 min-w-[18px] px-1 text-[10px] font-extrabold text-white bg-indigo-600 shadow-sm shadow-indigo-600/30">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Modern Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[340px] sm:w-[420px] max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden z-50 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150 origin-top-right backdrop-blur-md"
        >
          {/* Header Panel */}
          <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full">
                      {unreadCount} baru
                    </span>
                  )}
                </h3>
              </div>

              {/* Action Tools */}
              <div className="flex items-center gap-1">
                {/* Real-time simulation trigger */}
                <button
                  type="button"
                  onClick={() => simulateIncoming('message')}
                  className="px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  title="Simulasikan pesan real-time baru masuk"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>+ Demo</span>
                </button>

                {/* Sound toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ${
                    !soundEnabled ? 'text-slate-300 dark:text-slate-600' : ''
                  }`}
                  title={soundEnabled ? 'Suara notifikasi aktif (Klik untuk bisukan)' : 'Suara notifikasi nonaktif'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </button>

                {/* Mark all as read */}
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Tandai semua telah dibaca"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Search Bar */}
            <div className="relative mb-2.5">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pengirim, pesan, atau topik..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Semua
                <span className="ml-1 text-[10px] font-mono opacity-80 font-normal">
                  ({notifications.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'messages'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Pesan</span>
                {unreadMessageCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('system')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'system'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Sistem</span>
                {unreadSystemCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            </div>
          </div>

          {/* Notification List Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar-thin">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {searchQuery ? 'Tidak Ada Notifikasi Ditemukan' : 'Semua Notifikasi Bersih'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  {searchQuery
                    ? `Tidak ada notifikasi yang cocok dengan kata kunci "${searchQuery}".`
                    : 'Tidak ada notifikasi baru yang perlu ditinjau saat ini.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Hapus Filter Pencarian
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !item.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Unread Blue Dot Indicator */}
                  {!item.isRead && (
                    <span
                      className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 ring-4 ring-indigo-500/20 shadow-xs"
                      title="Belum dibaca"
                    />
                  )}

                  {/* Sender Avatar / Icon */}
                  <div className="relative shrink-0 ml-1">
                    {item.senderAvatar ? (
                      <img
                        src={item.senderAvatar}
                        alt={item.senderName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-xs"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {item.senderName.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Online indicator */}
                    {item.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {item.senderName}
                      </span>
                      {getCategoryBadge(item)}
                      <span className="text-[11px] text-slate-400 font-mono ml-auto shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {item.title}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {item.preview}
                    </p>

                    {/* Action link pill if present */}
                    {item.actionLabel && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>

                  {/* Hover Micro-actions (Right aligned) */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-xs transition-opacity"
                  >
                    <button
                      type="button"
                      onClick={() => (item.isRead ? markAsUnread(item.id) : markAsRead(item.id))}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title={item.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                    >
                      {item.isRead ? <Circle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNotification(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Hapus notifikasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Panel */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCenterModalOpen(true);
              }}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Pusat Notifikasi</span>
            </button>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                className="text-[11px] text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Bersihkan Semua
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
