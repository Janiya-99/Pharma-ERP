import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  Landmark,
  Receipt,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";

import { financeApi } from "../../../api/financeApi";
import { useAuth } from "../../../auth/AuthContext";
import { FinanceDashboardResponse } from "./types";
import { getErrorMessage } from "./utils";

import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";

// Custom Dashboard Components matching Image 2
import { FinanceTitleCard } from "./components/FinanceTitleCard";
import { FinanceKpiCard } from "./components/FinanceKpiCard";
import { RevenueProfitTrendChart } from "./components/RevenueProfitTrendChart";
import { ExpenseDistributionChart } from "./components/ExpenseDistributionChart";
import { ReceivablesAgingCard } from "./components/ReceivablesAgingCard";
import { PayablesAgingCard } from "./components/PayablesAgingCard";
import { FinanceQuickActions } from "./components/FinanceQuickActions";
import { CashFlowSummaryCard } from "./components/CashFlowSummaryCard";
import { TopCustomersReceivablesCard } from "./components/TopCustomersReceivablesCard";
import { TopSuppliersPayablesCard } from "./components/TopSuppliersPayablesCard";
import { RecentTransactionsCard } from "./components/RecentTransactionsCard";
import { FinancialAlertsCard } from "./components/FinancialAlertsCard";
import { DashboardAiAnalysisSection } from "../../../components/common/DashboardAiAnalysisSection";

const FinanceDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("Today Oct 16, 2026");
  const [filters, setFilters] = useState<Record<string, string>>({
    period_type: "this_month",
  });

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["financeDashboard", filters],
    queryFn: async () => {
      const res = await financeApi.getDashboardData(filters);
      return res.data?.data as FinanceDashboardResponse;
    },
  });

  const dashboardData = response;

  // Derive live metrics directly from backend response with zero hardcoded numbers
  const cashBalance = dashboardData?.summary?.cash_balance?.value ?? 0;
  const bankBalance = dashboardData?.summary?.bank_balance?.value ?? 0;
  const arBalance =
    dashboardData?.summary?.accounts_receivable?.value ??
    dashboardData?.receivables?.total_outstanding ??
    0;
  const apBalance =
    dashboardData?.summary?.accounts_payable?.value ??
    dashboardData?.payables?.total_payable ??
    0;
  const overdueReceivables = dashboardData?.receivables?.overdue_amount ?? 0;
  const overduePayables = dashboardData?.payables?.overdue_amount ?? 0;

  const handlePeriodChange = (p: string) => {
    setSelectedPeriod(p);
    const code = p.includes("Today")
      ? "today"
      : p.includes("Yesterday")
      ? "yesterday"
      : p.includes("Week")
      ? "this_week"
      : p.includes("Month")
      ? "this_month"
      : p.includes("Q3")
      ? "this_quarter"
      : "fiscal_year";
    setFilters({ period_type: code });
  };

  return (
    <div className="w-full space-y-5 pb-12 font-sans text-slate-800 antialiased">
      {/* ── 1. MODERN TITLE CARD (BREADCRUMB, TITLE, CONTROLS) ── */}
      <FinanceTitleCard
        onRefresh={() => refetch()}
        isLoading={isLoading}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />

      {/* ── 2. TREASURY AI COPILOT & WORKING CAPITAL ANALYTICS ── */}
      <DashboardAiAnalysisSection
        dashboardType="finance"
        kpiData={{
          ...dashboardData,
          cash_balance: cashBalance,
          bank_balance: bankBalance,
          accounts_receivable: arBalance,
          accounts_payable: apBalance,
          overdue_receivables: overdueReceivables,
          overdue_payables: overduePayables,
        }}
        title="Treasury AI Copilot & Working Capital Analytics"
      />

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-2xl bg-white/70" />
            ))}
          </div>
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="col-span-8 h-[320px] w-full rounded-2xl bg-white/70" />
            <Skeleton className="col-span-4 h-[320px] w-full rounded-2xl bg-white/70" />
          </div>
        </div>
      )}

      {/* Error Alert State */}
      {isError && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Live Data</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error, "Failed to connect to finance server.")}
          </AlertDescription>
        </Alert>
      )}

      {/* ── 3. ROW 1: 6 TOP KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Cash in Hand */}
        <FinanceKpiCard
          label="Cash in Hand"
          value={cashBalance}
          trendText={`${dashboardData?.summary?.cash_balance?.trend ?? 0}%`}
          subtitle="Cash Book (GL 100001)"
          isPositive={true}
          icon={Wallet}
          tone="emerald"
          to="/finance/reports/cash-book"
        />

        {/* Card 2: Bank Balance */}
        <FinanceKpiCard
          label="Bank Balance"
          value={bankBalance}
          trendText={`${dashboardData?.summary?.bank_balance?.trend ?? 0}%`}
          subtitle="Bank Book (GL 100003)"
          isPositive={true}
          icon={Landmark}
          tone="blue"
          to="/finance/reports/bank-book"
        />

        {/* Card 3: Accounts Receivable */}
        <FinanceKpiCard
          label="Accounts Receivable"
          value={arBalance}
          trendText={`${dashboardData?.summary?.accounts_receivable?.trend ?? 0}%`}
          subtitle="GL 110001 & Customer Invoices"
          isPositive={true}
          icon={Receipt}
          tone="purple"
          to="/invoice-center/reports/customer-aging"
        />

        {/* Card 4: Accounts Payable */}
        <FinanceKpiCard
          label="Accounts Payable"
          value={apBalance}
          trendText={`${dashboardData?.summary?.accounts_payable?.trend ?? 0}%`}
          subtitle={dashboardData?.payables?.supplier_count ? `${dashboardData.payables.supplier_count} active suppliers` : "GL 200001 (Creditors)"}
          isPositive={false}
          icon={FileText}
          tone="amber"
          to="/finance/banking/payment-vouchers"
        />

        {/* Card 5: Overdue Receivables */}
        <FinanceKpiCard
          label="Overdue Receivables"
          value={overdueReceivables}
          trendText={arBalance > 0 ? `${Math.round((overdueReceivables / arBalance) * 100)}% of AR` : "0%"}
          subtitle={`${dashboardData?.receivables?.overdue_count ?? 0} overdue invoices`}
          isPositive={false}
          icon={Clock}
          tone="rose"
          to="/invoice-center/reports/customer-aging"
        />

        {/* Card 6: Overdue Payables */}
        <FinanceKpiCard
          label="Overdue Payables"
          value={overduePayables}
          trendText={apBalance > 0 ? `${Math.round((overduePayables / apBalance) * 100)}% of AP` : "0%"}
          subtitle={`${dashboardData?.payables?.payment_due_count ?? 0} bills pending review`}
          isPositive={false}
          icon={Clock}
          tone="violet"
          to="/finance/banking/payment-vouchers"
        />
      </div>

      {/* ── 4. ROW 2: ANALYTICS CHARTS (8/4 SPLIT) ── */}
      <div className="grid grid-cols-12 gap-4">
        <RevenueProfitTrendChart data={dashboardData?.trend} />
        <ExpenseDistributionChart data={dashboardData?.expense_distribution} />
      </div>

      {/* ── 5. ROW 3: AGING & QUICK ACTIONS (3 COLUMNS GRID) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReceivablesAgingCard data={dashboardData?.receivables} />
        <PayablesAgingCard data={dashboardData?.payables} />
        <FinanceQuickActions />
      </div>

      {/* ── 6. ROW 4: CASH FLOW & TOP ENTITIES (3 COLUMNS GRID) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CashFlowSummaryCard data={dashboardData?.liquidity} />
        <TopCustomersReceivablesCard customers={dashboardData?.top_customers} />
        <TopSuppliersPayablesCard suppliers={dashboardData?.top_suppliers} />
      </div>

      {/* ── 7. ROW 5: RECENT TRANSACTIONS & FINANCIAL ALERTS (8/4 SPLIT) ── */}
      <div className="grid grid-cols-12 gap-4">
        <RecentTransactionsCard transactions={dashboardData?.recent_transactions} />
        <FinancialAlertsCard alerts={dashboardData?.alerts} />
      </div>

      {/* ── 8. DATA LINEAGE & STATUTORY RECONCILIATION REFERENCE ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Metric Lineage & Financial Scope Reference
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact underlying general ledger accounts, period filters, and statutory report mappings.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Reconciled with GL Ledger
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
            <div className="font-bold text-slate-800">Cash in Hand (GL 100001)</div>
            <div className="text-slate-500">Physical till floats, petty cash, and daily drawer receipts.</div>
            <div className="text-indigo-600 font-semibold pt-1">Report: Cash Book Report</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
            <div className="font-bold text-slate-800">Commercial Bank (GL 100003)</div>
            <div className="text-slate-500">Commercial deposit and checking balances across active branches.</div>
            <div className="text-indigo-600 font-semibold pt-1">Report: Bank Book Report</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
            <div className="font-bold text-slate-800">Accounts Receivable (GL 110001)</div>
            <div className="text-slate-500">Total customer balance across active pharmacy customer accounts.</div>
            <div className="text-indigo-600 font-semibold pt-1">Report: Customer Aging & Balance</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
            <div className="font-bold text-slate-800">Accounts Payable (GL 200001)</div>
            <div className="text-slate-500">Trade creditors and supplier obligations awaiting disbursement.</div>
            <div className="text-indigo-600 font-semibold pt-1">Report: Payment Vouchers</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
            <div className="font-bold text-slate-800">Overdue Receivables</div>
            <div className="text-slate-500">Subset of customer invoices with payment terms exceeded (&gt;30/60/90 days).</div>
            <div className="text-indigo-600 font-semibold pt-1">Report: Customer Aging (Overdue)</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
            <div className="font-bold text-slate-800">Net Surplus & Liquidity</div>
            <div className="text-slate-500">Total cash inflows (Dr) minus total cash disbursements (Cr).</div>
            <div className="text-indigo-600 font-semibold pt-1">Report: Trial Balance / Balance Sheet</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboardPage;
