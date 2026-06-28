import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "api/inventoryApi";
import { MdSend } from "react-icons/md";

const SubmitOpeningStockModal = ({
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
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inventoryApi.submitOpeningStockEntry(entryId, { remarks });
      toast.success("Opening Stock submitted for approval");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit entry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-navy-700 dark:bg-navy-800">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-navy-700 dark:bg-navy-900/50">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50">
            <MdSend className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Submit for Approval
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to submit this opening stock entry for
              approval? Once submitted, it can no longer be edited unless
              rejected.
            </p>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e: any) => setRemarks(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              placeholder="Add optional notes..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitOpeningStockModal;
