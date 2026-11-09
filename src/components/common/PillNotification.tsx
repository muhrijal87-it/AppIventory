import React from 'react';
import { X, AlertTriangle, CheckCircle2, AlertCircle, Info, MessageSquare, ArrowRight } from 'lucide-react';

export type PillNotificationType = 'warning' | 'success' | 'error' | 'info';

export interface PillNotificationProps {
  type?: PillNotificationType;
  title: string;
  message?: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  avatar?: string;
  autoDismissMs?: number;
}

export const PillNotification: React.FC<PillNotificationProps> = ({
  type = 'warning',
  title,
  message,
  onClose,
  action,
  className = '',
  avatar,
}) => {
  // Color configuration exactly reflecting the user's reference image
  const typeConfig = {
    warning: {
      container:
        'bg-[#FFF5EA] dark:bg-[#2B1B10] border-[1.5px] border-[#FED7AA] dark:border-[#9A3412] text-[#431407] dark:text-[#FFEDD5] shadow-xl shadow-orange-950/15 dark:shadow-black/60 backdrop-blur-md',
      title: 'text-[#431407] dark:text-[#FFEDD5]',
      message: 'text-[#78350F]/85 dark:text-[#FED7AA]/80',
      closeBtn: 'text-[#9A3412]/60 hover:text-[#431407] dark:text-[#FED7AA]/60 dark:hover:text-white',
      badgeBg: 'bg-[#F97316] text-white',
      actionBtn: 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-xs',
      icon: (
        <div className="w-5 h-5 rounded-lg bg-[#F97316] flex items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-white fill-white" />
        </div>
      ),
    },
    success: {
      container:
        'bg-[#F0FDF4] dark:bg-[#0E2818] border-[1.5px] border-[#86EFAC] dark:border-[#166534] text-[#14532D] dark:text-[#DCFCE7] shadow-xl shadow-emerald-950/15 dark:shadow-black/60 backdrop-blur-md',
      title: 'text-[#14532D] dark:text-[#DCFCE7]',
      message: 'text-[#166534]/85 dark:text-[#BBF7D0]/80',
      closeBtn: 'text-[#166534]/60 hover:text-[#14532D] dark:text-[#BBF7D0]/60 dark:hover:text-white',
      badgeBg: 'bg-[#10B981] text-white',
      actionBtn: 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs',
      icon: (
        <div className="w-5 h-5 rounded-lg bg-[#10B981] flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
        </div>
      ),
    },
    error: {
      container:
        'bg-[#FFF1F2] dark:bg-[#2D1217] border-[1.5px] border-[#FDA4AF] dark:border-[#9F1239] text-[#4C0519] dark:text-[#FFE4E6] shadow-xl shadow-rose-950/15 dark:shadow-black/60 backdrop-blur-md',
      title: 'text-[#4C0519] dark:text-[#FFE4E6]',
      message: 'text-[#9F1239]/85 dark:text-[#FECDD3]/80',
      closeBtn: 'text-[#9F1239]/60 hover:text-[#4C0519] dark:text-[#FECDD3]/60 dark:hover:text-white',
      badgeBg: 'bg-[#E11D48] text-white',
      actionBtn: 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-xs',
      icon: (
        <div className="w-5 h-5 rounded-lg bg-[#E11D48] flex items-center justify-center shrink-0 shadow-xs">
          <AlertCircle className="w-3.5 h-3.5 text-white stroke-[2.5]" />
        </div>
      ),
    },
    info: {
      container:
        'bg-[#EFF6FF] dark:bg-[#111F36] border-[1.5px] border-[#93C5FD] dark:border-[#1E40AF] text-[#1E3A8A] dark:text-[#DBEAFE] shadow-xl shadow-blue-950/15 dark:shadow-black/60 backdrop-blur-md',
      title: 'text-[#1E3A8A] dark:text-[#DBEAFE]',
      message: 'text-[#1E40AF]/85 dark:text-[#BFDBFE]/80',
      closeBtn: 'text-[#1E40AF]/60 hover:text-[#1E3A8A] dark:text-[#BFDBFE]/60 dark:hover:text-white',
      badgeBg: 'bg-[#3B82F6] text-white',
      actionBtn: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs',
      icon: (
        <div className="w-5 h-5 rounded-lg bg-[#3B82F6] flex items-center justify-center shrink-0 shadow-xs">
          <Info className="w-3.5 h-3.5 text-white stroke-[2.5]" />
        </div>
      ),
    },
  };

  const current = typeConfig[type] || typeConfig.warning;

  return (
    <div
      role="alert"
      className={`relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-[22px] transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${current.container} ${className}`}
    >
      {/* Leading Icon / Avatar */}
      {avatar ? (
        <img
          src={avatar}
          alt={title}
          className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-white/50"
        />
      ) : (
        current.icon
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className={`text-[13px] font-bold leading-tight ${current.title}`}>
          {title}
        </h4>
        {message && (
          <p className={`text-xs leading-normal mt-0.5 ${current.message}`}>
            {message}
          </p>
        )}
        {action && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={action.onClick}
              className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer active:scale-95 ${current.actionBtn}`}
            >
              <span>{action.label}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Close button with exact hand cursor & styling from reference */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`shrink-0 p-1 rounded-full transition-colors cursor-pointer ${current.closeBtn}`}
          aria-label="Tutup notifikasi"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
