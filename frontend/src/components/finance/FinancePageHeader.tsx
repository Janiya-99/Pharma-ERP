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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
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
