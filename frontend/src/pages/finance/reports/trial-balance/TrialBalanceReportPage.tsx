import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../auth/AuthContext";
import { financeApi } from "../../../../api/financeApi";
import { toast } from "react-hot-toast";
import DataTable from "../../../../components/common/DataTable";
import ReportPageHeader from "../../../../components/finance/reports/ReportPageHeader";
import ReportFilterCard from "../../../../components/finance/reports/ReportFilterCard";
import ReportAmountCell from "../../../../components/finance/reports/ReportAmountCell";
import ReportToolbar from "../../../../components/finance/reports/ReportToolbar";
import BalanceStatusBadge from "../../../../components/finance/reports/BalanceStatusBadge";
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

const TrialBalanceReportPage = () => {
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

      const response = await financeApi.getTrialBalanceReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch trial balance report"
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
    a.download = `trial-balance-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission("finance.report.trial_balance.view")) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          Access Denied
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          You do not have permission to view the Trial Balance report.
        </p>
      </div>
    );
  }

  const columns = [
    {
      header: "Account Code",
      accessor: "account_code",
      cell: (row: unknown) => (
        <div className="font-medium text-navy-800 dark:text-white">
          {row.account_code}
        </div>
      ),
    },
    {
      header: "Account Name",
      accessor: "account_name",
    },
    {
      header: <div className="text-right">Opening Dr</div>,
      accessor: "opening_debit",
      cell: (row: unknown) => <ReportAmountCell amount={row.opening_debit} />,
    },
    {
      header: <div className="text-right">Opening Cr</div>,
      accessor: "opening_credit",
      cell: (row: unknown) => <ReportAmountCell amount={row.opening_credit} />,
    },
    {
      header: <div className="text-right">Period Dr</div>,
      accessor: "period_debit",
      cell: (row: unknown) => <ReportAmountCell amount={row.period_debit} />,
    },
    {
      header: <div className="text-right">Period Cr</div>,
      accessor: "period_credit",
      cell: (row: unknown) => <ReportAmountCell amount={row.period_credit} />,
    },
    {
      header: <div className="text-right">Closing Dr</div>,
      accessor: "closing_debit",
      cell: (row: unknown) => <ReportAmountCell amount={row.closing_debit} />,
    },
    {
      header: <div className="text-right">Closing Cr</div>,
      accessor: "closing_credit",
      cell: (row: unknown) => <ReportAmountCell amount={row.closing_credit} />,
    },
  ];

  return (
    <div className="p-6">
      <ReportPageHeader
        title="Trial Balance"
        description="Summary of closing balances for all accounts to verify double-entry accounting."
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
          <div className="mb-4 flex items-end justify-between">
            <ReportToolbar
              onRefresh={fetchReport}
              onExportJson={handleExportJson}
              isRefreshing={loading}
            />
            <div className="mb-4">
              <BalanceStatusBadge isBalanced={data.is_balanced} />
            </div>
          </div>

          <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-navy-700 dark:bg-navy-800">
            <DataTable
              columns={columns}
              data={data.lines || []}
              loading={loading}
              emptyMessage="No accounts found with activity for the selected period."
            />

            {/* Summary Row */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-900">
              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-2 font-bold text-navy-800 dark:text-white md:col-span-4">
                  Totals
                </div>

                {/* Due to responsive layout, creating a specialized summary display is better here */}
              </div>
              <div className="flex flex-col justify-between gap-4 overflow-x-auto pt-4 text-sm md:flex-row">
                <div className="flex min-w-max flex-col">
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Opening Dr
                  </span>
                  <span className="font-bold">
                    <ReportAmountCell amount={data.total_opening_debit} />
                  </span>
                </div>
                <div className="flex min-w-max flex-col">
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Opening Cr
                  </span>
                  <span className="font-bold">
                    <ReportAmountCell amount={data.total_opening_credit} />
                  </span>
                </div>
                <div className="flex min-w-max flex-col">
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Period Dr
                  </span>
                  <span className="font-bold">
                    <ReportAmountCell amount={data.total_period_debit} />
                  </span>
                </div>
                <div className="flex min-w-max flex-col">
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Period Cr
                  </span>
                  <span className="font-bold">
                    <ReportAmountCell amount={data.total_period_credit} />
                  </span>
                </div>
                <div className="flex min-w-max flex-col">
                  <span className="font-medium text-brand-600 text-gray-500 dark:text-brand-400 dark:text-gray-400">
                    Closing Dr
                  </span>
                  <span className="font-bold text-brand-700 dark:text-brand-300">
                    <ReportAmountCell amount={data.total_closing_debit} />
                  </span>
                </div>
                <div className="flex min-w-max flex-col">
                  <span className="font-medium text-brand-600 text-gray-500 dark:text-brand-400 dark:text-gray-400">
                    Closing Cr
                  </span>
                  <span className="font-bold text-brand-700 dark:text-brand-300">
                    <ReportAmountCell amount={data.total_closing_credit} />
                  </span>
                </div>
                {!data.is_balanced && (
                  <div className="flex min-w-max flex-col border-l border-red-200 pl-4">
                    <span className="font-medium text-red-500">Difference</span>
                    <span className="font-bold text-red-600">
                      <ReportAmountCell amount={data.difference} />
                    </span>
                  </div>
                )}
              </div>
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
            Click Apply Filters to view the trial balance.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrialBalanceReportPage;
