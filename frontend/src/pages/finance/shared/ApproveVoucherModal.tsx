import React, { useState } from "react";
import Modal from "../../../../components/common/Modal";
import { financeApi } from "../../../../api/financeApi";

export default function ApproveVoucherModal({
  isOpen,
  onClose,
  voucher,
  type,
  onSuccess,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  voucher?: unknown;
  type?: unknown;
  onSuccess?: unknown;
}) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !voucher) return null;

  const handleApprove = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (type === "payment") {
        await financeApi.approvePaymentVoucher(voucher.id, { remarks });
      } else if (type === "receipt") {
        await financeApi.approveReceiptVoucher(voucher.id, { remarks });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || `Failed to approve ${type} voucher`
      );
    } finally {
      setLoading(false);
    }
  };

  const voucherNumber =
    type === "payment"
      ? voucher.payment_voucher_number
      : voucher.receipt_voucher_number;
  const displayType =
    type === "payment" ? "Payment Voucher" : "Receipt Voucher";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Approve ${displayType}`}>
      <form onSubmit={handleApprove} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <p className="text-sm text-gray-600">
          You are about to approve {displayType.toLowerCase()}{" "}
          <strong>{voucherNumber || "this voucher"}</strong>.
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e: any) => setRemarks(e.target.value)}
            rows={3}
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Add approval remarks..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Approving..." : "Approve Voucher"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
