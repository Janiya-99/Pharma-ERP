import { useState } from "react";
import Modal from "../../../../components/common/Modal";
import { financeApi } from "../../../../api/financeApi";
import { MdRestore } from "react-icons/md";

export default function ReverseJournalModal({ isOpen, onClose, journal, onSuccess }: { isOpen?: boolean; onClose?: unknown; journal?: unknown; onSuccess?: unknown }) {
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
        reason 
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reverse journal entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reverse Journal Entry">
      <form onSubmit={handleReverse} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        
        <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200 text-orange-800">
          <MdRestore className="h-6 w-6 shrink-0 text-orange-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Warning: This will create a reversal entry.</h4>
            <p className="text-sm mt-1">
              Reversing journal <strong>{journal.journal_number}</strong> will automatically generate and post a new journal entry with swapped debits and credits. This will update account balances.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reversal Date *</label>
            <input
              type="date"
              value={reversalDate}
              onChange={(e: any) => setReversalDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Reversal *</label>
            <textarea
              value={reason}
              onChange={(e: any) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
              placeholder="Provide a reason for reversing this journal..."
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !reversalDate || !reason.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Reversing..." : "Confirm & Reverse"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
