import React, { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useAuth } from "../../../auth/AuthContext";
import {
  SalesOrderActionButtons,
  SalesOrderApprovalStatusBadge,
  SalesOrderCustomerCreditCard,
  SalesOrderLineTable,
  SalesOrderStatusBadge,
  SalesOrderTotalsCard,
} from "../../../components/invoice-center";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type {
  ApiResponse,
  SalesOrderDetail,
} from "../../../types/invoice-center";
import ApproveSalesOrderModal from "./ApproveSalesOrderModal";
import CancelSalesOrderModal from "./CancelSalesOrderModal";
import CloseSalesOrderModal from "./CloseSalesOrderModal";
import DeleteSalesOrderConfirmModal from "./DeleteSalesOrderConfirmModal";
import RejectSalesOrderModal from "./RejectSalesOrderModal";
import SubmitSalesOrderModal from "./SubmitSalesOrderModal";

type ActionModal =
  | "submit"
  | "approve"
  | "reject"
  | "close"
  | "cancel"
  | "delete"
  | null;

const SalesOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<SalesOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<ActionModal>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await invoiceCenterApi.getSalesOrderById(id);
      setOrder((response.data as ApiResponse<SalesOrderDetail>).data);
    } catch (fetchError) {
      console.error("Fetch sales order error:", fetchError);
      setError("Failed to fetch sales order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER") {
      fetchOrder();
    }
  }, [activeSoftware, id]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="border-rose-200 bg-rose-50 text-rose-600 m-6 rounded-xl border p-8 text-center font-medium">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const runAction = async (
    action: Exclude<ActionModal, null | "delete">,
    remarks: string
  ) => {
    if (!id) return;
    setActionLoading(true);
    try {
      const payload = { remarks };
      if (action === "submit")
        await invoiceCenterApi.submitSalesOrder(id, payload);
      if (action === "approve")
        await invoiceCenterApi.approveSalesOrder(id, payload);
      if (action === "reject")
        await invoiceCenterApi.rejectSalesOrder(id, payload);
      if (action === "close")
        await invoiceCenterApi.closeSalesOrder(id, payload);
      if (action === "cancel")
        await invoiceCenterApi.cancelSalesOrder(id, payload);
      setModal(null);
      await fetchOrder();
    } finally {
      setActionLoading(false);
    }
  };

  const deleteOrder = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await invoiceCenterApi.deleteSalesOrder(id);
      navigate("/invoice-center/sales-orders");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              {order?.sales_order_number || "Sales Order"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Sales order details, approval history, and line items.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={fetchOrder}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
          </Button>
          {order && (
            <SalesOrderActionButtons
              order={order}
              onEdit={() =>
                navigate(`/invoice-center/sales-orders/${order.id}/edit`)
              }
              onSubmit={() => setModal("submit")}
              onApprove={() => setModal("approve")}
              onReject={() => setModal("reject")}
              onClose={() => setModal("close")}
              onCancel={() => setModal("cancel")}
              onDelete={() => setModal("delete")}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="border-rose-200 bg-rose-50 text-rose-700 rounded-xl border p-4 text-sm">
          {error}
        </div>
      )}

      {order && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-semibold">{order.sales_order_date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Delivery</p>
                  <p className="font-semibold">
                    {order.expected_delivery_date || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Branch</p>
                  <p className="font-semibold">
                    {order.branch?.branch_name || order.branch_id}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Approval Status</p>
                  <SalesOrderApprovalStatusBadge
                    status={order.approval_status}
                  />
                </div>
                <div>
                  <p className="text-muted-foreground">Order Status</p>
                  <SalesOrderStatusBadge status={order.order_status} />
                </div>
                <div>
                  <p className="text-muted-foreground">Customer Reference</p>
                  <p className="font-semibold">
                    {order.customer_reference_number || "-"}
                  </p>
                </div>
                {order.remarks && (
                  <div className="md:col-span-3">
                    <Separator className="mb-4" />
                    <p className="text-muted-foreground">Remarks</p>
                    <p>{order.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <SalesOrderCustomerCreditCard customer={order.customer} />
              <SalesOrderTotalsCard
                subtotalAmount={order.subtotal_amount}
                discountAmount={order.discount_amount}
                taxAmount={order.tax_amount}
                totalAmount={order.total_amount}
              />
            </div>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesOrderLineTable lines={order.lines || []} />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead>At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.approvals?.length ? (
                    order.approvals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell className="font-medium">
                          {approval.action}
                        </TableCell>
                        <TableCell>{approval.remarks || "-"}</TableCell>
                        <TableCell>{approval.action_by}</TableCell>
                        <TableCell>{approval.action_at}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No approval actions recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <SubmitSalesOrderModal
        open={modal === "submit"}
        loading={actionLoading}
        onOpenChange={(open) => setModal(open ? "submit" : null)}
        onConfirm={(remarks) => runAction("submit", remarks)}
      />
      <ApproveSalesOrderModal
        open={modal === "approve"}
        loading={actionLoading}
        onOpenChange={(open) => setModal(open ? "approve" : null)}
        onConfirm={(remarks) => runAction("approve", remarks)}
      />
      <RejectSalesOrderModal
        open={modal === "reject"}
        loading={actionLoading}
        onOpenChange={(open) => setModal(open ? "reject" : null)}
        onConfirm={(remarks) => runAction("reject", remarks)}
      />
      <CloseSalesOrderModal
        open={modal === "close"}
        loading={actionLoading}
        onOpenChange={(open) => setModal(open ? "close" : null)}
        onConfirm={(remarks) => runAction("close", remarks)}
      />
      <CancelSalesOrderModal
        open={modal === "cancel"}
        loading={actionLoading}
        onOpenChange={(open) => setModal(open ? "cancel" : null)}
        onConfirm={(remarks) => runAction("cancel", remarks)}
      />
      <DeleteSalesOrderConfirmModal
        open={modal === "delete"}
        loading={actionLoading}
        onOpenChange={(open) => setModal(open ? "delete" : null)}
        onConfirm={deleteOrder}
      />
    </div>
  );
};

export default SalesOrderDetailsPage;
