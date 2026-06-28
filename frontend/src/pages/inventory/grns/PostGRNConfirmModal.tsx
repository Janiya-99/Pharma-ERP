import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FileInput, AlertTriangle } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";
import { formatCurrency, formatNumber } from "../../../lib/utils";

const PostGRNConfirmModal = ({
  isOpen,
  onClose,
  grn,
  onSuccess,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  grn?: unknown;
  onSuccess?: unknown;
}) => {
  const [submitting, setSubmitting] = useState(false);

  if (!grn) return null;

  const newBatchesCount = grn.lines
    ? grn.lines.filter((l: unknown) => l.batch_number && !l.product_batch_id)
        .length
    : 0;

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
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800/50 dark:bg-brand-900/30">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
          <div className="text-sm text-brand-800 dark:text-brand-300">
            <p className="mb-1 font-semibold">Confirm Posting Action</p>
            <p>
              Posting GRN will update stock balances, create stock ledger
              entries, and create new product batches where applicable.
              <strong> This action cannot be edited after posting.</strong>
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-800">
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Posting Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Total Stock Quantity:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatNumber(grn.total_stock_quantity, 3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Total Amount:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(grn.total_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                New Batches to Create:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {newBatchesCount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
          >
            <FileInput className="h-4 w-4" />
            {submitting ? "Posting..." : "Confirm & Post"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PostGRNConfirmModal;
