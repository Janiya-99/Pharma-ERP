import { useState } from "react";
import { toast } from "react-hot-toast";
import { FileCheck, AlertTriangle } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";
import { formatNumber, formatCurrency } from "../../../lib/utils";

const PostStockAdjustmentConfirmModal = ({ isOpen, onClose, adjustment, onSuccess }: { isOpen?: boolean; onClose?: unknown; adjustment?: unknown; onSuccess?: unknown }) => {
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
      toast.error(error.response?.data?.message || "Failed to post stock adjustment");
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
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800 dark:text-orange-300">
            <p className="font-semibold mb-1">Warning: Irreversible Action</p>
            <p>
              Posting stock adjustment will update stock balances and create stock ledger entries. This action cannot be undone or edited after posting.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Adjustment Summary</h4>
          <div className="bg-gray-50 dark:bg-navy-900 rounded-lg p-4 border border-gray-200 dark:border-navy-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Total Quantity In</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {formatNumber(adjustment.total_quantity_in, 3)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Total Quantity Out</span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {formatNumber(adjustment.total_quantity_out, 3)}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-navy-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Total Stock Value Impact</span>
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-navy-800 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Confirm & Post"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PostStockAdjustmentConfirmModal;
