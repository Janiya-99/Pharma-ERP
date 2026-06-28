import { useState } from "react";
import Modal from "../../../../components/common/Modal";
import { financeApi } from "../../../../api/financeApi";

export default function RejectJournalModal({ isOpen, onClose, journal, onSuccess }: { isOpen?: boolean; onClose?: unknown; journal?: unknown; onSuccess?: unknown }) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !journal) return null;

  const handleReject = async (e: any) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError("Remarks are required when rejecting a journal entry.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await financeApi.rejectJournalEntry(journal.id, { remarks });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject journal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Journal Entry">
      <form onSubmit={handleReject} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        <p className="text-sm text-gray-600">
          Are you sure you want to reject journal entry <strong>{journal.journal_number}</strong>?
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks *</label>
          <textarea
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
            placeholder="Please provide a reason for rejection..."
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !remarks.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Rejecting..." : "Reject Journal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
