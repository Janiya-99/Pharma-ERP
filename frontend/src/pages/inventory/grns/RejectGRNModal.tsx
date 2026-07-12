import { useState } from "react";
import { toast } from "react-hot-toast";
import { XCircle } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";

const RejectGRNModal = ({ isOpen, onClose, grnId, onSuccess }: { isOpen?: boolean; onClose?: unknown; grnId?: string | number; onSuccess?: unknown }) => {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error("Remarks are required for rejection");
      return;
    }

    setSubmitting(true);
    try {
      await inventoryApi.rejectGRN(grnId, { remarks });
      toast.success("GRN rejected successfully");
      onSuccess();
      onClose();
      setRemarks("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject GRN");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Goods Receipt Note">
      <div className="p-4">
        <p className="text-sm text-gray-600  mb-4">
          Are you sure you want to reject this GRN? Please provide a reason below.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700  mb-1.5">
            Remarks (Required) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900 "
            placeholder="Reason for rejection..."
            required
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50     disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={submitting || !remarks.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            {submitting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectGRNModal;
