import { useState } from "react";
import Modal from "../../components/common/Modal";

export const PostDepreciationConfirmModal = ({ isOpen, onClose, onConfirm, loading }: { isOpen?: boolean; onClose?: unknown; onConfirm?: unknown; loading?: unknown }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Depreciation Run">
      <div className="p-4 bg-yellow-50  rounded-xl border border-yellow-200  mb-6">
        <h4 className="text-sm font-bold text-yellow-800  mb-2">Warning</h4>
        <p className="text-sm text-yellow-700 ">
          Posting depreciation will irrevocably update the asset's accumulated depreciation, net book value, and chart of account balances. This action cannot be reversed.
        </p>
      </div>
      <p className="text-sm text-gray-700  mb-6">
        Are you sure you want to post this depreciation run?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50    "
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-bold text-white transition-all bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Posting..." : "Confirm Post"}
        </button>
      </div>
    </Modal>
  );
};

export const PostDisposalConfirmModal = ({ isOpen, onClose, onConfirm, loading }: { isOpen?: boolean; onClose?: unknown; onConfirm?: unknown; loading?: unknown }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Asset Disposal">
      <div className="p-4 bg-yellow-50  rounded-xl border border-yellow-200  mb-6">
        <h4 className="text-sm font-bold text-yellow-800  mb-2">Warning</h4>
        <p className="text-sm text-yellow-700 ">
          Posting this disposal will update the asset status and chart of account balances. This cannot be edited after posting.
        </p>
      </div>
      <p className="text-sm text-gray-700  mb-6">
        Are you sure you want to post this disposal?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50    "
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-bold text-white transition-all bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Posting..." : "Confirm Post"}
        </button>
      </div>
    </Modal>
  );
};

export const ActionDisposalModal = ({ isOpen, onClose, onConfirm, loading, title, actionLabel, colorClass, requireRemarks }: { isOpen?: boolean; onClose?: unknown; onConfirm?: unknown; loading?: unknown; title?: unknown; actionLabel?: unknown; colorClass?: unknown; requireRemarks?: unknown }) => {
  const [remarks, setRemarks] = useState("");

  const handleConfirm = () => {
    onConfirm(remarks);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700  mb-1">
          Remarks {requireRemarks && <span className="text-red-500">*</span>}
        </label>
        <textarea
          className={`w-full p-2.5 border rounded-xl outline-none focus:border-brand-500 bg-white    transition-all`}
          rows="3"
          placeholder="Enter remarks..."
          value={remarks}
          onChange={(e: any) => setRemarks(e.target.value)}
        ></textarea>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50    "
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 text-sm font-bold text-white transition-all rounded-xl disabled:opacity-50 ${colorClass}`}
          disabled={loading || (requireRemarks && !remarks.trim())}
        >
          {loading ? "Processing..." : actionLabel}
        </button>
      </div>
    </Modal>
  );
};
