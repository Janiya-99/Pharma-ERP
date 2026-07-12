import { MdCheckCircle } from "react-icons/md";

export default function CompleteReconciliationModal({ isOpen, onClose, onComplete, isSaving }: { isOpen?: boolean; onClose?: unknown; onComplete?: unknown; isSaving?: boolean }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white  p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center gap-3 mb-4 text-green-600 ">
          <MdCheckCircle className="h-6 w-6" />
          <h3 className="text-lg font-bold text-navy-700 ">Complete Reconciliation</h3>
        </div>
        
        <p className="text-sm text-gray-600  mb-6">
          Are you sure you want to complete this reconciliation? 
          Once completed, the reconciliation and its linked transactions will be locked from further edits.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? "Completing..." : "Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
