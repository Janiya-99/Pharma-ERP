import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  CustomerAgingReportParams,
  CustomerAgingReportRow,
} from "@/types/invoice-center-reports";
import { toast } from "sonner";

export const CustomerAgingReportPage: React.FC = () => {
  const [filters, setFilters] = useState<CustomerAgingReportParams>({
    page: 1,
    limit: 10,
    search: "",
    as_of_date: new Date().toISOString().split("T")[0],
  });

  const [data, setData] = useState<CustomerAgingReportRow[]>([]);
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

      const res = await invoiceCenterApi.getCustomerAgingReport(filters);
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
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      as_of_date: new Date().toISOString().split("T")[0],
    });
    setTimeout(() => handleApplyFilters(), 0);
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
          data={data}
          filename={`customer-aging-${new Date().toISOString().split("T")[0]}`}
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
            />
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
