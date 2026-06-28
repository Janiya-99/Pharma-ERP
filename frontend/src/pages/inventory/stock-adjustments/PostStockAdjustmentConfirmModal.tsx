import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FileCheck, AlertTriangle } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";
import { formatNumber, formatCurrency } from "../../../lib/utils";

const PostStockAdjustmentConfirmModal = ({
  isOpen,
  onClose,
  adjustment,
  onSuccess,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  adjustment?: unknown;
  onSuccess?: unknown;
}) => {
  const [loading, setLoading] = useState(false);

  const handlePost = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryApi.postStockAdjustment(adjustment.id);
      toast.success("Stock adjustment posted to stock ledger successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to post stock adjustment"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!adjustment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post Stock Adjustment"
      icon={FileCheck}
    >
      <form onSubmit={handlePost} className="p-6">
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800/30 dark:bg-orange-900/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
          <div className="text-sm text-orange-800 dark:text-orange-300">
            <p className="mb-1 font-semibold">Warning: Irreversible Action</p>
            <p>
              Posting stock adjustment will update stock balances and create
              stock ledger entries. This action cannot be undone or edited after
              posting.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
            Adjustment Summary
          </h4>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                  Total Quantity In
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {formatNumber(adjustment.total_quantity_in, 3)}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                  Total Quantity Out
                </span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {formatNumber(adjustment.total_quantity_out, 3)}
                </span>
              </div>
              <div className="col-span-2 border-t border-gray-200 pt-2 dark:border-navy-700">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                  Total Stock Value Impact
                </span>
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  {formatCurrency(adjustment.total_stock_value)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Posting..." : "Confirm & Post"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PostStockAdjustmentConfirmModal;
