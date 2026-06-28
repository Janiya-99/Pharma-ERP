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
  SalesByCustomerReportParams,
  SalesByCustomerReportRow,
} from "@/types/invoice-center-reports";
import { toast } from "sonner";
import {
  Users,
  FileText,
  Coins,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

export const SalesByCustomerReportPage: React.FC = () => {
  const [filters, setFilters] = useState<SalesByCustomerReportParams>({
    page: 1,
    limit: 10,
    search: "",
    posted_only: true,
  });

  const [data, setData] = useState<{
    summary: any;
    rows: SalesByCustomerReportRow[];
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

      const res = await invoiceCenterApi.getSalesByCustomerReport(filters);
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

  const columns: ColumnDef<SalesByCustomerReportRow>[] = [
    { header: "Customer Code", accessorKey: "customer_code" },
    { header: "Customer Name", accessorKey: "customer_name" },
    {
      header: "Invoices",
      cell: (row) => <span className="font-medium">{row.invoice_count}</span>,
      align: "center",
    },
    {
      header: "Total Sales",
      cell: (row) => (
        <span className="font-semibold text-navy-900">
          {formatMoney(row.total_sales_amount)}
        </span>
      ),
      align: "right",
    },
    {
      header: "CN Amount",
      cell: (row) => (
        <span className={row.credit_notes_amount > 0 ? "text-amber-600" : ""}>
          {formatMoney(row.credit_notes_amount)}
        </span>
      ),
      align: "right",
    },
    {
      header: "DN Amount",
      cell: (row) => formatMoney(row.debit_notes_amount),
      align: "right",
    },
    {
      header: "Receipts",
      cell: (row) => formatMoney(row.receipt_amount),
      align: "right",
    },
    {
      header: "Net Outstanding",
      cell: (row) => (
        <span
          className={`font-bold ${
            row.net_outstanding > 0
              ? "text-red-600"
              : row.net_outstanding < 0
              ? "text-emerald-600"
              : ""
          }`}
        >
          {formatMoney(row.net_outstanding)}
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
      title: "Customers",
      value: summary.customer_count || 0,
      format: "number",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Invoices",
      value: summary.invoice_count || 0,
      format: "number",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Total Sales",
      value: summary.total_sales_amount || 0,
      format: "currency",
      icon: <Coins className="text-emerald-500 h-4 w-4" />,
    },
    {
      title: "Net Outstanding",
      value: summary.balance_amount || 0,
      format: "currency",
      icon: <CreditCard className="h-4 w-4 text-amber-500" />,
    },
  ];

  return (
    <ReportPageShell
      title="Sales By Customer"
      description="View aggregated sales, collections, and outstanding balances per customer."
      actions={
        <ReportExportActions
          data={data}
          filename={`sales-by-customer-${
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
              placeholder="Search customers..."
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
