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

  const isWarning = toast.type === 'stock_alert' || toast.type === 'security_alert';
  const isMessage = toast.type === 'direct_message';

  return (
    <div
      role="alert"
      className="pointer-events-auto w-full sm:w-[380px] max-w-full rounded-[24px] bg-[#FFF5EA] dark:bg-[#2B1B10] border border-[#FDBA74] dark:border-[#9A3412] shadow-[0_10px_35px_rgba(249,115,22,0.15)] dark:shadow-black/50 p-3.5 sm:px-5 sm:py-3.5 transition-all duration-300 transform translate-x-0 animate-in slide-in-from-top-3 sm:slide-in-from-right-5 fade-in-50 flex items-center gap-3.5"
    >
      {/* Icon: solid orange/amber triangle or avatar */}
      {toast.senderAvatar ? (
        <div className="relative shrink-0">
          <img
            src={toast.senderAvatar}
            alt={toast.senderName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#FDBA74]/50"
          />
          {toast.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#FFF5EA] dark:ring-[#2B1B10]" />
          )}
        </div>
      ) : (
        <div className="w-6 h-6 rounded-lg bg-[#F97316] flex items-center justify-center shrink-0 shadow-xs">
          {isMessage ? (
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-white fill-white" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-[13px] font-bold text-[#431407] dark:text-[#FFEDD5] leading-tight truncate">
          {toast.title}
        </h4>
        <p className="text-xs text-[#78350F]/85 dark:text-[#FED7AA]/80 leading-normal mt-0.5 line-clamp-2">
          {toast.preview || toast.message}
        </p>
        {toast.actionLabel && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <span>{toast.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Close button with hand pointer */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 text-[#9A3412]/60 hover:text-[#431407] dark:text-[#FED7AA]/60 dark:hover:text-white rounded-full transition-colors cursor-pointer"
        aria-label="Tutup"
        title="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
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
      className="fixed top-16 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none w-auto max-w-[calc(100vw-2rem)] sm:max-w-[380px]"
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
