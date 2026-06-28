import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Box, ListChecks } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";
import GRNStatusBadge from "../../../components/inventory/GRNStatusBadge";
import GRNPostedStatusBadge from "../../../components/inventory/GRNPostedStatusBadge";
import GRNActionButtons from "../../../components/inventory/GRNActionButtons";
import { formatCurrency, formatNumber, formatDate, formatDateTime } from "../../../lib/utils";

import SubmitGRNModal from "./SubmitGRNModal";
import ApproveGRNModal from "./ApproveGRNModal";
import RejectGRNModal from "./RejectGRNModal";
import PostGRNConfirmModal from "./PostGRNConfirmModal";

const GRNDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [grn, setGrn] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    fetchGRNDetails();
  }, [id]);

  const fetchGRNDetails = async () => {
    try {
      const res: any = await inventoryApi.getGRNById(id);
      if (res.success !== false) {
        setGrn(res.data?.data || res.data);
      }
    } catch (err: any) {
      toast.error("Failed to load GRN details");
      navigate("/inventory/grns");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (grnData: any) => {
    if (window.confirm("Are you sure you want to delete this GRN?")) {
      try {
        await inventoryApi.deleteGRN(grnData.id);
        toast.success("GRN deleted successfully");
        navigate("/inventory/grns");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete GRN");
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!grn) return <div className="p-6 text-center">GRN not found.</div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/inventory/grns")}
            className="p-2 bg-white dark:bg-navy-800 rounded-full shadow hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-700 dark:text-white flex items-center gap-3">
              GRN: {grn.grn_number}
              <GRNStatusBadge status={grn.approval_status} />
              <GRNPostedStatusBadge status={grn.posted_status} />
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Date: {formatDate(grn.grn_date)} | Supplier: {grn.supplier?.supplier_name || `#${grn.supplier_id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <GRNActionButtons
            grn={grn}
            onDelete={handleDelete}
            onSubmit={() => setIsSubmitModalOpen(true)}
            onApprove={() => setIsApproveModalOpen(true)}
            onReject={() => setIsRejectModalOpen(true)}
            onPost={() => setIsPostModalOpen(true)}
          />

          <div className="h-6 w-px bg-gray-200 dark:bg-navy-600 mx-1"></div>

          {hasPermission("inventory.stock_ledger.view") && grn.posted_status === "posted" && (
            <Link
              to={`/inventory/stock-ledger?source_type=grn&source_number=${grn.grn_number}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-navy-800 dark:text-gray-300 dark:border-navy-600 dark:hover:bg-navy-700 shadow-sm"
            >
              <ListChecks className="w-4 h-4" /> Stock Ledger
            </Link>
          )}

          {hasPermission("inventory.stock_balance.view") && (
            <Link
              to={`/inventory/stock-balances?warehouse_id=${grn.warehouse_id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-navy-800 dark:text-gray-300 dark:border-navy-600 dark:hover:bg-navy-700 shadow-sm"
            >
              <Box className="w-4 h-4" /> Stock Balances
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-navy-700 pb-2">Document Info</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="block text-gray-500 dark:text-gray-400 mb-1">Branch</span>
                <span className="font-medium text-gray-900 dark:text-white">{grn.branch?.branch_name || `#${grn.branch_id}`}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 mb-1">Warehouse</span>
                <span className="font-medium text-gray-900 dark:text-white">{grn.warehouse?.warehouse_name || `#${grn.warehouse_id}`}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 mb-1">Supplier Inv. No</span>
                <span className="font-medium text-gray-900 dark:text-white">{grn.supplier_invoice_number || "N/A"}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 mb-1">Supplier Inv. Date</span>
                <span className="font-medium text-gray-900 dark:text-white">{grn.supplier_invoice_date ? formatDate(grn.supplier_invoice_date) : "N/A"}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 mb-1">PO Number</span>
                <span className="font-medium text-gray-900 dark:text-white">{grn.purchase_order_number || "N/A"}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 mb-1">Ref Number</span>
                <span className="font-medium text-gray-900 dark:text-white">{grn.reference_number || "N/A"}</span>
              </div>
              <div className="col-span-2 md:col-span-3">
                <span className="block text-gray-500 dark:text-gray-400 mb-1">Remarks</span>
                <span className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{grn.remarks || "None"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-navy-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-navy-800/50 text-gray-600 dark:text-gray-300 font-medium">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3 min-w-[200px]">Product</th>
                    <th className="px-4 py-3 min-w-[150px]">Batch</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Free</th>
                    <th className="px-4 py-3 text-right">Stock Qty</th>
                    <th className="px-4 py-3 text-right">Unit Cost</th>
                    <th className="px-4 py-3 text-right">Disc.</th>
                    <th className="px-4 py-3 text-right">Tax</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Stock U.C.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {grn.lines && grn.lines.map((line: unknown, idx: unknown) => {
                    const stockQty = Number(line.quantity_received) + Number(line.free_quantity);
                    const subT = Number(line.quantity_received) * Number(line.unit_cost);
                    const lineT = subT - Number(line.discount_amount) + Number(line.tax_amount);
                    const stockUC = stockQty > 0 ? lineT / stockQty : 0;

                    return (
                      <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-navy-800/50">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{line.product?.product_name || `Product #${line.product_id}`}</div>
                          <div className="text-xs text-gray-500">{line.product?.product_code}</div>
                        </td>
                        <td className="px-4 py-3">
                          {line.product_batch ? (
                            <div>
                              <div className="font-medium">{line.product_batch.batch_number}</div>
                              <div className="text-xs text-gray-500">Exp: {formatDate(line.product_batch.expiry_date)}</div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium text-brand-600">{line.batch_number}</div>
                              <div className="text-[10px] text-gray-500">New Batch</div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">{formatNumber(line.quantity_received, 3)}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(line.free_quantity, 3)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatNumber(stockQty, 3)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(line.unit_cost)}</td>
                        <td className="px-4 py-3 text-right text-red-500">{formatCurrency(line.discount_amount)}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(line.tax_amount)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(lineT)}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(stockUC)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {grn.approvals && grn.approvals.length > 0 && (
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-navy-700 pb-2">Approval History</h3>
              <div className="space-y-4">
                {grn.approvals.map((appr: unknown) => (
                  <div key={appr.id} className="flex gap-4 p-3 rounded-lg bg-gray-50 dark:bg-navy-900/50">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white capitalize">{appr.action}</span>
                        <span className="text-xs text-gray-500">{formatDateTime(appr.action_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="text-gray-400">By:</span> {appr.action_by_user?.name || `#${appr.action_by}`}
                      </p>
                      {appr.remarks && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 bg-white dark:bg-navy-800 p-2 rounded border border-gray-100 dark:border-navy-700">
                          {appr.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 dark:bg-navy-800 rounded-xl p-4 border border-gray-100 dark:border-navy-700">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm border-b pb-2 dark:border-navy-600">Financial Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Total Quantity:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{formatNumber(grn.total_quantity, 3)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Total Free Qty:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{formatNumber(grn.total_free_quantity, 3)}</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span className="text-brand-600 dark:text-brand-400">Total Stock Qty:</span>
                <span className="text-brand-600 dark:text-brand-400">{formatNumber(grn.total_stock_quantity, 3)}</span>
              </div>

              <div className="h-px bg-gray-200 dark:bg-navy-600 my-2"></div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Subtotal Amount:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(grn.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                <span>Discount Amount:</span>
                <span>- {formatCurrency(grn.discount_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Tax Amount:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(grn.tax_amount)}</span>
              </div>
              
              <div className="flex justify-between items-center font-bold pt-2 border-t border-gray-200 dark:border-navy-600 text-base">
                <span className="text-brand-600 dark:text-brand-400">Total Amount:</span>
                <span className="text-brand-600 dark:text-brand-400">{formatCurrency(grn.total_amount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-navy-700 pb-2">Record Timestamps</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900 dark:text-white">{formatDateTime(grn.created_at)}</span>
              </div>
              {grn.approved_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Approved:</span>
                  <span className="text-gray-900 dark:text-white">{formatDateTime(grn.approved_at)}</span>
                </div>
              )}
              {grn.posted_at && (
                <div className="flex justify-between font-medium text-green-600">
                  <span>Posted:</span>
                  <span>{formatDateTime(grn.posted_at)}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <SubmitGRNModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        grnId={grn.id}
        onSuccess={fetchGRNDetails}
      />
      
      <ApproveGRNModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        grnId={grn.id}
        onSuccess={fetchGRNDetails}
      />

      <RejectGRNModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        grnId={grn.id}
        onSuccess={fetchGRNDetails}
      />

      <PostGRNConfirmModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        grn={grn}
        onSuccess={fetchGRNDetails}
      />
    </div>
  );
};

export default GRNDetailsPage;
