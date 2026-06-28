import Input from "./Input";
import { X } from "lucide-react";

const DateRangeFilter = ({ dateFrom, dateTo, onChange }: { dateFrom?: any; dateTo?: any; onChange?: (dates: { dateFrom: any; dateTo: any }) => void }) => {
  const handleClear = () => {
    onChange?.({ dateFrom: "", dateTo: "" });
  };

  const hasValues = dateFrom || dateTo;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-0">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Date From</label>
        <Input
          type="date"
          name="dateFrom"
          value={dateFrom}
          onChange={(e: any) => onChange?.({ dateFrom: e.target.value, dateTo })}
          className="w-full sm:w-40"
        />
      </div>
      <div className="min-w-0">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Date To</label>
        <Input
          type="date"
          name="dateTo"
          value={dateTo}
          onChange={(e: any) => onChange?.({ dateFrom, dateTo: e.target.value })}
          className="w-full sm:w-40"
        />
      </div>
      {hasValues && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          title="Clear Dates"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;
