import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useNavigate } from "react-router-dom";
import { PageTitleCard } from "../../../components/common/PageTitleCard";
import {
  Users,
  CreditCard,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
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
  MoreVertical,
  CheckCircle2,
  Check,
  Send,
  AlertCircle,
  BarChart3,
  Percent,
  ChevronDown,
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

/* ── Invoicing vs Collections Trend (Apr - Oct 2026) ── */
const trendData = [
  { month: "Apr 2026", Invoiced: 16.2, Collected: 14.5 },
  { month: "May 2026", Invoiced: 17.8, Collected: 15.6 },
  { month: "Jun 2026", Invoiced: 19.4, Collected: 17.2 },
  { month: "Jul 2026", Invoiced: 18.2, Collected: 17.0 },
  { month: "Aug 2026", Invoiced: 21.0, Collected: 18.2 },
  { month: "Sep 2026", Invoiced: 21.8, Collected: 18.4 },
  { month: "Oct 2026", Invoiced: 22.4, Collected: 18.6 },
];

/* ── AR Aging Donut Data ── */
const agingData = [
  { name: "Current (0-30 days)", value: 16874000, pct: 52, color: "#10B981" },
  { name: "1 - 30 days", value: 7788000, pct: 24, color: "#3B82F6" },
  { name: "31 - 60 days", value: 3894000, pct: 12, color: "#F59E0B" },
  { name: "61 - 90 days", value: 2596000, pct: 8, color: "#F97316" },
  { name: "90+ days", value: 1298000, pct: 4, color: "#EF4444" },
];

/* ── Immediate Attention Accounts ── */
const initialAccounts = [
  {
    id: 1,
    code: "CUS-1008",
    name: "MediCare Pharmacy Network",
    segment: "Retail",
    creditLimit: 5000000,
    currentBalance: 4760000,
    agingBucket: "90+ days",
    risk: "High",
    lastPayment: "Aug 28, 2026 (32 days ago)",
    overdue: true,
  },
  {
    id: 2,
    code: "CUS-1021",
    name: "City General Hospital",
    segment: "Hospital",
    creditLimit: 12000000,
    currentBalance: 11340000,
    agingBucket: "61 - 90 days",
    risk: "High",
    lastPayment: "Aug 31, 2026 (29 days ago)",
    overdue: true,
  },
  {
    id: 3,
    code: "CUS-1043",
    name: "HealthPlus Distributors",
    segment: "Distributor",
    creditLimit: 10000000,
    currentBalance: 6980000,
    agingBucket: "31 - 60 days",
    risk: "Medium",
    lastPayment: "Sep 12, 2026 (17 days ago)",
    overdue: true,
  },
  {
    id: 4,
    code: "CUS-1078",
    name: "Lanka Care Clinics",
    segment: "Clinic",
    creditLimit: 3000000,
    currentBalance: 1920000,
    agingBucket: "1 - 30 days",
    risk: "Low",
    lastPayment: "Sep 28, 2026 (1 day ago)",
    overdue: false,
  },
  {
    id: 5,
    code: "CUS-1102",
    name: "Sunrise Medical Center",
    segment: "Hospital",
    creditLimit: 8000000,
    currentBalance: 2450000,
    agingBucket: "31 - 60 days",
    risk: "Medium",
    lastPayment: "Sep 14, 2026 (15 days ago)",
    overdue: true,
  },
];

/* ── Recent Collections Activity ── */
const recentCollections = [
  { id: 1, initials: "GW", name: "Greenlife Wholesalers", date: "Oct 16, 2026", amount: 1250000, bg: "bg-blue-100 text-blue-700" },
  { id: 2, initials: "CH", name: "City General Hospital", date: "Oct 15, 2026", amount: 3600000, bg: "bg-teal-100 text-teal-700" },
  { id: 3, initials: "MP", name: "MediCare Pharmacy", date: "Oct 14, 2026", amount: 980000, bg: "bg-indigo-100 text-indigo-700" },
  { id: 4, initials: "LC", name: "Lanka Care Clinics", date: "Oct 13, 2026", amount: 450000, bg: "bg-purple-100 text-purple-700" },
  { id: 5, initials: "SD", name: "Sunshine Distributors", date: "Oct 12, 2026", amount: 2100000, bg: "bg-amber-100 text-amber-700" },
];

/* ── Top Overdue Customers ── */
const topOverdue = [
  { name: "City General Hospital", amount: 11340000, pct: 100 },
  { name: "HealthPlus Distributors", amount: 6980000, pct: 62 },
  { name: "MediCare Pharmacy Network", amount: 4760000, pct: 42 },
  { name: "Sunrise Medical Center", amount: 2450000, pct: 22 },
  { name: "Global Pharma Ltd", amount: 1980000, pct: 18 },
];

/* ── Payment Method Breakdown ── */
const paymentMethods = [
  { name: "Bank Transfer", pct: 45, amount: 8370000, color: "#3B82F6" },
  { name: "Cheque", pct: 28, amount: 5208000, color: "#06B6D4" },
  { name: "Cash", pct: 15, amount: 2790000, color: "#10B981" },
  { name: "Credit Card", pct: 8, amount: 1488000, color: "#F59E0B" },
  { name: "Other", pct: 4, amount: 744000, color: "#8B5CF6" },
];

/* ── Upcoming Invoice Due Dates ── */
const upcomingInvoices = [
  { customer: "Lanka Care Clinics", inv: "INV-10456", due: "Oct 18, 2026", amount: 750000 },
  { customer: "Sunrise Medical", inv: "INV-10462", due: "Oct 19, 2026", amount: 1250000 },
  { customer: "HealthLine Pharm", inv: "INV-10471", due: "Oct 20, 2026", amount: 980000 },
  { customer: "CarePlus Hospital", inv: "INV-10480", due: "Oct 21, 2026", amount: 1760000 },
  { customer: "Wellness Distributors", inv: "INV-10483", due: "Oct 22, 2026", amount: 640000 },
];

/* ── Collector Performance ── */
const collectors = [
  { name: "Nirmal Perera", collected: 8450000, target: 10000000, pct: 84, color: "bg-emerald-500" },
  { name: "Samanthi Silva", collected: 6780000, target: 8000000, pct: 85, color: "bg-blue-500" },
  { name: "Kasun Fernando", collected: 4320000, target: 6000000, pct: 72, color: "bg-amber-500" },
  { name: "Tharindu Jayasuriya", collected: 3050000, target: 5000000, pct: 61, color: "bg-orange-500" },
  { name: "Other Team", collected: 2000000, target: 4000000, pct: 50, color: "bg-rose-500" },
];

export default function InvoiceCenterDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "last_month" | "quarter" | "year">("month");

  const periodConfig = {
    month: {
      label: "This Month",
      subtext: "Oct 1 – Oct 31, 2026",
      arBalance: "LKR 32,450,000",
      customers: "342",
      overdue: "12",
      creditGranted: "LKR 85,000,000",
      collectionRate: "78.4%",
      dso: "32 days",
      unapplied: "LKR 2,450,000",
      dueWeek: "LKR 5,780,000",
    },
    last_month: {
      label: "Last Month",
      subtext: "Sep 1 – Sep 30, 2026",
      arBalance: "LKR 30,850,000",
      customers: "338",
      overdue: "9",
      creditGranted: "LKR 82,400,000",
      collectionRate: "73.2%",
      dso: "36 days",
      unapplied: "LKR 3,120,000",
      dueWeek: "LKR 6,240,000",
    },
    quarter: {
      label: "This Quarter",
      subtext: "Jul 1 – Oct 31, 2026",
      arBalance: "LKR 94,620,000",
      customers: "354",
      overdue: "18",
      creditGranted: "LKR 89,500,000",
      collectionRate: "81.6%",
      dso: "29 days",
      unapplied: "LKR 4,890,000",
      dueWeek: "LKR 8,450,000",
    },
    year: {
      label: "This Year (YTD)",
      subtext: "Jan 1 – Oct 31, 2026",
      arBalance: "LKR 268,400,000",
      customers: "386",
      overdue: "24",
      creditGranted: "LKR 112,000,000",
      collectionRate: "83.1%",
      dso: "28 days",
      unapplied: "LKR 9,650,000",
      dueWeek: "LKR 12,300,000",
    },
  };

  const currentCfg = periodConfig[selectedPeriod];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Invoice & receivables metrics updated");
    }, 600);
  };

  const filteredAccounts = initialAccounts.filter((acc) => {
    if (activeTab === "overdue" && !acc.overdue) return false;
    if (activeTab === "high_risk" && acc.risk !== "High") return false;
    if (activeTab === "due_soon" && !acc.agingBucket.includes("30")) return false;
    if (searchQuery && !acc.name.toLowerCase().includes(searchQuery.toLowerCase()) && !acc.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── 1. TITLE CARD (Matching Screenshot) ── */}
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
                  <span className="text-[10px] text-slate-400 font-normal">Oct 1 – Oct 31, 2026</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedPeriod("last_month")}
                  className={`flex flex-col items-start px-3 py-2 rounded-lg cursor-pointer text-xs ${selectedPeriod === "last_month" ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <span>Last Month</span>
                  <span className="text-[10px] text-slate-400 font-normal">Sep 1 – Sep 30, 2026</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedPeriod("quarter")}
                  className={`flex flex-col items-start px-3 py-2 rounded-lg cursor-pointer text-xs ${selectedPeriod === "quarter" ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <span>This Quarter</span>
                  <span className="text-[10px] text-slate-400 font-normal">Jul 1 – Oct 31, 2026</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedPeriod("year")}
                  className={`flex flex-col items-start px-3 py-2 rounded-lg cursor-pointer text-xs ${selectedPeriod === "year" ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <span>This Year (YTD)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Jan 1 – Oct 31, 2026</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
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

      {/* ── 2. TOP 8 KPI METRIC CARDS (Exact values & layout from photo with report deep-links) ── */}
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
          <p className="text-lg font-extrabold text-slate-900 mt-2">{currentCfg.arBalance}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-bold text-emerald-600 flex items-center gap-0.5">
              ↑ 12.5% <span className="font-normal text-slate-400">vs last month</span>
            </span>
            <SparklineCurve color="#10B981" up={true} />
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
          <p className="text-lg font-extrabold text-slate-900 mt-2">{currentCfg.customers}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-bold text-blue-600 flex items-center gap-0.5">
              ↑ 6.2% <span className="font-normal text-slate-400">active customers</span>
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
          <p className="text-lg font-extrabold text-rose-600 mt-2">{currentCfg.overdue}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-bold text-rose-600 flex items-center gap-0.5">
              ↑ 33.3% <span className="font-normal text-slate-400">requires attention</span>
            </span>
            <SparklineCurve color="#EF4444" up={true} />
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
          <p className="text-lg font-extrabold text-slate-900 mt-2">{currentCfg.creditGranted}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-bold text-purple-600 flex items-center gap-0.5">
              ↑ 4.1% <span className="font-normal text-slate-400">across 210 accounts</span>
            </span>
            <SparklineBars color="bg-purple-400" />
          </div>
        </div>

        {/* Card 5: Collection Rate */}
        <div
          onClick={() => navigate("/invoice-center/reports/collection-summary")}
          title="Click to view Collection Summary Report"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-teal-600 transition-colors">Collection Rate</span>
            <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">{currentCfg.collectionRate}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-bold text-emerald-600 flex items-center gap-0.5">
              ↑ 6.8% <span className="font-normal text-slate-400">vs last month</span>
            </span>
            <SparklineCurve color="#10B981" up={true} />
          </div>
        </div>

        {/* Card 6: DSO */}
        <div
          onClick={() => navigate("/invoice-center/reports/customer-aging")}
          title="Click to view DSO & Aging Risk"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-sky-600 transition-colors">DSO</span>
            <div className="h-7 w-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">{currentCfg.dso}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-bold text-sky-600 flex items-center gap-0.5">
              ↓ 18.5% <span className="font-normal text-slate-400">vs last month</span>
            </span>
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors">Unapplied Payments</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">{currentCfg.unapplied}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-bold text-amber-600 flex items-center gap-0.5">
              ↑ 12.1% <span className="font-normal text-slate-400">needs allocation</span>
            </span>
            <SparklineCurve color="#F59E0B" up={true} />
          </div>
        </div>

        {/* Card 8: Due This Week */}
        <div
          onClick={() => navigate("/invoice-center/reports/outstanding-invoices")}
          title="Click to view Invoices Due This Week"
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors">Due This Week</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-2">{currentCfg.dueWeek}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
            <span className="font-bold text-indigo-600 flex items-center gap-0.5">
              ↓ 22.3% <span className="font-normal text-slate-400">in 18 invoices</span>
            </span>
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
                  <BarChart3 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Invoicing vs Collections</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Monthly trend of invoice issuance vs cash collections</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Invoiced: <strong className="text-slate-800">LKR 22.4M</strong>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Collected: <strong className="text-slate-800">LKR 18.6M</strong>
                </span>
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
          </div>

          <div className="h-64 w-full">
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
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(v) => `${v}M`} domain={[0, 25]} />
                <Tooltip
                  formatter={(val: any) => [`LKR ${val}M`, ""]}
                  contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="Invoiced" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#invGradient)" dot={{ r: 3, fill: "#3B82F6" }} />
                <Area type="monotone" dataKey="Collected" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colGradient)" dot={{ r: 3, fill: "#10B981" }} />
              </AreaChart>
            </ResponsiveContainer>
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
            {/* Donut Chart with Center LKR 32.45M */}
            <div className="sm:col-span-5 relative flex items-center justify-center h-44">
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
                  <Tooltip formatter={(val: any) => [`LKR ${(val / 1000000).toFixed(2)}M`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total AR</span>
                <span className="text-sm font-extrabold text-slate-900">LKR 32.45M</span>
              </div>
            </div>

            {/* Aging Legend Breakdown */}
            <div className="sm:col-span-7 space-y-1.5 text-xs">
              {agingData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate text-[11px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-slate-900 text-[11px]">LKR {(item.value / 1000).toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 w-7 text-right">{item.pct}%</span>
                  </div>
                </div>
              ))}
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
                { label: "Send Payment Reminder", action: () => toast.success("Payment reminder dispatches sent to 12 overdue accounts"), icon: Send, color: "text-amber-600" },
                { label: "Start Dunning Cycle", action: () => toast.info("Dunning automation initiated for >60 days overdue accounts"), icon: AlertCircle, color: "text-rose-600" },
                { label: "Reconcile Receipts", path: "/finance/banking/bank-reconciliation", icon: RefreshCw, color: "text-cyan-600" },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => (btn.path ? navigate(btn.path) : btn.action?.())}
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
                <p className="text-xs text-slate-500">Customers with overdue balances, credit risks, or payment issues</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: "all", label: "All (12)" },
                { id: "overdue", label: "Overdue (12)" },
                { id: "high_risk", label: "High Risk (5)" },
                { id: "due_soon", label: "Due Soon (8)" },
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

              {/* Export */}
              <button
                onClick={() => toast.success("Accounts list exported to Excel")}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-8">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Segment</th>
                  <th className="py-2.5 px-3 text-right">Credit Limit</th>
                  <th className="py-2.5 px-3 text-right">Current Balance</th>
                  <th className="py-2.5 px-3">Aging Bucket</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Last Payment</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{acc.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{acc.code}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {acc.segment}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-600">
                      LKR {acc.creditLimit.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600">
                      LKR {acc.currentBalance.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                          acc.agingBucket.includes("90")
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : acc.agingBucket.includes("61")
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : acc.agingBucket.includes("31")
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {acc.agingBucket}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                          acc.risk === "High"
                            ? "bg-rose-100 text-rose-800"
                            : acc.risk === "Medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {acc.risk}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {acc.lastPayment}
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
                ))}
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
              {recentCollections.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${item.bg}`}>
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400">Payment received • {item.date}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 shrink-0">
                    LKR {item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. BOTTOM ROW: 4 KPI Breakdown Cards (Exact layout from photo) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Top Overdue Customers */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Top Overdue Customers</h3>
            </div>
            <button onClick={() => navigate("/invoice-center/customers")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">Top 5 customers by overdue balance</p>

          <div className="space-y-3">
            {topOverdue.map((cust, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-700 font-medium truncate">
                    <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{cust.name}</span>
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">LKR {cust.amount.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${cust.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Payment Method Breakdown Donut */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                  <Percent className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Payment Method Breakdown</h3>
              </div>
              <span className="px-2 py-0.5 text-[10.5px] font-medium text-slate-600 bg-slate-100 rounded-lg">
                This Month
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Collection receipts by payment method</p>

            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethods} innerRadius={38} outerRadius={52} paddingAngle={2} dataKey="pct">
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[11px] font-extrabold text-slate-900">LKR 18.6M</span>
                  <span className="text-[9px] uppercase text-slate-400 font-bold">Total</span>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 min-w-0 text-xs">
                {paymentMethods.map((pm) => (
                  <div key={pm.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 truncate text-[11px]">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pm.color }} />
                      <span className="truncate">{pm.name}</span>
                    </span>
                    <span className="font-semibold text-slate-900 text-[11px]">{pm.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Upcoming Invoice Due Dates */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Upcoming Invoice Due Dates</h3>
            </div>
            <button onClick={() => navigate("/invoice-center/sales-invoices")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">Invoices due in the next 7 days</p>

          <div className="space-y-2 text-xs">
            {upcomingInvoices.map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate text-[11.5px]">{inv.customer}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{inv.inv} • Due {inv.due}</p>
                </div>
                <span className="font-bold text-slate-900 text-[11.5px] shrink-0">
                  LKR {inv.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Collection Performance */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">🏆</span>
              <h3 className="text-sm font-bold text-slate-900">Collection Performance</h3>
            </div>
            <span className="px-2 py-0.5 text-[10.5px] font-medium text-slate-600 bg-slate-100 rounded-lg">
              By Collector
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">Collector achievement vs targets</p>

          <div className="space-y-3">
            {collectors.map((c, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 text-[11.5px] truncate">{c.name}</span>
                  <span className="font-bold text-slate-900 text-[11.5px]">{c.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>LKR {c.collected.toLocaleString()}</span>
                  <span>Target: LKR {c.target.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
