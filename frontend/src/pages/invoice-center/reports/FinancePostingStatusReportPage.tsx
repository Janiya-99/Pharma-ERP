import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { ReportPageShell } from "@/components/invoice-center/reports/ReportPageShell";
import { ReportFilterBar } from "@/components/invoice-center/reports/ReportFilterBar";
import {
  ReportSummaryCards,
  SummaryCardItem,
} from "@/components/invoice-center/reports/ReportSummaryCards";
import {
  ReportDataTable,
  ColumnDef,
} from "@/components/invoice-center/reports/ReportDataTable";
import { ReportPermissionState } from "@/components/invoice-center/reports/ReportPermissionState";
import { ReportExportActions } from "@/components/invoice-center/reports/ReportExportActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FinancePostingStatusReportParams,
  FinancePostingStatusReportRow,
} from "@/types/invoice-center-reports";
import { normalizeReportEnvelope } from "@/utils/reportResponse";
import { toast } from "sonner";
import {
  UploadCloud,
  DownloadCloud,
  AlertTriangle,
  FileCheck,
} from "lucide-react";

export const FinancePostingStatusReportPage: React.FC = () => {
  const [filters, setFilters] = useState<FinancePostingStatusReportParams>({
    page: 1,
    limit: 10,
    search: "",
    document_type: "all",
    finance_post_status: "all",
  });

  const [data, setData] = useState<{
    summary: any;
    rows: FinancePostingStatusReportRow[];
  } | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasPermission(true);

      const cleanFilters = { ...filters };
      if (cleanFilters.document_type === "all")
        delete cleanFilters.document_type;
      if (cleanFilters.finance_post_status === "all")
        delete cleanFilters.finance_post_status;

      const res = await invoiceCenterApi.getFinancePostingStatusReport(
        cleanFilters
      );
      setData(normalizeReportEnvelope<any, FinancePostingStatusReportRow>(res.data?.data));
      if (res.data?.pagination) {
        setPagination({
          total: res.data.pagination.total,
          page: res.data.pagination.page,
          limit: res.data.pagination.limit,
          totalPages: res.data.pagination.total_pages,
        });
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setHasPermission(false);
      } else {
        toast.error(
          err.response?.data?.message || "Failed to load report data"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.page]);

  const handleApplyFilters = () => {
    if (filters.page === 1) {
      fetchData();
    } else {
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      document_type: "all",
      finance_post_status: "all",
    });
    setTimeout(() => handleApplyFilters(), 0);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(val || 0);
  };

  const columns: ColumnDef<FinancePostingStatusReportRow>[] = [
    { header: "Document No.", accessorKey: "document_number" },
    {
      header: "Type",
      cell: (row) => <Badge variant="outline">{row.document_type}</Badge>,
      align: "center",
    },
    { header: "Date", accessorKey: "document_date" },
    { header: "Customer Name", accessorKey: "customer_name" },
    {
      header: "Amount",
      cell: (row) => (
        <span className="font-semibold text-navy-900">
          {formatMoney(row.document_amount)}
        </span>
      ),
      align: "right",
    },
    {
      header: "Posting Status",
      cell: (row) => (
        <Badge
          variant={
            row.finance_post_status === "posted"
              ? "default"
              : row.finance_post_status === "failed"
              ? "destructive"
              : "secondary"
          }
        >
          {row.finance_post_status}
        </Badge>
      ),
      align: "center",
    },
    { header: "Posted Date", accessorKey: "posted_date" },
    { header: "Journal Entry", accessorKey: "journal_entry_number" },
  ];

  if (!hasPermission) {
    return (
      <div className="p-8">
        <ReportPermissionState />
      </div>
    );
  }

  const summary = data?.summary || {};
  const summaryCards: SummaryCardItem[] = [
    {
      title: "Total Documents",
      value: summary.total_documents || 0,
      format: "number",
      icon: <FileCheck className="h-4 w-4" />,
    },
    {
      title: "Posted to Finance",
      value: summary.posted_count || 0,
      format: "number",
      icon: <UploadCloud className="text-emerald-500 h-4 w-4" />,
    },
    {
      title: "Unposted Documents",
      value: summary.unposted_count || 0,
      format: "number",
      icon: <DownloadCloud className="h-4 w-4 text-amber-500" />,
    },
    {
      title: "Failed Postings",
      value: summary.failed_count || 0,
      format: "number",
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
    },
  ];

  return (
    <ReportPageShell
      title="Finance Posting Status"
      description="View the GL posting status for all operational documents."
      actions={
        <ReportExportActions
          data={data}
          filename={`finance-posting-status-${
            new Date().toISOString().split("T")[0]
          }`}
          disabled={isLoading || !data || data.rows.length === 0}
        />
      }
      filters={
        <ReportFilterBar
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isLoading={isLoading}
        >
          <div className="space-y-1">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search documents..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_from">Date From</Label>
            <Input
              id="date_from"
              type="date"
              value={filters.date_from || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date_from: e.target.value }))
              }
             placeholder="Enter Date From" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_to">Date To</Label>
            <Input
              id="date_to"
              type="date"
              value={filters.date_to || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date_to: e.target.value }))
              }
             placeholder="Enter Date To" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="document_type">Document Type</Label>
            <Select
              value={filters.document_type || "all"}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, document_type: val }))
              }
            >
              <SelectTrigger id="document_type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SALES_INVOICE">Sales Invoice</SelectItem>
                <SelectItem value="CREDIT_NOTE">Credit Note</SelectItem>
                <SelectItem value="DEBIT_NOTE">Debit Note</SelectItem>
                <SelectItem value="CUSTOMER_RECEIPT">
                  Customer Receipt
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="posting_status">Posting Status</Label>
            <Select
              value={filters.finance_post_status || "all"}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, finance_post_status: val }))
              }
            >
              <SelectTrigger id="posting_status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ReportFilterBar>
      }
      summary={
        <ReportSummaryCards items={summaryCards} isLoading={isLoading} />
      }
      table={
        <ReportDataTable
          columns={columns}
          data={data?.rows || []}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      }
    />
  );
};
