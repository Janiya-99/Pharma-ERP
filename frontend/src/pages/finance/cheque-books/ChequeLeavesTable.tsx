import { useState } from "react";
import ChequeLeafStatusBadge from "../../../../components/finance/ChequeLeafStatusBadge";

export default function ChequeLeavesTable({ leaves, onCancelLeaf, hasPermission }: { leaves?: unknown; onCancelLeaf?: unknown; hasPermission?: boolean }) {
  const [cancelModal, setCancelModal] = useState({ isOpen: false, leafId: null, remarks: "" });

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
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50  text-gray-500  font-semibold border-b border-gray-200 ">
            <tr>
              <th className="px-4 py-3">Leaf Number</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Linked Payment Voucher</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 ">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No leaves found for this cheque book.</td>
              </tr>
            ) : (
              leaves.map((leaf: unknown) => (
                <tr key={leaf.id} className="hover:bg-gray-50 ">
                  <td className="px-4 py-3 font-medium text-navy-700">{leaf.leaf_number}</td>
                  <td className="px-4 py-3 text-center">
                    <ChequeLeafStatusBadge status={leaf.status} />
                  </td>
                  <td className="px-4 py-3">
                    {leaf.payment_voucher_id ? `Voucher #${leaf.payment_voucher_id}` : "-"}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={leaf.remarks}>{leaf.remarks || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    {leaf.status === "available" && hasPermission && (
                      <button
                        onClick={() => setCancelModal({ isOpen: true, leafId: leaf.id, remarks: "" })}
                        className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200"
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
          <div className="bg-white  p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-navy-700  mb-4">Cancel Cheque Leaf</h3>
            <form onSubmit={handleCancelSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700  mb-1">Cancellation Remarks *</label>
                <textarea
                  value={cancelModal.remarks}
                  onChange={(e: any) => setCancelModal((prev: unknown) => ({ ...prev, remarks: e.target.value }))}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Reason for cancellation (e.g., damaged, lost)"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModal({ isOpen: false, leafId: null, remarks: "" })}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
