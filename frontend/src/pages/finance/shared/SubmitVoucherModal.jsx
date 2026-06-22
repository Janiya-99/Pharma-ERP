import React, { useState } from "react";
import Modal from "../../../../components/common/Modal";
import { financeApi } from "../../../../api/financeApi";

export default function SubmitVoucherModal({ isOpen, onClose, voucher, type, onSuccess }) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !voucher) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (type === "payment") {
        await financeApi.submitPaymentVoucher(voucher.id, { remarks });
      } else if (type === "receipt") {
        await financeApi.submitReceiptVoucher(voucher.id, { remarks });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to submit ${type} voucher`);
    } finally {
      setLoading(false);
    }
  };

  const voucherNumber = type === "payment" ? voucher.payment_voucher_number : voucher.receipt_voucher_number;
  const displayType = type === "payment" ? "Payment Voucher" : "Receipt Voucher";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Submit ${displayType}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        <p className="text-sm text-gray-600">
          You are about to submit {displayType.toLowerCase()} <strong>{voucherNumber || "this voucher"}</strong> for approval.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
            placeholder="Add any remarks..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
