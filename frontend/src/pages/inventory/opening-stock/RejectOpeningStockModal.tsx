import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "api/inventoryApi";
import { MdCancel } from "react-icons/md";

const RejectOpeningStockModal = ({
  isOpen,
  onClose,
  entryId,
  onSuccess,
}: {
  isOpen?: boolean;
  onClose?: any;
  entryId?: string | number;
  onSuccess?: any;
}) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-navy-700 dark:bg-navy-800">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-red-50/50 px-6 py-4 dark:border-navy-700 dark:bg-red-900/20">
          <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/50">
            <MdCancel className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reject Entry
          </h2>
        </div>

        <form onSubmit={handleReject} className="p-6">
          <div className="mb-6">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to reject this opening stock entry? The
              creator will need to edit and resubmit it.
            </p>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Remarks (Required) *
            </label>
            <textarea
              value={remarks}
              onChange={(e: any) => setRemarks(e.target.value)}
              rows={3}
              className={`w-full rounded-xl border bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                error
                  ? "border-red-500"
                  : "border-gray-200 dark:border-navy-600"
              }`}
              placeholder="Provide a reason for rejection..."
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={rejecting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rejecting}
              className="rounded-xl bg-red-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
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
