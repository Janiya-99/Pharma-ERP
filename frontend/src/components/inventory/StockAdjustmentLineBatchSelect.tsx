import { useState, useEffect, useRef } from "react";
import { Search, Layers, AlertCircle } from "lucide-react";
import { formatDate } from "../../lib/utils";

const StockAdjustmentLineBatchSelect = ({
  value,
  onChange,
  batches = [],
  error,
  disabled = false,
}: { value?: unknown; onChange?: unknown; batches?: unknown; error?: unknown; disabled?: unknown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedBatch = batches.find((b: unknown) => b.id === value);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBatches = batches.filter(
    (b: unknown) =>
      b.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.batch_status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (batch: unknown) => {
    onChange(batch);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getStatusColor = (status: unknown, isBlocked: boolean) => {
    if (isBlocked) return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "near_expiry":
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
      case "expired":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-left bg-white dark:bg-navy-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors ${
          error
            ? "border-red-300 dark:border-red-500/50"
            : "border-gray-200 dark:border-navy-600"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-navy-800" : "hover:border-brand-300 dark:hover:border-navy-500"}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedBatch ? (
            <>
              <div className="flex-shrink-0 w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="truncate">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedBatch.batch_number}
                </span>
                {selectedBatch.expiry_date && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    Exp: {formatDate(selectedBatch.expiry_date)}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Select Batch...
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-[300px] mt-1 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-lg shadow-brand-500/5 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search batch number..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:text-white"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-navy-600 p-1">
            {filteredBatches.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <p>No batches found</p>
              </div>
            ) : (
              filteredBatches.map((b: unknown) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelect(b)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3 ${
                    value === b.id
                      ? "bg-indigo-50 dark:bg-navy-700 border border-indigo-100 dark:border-navy-600"
                      : "hover:bg-gray-50 dark:hover:bg-navy-700/50 border border-transparent"
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-navy-900 flex items-center justify-center border border-gray-200 dark:border-navy-600">
                    <Layers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {b.batch_number}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(b.batch_status, b.is_blocked)}`}>
                        {b.is_blocked ? "BLOCKED" : (b.batch_status?.toUpperCase() || "UNKNOWN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {b.manufacture_date && <span>Mfg: {formatDate(b.manufacture_date)}</span>}
                      {b.expiry_date && <span>Exp: {formatDate(b.expiry_date)}</span>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAdjustmentLineBatchSelect;
