import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "api/inventoryApi";
import { MdCheckCircle } from "react-icons/md";

const ApproveOpeningStockModal = ({
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
  const [approving, setApproving] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async (e: any) => {
    e.preventDefault();
    setApproving(true);
    try {
      await inventoryApi.approveOpeningStockEntry(entryId, { remarks });
      toast.success("Opening Stock approved successfully");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve entry");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-navy-700 dark:bg-navy-800">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-green-50/50 px-6 py-4 dark:border-navy-700 dark:bg-green-900/20">
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/50">
            <MdCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Approve Entry
          </h2>
        </div>

        <form onSubmit={handleApprove} className="p-6">
          <div className="mb-6">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to approve this opening stock entry?
              Approved entries can be posted to the stock ledger.
            </p>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e: any) => setRemarks(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              placeholder="Add optional approval notes..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={approving}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={approving}
              className="rounded-xl bg-green-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {approving ? "Approving..." : "Approve Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveOpeningStockModal;
