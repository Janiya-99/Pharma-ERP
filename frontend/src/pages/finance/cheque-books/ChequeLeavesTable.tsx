import React, { useState } from "react";
import ChequeLeafStatusBadge from "../../../../components/finance/ChequeLeafStatusBadge";

export default function ChequeLeavesTable({
  leaves,
  onCancelLeaf,
  hasPermission,
}: {
  leaves?: unknown;
  onCancelLeaf?: unknown;
  hasPermission?: boolean;
}) {
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    leafId: null,
    remarks: "",
  });

  const handleCancelSubmit = (e: any) => {
    e.preventDefault();
    if (!cancelModal.remarks) {
      alert("Remarks are required to cancel a cheque leaf.");
      return;
    }
    onCancelLeaf(cancelModal.leafId, cancelModal.remarks);
    setCancelModal({ isOpen: false, leafId: null, remarks: "" });
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 dark:border-navy-700 dark:bg-navy-700/50 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">Leaf Number</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Linked Payment Voucher</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No leaves found for this cheque book.
                </td>
              </tr>
            ) : (
              leaves.map((leaf: unknown) => (
                <tr
                  key={leaf.id}
                  className="hover:bg-gray-50 dark:hover:bg-navy-700/30"
                >
                  <td className="px-4 py-3 font-medium text-navy-700">
                    {leaf.leaf_number}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ChequeLeafStatusBadge status={leaf.status} />
                  </td>
                  <td className="px-4 py-3">
                    {leaf.payment_voucher_id
                      ? `Voucher #${leaf.payment_voucher_id}`
                      : "-"}
                  </td>
                  <td
                    className="max-w-[200px] truncate px-4 py-3"
                    title={leaf.remarks}
                  >
                    {leaf.remarks || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {leaf.status === "available" && hasPermission && (
                      <button
                        onClick={() =>
                          setCancelModal({
                            isOpen: true,
                            leafId: leaf.id,
                            remarks: "",
                          })
                        }
                        className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 hover:text-red-800"
                      >
                        Cancel Leaf
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cancel Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Cancel Cheque Leaf
            </h3>
            <form onSubmit={handleCancelSubmit}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cancellation Remarks *
                </label>
                <textarea
                  value={cancelModal.remarks}
                  onChange={(e: any) =>
                    setCancelModal((prev: unknown) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  required
                  rows="3"
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Reason for cancellation (e.g., damaged, lost)"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCancelModal({ isOpen: false, leafId: null, remarks: "" })
                  }
                  className="rounded-md border px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
