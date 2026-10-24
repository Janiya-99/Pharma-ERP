import React, { useState, useEffect, useMemo } from "react";
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { ReportPageShell } from "@/components/invoice-center/reports/ReportPageShell";
import { ReportFilterBar } from "@/components/invoice-center/reports/ReportFilterBar";
import {
  ReportDataTable,
  ColumnDef,
} from "@/components/invoice-center/reports/ReportDataTable";
import { ReportPermissionState } from "@/components/invoice-center/reports/ReportPermissionState";
import { ReportExportActions } from "@/components/invoice-center/reports/ReportExportActions";
import { ReportErrorState } from "@/components/invoice-center/reports/ReportErrorState";
import {
  ReportSummaryCards,
  SummaryCardItem,
} from "@/components/invoice-center/reports/ReportSummaryCards";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CustomerAgingReportParams,
  CustomerAgingReportRow,
} from "@/types/invoice-center-reports";
import { useRef } from 'react';
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { Users, CreditCard, AlertTriangle, ShieldAlert, Banknote } from "lucide-react";

export const CustomerAgingReportPage: React.FC = () => {
  const [filters, setFilters] = useState<CustomerAgingReportParams>({
    page: 1,
    limit: 10,
    search: "",
    as_of_date: new Date().toISOString().split("T")[0],
  });

  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<CustomerAgingReportRow[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [minBalanceFilter, setMinBalanceFilter] = useState<string>("0");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await invoiceCenterApi.getCustomers({ limit: 1000 });
        setCustomers(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load customers for aging report", err);
      }
    };
    loadCustomers();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (
        riskFilter === "overdue" &&
        row.days_61_90 <= 0 &&
        row.days_91_120 <= 0 &&
        row.over_120 <= 0
      ) {
        return false;
      }
      if (riskFilter === "critical" && row.over_120 <= 0) {
        return false;
      }
      if (riskFilter === "current" && row.current <= 0 && row.days_1_30 <= 0) {
        return false;
      }
      const minBal = Number(minBalanceFilter) || 0;
      if (minBal > 0 && row.total_outstanding < minBal) {
        return false;
      }
      return true;
    });
  }, [data, riskFilter, minBalanceFilter]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const summaryTotals = useMemo(() => {
    let totalOutstanding = 0;
    let currentTotal = 0;
    let overdueTotal = 0;
    let criticalTotal = 0;
    data.forEach((row) => {
      totalOutstanding += row.total_outstanding || 0;
      currentTotal += (row.current || 0) + (row.days_1_30 || 0);
      overdueTotal += (row.days_31_60 || 0) + (row.days_61_90 || 0) + (row.days_91_120 || 0);
      criticalTotal += row.over_120 || 0;
    });
    return {
      totalAccounts: pagination.total || data.length,
      totalOutstanding,
      currentTotal,
      overdueTotal,
      criticalTotal,
    };
  }, [data, pagination.total]);

  const summaryCards: SummaryCardItem[] = [
    { title: "Total Accounts", value: summaryTotals.totalAccounts, format: "number", icon: <Users className="h-4 w-4 text-blue-500" /> },
    { title: "Current & < 30d", value: summaryTotals.currentTotal, format: "currency", icon: <CreditCard className="h-4 w-4 text-emerald-500" /> },
    { title: "Overdue (31-120d)", value: summaryTotals.overdueTotal, format: "currency", icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
    { title: "Critical (> 120d)", value: summaryTotals.criticalTotal, format: "currency", icon: <ShieldAlert className="h-4 w-4 text-rose-500" /> },
    { title: "Total Outstanding", value: summaryTotals.totalOutstanding, format: "currency", icon: <Banknote className="h-4 w-4 text-indigo-600" /> },
  ];

  const fetchData = async (overrideFilters?: CustomerAgingReportParams) => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      setErrorMessage(null);

      const activeFilters = overrideFilters || filters;
      const res = await invoiceCenterApi.getCustomerAgingReport(activeFilters);
      setData(Array.isArray(res.data?.data?.rows) ? res.data.data.rows : []);
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
        const msg = err.response?.data?.message || err.response?.data?.errors || "Failed to load report data";
        const cleanMsg = typeof msg === "string" ? msg : Array.isArray(msg) ? msg.join(", ") : "Failed to load report data";
        setErrorMessage(cleanMsg);
        toast.error(cleanMsg);
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
    setRiskFilter("all");
    setMinBalanceFilter("0");
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      as_of_date: new Date().toISOString().split("T")[0],
    });
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

  const columns: ColumnDef<CustomerAgingReportRow>[] = [
    { header: "Customer Code", accessorKey: "customer_code" },
    { header: "Customer Name", accessorKey: "customer_name" },
    {
      header: "Credit Limit",
      cell: (row) => formatMoney(row.credit_limit),
      align: "right",
    },
    {
      header: "Current",
      cell: (row) => formatMoney(row.current),
      align: "right",
    },
    {
      header: "1-30 Days",
      cell: (row) => formatMoney(row.days_1_30),
      align: "right",
    },
    {
      header: "31-60 Days",
      cell: (row) => formatMoney(row.days_31_60),
      align: "right",
    },
    {
      header: "61-90 Days",
      cell: (row) => formatMoney(row.days_61_90),
      align: "right",
    },
    {
      header: "91-120 Days",
      cell: (row) => formatMoney(row.days_91_120),
      align: "right",
    },
    {
      header: "> 120 Days",
      cell: (row) => (
        <span className={row.over_120 > 0 ? "font-semibold text-red-600" : ""}>
          {formatMoney(row.over_120)}
          {row.over_120 > 0 && (
            <Badge variant="destructive" className="ml-2 py-0">
              !
            </Badge>
          )}
        </span>
      ),
      align: "right",
    },
    {
      header: "Total Outstanding",
      cell: (row) => (
        <span className="font-bold">{formatMoney(row.total_outstanding)}</span>
      ),
      align: "right",
    },
  ];

  if (!hasPermission) {
    return (
      <div className="p-8">
        <ReportPermissionState />
      </div>
    );
  }

  return (
    <ReportPageShell
      title="Customer Aging"
      description="View outstanding balances bucketed by age to track overdue payments."
      actions={
        <ReportExportActions
          data={filteredData}
          columns={columns}
          filename={`customer-aging-${new Date().toISOString().split("T")[0]}`}
          disabled={isLoading || filteredData.length === 0}
        />
      }
      summary={
        <ReportSummaryCards items={summaryCards} isLoading={isLoading} />
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
                    <SelectItem key={c.id} value={c.customer_code || String(c.id)}>
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
            <Label htmlFor="as_of_date">As Of Date</Label>
            <Input
              id="as_of_date"
              type="date"
              value={filters.as_of_date || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, as_of_date: e.target.value }))
              }
              placeholder="Enter As Of Date"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_preset">Date Preset</Label>
            <Select
              value="custom"
              onValueChange={(val) => {
                const today = new Date();
                if (val === "today") {
                  setFilters((prev) => ({
                    ...prev,
                    as_of_date: today.toISOString().split("T")[0],
                  }));
                } else if (val === "last_month") {
                  const endOfLastMonth = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    0
                  );
                  setFilters((prev) => ({
                    ...prev,
                    as_of_date: endOfLastMonth.toISOString().split("T")[0],
                  }));
                } else if (val === "30_days_ago") {
                  const d = new Date(today);
                  d.setDate(d.getDate() - 30);
                  setFilters((prev) => ({
                    ...prev,
                    as_of_date: d.toISOString().split("T")[0],
                  }));
                } else if (val === "90_days_ago") {
                  const d = new Date(today);
                  d.setDate(d.getDate() - 90);
                  setFilters((prev) => ({
                    ...prev,
                    as_of_date: d.toISOString().split("T")[0],
                  }));
                }
              }}
            >
              <SelectTrigger id="date_preset">
                <SelectValue placeholder="Quick Presets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Quick Presets...</SelectItem>
                <SelectItem value="today">Today (Latest)</SelectItem>
                <SelectItem value="last_month">End of Last Month</SelectItem>
                <SelectItem value="30_days_ago">30 Days Ago</SelectItem>
                <SelectItem value="90_days_ago">90 Days Ago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="risk_filter">Aging Risk</Label>
            <Select
              value={riskFilter}
              onValueChange={(val) => setRiskFilter(val)}
            >
              <SelectTrigger id="risk_filter">
                <SelectValue placeholder="All Risk Profiles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="current">Current Only (&lt; 30d)</SelectItem>
                <SelectItem value="overdue">Overdue (&gt; 60d)</SelectItem>
                <SelectItem value="critical">Critical High Risk (&gt; 120d)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="min_balance">Min Outstanding</Label>
            <Select
              value={minBalanceFilter}
              onValueChange={(val) => setMinBalanceFilter(val)}
            >
              <SelectTrigger id="min_balance">
                <SelectValue placeholder="All Balances" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Balances</SelectItem>
                <SelectItem value="100000">&gt; 100,000 LKR</SelectItem>
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
              title="Failed to Generate Customer Aging Report"
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
            emptyMessage="No customer aging records match your filter criteria."
          />
        )
      }
    />
  );
};
