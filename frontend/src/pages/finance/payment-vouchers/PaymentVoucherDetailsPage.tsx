import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import VoucherStatusBadge from "../../../../components/finance/VoucherStatusBadge";
import VoucherPostedStatusBadge from "../../../../components/finance/VoucherPostedStatusBadge";
import PaymentMethodBadge from "../../../../components/finance/PaymentMethodBadge";
import VoucherActionButtons from "../../../../components/finance/VoucherActionButtons";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import { MdArrowBack } from "react-icons/md";

import SubmitVoucherModal from "../shared/SubmitVoucherModal";
import ApproveVoucherModal from "../shared/ApproveVoucherModal";
import RejectVoucherModal from "../shared/RejectVoucherModal";
import PostVoucherConfirmModal from "../shared/PostVoucherConfirmModal";

export default function PaymentVoucherDetailsPage() {
  const { id } = useParams();
  const history = useHistory();
  const { activeSoftware } = useAuth();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalState, setModalState] = useState({
    type: null, // "submit", "approve", "reject", "post"
    voucher: null
  });

  const loadVoucher = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getPaymentVoucherById(id);
      if (res.data?.success) {
        setVoucher(res.data.data);
      }
    } catch (err) {
      setError("Failed to load payment voucher details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      loadVoucher();
    }
  }, [id, activeSoftware]);

  const handleAction = async (action: unknown, vch: unknown) => {
    if (action === "edit") {
      history.push(`/admin/finance/payment-vouchers/${vch.id}/edit`);
    } else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this payment voucher?")) {
        try {
          await financeApi.deletePaymentVoucher(vch.id);
          history.push("/admin/finance/payment-vouchers");
        } catch (err) {
          alert("Failed to delete: " + (err.response?.data?.message || err.message));
        }
      }
    } else {
      setModalState({ type: action, voucher: vch });
    }
  };

  const closeModal = () => setModalState({ type: null, voucher: null });

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (error || !voucher) return <div className="p-8 text-center text-red-500">{error || "Payment voucher not found"}</div>;

  return (
    <div className="flex flex-col gap-4 py-4 h-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => history.push("/admin/finance/payment-vouchers")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
          >
            <MdArrowBack className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-navy-800 dark:text-white">
            Payment Voucher {voucher.payment_voucher_number}
          </h1>
        </div>
        <div>
          <VoucherActionButtons voucher={voucher} type="payment" onAction={handleAction} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Header Summary */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
            <h3 className="text-lg font-medium text-navy-800 dark:text-white mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Payment Date</p>
                <p className="font-medium text-navy-800 dark:text-white">
                  {new Date(voucher.payment_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Payment Type</p>
                <p className="font-medium text-navy-800 dark:text-white capitalize">
                  {voucher.payment_type?.replace(/_/g, " ") || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium text-navy-800 dark:text-white">
                  <PaymentMethodBadge method={voucher.payment_method} />
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Paid From Account</p>
                <p className="font-medium text-navy-800 dark:text-white">
                  {voucher.paid_from_account?.account_code} - {voucher.paid_from_account?.account_name}
                </p>
              </div>
              {voucher.payment_method === "cheque" && (
                <>
                  <div>
                    <p className="text-gray-500 mb-1">Cheque Number</p>
                    <p className="font-medium text-navy-800 dark:text-white">{voucher.cheque_number || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Cheque Date</p>
                    <p className="font-medium text-navy-800 dark:text-white">
                      {voucher.cheque_date ? new Date(voucher.cheque_date).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-gray-500 mb-1">Reference Number</p>
                <p className="font-medium text-navy-800 dark:text-white">{voucher.reference_number || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Description</p>
                <p className="font-medium text-navy-800 dark:text-white">{voucher.description || "-"}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
            <h3 className="text-lg font-medium text-navy-800 dark:text-white mb-4">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-navy-700/50 text-gray-500 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-navy-700">
                  <tr>
                    <th className="px-4 py-3">Account Code</th>
                    <th className="px-4 py-3">Account Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {voucher.lines?.map((line: unknown) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3">{line.account?.account_code || "-"}</td>
                      <td className="px-4 py-3">{line.account?.account_name || "-"}</td>
                      <td className="px-4 py-3">{line.line_description || "-"}</td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={line.amount} /></td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-navy-700/50 font-bold">
                    <td colSpan="3" className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Total</td>
                    <td className="px-4 py-3 text-right text-navy-800 dark:text-white"><MoneyDisplay amount={voucher.total_amount} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Status & History */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
            <h3 className="text-lg font-medium text-navy-800 dark:text-white mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Approval Status</span>
                <VoucherStatusBadge status={voucher.approval_status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Posted Status</span>
                <VoucherPostedStatusBadge status={voucher.posted_status} />
              </div>
              <hr className="my-2 border-gray-100 dark:border-navy-700" />
              <div className="text-sm space-y-2">
                <p><span className="text-gray-500">Created:</span> {new Date(voucher.created_at).toLocaleString()}</p>
                {voucher.approved_at && (
                  <p><span className="text-gray-500">Approved:</span> {new Date(voucher.approved_at).toLocaleString()}</p>
                )}
                {voucher.posted_at && (
                  <p><span className="text-gray-500">Posted:</span> {new Date(voucher.posted_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
            <h3 className="text-lg font-medium text-navy-800 dark:text-white mb-4">Approval History</h3>
            {voucher.approvals?.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {voucher.approvals.map((approval: unknown, idx: unknown) => (
                  <div key={approval.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                      {idx + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded border border-gray-100 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="font-semibold text-navy-800 uppercase">{approval.action}</span>
                        <span className="text-gray-500">{new Date(approval.action_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{approval.remarks || "No remarks"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No approval history available.</p>
            )}
          </div>
        </div>
      </div>

      <SubmitVoucherModal
        isOpen={modalState.type === "submit"}
        onClose={closeModal}
        voucher={modalState.voucher}
        type="payment"
        onSuccess={loadVoucher}
      />
      <ApproveVoucherModal
        isOpen={modalState.type === "approve"}
        onClose={closeModal}
        voucher={modalState.voucher}
        type="payment"
        onSuccess={loadVoucher}
      />
      <RejectVoucherModal
        isOpen={modalState.type === "reject"}
        onClose={closeModal}
        voucher={modalState.voucher}
        type="payment"
        onSuccess={loadVoucher}
      />
      <PostVoucherConfirmModal
        isOpen={modalState.type === "post"}
        onClose={closeModal}
        voucher={modalState.voucher}
        type="payment"
        onSuccess={loadVoucher}
      />
    </div>
  );
}
