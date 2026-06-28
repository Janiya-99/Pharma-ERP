import React, { useState } from "react";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";
import { toast } from "react-hot-toast";

interface ApproveStockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferId: string | number | undefined;
  onSuccess: () => void;
}

const ApproveStockTransferModal = ({
  isOpen,
  onClose,
  transferId,
  onSuccess,
}: ApproveStockTransferModalProps) => {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await inventoryApi.approveStockTransfer(transferId, {
        remarks,
      });
      if (res.data?.success !== false) {
        toast.success("Stock Transfer approved successfully");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to approve stock transfer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Stock Transfer">
      <div className="p-6">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to approve this stock transfer?
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Approval Remarks (Optional)
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setRemarks(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white sm:text-sm"
            placeholder="Add approval comments..."
          />
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
            onClick={handleApprove}
            disabled={submitting}
            className="rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveStockTransferModal;
