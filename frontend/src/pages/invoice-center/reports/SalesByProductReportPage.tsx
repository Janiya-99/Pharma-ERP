import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { ReportPageShell } from "@/components/invoice-center/reports/ReportPageShell";
import { ReportFilterBar } from "@/components/invoice-center/reports/ReportFilterBar";
import {
  ReportSummaryCards,
  SummaryCardItem,
} from "@/components/invoice-center/reports/ReportSummaryCards";
import {
  ReportDataTable,
  ColumnDef,
} from "@/components/invoice-center/reports/ReportDataTable";
import { ReportPermissionState } from "@/components/invoice-center/reports/ReportPermissionState";
import { ReportExportActions } from "@/components/invoice-center/reports/ReportExportActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SalesByProductReportParams,
  SalesByProductReportRow,
} from "@/types/invoice-center-reports";
import { normalizeReportEnvelope } from "@/utils/reportResponse";
import { toast } from "sonner";
import { Package, Hash, Coins, Percent } from "lucide-react";

export const SalesByProductReportPage: React.FC = () => {
  const [filters, setFilters] = useState<SalesByProductReportParams>({
    page: 1,
    limit: 10,
    search: "",
    posted_only: true,
  });

  const [data, setData] = useState<{
    summary: any;
    rows: SalesByProductReportRow[];
  } | null>(null);
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

      const res = await invoiceCenterApi.getSalesByProductReport(filters);
      setData(normalizeReportEnvelope<any, SalesByProductReportRow>(res.data?.data));
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
      posted_only: true,
      date_from: "",
      date_to: "",
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

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("en-US").format(val || 0);
  };

  const columns: ColumnDef<SalesByProductReportRow>[] = [
    { header: "Product Code", accessorKey: "product_code" },
    { header: "Product Name", accessorKey: "product_name" },
    {
      header: "Category",
      accessorKey: "category",
      align: "left",
    },
    {
      header: "Quantity Sold",
      cell: (row) => (
        <span className="font-medium">{formatNumber(row.quantity_sold)}</span>
      ),
      align: "right",
    },
    {
      header: "Avg Price",
      cell: (row) => formatMoney(row.average_unit_price),
      align: "right",
    },
    {
      header: "Total Revenue",
      cell: (row) => (
        <span className="font-semibold text-navy-900">
          {formatMoney(row.total_sales_amount)}
        </span>
      ),
      align: "right",
    },
    {
      header: "% of Total",
      cell: (row) => (
        <span className="text-slate-500">
          {Number(row.percentage_of_total).toFixed(2)}%
        </span>
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

  const summary = data?.summary || {};
  const summaryCards: SummaryCardItem[] = [
    {
      title: "Products Sold",
      value: summary.product_count || 0,
      format: "number",
      icon: <Package className="h-4 w-4" />,
    },
    {
      title: "Total Quantity",
      value: summary.total_quantity || 0,
      format: "number",
      icon: <Hash className="h-4 w-4" />,
    },
    {
      title: "Total Revenue",
      value: summary.total_revenue || 0,
      format: "currency",
      icon: <Coins className="text-emerald-500 h-4 w-4" />,
    },
    {
      title: "Avg Order Value",
      value:
        summary.total_revenue && summary.product_count
          ? summary.total_revenue / summary.product_count
          : 0,
      format: "currency",
      icon: <Percent className="h-4 w-4 text-blue-500" />,
    },
  ];

  return (
    <ReportPageShell
      title="Sales By Product"
      description="View product performance, quantities sold, and revenue generated."
      actions={
        <ReportExportActions
          data={data}
          filename={`sales-by-product-${
            new Date().toISOString().split("T")[0]
          }`}
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
              placeholder="Search products..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_from">Date From</Label>
            <Input
              id="date_from"
              type="date"
              value={filters.date_from || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date_from: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_to">Date To</Label>
            <Input
              id="date_to"
              type="date"
              value={filters.date_to || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date_to: e.target.value }))
              }
            />
          </div>
          <div className="flex items-end space-y-1 pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="posted_only"
                checked={filters.posted_only}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    posted_only: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="posted_only" className="cursor-pointer">
                Posted Documents Only
              </Label>
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
