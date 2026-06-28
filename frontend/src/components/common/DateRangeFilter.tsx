import React from "react";
import Input from "./Input";
import { X } from "lucide-react";

const DateRangeFilter = ({
  dateFrom,
  dateTo,
  onChange,
}: {
  dateFrom?: any;
  dateTo?: any;
  onChange?: (dates: { dateFrom: any; dateTo: any }) => void;
}) => {
  const handleClear = () => {
    onChange?.({ dateFrom: "", dateTo: "" });
  };

  const hasValues = dateFrom || dateTo;

  return (
    <div className="border-slate-200 bg-slate-50/80 flex flex-col gap-3 rounded-2xl border p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-0">
        <label className="text-slate-500 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em]">
          Date From
        </label>
        <Input
          type="date"
          name="dateFrom"
          value={dateFrom}
          onChange={(e: any) =>
            onChange?.({ dateFrom: e.target.value, dateTo })
          }
          className="w-full sm:w-40"
        />
      </div>
      <div className="min-w-0">
        <label className="text-slate-500 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em]">
          Date To
        </label>
        <Input
          type="date"
          name="dateTo"
          value={dateTo}
          onChange={(e: any) =>
            onChange?.({ dateFrom, dateTo: e.target.value })
          }
          className="w-full sm:w-40"
        />
      </div>
      {hasValues && (
        <button
          type="button"
          onClick={handleClear}
          className="border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm transition-colors"
          title="Clear Dates"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;
