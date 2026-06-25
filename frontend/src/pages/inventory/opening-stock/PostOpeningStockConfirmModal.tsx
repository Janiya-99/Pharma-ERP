import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "api/inventoryApi";
import StockMovementWarning from "../../../components/inventory/StockMovementWarning";
import { formatNumber, formatCurrency } from "lib/utils";

const PostOpeningStockConfirmModal = ({ isOpen, onClose, entryId, entryInfo, onSuccess }: { isOpen?: boolean; onClose?: any; entryId?: string | number; entryInfo?: any; onSuccess?: any }) => {
  const [posting, setPosting] = useState(false);

  if (!isOpen) return null;

  const handlePost = async () => {
    setPosting(true);
    try {
      await inventoryApi.postOpeningStockEntry(entryId);
      toast.success("Opening Stock posted successfully");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post entry");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-navy-700 bg-indigo-50/50 dark:bg-indigo-900/20">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Post Opening Stock</h2>
        </div>

        <div className="p-6">
          <StockMovementWarning 
            title="Irreversible Action Warning" 
            message="Posting opening stock will permanently update stock balances and create immutable stock ledger entries. This action cannot be edited or deleted after posting." 
          />

          <div className="mt-6 bg-gray-50 dark:bg-navy-900 rounded-xl p-4 border border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Posting Summary:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Quantity</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatNumber(entryInfo?.total_quantity || 0, 3)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Stock Value</p>
                <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
                  {formatCurrency(entryInfo?.total_stock_value || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={posting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePost}
              disabled={posting}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {posting ? "Posting..." : "Confirm & Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostOpeningStockConfirmModal;
