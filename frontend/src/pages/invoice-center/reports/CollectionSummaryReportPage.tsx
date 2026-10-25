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
import { Checkbox } from "@/components/ui/checkbox";
import {
  CollectionSummaryReportParams,
  CollectionSummaryReportRow,
  CollectionSummaryReportSummary,
} from "@/types/invoice-center-reports";
import { normalizeReportEnvelope } from "@/utils/reportResponse";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import {
  Wallet,
  Banknote,
  CreditCard,
  Building,
  Building2,
  FileCheck,
  Globe,
  Coins,
  Layers,
  List,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Percent,
  X,
  Filter,
} from "lucide-react";

// Safe number helper guaranteeing finite numbers (no NaN or Infinity)
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

const formatPercent = (val: any) => {
  return `${safeNumber(val).toFixed(2)}%`;
};

const formatNumber = (val: any) => {
  return new Intl.NumberFormat("en-US").format(safeNumber(val));
};

// Payment method visual configurations
interface MethodConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  barColor: string;
}

const METHOD_CONFIGS: Record<string, MethodConfig> = {
  bank_transfer: {
    label: "Bank Transfer",
    icon: Building2,
    textColor: "text-blue-700",
    badgeBg: "bg-blue-50/80",
    badgeBorder: "border-blue-200/80",
    barColor: "bg-blue-500",
  },
  cheque: {
    label: "Cheque",
    icon: FileCheck,
    textColor: "text-amber-700",
    badgeBg: "bg-amber-50/80",
    badgeBorder: "border-amber-200/80",
    barColor: "bg-amber-500",
  },
  cash: {
    label: "Cash",
    icon: Banknote,
    textColor: "text-emerald-700",
    badgeBg: "bg-emerald-50/80",
    badgeBorder: "border-emerald-200/80",
    barColor: "bg-emerald-500",
  },
  online: {
    label: "Online / Gateway",
    icon: Globe,
    textColor: "text-sky-700",
    badgeBg: "bg-sky-50/80",
    badgeBorder: "border-sky-200/80",
    barColor: "bg-sky-500",
  },
  card: {
    label: "Card Payment",
    icon: CreditCard,
    textColor: "text-purple-700",
    badgeBg: "bg-purple-50/80",
    badgeBorder: "border-purple-200/80",
    barColor: "bg-purple-500",
  },
  other: {
    label: "Other",
    icon: Coins,
    textColor: "text-slate-700",
    badgeBg: "bg-slate-100",
    badgeBorder: "border-slate-200",
    barColor: "bg-slate-400",
  },
};

const getMethodConfig = (method?: string): MethodConfig => {
  if (!method) return METHOD_CONFIGS.other;
  const key = method.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (METHOD_CONFIGS[key]) return METHOD_CONFIGS[key];
  if (key.includes("bank") || key.includes("wire")) return METHOD_CONFIGS.bank_transfer;
  if (key.includes("cheque") || key.includes("check")) return METHOD_CONFIGS.cheque;
  if (key.includes("card")) return METHOD_CONFIGS.card;
  if (key.includes("online") || key.includes("web") || key.includes("pay"))
    return METHOD_CONFIGS.online;
  if (key.includes("cash")) return METHOD_CONFIGS.cash;

  return {
    label: method
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: Coins,
    textColor: "text-slate-700",
    badgeBg: "bg-slate-100",
    badgeBorder: "border-slate-200",
    barColor: "bg-slate-400",
  };
};

export const CollectionSummaryReportPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"method" | "receipt">("method");
  const [filters, setFilters] = useState<CollectionSummaryReportParams>({
    page: 1,
    limit: 10,
    search: "",
    payment_method: "",
    date_from: "",
    date_to: "",
    posted_only: true,
    group_by: "method",
  });

  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<{
    summary: CollectionSummaryReportSummary;
    rows: CollectionSummaryReportRow[];
  } | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchData = async (overrideFilters?: CollectionSummaryReportParams) => {
    try {
      setIsLoading(true);
      setHasPermission(true);

      const activeFilters = overrideFilters || filters;
      const res = await invoiceCenterApi.getCollectionSummaryReport(activeFilters);
      setData(
        normalizeReportEnvelope<CollectionSummaryReportSummary, CollectionSummaryReportRow>(
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
          err.response?.data?.message || "Failed to load collection summary report"
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
      payment_method: "",
      date_from: "",
      date_to: "",
      posted_only: true,
      group_by: viewMode,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewModeChange = (mode: "method" | "receipt") => {
    setViewMode(mode);
    setFilters((prev) => ({
      ...prev,
      group_by: mode,
      page: 1,
    }));
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
  const totalReceipts = safeNumber(summary.total_receipts ?? summary.receipt_count);
  const totalCollected = safeNumber(
    summary.total_collected ?? summary.total_amount ?? summary.receipt_amount
  );
  const totalAllocated = safeNumber(summary.total_allocated ?? summary.allocated_amount);
  const totalUnallocated = safeNumber(summary.total_unallocated ?? summary.unallocated_amount);
  const allocationRate = totalCollected > 0 ? (totalAllocated / totalCollected) * 100 : 0;

  // Breakdown distribution data for channels
  const distributionItems = useMemo(() => {
    if (!data?.rows || data.rows.length === 0) {
      // Fallback from summary amounts if available
      const items = [
        { key: "bank_transfer", amount: safeNumber(summary.bank_transfer_amount) },
        { key: "cheque", amount: safeNumber(summary.cheque_amount) },
        { key: "cash", amount: safeNumber(summary.cash_amount) },
        { key: "online", amount: safeNumber(summary.online_amount) },
        { key: "card", amount: safeNumber(summary.card_amount) },
        { key: "other", amount: safeNumber(summary.other_amount) },
      ].filter((i) => i.amount > 0);

      return items.map((i) => {
        const cfg = getMethodConfig(i.key);
        const percent = totalCollected > 0 ? (i.amount / totalCollected) * 100 : 0;
        return {
          key: i.key,
          label: cfg.label,
          amount: i.amount,
          percent: safeNumber(percent),
          cfg,
        };
      });
    }

    if (viewMode === "method") {
      return data.rows.map((r) => {
        const methodKey = r.payment_method;
        const cfg = getMethodConfig(methodKey);
        const amount = safeNumber(r.total_amount ?? r.receipt_amount);
        const percent =
          r.percentage_of_total !== undefined
            ? safeNumber(r.percentage_of_total)
            : totalCollected > 0
            ? (amount / totalCollected) * 100
            : 0;
        return {
          key: methodKey,
          label: cfg.label,
          amount,
          percent: safeNumber(percent),
          count: safeNumber(r.receipt_count),
          cfg,
        };
      });
    }

    return [];
  }, [data, summary, totalCollected, viewMode]);

  // Method View Columns
  const methodColumns: ColumnDef<CollectionSummaryReportRow>[] = [
    {
      header: "Payment Method",
      accessorKey: "payment_method",
      cell: (row) => {
        const cfg = getMethodConfig(row.payment_method);
        const Icon = cfg.icon;
        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.textColor} shadow-xs`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 block leading-tight">
                {cfg.label}
              </span>
              <span className="text-xs text-slate-400 capitalize">
                Channel Code: {row.payment_method || "standard"}
              </span>
            </div>
          </div>
        );
      },
      align: "left",
    },
    {
      header: "Receipt Count",
      accessorKey: "receipt_count",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {formatNumber(row.receipt_count || 1)} receipts
        </span>
      ),
      align: "center",
    },
    {
      header: "Total Collected",
      accessorKey: "total_amount",
      cell: (row) => {
        const amt = safeNumber(row.total_amount ?? row.receipt_amount);
        return (
          <span className="font-bold text-slate-900 text-sm">
            {formatMoney(amt)}
          </span>
        );
      },
      align: "right",
    },
    {
      header: "Allocated",
      accessorKey: "allocated_amount",
      cell: (row) => {
        const amt = safeNumber(row.allocated_amount);
        return (
          <span className="font-medium text-emerald-700 text-sm">
            {formatMoney(amt)}
          </span>
        );
      },
      align: "right",
    },
    {
      header: "Unallocated",
      accessorKey: "unallocated_amount",
      cell: (row) => {
        const amt = safeNumber(row.unallocated_amount);
        return (
          <span
            className={`font-medium text-sm ${
              amt > 0 ? "text-amber-600 font-semibold" : "text-slate-400"
            }`}
          >
            {formatMoney(amt)}
          </span>
        );
      },
      align: "right",
    },
    {
      header: "% of Total",
      accessorKey: "percentage_of_total",
      cell: (row) => {
        const amt = safeNumber(row.total_amount ?? row.receipt_amount);
        const rawPercent =
          row.percentage_of_total !== undefined
            ? safeNumber(row.percentage_of_total)
            : totalCollected > 0
            ? (amt / totalCollected) * 100
            : 0;
        const pct = Math.min(100, Math.max(0, safeNumber(rawPercent)));
        const cfg = getMethodConfig(row.payment_method);

        return (
          <div className="flex items-center justify-end gap-2.5">
            <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${cfg.barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-semibold text-slate-700 text-xs w-14 text-right tabular-nums">
              {formatPercent(pct)}
            </span>
          </div>
        );
      },
      align: "right",
    },
  ];

  // Transaction Receipt Columns
  const receiptColumns: ColumnDef<CollectionSummaryReportRow>[] = [
    {
      header: "Receipt #",
      accessorKey: "receipt_number",
      cell: (row) => (
        <span className="font-mono font-semibold text-blue-600 text-xs hover:underline cursor-pointer">
          {row.receipt_number || "-"}
        </span>
      ),
      align: "left",
    },
    {
      header: "Date",
      accessorKey: "receipt_date",
      cell: (row) => (
        <span className="text-slate-600 text-xs">
          {row.receipt_date ? String(row.receipt_date).split("T")[0] : "-"}
        </span>
      ),
      align: "left",
    },
    {
      header: "Customer",
      accessorKey: "customer_name",
      cell: (row) => (
        <div>
          <span className="font-medium text-slate-800 text-sm block leading-tight">
            {row.customer_name || "General Customer"}
          </span>
          {row.customer_code && (
            <span className="text-xs text-slate-400 font-mono">
              {row.customer_code}
            </span>
          )}
        </div>
      ),
      align: "left",
    },
    {
      header: "Method",
      accessorKey: "payment_method",
      cell: (row) => {
        const cfg = getMethodConfig(row.payment_method);
        const Icon = cfg.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.textColor}`}
          >
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
        );
      },
      align: "left",
    },
    {
      header: "Reference",
      accessorKey: "reference_number",
      cell: (row) => (
        <span className="text-slate-500 text-xs font-mono">
          {row.reference_number ||
            row.cheque_number ||
            row.bank_reference_number ||
            "-"}
        </span>
      ),
      align: "left",
    },
    {
      header: "Collected",
      accessorKey: "total_amount",
      cell: (row) => {
        const amt = safeNumber(row.total_amount ?? row.receipt_amount);
        return (
          <span className="font-bold text-slate-900 text-sm">
            {formatMoney(amt)}
          </span>
        );
      },
      align: "right",
    },
    {
      header: "Allocated",
      accessorKey: "allocated_amount",
      cell: (row) => (
        <span className="text-emerald-700 font-medium text-sm">
          {formatMoney(row.allocated_amount)}
        </span>
      ),
      align: "right",
    },
    {
      header: "Unallocated",
      accessorKey: "unallocated_amount",
      cell: (row) => {
        const amt = safeNumber(row.unallocated_amount);
        return (
          <span
            className={`text-sm ${
              amt > 0 ? "text-amber-600 font-semibold" : "text-slate-400"
            }`}
          >
            {formatMoney(amt)}
          </span>
        );
      },
      align: "right",
    },
    {
      header: "Finance Post",
      accessorKey: "finance_post_status",
      cell: (row) => {
        const isPosted = row.finance_post_status === "posted";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
              isPosted
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {row.finance_post_status || "unposted"}
          </span>
        );
      },
      align: "center",
    },
  ];

  const activeColumns = viewMode === "method" ? methodColumns : receiptColumns;

  const handleFetchAllForExport = async () => {
    const res = await invoiceCenterApi.getCollectionSummaryReport({
      ...filters,
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
      title: "Total Collected",
      value: totalCollected,
      format: "currency",
      icon: <Wallet className="text-emerald-600 h-4 w-4" />,
      subtitle: totalReceipts > 0 ? `From ${formatNumber(totalReceipts)} receipts` : "No receipts recorded",
    },
    {
      title: "Total Allocated",
      value: totalAllocated,
      format: "currency",
      icon: <CreditCard className="h-4 w-4 text-indigo-600" />,
      subtitle: `${safeNumber(allocationRate).toFixed(1)}% reconciled to invoices`,
    },
    {
      title: "Total Unallocated",
      value: totalUnallocated,
      format: "currency",
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      subtitle: totalUnallocated > 0 ? "Pending customer allocation" : "Zero unapplied balance",
    },
    {
      title: "Total Receipts",
      value: totalReceipts,
      format: "number",
      icon: <Banknote className="h-4 w-4 text-blue-600" />,
      subtitle: filters.posted_only ? "Posted receipts only" : "All receipt states",
    },
  ];

  return (
    <ReportPageShell
      title="Collection Summary"
      description="Executive collection breakdown by payment methods, real-time allocation status, and audit trail."
      actions={
        <ReportExportActions
          title={`Collection Summary (${viewMode === "method" ? "By Method" : "Detailed Receipts"})`}
          data={data}
          columns={activeColumns}
          filename={`collection-summary-${viewMode}-${
            new Date().toISOString().split("T")[0]
          }`}
          disabled={isLoading || !data || data.rows.length === 0}
          onFetchAll={handleFetchAllForExport}
          summaryCards={[
            { title: "Total Collected", value: formatMoney(totalCollected) },
            { title: "Total Allocated", value: formatMoney(totalAllocated) },
            { title: "Total Unallocated", value: formatMoney(totalUnallocated) },
            { title: "Total Receipts", value: formatNumber(totalReceipts) },
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
            <div className="space-y-1 min-w-[200px]">
              <Label htmlFor="search" className="text-xs font-semibold text-slate-700">
                Search
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Receipt #, Customer, Method..."
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

            {/* Payment Method Filter */}
            <div className="space-y-1 min-w-[170px]">
              <Label htmlFor="payment_method" className="text-xs font-semibold text-slate-700">
                Payment Channel
              </Label>
              <select
                id="payment_method"
                value={filters.payment_method || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    payment_method: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Channels</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="online">Online / Gateway</option>
                <option value="card">Card Payment</option>
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

            {/* Posted Receipts Checkbox */}
            <div className="flex items-end space-y-1 pb-2">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 shadow-2xs">
                <Checkbox
                  id="posted_only"
                  checked={filters.posted_only}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({
                      ...prev,
                      posted_only: checked as boolean,
                      page: 1,
                    }))
                  }
                />
                <Label htmlFor="posted_only" className="cursor-pointer text-xs font-medium text-slate-700 select-none">
                  Posted Receipts Only
                </Label>
              </div>
            </div>
          </ReportFilterBar>

          {/* Quick Date Range Pills */}
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

          {/* Payment Method Distribution Breakdown Bar */}
          {distributionItems.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Collection Channel Breakdown
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  100% of {formatMoney(totalCollected)}
                </span>
              </div>

              {/* Progress Bar Stack */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                {distributionItems.map((item) => (
                  <div
                    key={item.key}
                    className={`h-full ${item.cfg.barColor} transition-all duration-500 hover:opacity-90`}
                    style={{ width: `${Math.max(1, item.percent)}%` }}
                    title={`${item.label}: ${formatMoney(item.amount)} (${item.percent.toFixed(1)}%)`}
                  />
                ))}
              </div>

              {/* Legend Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {distributionItems.map((item) => {
                  const Icon = item.cfg.icon;
                  const isSelected = filters.payment_method === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          payment_method: isSelected ? "" : item.key,
                          page: 1,
                        }))
                      }
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? `${item.cfg.badgeBg} ${item.cfg.badgeBorder} ring-2 ring-blue-400 font-semibold shadow-2xs`
                          : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${item.cfg.barColor}`} />
                      <Icon className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.label}:</span>
                      <span className="font-bold text-slate-900">
                        {formatMoney(item.amount)}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({formatPercent(item.percent)})
                      </span>
                    </button>
                  );
                })}
                {filters.payment_method && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, payment_method: "", page: 1 }))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 hover:underline font-medium"
                  >
                    <X className="h-3 w-3" /> Clear Channel Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      }
      table={
        <div className="space-y-4">
          {/* View Mode Switcher Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {viewMode === "method"
                  ? "Collection Summary by Payment Method"
                  : "All Receipt Transactions"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {viewMode === "method"
                  ? "Aggregated totals, receipt volumes, and allocation percentages per payment channel."
                  : "Granular audit list of individual receipts, references, and posting records."}
              </p>
            </div>

            {/* Segmented Mode Control */}
            <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-auto shadow-2xs">
              <button
                type="button"
                onClick={() => handleViewModeChange("method")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "method"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                By Payment Method
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange("receipt")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "receipt"
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Detailed Receipts ({formatNumber(totalReceipts)})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <ReportDataTable
            columns={activeColumns}
            data={data?.rows || []}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            disablePagination={viewMode === "method"}
          />
        </div>
      }
    />
  );
};
