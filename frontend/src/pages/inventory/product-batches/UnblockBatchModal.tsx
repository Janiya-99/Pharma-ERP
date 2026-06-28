import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";

const UnblockBatchModal = ({
  isOpen,
  onClose,
  onSave,
  batch,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  onSave?: unknown;
  batch?: unknown;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inventoryApi.unblockProductBatch(batch.id);
      toast.success("Batch unblocked successfully");
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unblock Batch">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to unblock batch{" "}
          <span className="font-semibold">{batch?.batch_number}</span>?
        </p>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Confirm Unblock
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default UnblockBatchModal;
