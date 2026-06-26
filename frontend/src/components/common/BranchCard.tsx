import React from "react";
import { MapPin, Building2, X } from "lucide-react";

export interface BranchData {
  id: number | string;
  branch_code?: string;
  branch_name: string;
  city?: string;
  status?: string;
}

interface BranchCardProps {
  branch: BranchData;
  isSelected: boolean;
  isPrimary?: boolean;
  onToggle: (branch: BranchData) => void;
  onSetPrimary?: (branch: BranchData) => void;
  onRemove?: (branch: BranchData) => void;
  compact?: boolean;
}

const BranchCard = ({
  branch,
  isSelected,
  isPrimary,
  onToggle,
  onSetPrimary,
  onRemove,
  compact = false,
}: BranchCardProps) => {
  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150 ${
          isSelected
            ? "border-indigo-300 bg-indigo-50/40"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <Building2 className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-indigo-500" : "text-gray-400"}`} />
        <span className={`text-sm font-medium ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
          {branch.branch_name}
        </span>
        {isPrimary && (
          <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full ml-auto">
            Primary
          </span>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(branch); }}
            className="ml-auto text-gray-300 hover:text-red-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onToggle(branch)}
      className={`branch-card cursor-pointer ${isSelected ? "branch-card-selected" : "hover:border-gray-300 hover:shadow-sm"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-semibold ${isSelected ? "text-indigo-800" : "text-gray-700"}`}>
              {branch.branch_name}
            </h4>
            {isPrimary && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                Primary
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            {branch.branch_code && (
              <span className="text-[11px] text-gray-400 font-mono">{branch.branch_code}</span>
            )}
            {branch.city && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {branch.city}
              </span>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          {branch.status && (
            <span
              className={`badge-status ${
                branch.status === "active" ? "badge-active" : "badge-inactive"
              }`}
            >
              {branch.status}
            </span>
          )}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(branch)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {isSelected && onSetPrimary && !isPrimary && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSetPrimary(branch);
          }}
          className="mt-2.5 text-[11px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
        >
          Set as primary branch
        </button>
      )}
    </div>
  );
};

export default BranchCard;
