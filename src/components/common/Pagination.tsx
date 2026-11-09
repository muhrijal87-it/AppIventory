import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  colorScheme?: 'red' | 'emerald' | 'orange' | 'purple' | 'indigo' | 'slate';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  colorScheme = 'slate'
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const schemeStyles = {
    red: 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 active:bg-red-200 border-red-100 dark:border-red-900/50',
    emerald: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 active:bg-emerald-200 border-emerald-100 dark:border-emerald-900/50',
    orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-900/30 active:bg-orange-200 border-orange-100 dark:border-orange-900/50',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-900/30 active:bg-purple-200 border-purple-100 dark:border-purple-900/50',
    indigo: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 active:bg-indigo-200 border-indigo-100 dark:border-indigo-900/50',
    slate: 'text-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 active:bg-slate-200 border-slate-200 dark:border-slate-800'
  };

  const activeStyles = {
    red: 'bg-red-600 text-white border-red-600',
    emerald: 'bg-emerald-600 text-white border-emerald-600',
    orange: 'bg-orange-600 text-white border-orange-600',
    purple: 'bg-purple-600 text-white border-purple-600',
    indigo: 'bg-indigo-600 text-white border-indigo-600',
    slate: 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        Showing <span className="text-slate-900 dark:text-slate-200">{startItem}-{endItem}</span> of <span className="text-slate-900 dark:text-slate-200">{totalItems}</span> Records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded-xl border transition-all ${schemeStyles[colorScheme]} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, idx) => (
          typeof page === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 px-2 rounded-xl text-[11px] font-black border transition-all ${
                currentPage === page 
                  ? activeStyles[colorScheme]
                  : schemeStyles[colorScheme]
              }`}
            >
              {page}
            </button>
          ) : (
            <div key={idx} className="w-8 h-8 flex items-center justify-center text-slate-400">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1.5 rounded-xl border transition-all ${schemeStyles[colorScheme]} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
