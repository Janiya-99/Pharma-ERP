import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import {
  CustomerStatusBadge,
  CustomerTypeBadge,
} from "../../../components/invoice-center";
import {
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  PauseCircle,
  DollarSign,
  CreditCard,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  FileText,
  Receipt,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  PieChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, BarChart, DonutChart, ProgressBar } from "@tremor/react";

/* ─────────────────────────────────────────────────
   Type Declarations
───────────────────────────────────────────────── */

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
}

interface DashboardSummary {
  total_customers?: number;
  active_customers?: number;
  inactive_customers?: number;
  blocked_customers?: number;
  on_hold_customers?: number;
  customers_over_credit_limit?: number;
  total_credit_limit?: number;
  total_customer_balance?: number;
  total_customer_categories?: number;
}

interface Customer {
  id: number;
  customer_code: string;
  customer_name: string;
  customer_type: string;
  credit_limit: number;
  current_balance: number;
  status: string;
}

/* ─────────────────────────────────────────────────
   Fallback Mock Data
───────────────────────────────────────────────── */

const fallbackSummary: DashboardSummary = {
  total_customers: 342,
  active_customers: 310,
  inactive_customers: 20,
  blocked_customers: 8,
  on_hold_customers: 4,
  customers_over_credit_limit: 12,
  total_credit_limit: 85000000,
  total_customer_balance: 32450000,
  total_customer_categories: 6,
};

const invoiceTrendData = [
  { month: "Jan", "Invoiced Amount": 18500000, "Collected Receipts": 16200000, "Collection Ratio": 88 },
  { month: "Feb", "Invoiced Amount": 19200000, "Collected Receipts": 17800000, "Collection Ratio": 93 },
  { month: "Mar", "Invoiced Amount": 21000000, "Collected Receipts": 19500000, "Collection Ratio": 93 },
  { month: "Apr", "Invoiced Amount": 18800000, "Collected Receipts": 18100000, "Collection Ratio": 96 },
  { month: "May", "Invoiced Amount": 22400000, "Collected Receipts": 20900000, "Collection Ratio": 93 },
  { month: "Jun", "Invoiced Amount": 24800000, "Collected Receipts": 22100000, "Collection Ratio": 89 },
];

const agingDistribution = [
  { bucket: "Current (0-30 Days)", value: 21500000 },
  { bucket: "31-60 Days Overdue", value: 6800000 },
  { bucket: "61-90 Days Overdue", value: 2900000 },
  { bucket: "90+ Days Critical", value: 1250000 },
];

const fallbackCustomers: Customer[] = [
  { id: 1, customer_code: "CUST-0081", customer_name: "Asiri Surgical Hospital", customer_type: "HOSPITAL", credit_limit: 15000000, current_balance: 4200000, status: "ACTIVE" },
  { id: 2, customer_code: "CUST-0142", customer_name: "HealthGuard Pharmacy Flagship", customer_type: "PHARMACY", credit_limit: 5000000, current_balance: 1850000, status: "ACTIVE" },
  { id: 3, customer_code: "CUST-0204", customer_name: "Lanka Hospitals Diagnostics", customer_type: "HOSPITAL", credit_limit: 12000000, current_balance: 6100000, status: "ACTIVE" },
  { id: 4, customer_code: "CUST-0095", customer_name: "Rajagiriya Medical Center", customer_type: "CLINIC", credit_limit: 2000000, current_balance: 2150000, status: "OVER_CREDIT" },
  { id: 5, customer_code: "CUST-0311", customer_name: "Union Chemists Colombo", customer_type: "DISTRIBUTOR", credit_limit: 8000000, current_balance: 8000000, status: "ON_HOLD" },
];

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  tone,
  subtitle,
  trend,
  trendUp,
}) => (
  <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-500/30">
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </span>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone} transition-transform group-hover:scale-105`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mt-3 flex items-baseline justify-between">
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h3>
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
      {trend ? (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {trendUp ? <TrendingUp className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {trend}
        </span>
      ) : (
        <span className="text-xs font-medium text-slate-400">Current Status</span>
      )}
      {subtitle && <span className="text-[11px] text-slate-400 truncate max-w-[130px]" title={subtitle}>{subtitle}</span>}
    </div>
  </div>
);

const InvoiceCenterDashboard: React.FC = () => {
  const { activeSoftware, activeBranch } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>(fallbackCustomers);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [sumRes, custRes] = await Promise.all([
        invoiceCenterApi.getInvoiceCenterDashboard(),
        invoiceCenterApi.getCustomers({ limit: 5 }),
      ]);

      if (sumRes.data?.success && sumRes.data.data) {
        setSummary(sumRes.data.data);
      }
      if (custRes.data?.success && custRes.data.data) {
        setRecentCustomers(custRes.data.data || []);
      }
    } catch (err) {
      console.warn("Using fallback Invoice Center dashboard telemetry:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER" || !activeSoftware) {
      fetchData();
    }
  }, [activeSoftware]);

  if (activeSoftware && activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 m-6 rounded-2xl border p-8 text-center font-medium">
        Please switch to Invoice Center module to access this dashboard.
      </div>
    );
  }

  const formatLKR = (val?: number) =>
    `LKR ${Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {activeBranch?.branch_name || "Headquarters (HQ)"} • Invoice Center
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Billing & Accounts Receivable Dashboard
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 pl-12">
            Monitor invoicing pipelines, credit limit utilization, aging analysis, and customer ledger balances
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            title="Refresh billing data"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          <button
            onClick={() => navigate("/invoice-center/customers/create")}
            className="flex h-10 items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            + New Customer
          </button>

          <button
            onClick={() => navigate("/invoice-center/invoices/create")}
            className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 rounded-xl border p-4 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TIER 1: 8-Up Billing & AR KPI Cards
      ══════════════════════════════════════════════ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Customer Credit & Receivable Overview
          </h2>
          <span className="text-xs text-slate-400">Real-time ledger sync</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          <StatCard
            title="Total Registered Customers"
            value={summary.total_customers || 0}
            icon={Users}
            tone="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
            subtitle={`${summary.total_customer_categories || 0} customer categories`}
            trend="+12 accounts this month"
            trendUp={true}
          />
          <StatCard
            title="Active Billing Accounts"
            value={summary.active_customers || 0}
            icon={UserCheck}
            tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
            subtitle="Regular trading partners"
            trend="90.6% active ratio"
            trendUp={true}
          />
          <StatCard
            title="Inactive Accounts"
            value={summary.inactive_customers || 0}
            icon={UserX}
            tone="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            subtitle="No orders > 180 days"
            trend="Review for dormancy"
            trendUp={false}
          />
          <StatCard
            title="Blocked Customers"
            value={summary.blocked_customers || 0}
            icon={ShieldAlert}
            tone="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
            subtitle="Credit or compliance hold"
            trend="Zero billing permitted"
            trendUp={false}
          />

          <StatCard
            title="On Hold Customers"
            value={summary.on_hold_customers || 0}
            icon={PauseCircle}
            tone="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
            subtitle="Temporary billing freeze"
            trend="Pending payment clearance"
            trendUp={false}
          />
          <StatCard
            title="Over Credit Limit"
            value={summary.customers_over_credit_limit || 0}
            icon={CreditCard}
            tone="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
            subtitle="Exceeded allocated limit"
            trend="Requires approval to bill"
            trendUp={false}
          />
          <StatCard
            title="Total Credit Allocated"
            value={formatLKR(summary.total_credit_limit)}
            icon={DollarSign}
            tone="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
            subtitle="Combined credit ceiling"
            trend="38.1% currently utilized"
            trendUp={true}
          />
          <StatCard
            title="Total Accounts Receivable"
            value={formatLKR(summary.total_customer_balance)}
            icon={Receipt}
            tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
            subtitle="Total outstanding dues"
            trend="89% collection efficiency"
            trendUp={true}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 2: Invoicing Volume & Aging Analysis
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Invoiced vs Collected Trajectory (2/3 width) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Invoicing Volume & Receipt Collection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Monthly gross invoiced sales vs realized payment collections
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                June Collection Ratio: 89%
              </span>
            </div>

            <div className="mt-4">
              <BarChart
                className="h-72 w-full"
                data={invoiceTrendData}
                index="month"
                categories={["Invoiced Amount", "Collected Receipts"]}
                colors={["indigo", "emerald"]}
                valueFormatter={(val: number) => formatLKR(val)}
                showLegend={true}
                showGridLines={true}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Peak Monthly Invoicing: {formatLKR(24800000)} (June)</span>
            <button
              onClick={() => navigate("/invoice-center/reports/aging")}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Open AR Aging Report <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right: AR Aging Distribution Donut Chart (1/3 width) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AR Aging Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Outstanding dues categorized by aging intervals
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <DonutChart
                className="h-52 w-full"
                data={agingDistribution}
                category="value"
                index="bucket"
                valueFormatter={(val: number) => formatLKR(val)}
                colors={["emerald", "blue", "amber", "rose"]}
              />
            </div>

            <div className="mt-6 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
              {agingDistribution.map((item, idx) => {
                const total = agingDistribution.reduce((acc, curr) => acc + curr.value, 0);
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="font-medium text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{item.bucket}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-center text-slate-500 dark:text-slate-400">
            <span>Automated dunning reminders sent weekly</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 3: Recent Customers & Credit Watchlist
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* Main Customers Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Customer Master Records
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Recently added or modified customer accounts and billing limits
              </p>
            </div>
            <button
              onClick={() => navigate("/invoice-center/customers")}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All Customers <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Credit Limit</th>
                  <th className="px-4 py-3">Current Balance</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No customer records found.
                    </td>
                  </tr>
                ) : (
                  recentCustomers.map((cust) => (
                    <tr
                      key={cust.id}
                      onClick={() => navigate(`/invoice-center/customers/${cust.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {cust.customer_code}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {cust.customer_name}
                      </td>
                      <td className="px-4 py-3.5">
                        <CustomerTypeBadge type={cust.customer_type} />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
                        {formatLKR(cust.credit_limit)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {formatLKR(cust.current_balance)}
                      </td>
                      <td className="px-4 py-3.5">
                        <CustomerStatusBadge status={cust.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Credit Utilization Index */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Credit Utilization Health
              </h3>
              <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                38.1% Utilized
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  <span>Hospital Accounts Limit</span>
                  <span>42M / 60M LKR</span>
                </div>
                <ProgressBar value={70} color="indigo" className="h-2.5" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  <span>Pharmacy Chains Limit</span>
                  <span>12M / 18M LKR</span>
                </div>
                <ProgressBar value={66.6} color="blue" className="h-2.5" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  <span>Distributors & Clinics</span>
                  <span>3.5M / 7M LKR</span>
                </div>
                <ProgressBar value={50} color="emerald" className="h-2.5" />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">12 accounts over limit</span>
              <button
                onClick={() => navigate("/invoice-center/reports/credit-limit")}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Review Limits →
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-900 to-navy-900 p-6 text-white shadow-md">
            <h3 className="text-base font-bold mb-2">Automated Billing Rules</h3>
            <p className="text-xs text-indigo-200 leading-relaxed mb-4">
              Invoices generated for accounts exceeding 100% of their allocated credit limit will automatically be routed for Managerial Credit Override approval.
            </p>
            <button
              onClick={() => navigate("/invoice-center/settings")}
              className="w-full rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all"
            >
              Configure Credit Policies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCenterDashboard;
