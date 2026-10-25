import React, { useState, useEffect, useMemo } from "react";
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { ReportPageShell } from "@/components/invoice-center/reports/ReportPageShell";
import { ReportFilterBar } from "@/components/invoice-center/reports/ReportFilterBar";
import {
  ReportDataTable,
  ColumnDef,
} from "@/components/invoice-center/reports/ReportDataTable";
import { ReportPermissionState } from "@/components/invoice-center/reports/ReportPermissionState";
import { ReportErrorState } from "@/components/invoice-center/reports/ReportErrorState";
import {
  ReportSummaryCards,
  SummaryCardItem,
} from "@/components/invoice-center/reports/ReportSummaryCards";
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
  CustomerBalanceReportParams,
  CustomerBalanceReportRow,
  CustomerBalanceReportSummary,
} from "@/types/invoice-center-reports";
import {
  Users,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useRef } from 'react';
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

export const CustomerBalanceReportPage: React.FC = () => {
  const [filters, setFilters] = useState<CustomerBalanceReportParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "all",
  });

  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<CustomerBalanceReportRow[]>([]);
  const [summary, setSummary] = useState<CustomerBalanceReportSummary | null>(
    null
  );
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
  const [creditStatusFilter, setCreditStatusFilter] = useState<string>("all");
  const [minBalanceFilter, setMinBalanceFilter] = useState<string>("all");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await invoiceCenterApi.getCustomers({ limit: 1000 });
        setCustomers(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load customers for balance report", err);
      }
    };
    loadCustomers();
  }, []);

  const fetchData = async (overrideFilters?: CustomerBalanceReportParams) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setHasPermission(true);

      const cleanFilters: Record<string, any> = { ...(overrideFilters || filters) };
      if (cleanFilters.status === "all") delete cleanFilters.status;

      const res = await invoiceCenterApi.getCustomerBalanceReport(cleanFilters);
      const reportPayload = res.data?.data;
      const rows = Array.isArray(reportPayload?.rows) ? reportPayload.rows : [];
      setData(rows);

      if (reportPayload?.summary) {
        setSummary(reportPayload.summary);
      }

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
        const detailedError =
          err.response?.data?.errors ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load customer balance report";
        setErrorMessage(
          typeof detailedError === "string"
            ? detailedError
            : JSON.stringify(detailedError)
        );
        toast.error(
          err.response?.data?.message || "Failed to load report data"
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
    setCustomerTypeFilter("all");
    setCreditStatusFilter("all");
    setMinBalanceFilter("all");
    setErrorMessage(null);
    setFilters({ page: 1, limit: 10, search: "", status: "all" });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (
        customerTypeFilter !== "all" &&
        row.customer_type?.toLowerCase() !== customerTypeFilter.toLowerCase()
      ) {
        return false;
      }
      if (
        creditStatusFilter !== "all" &&
        row.credit_status?.toLowerCase().replace(/ /g, "_") !==
          creditStatusFilter.toLowerCase().replace(/ /g, "_")
      ) {
        return false;
      }
      if (minBalanceFilter === "has_balance" && row.current_balance <= 0) {
        return false;
      }
      if (minBalanceFilter === "500000" && row.current_balance < 500000) {
        return false;
      }
      if (minBalanceFilter === "1000000" && row.current_balance < 1000000) {
        return false;
      }
      return true;
    });
  }, [data, customerTypeFilter, creditStatusFilter, minBalanceFilter]);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(val || 0);
  };

  const summaryCardItems: SummaryCardItem[] = useMemo(() => {
    return [
      {
        title: "Total Customers",
        value: summary?.total_customers ?? pagination.total,
        format: "number",
        icon: <Users className="h-4 w-4 text-blue-600" />,
      },
      {
        title: "Total Credit Limit",
        value: summary?.total_credit_limit ?? 0,
        format: "currency",
        icon: <CreditCard className="h-4 w-4 text-indigo-600" />,
      },
      {
        title: "Total Current Balance",
        value: summary?.total_current_balance ?? 0,
        format: "currency",
        icon: <Banknote className="h-4 w-4 text-amber-600" />,
      },
      {
        title: "Available Credit",
        value: summary?.total_available_credit ?? 0,
        format: "currency",
        icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
      },
      {
        title: "Over Credit Limit",
        value: summary?.customers_over_credit_limit ?? 0,
        format: "number",
        icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
      },
    ];
  }, [summary, pagination.total]);

  const columns: ColumnDef<CustomerBalanceReportRow>[] = [
    { header: "Customer Code", accessorKey: "customer_code" },
    { header: "Customer Name", accessorKey: "customer_name" },
    {
      header: "Receivable Account",
      cell: (row) =>
        row.receivable_account_code ? (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-slate-800">
              {row.receivable_account_code}
            </span>
            <span className="text-slate-500 truncate max-w-[170px]" title={row.receivable_account_name}>
              {row.receivable_account_name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Not Mapped</span>
        ),
      align: "left",
    },
    { header: "Category", accessorKey: "customer_category" },
    {
      header: "Type",
      cell: (row) => (
        <span className="capitalize text-slate-700">
          {row.customer_type || "-"}
        </span>
      ),
    },
    {
      header: "Credit Limit",
      cell: (row) => (
        <span className="font-mono text-slate-800 font-medium">
          {formatMoney(row.credit_limit)}
        </span>
      ),
      align: "right",
    },
    {
      header: "Current Balance",
      cell: (row) => (
        <span
          className={`font-mono font-semibold ${
            row.current_balance > row.credit_limit && row.credit_limit > 0
              ? "text-rose-600 font-bold"
              : row.current_balance > 0
              ? "text-amber-700"
              : "text-slate-700"
          }`}
        >
          {formatMoney(row.current_balance)}
        </span>
      ),
      align: "right",
    },
    {
      header: "Available Credit",
      cell: (row) => (
        <span className="font-mono text-emerald-700 font-medium">
          {formatMoney(row.available_credit)}
        </span>
      ),
      align: "right",
    },
    {
      header: "Credit Status",
      cell: (row) => {
        const isOver = row.credit_status?.toLowerCase().includes("over");
        const isNoLimit = row.credit_status?.toLowerCase().includes("no");
        return (
          <Badge
            variant={isOver ? "destructive" : isNoLimit ? "outline" : "secondary"}
            className={
              isOver
                ? "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200"
                : !isNoLimit
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                : "text-slate-500 border-slate-200"
            }
          >
            {row.credit_status}
          </Badge>
        );
      },
      align: "center",
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge
          variant={row.status === "active" ? "default" : "secondary"}
          className={
            row.status === "active"
              ? "bg-emerald-600 text-white hover:bg-emerald-600"
              : "bg-slate-200 text-slate-700 hover:bg-slate-200"
          }
        >
          {row.status}
        </Badge>
      ),
      align: "center",
    },
  ];

  const exportColumns = [
    { header: "Customer Code", accessorKey: "customer_code" },
    { header: "Customer Name", accessorKey: "customer_name" },
    {
      header: "Receivable Account Code",
      accessorKey: "receivable_account_code",
    },
    {
      header: "Receivable Account Name",
      accessorKey: "receivable_account_name",
    },
    { header: "Category", accessorKey: "customer_category" },
    { header: "Customer Type", accessorKey: "customer_type" },
    { header: "Primary Phone", accessorKey: "primary_contact_number" },
    { header: "Primary Email", accessorKey: "primary_email" },
    { header: "Credit Limit (LKR)", accessorKey: "credit_limit" },
    { header: "Credit Days", accessorKey: "credit_days" },
    { header: "Current Balance (LKR)", accessorKey: "current_balance" },
    { header: "Available Credit (LKR)", accessorKey: "available_credit" },
    { header: "Credit Status", accessorKey: "credit_status" },
    { header: "Account Status", accessorKey: "status" },
  ];

  const handleFetchAllForExport = async () => {
    const res = await invoiceCenterApi.getCustomerBalances({
      ...filters,
      page: 1,
      limit: 10000,
    });
    const allRows = Array.isArray(res.data?.data?.rows) ? res.data.data.rows : [];
    return allRows.filter((c: any) => {
      if (
        creditRiskFilter === "over_limit" &&
        (c.current_balance || 0) <= (c.credit_limit || 0)
      ) {
        return false;
      }
      if (creditRiskFilter === "near_limit") {
        const ratio =
          c.credit_limit > 0 ? (c.current_balance || 0) / c.credit_limit : 0;
        if (ratio < 0.8 || ratio >= 1.0) return false;
      }
      if (creditRiskFilter === "safe") {
        const ratio =
          c.credit_limit > 0 ? (c.current_balance || 0) / c.credit_limit : 0;
        if (ratio >= 0.8) return false;
      }
      const minBal = Number(minBalanceFilter) || 0;
      if (minBal > 0 && (c.current_balance || 0) < minBal) {
        return false;
      }
      return true;
    });
  };

  if (!hasPermission) {
    return (
      <div className="p-8">
        <ReportPermissionState />
      </div>
    );
  }

  return (
    <ReportPageShell
      title="Customer Balances"
      description="View credit limits, current balances, receivable account mappings, and available credit for all customers."
      summary={
        <div className="space-y-2">
          <ReportSummaryCards
            items={summaryCardItems}
            isLoading={isLoading}
          />
        </div>
      }
      actions={
        <ReportExportActions
          title="Customer Balances Report"
          data={filteredData}
          columns={exportColumns}
          filename={`customer-balances-${
            new Date().toISOString().split("T")[0]
          }`}
          disabled={isLoading || (filteredData.length === 0 && !summary)}
          onFetchAll={handleFetchAllForExport}
          summaryCards={[
            { title: "Total Customers", value: summary?.total_customers || 0 },
            { title: "Total Outstanding", value: formatMoney(summary?.total_outstanding || 0) },
            { title: "Total Credit Limit", value: formatMoney(summary?.total_credit_limit || 0) },
            { title: "Over Limit", value: summary?.customers_over_credit_limit || 0 },
          ]}
        />
      }
      filters={
        <ReportFilterBar
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isLoading={isLoading}
        >
          <div className="space-y-1">
            <Label htmlFor="customer_select">Select Customer</Label>
            <Select
              value={filters.search ? filters.search : "all"}
              onValueChange={(val) => {
                const searchVal = val === "all" ? "" : val;
                setFilters((prev) => ({ ...prev, search: searchVal }));
              }}
            >
              <SelectTrigger id="customer_select" className="w-[190px]">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((c) => {
                  const customerName = c.customer_name || c.company_name;
                  const label = customerName
                    ? `${c.customer_code} - ${customerName}`
                    : (c.customer_code || `Customer #${c.id}`);
                  return (
                    <SelectItem
                      key={c.id}
                      value={c.customer_code || customerName || String(c.id)}
                    >
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="search">Search Customer</Label>
            <Input
              id="search"
              placeholder="Search code or name..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="status">Account Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, status: val }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="customer_type">Customer Type</Label>
            <Select
              value={customerTypeFilter}
              onValueChange={(val) => setCustomerTypeFilter(val)}
            >
              <SelectTrigger id="customer_type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="clinic">Clinic</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="credit_status">Credit Status</Label>
            <Select
              value={creditStatusFilter}
              onValueChange={(val) => setCreditStatusFilter(val)}
            >
              <SelectTrigger id="credit_status">
                <SelectValue placeholder="All Credit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="over_limit">Over Credit Limit</SelectItem>
                <SelectItem value="within_limit">Within Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="min_balance">Balance Filter</Label>
            <Select
              value={minBalanceFilter}
              onValueChange={(val) => setMinBalanceFilter(val)}
            >
              <SelectTrigger id="min_balance">
                <SelectValue placeholder="All Balances" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Balances</SelectItem>
                <SelectItem value="has_balance">Active Balances (&gt; 0)</SelectItem>
                <SelectItem value="500000">&gt; 500,000 LKR</SelectItem>
                <SelectItem value="1000000">&gt; 1,000,000 LKR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ReportFilterBar>
      }
      table={
        errorMessage ? (
          <div className="p-6">
            <ReportErrorState
              title="Failed to Generate Customer Balance Report"
              errorDetails={errorMessage}
              onRetry={fetchData}
              onResetFilters={handleResetFilters}
            />
          </div>
        ) : (
          <ReportDataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            emptyMessage="No customer records match your filter criteria. Try adjusting or resetting filters."
          />
        )
      }
    />
  );
};
export default CustomerBalanceReportPage;
