import { useState } from "react";
import Modal from "../../../../components/common/Modal";

const RejectPettyCashModal = ({ isOpen, onClose, onReject, isSubmitting }: { isOpen?: boolean; onClose?: unknown; onReject?: unknown; isSubmitting?: boolean }) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError("Remarks are required for rejection.");
      return;
    }
    setError("");
    onReject({ remarks });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Record" size="md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Remarks (Required)
          </label>
          <textarea
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 border ${
              error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-red-500 focus:ring-red-500"
            } dark:bg-navy-900 dark:border-navy-700 dark:text-white`}
            rows="3"
            value={remarks}
            onChange={(e: any) => {
              setRemarks(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter reason for rejection..."
            required
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-navy-800 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectPettyCashModal;
