import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Send } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";

const SubmitStockAdjustmentModal = ({
  isOpen,
  onClose,
  adjustment,
  onSuccess,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  adjustment?: unknown;
  onSuccess?: unknown;
}) => {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryApi.submitStockAdjustment(adjustment.id, { remarks });
      toast.success("Stock adjustment submitted for approval");
      setRemarks("");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit stock adjustment"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!adjustment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Stock Adjustment"
      icon={Send}
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          You are about to submit stock adjustment{" "}
          <strong>{adjustment.adjustment_number}</strong> for approval.
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
            rows={3}
            placeholder="Add any comments..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitStockAdjustmentModal;
