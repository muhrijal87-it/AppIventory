import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  className?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  required,
  hint,
  className = '',
  ...props
}) => (
  <div className="flex items-center justify-between mb-1.5">
    <label
      className={`block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1 font-black">*</span>}
    </label>
    {hint && (
      <span className="text-[10px] text-slate-400 font-normal">{hint}</span>
    )}
  </div>
);

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  className = '',
  error,
  icon,
  disabled,
  readOnly,
  ...props
}) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full rounded-xl text-xs transition-all duration-150 shadow-xs ${
          icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5'
        } ${
          readOnly || disabled
            ? 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 cursor-not-allowed'
            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:border-red-500 focus:ring-3 focus:ring-red-500/15 placeholder:text-slate-400'
        } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  className = '',
  children,
  error,
  icon,
  disabled,
  ...props
}) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </div>
      )}
      <select
        disabled={disabled}
        className={`w-full rounded-xl text-xs transition-all duration-150 shadow-xs appearance-none pr-9 ${
          icon ? 'pl-10 py-2.5' : 'px-3.5 py-2.5'
        } ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:border-red-500 focus:ring-3 focus:ring-red-500/15 cursor-pointer font-medium'
        } ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      {error && (
        <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  className = '',
  error,
  disabled,
  ...props
}) => {
  return (
    <div className="relative w-full">
      <textarea
        disabled={disabled}
        className={`w-full rounded-xl px-3.5 py-2.5 text-xs transition-all duration-150 shadow-xs resize-y ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:border-red-500 focus:ring-3 focus:ring-red-500/15 placeholder:text-slate-400'
        } ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
