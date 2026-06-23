import React, { useState } from "react";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";
import { toast } from "react-hot-toast";

const RejectStockTransferModal = ({ isOpen, onClose, transferId, onSuccess }) => {
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
      const res = await inventoryApi.rejectStockTransfer(transferId, { remarks });
      if (res.success !== false) {
        toast.success("Stock Transfer rejected successfully");
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject stock transfer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Stock Transfer">
      <div className="p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Please provide a reason for rejecting this stock transfer.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rejection Remarks *
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (error) setError("");
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-900 dark:border-navy-600 dark:text-white sm:text-sm ${
              error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
            }`}
            placeholder="Reason for rejection..."
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
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
            onClick={handleReject}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectStockTransferModal;
