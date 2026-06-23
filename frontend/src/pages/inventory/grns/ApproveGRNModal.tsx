import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { CheckCircle } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";

const ApproveGRNModal = ({ isOpen, onClose, grnId, onSuccess }: { isOpen?: boolean; onClose?: unknown; grnId?: string | number; onSuccess?: unknown }) => {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await inventoryApi.approveGRN(grnId, { remarks });
      toast.success("GRN approved successfully");
      onSuccess();
      onClose();
      setRemarks("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve GRN");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Goods Receipt Note">
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Are you sure you want to approve this GRN? After approval, it will be ready for posting to the stock ledger.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
            placeholder="Add approval notes..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-navy-800 dark:text-gray-300 dark:border-navy-600 dark:hover:bg-navy-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-xl hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {submitting ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveGRNModal;
