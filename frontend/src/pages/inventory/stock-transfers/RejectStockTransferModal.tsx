import React, { useState } from "react";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";
import { toast } from "react-hot-toast";

interface RejectStockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferId: string | number | undefined;
  onSuccess: () => void;
}

const RejectStockTransferModal = ({
  isOpen,
  onClose,
  transferId,
  onSuccess,
}: RejectStockTransferModalProps) => {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReject = async () => {
    if (!remarks.trim()) {
      setError("Rejection remarks are required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await inventoryApi.rejectStockTransfer(transferId, {
        remarks,
      });
      if (res.data?.success !== false) {
        toast.success("Stock Transfer rejected successfully");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to reject stock transfer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Stock Transfer">
      <div className="p-6">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Please provide a reason for rejecting this stock transfer.
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rejection Remarks *
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setRemarks(e.target.value);
              if (error) setError("");
            }}
            className={`w-full rounded-lg border px-3 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white sm:text-sm ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Reason for rejection..."
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-navy-700"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={submitting}
            className="rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectStockTransferModal;
