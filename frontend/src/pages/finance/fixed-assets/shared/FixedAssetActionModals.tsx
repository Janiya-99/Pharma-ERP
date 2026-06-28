import React, { useState } from "react";
import Modal from "../../components/common/Modal";

export const PostDepreciationConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  onConfirm?: unknown;
  loading?: unknown;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Depreciation Run">
      <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700/30 dark:bg-yellow-900/20">
        <h4 className="mb-2 text-sm font-bold text-yellow-800 dark:text-yellow-500">
          Warning
        </h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-600">
          Posting depreciation will irrevocably update the asset's accumulated
          depreciation, net book value, and chart of account balances. This
          action cannot be reversed.
        </p>
      </div>
      <p className="mb-6 text-sm text-gray-700 dark:text-gray-300">
        Are you sure you want to post this depreciation run?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-brand-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Posting..." : "Confirm Post"}
        </button>
      </div>
    </Modal>
  );
};

export const PostDisposalConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  onConfirm?: unknown;
  loading?: unknown;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Asset Disposal">
      <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700/30 dark:bg-yellow-900/20">
        <h4 className="mb-2 text-sm font-bold text-yellow-800 dark:text-yellow-500">
          Warning
        </h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-600">
          Posting this disposal will update the asset status and chart of
          account balances. This cannot be edited after posting.
        </p>
      </div>
      <p className="mb-6 text-sm text-gray-700 dark:text-gray-300">
        Are you sure you want to post this disposal?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-brand-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Posting..." : "Confirm Post"}
        </button>
      </div>
    </Modal>
  );
};

export const ActionDisposalModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  actionLabel,
  colorClass,
  requireRemarks,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  onConfirm?: unknown;
  loading?: unknown;
  title?: unknown;
  actionLabel?: unknown;
  colorClass?: unknown;
  requireRemarks?: unknown;
}) => {
  const [remarks, setRemarks] = useState("");

  const handleConfirm = () => {
    onConfirm(remarks);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Remarks {requireRemarks && <span className="text-red-500">*</span>}
        </label>
        <textarea
          className={`w-full rounded-xl border bg-white p-2.5 outline-none transition-all focus:border-brand-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white`}
          rows="3"
          placeholder="Enter remarks..."
          value={remarks}
          onChange={(e: any) => setRemarks(e.target.value)}
        ></textarea>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition-all disabled:opacity-50 ${colorClass}`}
          disabled={loading || (requireRemarks && !remarks.trim())}
        >
          {loading ? "Processing..." : actionLabel}
        </button>
      </div>
    </Modal>
  );
};
