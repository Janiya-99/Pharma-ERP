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
import { SalesInvoiceRegisterReportParams, SalesInvoiceRegisterReportRow } from "@/types/invoice-center-reports";
import { toast } from "sonner";
import { FileText, Coins, CreditCard, Banknote } from "lucide-react";

export const SalesInvoiceRegisterReportPage: React.FC = () => {
  const [filters, setFilters] = useState<SalesInvoiceRegisterReportParams>({
    page: 1,
    limit: 10,
    search: "",
    approval_status: "all",
    posted_status: "all",
    payment_status: "all",
    finance_post_status: "all",
  });
  
  const [data, setData] = useState<{ summary: any, rows: SalesInvoiceRegisterReportRow[] } | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      
      const cleanFilters = { ...filters };
      if (cleanFilters.approval_status === "all") delete cleanFilters.approval_status;
      if (cleanFilters.posted_status === "all") delete cleanFilters.posted_status;
      if (cleanFilters.payment_status === "all") delete cleanFilters.payment_status;
      if (cleanFilters.finance_post_status === "all") delete cleanFilters.finance_post_status;

      const res = await invoiceCenterApi.getSalesInvoiceRegisterReport(cleanFilters);
      setData(res.data?.data || null);
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

  useEffect(() => {
    fetchData();
  }, [filters.page]);

  const handleApplyFilters = () => {
    if (filters.page === 1) {
      fetchData();
    } else {
      setFilters(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleResetFilters = () => {
    setFilters({ 
      page: 1, limit: 10, search: "", 
      approval_status: "all", posted_status: "all", 
      payment_status: "all", finance_post_status: "all" 
    });
    setTimeout(() => handleApplyFilters(), 0);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val || 0);
  };

  const columns: ColumnDef<SalesInvoiceRegisterReportRow>[] = [
    { header: "Invoice Number", accessorKey: "invoice_number" },
    { header: "Date", accessorKey: "invoice_date" },
    { header: "Due Date", accessorKey: "due_date" },
    { header: "Customer Name", accessorKey: "customer_name" },
    { header: "Order No.", accessorKey: "sales_order_number" },
    { 
      header: "Total", 
      cell: (row) => <span className="font-semibold text-navy-900">{formatMoney(row.total_amount)}</span>,
      align: "right"
    },
    { 
      header: "Paid", 
      cell: (row) => formatMoney(row.paid_amount),
      align: "right"
    },
    { 
      header: "Balance", 
      cell: (row) => formatMoney(row.balance_amount),
      align: "right"
    },
    { 
      header: "Approval", 
      cell: (row) => (
        <Badge variant={row.approval_status === 'approved' ? 'default' : row.approval_status === 'rejected' ? 'destructive' : 'secondary'}>
          {row.approval_status}
        </Badge>
      ),
      align: "center"
    },
    { 
      header: "Posted", 
      cell: (row) => (
        <Badge variant={row.posted_status === 'posted' ? 'default' : 'secondary'}>
          {row.posted_status}
        </Badge>
      ),
      align: "center"
    },
    { 
      header: "Payment", 
      cell: (row) => (
        <Badge variant={row.payment_status === 'paid' ? 'default' : row.payment_status === 'partially_paid' ? 'secondary' : 'outline'}>
          {row.payment_status}
        </Badge>
      ),
      align: "center"
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
    { title: "Invoice Count", value: summary.invoice_count || 0, format: "number", icon: <FileText className="h-4 w-4" /> },
    { title: "Total Amount", value: summary.total_amount || 0, format: "currency", icon: <Coins className="h-4 w-4 text-emerald-500" /> },
    { title: "Paid Amount", value: summary.paid_amount || 0, format: "currency", icon: <CreditCard className="h-4 w-4 text-blue-500" /> },
    { title: "Balance Amount", value: summary.balance_amount || 0, format: "currency", icon: <Banknote className="h-4 w-4 text-amber-500" /> },
  ];

  return (
    <ReportPageShell
      title="Sales Invoice Register"
      description="View all sales invoices, their statuses, and balances."
      actions={
        <ReportExportActions 
          data={data} 
          filename={`sales-invoice-register-${new Date().toISOString().split('T')[0]}`} 
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
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_to">Date To</Label>
            <Input 
              id="date_to" 
              type="date"
              value={filters.date_to || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
            />
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
                <SelectItem value="all">All</SelectItem>
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
                <SelectItem value="all">All</SelectItem>
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
