import { AlertCircle } from "lucide-react";

const TransferQuantityInput = ({ value, onChange, availableQuantity, error }: { value?: unknown; onChange?: unknown; availableQuantity?: unknown; error?: unknown }) => {
  const isExceeding = availableQuantity !== null && parseFloat(value || 0) > parseFloat(availableQuantity || 0);
  const isFullTransfer = availableQuantity !== null && parseFloat(value || 0) === parseFloat(availableQuantity || 0) && parseFloat(value || 0) > 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      <input
        type="number"
        min="0"
        step="0.001"
        value={value === 0 ? "" : value}
        onChange={(e: any) => onChange(e.target.value)}
        className={`w-full px-2 py-1.5 border rounded text-xs text-right bg-white  focus:ring-1 focus:ring-brand-500 ${
          isExceeding || error ? "border-red-500" : "border-gray-200 "
        }`}
        placeholder="Qty"
      />
      {error && <p className="text-[10px] text-red-500">{error}</p>}
      {isExceeding && !error && (
        <p className="text-[10px] text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Exceeds available stock
        </p>
      )}
      {isFullTransfer && !isExceeding && (
        <p className="text-[10px] text-amber-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Full stock transfer
        </p>
      )}
    </div>
  );
};

export default TransferQuantityInput;
