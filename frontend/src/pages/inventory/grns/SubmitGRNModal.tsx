import { useState } from "react";
import { toast } from "react-hot-toast";
import { Send } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import Modal from "../../../components/common/Modal";

const SubmitGRNModal = ({ isOpen, onClose, grnId, onSuccess }: { isOpen?: boolean; onClose?: unknown; grnId?: string | number; onSuccess?: unknown }) => {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await inventoryApi.submitGRN(grnId, { remarks });
      toast.success("GRN submitted for approval");
      onSuccess();
      onClose();
      setRemarks("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit GRN");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Goods Receipt Note">
      <div className="p-4">
        <p className="text-sm text-gray-600  mb-4">
          Are you sure you want to submit this GRN for approval? Once submitted, it cannot be edited unless rejected.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700  mb-1.5">
            Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-900 "
            placeholder="Add any notes..."
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
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-xl hover:bg-yellow-200    disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SubmitGRNModal;
