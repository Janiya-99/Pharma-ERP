import { useState } from "react";
import { Search, Calendar as CalendarIcon, Filter } from "lucide-react";
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
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="relative w-full sm:w-[200px]">
        <Select value={branch} onValueChange={handleBranchChange}>
          <SelectTrigger className="h-9 w-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            <SelectItem value="hq">Headquarters</SelectItem>
            <SelectItem value="colombo">Colombo Branch</SelectItem>
            <SelectItem value="kandy">Kandy Branch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative w-full sm:w-[160px]">
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="h-9 w-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="this_quarter">This Quarter</SelectItem>
            <SelectItem value="this_year">This Financial Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
        <Filter className="mr-2 h-4 w-4" />
        More Filters
      </Button>
    </div>
  );
}
