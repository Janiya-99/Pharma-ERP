import React, { useState, useEffect, useCallback } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useNavigate } from "react-router-dom";
import { PageTitleCard } from "../../../components/common/PageTitleCard";
import {
  Users,
  CreditCard,
  RefreshCw,
  ArrowRight,
  FileText,
  Receipt,
  Plus,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  Download,
  Search,
  Eye,
  Percent,
  ChevronDown,
  Inbox,
  AlertCircle,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { toast } from "sonner";

/* ── Sparkline SVG Mini Components ── */
const SparklineCurve: React.FC<{ color: string; up?: boolean }> = ({ color, up = true }) => (
  <svg className="w-16 h-7 overflow-visible" viewBox="0 0 60 24" fill="none">
    <path
      d={
        up
          ? "M2 20 Q 15 16, 25 18 T 42 10 T 58 4"
          : "M2 6 Q 15 8, 25 12 T 42 15 T 58 20"
      }
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SparklineBars: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex items-end gap-1 h-7">
    {[35, 55, 40, 70, 60, 85, 95].map((val, idx) => (
      <div
        key={idx}
        className={`w-1 rounded-t-sm ${color}`}
        style={{ height: `${val}%` }}
      />
    ))}
  </div>
);

interface InvoiceTrendItem {
  month: string;
  "Invoiced Amount": number;
  "Collected Receipts": number;
  "Collection Ratio": number;
}

interface AgingDistributionItem {
  bucket: string;
  value: number;
}

interface CriticalCustomerItem {
  id: number;
  customer_code: string;
  customer_name: string;
  customer_type: string;
  credit_limit: number;
  current_balance: number;
  status: string;
}

interface DashboardSummaryData {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  blocked_customers: number;
  on_hold_customers: number;
  customers_over_credit_limit: number;
  total_credit_limit: number;
  total_customer_balance: number;
  total_customer_categories: number;
  draft_sales_orders: number;
  draft_sales_invoices: number;
  unpaid_sales_invoices: number;
  unallocated_customer_receipts: number;
  invoice_trends: InvoiceTrendItem[];
  aging_distribution: AgingDistributionItem[];
  critical_customers: CriticalCustomerItem[];
}

const AGING_COLORS: Record<string, string> = {
  "Current (0-30 Days)": "#10B981",
  "31-60 Days Overdue": "#3B82F6",
  "61-90 Days Overdue": "#F59E0B",
  "90+ Days Critical": "#EF4444",
};

export default function InvoiceCenterDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "last_month" | "quarter" | "year">("month");

  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [upcomingInvoices, setUpcomingInvoices] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, receiptsRes, invoicesRes] = await Promise.allSettled([
        invoiceCenterApi.getDashboardSummary(),
        invoiceCenterApi.getCustomerReceipts({ limit: 5 }),
        invoiceCenterApi.getSalesInvoices({ payment_status: "unpaid", limit: 5 }),
      ]);

      if (summaryRes.status === "fulfilled" && summaryRes.value?.data?.data) {
        setSummaryData(summaryRes.value.data.data);
      } else if (summaryRes.status === "fulfilled" && summaryRes.value?.data) {
        setSummaryData(summaryRes.value.data);
      }

      if (receiptsRes.status === "fulfilled" && receiptsRes.value?.data?.data) {
        setRecentReceipts(Array.isArray(receiptsRes.value.data.data) ? receiptsRes.value.data.data : []);
      } else if (receiptsRes.status === "fulfilled" && Array.isArray(receiptsRes.value?.data)) {
        setRecentReceipts(receiptsRes.value.data);
      }

      if (invoicesRes.status === "fulfilled" && invoicesRes.value?.data?.data) {
        setUpcomingInvoices(Array.isArray(invoicesRes.value.data.data) ? invoicesRes.value.data.data : []);
      } else if (invoicesRes.status === "fulfilled" && Array.isArray(invoicesRes.value?.data)) {
        setUpcomingInvoices(invoicesRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load invoice center dashboard data:", err);
      toast.error("Failed to load live dashboard data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData().then(() => {
      toast.success("Invoice & receivables metrics updated");
    });
  };

  const periodLabels = {
    month: { label: "This Month", subtext: "Current Billing Cycle" },
    last_month: { label: "Last Month", subtext: "Prior Billing Cycle" },
    quarter: { label: "This Quarter", subtext: "Quarter to Date" },
    year: { label: "This Year (YTD)", subtext: "Year to Date" },
  };

  const currentCfg = periodLabels[selectedPeriod];

  // Derive real totals
  const totalArBalance = summaryData?.total_customer_balance ?? 0;
  const totalCustomers = summaryData?.total_customers ?? 0;
  const overdueInvoices = summaryData?.unpaid_sales_invoices ?? 0;
  const totalCreditLimit = summaryData?.total_credit_limit ?? 0;
  const unappliedReceipts = summaryData?.unallocated_customer_receipts ?? 0;

  // Chart data
  const trendData = summaryData?.invoice_trends?.map((item) => ({
    month: item.month,
    Invoiced: Number(((item["Invoiced Amount"] || 0) / 1000000).toFixed(2)),
    Collected: Number(((item["Collected Receipts"] || 0) / 1000000).toFixed(2)),
  })) ?? [];

  const rawAging = summaryData?.aging_distribution ?? [];
  const totalAgingVal = rawAging.reduce((acc, b) => acc + (b.value || 0), 0);
  const agingData = rawAging.map((b) => ({
    name: b.bucket,
    value: b.value || 0,
    pct: totalAgingVal > 0 ? Math.round(((b.value || 0) / totalAgingVal) * 100) : 0,
    color: AGING_COLORS[b.bucket] || "#64748B",
  }));

  // Critical accounts
  const criticalAccounts = summaryData?.critical_customers ?? [];
  const filteredAccounts = criticalAccounts.filter((acc) => {
    if (activeTab === "overdue" && acc.current_balance <= 0) return false;
    if (activeTab === "high_risk" && acc.current_balance <= (acc.credit_limit || 0)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!acc.customer_name?.toLowerCase().includes(q) && !acc.customer_code?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. TITLE CARD ── */}
      <PageTitleCard
        title="Invoice & Receivables Center"
        description="Monitor invoices, collections, customer balances, and aging risk in real-time."
        moduleTag="Finance"
        icon={FileText}
        accent="blue"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Interactive Date Range Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 shadow-2xs text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                >
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{currentCfg.label}</span>
                  <span className="text-slate-400 font-normal">{currentCfg.subtext}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg rounded-xl p-1 z-50">
                <DropdownMenuItem
                  onClick={() => setSelectedPeriod("month")}
                  className={`flex flex-col items-start px-3 py-2 rounded-lg cursor-pointer text-xs ${selectedPeriod === "month" ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <span>This Month</span>
                  <span className="text-[10px] text-slate-400 font-normal">Current Billing Cycle</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedPeriod("last_month")}
                  className={`flex flex-col items-start px-3 py-2 rounded-lg cursor-pointer text-xs ${selectedPeriod === "last_month" ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <span>Last Month</span>
                  <span className="text-[10px] text-slate-400 font-normal">Prior Billing Cycle</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedPeriod("quarter")}
                  className={`flex flex-col items-start px-3 py-2 rounded-lg cursor-pointer text-xs ${selectedPeriod === "quarter" ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <span>This Quarter</span>
                  <span className="text-[10px] text-slate-400 font-normal">Quarter to Date</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedPeriod("year")}
                  className={`flex flex-col items-start px-3 py-2 rounded-lg cursor-pointer text-xs ${selectedPeriod === "year" ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <span>This Year (YTD)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Year to Date</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : "text-slate-400"}`} />
              <span>Refresh</span>
            </button>

            {/* Create Invoice Button */}
            <button
              onClick={() => navigate("/invoice-center/sales-invoices/create")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </button>
          </div>
        }
      />

      {/* ── 2. TOP 8 KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3.5">
        {/* Card 1: Total AR Balance */}
        <div
          onClick={() => navigate("/invoice-center/reports/customer-aging")}
          title="Click to view Customer Aging Report"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Total AR Balance</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">
            LKR {totalArBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-semibold text-slate-500">
              Live Ledger Balance
            </span>
            <SparklineCurve color="#10B981" up={totalArBalance >= 0} />
          </div>
        </div>

        {/* Card 2: Total Customers */}
        <div
          onClick={() => navigate("/invoice-center/customers")}
          title="Click to view All Customers"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">Total Customers</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">{totalCustomers}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-semibold text-slate-500">
              {summaryData?.active_customers ?? 0} active
            </span>
            <SparklineBars color="bg-blue-400" />
          </div>
        </div>

        {/* Card 3: Overdue Invoices */}
        <div
          onClick={() => navigate("/invoice-center/reports/outstanding-invoices")}
          title="Click to view Overdue Outstanding Invoices Report"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-rose-600 transition-colors">Overdue Invoices</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-rose-600 mt-2">{overdueInvoices}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-semibold text-rose-600">
              Requires attention
            </span>
            <SparklineCurve color="#EF4444" up={overdueInvoices > 0} />
          </div>
        </div>

        {/* Card 4: Total Credit Granted */}
        <div
          onClick={() => navigate("/invoice-center/reports/customer-balance")}
          title="Click to view Customer Balance & Credit Report"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-purple-600 transition-colors">Total Credit Granted</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">
            LKR {totalCreditLimit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-semibold text-slate-500">
              Across customer accounts
            </span>
            <SparklineBars color="bg-purple-400" />
          </div>
        </div>

        {/* Card 5: Draft Orders */}
        <div
          onClick={() => navigate("/invoice-center/sales-orders")}
          title="Click to view Sales Orders"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-teal-600 transition-colors">Draft Sales Orders</span>
            <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">{summaryData?.draft_sales_orders ?? 0}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-semibold text-slate-500">Pending approval</span>
            <SparklineCurve color="#10B981" up={true} />
          </div>
        </div>

        {/* Card 6: Draft Invoices */}
        <div
          onClick={() => navigate("/invoice-center/sales-invoices")}
          title="Click to view Sales Invoices"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-sky-600 transition-colors">Draft Invoices</span>
            <div className="h-7 w-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">{summaryData?.draft_sales_invoices ?? 0}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-semibold text-slate-500">Unposted drafts</span>
            <SparklineCurve color="#0284C7" up={false} />
          </div>
        </div>

        {/* Card 7: Unapplied Payments */}
        <div
          onClick={() => navigate("/invoice-center/reports/customer-receipt-register")}
          title="Click to view Customer Receipt Register"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors">Unapplied Receipts</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">{unappliedReceipts}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-semibold text-amber-600">Needs allocation</span>
            <SparklineCurve color="#F59E0B" up={unappliedReceipts > 0} />
          </div>
        </div>

        {/* Card 8: Over Credit Limit */}
        <div
          onClick={() => navigate("/invoice-center/customers")}
          title="Click to view Customers Over Credit Limit"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors">Over Credit Limit</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-rose-600 mt-2">{summaryData?.customers_over_credit_limit ?? 0}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-semibold text-slate-500">Accounts flagged</span>
            <SparklineCurve color="#6366F1" up={false} />
          </div>
        </div>
      </div>

      {/* ── 3. MIDDLE SECTION: Charts & Quick Actions Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Invoicing vs Collections Chart (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Percent className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Invoicing vs Collections</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Monthly trend of invoice issuance vs cash collections</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/invoice-center/reports/collection-summary")}
              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              title="Open Collection Summary Report"
            >
              Collection Report →
            </button>
          </div>

          <div className="h-64 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="invGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(v) => `${v}M`} />
                  <Tooltip
                    formatter={(val: any) => [`LKR ${val}M`, ""]}
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="Invoiced" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#invGradient)" dot={{ r: 3, fill: "#3B82F6" }} />
                  <Area type="monotone" dataKey="Collected" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colGradient)" dot={{ r: 3, fill: "#10B981" }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Inbox className="h-8 w-8 mb-2 stroke-1" />
                <p className="text-xs">No trend history recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Middle: AR Aging Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                  <Percent className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">AR Aging Distribution</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate("/invoice-center/reports/customer-aging")}
                className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                title="Open Customer Aging Report"
              >
                Aging Report →
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Outstanding balances by aging bucket</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-5 relative flex items-center justify-center h-44">
              {totalAgingVal > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={agingData}
                        innerRadius={50}
                        outerRadius={68}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {agingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [`LKR ${(Number(val) / 1000000).toFixed(2)}M`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total AR</span>
                    <span className="text-xs font-extrabold text-slate-900">
                      LKR {(totalAgingVal / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Inbox className="h-6 w-6 mb-1 stroke-1" />
                  <span className="text-[10px]">No aging balances</span>
                </div>
              )}
            </div>

            {/* Aging Legend Breakdown */}
            <div className="sm:col-span-7 space-y-1.5 text-xs">
              {agingData.length > 0 ? (
                agingData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 truncate text-[11px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-slate-900 text-[11px]">
                        LKR {Number(item.value).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 w-7 text-right">{item.pct}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No aging categories found</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions Card (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-500 font-bold text-base">⚡</span>
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Common receivables operations</p>

            <div className="space-y-2">
              {[
                { label: "Log Customer Payment", path: "/invoice-center/customer-receipts/create", icon: Receipt, color: "text-emerald-600" },
                { label: "Create Credit Note", path: "/invoice-center/credit-notes/create", icon: FileText, color: "text-blue-600" },
                { label: "Create Debit Note", path: "/invoice-center/debit-notes/create", icon: FileText, color: "text-purple-600" },
                { label: "Customer Aging Report", path: "/invoice-center/reports/customer-aging", icon: Clock, color: "text-amber-600" },
                { label: "Bank Reconciliation", path: "/finance/banking/bank-reconciliation", icon: RefreshCw, color: "text-cyan-600" },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => navigate(btn.path)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <btn.icon className={`h-4 w-4 shrink-0 ${btn.color}`} />
                    <span className="text-xs font-semibold text-slate-700 truncate">{btn.label}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. MIDDLE SECTION: Accounts Requiring Immediate Attention & Collections Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Accounts Table (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Accounts Requiring Immediate Attention</h3>
                <p className="text-xs text-slate-500">Customers with high outstanding balances or credit risks</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: "all", label: `All (${criticalAccounts.length})` },
                { id: "overdue", label: "With Balance" },
                { id: "high_risk", label: "Over Credit Limit" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              {/* Search Box */}
              <div className="relative ml-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Segment</th>
                  <th className="py-2.5 px-3 text-right">Credit Limit</th>
                  <th className="py-2.5 px-3 text-right">Current Balance</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{acc.customer_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{acc.customer_code}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {acc.customer_type || "Standard"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600">
                        LKR {(acc.credit_limit || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600">
                        LKR {(acc.current_balance || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                            acc.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : acc.status === "blocked"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {acc.status || "active"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => navigate(`/invoice-center/customers/${acc.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No accounts requiring attention found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Collections Activity (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Recent Collections Activity</h3>
              </div>
              <button
                onClick={() => navigate("/invoice-center/customer-receipts")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Latest customer payments received</p>

            <div className="space-y-3">
              {recentReceipts.length > 0 ? (
                recentReceipts.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.customer_name ? item.customer_name.slice(0, 2).toUpperCase() : "CR"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.customer_name || item.receipt_number || "Payment"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.payment_method || "Payment"} • {item.receipt_date || "Recent"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 shrink-0">
                      LKR {Number(item.receipt_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <Inbox className="h-6 w-6 mx-auto mb-1 stroke-1" />
                  <p className="text-xs">No recent collections recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. BOTTOM ROW: Real Breakdown Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
        {/* Card 1: Top Critical Balances */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Highest Outstanding Customer Balances</h3>
            </div>
            <button onClick={() => navigate("/invoice-center/customers")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">Accounts ordered by current outstanding balance</p>

          <div className="space-y-3">
            {criticalAccounts.length > 0 ? (
              criticalAccounts.slice(0, 5).map((cust, idx) => (
                <div key={cust.id || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-700 font-medium truncate">
                      <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{cust.customer_name}</span>
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      LKR {Number(cust.current_balance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          cust.credit_limit > 0
                            ? Math.round((cust.current_balance / cust.credit_limit) * 100)
                            : 50
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">No customer balances recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Upcoming Unpaid Invoices */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Unpaid Invoices Awaiting Settlement</h3>
            </div>
            <button onClick={() => navigate("/invoice-center/sales-invoices")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">Recent sales invoices requiring collection</p>

          <div className="space-y-2 text-xs">
            {upcomingInvoices.length > 0 ? (
              upcomingInvoices.map((inv: any, idx: number) => (
                <div key={inv.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate text-[11.5px]">{inv.customer_name || "Customer"}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {inv.invoice_number} • Due {inv.due_date || "Immediate"}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 text-[11.5px] shrink-0">
                    LKR {Number(inv.balance_amount ?? inv.total_amount ?? 0).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">No pending invoices found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
