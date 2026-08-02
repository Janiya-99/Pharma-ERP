import { useState } from "react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "api/inventoryApi";
import { MdCheckCircle } from "react-icons/md";

const ApproveOpeningStockModal = ({ isOpen, onClose, entryId, onSuccess }: { isOpen?: boolean; onClose?: any; entryId?: string | number; onSuccess?: any }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white  rounded-2xl shadow-xl border border-gray-100  overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100  bg-green-50/50  flex items-center gap-3">
          <div className="p-2 bg-green-100  rounded-lg">
            <MdCheckCircle className="h-5 w-5 text-green-600 " />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 ">Approve Entry</h2>
        </div>

        <form onSubmit={handleApprove} className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600  mb-4">
              Are you sure you want to approve this opening stock entry? Approved entries can be posted to the stock ledger.
            </p>
            <label className="block text-sm font-medium text-gray-700  mb-1.5">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e: any) => setRemarks(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900 "
              placeholder="Add optional approval notes..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 ">
            <button
              type="button"
              onClick={onClose}
              disabled={approving}
              className="px-4 py-2 text-sm font-medium text-gray-700  hover:bg-gray-100  rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={approving}
              className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
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
