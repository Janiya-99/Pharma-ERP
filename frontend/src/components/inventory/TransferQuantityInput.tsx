import React from "react";
import { AlertCircle } from "lucide-react";

const TransferQuantityInput = ({
  value,
  onChange,
  availableQuantity,
  error,
}: {
  value?: unknown;
  onChange?: unknown;
  availableQuantity?: unknown;
  error?: unknown;
}) => {
  const isExceeding =
    availableQuantity !== null &&
    parseFloat(value || 0) > parseFloat(availableQuantity || 0);
  const isFullTransfer =
    availableQuantity !== null &&
    parseFloat(value || 0) === parseFloat(availableQuantity || 0) &&
    parseFloat(value || 0) > 0;

  return (
    <div className="flex w-full flex-col gap-1">
      <input
        type="number"
        min="0"
        step="0.001"
        value={value === 0 ? "" : value}
        onChange={(e: any) => onChange(e.target.value)}
        className={`w-full rounded border bg-white px-2 py-1.5 text-right text-xs focus:ring-1 focus:ring-brand-500 dark:bg-navy-900 ${
          isExceeding || error
            ? "border-red-500"
            : "border-gray-200 dark:border-navy-600"
        }`}
        placeholder="Qty"
      />
      {error && <p className="text-[10px] text-red-500">{error}</p>}
      {isExceeding && !error && (
        <p className="flex items-center gap-1 text-[10px] text-red-500">
          <AlertCircle className="h-3 w-3" /> Exceeds available stock
        </p>
      )}
      {isFullTransfer && !isExceeding && (
        <p className="flex items-center gap-1 text-[10px] text-amber-500">
          <AlertCircle className="h-3 w-3" /> Full stock transfer
        </p>
      )}
    </div>
  );
};

export default TransferQuantityInput;
