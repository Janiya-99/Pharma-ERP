import type { ReactNode } from "react";
import { Search, SlidersHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps {
  /** Search input value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Show filter button */
  showFilter?: boolean;
  /** Filter click handler */
  onFilter?: () => void;
  /** Show export button */
  showExport?: boolean;
  /** Export click handler */
  onExport?: () => void;
  /** Record count to display */
  recordCount?: number;
  /** Additional action buttons */
  actions?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Standardized toolbar for data tables.
 * Includes search, filter, export, record count, and custom actions.
 */
export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  showFilter = true,
  onFilter,
  showExport = true,
  onExport,
  recordCount,
  actions,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        "rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-[0_8px_30px_rgba(2,62,138,0.08)] backdrop-blur-xl md:p-4",
        className
      )}
    >
      {/* Left: Search + Filters */}
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        {onSearchChange && (
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4854CC]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-300 bg-white/70 py-2 pl-9 pr-4 text-sm text-[#1F2937] transition-all placeholder:text-[#9CA3AF] focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4854CC]/20"
              aria-label="Search records"
            />
          </div>
        )}

        {/* Filter */}
        {showFilter && (
          <Button
            variant="filter"
            size="sm"
            onClick={onFilter}
            aria-label="Filter records"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </Button>
        )}

        {/* Export */}
        {showExport && (
          <Button
            variant="export"
            size="sm"
            onClick={onExport}
            aria-label="Export records"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        )}

        {actions}
      </div>

      {/* Right: Record count */}
      {recordCount !== undefined && (
        <p className="shrink-0 text-xs font-medium text-[#6B7280]">
          {recordCount} record{recordCount !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
