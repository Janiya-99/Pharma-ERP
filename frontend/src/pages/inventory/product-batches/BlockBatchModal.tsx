import { useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";

const BlockBatchModal = ({ isOpen, onClose, onSave, batch }: { isOpen?: boolean; onClose?: unknown; onSave?: unknown; batch?: unknown }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryApi.blockProductBatch(batch.id, { block_reason: reason });
      toast.success("Batch blocked successfully");
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Block Batch">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 h-full">
        <p className="text-sm text-gray-600 ">
          Blocking batch <span className="font-semibold">{batch?.batch_number}</span> will prevent it from being used in any future transactions.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-1">
            Reason for Blocking <span className="text-red-500">*</span>
          </label>
          <textarea required rows={3} value={reason} onChange={(e: any) => setReason(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-xl text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm disabled:opacity-50">Confirm Block</button>
        </div>
      </form>
    </Modal>
  );
};
export default BlockBatchModal;
