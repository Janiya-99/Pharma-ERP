import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Edit, Calendar, User, Hash, CreditCard } from "lucide-react";
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
  const isCancelled = data.status === "cancelled";

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/invoice-center/customer-receipts")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Receipt {data.receipt_number}
              <CustomerReceiptStatusBadge status={data.status} />
              <CustomerReceiptApprovalStatusBadge status={data.approval_status} />
              <CustomerReceiptPostedStatusBadge status={data.posted_status} />
            </h1>
          </div>
        </div>
        {!isCancelled && (
          <CustomerReceiptActionButtons
            approvalStatus={data.approval_status}
            postedStatus={data.posted_status}
            onEdit={() => navigate(`/admin/invoice-center/customer-receipts/${data.id}/edit`)}
            onSubmit={() => setSubmitModalOpen(true)}
            onApprove={() => setApproveModalOpen(true)}
            onReject={() => setRejectModalOpen(true)}
            onPost={() => setPostModalOpen(true)}
            onCancel={() => setCancelModalOpen(true)}
            onDelete={() => setDeleteModalOpen(true)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Receipt Information</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" /> Receipt Date
                </p>
                <p className="text-gray-900">{formatDate(data.receipt_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" /> Customer
                </p>
                <p className="text-gray-900 font-medium">{customer?.name || data.customer_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <CreditCard className="h-4 w-4" /> Payment Method
                </p>
                <p className="text-gray-900 mt-1">
                  <CustomerReceiptPaymentMethodBadge method={data.payment_method} />
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Hash className="h-4 w-4" /> Reference
                </p>
                <p className="text-gray-900">{data.payment_reference || "N/A"}</p>
              </div>
              {data.remarks && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Remarks</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">{data.remarks}</p>
                </div>
              )}
            </div>
          </div>

          <CustomerReceiptUnallocatedWarningCard unallocatedAmount={data.unallocated_amount} />

          {/* Allocations Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Allocated Sales Invoices</h2>
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

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 border border-gray-100 space-y-2">
            <div className="flex justify-between">
              <span>Created By:</span>
              <span className="font-medium text-gray-700">{data.created_by || "System"}</span>
            </div>
            <div className="flex justify-between">
              <span>Created At:</span>
              <span className="font-medium text-gray-700">{formatDateTime(data.created_at)}</span>
            </div>
            {data.approved_by && (
              <div className="flex justify-between">
                <span>Approved By:</span>
                <span className="font-medium text-gray-700">{data.approved_by}</span>
              </div>
            )}
            {data.approved_at && (
              <div className="flex justify-between">
                <span>Approved At:</span>
                <span className="font-medium text-gray-700">{formatDateTime(data.approved_at)}</span>
              </div>
            )}
            {data.posted_by && (
              <div className="flex justify-between">
                <span>Posted By:</span>
                <span className="font-medium text-gray-700">{data.posted_by}</span>
              </div>
            )}
            {data.posted_at && (
              <div className="flex justify-between">
                <span>Posted At:</span>
                <span className="font-medium text-gray-700">{formatDateTime(data.posted_at)}</span>
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
          navigate("/admin/invoice-center/customer-receipts");
        }}
      />
    </div>
  );
};

export default CustomerReceiptDetailsPage;
