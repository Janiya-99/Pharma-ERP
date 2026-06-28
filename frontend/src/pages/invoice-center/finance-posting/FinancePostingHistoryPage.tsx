import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, RefreshCw, Filter, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import invoiceCenterApi from "../../../api/invoiceCenterApi";
import {
  FinancePostingDocumentTypeBadge,
  FinancePostingTotalsBadge,
} from "../../../components/invoice-center";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { formatCurrency, formatDateTime } from "../../../lib/utils";
import type {
  InvoiceCenterFinancePostingHistory,
  InvoiceCenterFinancePostingDocumentType,
} from "../../../types/invoice-center";

const sourceDocumentRoutes: Record<
  InvoiceCenterFinancePostingDocumentType,
  string
> = {
  sales_invoice: "/admin/invoice-center/sales-invoices",
  credit_note: "/admin/invoice-center/credit-notes",
  debit_note: "/admin/invoice-center/debit-notes",
  customer_receipt: "/admin/invoice-center/customer-receipts",
};

interface Props {
  refreshKey?: number;
}

const FinancePostingHistoryPage: React.FC<Props> = ({ refreshKey }) => {
  const navigate = useNavigate();
  const { activeSoftware } = useAuth();
  const [data, setData] = useState<InvoiceCenterFinancePostingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("");
  const [documentNumberFilter, setDocumentNumberFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = useCallback(async () => {
    if (activeSoftware?.software_code !== "INVOICE_CENTER") return;
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (documentTypeFilter) params.document_type = documentTypeFilter;
      if (documentNumberFilter) params.document_number = documentNumberFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await invoiceCenterApi.getFinancePostingHistory(params);
      const res = response as any;
      if (res.data?.success) {
        setData(Array.isArray(res.data.data) ? res.data.data : []);
        setTotalRecords(res.data.pagination?.total || 0);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load posting history"
      );
    } finally {
      setLoading(false);
    }
  }, [
    activeSoftware,
    page,
    limit,
    documentTypeFilter,
    documentNumberFilter,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh when parent signals a new posting
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      fetchData();
    }
  }, [refreshKey]);

  const totalPages = Math.ceil(totalRecords / limit);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="flex h-32 items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please switch to Invoice Center module to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            Document Type
          </label>
          <Select
            value={documentTypeFilter}
            onValueChange={(v) => {
              setDocumentTypeFilter(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-44 text-sm">
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
          <label className="text-xs font-medium text-gray-500">
            Document #
          </label>
          <Input
            placeholder="Search document..."
            value={documentNumberFilter}
            onChange={(e) => {
              setDocumentNumberFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 w-40 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Date From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="h-9 w-40 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Date To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="h-9 w-40 text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDocumentTypeFilter("");
            setDocumentNumberFilter("");
            setDateFrom("");
            setDateTo("");
            setPage(1);
          }}
          className="h-9"
        >
          <Filter className="mr-1 h-3.5 w-3.5" />
          Clear
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="ml-auto h-9"
        >
          <RefreshCw
            className={`mr-1 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-3 h-12 w-12 text-gray-300" />
          <p className="font-medium text-gray-500">
            No finance posting history found
          </p>
          <p className="mt-1 text-xs text-gray-400">
            No documents have been posted to Finance yet.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Finance Ref #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Document #
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    Debit Total
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    Credit Total
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500">
                    Balance
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Posted At
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Remarks
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2.5 font-mono text-xs font-medium text-gray-900">
                      {item.finance_reference_number}
                    </td>
                    <td className="px-3 py-2.5">
                      <FinancePostingDocumentTypeBadge
                        type={item.document_type}
                      />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-900">
                      {item.document_number}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                      {formatCurrency(item.debit_total)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                      {formatCurrency(item.credit_total)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <FinancePostingTotalsBadge
                        debitTotal={item.debit_total}
                        creditTotal={item.credit_total}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">
                      {formatDateTime(item.posted_at)}
                    </td>
                    <td className="max-w-[120px] truncate px-3 py-2.5 text-xs text-gray-500">
                      {item.remarks || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const basePath =
                            sourceDocumentRoutes[item.document_type] || "";
                          navigate(`${basePath}/${item.document_id}`);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, totalRecords)} of {totalRecords}
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancePostingHistoryPage;
