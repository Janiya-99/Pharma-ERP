import React, { useState } from "react";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";
import { toast } from "react-hot-toast";
import { formatNumber, formatCurrency } from "../../../lib/utils";
import { AlertTriangle, Info } from "lucide-react";

const PostStockTransferConfirmModal = ({ isOpen, onClose, transfer, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const handlePost = async () => {
    setSubmitting(true);
    try {
      const res = await inventoryApi.postStockTransfer(transfer.id);
      if (res.success !== false) {
        toast.success("Stock Transfer posted successfully");
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post stock transfer");
    } finally {
      setSubmitting(false);
    }
  };

  if (!transfer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Stock Transfer">
      <div className="p-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">Warning: Irreversible Action</p>
            <p>
              Posting this stock transfer will permanently deduct stock from the source warehouse and increment stock in the destination warehouse. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-navy-800 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Transfer Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Source:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {transfer.source_warehouse?.warehouse_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Destination:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {transfer.destination_warehouse?.warehouse_name}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-navy-700 pt-2 mt-2">
              <span className="text-gray-500">Total Items:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatNumber(transfer.total_quantity, 3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Value:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(transfer.total_stock_value)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-navy-800 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting..." : "Confirm & Post"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PostStockTransferConfirmModal;
