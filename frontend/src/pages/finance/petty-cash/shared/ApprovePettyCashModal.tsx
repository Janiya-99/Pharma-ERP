import React, { useState } from "react";
import Modal from "../../../../components/common/Modal";

const ApprovePettyCashModal = ({ isOpen, onClose, onApprove, isSubmitting }: { isOpen?: boolean; onClose?: unknown; onApprove?: unknown; isSubmitting?: boolean }) => {
  const [remarks, setRemarks] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onApprove({ remarks });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Record" size="md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Remarks (Optional)
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-navy-900 dark:border-navy-700 dark:text-white sm:text-sm p-2 border"
            rows="3"
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            placeholder="Enter any approval remarks..."
          />
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
            className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Approving..." : "Approve"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApprovePettyCashModal;
