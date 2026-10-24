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
import { ReportErrorState } from "@/components/invoice-center/reports/ReportErrorState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CustomerStatementReportParams,
  CustomerStatementReportLine,
  CustomerStatementReportHeader,
} from "@/types/invoice-center-reports";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDebounce } from "@/hooks/useDebounce";

const getDefaultDateRange = () => {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    date_from: formatDate(startOfMonth),
    date_to: formatDate(today),
  };
};

export const CustomerStatementReportPage: React.FC = () => {
  const defaultDates = getDefaultDateRange();
  const [filters, setFilters] = useState<
    Omit<CustomerStatementReportParams, "customer_id"> & { customer_id: string }
  >({
    customer_id: "",
    date_from: defaultDates.date_from,
    date_to: defaultDates.date_to,
    include_unposted: false,
  });

  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<{
    header: CustomerStatementReportHeader;
    lines: CustomerStatementReportLine[];
  } | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStatement = async (custId: string, customFilters?: typeof filters) => {
    if (!custId) {
      return;
    }

    const activeFilters = customFilters || filters;
    if (activeFilters.date_from && activeFilters.date_to && activeFilters.date_from > activeFilters.date_to) {
      toast.error("Date From cannot be later than Date To.");
      return;
    }

    try {
      setIsLoading(true);
      setHasPermission(true);
      setErrorMessage(null);

      const payload = {
        ...activeFilters,
        customer_id: parseInt(custId, 10),
      };

      const res = await invoiceCenterApi.getCustomerStatementReport(
        payload as any
      );
      const report = res.data?.data;
      setData(
        report
          ? {
              header: report.summary,
              lines: Array.isArray(report.rows) ? report.rows : [],
            }
          : null
      );
    } catch (err: any) {
      if (err.response?.status === 403) {
        setHasPermission(false);
      } else {
        const msg = err.response?.data?.message || err.response?.data?.errors || "Failed to load report data";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load customers for dropdown and set first customer
    const loadCustomers = async () => {
      try {
        const res = await invoiceCenterApi.getCustomers({ limit: 1000 });
        const list = res.data?.data || [];
        setCustomers(list);
        if (list.length > 0 && !filters.customer_id) {
          const firstId = String(list[0].id);
          setFilters((prev) => ({ ...prev, customer_id: firstId }));
        }
      } catch (err) {
        console.error("Failed to load customers", err);
      }
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    if (debouncedFilters.customer_id) {
      fetchStatement(debouncedFilters.customer_id, debouncedFilters);
    }
  }, [debouncedFilters]);

  const fetchData = async () => {
    fetchStatement(filters.customer_id);
  };

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleResetFilters = () => {
    const defaultRange = getDefaultDateRange();
    setFilters((prev) => ({
      customer_id: prev.customer_id,
      date_from: defaultRange.date_from,
      date_to: defaultRange.date_to,
      include_unposted: false,
    }));
    setErrorMessage(null);
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(val || 0);
  };

  const formatReportDate = (val?: string) => {
    if (!val || val.startsWith("0001-01-01") || val === "null" || val === "undefined") {
      return "-";
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const columns: ColumnDef<CustomerStatementReportLine>[] = [
    {
      header: "Date",
      accessorKey: "transaction_date",
      cell: (row) => formatReportDate(row.transaction_date),
    },
    { header: "Type", accessorKey: "document_type" },
    { header: "Doc No.", accessorKey: "document_number" },
    { header: "Reference", accessorKey: "reference_number" },
    { header: "Description", accessorKey: "description" },
    {
      header: "Debit (LKR)",
      cell: (row) =>
        row.debit_amount > 0 ? formatMoney(row.debit_amount) : "-",
      align: "right",
    },
    {
      header: "Credit (LKR)",
      cell: (row) =>
        row.credit_amount > 0 ? formatMoney(row.credit_amount) : "-",
      align: "right",
    },
    {
      header: "Running Balance",
      cell: (row) => formatMoney(row.running_balance),
      align: "right",
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge
          variant={
            row.operational_status === "posted" ? "default" : "secondary"
          }
        >
          {row.operational_status}
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
      title="Customer Statement"
      description="View detailed transaction history and running balances for a specific customer."
      actions={
        <ReportExportActions
          data={data?.lines || []}
          columns={columns}
          filename={`customer-statement-${filters.customer_id}-${
            new Date().toISOString().split("T")[0]
          }`}
          disabled={isLoading || !data || !data.lines || data.lines.length === 0}
        />
      }
      filters={
        <ReportFilterBar
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isLoading={isLoading}
        >
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="customer_id">
              Customer <span className="text-red-500">*</span>
            </Label>
            <Select
              value={filters.customer_id}
              onValueChange={(val) => {
                setFilters((prev) => ({ ...prev, customer_id: val }));
                fetchStatement(val);
              }}
            >
              <SelectTrigger id="customer_id">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => {
                  const customerName = c.customer_name || c.company_name;
                  const label = customerName
                    ? `${c.customer_code} - ${customerName}`
                    : (c.customer_code || `Customer #${c.id}`);
                  return (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
             placeholder="Enter Date From" />
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
              placeholder="Enter Date To"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_preset">Date Preset</Label>
            <Select
              value="custom"
              onValueChange={(val) => {
                const today = new Date();
                const pad = (n: number) => String(n).padStart(2, "0");
                const formatDate = (d: Date) =>
                  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

                if (val === "this_month") {
                  const startOfMonth = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                  );
                  setFilters((prev) => ({
                    ...prev,
                    date_from: formatDate(startOfMonth),
                    date_to: formatDate(today),
                  }));
                } else if (val === "last_month") {
                  const startOfLastMonth = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1,
                    1
                  );
                  const endOfLastMonth = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    0
                  );
                  setFilters((prev) => ({
                    ...prev,
                    date_from: formatDate(startOfLastMonth),
                    date_to: formatDate(endOfLastMonth),
                  }));
                } else if (val === "this_year") {
                  const startOfYear = new Date(today.getFullYear(), 0, 1);
                  setFilters((prev) => ({
                    ...prev,
                    date_from: formatDate(startOfYear),
                    date_to: formatDate(today),
                  }));
                } else if (val === "all_time") {
                  setFilters((prev) => ({
                    ...prev,
                    date_from: "",
                    date_to: "",
                  }));
                }
              }}
            >
              <SelectTrigger id="date_preset">
                <SelectValue placeholder="Quick Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Quick Range...</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">Year to Date (YTD)</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end space-y-1 pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include_unposted"
                checked={filters.include_unposted}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    include_unposted: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="include_unposted" className="cursor-pointer">
                Include Unposted
              </Label>
            </div>
          </div>
        </ReportFilterBar>
      }
      summary={
        data && data.header ? (
          <Card className="bg-white">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg">
                Statement Summary: {data.header.customer_name} (
                {data.header.customer_code})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    Opening Balance
                  </p>
                  <p className="mt-1 text-2xl font-bold text-navy-900">
                    {formatMoney(data.header.opening_balance)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    Closing Balance
                  </p>
                  <p className="mt-1 text-2xl font-bold text-navy-900">
                    {formatMoney(data.header.closing_balance)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    Credit Limit
                  </p>
                  <p className="text-slate-700 mt-1 text-lg font-medium">
                    {formatMoney(data.header.credit_limit)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Period</p>
                  <p className="text-slate-700 mt-1 text-lg font-medium">
                    {data.header.date_from && !data.header.date_from.startsWith("0001-01-01")
                      ? formatReportDate(data.header.date_from)
                      : "Start"}{" "}
                    to{" "}
                    {data.header.date_to && !data.header.date_to.startsWith("0001-01-01")
                      ? formatReportDate(data.header.date_to)
                      : "Present"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null
      }
      table={
        errorMessage ? (
          <ReportErrorState
            error={errorMessage}
            onRetry={() => fetchStatement(filters.customer_id)}
            onReset={handleResetFilters}
          />
        ) : (
          <ReportDataTable
            columns={columns}
            data={data?.lines || []}
            isLoading={isLoading}
            emptyMessage={
              !filters.customer_id
                ? "Select a customer from the filters above to view the statement."
                : "No transactions found for the selected period."
            }
          />
        )
      }
    />
  );
};
