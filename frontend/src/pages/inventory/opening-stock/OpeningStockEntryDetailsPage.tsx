import { useState, useEffect } from "react";
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
import { formatCurrency, formatNumber, formatDate, formatDateTime } from "lib/utils";

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
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/inventory/opening-stock")}
            className="p-2 bg-white  rounded-full shadow hover:bg-gray-50  transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 " />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-navy-700 ">
                {entry.opening_stock_number}
              </h1>
              <OpeningStockStatusBadge status={entry.approval_status} />
              <InventoryPostedStatusBadge status={entry.posted_status} />
            </div>
            <p className="text-sm text-gray-500 flex gap-4">
              <span>Date: {formatDate(entry.opening_stock_date)}</span>
              {entry.reference_number && <span>Ref: {entry.reference_number}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {entry.posted_status === "posted" && (
            <div className="flex gap-2">
              <Link
                to={`/inventory/stock-balances?warehouse_id=${entry.warehouse_id}`}
                className="flex items-center gap-2 px-3 py-2 bg-white  text-gray-700  border border-gray-200  rounded-xl hover:bg-gray-50  text-sm font-medium"
              >
                <PackageSearch className="h-4 w-4" />
                View Stock
              </Link>
              <Link
                to={`/inventory/stock-ledger?source_type=opening_stock&source_id=${entry.id}`}
                className="flex items-center gap-2 px-3 py-2 bg-white  text-gray-700  border border-gray-200  rounded-xl hover:bg-gray-50  text-sm font-medium"
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 ">
              <h3 className="text-lg font-semibold text-gray-900 ">Document Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 ">Branch</p>
                <p className="mt-1 text-sm text-gray-900  font-medium">{entry.branch?.branch_name || entry.branch_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 ">Warehouse</p>
                <p className="mt-1 text-sm text-gray-900  font-medium">{entry.warehouse?.warehouse_name || entry.warehouse_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 ">Remarks</p>
                <p className="mt-1 text-sm text-gray-900 ">{entry.remarks || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 ">Created By</p>
                <p className="mt-1 text-sm text-gray-900 ">{entry.creator?.first_name} {entry.creator?.last_name}</p>
                <p className="text-xs text-gray-500">{formatDateTime(entry.created_at)}</p>
              </div>
              {entry.approved_by && (
                <div>
                  <p className="text-sm font-medium text-gray-500 ">Approved By</p>
                  <p className="mt-1 text-sm text-gray-900 ">{entry.approver?.first_name} {entry.approver?.last_name}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(entry.approved_at)}</p>
                </div>
              )}
              {entry.posted_by && (
                <div>
                  <p className="text-sm font-medium text-gray-500 ">Posted By</p>
                  <p className="mt-1 text-sm text-gray-900 ">{entry.poster?.first_name} {entry.poster?.last_name}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(entry.posted_at)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 ">
              <h3 className="text-lg font-semibold text-gray-900 ">Line Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50  text-gray-600  font-medium">
                  <tr>
                    <th className="px-4 py-3 border-b ">#</th>
                    <th className="px-4 py-3 border-b ">Product</th>
                    <th className="px-4 py-3 border-b ">Batch</th>
                    <th className="px-4 py-3 border-b ">Location</th>
                    <th className="px-4 py-3 border-b  text-right">Qty</th>
                    <th className="px-4 py-3 border-b  text-right">Unit Cost</th>
                    <th className="px-4 py-3 border-b  text-right">Total Cost</th>
                    <th className="px-4 py-3 border-b ">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 ">
                  {entry.lines?.map((line: any, idx: number) => (
                    <tr key={line.id} className="hover:bg-gray-50 ">
                      <td className="px-4 py-3 text-gray-500">{line.line_order || idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 ">{line.product?.product_code}</p>
                        <p className="text-xs text-gray-500">{line.product?.product_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        {line.product_batch ? (
                          <>
                            <p className="text-gray-900  font-medium">{line.product_batch.batch_number}</p>
                            <p className="text-xs text-gray-500">Exp: {formatDate(line.product_batch.expiry_date)}</p>
                          </>
                        ) : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 ">{line.warehouse_location?.location_name || "-"}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 ">{formatNumber(line.quantity, 3)}</td>
                      <td className="px-4 py-3 text-right text-gray-700 ">{formatCurrency(line.unit_cost)}</td>
                      <td className="px-4 py-3 text-right font-medium text-brand-600 ">{formatCurrency(line.total_cost)}</td>
                      <td className="px-4 py-3 text-gray-600 ">{line.line_remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {entry.approvals && entry.approvals.length > 0 && (
            <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100  flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 ">Approval History</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {entry.approvals.map((approval: any) => (
                    <div key={approval.id} className="relative flex gap-4">
                      <div className="absolute left-2.5 top-8 -bottom-6 w-px bg-gray-200  last:hidden" />
                      <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        approval.action === "approved" ? "bg-green-100 text-green-600" :
                        approval.action === "rejected" ? "bg-red-100 text-red-600" :
                        "bg-indigo-100 text-indigo-600"
                      }`}>
                        <div className="h-2 w-2 rounded-full fill-current" />
                      </div>
                      <div className="flex flex-col pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900  capitalize">{approval.action}</span>
                          <span className="text-gray-500 text-sm">by</span>
                          <span className="font-medium text-gray-700 ">{approval.user?.first_name} {approval.user?.last_name}</span>
                          <span className="text-gray-400 text-sm ml-2">{formatDateTime(approval.action_date)}</span>
                        </div>
                        {approval.remarks && (
                          <div className="mt-1 text-sm text-gray-600  bg-gray-50  p-2 rounded-lg">
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

        <div className="lg:col-span-1 space-y-6">
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
