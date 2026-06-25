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

const ApproveStockTransferModal = ({ isOpen, onClose, transferId, onSuccess }: ApproveStockTransferModalProps) => {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await inventoryApi.approveStockTransfer(transferId, { remarks });
      if (res.data?.success !== false) {
        toast.success("Stock Transfer approved successfully");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve stock transfer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Stock Transfer">
      <div className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Are you sure you want to approve this stock transfer?
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Approval Remarks (Optional)
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white sm:text-sm"
            placeholder="Add approval comments..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
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
            onClick={handleApprove}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveStockTransferModal;
