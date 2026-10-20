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
} from "@/types/invoice-center-reports";
import { toast } from "sonner";

export const CustomerBalanceReportPage: React.FC = () => {
  const [filters, setFilters] = useState<CustomerBalanceReportParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "all",
  });

  const [data, setData] = useState<CustomerBalanceReportRow[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
  const [creditStatusFilter, setCreditStatusFilter] = useState<string>("all");
  const [minBalanceFilter, setMinBalanceFilter] = useState<string>("all");

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

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (
        customerTypeFilter !== "all" &&
        row.customer_type?.toLowerCase() !== customerTypeFilter.toLowerCase()
      ) {
        return false;
      }
      if (creditStatusFilter !== "all" && row.credit_status !== creditStatusFilter) {
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

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasPermission(true);

      const cleanFilters = { ...filters };
      if (cleanFilters.status === "all") delete cleanFilters.status;

      const res = await invoiceCenterApi.getCustomerBalanceReport(cleanFilters);
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
        toast.error(
          err.response?.data?.message || "Failed to load report data"
        );
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
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleResetFilters = () => {
    setCustomerTypeFilter("all");
    setCreditStatusFilter("all");
    setMinBalanceFilter("all");
    setFilters({ page: 1, limit: 10, search: "", status: "all" });
    setTimeout(() => handleApplyFilters(), 0);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(val);
  };

  const columns: ColumnDef<CustomerBalanceReportRow>[] = [
    { header: "Customer Code", accessorKey: "customer_code" },
    { header: "Customer Name", accessorKey: "customer_name" },
    { header: "Category", accessorKey: "customer_category" },
    { header: "Type", accessorKey: "customer_type" },
    {
      header: "Credit Limit",
      cell: (row) => formatMoney(row.credit_limit),
      align: "right",
    },
    {
      header: "Current Balance",
      cell: (row) => formatMoney(row.current_balance),
      align: "right",
    },
    {
      header: "Available Credit",
      cell: (row) => formatMoney(row.available_credit),
      align: "right",
    },
    {
      header: "Credit Status",
      cell: (row) => (
        <Badge
          variant={
            row.credit_status === "over_limit" ? "destructive" : "secondary"
          }
        >
          {row.credit_status === "over_limit" ? "Over Limit" : "Within Limit"}
        </Badge>
      ),
      align: "center",
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>
          {row.status}
        </Badge>
      ),
      align: "center",
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
          filename={`customer-balances-${
            new Date().toISOString().split("T")[0]
          }`}
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
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.customer_code || c.company_name}>
                    {c.customer_code} - {c.company_name}
                  </SelectItem>
                ))}
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
        <ReportDataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      }
    />
  );
};
