import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Box, ListChecks } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";
import GRNStatusBadge from "../../../components/inventory/GRNStatusBadge";
import GRNPostedStatusBadge from "../../../components/inventory/GRNPostedStatusBadge";
import GRNActionButtons from "../../../components/inventory/GRNActionButtons";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
} from "../../../lib/utils";

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
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/inventory/grns")}
            className="rounded-full bg-white p-2 shadow transition-colors hover:bg-gray-50 dark:bg-navy-800 dark:hover:bg-navy-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-navy-700 dark:text-white">
              GRN: {grn.grn_number}
              <GRNStatusBadge status={grn.approval_status} />
              <GRNPostedStatusBadge status={grn.posted_status} />
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Date: {formatDate(grn.grn_date)} | Supplier:{" "}
              {grn.supplier?.supplier_name || `#${grn.supplier_id}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <GRNActionButtons
            grn={grn}
            onDelete={handleDelete}
            onSubmit={() => setIsSubmitModalOpen(true)}
            onApprove={() => setIsApproveModalOpen(true)}
            onReject={() => setIsRejectModalOpen(true)}
            onPost={() => setIsPostModalOpen(true)}
          />

          <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-navy-600"></div>

          {hasPermission("inventory.stock_ledger.view") &&
            grn.posted_status === "posted" && (
              <Link
                to={`/inventory/stock-ledger?source_type=grn&source_number=${grn.grn_number}`}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
              >
                <ListChecks className="h-4 w-4" /> Stock Ledger
              </Link>
            )}

          {hasPermission("inventory.stock_balance.view") && (
            <Link
              to={`/inventory/stock-balances?warehouse_id=${grn.warehouse_id}`}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              <Box className="h-4 w-4" /> Stock Balances
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900 dark:border-navy-700 dark:text-white">
              Document Info
            </h3>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-3">
              <div>
                <span className="mb-1 block text-gray-500 dark:text-gray-400">
                  Branch
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {grn.branch?.branch_name || `#${grn.branch_id}`}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-gray-500 dark:text-gray-400">
                  Warehouse
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {grn.warehouse?.warehouse_name || `#${grn.warehouse_id}`}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-gray-500 dark:text-gray-400">
                  Supplier Inv. No
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {grn.supplier_invoice_number || "N/A"}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-gray-500 dark:text-gray-400">
                  Supplier Inv. Date
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {grn.supplier_invoice_date
                    ? formatDate(grn.supplier_invoice_date)
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-gray-500 dark:text-gray-400">
                  PO Number
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {grn.purchase_order_number || "N/A"}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-gray-500 dark:text-gray-400">
                  Ref Number
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {grn.reference_number || "N/A"}
                </span>
              </div>
              <div className="col-span-2 md:col-span-3">
                <span className="mb-1 block text-gray-500 dark:text-gray-400">
                  Remarks
                </span>
                <span className="whitespace-pre-wrap font-medium text-gray-900 dark:text-white">
                  {grn.remarks || "None"}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <div className="border-b border-gray-100 p-4 dark:border-navy-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Line Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 font-medium text-gray-600 dark:bg-navy-800/50 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="min-w-[200px] px-4 py-3">Product</th>
                    <th className="min-w-[150px] px-4 py-3">Batch</th>
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
                  {grn.lines &&
                    grn.lines.map((line: unknown, idx: unknown) => {
                      const stockQty =
                        Number(line.quantity_received) +
                        Number(line.free_quantity);
                      const subT =
                        Number(line.quantity_received) * Number(line.unit_cost);
                      const lineT =
                        subT -
                        Number(line.discount_amount) +
                        Number(line.tax_amount);
                      const stockUC = stockQty > 0 ? lineT / stockQty : 0;

                      return (
                        <tr
                          key={line.id}
                          className="hover:bg-gray-50 dark:hover:bg-navy-800/50"
                        >
                          <td className="px-4 py-3">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">
                              {line.product?.product_name ||
                                `Product #${line.product_id}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {line.product?.product_code}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {line.product_batch ? (
                              <div>
                                <div className="font-medium">
                                  {line.product_batch.batch_number}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Exp:{" "}
                                  {formatDate(line.product_batch.expiry_date)}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-brand-600">
                                  {line.batch_number}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  New Batch
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatNumber(line.quantity_received, 3)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatNumber(line.free_quantity, 3)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatNumber(stockQty, 3)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(line.unit_cost)}
                          </td>
                          <td className="px-4 py-3 text-right text-red-500">
                            {formatCurrency(line.discount_amount)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">
                            {formatCurrency(line.tax_amount)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(lineT)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">
                            {formatCurrency(stockUC)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {grn.approvals && grn.approvals.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <h3 className="mb-4 border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900 dark:border-navy-700 dark:text-white">
                Approval History
              </h3>
              <div className="space-y-4">
                {grn.approvals.map((appr: unknown) => (
                  <div
                    key={appr.id}
                    className="flex gap-4 rounded-lg bg-gray-50 p-3 dark:bg-navy-900/50"
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                          {appr.action}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(appr.action_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="text-gray-400">By:</span>{" "}
                        {appr.action_by_user?.name || `#${appr.action_by}`}
                      </p>
                      {appr.remarks && (
                        <p className="mt-2 rounded border border-gray-100 bg-white p-2 text-sm text-gray-700 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-300">
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

        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-3 border-b pb-2 text-sm font-semibold text-gray-800 dark:border-navy-600 dark:text-white">
              Financial Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Total Quantity:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formatNumber(grn.total_quantity, 3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Total Free Qty:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formatNumber(grn.total_free_quantity, 3)}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-brand-600 dark:text-brand-400">
                  Total Stock Qty:
                </span>
                <span className="text-brand-600 dark:text-brand-400">
                  {formatNumber(grn.total_stock_quantity, 3)}
                </span>
              </div>

              <div className="my-2 h-px bg-gray-200 dark:bg-navy-600"></div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Subtotal Amount:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formatCurrency(grn.subtotal_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                <span>Discount Amount:</span>
                <span>- {formatCurrency(grn.discount_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Tax Amount:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formatCurrency(grn.tax_amount)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base font-bold dark:border-navy-600">
                <span className="text-brand-600 dark:text-brand-400">
                  Total Amount:
                </span>
                <span className="text-brand-600 dark:text-brand-400">
                  {formatCurrency(grn.total_amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900 dark:border-navy-700 dark:text-white">
              Record Timestamps
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDateTime(grn.created_at)}
                </span>
              </div>
              {grn.approved_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Approved:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(grn.approved_at)}
                  </span>
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
