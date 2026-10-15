import React from "react";
import { MdAdd } from "react-icons/md";

interface FinancePageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  action?: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}

const FinancePageHeader: React.FC<FinancePageHeaderProps> = ({
  title,
  description,
  subtitle,
  action,
  onAdd,
  addLabel,
}) => {
  const displayDesc = description || subtitle;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-r from-white/95 via-slate-50/90 to-emerald-50/30 backdrop-blur-xl p-5 sm:p-6 shadow-xs mb-6 transition-all duration-300">
      {/* Subtle ambient light */}
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      {/* Subtle geometric SVG watermark */}
      <div className="absolute right-0 top-0 bottom-0 w-64 opacity-[0.035] pointer-events-none select-none text-slate-900 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full object-cover" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M 20,20 L 50,5 L 80,20 L 80,50 L 50,65 L 20,50 Z" />
          <path d="M 80,20 L 110,5 L 140,20 L 140,50 L 110,65 L 80,50 Z" />
          <path d="M 50,65 L 80,50 L 110,65 L 110,95 L 80,110 L 50,95 Z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          {displayDesc && (
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
              {displayDesc}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {action && <div>{action}</div>}
          {!action && onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-700 cursor-pointer"
            >
              <MdAdd className="h-4 w-4" />
              <span>{addLabel || "Add"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancePageHeader;
