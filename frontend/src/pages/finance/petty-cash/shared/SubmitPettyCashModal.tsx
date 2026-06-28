import React, { useState } from "react";
import Modal from "../../../../components/common/Modal";

const SubmitPettyCashModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  onSubmit?: unknown;
  isSubmitting?: boolean;
}) => {
  const [remarks, setRemarks] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({ remarks });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit for Approval"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Remarks (Optional)
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white sm:text-sm"
            rows="3"
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            placeholder="Enter any remarks..."
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitPettyCashModal;
