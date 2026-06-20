import React from "react";
import Input from "./Input";
import { X } from "lucide-react";

const DateRangeFilter = ({ dateFrom, dateTo, onChange }) => {
  const handleClear = () => {
    onChange({ dateFrom: "", dateTo: "" });
  };

  const hasValues = dateFrom || dateTo;

  return (
    <div className="flex flex-col sm:flex-row items-end gap-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
        <Input
          type="date"
          name="dateFrom"
          value={dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value, dateTo })}
          className="w-full sm:w-auto"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
        <Input
          type="date"
          name="dateTo"
          value={dateTo}
          onChange={(e) => onChange({ dateFrom, dateTo: e.target.value })}
          className="w-full sm:w-auto"
        />
      </div>
      {hasValues && (
        <button
          type="button"
          onClick={handleClear}
          className="mb-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Clear Dates"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;
