import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCheck,
  Trash2,
  Inbox,
  MessageSquare,
  ArrowRight,
  Send,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  FileText
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationCategory, NotificationItem } from '../../types/notification';

interface NotificationCenterModalProps {
  onNavigate?: (view: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ onNavigate }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    selectedNotification,
    setSelectedNotification,
    isCenterModalOpen,
    setIsCenterModalOpen,
    simulateIncoming,
    formatRelativeTime,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  if (!isCenterModalOpen) return null;

  // Filter list
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'messages' && item.category !== 'messages') return false;
    if (activeTab === 'system' && item.category !== 'system') return false;
    if (onlyUnread && item.isRead) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.senderName.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q)
    );
  });

  const activeItem =
    selectedNotification ||
    (filteredNotifications.length > 0 ? filteredNotifications[0] : null);

  const handleSelect = (item: NotificationItem) => {
    setSelectedNotification(item);
    markAsRead(item.id);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setReplySuccess(true);
    setReplyText('');
    setTimeout(() => {
      setReplySuccess(false);
    }, 3000);
  };

  const handleGoToModule = (url?: string) => {
    if (url && onNavigate) {
      setIsCenterModalOpen(false);
      onNavigate(url);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] max-h-[760px] shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                <span>Pusat Notifikasi &amp; Pesan Tim</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full">
                    {unreadCount} belum dibaca
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => simulateIncoming('message')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulasi Masuk</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                title="Tandai semua telah dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Tandai Semua Dibaca</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCenterModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view (List on left, Detail on right) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Panel: Search, Filter & List */}
          <div className="w-full md:w-[380px] lg:w-[420px] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/30 dark:bg-slate-900/40">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari notifikasi..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('messages')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'messages'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Pesan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('system')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === 'system'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Sistem
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin">
              {filteredNotifications.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tidak ada notifikasi
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                      } ${!item.isRead ? 'font-medium' : 'opacity-85'}`}
                    >
                      <div className="relative shrink-0 mt-0.5">
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
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.senderName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          {item.title}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Detail Reading & Interaction Pane */}
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 overflow-y-auto">
            {activeItem ? (
              <div className="p-6 flex flex-col h-full">
                {/* Detail Header */}
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeItem.senderName}</h3>
                    <div className="text-xs text-slate-400 mt-1">{activeItem.title}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNotification(activeItem.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Detail Message Content */}
                <div className="py-6 flex-1 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeItem.message}
                  </div>
                  {activeItem.actionUrl && (
                    <button
                      type="button"
                      onClick={() => handleGoToModule(activeItem.actionUrl)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                    >
                      <span>{activeItem.actionLabel || 'Buka'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Inbox className="w-12 h-12 stroke-[1.2] mb-2" />
                <p className="text-xs font-medium">Pilih notifikasi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
