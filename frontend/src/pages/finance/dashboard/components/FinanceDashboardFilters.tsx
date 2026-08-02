import { useState } from "react";
import { Search, Calendar as CalendarIcon, Filter, MapPin, CalendarDays, SlidersHorizontal } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

interface FinanceDashboardFiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export function FinanceDashboardFilters({ onFilterChange }: FinanceDashboardFiltersProps) {
  const [period, setPeriod] = useState("this_month");
  const [branch, setBranch] = useState("all");

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    onFilterChange({ period_type: value, branch_id: branch === "all" ? "" : branch });
  };

  const handleBranchChange = (value: string) => {
    setBranch(value);
    onFilterChange({ period_type: period, branch_id: value === "all" ? "" : value });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      
      {/* Branch Filter */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <div className="flex shrink-0 items-center justify-center text-slate-400">
          <MapPin className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="relative w-full sm:w-[180px]">
          <Select value={branch} onValueChange={handleBranchChange}>
            <SelectTrigger className="h-10 w-full bg-slate-50 hover:bg-slate-100 transition-colors border-0 ring-1 ring-inset ring-slate-200/50 rounded-xl text-slate-700 font-medium shadow-sm focus:ring-2 focus:ring-indigo-500/20">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="hq">Headquarters</SelectItem>
              <SelectItem value="colombo">Colombo Branch</SelectItem>
              <SelectItem value="kandy">Kandy Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <div className="relative w-full sm:w-[150px]">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="h-10 w-full bg-slate-50 hover:bg-slate-100 transition-colors border-0 ring-1 ring-inset ring-slate-200/50 rounded-xl text-slate-700 font-medium shadow-sm focus:ring-2 focus:ring-indigo-500/20">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Financial Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button variant="outline" size="sm" className="h-10 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all w-full sm:w-auto">
        <SlidersHorizontal className="mr-2 h-4 w-4" strokeWidth={1.5} />
        More Filters
      </Button>
    </div>
  );
}
