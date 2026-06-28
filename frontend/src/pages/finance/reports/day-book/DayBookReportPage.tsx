import React, { useState, useCallback } from "react";
import { useAuth } from "../../../../auth/AuthContext";
import { financeApi } from "../../../../api/financeApi";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import ReportPageHeader from "../../../../components/finance/reports/ReportPageHeader";
import ReportFilterCard from "../../../../components/finance/reports/ReportFilterCard";
import ReportAmountCell from "../../../../components/finance/reports/ReportAmountCell";
import ReportToolbar from "../../../../components/finance/reports/ReportToolbar";
import SourceTypeBadge from "../../../../components/finance/reports/SourceTypeBadge";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { AlertCircle } from "lucide-react";

const SOURCE_TYPES = [
  "opening_balance",
  "journal_entry",
  "journal_reversal",
  "payment_voucher",
  "receipt_voucher",
  "petty_cash_voucher",
  "petty_cash_replenishment",
  "fixed_asset_depreciation",
  "fixed_asset_disposal",
  "manual_adjustment",
];

const DayBookReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    date_from: format(new Date(), "yyyy-MM-dd"),
    date_to: format(new Date(), "yyyy-MM-dd"),
    source_type: "",
    branch_id: activeBranch?.id || "",
  });

  const fetchReport = useCallback(async () => {
    if (!filters.date_from || !filters.date_to) {
      toast.error("Date range is required");
      return;
    }

    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key: unknown) => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getDayBookReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch day book report"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: unknown) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    setFilters({
      date_from: format(new Date(), "yyyy-MM-dd"),
      date_to: format(new Date(), "yyyy-MM-dd"),
      source_type: "",
      branch_id: activeBranch?.id || "",
    });
    setData(null);
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `day-book-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission("finance.report.day_book.view")) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          Access Denied
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          You do not have permission to view the Day Book report.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <ReportPageHeader
        title="Day Book"
        description="Chronological daily summary of all accounting transactions."
      />

      <ReportFilterCard
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>
            Date From <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={filters.date_from}
            onChange={(e: any) =>
              handleFilterChange("date_from", e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>
            Date To <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={filters.date_to}
            onChange={(e: any) => handleFilterChange("date_to", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Source Type</Label>
          <Select
            value={filters.source_type}
            onValueChange={(val: unknown) =>
              handleFilterChange("source_type", val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {SOURCE_TYPES.map((type: unknown) => (
                <SelectItem key={type} value={type}>
                  {type
                    .split("_")
                    .map((w: unknown) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ReportFilterCard>

      {data && (
        <div className="duration-500 animate-in fade-in slide-in-from-bottom-4">
          <ReportToolbar
            onRefresh={fetchReport}
            onExportJson={handleExportJson}
            isRefreshing={loading}
          />

          <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-navy-700 dark:bg-navy-800">
            {data.days && data.days.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-navy-700">
                {data.days.map((day: unknown, idx: unknown) => (
                  <div key={idx} className="p-0">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-navy-700 dark:bg-navy-900">
                      <h3 className="font-bold text-navy-800 dark:text-white">
                        {format(new Date(day.date), "EEEE, MMMM d, yyyy")}
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-white text-xs text-gray-500 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-400">
                          <tr>
                            <th className="px-6 py-3 font-medium">
                              Source Type
                            </th>
                            <th className="px-6 py-3 font-medium">Source No</th>
                            <th className="px-6 py-3 font-medium">
                              Account Code
                            </th>
                            <th className="px-6 py-3 font-medium">
                              Account Name
                            </th>
                            <th className="px-6 py-3 font-medium">
                              Description
                            </th>
                            <th className="px-6 py-3 text-right font-medium">
                              Debit
                            </th>
                            <th className="px-6 py-3 text-right font-medium">
                              Credit
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-navy-700/50">
                          {day.lines.map((line: unknown, lidx: unknown) => (
                            <tr
                              key={lidx}
                              className="hover:bg-gray-50 dark:hover:bg-navy-900/50"
                            >
                              <td className="whitespace-nowrap px-6 py-3">
                                <SourceTypeBadge type={line.source_type} />
                              </td>
                              <td className="whitespace-nowrap px-6 py-3 font-medium">
                                {line.source_number}
                              </td>
                              <td className="whitespace-nowrap px-6 py-3">
                                {line.account_code}
                              </td>
                              <td className="whitespace-nowrap px-6 py-3">
                                {line.account_name}
                              </td>
                              <td
                                className="max-w-[200px] truncate px-6 py-3"
                                title={line.description}
                              >
                                {line.description || "-"}
                              </td>
                              <td className="whitespace-nowrap px-6 py-3 text-right">
                                <ReportAmountCell amount={line.debit_amount} />
                              </td>
                              <td className="whitespace-nowrap px-6 py-3 text-right">
                                <ReportAmountCell amount={line.credit_amount} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-semibold dark:border-navy-700 dark:bg-navy-900">
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-3 text-right text-navy-800 dark:text-white"
                            >
                              Daily Total:
                            </td>
                            <td className="whitespace-nowrap px-6 py-3 text-right text-navy-800 dark:text-white">
                              <ReportAmountCell amount={day.total_debit} />
                            </td>
                            <td className="whitespace-nowrap px-6 py-3 text-right text-navy-800 dark:text-white">
                              <ReportAmountCell amount={day.total_credit} />
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No transactions found for the selected dates.
              </div>
            )}

            {data.days && data.days.length > 0 && (
              <div className="flex items-center justify-end gap-8 border-t border-gray-200 bg-brand-50 p-6 dark:border-navy-700 dark:bg-navy-900">
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Grand Total Debit
                  </div>
                  <div className="text-xl font-bold text-navy-800 dark:text-white">
                    <ReportAmountCell amount={data.grand_total_debit} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Grand Total Credit
                  </div>
                  <div className="text-xl font-bold text-navy-800 dark:text-white">
                    <ReportAmountCell amount={data.grand_total_credit} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow dark:border-navy-700 dark:bg-navy-800">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Run Report
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click Apply Filters to view the day book.
          </p>
        </div>
      )}
    </div>
  );
};

export default DayBookReportPage;
