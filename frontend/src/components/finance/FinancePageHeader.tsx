import React from "react";
import { Plus } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/30 backdrop-blur-xl p-5 sm:p-6 lg:p-7 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Subtle ambient glows */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-8 -bottom-16 w-56 h-56 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {title}
        </h1>
        {displayDesc && (
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
            {displayDesc}
          </p>
        )}
      </div>
      <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
        {action && <div>{action}</div>}
        {!action && onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>{addLabel || "Add"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FinancePageHeader;
