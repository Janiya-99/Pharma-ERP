import React, { useState } from "react";
import Modal from "../../../../components/common/Modal";
import { financeApi } from "../../../../api/financeApi";

export default function RejectVoucherModal({ isOpen, onClose, voucher, type, onSuccess }: { isOpen?: boolean; onClose?: unknown; voucher?: unknown; type?: unknown; onSuccess?: unknown }) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !voucher) return null;

  const handleReject = async (e: any) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError("Remarks are required for rejection");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (type === "payment") {
        await financeApi.rejectPaymentVoucher(voucher.id, { remarks });
      } else if (type === "receipt") {
        await financeApi.rejectReceiptVoucher(voucher.id, { remarks });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to reject ${type} voucher`);
    } finally {
      setLoading(false);
    }
  };

  const voucherNumber = type === "payment" ? voucher.payment_voucher_number : voucher.receipt_voucher_number;
  const displayType = type === "payment" ? "Payment Voucher" : "Receipt Voucher";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reject ${displayType}`}>
      <form onSubmit={handleReject} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        <p className="text-sm text-gray-600">
          You are about to reject {displayType.toLowerCase()} <strong>{voucherNumber || "this voucher"}</strong>.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Please provide a reason for rejecting this voucher..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !remarks.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Rejecting..." : "Reject Voucher"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
