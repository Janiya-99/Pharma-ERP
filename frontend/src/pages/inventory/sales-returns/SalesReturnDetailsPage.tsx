import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { inventoryApi } from "api/inventoryApi";
import { SalesReturn } from "types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import {
  SalesReturnStatusBadge,
  SalesReturnPostedStatusBadge,
  SalesReturnReasonBadge,
  SalesReturnConditionBadge,
} from "components/inventory/SalesReturnBadges";
import { SalesReturnActionButtons } from "components/inventory/SalesReturnActionButtons";
import {
  SalesReturnTotalsCard,
  SalesReturnCustomerCard,
} from "components/inventory/SalesReturnCards";
import {
  SubmitSalesReturnModal,
  ApproveSalesReturnModal,
  RejectSalesReturnModal,
  PostSalesReturnConfirmModal,
} from "components/inventory/SalesReturnModals";
import { Button } from "components/ui/button";

const SalesReturnDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SalesReturn | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getSalesReturnById(id!);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this sales return?"))
      return;
    try {
      await inventoryApi.deleteSalesReturn(id!);
      navigate("/inventory/sales-returns");
    } catch (error) {
      alert("Failed to delete sales return.");
    }
  };

  // Action Handlers
  const handleSubmit = async (remarks: string) => {
    setActionLoading(true);
    try {
      await inventoryApi.submitSalesReturn(id!, { remarks });
      setIsSubmitModalOpen(false);
      fetchDetails();
    } catch (error) {
      alert("Failed to submit.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (remarks: string) => {
    setActionLoading(true);
    try {
      await inventoryApi.approveSalesReturn(id!, { remarks });
      setIsApproveModalOpen(false);
      fetchDetails();
    } catch (error) {
      alert("Failed to approve.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (remarks: string) => {
    setActionLoading(true);
    try {
      await inventoryApi.rejectSalesReturn(id!, { remarks });
      setIsRejectModalOpen(false);
      fetchDetails();
    } catch (error) {
      alert("Failed to reject.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePost = async () => {
    setActionLoading(true);
    try {
      await inventoryApi.postSalesReturn(id!);
      setIsPostModalOpen(false);
      fetchDetails();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to post sales return.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateCreditNote = async () => {
    setActionLoading(true);
    try {
      await inventoryApi.generateSalesReturnCreditNote(id!);
      await fetchDetails();
      alert("Credit note generated successfully.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to generate credit note.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading details...</div>;
  if (!data) return <div className="p-6">Sales return not found.</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center space-x-4">
          <Link to="/inventory/sales-returns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-slate-800 flex items-center gap-3 text-2xl font-semibold">
              Return {data.sales_return_number}
              <SalesReturnStatusBadge status={data.approval_status} />
              {data.posted_status === "posted" && (
                <SalesReturnPostedStatusBadge status={data.posted_status} />
              )}
            </h1>
            <p className="text-slate-500 text-sm">
              Created on {new Date(data.sales_return_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {data.posted_status === "posted" && !data.credit_note_id && (
            <Button type="button" variant="outline" disabled={actionLoading} onClick={handleGenerateCreditNote}>
              Generate Credit Note
            </Button>
          )}
          <SalesReturnActionButtons
            salesReturn={data}
            isSubmitting={actionLoading}
            onEdit={() => navigate(`/inventory/sales-returns/${data.id}/edit`)}
            onDelete={handleDelete}
            onSubmit={() => setIsSubmitModalOpen(true)}
            onApprove={() => setIsApproveModalOpen(true)}
            onReject={() => setIsRejectModalOpen(true)}
            onPost={() => setIsPostModalOpen(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Return Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-3">
                <div>
                  <span className="mb-1 block text-gray-500">Customer</span>
                  <span className="font-medium">
                    {data.customer_name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-gray-500">Warehouse</span>
                  <span className="font-medium">
                    {data.warehouse?.warehouse_name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-gray-500">Branch</span>
                  <span className="font-medium">
                    {data.branch?.branch_name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block text-gray-500">Condition</span>
                  <SalesReturnConditionBadge
                    condition={data.return_condition}
                  />
                </div>
                <div>
                  <span className="mb-1 block text-gray-500">Reason</span>
                  <SalesReturnReasonBadge reason={data.return_reason} />
                </div>
                <div>
                  <span className="mb-1 block text-gray-500">Reference No</span>
                  <span className="font-medium">
                    {data.reference_number || "N/A"}
                  </span>
                </div>
              </div>
              {data.remarks && (
                <div className="mt-4 border-t pt-4">
                  <span className="mb-1 block text-sm text-gray-500">
                    Remarks
                  </span>
                  <p className="rounded bg-gray-50 p-3 text-sm text-gray-800">
                    {data.remarks}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Returned Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Batch</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Condition</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Price (LKR)</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.lines?.map((line: any, index: number) => (
                      <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {line.product?.product_name ||
                            `ID: ${line.product_id}`}
                        </td>
                        <td className="px-4 py-3">
                          {line.batch?.batch_number || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {line.return_reason
                              ? line.return_reason.replace(/_/g, " ")
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                            {line.return_condition
                              ? line.return_condition.replace(/_/g, " ")
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {Number(line.return_quantity).toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {Number(line.unit_price).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {(line.line_total || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Approval History */}
          {data.approvals && data.approvals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase text-gray-500">
                  Approval History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.approvals.map((approval: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex gap-4 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="bg-slate-100 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        {approval.action === "submitted" && (
                          <span className="text-xs text-blue-500">SB</span>
                        )}
                        {approval.action === "approved" && (
                          <span className="text-xs text-green-500">AP</span>
                        )}
                        {approval.action === "rejected" && (
                          <span className="text-xs text-red-500">RJ</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium capitalize">
                            {approval.action} by{" "}
                            {approval.user?.name || "Unknown User"}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(approval.action_at).toLocaleString()}
                          </span>
                        </div>
                        {approval.remarks && (
                          <p className="mt-1 rounded bg-gray-50 p-2 text-sm text-gray-600">
                            {approval.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SalesReturnTotalsCard salesReturn={data} />

          <SalesReturnCustomerCard salesReturn={data} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Document Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="block text-gray-500">Created By</span>
                <span>
                  {data.created_by_user?.name || "System"} on{" "}
                  {data.created_at
                    ? new Date(data.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              {data.approved_by && (
                <div>
                  <span className="block text-gray-500">Approved By</span>
                  <span>
                    {data.approved_by_user?.name || "System"} on{" "}
                    {data.approved_at
                      ? new Date(data.approved_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              )}
              {data.posted_by && (
                <div>
                  <span className="block text-gray-500">Posted By</span>
                  <span>
                    {data.posted_by_user?.name || "System"} on{" "}
                    {data.posted_at
                      ? new Date(data.posted_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <SubmitSalesReturnModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        salesReturn={data}
        loading={actionLoading}
      />

      <ApproveSalesReturnModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        salesReturn={data}
        loading={actionLoading}
      />

      <RejectSalesReturnModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        salesReturn={data}
        loading={actionLoading}
      />

      <PostSalesReturnConfirmModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onConfirm={handlePost}
        salesReturn={data}
        loading={actionLoading}
      />
    </div>
  );
};

export default SalesReturnDetailsPage;
