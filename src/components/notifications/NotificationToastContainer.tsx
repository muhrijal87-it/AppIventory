import React, { useEffect } from 'react';
import { X, ArrowRight, Bell, MessageSquare, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationItem } from '../../types/notification';

interface ToastItemProps {
  toast: NotificationItem;
  onDismiss: (id: string) => void;
  onSelect: (item: NotificationItem) => void;
  onNavigate?: (view: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, onSelect, onNavigate }) => {
  // Auto-dismiss after 6.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 6500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleClick = () => {
    onSelect(toast);
    onDismiss(toast.id);
    if (toast.actionUrl && onNavigate) {
      onNavigate(toast.actionUrl);
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'stock_alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'direct_message':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 transform translate-x-0 animate-in slide-in-from-top-3 sm:slide-in-from-right-5 fade-in-50">
      <div className="p-3.5 flex items-start gap-3">
        {/* Avatar or Icon */}
        <div className="relative shrink-0 mt-0.5">
          {toast.senderAvatar ? (
            <img
              src={toast.senderAvatar}
              alt={toast.senderName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {toast.senderName.substring(0, 2).toUpperCase()}
            </div>
          )}
          {toast.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {toast.senderName}
            </span>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              Baru saja
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate flex items-center gap-1.5">
            {getIcon()}
            <span>{toast.title}</span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {toast.preview}
          </p>

          {/* Quick Action Button */}
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>{toast.actionLabel || 'Buka Pesan'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Abaikan
            </button>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 animate-[shrink_6.5s_linear_forwards]" />
      </div>
    </div>
  );
};

export const NotificationToastContainer: React.FC<{ onNavigate?: (view: string) => void }> = ({
  onNavigate,
}) => {
  const { activeToasts, dismissToast, setSelectedNotification, setIsCenterModalOpen } = useNotifications();

  if (activeToasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifikasi Masuk"
      className="fixed top-16 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full"
    >
      {activeToasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
          onSelect={(item) => {
            setSelectedNotification(item);
            setIsCenterModalOpen(true);
          }}
          onNavigate={onNavigate}
        />
      ))}
    </aside>
  );
};
