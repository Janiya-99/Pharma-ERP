import React, { useState, useEffect, useRef } from 'react';
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { getBranches } from "@/api/controlApi";
import { ReportPageShell } from "@/components/invoice-center/reports/ReportPageShell";
import { ReportFilterBar } from "@/components/invoice-center/reports/ReportFilterBar";
import { ReportSummaryCards, SummaryCardItem } from "@/components/invoice-center/reports/ReportSummaryCards";
import { ReportDataTable, ColumnDef } from "@/components/invoice-center/reports/ReportDataTable";
import { ReportPermissionState } from "@/components/invoice-center/reports/ReportPermissionState";
import { ReportExportActions } from "@/components/invoice-center/reports/ReportExportActions";
import { ReportErrorState } from "@/components/invoice-center/reports/ReportErrorState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SalesInvoiceRegisterReportParams, SalesInvoiceRegisterReportRow } from "@/types/invoice-center-reports";
import { normalizeReportEnvelope } from "@/utils/reportResponse";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { FileText, Coins, CreditCard, Banknote } from "lucide-react";

export const SalesInvoiceRegisterReportPage: React.FC = () => {
  const [filters, setFilters] = useState<SalesInvoiceRegisterReportParams>({
    page: 1,
    limit: 10,
    search: "",
    branch_id: undefined,
    approval_status: "all",
    posted_status: "all",
    payment_status: "all",
    finance_post_status: "all",
    date_from: "",
    date_to: "",
  });
  
  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<{ summary: any, rows: SalesInvoiceRegisterReportRow[] } | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await getBranches({ limit: 500, status: "active" });
        const list = res.data?.data || res.data || [];
        setBranches(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load branches", err);
      }
    };
    loadBranches();
  }, []);

  const fetchData = async (overrideFilters?: SalesInvoiceRegisterReportParams) => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      setErrorMessage(null);
      
      const cleanFilters: any = { ...(overrideFilters || filters) };
      if (!cleanFilters.date_from) delete cleanFilters.date_from;
      if (!cleanFilters.date_to) delete cleanFilters.date_to;
      if (cleanFilters.date_from && cleanFilters.date_to && cleanFilters.date_from > cleanFilters.date_to) {
        toast.error("Date From cannot be after Date To.");
        setIsLoading(false);
        return;
      }

      if (cleanFilters.branch_id === "all" || !cleanFilters.branch_id) delete cleanFilters.branch_id;
      if (cleanFilters.approval_status === "all") delete cleanFilters.approval_status;
      if (cleanFilters.posted_status === "all") delete cleanFilters.posted_status;
      if (cleanFilters.payment_status === "all") delete cleanFilters.payment_status;
      if (cleanFilters.finance_post_status === "all") delete cleanFilters.finance_post_status;

      const res = await invoiceCenterApi.getSalesInvoiceRegisterReport(cleanFilters);
      setData(normalizeReportEnvelope<any, SalesInvoiceRegisterReportRow>(res.data?.data));
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
        setErrorMessage(msg);
        toast.error(msg);
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
      page: 1, limit: 10, search: "", 
      branch_id: undefined,
      approval_status: "all", posted_status: "all", 
      payment_status: "all", finance_post_status: "all",
      date_from: "", date_to: ""
    });
    setErrorMessage(null);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val || 0);
  };

  const formatReportDate = (val?: string) => {
    if (!val || val.startsWith("0001-01-01") || val === "null" || val === "undefined") {
      return "-";
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const columns: ColumnDef<SalesInvoiceRegisterReportRow>[] = [
    { header: "Invoice Number", accessorKey: "invoice_number" },
    { 
      header: "Date", 
      accessorKey: "invoice_date",
      cell: (row) => formatReportDate(row.invoice_date)
    },
    { 
      header: "Due Date", 
      accessorKey: "due_date",
      cell: (row) => formatReportDate(row.due_date)
    },
    { header: "Branch", accessorKey: "branch" },
    { header: "Customer Name", accessorKey: "customer_name" },
    { header: "Order No.", accessorKey: "sales_order_number" },
    { 
      header: "Total", 
      accessorKey: "total_amount",
      cell: (row) => <span className="font-semibold text-navy-900">{formatMoney(row.total_amount)}</span>,
      align: "right"
    },
    { 
      header: "Paid", 
      accessorKey: "paid_amount",
      cell: (row) => formatMoney(row.paid_amount),
      align: "right"
    },
    { 
      header: "Balance", 
      accessorKey: "balance_amount",
      cell: (row) => formatMoney(row.balance_amount),
      align: "right"
    },
    { 
      header: "Approval", 
      accessorKey: "approval_status",
      cell: (row) => (
        <Badge variant={row.approval_status === 'approved' ? 'default' : row.approval_status === 'rejected' ? 'destructive' : 'secondary'}>
          {row.approval_status}
        </Badge>
      ),
      align: "center"
    },
    { 
      header: "Posted", 
      accessorKey: "posted_status",
      cell: (row) => (
        <Badge variant={row.posted_status === 'posted' ? 'default' : 'secondary'}>
          {row.posted_status}
        </Badge>
      ),
      align: "center"
    },
    { 
      header: "Payment", 
      accessorKey: "payment_status",
      cell: (row) => (
        <Badge variant={row.payment_status === 'paid' ? 'default' : row.payment_status === 'partially_paid' ? 'secondary' : 'outline'}>
          {row.payment_status}
        </Badge>
      ),
      align: "center"
    },
  ];

  const handleFetchAllForExport = async () => {
    const res = await invoiceCenterApi.getSalesInvoiceRegister({
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

  const summary = data?.summary || {};
  const summaryCards: SummaryCardItem[] = [
    { title: "Invoice Count", value: summary.invoice_count || 0, format: "number", icon: <FileText className="h-4 w-4" /> },
    { title: "Total Amount", value: summary.total_amount || 0, format: "currency", icon: <Coins className="h-4 w-4 text-emerald-500" /> },
    { title: "Paid Amount", value: summary.paid_amount || 0, format: "currency", icon: <CreditCard className="h-4 w-4 text-indigo-500" /> },
    { title: "Balance Amount", value: summary.balance_amount || 0, format: "currency", icon: <Banknote className="h-4 w-4 text-amber-500" /> },
  ];

  return (
    <ReportPageShell
      title="Sales Invoice Register"
      description="View all sales invoices, their statuses, and balances."
      actions={
        <ReportExportActions 
          title="Sales Invoice Register Report"
          data={data?.rows || []} 
          columns={columns}
          filename={`sales-invoice-register-${new Date().toISOString().split('T')[0]}`} 
          disabled={isLoading || !data || data.rows.length === 0}
          onFetchAll={handleFetchAllForExport}
          summaryCards={[
            { title: "Invoice Count", value: summary.invoice_count || 0 },
            { title: "Total Amount", value: formatMoney(summary.total_amount || 0) },
            { title: "Paid Amount", value: formatMoney(summary.paid_amount || 0) },
            { title: "Balance Amount", value: formatMoney(summary.balance_amount || 0) },
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
            <Label htmlFor="branch_select">Branch</Label>
            <Select 
              value={filters.branch_id ? String(filters.branch_id) : "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, branch_id: val === "all" ? undefined : Number(val) }))}
            >
              <SelectTrigger id="branch_select" className="w-[180px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(b => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="search">Search</Label>
            <Input 
              id="search" 
              placeholder="Search invoices, customers..."
              value={filters.search || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_from">Date From</Label>
            <Input 
              id="date_from" 
              type="date"
              value={filters.date_from || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
             placeholder="Enter Date From" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_to">Date To</Label>
            <Input 
              id="date_to" 
              type="date"
              value={filters.date_to || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
             placeholder="Enter Date To" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_preset">Date Presets</Label>
            <Select 
              value="custom" 
              onValueChange={(val) => {
                if (val === "oct_2026") {
                  setFilters(prev => ({ ...prev, date_from: "2026-10-01", date_to: "2026-10-31" }));
                } else if (val === "this_month") {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
                  setFilters(prev => ({ ...prev, date_from: firstDay, date_to: lastDay }));
                } else if (val === "clear") {
                  setFilters(prev => ({ ...prev, date_from: "", date_to: "" }));
                }
              }}
            >
              <SelectTrigger id="date_preset">
                <SelectValue placeholder="Quick Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Quick Presets...</SelectItem>
                <SelectItem value="oct_2026">October 2026</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="clear">Clear Dates (All Time)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="approval_status">Approval Status</Label>
            <Select 
              value={filters.approval_status || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, approval_status: val }))}
            >
              <SelectTrigger id="approval_status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select 
              value={filters.payment_status || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, payment_status: val }))}
            >
              <SelectTrigger id="payment_status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="posted_status">Posted Status</Label>
            <Select 
              value={filters.posted_status || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, posted_status: val }))}
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
        errorMessage ? (
          <div className="p-6">
            <ReportErrorState
              title="Failed to Generate Sales Invoice Register"
              errorDetails={errorMessage}
              onRetry={fetchData}
              onResetFilters={handleResetFilters}
            />
          </div>
        ) : (
          <ReportDataTable 
            columns={columns} 
            data={data?.rows || []} 
            isLoading={isLoading} 
            pagination={pagination}
            onPageChange={handlePageChange}
            emptyMessage="No sales invoices match your filter criteria."
          />
        )
      }
    />
  );
};
