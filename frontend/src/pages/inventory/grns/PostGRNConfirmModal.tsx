import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FileInput, AlertTriangle } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";
import { formatCurrency, formatNumber } from "../../../lib/utils";

const PostGRNConfirmModal = ({ isOpen, onClose, grn, onSuccess }: { isOpen?: boolean; onClose?: unknown; grn?: unknown; onSuccess?: unknown }) => {
  const [submitting, setSubmitting] = useState(false);

  if (!grn) return null;

  const newBatchesCount = grn.lines ? grn.lines.filter((l: unknown) => l.batch_number && !l.product_batch_id).length : 0;

  const handlePost = async () => {
    setSubmitting(true);
    try {
      await inventoryApi.postGRN(grn.id);
      toast.success("GRN posted successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post GRN");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Goods Receipt Note">
      <div className="p-4">
        <div className="flex items-start gap-3 p-4 mb-6 bg-brand-50 border border-brand-200 rounded-xl dark:bg-brand-900/30 dark:border-brand-800/50">
          <AlertTriangle className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <div className="text-sm text-brand-800 dark:text-brand-300">
            <p className="font-semibold mb-1">Confirm Posting Action</p>
            <p>
              Posting GRN will update stock balances, create stock ledger entries, and create new product batches where applicable. 
              <strong> This action cannot be edited after posting.</strong>
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-navy-800 rounded-xl p-4 border border-gray-100 dark:border-navy-700 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Posting Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Stock Quantity:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatNumber(grn.total_stock_quantity, 3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(grn.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">New Batches to Create:</span>
              <span className="font-medium text-gray-900 dark:text-white">{newBatchesCount}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-navy-800 dark:text-gray-300 dark:border-navy-600 dark:hover:bg-navy-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50 shadow-sm"
          >
            <FileInput className="w-4 h-4" />
            {submitting ? "Posting..." : "Confirm & Post"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PostGRNConfirmModal;
