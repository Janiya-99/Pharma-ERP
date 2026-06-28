import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, PackageSearch, ListTree } from "lucide-react";
import { toast } from "react-hot-toast";
import { inventoryApi } from "api/inventoryApi";
import OpeningStockStatusBadge from "../../../components/inventory/OpeningStockStatusBadge";
import InventoryPostedStatusBadge from "../../../components/inventory/InventoryPostedStatusBadge";
import OpeningStockActionButtons from "../../../components/inventory/OpeningStockActionButtons";
import OpeningStockTotalsCard from "../../../components/inventory/OpeningStockTotalsCard";
import SubmitOpeningStockModal from "./SubmitOpeningStockModal";
import ApproveOpeningStockModal from "./ApproveOpeningStockModal";
import RejectOpeningStockModal from "./RejectOpeningStockModal";
import PostOpeningStockConfirmModal from "./PostOpeningStockConfirmModal";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
} from "lib/utils";

const OpeningStockEntryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getOpeningStockEntryById(id);
      setEntry((res as any).data?.data || (res as any).data);
    } catch (error: any) {
      toast.error("Failed to load details");
      navigate("/inventory/opening-stock");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this draft entry?")) {
      try {
        await inventoryApi.deleteOpeningStockEntry(id);
        toast.success("Entry deleted successfully");
        navigate("/inventory/opening-stock");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!entry) return <div className="p-6 text-center">Entry not found</div>;

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/inventory/opening-stock")}
            className="rounded-full bg-white p-2 shadow transition-colors hover:bg-gray-50 dark:bg-navy-800 dark:hover:bg-navy-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
                {entry.opening_stock_number}
              </h1>
              <OpeningStockStatusBadge status={entry.approval_status} />
              <InventoryPostedStatusBadge status={entry.posted_status} />
            </div>
            <p className="flex gap-4 text-sm text-gray-500">
              <span>Date: {formatDate(entry.opening_stock_date)}</span>
              {entry.reference_number && (
                <span>Ref: {entry.reference_number}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {entry.posted_status === "posted" && (
            <div className="flex gap-2">
              <Link
                to={`/inventory/stock-balances?warehouse_id=${entry.warehouse_id}`}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
              >
                <PackageSearch className="h-4 w-4" />
                View Stock
              </Link>
              <Link
                to={`/inventory/stock-ledger?source_type=opening_stock&source_id=${entry.id}`}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700"
              >
                <ListTree className="h-4 w-4" />
                View Ledger
              </Link>
            </div>
          )}

          <OpeningStockActionButtons
            entry={entry}
            onDelete={handleDelete}
            onSubmit={() => setIsSubmitOpen(true)}
            onApprove={() => setIsApproveOpen(true)}
            onReject={() => setIsRejectOpen(true)}
            onPost={() => setIsPostOpen(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-navy-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Document Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Branch
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {entry.branch?.branch_name || entry.branch_id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Warehouse
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {entry.warehouse?.warehouse_name || entry.warehouse_id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Remarks
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {entry.remarks || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created By
                </p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {entry.creator?.first_name} {entry.creator?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(entry.created_at)}
                </p>
              </div>
              {entry.approved_by && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Approved By
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {entry.approver?.first_name} {entry.approver?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(entry.approved_at)}
                  </p>
                </div>
              )}
              {entry.posted_by && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Posted By
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {entry.poster?.first_name} {entry.poster?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(entry.posted_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-navy-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Line Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 font-medium text-gray-600 dark:bg-navy-900 dark:text-gray-300">
                  <tr>
                    <th className="border-b px-4 py-3 dark:border-navy-700">
                      #
                    </th>
                    <th className="border-b px-4 py-3 dark:border-navy-700">
                      Product
                    </th>
                    <th className="border-b px-4 py-3 dark:border-navy-700">
                      Batch
                    </th>
                    <th className="border-b px-4 py-3 dark:border-navy-700">
                      Location
                    </th>
                    <th className="border-b px-4 py-3 text-right dark:border-navy-700">
                      Qty
                    </th>
                    <th className="border-b px-4 py-3 text-right dark:border-navy-700">
                      Unit Cost
                    </th>
                    <th className="border-b px-4 py-3 text-right dark:border-navy-700">
                      Total Cost
                    </th>
                    <th className="border-b px-4 py-3 dark:border-navy-700">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {entry.lines?.map((line: any, idx: number) => (
                    <tr
                      key={line.id}
                      className="hover:bg-gray-50 dark:hover:bg-navy-800/50"
                    >
                      <td className="px-4 py-3 text-gray-500">
                        {line.line_order || idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {line.product?.product_code}
                        </p>
                        <p className="text-xs text-gray-500">
                          {line.product?.product_name}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {line.product_batch ? (
                          <>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {line.product_batch.batch_number}
                            </p>
                            <p className="text-xs text-gray-500">
                              Exp: {formatDate(line.product_batch.expiry_date)}
                            </p>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {line.warehouse_location?.location_name || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatNumber(line.quantity, 3)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        {formatCurrency(line.unit_cost)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-brand-600 dark:text-brand-400">
                        {formatCurrency(line.total_cost)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {line.line_remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {entry.approvals && entry.approvals.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
              <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4 dark:border-navy-700">
                <Clock className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Approval History
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {entry.approvals.map((approval: any) => (
                    <div key={approval.id} className="relative flex gap-4">
                      <div className="absolute -bottom-6 left-2.5 top-8 w-px bg-gray-200 last:hidden dark:bg-navy-700" />
                      <div
                        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          approval.action === "approved"
                            ? "bg-green-100 text-green-600"
                            : approval.action === "rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <div className="h-2 w-2 rounded-full fill-current" />
                      </div>
                      <div className="flex flex-col pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize text-gray-900 dark:text-white">
                            {approval.action}
                          </span>
                          <span className="text-sm text-gray-500">by</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {approval.user?.first_name}{" "}
                            {approval.user?.last_name}
                          </span>
                          <span className="ml-2 text-sm text-gray-400">
                            {formatDateTime(approval.action_date)}
                          </span>
                        </div>
                        {approval.remarks && (
                          <div className="mt-1 rounded-lg bg-gray-50 p-2 text-sm text-gray-600 dark:bg-navy-900 dark:text-gray-400">
                            {approval.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-1">
          <OpeningStockTotalsCard
            totalQuantity={entry.total_quantity}
            totalStockValue={entry.total_stock_value}
            lineCount={entry.lines?.length || 0}
          />
        </div>
      </div>

      <SubmitOpeningStockModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        entryId={entry.id}
        onSuccess={fetchData}
      />
      <ApproveOpeningStockModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        entryId={entry.id}
        onSuccess={fetchData}
      />
      <RejectOpeningStockModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        entryId={entry.id}
        onSuccess={fetchData}
      />
      <PostOpeningStockConfirmModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        entryId={entry.id}
        entryInfo={entry}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default OpeningStockEntryDetailsPage;
