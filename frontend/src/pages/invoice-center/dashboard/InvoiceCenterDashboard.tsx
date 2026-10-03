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
  PieChart as PieChartIcon,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

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
const AGING_COLORS = ["#10B981", "#F59E0B", "#F97316", "#EF4444"];

const fallbackCustomers: Customer[] = [
  { id: 1, customer_code: "CUS-10045", customer_name: "MediCare Pharmacy Network", customer_type: "PHARMACY", credit_limit: 5000000, current_balance: 4250000, status: "ACTIVE" },
  { id: 2, customer_code: "CUS-10211", customer_name: "City General Hospital", customer_type: "HOSPITAL", credit_limit: 12000000, current_balance: 13500000, status: "BLOCKED" },
  { id: 3, customer_code: "CUS-09482", customer_name: "HealthPlus Distributors", customer_type: "DISTRIBUTOR", credit_limit: 15000000, current_balance: 8900000, status: "ACTIVE" },
  { id: 4, customer_code: "CUS-11002", customer_name: "Lanka Care Clinics", customer_type: "CLINIC", credit_limit: 2000000, current_balance: 1950000, status: "ON_HOLD" },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatYAxis = (value: number) => {
  if (value >= 1000000) return `Rs.${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs.${(value / 1000).toFixed(1)}K`;
  return `Rs.${value}`;
};

export default function InvoiceCenterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>(fallbackCustomers);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await invoiceCenterApi.getDashboardSummary();
      if (res?.data?.data) {
        setSummary(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching invoice dashboard summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, tone, subtitle, trend, trendUp }: StatCardProps) => {
    const toneStyles: Record<string, { card: string; iconBg: string; text: string }> = {
      blue: { card: "border-blue-100 bg-gradient-to-br from-blue-50/80 to-white shadow-md ring-1 ring-inset ring-blue-100", iconBg: "bg-blue-100 text-blue-600 group-hover:bg-blue-200", text: "text-blue-600" },
      emerald: { card: "border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white shadow-md ring-1 ring-inset ring-emerald-100", iconBg: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200", text: "text-emerald-600" },
      amber: { card: "border-amber-100 bg-gradient-to-br from-amber-50/80 to-white shadow-md ring-1 ring-inset ring-amber-100", iconBg: "bg-amber-100 text-amber-600 group-hover:bg-amber-200", text: "text-amber-600" },
      rose: { card: "border-rose-100 bg-gradient-to-br from-rose-50/80 to-white shadow-md ring-1 ring-inset ring-rose-100", iconBg: "bg-rose-100 text-rose-600 group-hover:bg-rose-200", text: "text-rose-600" },
      indigo: { card: "border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white shadow-md ring-1 ring-inset ring-indigo-100", iconBg: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200", text: "text-indigo-600" },
      slate: { card: "border-slate-100 bg-gradient-to-br from-slate-50/80 to-white shadow-md ring-1 ring-inset ring-slate-100", iconBg: "bg-slate-100 text-slate-600 group-hover:bg-slate-200", text: "text-slate-600" },
    };
    const t = toneStyles[tone] || toneStyles.slate;

    return (
      <div className={`group relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${t.card}`}>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate mb-1 block">
            {title}
          </span>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${t.iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h3 className={`text-2xl font-semibold tracking-tight truncate ${t.text}`}>
            {value}
          </h3>
        </div>
        {(subtitle || trend) && (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px]">
            {trend && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold shrink-0 max-w-full truncate ${
                trendUp
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-rose-50 text-rose-700 border border-rose-200/60"
              }`}>
                {trendUp ? <TrendingUp className="h-3 w-3 shrink-0" /> : <TrendingDown className="h-3 w-3 shrink-0" />}
                <span className="truncate">{trend}</span>
              </span>
            )}
            {subtitle && <span className="text-slate-400 truncate flex-1 text-right" title={subtitle}>{subtitle}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 pt-6 px-4 sm:px-6 lg:px-8 font-sans">
      {/* ══════════════════════════════════════════════
          HEADER SECTION
      ══════════════════════════════════════════════ */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-brand-600" />
            Invoice & Receivables Center
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Manage billing, monitor collections, and track AR aging in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Invoice</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 1: Core Financial & Customer KPIs
      ══════════════════════════════════════════════ */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total AR Balance"
          value={formatCurrency(summary.total_customer_balance || 0)}
          icon={DollarSign}
          tone="emerald"
          subtitle="Outstanding Receivables"
          trend="-2.4% vs last month"
          trendUp={true}
        />
        <StatCard
          title="Total Customers"
          value={(summary.total_customers || 0).toLocaleString()}
          icon={Users}
          tone="blue"
          subtitle={`${summary.active_customers || 0} active accounts`}
          trend="+8 new this month"
          trendUp={true}
        />
        <StatCard
          title="Over Credit Limit"
          value={summary.customers_over_credit_limit || 0}
          icon={ShieldAlert}
          tone="rose"
          subtitle="Requires intervention"
          trend="Action required"
          trendUp={false}
        />
        <StatCard
          title="Total Credit Granted"
          value={formatCurrency(summary.total_credit_limit || 0)}
          icon={CreditCard}
          tone="indigo"
          subtitle="Across all accounts"
        />
      </div>

      {/* ══════════════════════════════════════════════
          TIER 2: Main Charts
      ══════════════════════════════════════════════ */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Invoice Generation vs Collections (2/3 width) */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-slate-900/5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Invoicing vs Collections
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Monthly billed revenue compared to actual cash receipts
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 shadow-sm">
                Avg Collection Ratio: 92%
              </span>
            </div>

            <div className="h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={invoiceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInvoice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={formatYAxis} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: number) => [formatCurrency(value), undefined]} />
                  <Area type="monotone" dataKey="Invoiced Amount" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorInvoice)" />
                  <Area type="monotone" dataKey="Collected Receipts" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 font-medium">
            <span>YTD Collected: {formatCurrency(114600000)}</span>
            <span className="font-semibold text-brand-600 cursor-pointer hover:text-brand-700 flex items-center gap-1 transition-colors">
              View Detailed Ledger <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Right: AR Aging Distribution Donut (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-slate-900/5 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                AR Aging Distribution
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Outstanding balances by overdue period
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: number) => [formatCurrency(value), "Value"]} />
                  <Pie data={agingDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {agingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={AGING_COLORS[index % AGING_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-xs">
              {agingDistribution.map((item, idx) => {
                const total = agingDistribution.reduce((acc, curr) => acc + curr.value, 0);
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: AGING_COLORS[idx % AGING_COLORS.length] }} />
                      <span className="font-medium text-slate-600 truncate max-w-[180px]">{item.bucket}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-center text-slate-500 font-medium">
            <span>Goal: Keep &gt;85% in Current bucket</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 3: Critical Account Alerts & Top Debtors
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Accounts Requiring Attention */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-slate-900/5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-500" />
                  Accounts Requiring Immediate Attention
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Customers exceeding credit limits or blocked due to severe overdue payments
                </p>
              </div>
              <button 
                onClick={() => navigate("/invoice-center/customers")}
                className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all shadow-sm shrink-0"
              >
                View Customer Directory
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 bg-slate-50/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 rounded-tl-lg">Customer</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3 text-right">Credit Limit</th>
                    <th scope="col" className="px-4 py-3 text-right">Current Balance</th>
                    <th scope="col" className="px-4 py-3 rounded-tr-lg text-right">Exposure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => {
                    const isOverLimit = c.current_balance > c.credit_limit;
                    const exposure = Math.max(0, c.current_balance - c.credit_limit);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{c.customer_name}</span>
                            <span className="text-xs text-slate-500 font-medium">{c.customer_code}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <CustomerStatusBadge status={c.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-slate-700">
                          {formatCurrency(c.credit_limit)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                          <span className={isOverLimit ? "text-rose-600" : "text-slate-900"}>
                            {formatCurrency(c.current_balance)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          {exposure > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                              +{formatCurrency(exposure)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Within Limit</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing top critical accounts</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-brand-600 transition-colors font-semibold">
              Generate Risk Report <FileText className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Right Col: Collection Shortcuts */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-slate-900/5 flex flex-col">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              Quick Actions
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Frequent invoicing and collection workflows
            </p>
          </div>

          <div className="space-y-3 flex-1">
            <button className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 hover:border-slate-300 transition-all text-left shadow-sm group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Log Payment Receipt</p>
                  <p className="text-xs text-slate-500">Record incoming customer funds</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 hover:border-slate-300 transition-all text-left shadow-sm group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Create Recurring Invoice</p>
                  <p className="text-xs text-slate-500">Setup automated billing cycles</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 hover:border-slate-300 transition-all text-left shadow-sm group">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Send Reminders</p>
                  <p className="text-xs text-slate-500">Dispatch overdue notifications</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
