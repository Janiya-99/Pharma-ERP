import React, { useState, useEffect } from 'react';
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { ReportPageShell } from "@/components/invoice-center/reports/ReportPageShell";
import { ReportFilterBar } from "@/components/invoice-center/reports/ReportFilterBar";
import { ReportDataTable, ColumnDef } from "@/components/invoice-center/reports/ReportDataTable";
import { ReportPermissionState } from "@/components/invoice-center/reports/ReportPermissionState";
import { ReportExportActions } from "@/components/invoice-center/reports/ReportExportActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CustomerBalanceReportParams, CustomerBalanceReportRow } from "@/types/invoice-center-reports";
import { toast } from "sonner";

export const CustomerBalanceReportPage: React.FC = () => {
  const [filters, setFilters] = useState<CustomerBalanceReportParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "all",
  });
  
  const [data, setData] = useState<CustomerBalanceReportRow[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      
      const cleanFilters = { ...filters };
      if (cleanFilters.status === "all") delete cleanFilters.status;

      const res = await invoiceCenterApi.getCustomerBalanceReport(cleanFilters);
      setData(res.data?.data || []);
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
    setFilters({ page: 1, limit: 10, search: "", status: "all" });
    setTimeout(() => handleApplyFilters(), 0);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val);
  };

  const columns: ColumnDef<CustomerBalanceReportRow>[] = [
    { header: "Customer Code", accessorKey: "customer_code" },
    { header: "Customer Name", accessorKey: "customer_name" },
    { header: "Category", accessorKey: "customer_category" },
    { header: "Type", accessorKey: "customer_type" },
    { 
      header: "Credit Limit", 
      cell: (row) => formatMoney(row.credit_limit),
      align: "right"
    },
    { 
      header: "Current Balance", 
      cell: (row) => formatMoney(row.current_balance),
      align: "right"
    },
    { 
      header: "Available Credit", 
      cell: (row) => formatMoney(row.available_credit),
      align: "right"
    },
    { 
      header: "Credit Status", 
      cell: (row) => (
        <Badge variant={row.credit_status === 'over_limit' ? 'destructive' : 'secondary'}>
          {row.credit_status === 'over_limit' ? 'Over Limit' : 'Within Limit'}
        </Badge>
      ),
      align: "center"
    },
    { 
      header: "Status", 
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
          {row.status}
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

  return (
    <ReportPageShell
      title="Customer Balances"
      description="View credit limits, current balances, and available credit for all customers."
      actions={
        <ReportExportActions 
          data={data} 
          filename={`customer-balances-${new Date().toISOString().split('T')[0]}`} 
          disabled={isLoading || data.length === 0}
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
            <Label htmlFor="status">Status</Label>
            <Select 
              value={filters.status || "all"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
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
        </ReportFilterBar>
      }
      table={
        <ReportDataTable 
          columns={columns} 
          data={data} 
          isLoading={isLoading} 
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      }
    />
  );
};
