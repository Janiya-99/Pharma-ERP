import React, { useState } from "react";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";
import { toast } from "react-hot-toast";

interface SubmitStockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferId: string | number | undefined;
  onSuccess: () => void;
}

const SubmitStockTransferModal = ({
  isOpen,
  onClose,
  transferId,
  onSuccess,
}: SubmitStockTransferModalProps) => {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await inventoryApi.submitStockTransfer(transferId, {
        remarks,
      });
      if (res.data?.success !== false) {
        toast.success("Stock Transfer submitted successfully");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to submit stock transfer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Stock Transfer">
      <div className="p-6">
        <p className="mb-4 text-sm text-gray-600 ">
          Are you sure you want to submit this stock transfer for approval? Once
          submitted, it cannot be edited.
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 ">
            Remarks (Optional)
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setRemarks(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500    sm:text-sm"
            placeholder="Add any comments for the approver..."
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50    "
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:ring-4 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SubmitStockTransferModal;
