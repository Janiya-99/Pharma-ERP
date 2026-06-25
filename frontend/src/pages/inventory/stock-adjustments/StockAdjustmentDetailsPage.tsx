import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, GitMerge, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "../../../api/inventoryApi";
import { formatDate, formatCurrency } from "../../../lib/utils";
import { useAuth } from "../../../auth/AuthContext";
import StockAdjustmentStatusBadge from "../../../components/inventory/StockAdjustmentStatusBadge";
import StockAdjustmentTypeBadge from "../../../components/inventory/StockAdjustmentTypeBadge";
import StockAdjustmentPostedStatusBadge from "../../../components/inventory/StockAdjustmentPostedStatusBadge";
import StockAdjustmentActionButtons from "../../../components/inventory/StockAdjustmentActionButtons";
import StockAdjustmentTotalsCard from "../../../components/inventory/StockAdjustmentTotalsCard";
import SubmitStockAdjustmentModal from "./SubmitStockAdjustmentModal";
import ApproveStockAdjustmentModal from "./ApproveStockAdjustmentModal";
import RejectStockAdjustmentModal from "./RejectStockAdjustmentModal";
import PostStockAdjustmentConfirmModal from "./PostStockAdjustmentConfirmModal";
import VarianceQuantityBadge from "../../../components/inventory/VarianceQuantityBadge";
import AdjustmentDirectionBadge from "../../../components/inventory/AdjustmentDirectionBadge";

const StockAdjustmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [adjustment, setAdjustment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    if (!hasPermission("inventory.stock_adjustment.view")) {
      toast.error("You do not have permission to view stock adjustments");
      navigate("/inventory/stock-adjustments");
    }
  }, [hasPermission]);

  useEffect(() => {
    fetchAdjustment();
  }, [id]);

  const fetchAdjustment = async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getStockAdjustmentById(id);
      if (res.success !== false) {
        setAdjustment(res.data);
      }
    } catch (err) {
      toast.error("Failed to load adjustment details");
      navigate("/inventory/stock-adjustments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete adjustment ${adjustment?.adjustment_number}?`)) {
      try {
        await inventoryApi.deleteStockAdjustment(adjustment.id);
        toast.success("Adjustment deleted successfully");
        navigate("/inventory/stock-adjustments");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete adjustment");
      }
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!adjustment) return <div className="p-6 text-red-500">Adjustment not found</div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/inventory/stock-adjustments")}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-navy-800 dark:border-navy-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {adjustment.adjustment_number}
              </h1>
              <StockAdjustmentStatusBadge status={adjustment.approval_status} />
              <StockAdjustmentPostedStatusBadge status={adjustment.posted_status} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              Created {formatDate(adjustment.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-navy-800 p-2 rounded-xl border border-gray-200 dark:border-navy-700 shadow-sm">
          <StockAdjustmentActionButtons
            adjustment={adjustment}
            onDelete={handleDelete}
            onSubmit={() => setIsSubmitModalOpen(true)}
            onApprove={() => setIsApproveModalOpen(true)}
            onReject={() => setIsRejectModalOpen(true)}
            onPost={() => setIsPostModalOpen(true)}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Lines */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Branch Info */}
            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Branch</h3>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {adjustment.branch?.branch_name || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Warehouse Info */}
            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Warehouse</h3>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {adjustment.warehouse?.warehouse_name || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Type Info */}
            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <GitMerge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Adjustment Type</h3>
                  <div className="mt-0.5">
                    <StockAdjustmentTypeBadge type={adjustment.adjustment_type} />
                  </div>
                </div>
              </div>
            </div>

            {/* Date Info */}
            <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Adjustment Date</h3>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(adjustment.adjustment_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <StockAdjustmentTotalsCard
             totalQuantityIn={adjustment.total_quantity_in}
             totalQuantityOut={adjustment.total_quantity_out}
             totalStockValue={adjustment.total_stock_value}
             lineCount={adjustment.lines?.length || 0}
          />

          {/* Additional Details */}
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Additional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {adjustment.reference_number || adjustment.reference_no ? (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Reference Number</span>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{adjustment.reference_number || adjustment.reference_no}</p>
                </div>
              ) : null}

              {adjustment.reason && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Adjustment Reason</span>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{adjustment.reason}</p>
                </div>
              )}

              {adjustment.created_by_user?.name && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Created By</span>
                  <p className="text-sm text-gray-900 dark:text-white">{adjustment.created_by_user.name}</p>
                </div>
              )}

              {adjustment.approved_by_user?.name && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Approved By</span>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {adjustment.approved_by_user.name} {adjustment.approved_at ? `on ${formatDate(adjustment.approved_at)}` : ""}
                  </p>
                </div>
              )}

              {adjustment.posted_by_user?.name && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Posted By</span>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {adjustment.posted_by_user.name} {adjustment.posted_at ? `on ${formatDate(adjustment.posted_at)}` : ""}
                  </p>
                </div>
              )}

              {adjustment.remarks && (
                <div className="sm:col-span-2 md:col-span-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Remarks</span>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-navy-900 p-3 rounded-lg border border-gray-100 dark:border-navy-700">
                    {adjustment.remarks}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation links if posted */}
            {adjustment.posted_status === "posted" && (
              <div className="border-t border-gray-100 dark:border-navy-700 mt-6 pt-4 flex flex-wrap gap-3">
                <Link
                  to={`/inventory/stock-ledger?product_id=${adjustment.lines?.[0]?.product_id || ""}&warehouse_id=${adjustment.warehouse_id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-navy-700 dark:text-brand-400 dark:hover:bg-navy-600 transition-colors border border-transparent dark:border-navy-600"
                >
                  View Stock Ledger
                </Link>
                <Link
                  to={`/inventory/stock-balances?search=${adjustment.lines?.[0]?.product?.product_name || ""}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-navy-700 dark:text-brand-400 dark:hover:bg-navy-600 transition-colors border border-transparent dark:border-navy-600"
                >
                  View Stock Balances
                </Link>
              </div>
            )}
          </div>

          {/* Lines Table */}
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-800/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Adjustment Lines</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-navy-800/50 border-b border-gray-200 dark:border-navy-700">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Batch</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                    
                    {adjustment.adjustment_type === "physical_count" ? (
                      <>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">System Qty</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Physical Qty</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Variance Qty</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">System Qty</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Adj Qty</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Direction</th>
                      </>
                    )}
                    
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Unit Cost</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total Cost</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Line Reason</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Line Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {adjustment.lines?.map((line: any) => {
                    const absQty = Math.abs(parseFloat(line.variance_quantity !== undefined ? line.variance_quantity : line.quantity || 0));
                    const totalCost = absQty * parseFloat(line.unit_cost || 0);

                    return (
                      <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{line.product?.product_name}</p>
                          <p className="text-xs text-gray-500">{line.product?.product_code}</p>
                        </td>
                        <td className="px-4 py-3">
                          {line.product_batch || line.batch ? (
                            <>
                              <p className="font-medium text-gray-900 dark:text-white">{(line.product_batch || line.batch).batch_number}</p>
                              {(line.product_batch || line.batch).expiry_date && (
                                <p className="text-xs text-gray-500">Exp: {formatDate((line.product_batch || line.batch).expiry_date)}</p>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {line.warehouse_location?.location_name || "-"}
                          </span>
                        </td>

                        {adjustment.adjustment_type === "physical_count" ? (
                          <>
                             <td className="px-4 py-3 text-right">
                              <span className="text-sm text-gray-500">{parseFloat(line.system_quantity || 0).toFixed(3)}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {parseFloat(line.physical_quantity || 0).toFixed(3)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                               <VarianceQuantityBadge variance={line.variance_quantity !== undefined ? line.variance_quantity : line.quantity} />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-gray-500">{parseFloat(line.system_quantity || 0).toFixed(3)}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {absQty.toFixed(3)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                               <AdjustmentDirectionBadge direction={line.adjustment_direction} />
                            </td>
                          </>
                        )}

                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatCurrency(line.unit_cost || 0)}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(totalCost)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {line.line_reason || line.reason || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {line.line_remarks || line.remarks || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Approval History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Approval History</h3>
            
            {adjustment.approvals && adjustment.approvals.length > 0 ? (
              <div className="space-y-4">
                {adjustment.approvals.map((approval: any) => (
                  <div key={approval.id} className="relative pl-4 pb-4 border-l border-gray-200 dark:border-navy-600 last:border-0 last:pb-0">
                    <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${
                      approval.action === "submitted" ? "bg-indigo-500" :
                      approval.action === "approved" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    
                    <div className="mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white mr-2">
                        {approval.action.charAt(0).toUpperCase() + approval.action.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(approval.created_at)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      by {approval.user?.first_name} {approval.user?.last_name}
                    </div>
                    
                    {approval.remarks && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-navy-900 rounded text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-navy-700">
                        {approval.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No approval history yet.</p>
            )}
          </div>
        </div>
      </div>

      <SubmitStockAdjustmentModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        adjustment={adjustment}
        onSuccess={fetchAdjustment}
      />
      <ApproveStockAdjustmentModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        adjustment={adjustment}
        onSuccess={fetchAdjustment}
      />
      <RejectStockAdjustmentModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        adjustment={adjustment}
        onSuccess={fetchAdjustment}
      />
      <PostStockAdjustmentConfirmModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        adjustment={adjustment}
        onSuccess={fetchAdjustment}
      />
    </div>
  );
};

export default StockAdjustmentDetailsPage;
