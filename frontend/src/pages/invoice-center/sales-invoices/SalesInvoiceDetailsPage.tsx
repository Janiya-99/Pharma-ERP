import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useAuth } from "../../../auth/AuthContext";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Skeleton } from "../../../components/ui/skeleton";
import { toast } from "sonner";
import type { SalesInvoice } from "../../../types/invoice-center";
import {
  SalesInvoiceApprovalStatusBadge,
  SalesInvoicePostedStatusBadge,
  SalesInvoicePaymentStatusBadge,
  SalesInvoiceActionButtons,
  SalesInvoiceTotalsCard,
  SalesInvoiceCustomerCreditCard,
  SalesInvoiceSalesOrderLinkCard,
  SalesInvoicePaymentSummaryCard,
  SalesInvoiceLineTable,
} from "../../../components/invoice-center";
import {
  SubmitSalesInvoiceModal,
  ApproveSalesInvoiceModal,
  RejectSalesInvoiceModal,
  PostSalesInvoiceConfirmModal,
  CancelSalesInvoiceModal,
  DeleteSalesInvoiceConfirmModal,
} from "./";

const SalesInvoiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<SalesInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchInvoice = async () => {
    if (!id || activeSoftware?.software_code !== "INVOICE_CENTER") return;
    setLoading(true);
    try {
      const res = await invoiceCenterApi.getSalesInvoiceById(id);
      setInvoice(res.data.data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch sales invoice."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id, activeSoftware]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center text-gray-500">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-gray-500">
        Sales Invoice not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/invoice-center/sales-invoices")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Sales Invoice: {invoice.invoice_number}
            </h1>
          </div>
        </div>
        <SalesInvoiceActionButtons
          invoice={invoice}
          onEdit={() =>
            navigate(`/invoice-center/sales-invoices/${invoice.id}/edit`)
          }
          onDelete={() => setIsDeleteOpen(true)}
          onSubmit={() => setIsSubmitOpen(true)}
          onApprove={() => setIsApproveOpen(true)}
          onReject={() => setIsRejectOpen(true)}
          onPost={() => setIsPostOpen(true)}
          onCancel={() => setIsCancelOpen(true)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                <div>
                  <div className="text-gray-500">Invoice Date</div>
                  <div className="font-medium">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Due Date</div>
                  <div className="font-medium">
                    {invoice.due_date
                      ? new Date(invoice.due_date).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Branch</div>
                  <div className="font-medium">
                    {invoice.branch?.branch_name || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Warehouse</div>
                  <div className="font-medium">
                    {invoice.warehouse?.warehouse_name || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Customer Reference</div>
                  <div className="font-medium">
                    {invoice.customer_reference_number || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Remarks</div>
                  <div className="font-medium">{invoice.remarks || "-"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <SalesInvoiceLineTable lines={invoice.lines || []} />

          <div className="mt-4 flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <SalesInvoiceTotalsCard
                subtotal={invoice.subtotal_amount}
                discount={invoice.discount_amount}
                tax={invoice.tax_amount}
                total={invoice.total_amount}
                lineCount={invoice.lines?.length || 0}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Approval</span>
                <SalesInvoiceApprovalStatusBadge
                  status={invoice.approval_status}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Posting</span>
                <SalesInvoicePostedStatusBadge status={invoice.posted_status} />
              </div>
              <Separator />
              <div className="flex gap-2">
                {invoice.posted_status === "posted" && (
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() =>
                      window.open(
                        "/inventory/stock-ledger?source_type=sales_invoice&source_number=" +
                          invoice.invoice_number
                      )
                    }
                  >
                    View Stock Ledger
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <SalesInvoicePaymentSummaryCard
            status={invoice.payment_status}
            paidAmount={invoice.paid_amount}
            balanceAmount={invoice.balance_amount}
          />

          <SalesInvoiceCustomerCreditCard
            customer={invoice.customer || null}
            invoiceTotal={invoice.total_amount}
          />

          <SalesInvoiceSalesOrderLinkCard
            salesOrder={invoice.sales_order || null}
          />
        </div>
      </div>

      {invoice.approvals && invoice.approvals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoice.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex flex-col justify-between border-b pb-2 text-sm last:border-0 last:pb-0 md:flex-row"
                >
                  <div>
                    <span className="font-semibold capitalize">
                      {approval.action}
                    </span>
                    {approval.remarks && (
                      <span className="ml-2 text-gray-500">
                        - {approval.remarks}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-400 md:mt-0">
                    {new Date(approval.action_at).toLocaleString()} by User{" "}
                    {approval.action_by}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Modals */}
      <SubmitSalesInvoiceModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        invoiceId={invoice.id}
        onSuccess={fetchInvoice}
      />
      <ApproveSalesInvoiceModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        invoiceId={invoice.id}
        onSuccess={fetchInvoice}
        showCreditWarning={
          (invoice.customer?.credit_limit || 0) > 0 &&
          (invoice.customer?.current_balance || 0) + invoice.total_amount >
            (invoice.customer?.credit_limit || 0)
        }
      />
      <RejectSalesInvoiceModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        invoiceId={invoice.id}
        onSuccess={fetchInvoice}
      />
      <PostSalesInvoiceConfirmModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoice_number}
        totalAmount={invoice.total_amount}
        totalQuantity={
          invoice.lines?.reduce(
            (sum, line) => sum + Number(line.quantity),
            0
          ) || 0
        }
        customerName={
          invoice.customer?.customer_name || `Customer #${invoice.customer_id}`
        }
        warehouseName={
          invoice.warehouse?.warehouse_name ||
          `Warehouse #${invoice.warehouse_id}`
        }
        onSuccess={fetchInvoice}
      />
      <CancelSalesInvoiceModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        invoiceId={invoice.id}
        onSuccess={fetchInvoice}
      />
      <DeleteSalesInvoiceConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoice_number}
        customerName={invoice.customer?.customer_name || ""}
        onSuccess={() => navigate("/invoice-center/sales-invoices")}
      />
    </div>
  );
};

export default SalesInvoiceDetailsPage;
