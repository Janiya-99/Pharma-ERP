import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../auth/AuthContext";
import { financeApi } from "../../../../api/financeApi";
import { toast } from "react-hot-toast";
import ReportPageHeader from "../../../../components/finance/reports/ReportPageHeader";
import ReportFilterCard from "../../../../components/finance/reports/ReportFilterCard";
import ReportAmountCell from "../../../../components/finance/reports/ReportAmountCell";
import ReportToolbar from "../../../../components/finance/reports/ReportToolbar";
import ReportSection from "../../../../components/finance/reports/ReportSection";
import ProfitLossBadge from "../../../../components/finance/reports/ProfitLossBadge";
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

const ProfitLossReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState([]);

  const [filters, setFilters] = useState({
    financial_year_id: "",
    date_from: "",
    date_to: "",
    branch_id: activeBranch?.id || "",
  });

  const fetchFiltersData = async () => {
    try {
      const fyRes = await financeApi.getFinancialYears({ limit: 100 });
      if (fyRes.data?.success) setFinancialYears(fyRes.data.data);
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key: unknown) => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getProfitLossReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch profit and loss report"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: unknown) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    setFilters({
      financial_year_id: "",
      date_from: "",
      date_to: "",
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
    a.download = `profit-and-loss-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission("finance.report.profit_loss.view")) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          Access Denied
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          You do not have permission to view the Profit and Loss report.
        </p>
      </div>
    );
  }

  const renderSectionLines = (lines: unknown) => {
    if (!lines || lines.length === 0) {
      return (
        <div className="px-4 py-3 text-center text-sm italic text-gray-500 dark:text-gray-400">
          No accounts found in this section.
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-100 dark:divide-navy-700">
        {lines.map((line: unknown) => (
          <div
            key={line.account_id}
            className="flex items-center justify-between px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-navy-900/50"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-navy-800 dark:text-white">
                {line.account_code}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {line.account_name}
              </span>
            </div>
            <div className="text-sm">
              <ReportAmountCell amount={line.balance} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <ReportPageHeader
        title="Profit and Loss"
        description="Financial performance summary showing revenues, costs, and expenses over a period."
      />

      <ReportFilterCard
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>Financial Year</Label>
          <Select
            value={filters.financial_year_id}
            onValueChange={(val: unknown) =>
              handleFilterChange("financial_year_id", val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {financialYears.map((fy: unknown) => (
                <SelectItem key={fy.id} value={fy.id.toString()}>
                  {fy.year_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Input
            type="date"
            value={filters.date_from}
            onChange={(e: any) =>
              handleFilterChange("date_from", e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input
            type="date"
            value={filters.date_to}
            onChange={(e: any) => handleFilterChange("date_to", e.target.value)}
          />
        </div>
      </ReportFilterCard>

      {data && (
        <div className="duration-500 animate-in fade-in slide-in-from-bottom-4">
          <div className="mb-6 flex items-end justify-between">
            <ReportToolbar
              onRefresh={fetchReport}
              onExportJson={handleExportJson}
              isRefreshing={loading}
            />
            <div className="mb-4">
              <ProfitLossBadge amount={data.net_profit} />
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h2 className="mb-6 text-center text-2xl font-bold text-navy-800 dark:text-white">
              Income Statement
            </h2>

            {/* Income Sections */}
            <ReportSection
              title="Revenue"
              totalLabel="Total Revenue"
              totalAmount={data.revenue?.total}
            >
              {renderSectionLines(data.revenue?.lines)}
            </ReportSection>

            <ReportSection
              title="Other Income"
              totalLabel="Total Other Income"
              totalAmount={data.other_income?.total}
            >
              {renderSectionLines(data.other_income?.lines)}
            </ReportSection>

            <div className="mb-8 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
              <span className="font-bold text-green-800 dark:text-green-400">
                Total Income
              </span>
              <span className="font-bold text-green-800 dark:text-green-400">
                <ReportAmountCell amount={data.total_income} />
              </span>
            </div>

            {/* Expense Sections */}
            <ReportSection
              title="Direct Expenses"
              totalLabel="Total Direct Expenses"
              totalAmount={data.direct_expenses?.total}
            >
              {renderSectionLines(data.direct_expenses?.lines)}
            </ReportSection>

            {/* Gross Profit could be calculated here, but following exactly the requested layout */}

            <ReportSection
              title="Administrative Expenses"
              totalLabel="Total Administrative Expenses"
              totalAmount={data.administrative_expenses?.total}
            >
              {renderSectionLines(data.administrative_expenses?.lines)}
            </ReportSection>

            <ReportSection
              title="Selling Expenses"
              totalLabel="Total Selling Expenses"
              totalAmount={data.selling_expenses?.total}
            >
              {renderSectionLines(data.selling_expenses?.lines)}
            </ReportSection>

            <ReportSection
              title="Finance Expenses"
              totalLabel="Total Finance Expenses"
              totalAmount={data.finance_expenses?.total}
            >
              {renderSectionLines(data.finance_expenses?.lines)}
            </ReportSection>

            <div className="mb-8 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10">
              <span className="font-bold text-red-800 dark:text-red-400">
                Total Expenses
              </span>
              <span className="font-bold text-red-800 dark:text-red-400">
                <ReportAmountCell amount={data.total_expense} />
              </span>
            </div>

            {/* Net Profit */}
            <div
              className={`flex items-center justify-between rounded-lg border-2 px-6 py-4 ${
                data.net_profit > 0
                  ? "border-green-300 bg-green-100 dark:border-green-800 dark:bg-green-900/20"
                  : data.net_profit < 0
                  ? "border-red-300 bg-red-100 dark:border-red-800 dark:bg-red-900/20"
                  : "border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
              }`}
            >
              <span
                className={`text-xl font-bold ${
                  data.net_profit > 0
                    ? "text-green-800 dark:text-green-400"
                    : data.net_profit < 0
                    ? "text-red-800 dark:text-red-400"
                    : "text-gray-800 dark:text-gray-300"
                }`}
              >
                Net{" "}
                {data.net_profit > 0
                  ? "Profit"
                  : data.net_profit < 0
                  ? "Loss"
                  : "Profit/Loss"}
              </span>
              <span
                className={`text-2xl font-bold ${
                  data.net_profit > 0
                    ? "text-green-800 dark:text-green-400"
                    : data.net_profit < 0
                    ? "text-red-800 dark:text-red-400"
                    : "text-gray-800 dark:text-gray-300"
                }`}
              >
                <ReportAmountCell amount={data.net_profit} />
              </span>
            </div>
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
            Click Apply Filters to view the profit and loss statement.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfitLossReportPage;
