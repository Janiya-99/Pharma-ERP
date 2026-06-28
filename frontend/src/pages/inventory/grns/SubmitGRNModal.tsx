import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Send } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";

const SubmitGRNModal = ({
  isOpen,
  onClose,
  grnId,
  onSuccess,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  grnId?: string | number;
  onSuccess?: unknown;
}) => {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await inventoryApi.submitGRN(grnId, { remarks });
      toast.success("GRN submitted for approval");
      onSuccess();
      onClose();
      setRemarks("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit GRN");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Goods Receipt Note">
      <div className="p-4">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to submit this GRN for approval? Once submitted,
          it cannot be edited unless rejected.
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
            placeholder="Add any notes..."
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 dark:bg-yellow-900 dark:text-yellow-100 dark:hover:bg-yellow-800"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SubmitGRNModal;
