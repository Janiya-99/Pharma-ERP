import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { XCircle } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";

const RejectStockAdjustmentModal = ({ isOpen, onClose, adjustment, onSuccess }: { isOpen?: boolean; onClose?: unknown; adjustment?: unknown; onSuccess?: unknown }) => {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReject = async (e: any) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError("Remarks are required for rejection");
      return;
    }

    setLoading(true);
    try {
      await inventoryApi.rejectStockAdjustment(adjustment.id, { remarks });
      toast.success("Stock adjustment rejected successfully");
      setRemarks("");
      setError("");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject stock adjustment");
    } finally {
      setLoading(false);
    }
  };

  if (!adjustment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Stock Adjustment"
      icon={XCircle}
    >
      <form onSubmit={handleReject} className="p-6">
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to reject stock adjustment <strong>{adjustment.adjustment_number}</strong>?
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rejection Reason *
          </label>
          <textarea
            value={remarks}
            onChange={(e: any) => {
              setRemarks(e.target.value);
              if (error) setError("");
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
              error ? "border-red-500" : "border-gray-200 dark:border-navy-600"
            }`}
            rows={3}
            placeholder="Please provide a reason for rejection..."
            required
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-navy-800 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !remarks.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectStockAdjustmentModal;
