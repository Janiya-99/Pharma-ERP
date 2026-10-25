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
import { Checkbox } from "@/components/ui/checkbox";
import { SalesByCustomerReportParams, SalesByCustomerReportRow } from "@/types/invoice-center-reports";
import { normalizeReportEnvelope } from "@/utils/reportResponse";
import { useRef } from 'react';
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { Users, FileText, Coins, CreditCard } from "lucide-react";

export const SalesByCustomerReportPage: React.FC = () => {
  const [filters, setFilters] = useState<SalesByCustomerReportParams>({
    page: 1,
    limit: 10,
    search: "",
    posted_only: true,
  });
  
  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<{ summary: any, rows: SalesByCustomerReportRow[] } | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchData = async (overrideFilters?: SalesByCustomerReportParams) => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      
      const activeFilters = overrideFilters || filters;
      const res = await invoiceCenterApi.getSalesByCustomerReport(activeFilters);
      setData(normalizeReportEnvelope<any, SalesByCustomerReportRow>(res.data?.data));
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
      posted_only: true, date_from: "", date_to: ""
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val || 0);
  };

  const columns: ColumnDef<SalesByCustomerReportRow>[] = [
    { header: "Customer Code", accessorKey: "customer_code" },
    { header: "Customer Name", accessorKey: "customer_name" },
    { 
      header: "Invoices", 
      accessorKey: "invoice_count",
      cell: (row) => <span className="font-medium">{row.invoice_count}</span>,
      align: "center"
    },
    { 
      header: "Total Sales", 
      accessorKey: "total_sales_amount",
      cell: (row) => <span className="font-semibold text-navy-900">{formatMoney(row.total_sales_amount)}</span>,
      align: "right"
    },
    { 
      header: "CN Amount", 
      accessorKey: "credit_notes_amount",
      cell: (row) => (
        <span className={row.credit_notes_amount > 0 ? "text-amber-600" : ""}>
          {formatMoney(row.credit_notes_amount)}
        </span>
      ),
      align: "right"
    },
    { 
      header: "DN Amount", 
      accessorKey: "debit_notes_amount",
      cell: (row) => formatMoney(row.debit_notes_amount),
      align: "right"
    },
    { 
      header: "Receipts", 
      accessorKey: "receipt_amount",
      cell: (row) => formatMoney(row.receipt_amount),
      align: "right"
    },
    { 
      header: "Net Outstanding", 
      accessorKey: "net_outstanding",
      cell: (row) => (
        <span className={`font-bold ${row.net_outstanding > 0 ? "text-red-600" : row.net_outstanding < 0 ? "text-emerald-600" : ""}`}>
          {formatMoney(row.net_outstanding)}
        </span>
      ),
      align: "right"
    },
  ];

  const handleFetchAllForExport = async () => {
    const res = await invoiceCenterApi.getSalesByCustomerReport({
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
    { title: "Customers", value: summary.customer_count || 0, format: "number", icon: <Users className="h-4 w-4" /> },
    { title: "Invoices", value: summary.invoice_count || 0, format: "number", icon: <FileText className="h-4 w-4" /> },
    { title: "Total Sales", value: summary.total_sales_amount || 0, format: "currency", icon: <Coins className="h-4 w-4 text-emerald-500" /> },
    { title: "Net Outstanding", value: summary.balance_amount || 0, format: "currency", icon: <CreditCard className="h-4 w-4 text-amber-500" /> },
  ];

  return (
    <ReportPageShell
      title="Sales By Customer"
      description="View aggregated sales, collections, and outstanding balances per customer."
      actions={
        <ReportExportActions 
          title="Sales By Customer Report"
          data={data} 
          columns={columns}
          filename={`sales-by-customer-${new Date().toISOString().split('T')[0]}`} 
          disabled={isLoading || !data || data.rows.length === 0}
          onFetchAll={handleFetchAllForExport}
          summaryCards={[
            { title: "Customers", value: summary.customer_count || 0 },
            { title: "Invoices", value: summary.invoice_count || 0 },
            { title: "Total Sales", value: formatMoney(summary.total_sales_amount || 0) },
            { title: "Net Outstanding", value: formatMoney(summary.balance_amount || 0) },
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
              placeholder="Search customers..."
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
          <div className="space-y-1 flex items-end pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="posted_only" 
                checked={filters.posted_only}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, posted_only: checked as boolean }))}
              />
              <Label htmlFor="posted_only" className="cursor-pointer">Posted Documents Only</Label>
            </div>
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
