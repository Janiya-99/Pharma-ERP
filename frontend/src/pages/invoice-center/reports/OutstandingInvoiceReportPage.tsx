import React, { useState, useEffect } from 'react';
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { ReportPageShell } from "@/components/invoice-center/reports/ReportPageShell";
import { ReportFilterBar } from "@/components/invoice-center/reports/ReportFilterBar";
import { ReportSummaryCards, SummaryCardItem } from "@/components/invoice-center/reports/ReportSummaryCards";
import { ReportDataTable, ColumnDef } from "@/components/invoice-center/reports/ReportDataTable";
import { ReportPermissionState } from "@/components/invoice-center/reports/ReportPermissionState";
import { ReportExportActions } from "@/components/invoice-center/reports/ReportExportActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { OutstandingInvoiceReportParams, OutstandingInvoiceReportRow } from "@/types/invoice-center-reports";
import { normalizeReportEnvelope } from "@/utils/reportResponse";
import { useRef } from 'react';
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { FileText, Coins, AlertTriangle, CalendarDays } from "lucide-react";

export const OutstandingInvoiceReportPage: React.FC = () => {
  const [filters, setFilters] = useState<OutstandingInvoiceReportParams>({
    page: 1,
    limit: 10,
    search: "",
    payment_status: "all",
    as_of_date: new Date().toISOString().split('T')[0],
  });
  
  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<{ summary: any, rows: OutstandingInvoiceReportRow[] } | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchData = async (overrideFilters?: OutstandingInvoiceReportParams) => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      
      const cleanFilters = { ...(overrideFilters || filters) };
      if (cleanFilters.payment_status === "all") delete cleanFilters.payment_status;

      const res = await invoiceCenterApi.getOutstandingInvoiceReport(cleanFilters);
      setData(normalizeReportEnvelope<any, OutstandingInvoiceReportRow>(res.data?.data));
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
        toast.error(err.response?.data?.message || "Failed to load report data");
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
      payment_status: "all", as_of_date: new Date().toISOString().split('T')[0]
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val || 0);
  };

  const columns: ColumnDef<OutstandingInvoiceReportRow>[] = [
    { header: "Invoice Number", accessorKey: "invoice_number" },
    { header: "Date", accessorKey: "invoice_date" },
    { header: "Due Date", accessorKey: "due_date" },
    { header: "Customer Name", accessorKey: "customer_name" },
    { 
      header: "Total", 
      accessorKey: "total_amount",
      cell: (row) => formatMoney(row.total_amount),
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
      cell: (row) => <span className="font-semibold text-navy-900">{formatMoney(row.balance_amount)}</span>,
      align: "right"
    },
    { 
      header: "Payment", 
      accessorKey: "payment_status",
      cell: (row) => (
        <Badge variant={row.payment_status === 'unpaid' ? 'destructive' : row.payment_status === 'partially_paid' ? 'secondary' : 'default'}>
          {row.payment_status}
        </Badge>
      ),
      align: "center"
    },
    { 
      header: "Days Overdue", 
      accessorKey: "days_overdue",
      cell: (row) => (
        <span className={row.days_overdue > 0 ? "text-red-600 font-semibold" : "text-slate-500"}>
          {row.days_overdue > 0 ? `${row.days_overdue} days` : 'Not Due'}
          {row.days_overdue > 0 && <Badge variant="destructive" className="ml-2 py-0">!</Badge>}
        </span>
      ),
      align: "right"
    },
  ];

  const handleFetchAllForExport = async () => {
    const res = await invoiceCenterApi.getOutstandingInvoices({
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
    { title: "Total Balance", value: summary.balance_amount || 0, format: "currency", icon: <Coins className="h-4 w-4 text-emerald-500" /> },
    { title: "Overdue Amount", value: summary.overdue_amount || 0, format: "currency", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
    { title: "Not Due Amount", value: summary.not_due_amount || 0, format: "currency", icon: <CalendarDays className="h-4 w-4 text-indigo-500" /> },
  ];

  return (
    <ReportPageShell
      title="Outstanding Invoices"
      description="View all unpaid or partially paid invoices and track overdue payments."
      actions={
        <ReportExportActions 
          title="Outstanding Invoices Report"
          data={data} 
          columns={columns}
          filename={`outstanding-invoices-${new Date().toISOString().split('T')[0]}`} 
          disabled={isLoading || !data || data.rows.length === 0}
          onFetchAll={handleFetchAllForExport}
          summaryCards={[
            { title: "Invoice Count", value: summary.invoice_count || 0 },
            { title: "Total Balance", value: formatMoney(summary.balance_amount || 0) },
            { title: "Overdue Amount", value: formatMoney(summary.overdue_amount || 0) },
            { title: "Not Due Amount", value: formatMoney(summary.not_due_amount || 0) },
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
            <Label htmlFor="search">Search</Label>
            <Input 
              id="search" 
              placeholder="Search invoices, customers..."
              value={filters.search || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="as_of_date">As Of Date</Label>
            <Input 
              id="as_of_date" 
              type="date"
              value={filters.as_of_date || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, as_of_date: e.target.value }))}
             placeholder="Enter As Of Date" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="due_date_from">Due Date From</Label>
            <Input 
              id="due_date_from" 
              type="date"
              value={filters.due_date_from || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, due_date_from: e.target.value }))}
             placeholder="Enter Due Date From" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="due_date_to">Due Date To</Label>
            <Input 
              id="due_date_to" 
              type="date"
              value={filters.due_date_to || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, due_date_to: e.target.value }))}
             placeholder="Enter Due Date To" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select 
              value={filters.payment_status || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, payment_status: val }))}
            >
              <SelectTrigger id="payment_status">
                <SelectValue placeholder="All Outstanding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outstanding</SelectItem>
                <SelectItem value="unpaid">Unpaid Only</SelectItem>
                <SelectItem value="partially_paid">Partially Paid Only</SelectItem>
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
