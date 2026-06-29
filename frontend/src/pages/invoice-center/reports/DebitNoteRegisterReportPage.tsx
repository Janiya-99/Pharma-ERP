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
  DebitNoteRegisterReportParams,
  DebitNoteRegisterReportRow,
} from "@/types/invoice-center-reports";
import { normalizeReportEnvelope } from "@/utils/reportResponse";
import { toast } from "sonner";
import { FileUp, Coins, UploadCloud, DownloadCloud } from "lucide-react";

export const DebitNoteRegisterReportPage: React.FC = () => {
  const [filters, setFilters] = useState<DebitNoteRegisterReportParams>({
    page: 1,
    limit: 10,
    search: "",
    debit_note_type: "all",
    approval_status: "all",
    posted_status: "all",
    finance_post_status: "all",
  });

  const [data, setData] = useState<{
    summary: any;
    rows: DebitNoteRegisterReportRow[];
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
      if (cleanFilters.debit_note_type === "all")
        delete cleanFilters.debit_note_type;
      if (cleanFilters.approval_status === "all")
        delete cleanFilters.approval_status;
      if (cleanFilters.posted_status === "all")
        delete cleanFilters.posted_status;
      if (cleanFilters.finance_post_status === "all")
        delete cleanFilters.finance_post_status;

      const res = await invoiceCenterApi.getDebitNoteRegisterReport(
        cleanFilters
      );
      setData(normalizeReportEnvelope<any, DebitNoteRegisterReportRow>(res.data?.data));
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
      debit_note_type: "all",
      approval_status: "all",
      posted_status: "all",
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

  const columns: ColumnDef<DebitNoteRegisterReportRow>[] = [
    { header: "DN Number", accessorKey: "debit_note_number" },
    { header: "Date", accessorKey: "debit_note_date" },
    { header: "Customer Name", accessorKey: "customer_name" },
    { header: "Inv No.", accessorKey: "sales_invoice_number" },
    {
      header: "Type",
      cell: (row) => <Badge variant="outline">{row.debit_note_type}</Badge>,
      align: "center",
    },
    {
      header: "Subtotal",
      cell: (row) => formatMoney(row.subtotal_amount),
      align: "right",
    },
    {
      header: "Tax",
      cell: (row) => formatMoney(row.tax_amount),
      align: "right",
    },
    {
      header: "Total",
      cell: (row) => (
        <span className="font-semibold text-navy-900">
          {formatMoney(row.total_amount)}
        </span>
      ),
      align: "right",
    },
    {
      header: "Approval",
      cell: (row) => (
        <Badge
          variant={
            row.approval_status === "approved"
              ? "default"
              : row.approval_status === "rejected"
              ? "destructive"
              : "secondary"
          }
        >
          {row.approval_status}
        </Badge>
      ),
      align: "center",
    },
    {
      header: "Posted",
      cell: (row) => (
        <Badge
          variant={row.posted_status === "posted" ? "default" : "secondary"}
        >
          {row.posted_status}
        </Badge>
      ),
      align: "center",
    },
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
      title: "Debit Note Count",
      value: summary.debit_note_count || 0,
      format: "number",
      icon: <FileUp className="h-4 w-4" />,
    },
    {
      title: "Total Amount",
      value: summary.total_amount || 0,
      format: "currency",
      icon: <Coins className="text-emerald-500 h-4 w-4" />,
    },
    {
      title: "Finance Posted",
      value: summary.finance_posted_count || 0,
      format: "number",
      icon: <UploadCloud className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Finance Unposted",
      value: summary.finance_unposted_count || 0,
      format: "number",
      icon: <DownloadCloud className="h-4 w-4 text-amber-500" />,
    },
  ];

  return (
    <ReportPageShell
      title="Debit Note Register"
      description="View all debit notes and their statuses."
      actions={
        <ReportExportActions
          data={data}
          filename={`debit-note-register-${
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
              placeholder="Search debit notes, customers..."
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
            />
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
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="debit_note_type">Type</Label>
            <Select
              value={filters.debit_note_type || "all"}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, debit_note_type: val }))
              }
            >
              <SelectTrigger id="debit_note_type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="price_adjustment">
                  Price Adjustment
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="posted_status">Posted Status</Label>
            <Select
              value={filters.posted_status || "all"}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, posted_status: val }))
              }
            >
              <SelectTrigger id="posted_status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unposted">Unposted</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
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
