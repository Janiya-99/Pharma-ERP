import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { inventoryApi } from "../../../api/inventoryApi";
import { ArrowLeft, Box, ListChecks } from "lucide-react";
import StockTransferStatusBadge from "../../../components/inventory/StockTransferStatusBadge";
import StockTransferPostedStatusBadge from "../../../components/inventory/StockTransferPostedStatusBadge";
import StockTransferActionButtons from "../../../components/inventory/StockTransferActionButtons";
import WarehouseTransferDirection from "../../../components/inventory/WarehouseTransferDirection";
import StockTransferTotalsCard from "../../../components/inventory/StockTransferTotalsCard";
import SubmitStockTransferModal from "./SubmitStockTransferModal";
import ApproveStockTransferModal from "./ApproveStockTransferModal";
import RejectStockTransferModal from "./RejectStockTransferModal";
import PostStockTransferConfirmModal from "./PostStockTransferConfirmModal";
import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../../../lib/utils";

import { StockTransfer, ApiResponse } from "../../../types/inventory";

const StockTransferDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<StockTransfer | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    fetchTransfer();
  }, [id]);

  const fetchTransfer = async () => {
    try {
      setLoading(true);
      const res = (await inventoryApi.getStockTransferById(
        id!
      )) as unknown as ApiResponse<StockTransfer>;
      if (res.success !== false && res.data) {
        setTransfer(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch transfer", err);
      navigate("/inventory/stock-transfers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this stock transfer draft?"
      )
    )
      return;
    try {
      await inventoryApi.deleteStockTransfer(id!);
      navigate("/inventory/stock-transfers");
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!transfer) return <div className="p-6">Stock Transfer not found.</div>;

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/inventory/stock-transfers")}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-700 dark:border-navy-700 dark:bg-navy-800 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {transfer.reference_no || `Stock Transfer #${transfer.id}`}
              </h1>
              <StockTransferStatusBadge status={transfer.approval_status} />
              <StockTransferPostedStatusBadge status={transfer.posted_status} />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Date: {formatDate(transfer.transfer_date)}
            </p>
          </div>
        </div>

        <StockTransferActionButtons
          approvalStatus={transfer.approval_status}
          postedStatus={transfer.posted_status}
          onEdit={() =>
            navigate(`/inventory/stock-transfers/${transfer.id}/edit`)
          }
          onDelete={handleDelete}
          onSubmit={() => setIsSubmitModalOpen(true)}
          onApprove={() => setIsApproveModalOpen(true)}
          onReject={() => setIsRejectModalOpen(true)}
          onPost={() => setIsPostModalOpen(true)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-3">
          {/* Header Info */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <WarehouseTransferDirection
              fromWarehouse={transfer.source_warehouse}
              toWarehouse={transfer.destination_warehouse}
            />

            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Remarks
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {transfer.remarks || "No remarks provided."}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-navy-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transfer Line Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] whitespace-nowrap text-left text-sm">
                <thead className="bg-gray-50 font-medium text-gray-600 dark:bg-navy-800/50 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Batch</th>
                    <th className="px-6 py-3">Source Location</th>
                    <th className="px-6 py-3">Dest. Location</th>
                    <th className="px-6 py-3 text-right">Qty</th>
                    <th className="px-6 py-3 text-right">Unit Cost</th>
                    <th className="px-6 py-3 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {transfer.lines?.map((line: any) => (
                    <tr
                      key={line.id}
                      className="hover:bg-gray-50 dark:hover:bg-navy-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {line.product?.product_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {line.product?.product_code}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {line.product_batch ? (
                          <>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {line.product_batch.batch_number}
                            </div>
                            <div className="text-xs text-gray-500">
                              Exp: {formatDate(line.product_batch.expiry_date)}
                            </div>
                          </>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {line.source_location?.location_name || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {line.destination_location?.location_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {formatNumber(line.transfer_quantity, 3)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatCurrency(line.unit_cost)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-brand-600 dark:text-brand-400">
                        {formatCurrency(line.line_total_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval History */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Approval History
            </h3>
            <div className="space-y-4">
              {(transfer as any).approval_history?.map(
                (appr: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900/50"
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {appr.action_by_user?.first_name}{" "}
                          {appr.action_by_user?.last_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(appr.action_at)}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            appr.action === "submitted"
                              ? "bg-blue-100 text-blue-800"
                              : appr.action === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {appr.action.toUpperCase()}
                        </span>
                      </div>
                      {appr.remarks && (
                        <p className="rounded border border-gray-200 bg-white p-2 text-sm text-gray-600 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300">
                          "{appr.remarks}"
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
              {(!(transfer as any).approval_history ||
                (transfer as any).approval_history.length === 0) && (
                <p className="text-sm italic text-gray-500">
                  No approval history yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StockTransferTotalsCard
            totalQuantity={transfer.total_quantity}
            totalStockValue={transfer.total_stock_value}
            lineCount={transfer.lines?.length || 0}
          />

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link
                to="/inventory/stock-balances"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
              >
                <Box className="h-4 w-4" />
                View Stock Balances
              </Link>
              <Link
                to="/inventory/stock-ledger"
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
              >
                <ListChecks className="h-4 w-4" />
                View Stock Ledger
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
              Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDateTime(transfer.created_at)}
                </span>
              </div>
              {transfer.approved_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Approved:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(transfer.approved_at)}
                  </span>
                </div>
              )}
              {transfer.posted_at && (
                <div className="flex justify-between font-medium text-green-600">
                  <span>Posted:</span>
                  <span>{formatDateTime(transfer.posted_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SubmitStockTransferModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        transferId={transfer.id}
        onSuccess={fetchTransfer}
      />

      <ApproveStockTransferModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        transferId={transfer.id}
        onSuccess={fetchTransfer}
      />

      <RejectStockTransferModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        transferId={transfer.id}
        onSuccess={fetchTransfer}
      />

      <PostStockTransferConfirmModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        transfer={transfer}
        onSuccess={fetchTransfer}
      />
    </div>
  );
};

export default StockTransferDetailsPage;
