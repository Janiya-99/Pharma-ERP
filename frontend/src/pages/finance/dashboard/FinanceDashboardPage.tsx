import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Wallet, Landmark, Receipt, FileText, TrendingUp, TrendingDown, BarChart3, BadgeDollarSign, ClipboardCheck, CircleDollarSign } from "lucide-react";

import { financeApi } from "../../../api/financeApi";
import { useAuth } from "../../../auth/AuthContext";
import { FinanceDashboardResponse } from "./types";
import { getErrorMessage } from "./utils";
import toast from "react-hot-toast";

import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { AlertCircle } from "lucide-react";

// Components
import { FinanceDashboardFilters } from "./components/FinanceDashboardFilters";
import { FinanceKpiCard } from "./components/FinanceKpiCard";
import { FinanceSummaryCard } from "./components/FinanceSummaryCard";
import { RevenueProfitTrendChart } from "./components/RevenueProfitTrendChart";
import { ExpenseDistributionChart } from "./components/ExpenseDistributionChart";
import { ReceivablesAgingCard } from "./components/ReceivablesAgingCard";
import { PayablesAgingCard } from "./components/PayablesAgingCard";
import { AccountingActivityTabs } from "./components/AccountingActivityTabs";
import { FinanceQuickActions } from "./components/FinanceQuickActions";
import { CashFlowLiquidityCard } from "./components/CashFlowLiquidityCard";
import { AccountingPeriodStatusCard } from "./components/AccountingPeriodStatusCard";
import { FinanceReportShortcuts } from "./components/FinanceReportShortcuts";

const FinanceDashboardPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({
    period_type: "this_month",
  });

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["financeDashboard", filters],
    queryFn: async () => {
      const res = await financeApi.getDashboardData(filters);
      return res.data?.data as FinanceDashboardResponse;
    },
  });

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const dashboardData = response;

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 ">
            Finance Dashboard
          </h1>
          <p className="text-sm text-gray-500 ">
            {user?.company_name || "Company"} • Overview & Analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FinanceDashboardFilters onFilterChange={handleFilterChange} />
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700  ">
            New Journal Entry
          </Button>
        </div>
      </div>

      <div className="w-full">
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[132px] w-full rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[120px] w-full rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <Skeleton className="col-span-8 h-[350px] w-full rounded-2xl" />
              <Skeleton className="col-span-4 h-[350px] w-full rounded-2xl" />
            </div>
          </div>
        )}

        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription>
              {getErrorMessage(error, "Failed to connect to the backend. Ensure the server is running.")}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && dashboardData && (
          <div className="w-full space-y-6">
            {/* KPI Cards Row 1 (6 columns) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <FinanceKpiCard
                label="Cash Balance"
                metric={dashboardData.summary.cash_balance}
                icon={Wallet}
                iconBgClass="bg-emerald-50 "
                iconColorClass="text-emerald-600 "
              />
              <FinanceKpiCard
                label="Bank Balance"
                metric={dashboardData.summary.bank_balance}
                icon={Landmark}
                iconBgClass="bg-indigo-50 "
                iconColorClass="text-indigo-600 "
              />
              <FinanceKpiCard
                label="Accounts Receivable"
                metric={dashboardData.summary.accounts_receivable}
                icon={Receipt}
                iconBgClass="bg-blue-50 "
                iconColorClass="text-blue-600 "
              />
              <FinanceKpiCard
                label="Accounts Payable"
                metric={dashboardData.summary.accounts_payable}
                icon={FileText}
                iconBgClass="bg-amber-50 "
                iconColorClass="text-amber-600 "
              />
              <FinanceKpiCard
                label="Monthly Revenue"
                metric={dashboardData.summary.monthly_revenue}
                icon={TrendingUp}
                iconBgClass="bg-emerald-50 "
                iconColorClass="text-emerald-600 "
              />
              <FinanceKpiCard
                label="Monthly Expenses"
                metric={dashboardData.summary.monthly_expenses}
                icon={TrendingDown}
                iconBgClass="bg-rose-50 "
                iconColorClass="text-rose-600 "
              />
            </div>

            {/* Summary Cards Row 2 (4 columns) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FinanceSummaryCard
                label="Gross Profit"
                metric={dashboardData.summary.gross_profit}
                icon={BarChart3}
                iconBgClass="bg-emerald-50 "
                iconColorClass="text-emerald-600 "
              />
              <FinanceSummaryCard
                label="Net Profit"
                metric={dashboardData.summary.net_profit}
                icon={BadgeDollarSign}
                iconBgClass="bg-indigo-50 "
                iconColorClass="text-indigo-600 "
              />
              <FinanceSummaryCard
                label="Pending Payments"
                metric={dashboardData.summary.pending_payments}
                icon={ClipboardCheck}
                iconBgClass="bg-amber-50 "
                iconColorClass="text-amber-600 "
              />
              <FinanceSummaryCard
                label="Pending Receipts"
                metric={dashboardData.summary.pending_receipts}
                icon={CircleDollarSign}
                iconBgClass="bg-blue-50 "
                iconColorClass="text-blue-600 "
              />
            </div>

            {/* Main Analytics Section (8/4 split) */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <RevenueProfitTrendChart data={dashboardData.trend} />
              <ExpenseDistributionChart data={dashboardData.expense_distribution} />
            </div>

            {/* Receivables & Payables & Activity & Right Panel */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              
              <div className="space-y-4 lg:col-span-8">
                {/* Receivables & Payables */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ReceivablesAgingCard data={dashboardData.receivables} />
                  <PayablesAgingCard data={dashboardData.payables} />
                </div>
                {/* Accounting Activity Tabs */}
                <AccountingActivityTabs 
                  recentTransactions={dashboardData.recent_transactions} 
                  pendingApprovals={dashboardData.pending_approvals} 
                />
              </div>

              {/* Right Side Panel (4 columns) */}
              <div className="space-y-4 lg:col-span-4">
                <FinanceQuickActions />
                <CashFlowLiquidityCard data={dashboardData.liquidity} />
                <AccountingPeriodStatusCard data={dashboardData.period_status} />
                <FinanceReportShortcuts />
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceDashboardPage;
