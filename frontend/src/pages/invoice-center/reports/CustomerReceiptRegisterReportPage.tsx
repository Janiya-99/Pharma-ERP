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
import { CustomerReceiptRegisterReportParams, CustomerReceiptRegisterReportRow } from "@/types/invoice-center-reports";
import { normalizeReportEnvelope } from "@/utils/reportResponse";
import { toast } from "sonner";
import { Banknote, Coins, CreditCard } from "lucide-react";

export const CustomerReceiptRegisterReportPage: React.FC = () => {
  const [filters, setFilters] = useState<CustomerReceiptRegisterReportParams>({
    page: 1,
    limit: 10,
    search: "",
    payment_method: "all",
    approval_status: "all",
    posted_status: "all",
    receipt_status: "all",
    finance_post_status: "all",
  });
  
  const [data, setData] = useState<{ summary: any, rows: CustomerReceiptRegisterReportRow[] } | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      
      const cleanFilters = { ...filters };
      if (cleanFilters.payment_method === "all") delete cleanFilters.payment_method;
      if (cleanFilters.approval_status === "all") delete cleanFilters.approval_status;
      if (cleanFilters.posted_status === "all") delete cleanFilters.posted_status;
      if (cleanFilters.receipt_status === "all") delete cleanFilters.receipt_status;
      if (cleanFilters.finance_post_status === "all") delete cleanFilters.finance_post_status;

      const res = await invoiceCenterApi.getCustomerReceiptRegisterReport(cleanFilters);
      setData(normalizeReportEnvelope<any, CustomerReceiptRegisterReportRow>(res.data?.data));
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
      payment_method: "all", approval_status: "all", 
      posted_status: "all", receipt_status: "all", finance_post_status: "all" 
    });
    setTimeout(() => handleApplyFilters(), 0);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val || 0);
  };

  const columns: ColumnDef<CustomerReceiptRegisterReportRow>[] = [
    { header: "Receipt Number", accessorKey: "receipt_number" },
    { header: "Date", accessorKey: "receipt_date" },
    { header: "Customer Name", accessorKey: "customer_name" },
    { 
      header: "Payment Method", 
      cell: (row) => (
        <Badge variant="outline">{row.payment_method}</Badge>
      ),
      align: "center"
    },
    { 
      header: "Amount", 
      cell: (row) => <span className="font-semibold text-navy-900">{formatMoney(row.receipt_amount)}</span>,
      align: "right"
    },
    { 
      header: "Allocated", 
      cell: (row) => formatMoney(row.allocated_amount),
      align: "right"
    },
    { 
      header: "Unallocated", 
      cell: (row) => formatMoney(row.unallocated_amount),
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
    { title: "Receipt Count", value: summary.receipt_count || 0, format: "number", icon: <Banknote className="h-4 w-4" /> },
    { title: "Receipt Amount", value: summary.receipt_amount || 0, format: "currency", icon: <Coins className="h-4 w-4 text-emerald-500" /> },
    { title: "Allocated Amount", value: summary.allocated_amount || 0, format: "currency", icon: <CreditCard className="h-4 w-4 text-indigo-500" /> },
    { title: "Unallocated Amount", value: summary.unallocated_amount || 0, format: "currency", icon: <CreditCard className="h-4 w-4 text-amber-500" /> },
  ];

  return (
    <ReportPageShell
      title="Customer Receipt Register"
      description="View all customer receipts, allocations, and statuses."
      actions={
        <ReportExportActions 
          data={data} 
          filename={`customer-receipt-register-${new Date().toISOString().split('T')[0]}`} 
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
              placeholder="Search receipts, customers..."
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
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select 
              value={filters.payment_method || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, payment_method: val }))}
            >
              <SelectTrigger id="payment_method">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="receipt_status">Receipt Status</Label>
            <Select 
              value={filters.receipt_status || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, receipt_status: val }))}
            >
              <SelectTrigger id="receipt_status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unallocated">Unallocated</SelectItem>
                <SelectItem value="partially_allocated">Partially Allocated</SelectItem>
                <SelectItem value="fully_allocated">Fully Allocated</SelectItem>
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
