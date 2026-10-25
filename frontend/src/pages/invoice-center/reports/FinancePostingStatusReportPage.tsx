import React, { useState, useEffect, useRef, useMemo } from "react";
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
  FinancePostingStatusReportParams,
  FinancePostingStatusReportRow,
  FinancePostingStatusReportSummary,
} from "@/types/invoice-center-reports";
import { normalizeReportEnvelope } from "@/utils/reportResponse";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import {
  UploadCloud,
  DownloadCloud,
  AlertTriangle,
  FileCheck,
  FileText,
  FileMinus,
  FilePlus,
  Receipt,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  X,
  TrendingUp,
  Layers,
  ArrowUpRight,
} from "lucide-react";

// Safe number helper
const safeNumber = (val: any): number => {
  if (val === null || val === undefined || val === "") return 0;
  const n = Number(val);
  return isNaN(n) || !isFinite(n) ? 0 : n;
};

const formatMoney = (val: any) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNumber(val));
};

const formatNumber = (val: any) => {
  return new Intl.NumberFormat("en-US").format(safeNumber(val));
};

const formatDate = (val?: string | null) => {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return String(val).split("T")[0];
  }
};

const formatDateTime = (val?: string | null) => {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).replace("T", " ").substring(0, 16);
    return d.toISOString().replace("T", " ").substring(0, 16);
  } catch {
    return String(val).replace("T", " ").substring(0, 16);
  }
};

// Document type badge helper
const getDocumentTypeConfig = (type?: string) => {
  const norm = (type || "").toLowerCase().replace(/[\s_-]+/g, "");
  if (norm.includes("invoice")) {
    return {
      label: "Sales Invoice",
      icon: FileText,
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80",
    };
  }
  if (norm.includes("receipt")) {
    return {
      label: "Customer Receipt",
      icon: Receipt,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    };
  }
  if (norm.includes("credit")) {
    return {
      label: "Credit Note",
      icon: FileMinus,
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
    };
  }
  if (norm.includes("debit")) {
    return {
      label: "Debit Note",
      icon: FilePlus,
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
    };
  }
  return {
    label: type || "Document",
    icon: FileText,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };
};

export const FinancePostingStatusReportPage: React.FC = () => {
  const [filters, setFilters] = useState<FinancePostingStatusReportParams>({
    page: 1,
    limit: 10,
    search: "",
    document_type: "all",
    finance_post_status: "all",
    date_from: "",
    date_to: "",
  });

  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<{
    summary: FinancePostingStatusReportSummary;
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

  const fetchData = async (overrideFilters?: FinancePostingStatusReportParams) => {
    try {
      setIsLoading(true);
      setHasPermission(true);

      const cleanFilters = { ...(overrideFilters || filters) };
      if (cleanFilters.document_type === "all") delete cleanFilters.document_type;
      if (cleanFilters.finance_post_status === "all") delete cleanFilters.finance_post_status;

      const res = await invoiceCenterApi.getFinancePostingStatusReport(cleanFilters);
      setData(
        normalizeReportEnvelope<FinancePostingStatusReportSummary, FinancePostingStatusReportRow>(
          res.data?.data
        )
      );
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
          err.response?.data?.message || "Failed to load finance posting report data"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const prev = prevFiltersRef.current;
    prevFiltersRef.current = filters;
    const nonPageChanged = Object.keys(filters).some(
      (k) => k !== "page" && (filters as any)[k] !== (prev as any)[k]
    );
    if (nonPageChanged && filters.page !== 1) {
      setFilters((p) => ({ ...p, page: 1 }));
    }
  }, [filters]);

  useEffect(() => {
    fetchData(debouncedFilters);
  }, [debouncedFilters]);

  const handleApplyFilters = () => {
    fetchData(filters);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      document_type: "all",
      finance_post_status: "all",
      date_from: "",
      date_to: "",
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleDatePreset = (preset: "today" | "week" | "month" | "all") => {
    const now = new Date();
    const formatYMD = (d: Date) => d.toISOString().split("T")[0];

    if (preset === "today") {
      const today = formatYMD(now);
      setFilters((p) => ({ ...p, date_from: today, date_to: today, page: 1 }));
    } else if (preset === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      setFilters((p) => ({ ...p, date_from: formatYMD(weekAgo), date_to: formatYMD(now), page: 1 }));
    } else if (preset === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setFilters((p) => ({ ...p, date_from: formatYMD(startOfMonth), date_to: formatYMD(now), page: 1 }));
    } else {
      setFilters((p) => ({ ...p, date_from: "", date_to: "", page: 1 }));
    }
  };

  // Safe calculated summary metrics
  const summary = data?.summary || {};
  const totalDocuments = safeNumber(summary.total_documents ?? summary.document_count);
  const postedCount = safeNumber(summary.posted_count ?? summary.finance_posted_count);
  const unpostedCount = safeNumber(summary.unposted_count ?? summary.finance_unposted_count);
  const failedCount = safeNumber(summary.failed_count ?? summary.finance_failed_count);
  const totalAmount = safeNumber(summary.total_amount);
  const postingRate = totalDocuments > 0 ? (postedCount / totalDocuments) * 100 : 0;

  // Breakdown distribution by document type from current data
  const typeBreakdown = useMemo(() => {
    if (!data?.rows || data.rows.length === 0) return [];
    const counts: Record<string, { count: number; amount: number }> = {};
    for (const r of data.rows) {
      const type = r.document_type || "Other";
      if (!counts[type]) counts[type] = { count: 0, amount: 0 };
      counts[type].count += 1;
      counts[type].amount += safeNumber(r.document_amount);
    }
    return Object.entries(counts).map(([type, stats]) => ({
      type,
      ...stats,
      cfg: getDocumentTypeConfig(type),
    }));
  }, [data]);

  const columns: ColumnDef<FinancePostingStatusReportRow>[] = [
    {
      header: "Document No.",
      accessorKey: "document_number",
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 text-xs hover:text-blue-600 transition-colors cursor-pointer">
          {row.document_number}
        </span>
      ),
      align: "left",
    },
    {
      header: "Type",
      accessorKey: "document_type",
      cell: (row) => {
        const cfg = getDocumentTypeConfig(row.document_type);
        const Icon = cfg.icon;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${cfg.badgeClass}`}
          >
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
        );
      },
      align: "left",
    },
    {
      header: "Date",
      accessorKey: "document_date",
      cell: (row) => (
        <span className="text-slate-600 text-xs font-medium whitespace-nowrap">
          {formatDate(row.document_date)}
        </span>
      ),
      align: "left",
    },
    {
      header: "Customer Name",
      accessorKey: "customer_name",
      cell: (row) => {
        const name = row.customer_name || row.customer || "General Customer";
        return (
          <span className="font-semibold text-slate-800 text-sm max-w-[220px] truncate block" title={name}>
            {name}
          </span>
        );
      },
      align: "left",
    },
    {
      header: "Amount",
      accessorKey: "document_amount",
      cell: (row) => (
        <span className="font-bold text-slate-900 text-sm tabular-nums">
          {formatMoney(row.document_amount)}
        </span>
      ),
      align: "right",
    },
    {
      header: "Posting Status",
      accessorKey: "finance_post_status",
      cell: (row) => {
        const status = (row.finance_post_status || "unposted").toLowerCase();
        if (status === "posted") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Posted
            </span>
          );
        }
        if (status === "failed" || status === "error") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle className="h-3 w-3" />
              Failed
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            Unposted
          </span>
        );
      },
      align: "center",
    },
    {
      header: "Posted Date",
      accessorKey: "posted_date",
      cell: (row) => {
        const dateStr = row.posted_date || row.finance_posted_at;
        return (
          <span className="text-slate-600 text-xs font-medium whitespace-nowrap">
            {formatDateTime(dateStr)}
          </span>
        );
      },
      align: "left",
    },
    {
      header: "Journal Entry",
      accessorKey: "journal_entry_number",
      cell: (row) => {
        const ref = row.journal_entry_number || row.finance_reference_number;
        if (!ref || ref === "-") {
          return <span className="text-slate-300 font-mono text-xs">—</span>;
        }
        return (
          <span className="inline-flex items-center gap-1 font-mono font-medium text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            <BookOpen className="h-3 w-3 text-slate-500" />
            {ref}
          </span>
        );
      },
      align: "left",
    },
  ];

  const handleFetchAllForExport = async () => {
    const cleanFilters = { ...filters };
    if (cleanFilters.document_type === "all") delete cleanFilters.document_type;
    if (cleanFilters.finance_post_status === "all") delete cleanFilters.finance_post_status;
    const res = await invoiceCenterApi.getFinancePostingStatusReport({
      ...cleanFilters,
      page: 1,
      limit: 10000,
    });
    return Array.isArray(res.data?.data?.rows) ? res.data.data.rows : [];
  };

  if (!hasPermission) {
    return (
      <div className="p-8">
        <ReportPermissionState />
      </div>
    );
  }

  const summaryCards: SummaryCardItem[] = [
    {
      title: "Total Documents",
      value: totalDocuments,
      format: "number",
      icon: <FileCheck className="h-4 w-4 text-blue-600" />,
      subtitle: totalAmount > 0 ? `Total volume: ${formatMoney(totalAmount)}` : "Operational document pool",
    },
    {
      title: "Posted to Finance",
      value: postedCount,
      format: "number",
      icon: <UploadCloud className="text-emerald-600 h-4 w-4" />,
      subtitle: `${safeNumber(postingRate).toFixed(1)}% General Ledger integrated`,
    },
    {
      title: "Unposted Documents",
      value: unpostedCount,
      format: "number",
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      subtitle: unpostedCount > 0 ? "Pending finance sync" : "All records posted",
    },
    {
      title: "Failed Postings",
      value: failedCount,
      format: "number",
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      subtitle: failedCount > 0 ? "Requires ledger reconciliation" : "Zero posting exceptions",
    },
  ];

  return (
    <ReportPageShell
      title="Finance Posting Status"
      description="Monitor real-time General Ledger posting, audit journal references, and resolve unposted operational documents."
      actions={
        <ReportExportActions
          title="Finance Posting Status Report"
          data={data}
          columns={columns}
          filename={`finance-posting-status-${
            new Date().toISOString().split("T")[0]
          }`}
          disabled={isLoading || !data || data.rows.length === 0}
          onFetchAll={handleFetchAllForExport}
          summaryCards={[
            { title: "Total Documents", value: formatNumber(totalDocuments) },
            { title: "Posted to Finance", value: formatNumber(postedCount) },
            { title: "Unposted Documents", value: formatNumber(unpostedCount) },
            { title: "Failed Postings", value: formatNumber(failedCount) },
          ]}
        />
      }
      filters={
        <div className="space-y-3">
          <ReportFilterBar
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            isLoading={isLoading}
          >
            {/* Search Input */}
            <div className="space-y-1 min-w-[220px]">
              <Label htmlFor="search" className="text-xs font-semibold text-slate-700">
                Search
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Doc #, Customer, Journal Entry..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pr-8"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Document Type Dropdown */}
            <div className="space-y-1 min-w-[170px]">
              <Label htmlFor="document_type" className="text-xs font-semibold text-slate-700">
                Document Type
              </Label>
              <select
                id="document_type"
                value={filters.document_type || "all"}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    document_type: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Document Types</option>
                <option value="Sales Invoice">Sales Invoice</option>
                <option value="Customer Receipt">Customer Receipt</option>
                <option value="Credit Note">Credit Note</option>
                <option value="Debit Note">Debit Note</option>
              </select>
            </div>

            {/* Finance Posting Status Dropdown */}
            <div className="space-y-1 min-w-[170px]">
              <Label htmlFor="posting_status" className="text-xs font-semibold text-slate-700">
                Posting Status
              </Label>
              <select
                id="posting_status"
                value={filters.finance_post_status || "all"}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    finance_post_status: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="posted">Posted to Finance</option>
                <option value="unposted">Unposted / Pending</option>
                <option value="failed">Failed Posting</option>
              </select>
            </div>

            {/* Date Range Inputs */}
            <div className="space-y-1">
              <Label htmlFor="date_from" className="text-xs font-semibold text-slate-700">
                Date From
              </Label>
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
              <Label htmlFor="date_to" className="text-xs font-semibold text-slate-700">
                Date To
              </Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date_to: e.target.value }))
                }
              />
            </div>
          </ReportFilterBar>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 px-1 text-xs">
            <span className="text-slate-400 font-medium">Quick Dates:</span>
            {[
              { label: "Today", value: "today" as const },
              { label: "Last 7 Days", value: "week" as const },
              { label: "This Month", value: "month" as const },
              { label: "All Time", value: "all" as const },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleDatePreset(p.value)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-2xs text-[11px] font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      }
      summary={
        <div className="space-y-5">
          {/* Top 4 KPI Cards */}
          <ReportSummaryCards items={summaryCards} isLoading={isLoading} />

          {/* GL Integration Health Banner */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  General Ledger Posting Health
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {safeNumber(postingRate).toFixed(1)}% Posted ({formatNumber(postedCount)} of {formatNumber(totalDocuments)})
                </span>
                {unpostedCount > 0 && (
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    {formatNumber(unpostedCount)} Unposted
                  </span>
                )}
              </div>
            </div>

            {/* Posting Progress Stack */}
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, postingRate))}%` }}
                title={`Posted: ${formatNumber(postedCount)}`}
              />
              {unpostedCount > 0 && (
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (unpostedCount / (totalDocuments || 1)) * 100)}%` }}
                  title={`Unposted: ${formatNumber(unpostedCount)}`}
                />
              )}
              {failedCount > 0 && (
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (failedCount / (totalDocuments || 1)) * 100)}%` }}
                  title={`Failed: ${formatNumber(failedCount)}`}
                />
              )}
            </div>

            {/* Document Types Chips */}
            {typeBreakdown.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Filter by Type:</span>
                {typeBreakdown.map((item) => {
                  const Icon = item.cfg.icon;
                  const isSelected = filters.document_type === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          document_type: isSelected ? "all" : item.type,
                          page: 1,
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold ring-2 ring-blue-400 shadow-2xs"
                          : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.cfg.label}:</span>
                      <span className="font-bold text-slate-900">{formatNumber(item.count)}</span>
                    </button>
                  );
                })}
                {filters.document_type && filters.document_type !== "all" && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, document_type: "all", page: 1 }))}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                  >
                    <X className="h-3 w-3" /> Clear Type Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
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
