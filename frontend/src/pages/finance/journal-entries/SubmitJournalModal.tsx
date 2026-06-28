import React, { useState } from "react";
import Modal from "../../../../components/common/Modal";
import { financeApi } from "../../../../api/financeApi";

export default function SubmitJournalModal({
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
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !journal) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await financeApi.submitJournalEntry(journal.id, { remarks });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit journal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Journal Entry">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <p className="text-sm text-gray-600">
          You are about to submit journal entry{" "}
          <strong>{journal.journal_number}</strong> for approval.
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            rows={3}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
            placeholder="Add any remarks..."
          />
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
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
