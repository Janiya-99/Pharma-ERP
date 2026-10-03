import React from "react";
import { Search, Download, Plus, Settings2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  onExport?: () => void;
  statusFilter?: boolean;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  showMonths?: boolean;
  activeMonth?: string;
  onMonthChange?: (month: string) => void;
  customFilters?: React.ReactNode;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

export function DataTableToolbar({
  searchQuery,
  onSearchChange,
  onAdd,
  onExport,
  statusFilter,
  statusValue,
  onStatusChange,
  showMonths = false,
  activeMonth = "Jul",
  onMonthChange,
  customFilters,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col border-b border-slate-200 bg-white pt-4">
      {/* Top Row: Filters & Actions */}
      <div className="flex flex-col gap-4 px-6 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-slate-600">Filter by</span>
          
          {customFilters}
          
          {/* Main Filter Dropdown (e.g. This month or Status) */}
          <div className="w-40">
            {statusFilter ? (
              <Select value={statusValue} onValueChange={onStatusChange}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select defaultValue="this_month">
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_month">This month</SelectItem>
                  <SelectItem value="last_month">Last month</SelectItem>
                  <SelectItem value="this_year">This year</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Tags / Search Input */}
          <div className="relative w-full sm:w-64">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search or Select tags..."
              className="h-9 pl-9 w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
          >
            <Search className="h-4 w-4" />
          </Button>
          {onExport && (
            <Button
              variant="outline"
              size="icon"
              onClick={onExport}
              className="h-9 w-9 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onAdd && (
            <Button
              variant="outline"
              size="icon"
              onClick={onAdd}
              className="h-9 w-9 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Row: Month Tabs (Optional) */}
      {showMonths && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between overflow-x-auto px-6 pb-0 scrollbar-hide">
          <div className="flex items-center">
            {/* Year Block */}
            <div className="flex h-10 items-center justify-center border border-b-0 border-slate-200 px-4 text-sm font-medium text-slate-700 bg-white">
              2024
            </div>
            
            {/* Months */}
            {MONTHS.map((month) => {
              const isActive = activeMonth === month;
              return (
                <button
                  key={month}
                  onClick={() => onMonthChange?.(month)}
                  className={cn(
                    "flex h-10 items-center justify-center border-t border-r border-slate-200 px-4 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50/50 text-indigo-700 border-b-0"
                      : "bg-white text-slate-500 hover:bg-slate-50 border-b border-transparent hover:text-slate-700"
                  )}
                  style={{
                    borderBottomColor: isActive ? "transparent" : "#e2e8f0"
                  }}
                >
                  {month}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 border-slate-200 text-xs font-medium text-slate-600 sm:mb-1 self-start sm:self-auto"
          >
            <Settings2 className="mr-2 h-3.5 w-3.5" />
            Edit columns
          </Button>
        </div>
      )}
    </div>
  );
}
