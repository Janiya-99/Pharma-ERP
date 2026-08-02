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

export const CustomerStatementReportPage: React.FC = () => {
  const [filters, setFilters] = useState<
    Omit<CustomerStatementReportParams, "customer_id"> & { customer_id: string }
  >({
    customer_id: "",
    date_from: "",
    date_to: "",
    include_unposted: false,
  });

  const [data, setData] = useState<{
    header: CustomerStatementReportHeader;
    lines: CustomerStatementReportLine[];
  } | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    // Load customers for dropdown
    const loadCustomers = async () => {
      try {
        const res = await invoiceCenterApi.getCustomers({ limit: 1000 });
        setCustomers(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load customers", err);
      }
    };
    loadCustomers();
  }, []);

  const fetchData = async () => {
    if (!filters.customer_id) {
      toast.error("Customer is required");
      return;
    }

    try {
      setIsLoading(true);
      setHasPermission(true);

      const payload = {
        ...filters,
        customer_id: parseInt(filters.customer_id, 10),
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
        toast.error(
          err.response?.data?.message || "Failed to load report data"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleResetFilters = () => {
    setFilters({
      customer_id: "",
      date_from: "",
      date_to: "",
      include_unposted: false,
    });
    setData(null);
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(val || 0);
  };

  const columns: ColumnDef<CustomerStatementReportLine>[] = [
    { header: "Date", accessorKey: "transaction_date" },
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
          data={data}
          filename={`customer-statement-${filters.customer_id}-${
            new Date().toISOString().split("T")[0]
          }`}
          disabled={isLoading || !data}
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
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, customer_id: val }))
              }
            >
              <SelectTrigger id="customer_id">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.customer_code} - {c.company_name}
                  </SelectItem>
                ))}
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
             placeholder="Enter Date To" />
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
                    {data.header.date_from ? data.header.date_from : "Start"} to{" "}
                    {data.header.date_to ? data.header.date_to : "Present"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null
      }
      table={
        <ReportDataTable
          columns={columns}
          data={data?.lines || []}
          isLoading={isLoading}
          emptyMessage={
            !filters.customer_id
              ? "Select a customer and apply filters to view the statement."
              : "No transactions found for the selected period."
          }
        />
      }
    />
  );
};
