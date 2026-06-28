import React, { useState } from "react";
import Modal from "../../../../components/common/Modal";
import { financeApi } from "../../../../api/financeApi";
import { MdWarning } from "react-icons/md";

export default function PostJournalConfirmModal({
  isOpen,
  onClose,
  journal,
  onSuccess,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  journal?: unknown;
  onSuccess?: unknown;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !journal) return null;

  const handlePost = async () => {
    setLoading(true);
    setError(null);
    try {
      await financeApi.postJournalEntry(journal.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post journal entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Journal Entry">
      <div className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <MdWarning className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
          <div>
            <h4 className="text-sm font-semibold">
              Warning: This action will update account balances.
            </h4>
            <p className="mt-1 text-sm">
              Posting journal entry <strong>{journal.journal_number}</strong>{" "}
              will permanently record the transaction in the general ledger. Are
              you sure you want to proceed?
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Confirm & Post"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
