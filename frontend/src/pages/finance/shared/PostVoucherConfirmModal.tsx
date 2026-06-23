import React, { useState } from "react";
import Modal from "../../../../components/common/Modal";
import { financeApi } from "../../../../api/financeApi";
import { MdWarning } from "react-icons/md";

export default function PostVoucherConfirmModal({ isOpen, onClose, voucher, type, onSuccess }: { isOpen?: boolean; onClose?: unknown; voucher?: unknown; type?: unknown; onSuccess?: unknown }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !voucher) return null;

  const handlePost = async () => {
    setLoading(true);
    setError(null);
    try {
      if (type === "payment") {
        await financeApi.postPaymentVoucher(voucher.id);
      } else if (type === "receipt") {
        await financeApi.postReceiptVoucher(voucher.id);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to post ${type} voucher`);
    } finally {
      setLoading(false);
    }
  };

  const voucherNumber = type === "payment" ? voucher.payment_voucher_number : voucher.receipt_voucher_number;
  const displayType = type === "payment" ? "Payment Voucher" : "Receipt Voucher";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Post ${displayType}`}>
      <div className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        
        <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-md">
          <MdWarning className="h-6 w-6 text-yellow-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Warning: Irreversible Action</p>
            <p>
              You are about to post {displayType.toLowerCase()} <strong>{voucherNumber || "this voucher"}</strong>. 
              Posting will update the account ledger balances immediately.
            </p>
            <p className="mt-2 font-medium">This action cannot be undone and the voucher cannot be edited after posting.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 border rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Confirm Post"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
