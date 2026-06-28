import React, { useState } from "react";
import Modal from "../../../../components/common/Modal";
import { financeApi } from "../../../../api/financeApi";
import { MdRestore } from "react-icons/md";

export default function ReverseJournalModal({
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
  const [reversalDate, setReversalDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !journal) return null;

  const handleReverse = async (e: any) => {
    e.preventDefault();
    if (!reversalDate) {
      setError("Reversal Date is required.");
      return;
    }
    if (!reason.trim()) {
      setError("Reason is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await financeApi.reverseJournalEntry(journal.id, {
        reversal_date: reversalDate,
        reason,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reverse journal entry"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reverse Journal Entry">
      <form onSubmit={handleReverse} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <MdRestore className="mt-0.5 h-6 w-6 shrink-0 text-orange-500" />
          <div>
            <h4 className="text-sm font-semibold">
              Warning: This will create a reversal entry.
            </h4>
            <p className="mt-1 text-sm">
              Reversing journal <strong>{journal.journal_number}</strong> will
              automatically generate and post a new journal entry with swapped
              debits and credits. This will update account balances.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reversal Date *
            </label>
            <input
              type="date"
              value={reversalDate}
              onChange={(e: any) => setReversalDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reason for Reversal *
            </label>
            <textarea
              value={reason}
              onChange={(e: any) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
              placeholder="Provide a reason for reversing this journal..."
              required
            />
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
            type="submit"
            disabled={loading || !reversalDate || !reason.trim()}
            className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Reversing..." : "Confirm & Reverse"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
