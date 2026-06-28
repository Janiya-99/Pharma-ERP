import React from "react";
import { MdCheckCircle } from "react-icons/md";

export default function CompleteReconciliationModal({
  isOpen,
  onClose,
  onComplete,
  isSaving,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  onComplete?: unknown;
  isSaving?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-navy-800">
        <div className="mb-4 flex items-center gap-3 text-green-600 dark:text-green-500">
          <MdCheckCircle className="h-6 w-6" />
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">
            Complete Reconciliation
          </h3>
        </div>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to complete this reconciliation? Once completed,
          the reconciliation and its linked transactions will be locked from
          further edits.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? "Completing..." : "Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
