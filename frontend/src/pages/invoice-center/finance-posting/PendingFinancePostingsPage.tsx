import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, RefreshCw, Filter } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import invoiceCenterApi from "../../../api/invoiceCenterApi";
import {
  FinancePostStatusBadge,
  FinancePostingDocumentTypeBadge,
  FinancePostingActionButtons,
} from "../../../components/invoice-center";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "../../../lib/utils";
import PostToFinanceConfirmModal from "./PostToFinanceConfirmModal";
import type { PendingFinancePosting, InvoiceCenterFinancePostingDocumentType } from "../../../types/invoice-center";

interface Props {
  onPostingComplete?: () => void;
}

const PendingFinancePostingsPage: React.FC<Props> = ({ onPostingComplete }) => {
  const { activeSoftware } = useAuth();
  const [data, setData] = useState<PendingFinancePosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal
  const [selectedDocument, setSelectedDocument] = useState<PendingFinancePosting | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (activeSoftware?.software_code !== "INVOICE_CENTER") return;
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (documentTypeFilter) params.document_type = documentTypeFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await invoiceCenterApi.getPendingFinancePostings(params);
      const res = response as any;
      if (res.data?.success) {
        setData(Array.isArray(res.data.data) ? res.data.data : []);
        setTotalRecords(res.data.pagination?.total || 0);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load pending postings");
    } finally {
      setLoading(false);
    }
  }, [activeSoftware, page, limit, documentTypeFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostSuccess = () => {
    fetchData();
    onPostingComplete?.();
  };

  const totalPages = Math.ceil(totalRecords / limit);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="flex items-center justify-center h-32">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Please switch to Invoice Center module to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Document Type</label>
          <Select value={documentTypeFilter} onValueChange={(v) => { setDocumentTypeFilter(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sales_invoice">Sales Invoice</SelectItem>
              <SelectItem value="credit_note">Credit Note</SelectItem>
              <SelectItem value="debit_note">Debit Note</SelectItem>
              <SelectItem value="customer_receipt">Customer Receipt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Date From</label>
          <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-40 h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-500 font-medium">Date To</label>
          <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-40 h-9 text-sm" />
        </div>
        <Button variant="outline" size="sm" onClick={() => { setDocumentTypeFilter(""); setDateFrom(""); setDateTo(""); setPage(1); }} className="h-9">
          <Filter className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="h-9 ml-auto">
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No pending finance postings found</p>
          <p className="text-xs text-gray-400 mt-1">All operationally posted documents have been posted to Finance, or none are available yet.</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Document #</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 uppercase">Finance</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((item, idx) => (
                  <tr key={`${item.document_type}-${item.document_id}-${idx}`} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2.5">
                      <FinancePostingDocumentTypeBadge type={item.document_type} />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-900">{item.document_number}</td>
                    <td className="px-3 py-2.5 text-gray-600">{formatDate(item.document_date)}</td>
                    <td className="px-3 py-2.5 text-gray-600">{item.customer_name || "—"}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">{formatCurrency(item.total_amount)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="text-xs text-gray-500">{item.operational_posted_status}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <FinancePostStatusBadge status={item.finance_post_status} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <FinancePostingActionButtons
                        documentType={item.document_type}
                        documentId={item.document_id}
                        financePostStatus={item.finance_post_status}
                        onPostToFinance={() => {
                          setSelectedDocument(item);
                          setModalOpen(true);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalRecords)} of {totalRecords}
            </p>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Post Confirmation Modal */}
      <PostToFinanceConfirmModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        document={selectedDocument}
        onSuccess={handlePostSuccess}
      />
    </div>
  );
};

export default PendingFinancePostingsPage;
