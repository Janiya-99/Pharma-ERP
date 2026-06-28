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
import { SalesOrderRegisterReportParams, SalesOrderRegisterReportRow } from "@/types/invoice-center-reports";
import { toast } from "sonner";
import { ShoppingCart, CheckCircle, Clock, Coins } from "lucide-react";

export const SalesOrderRegisterReportPage: React.FC = () => {
  const [filters, setFilters] = useState<SalesOrderRegisterReportParams>({
    page: 1,
    limit: 10,
    search: "",
    approval_status: "all",
    order_status: "all",
  });
  
  const [data, setData] = useState<{ summary: any, rows: SalesOrderRegisterReportRow[] } | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      
      const cleanFilters = { ...filters };
      if (cleanFilters.approval_status === "all") delete cleanFilters.approval_status;
      if (cleanFilters.order_status === "all") delete cleanFilters.order_status;

      const res = await invoiceCenterApi.getSalesOrderRegisterReport(cleanFilters);
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
    setFilters({ page: 1, limit: 10, search: "", approval_status: "all", order_status: "all" });
    setTimeout(() => handleApplyFilters(), 0);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val || 0);
  };

  const columns: ColumnDef<SalesOrderRegisterReportRow>[] = [
    { header: "Order Number", accessorKey: "sales_order_number" },
    { header: "Date", accessorKey: "sales_order_date" },
    { header: "Customer Name", accessorKey: "customer_name" },
    { 
      header: "Subtotal", 
      cell: (row) => formatMoney(row.subtotal_amount),
      align: "right"
    },
    { 
      header: "Discount", 
      cell: (row) => formatMoney(row.discount_amount),
      align: "right"
    },
    { 
      header: "Tax", 
      cell: (row) => formatMoney(row.tax_amount),
      align: "right"
    },
    { 
      header: "Total", 
      cell: (row) => (
        <span className="font-semibold text-navy-900">
          {formatMoney(row.total_amount)}
        </span>
      ),
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
      header: "Status", 
      cell: (row) => (
        <Badge variant={row.order_status === 'closed' ? 'secondary' : 'default'}>
          {row.order_status}
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
    { title: "Order Count", value: summary.order_count || 0, format: "number", icon: <ShoppingCart className="h-4 w-4" /> },
    { title: "Total Amount", value: summary.total_amount || 0, format: "currency", icon: <Coins className="h-4 w-4 text-emerald-500" /> },
    { title: "Approved Orders", value: summary.approved_count || 0, format: "number", icon: <CheckCircle className="h-4 w-4 text-blue-500" /> },
    { title: "Pending Orders", value: summary.pending_count || 0, format: "number", icon: <Clock className="h-4 w-4 text-amber-500" /> },
  ];

  return (
    <ReportPageShell
      title="Sales Order Register"
      description="View and analyze all sales orders across the organization."
      actions={
        <ReportExportActions 
          data={data} 
          filename={`sales-order-register-${new Date().toISOString().split('T')[0]}`} 
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
              placeholder="Search orders, customers..."
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
            <Label htmlFor="approval_status">Approval Status</Label>
            <Select 
              value={filters.approval_status || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, approval_status: val }))}
            >
              <SelectTrigger id="approval_status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="order_status">Order Status</Label>
            <Select 
              value={filters.order_status || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, order_status: val }))}
            >
              <SelectTrigger id="order_status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
