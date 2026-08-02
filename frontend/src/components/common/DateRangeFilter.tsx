import { X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

const DateRangeFilter = ({ dateFrom, dateTo, onChange }: { dateFrom?: any; dateTo?: any; onChange?: (dates: { dateFrom: any; dateTo: any }) => void }) => {
  const handleClear = () => {
    onChange?.({ dateFrom: "", dateTo: "" });
  };

  const hasValues = dateFrom || dateTo;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-0">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Date From</label>
        <DatePicker
          value={dateFrom}
          onChange={(value) => onChange?.({ dateFrom: value, dateTo })}
          triggerClassName="w-full sm:w-40"
          placeholder="Date from"
        />
      </div>
      <div className="min-w-0">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Date To</label>
        <DatePicker
          value={dateTo}
          onChange={(value) => onChange?.({ dateFrom, dateTo: value })}
          triggerClassName="w-full sm:w-40"
          placeholder="Date to"
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
