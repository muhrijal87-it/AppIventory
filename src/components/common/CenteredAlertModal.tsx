import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';

export interface CenteredAlertProps {
  isOpen: boolean;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const CenteredAlertModal: React.FC<CenteredAlertProps> = ({
  isOpen,
  type = 'success',
  title,
  message,
  onClose,
  action,
}) => {
  if (!isOpen) return null;

  const config = {
    success: {
      bgHeader: 'from-emerald-500 to-emerald-600',
      badgeBg: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40',
      border: 'border-emerald-200 dark:border-emerald-900',
      titleColor: 'text-emerald-800 dark:text-emerald-200',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30',
      icon: <CheckCircle2 className="w-8 h-8 text-white stroke-[2.5]" />,
    },
    warning: {
      bgHeader: 'from-amber-500 to-amber-600',
      badgeBg: 'bg-amber-500 text-white shadow-lg shadow-amber-500/40',
      border: 'border-amber-200 dark:border-amber-900',
      titleColor: 'text-amber-800 dark:text-amber-200',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30',
      icon: <AlertTriangle className="w-8 h-8 text-white fill-white" />,
    },
    error: {
      bgHeader: 'from-rose-500 to-rose-600',
      badgeBg: 'bg-rose-500 text-white shadow-lg shadow-rose-500/40',
      border: 'border-rose-200 dark:border-rose-900',
      titleColor: 'text-rose-800 dark:text-rose-200',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30',
      icon: <AlertCircle className="w-8 h-8 text-white stroke-[2.5]" />,
    },
    info: {
      bgHeader: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-500 text-white shadow-lg shadow-blue-500/40',
      border: 'border-blue-200 dark:border-blue-900',
      titleColor: 'text-blue-800 dark:text-blue-200',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30',
      icon: <Info className="w-8 h-8 text-white stroke-[2.5]" />,
    },
  };

  const current = config[type] || config.success;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 overflow-hidden text-center p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Floating Top Banner / Icon Circle matching the reference image */}
        <div className="flex justify-center -mt-2 mb-4">
          <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${current.bgHeader} flex items-center justify-center shadow-xl`}>
            {/* Pulsing ring behind icon */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-25 bg-white" />
            <div className="relative z-10 flex items-center justify-center">
              {current.icon}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-xl font-black tracking-tight ${current.titleColor}`}>
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {action ? (
            <>
              <button
                type="button"
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className={`w-full py-3 px-6 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${current.btnBg}`}
              >
                <span>{action.label}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`w-full py-3 px-6 rounded-2xl text-xs font-bold transition-all cursor-pointer ${current.btnBg}`}
            >
              Mengerti / OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
