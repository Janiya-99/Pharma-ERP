import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Wallet, Landmark, Receipt, FileText, TrendingUp, TrendingDown, BarChart3, BadgeDollarSign, ClipboardCheck, CircleDollarSign, ChevronDown, Plus } from "lucide-react";

import { financeApi } from "../../../api/financeApi";
import { useAuth } from "../../../auth/AuthContext";
import { FinanceDashboardResponse } from "./types";
import { getErrorMessage } from "./utils";
import toast from "react-hot-toast";

import { Button } from "../../../components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "../../../components/ui/dropdown-menu";
import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { AlertCircle } from "lucide-react";

// Components
import { FinanceDashboardFilters } from "./components/FinanceDashboardFilters";
import { FinanceKpiCard } from "./components/FinanceKpiCard";
import { DashboardHeroCard } from "../../../components/common/DashboardHeroCard";
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
    <div className="w-full space-y-6 pb-12 font-sans text-slate-800 antialiased">
      {/* ── TOP PAGE HEADER ── */}
      <DashboardHeroCard
        title="Financial Operations & Treasury"
        subtitle={`Audited fiscal analytics, liquidity positions, and statutory ledger governance for ${user?.company_name || "Ceylon Med Global"}.`}
        moduleTag="Fiscal Intelligence & Ledger"
        icon={Landmark}
        quote={{
          text: "Audited financial transparency, real-time fiscal control, and statutory governance.",
          author: "SLFRS / LKAS Compliant Accounting"
        }}
        accent="emerald"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-2xs text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer h-9"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-xs text-xs font-semibold px-3.5 py-2 transition-all h-9">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New Action
                  <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-xl border-slate-200/80 bg-white/95 backdrop-blur-md">
                <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center p-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                  <FileText className="mr-2.5 h-4 w-4 text-emerald-500" />
                  <span className="font-semibold">New Journal Entry</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center p-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                  <Receipt className="mr-2.5 h-4 w-4 text-blue-500" />
                  <span className="font-semibold">Create Invoice</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center p-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                  <Wallet className="mr-2.5 h-4 w-4 text-amber-500" />
                  <span className="font-semibold">Record Payment</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center p-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                  <Landmark className="mr-2.5 h-4 w-4 text-indigo-500" />
                  <span className="font-semibold">Bank Transfer</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              <FinanceKpiCard
                label="Cash Balance"
                metric={dashboardData.summary.cash_balance}
                icon={Wallet}
                tone="emerald"
                to="/finance/banking/cash-accounts"
              />
              <FinanceKpiCard
                label="Bank Balance"
                metric={dashboardData.summary.bank_balance}
                icon={Landmark}
                tone="indigo"
                to="/finance/banking/bank-accounts"
              />
              <FinanceKpiCard
                label="Accounts Receivable"
                metric={dashboardData.summary.accounts_receivable}
                icon={Receipt}
                tone="blue"
                to="/invoice-center/reports/customer-aging"
              />
              <FinanceKpiCard
                label="Accounts Payable"
                metric={dashboardData.summary.accounts_payable}
                icon={FileText}
                tone="amber"
                to="/finance/banking/payment-vouchers"
              />
              <FinanceKpiCard
                label="Monthly Revenue"
                metric={dashboardData.summary.monthly_revenue}
                icon={TrendingUp}
                tone="emerald"
                to="/finance/reports/profit-and-loss"
              />
              <FinanceKpiCard
                label="Monthly Expenses"
                metric={dashboardData.summary.monthly_expenses}
                icon={TrendingDown}
                tone="rose"
                to="/finance/reports/profit-and-loss"
              />
            </div>

            {/* Summary Cards Row 2 (4 columns) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FinanceSummaryCard
                label="Gross Profit"
                metric={dashboardData.summary.gross_profit}
                icon={BarChart3}
                tone="emerald"
                to="/finance/reports/profit-and-loss"
              />
              <FinanceSummaryCard
                label="Net Profit"
                metric={dashboardData.summary.net_profit}
                icon={BadgeDollarSign}
                tone="indigo"
                to="/finance/reports/profit-and-loss"
              />
              <FinanceSummaryCard
                label="Pending Payments"
                metric={dashboardData.summary.pending_payments}
                icon={ClipboardCheck}
                tone="amber"
                to="/finance/banking/payment-vouchers"
              />
              <FinanceSummaryCard
                label="Pending Receipts"
                metric={dashboardData.summary.pending_receipts}
                icon={CircleDollarSign}
                tone="blue"
                to="/finance/banking/receipt-vouchers"
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
                {/* Cash Flow Liquidity & Period Status */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CashFlowLiquidityCard data={dashboardData.liquidity} />
                  <AccountingPeriodStatusCard data={dashboardData.period_status} />
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
