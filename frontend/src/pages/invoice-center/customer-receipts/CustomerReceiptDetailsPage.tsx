import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Calendar, User, Hash, CreditCard } from "lucide-react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { Button } from "../../../components/ui/button";
import { formatCurrency, formatDate, formatDateTime } from "../../../lib/utils";
import {
  CustomerReceiptStatusBadge,
  CustomerReceiptApprovalStatusBadge,
  CustomerReceiptPostedStatusBadge,
  CustomerReceiptPaymentMethodBadge,
  CustomerReceiptActionButtons,
  CustomerReceiptTotalsCard,
  CustomerReceiptCustomerBalanceCard,
  CustomerReceiptUnallocatedWarningCard,
} from "../../../components/invoice-center";

import { SubmitCustomerReceiptModal } from "./SubmitCustomerReceiptModal";
import { ApproveCustomerReceiptModal } from "./ApproveCustomerReceiptModal";
import { RejectCustomerReceiptModal } from "./RejectCustomerReceiptModal";
import { PostCustomerReceiptConfirmModal } from "./PostCustomerReceiptConfirmModal";
import { CancelCustomerReceiptModal } from "./CancelCustomerReceiptModal";
import { DeleteCustomerReceiptConfirmModal } from "./DeleteCustomerReceiptConfirmModal";

const CustomerReceiptDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await invoiceCenterApi.getCustomerReceiptById(id!);
      const res = response as any;
      if (res.data?.success || res.success !== false) {
        setData(res.data?.data || res.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load receipt details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading receipt details...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Receipt not found.</div>;
  }

  const { customer, allocations = [] } = data;
  const isCancelled = data.receipt_status === "cancelled";

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Covered Header Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-r from-white/95 via-slate-50/90 to-blue-50/30 backdrop-blur-xl p-5 sm:p-6 shadow-xs transition-all duration-300">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-slate-200 bg-white/80 hover:bg-slate-100 shadow-xs"
              onClick={() => navigate("/invoice-center/customer-receipts")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Receipt {data.receipt_number}
                </h1>
                <CustomerReceiptStatusBadge status={data.receipt_status} />
                <CustomerReceiptApprovalStatusBadge status={data.approval_status} />
                <CustomerReceiptPostedStatusBadge status={data.posted_status} />
              </div>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Customer payment allocation and accounts receivable ledger voucher
              </p>
            </div>
          </div>
          {!isCancelled && (
            <div className="flex items-center gap-2">
              <CustomerReceiptActionButtons
                approvalStatus={data.approval_status}
                postedStatus={data.posted_status}
                onEdit={() => navigate(`/invoice-center/customer-receipts/${data.id}/edit`)}
                onSubmit={() => setSubmitModalOpen(true)}
                onApprove={() => setApproveModalOpen(true)}
                onReject={() => setRejectModalOpen(true)}
                onPost={() => setPostModalOpen(true)}
                onCancel={() => setCancelModalOpen(true)}
                onDelete={() => setDeleteModalOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 uppercase tracking-wider text-xs">Receipt Information</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1">
                  <Calendar className="h-3.5 w-3.5" /> Receipt Date
                </p>
                <p className="text-slate-900 font-medium text-sm">{formatDate(data.receipt_date)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1">
                  <User className="h-3.5 w-3.5" /> Customer
                </p>
                <p className="text-slate-900 font-bold text-sm">{customer?.customer_name || customer?.name || data.customer_id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1">
                  <CreditCard className="h-3.5 w-3.5" /> Payment Method
                </p>
                <p className="text-slate-900 mt-1">
                  <CustomerReceiptPaymentMethodBadge method={data.payment_method} />
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 mb-1">
                  <Hash className="h-3.5 w-3.5" /> Reference
                </p>
                <p className="text-slate-900 font-medium text-sm">{data.payment_reference || "N/A"}</p>
              </div>
              {data.remarks && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Remarks</p>
                  <p className="text-slate-800 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 text-sm">{data.remarks}</p>
                </div>
              )}
            </div>
          </div>

          <CustomerReceiptUnallocatedWarningCard unallocatedAmount={data.unallocated_amount} />

          {/* Allocations Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Allocated Sales Invoices</h2>
            </div>
            {allocations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3 text-right">Invoice Total</th>
                      <th className="px-6 py-3 text-right">Already Paid</th>
                      <th className="px-6 py-3 text-right text-green-700 bg-green-50">Allocated Amount</th>
                      <th className="px-6 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allocations.map((alloc: any) => (
                      <tr key={alloc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-brand-600">
                          {alloc.sales_invoice?.invoice_number || alloc.sales_invoice_id}
                        </td>
                        <td className="px-6 py-3 text-right">{formatCurrency(alloc.sales_invoice?.total_amount || 0)}</td>
                        <td className="px-6 py-3 text-right text-gray-500">
                          {formatCurrency(alloc.sales_invoice?.paid_amount || 0)}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-green-700 bg-green-50/30">
                          {formatCurrency(alloc.allocated_amount)}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">
                          {formatCurrency((alloc.sales_invoice?.balance_amount || 0) - alloc.allocated_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No invoices allocated. This is a direct receipt.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <CustomerReceiptTotalsCard
            receiptAmount={data.receipt_amount}
            allocatedAmount={data.allocated_amount}
            unallocatedAmount={data.unallocated_amount}
            allocationCount={allocations.length}
          />

          {customer && (
            <CustomerReceiptCustomerBalanceCard
              currentBalance={customer.current_balance || 0}
              receiptAmount={data.receipt_amount}
              allocatedAmount={data.allocated_amount}
              unallocatedAmount={data.unallocated_amount}
              balanceAfterReceipt={(customer.current_balance || 0) - data.allocated_amount}
              creditLimit={customer.credit_limit}
              creditDays={customer.credit_days}
              customerStatus={customer.status}
            />
          )}

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-5 text-xs text-slate-500 shadow-xs space-y-2.5">
            <div className="flex justify-between">
              <span>Created By:</span>
              <span className="font-semibold text-slate-700">{data.created_by || "System"}</span>
            </div>
            <div className="flex justify-between">
              <span>Created At:</span>
              <span className="font-semibold text-slate-700">{formatDateTime(data.created_at)}</span>
            </div>
            {data.approved_by && (
              <div className="flex justify-between">
                <span>Approved By:</span>
                <span className="font-semibold text-slate-700">{data.approved_by}</span>
              </div>
            )}
            {data.approved_at && (
              <div className="flex justify-between">
                <span>Approved At:</span>
                <span className="font-semibold text-slate-700">{formatDateTime(data.approved_at)}</span>
              </div>
            )}
            {data.posted_by && (
              <div className="flex justify-between">
                <span>Posted By:</span>
                <span className="font-semibold text-slate-700">{data.posted_by}</span>
              </div>
            )}
            {data.posted_at && (
              <div className="flex justify-between">
                <span>Posted At:</span>
                <span className="font-semibold text-slate-700">{formatDateTime(data.posted_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubmitCustomerReceiptModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        receiptId={data.id}
        onSuccess={fetchData}
      />
      <ApproveCustomerReceiptModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        receiptId={data.id}
        unallocatedAmount={data.unallocated_amount}
        onSuccess={fetchData}
      />
      <RejectCustomerReceiptModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        receiptId={data.id}
        onSuccess={fetchData}
      />
      {customer && (
        <PostCustomerReceiptConfirmModal
          isOpen={postModalOpen}
          onClose={() => setPostModalOpen(false)}
          receiptId={data.id}
          receiptAmount={data.receipt_amount}
          allocatedAmount={data.allocated_amount}
          unallocatedAmount={data.unallocated_amount}
          currentBalance={customer.current_balance || 0}
          balanceAfterReceipt={(customer.current_balance || 0) - data.allocated_amount}
          allocationCount={allocations.length}
          onSuccess={fetchData}
        />
      )}
      <CancelCustomerReceiptModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        receiptId={data.id}
        onSuccess={fetchData}
      />
      <DeleteCustomerReceiptConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        receiptId={data.id}
        receiptNumber={data.receipt_number}
        onSuccess={() => {
          navigate("/invoice-center/customer-receipts");
        }}
      />
    </div>
  );
};

export default CustomerReceiptDetailsPage;
