import React, { useState } from "react";
import { MdCancel } from "react-icons/md";

export default function CancelReconciliationModal({ isOpen, onClose, onCancelRec, isSaving }: { isOpen?: boolean; onClose?: unknown; onCancelRec?: unknown; isSaving?: boolean }) {
  const [remarks, setRemarks] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!remarks.trim()) {
      alert("Cancellation remarks are required.");
      return;
    }
    onCancelRec(remarks);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-500">
          <MdCancel className="h-6 w-6" />
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">Cancel Reconciliation</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to cancel this completed reconciliation? 
          The linked transactions will become unreconciled and available again.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cancellation Reason *</label>
            <textarea
              value={remarks}
              onChange={(e: any) => setRemarks(e.target.value)}
              required
              rows="3"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Why is this reconciliation being cancelled?"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
