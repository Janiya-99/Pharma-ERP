import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "api/inventoryApi";
import { MdCancel } from "react-icons/md";

const RejectOpeningStockModal = ({ isOpen, onClose, entryId, onSuccess }: { isOpen?: boolean; onClose?: any; entryId?: string | number; onSuccess?: any }) => {
  const [remarks, setRemarks] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleReject = async (e: any) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError("Remarks are required for rejection");
      return;
    }
    
    setRejecting(true);
    setError("");
    try {
      await inventoryApi.rejectOpeningStockEntry(entryId, { remarks });
      toast.success("Opening Stock rejected successfully");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject entry");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-navy-700 bg-red-50/50 dark:bg-red-900/20 flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
            <MdCancel className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Entry</h2>
        </div>

        <form onSubmit={handleReject} className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to reject this opening stock entry? The creator will need to edit and resubmit it.
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Remarks (Required) *
            </label>
            <textarea
              value={remarks}
              onChange={(e: any) => setRemarks(e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${error ? "border-red-500" : "border-gray-200 dark:border-navy-600"}`}
              placeholder="Provide a reason for rejection..."
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={rejecting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rejecting}
              className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {rejecting ? "Rejecting..." : "Reject Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectOpeningStockModal;
