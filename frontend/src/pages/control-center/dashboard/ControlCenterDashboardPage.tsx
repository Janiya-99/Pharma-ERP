import { useState } from "react";
import {
  Building2,
  ShieldAlert,
  Users,
  UserCheck,
  Blocks,
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  Plus,
  Activity,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Database,
  Server,
  Key,
  ExternalLink,
  AlertCircle,
  FileText,
  UserPlus,
  Settings,
  Lock,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../../components/ui/chart";

/* ─────────────────────────────────────────────────
   Type Declarations
───────────────────────────────────────────────── */

interface ActivityDataPoint {
  name: string;
  "Active Users": number;
  "API Calls": number;
}

interface ModuleDataPoint {
  name: string;
  Users: number;
}

interface SecurityLog {
  id: string;
  time: string;
  event: string;
  user: string;
  ip: string;
  type: "warning" | "info" | "critical";
}

interface AuditLog {
  id: string;
  time: string;
  action: string;
  module: string;
  user: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  badge?: string;
}

interface BranchUser {
  name: string;
  users: number;
  percentage: number;
  color: string;
}

interface RoleDistribution {
  name: string;
  count: number;
}

interface PendingAction {
  label: string;
  count: number;
  severity: "high" | "medium" | "low";
  description: string;
}

type TrendDirection = "up" | "down" | "neutral";

interface KPIData {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: TrendDirection;
  trendValue: string;
  description: string;
  accent?: boolean;
  tone?: string;
}

/* ─────────────────────────────────────────────────
   Static Data
───────────────────────────────────────────────── */

const telemetryChartConfig = {
  "Active Users": { label: "Active Users", color: "var(--chart-1)" },
  "API Calls": { label: "API Calls", color: "var(--chart-2)" },
} satisfies ChartConfig;

const moduleChartConfig = {
  inventory: { label: "Inventory", color: "var(--chart-1)" },
  finance: { label: "Finance", color: "var(--chart-2)" },
  hr: { label: "HR & Payroll", color: "var(--chart-3)" },
  compliance: { label: "Compliance", color: "var(--chart-4)" },
  crm: { label: "CRM", color: "var(--chart-5)" },
  controlCenter: { label: "Control Center", color: "var(--chart-6)" },
} satisfies ChartConfig;

const roleChartConfig = {
  regular: { label: "Regular Users", color: "var(--chart-1)" },
  managers: { label: "Department Mgrs", color: "var(--chart-2)" },
  admins: { label: "System Admins", color: "var(--chart-3)" },
  auditors: { label: "Auditors", color: "var(--chart-4)" },
  compliance: { label: "Compliance Officers", color: "var(--chart-5)" },
} satisfies ChartConfig;

const activityData = [
  { name: "Mon", "Active Users": 820, "API Calls": 14200 },
  { name: "Tue", "Active Users": 940, "API Calls": 18500 },
  { name: "Wed", "Active Users": 890, "API Calls": 16800 },
  { name: "Thu", "Active Users": 1120, "API Calls": 22400 },
  { name: "Fri", "Active Users": 1050, "API Calls": 21000 },
  { name: "Sat", "Active Users": 420, "API Calls": 8400 },
  { name: "Sun", "Active Users": 380, "API Calls": 7200 },
];

const moduleData = [
  { name: "Inventory", Users: 640, fill: "var(--chart-1)" },
  { name: "Finance", Users: 520, fill: "var(--chart-2)" },
  { name: "HR & Payroll", Users: 480, fill: "var(--chart-3)" },
  { name: "Compliance", Users: 340, fill: "var(--chart-4)" },
  { name: "CRM", Users: 290, fill: "var(--chart-5)" },
  { name: "Control Center", Users: 120, fill: "var(--chart-6)" },
];

const roleData = [
  { name: "Regular Users", count: 850, fill: "var(--chart-1)" },
  { name: "Department Mgrs", count: 124, fill: "var(--chart-2)" },
  { name: "Compliance Officers", count: 24, fill: "var(--chart-5)" },
  { name: "Auditors", count: 18, fill: "var(--chart-4)" },
  { name: "System Admins", count: 12, fill: "var(--chart-3)" },
];

const kpiCards: KPIData[] = [
  {
    title: "Total Branches",
    value: "24",
    icon: Building2,
    trend: "up",
    trendValue: "+3 this quarter",
    description: "Regional office locations",
    tone: "blue",
  },
  {
    title: "Total Users",
    value: "1,248",
    icon: Users,
    trend: "up",
    trendValue: "+12% vs last month",
    description: "Registered employee accounts",
    tone: "indigo",
  },
  {
    title: "Software Modules",
    value: "8",
    icon: Blocks,
    trend: "neutral",
    trendValue: "All systems online",
    description: "Licensed ERP suites",
    tone: "emerald",
  },
  {
    title: "Active Incidents",
    value: "3",
    icon: ShieldAlert,
    trend: "down",
    trendValue: "-2 from yesterday",
    description: "Requires immediate attention",
    accent: true,
    tone: "rose",
  },
];

const securityLogs: SecurityLog[] = [
  { id: "SEC-101", time: "10 mins ago", event: "Multiple failed login attempts", user: "admin@ny.corp", ip: "192.168.1.104", type: "critical" },
  { id: "SEC-102", time: "1 hour ago", event: "Elevated role permissions assigned", user: "System Admin", ip: "10.0.0.12", type: "warning" },
  { id: "SEC-103", time: "3 hours ago", event: "New API access key generated", user: "dev.ops@hq.corp", ip: "10.0.0.45", type: "info" },
  { id: "SEC-104", time: "Yesterday", event: "Firewall rules updated successfully", user: "sec.ops@hq.corp", ip: "10.0.0.18", type: "info" },
];

const auditLogs: AuditLog[] = [
  { id: "AUD-201", time: "2 mins ago", action: "Created new employee account", module: "HR & Payroll", user: "sarah.m@hq.corp" },
  { id: "AUD-202", time: "15 mins ago", action: "Modified tax calculation rules", module: "Finance", user: "robert.f@hq.corp" },
  { id: "AUD-203", time: "2 hours ago", action: "Updated warehouse stock threshold", module: "Inventory", user: "david.k@ny.corp" },
  { id: "AUD-204", time: "4 hours ago", action: "Approved compliance audit report #402", module: "Compliance", user: "elena.r@hq.corp" },
];

const quickActions: QuickAction[] = [
  { label: "Create User Account", description: "Provision new employee credentials", icon: UserPlus, badge: "HR" },
  { label: "Assign Module Access", description: "Manage role-based permissions", icon: ShieldAlert, badge: "Security" },
  { label: "Add New Branch", description: "Register physical office location", icon: Building2 },
  { label: "Audit System Access", description: "Review user privilege matrix", icon: Activity, badge: "Compliance" },
  { label: "Generate API Keys", description: "Configure system integrations", icon: Key },
  { label: "System Health Report", description: "Export diagnostics and logs", icon: HeartPulse },
];

const branchUsers: BranchUser[] = [
  { name: "Headquarters (HQ)", users: 642, percentage: 65, color: "#4854CC" },
  { name: "New York Regional", users: 240, percentage: 24, color: "#6366f1" },
  { name: "Los Angeles Hub", users: 110, percentage: 11, color: "#818cf8" },
];

const pendingActions: PendingAction[] = [
  { label: "Locked User Accounts", count: 3, severity: "high", description: "Accounts suspended due to failed authentication" },
  { label: "Users Without Assigned Roles", count: 12, severity: "medium", description: "New accounts awaiting permission assignment" },
  { label: "Pending Access Requests", count: 5, severity: "low", description: "Requests for financial and inventory reports" },
];

/* ─────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────── */

interface TrendBadgeProps {
  trend: TrendDirection;
  value: string;
}

function TrendBadge({ trend, value }: TrendBadgeProps) {
  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold shrink-0 max-w-full truncate ${
        isUp
          ? "bg-emerald-50 text-emerald-700   border border-emerald-200/60 "
          : isDown
          ? "bg-rose-50 text-rose-700   border border-rose-200/60 "
          : "bg-slate-100 text-slate-600   border border-slate-200 "
      }`}
    >
      {isUp ? (
        <TrendingUp className="h-3 w-3 shrink-0" />
      ) : isDown ? (
        <TrendingDown className="h-3 w-3 shrink-0" />
      ) : (
        <Minus className="h-3 w-3 shrink-0" />
      )}
      <span className="truncate">{value}</span>
    </span>
  );
}

function SeverityBadge({ type }: { type: SecurityLog["type"] }) {
  const styles = {
    critical: "bg-rose-100 text-rose-800   border-rose-300 ",
    warning: "bg-amber-100 text-amber-800   border-amber-300 ",
    info: "bg-blue-100 text-blue-800   border-blue-300 ",
  }[type];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${styles}`}>
      {type}
    </span>
  );
}

/* ─────────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────────── */

const ControlCenterDashboardPage = () => {
  const [dateFilter, setDateFilter] = useState<string>("This week");
  const [activeTab, setActiveTab] = useState<"security" | "audit">("security");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="w-full max-w-full space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80  pb-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900  sm:text-3xl">
                Control Center
              </h1>
              <p className="text-sm text-slate-500 ">
                System administration, global security governance, and organizational access matrix
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto flex-1 sm:flex-initial min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search audit logs, users..."
              className="h-10 w-full sm:w-56 md:w-64 rounded-xl border border-slate-200  bg-white  pl-10 pr-4 text-sm text-slate-900  placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
          </div>

          {/* Branch Filter */}
          <select className="h-10 w-full sm:w-auto flex-1 sm:flex-initial rounded-xl border border-slate-200  bg-white  px-3.5 text-sm font-medium text-slate-700  shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
            <option value="all">All Branches (Global)</option>
            <option value="hq">Headquarters (HQ)</option>
            <option value="ny">New York Regional</option>
            <option value="la">Los Angeles Hub</option>
          </select>

          {/* Timeframe Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 w-full sm:w-auto flex-1 sm:flex-initial rounded-xl border border-slate-200  bg-white  px-3.5 text-sm font-medium text-slate-700  shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
          >
            <option value="Today">Today (24h)</option>
            <option value="This week">This Week</option>
            <option value="This month">This Month</option>
            <option value="This quarter">This Quarter</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh dashboard telemetry"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200  bg-white  text-slate-600  hover:bg-slate-50  hover:text-slate-900  transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 1: High-Level KPI Metric Cards
      ══════════════════════════════════════════════ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 ">
            Executive Summary & System Metrics
          </h2>
          <span className="text-xs text-slate-400">Updated just now</span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            const isAlert = kpi.accent;

            return (
              <div
                key={kpi.title}
                className={`group relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  kpi.tone === "rose"
                    ? "border-rose-100 bg-gradient-to-br from-rose-50/80 to-white shadow-md ring-1 ring-inset ring-rose-100"
                    : kpi.tone === "blue"
                    ? "border-blue-100 bg-gradient-to-br from-blue-50/80 to-white shadow-md ring-1 ring-inset ring-blue-100"
                    : kpi.tone === "emerald"
                    ? "border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white shadow-md ring-1 ring-inset ring-emerald-100"
                    : "border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white shadow-md ring-1 ring-inset ring-indigo-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
                    {kpi.title}
                  </span>
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      kpi.tone === "rose"
                        ? "bg-rose-100 text-rose-600 group-hover:bg-rose-200"
                        : kpi.tone === "blue"
                        ? "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                        : kpi.tone === "emerald"
                        ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                        : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className={`text-2xl font-semibold tracking-tight truncate ${kpi.tone === "rose" ? "text-rose-600" : kpi.tone === "blue" ? "text-blue-600" : kpi.tone === "emerald" ? "text-emerald-600" : "text-indigo-600"}`}>
                    {kpi.value}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100  pt-3">
                  <TrendBadge trend={kpi.trend} value={kpi.trendValue} />
                  <span className="text-[11px] text-slate-400 truncate flex-1 text-right" title={kpi.description}>
                    {kpi.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 2: Telemetry & Module Adoption Charts
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: Interactive Area Chart (2/3 width on xl+) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-inset ring-slate-50 xl:col-span-2 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900  truncate">
                  System Traffic & User Telemetry
                </h3>
                <p className="text-xs text-slate-500  line-clamp-2 sm:line-clamp-1">
                  Real-time active concurrency and API request volume across all connected modules
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50  px-2.5 py-1 text-xs font-semibold text-emerald-700  border border-emerald-200/60 ">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Stream
                </span>
                <span className="rounded-lg bg-slate-100  px-2.5 py-1 text-xs font-semibold text-slate-600 ">
                  {dateFilter}
                </span>
              </div>
            </div>

            <div className="mt-6 w-full overflow-hidden min-w-0">
              <ChartContainer config={telemetryChartConfig} className="h-72 sm:h-80 w-full">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-Active\ Users)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-Active\ Users)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-API\ Calls)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-API\ Calls)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(number: number) => Intl.NumberFormat("us").format(number)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="Active Users" stroke="var(--color-Active\ Users)" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="API Calls" stroke="var(--color-API\ Calls)" strokeWidth={2} fillOpacity={1} fill="url(#colorApi)" />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100  pt-4 text-xs text-slate-500 ">
            <span>Peak concurrency: 1,120 users (Thu 14:00 UTC)</span>
            <span className="flex items-center gap-1 text-indigo-600  font-medium cursor-pointer hover:underline shrink-0">
              View telemetry breakdown <ArrowUpRight className="h-3 w-3 shrink-0" />
            </span>
          </div>
        </div>

        {/* Right: Module Adoption Bar Chart (1/3 width on xl+) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-inset ring-slate-50 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <div className="mb-4 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900  truncate">
                Module Adoption Matrix
              </h3>
              <p className="text-xs text-slate-500  line-clamp-2 sm:line-clamp-1">
                Active employee seat distribution across ERP suites
              </p>
            </div>

            <div className="mt-8 w-full overflow-hidden min-w-0">
              <ChartContainer config={moduleChartConfig} className="h-72 sm:h-80 w-full">
                <RadialBarChart innerRadius="20%" outerRadius="100%" data={moduleData} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="Users" cornerRadius={10} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </RadialBarChart>
              </ChartContainer>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100  pt-4 text-xs text-slate-500 ">
            <span>Total assigned seats: 2,390</span>
            <span className="font-semibold text-slate-700 ">100% License Utilization</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 3: Governance, Audit Logs & System Health
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left 2 Cols: Interactive Audit & Security Logs Table */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-inset ring-slate-50 xl:col-span-2 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100  pb-4">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900  truncate">
                  Security Governance & Audit Trail
                </h3>
                <p className="text-xs text-slate-500  line-clamp-2 sm:line-clamp-1">
                  Real-time logging of authentication events, privilege escalations, and data modifications
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex flex-wrap sm:flex-nowrap rounded-lg bg-slate-100  p-1 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 sm:flex-initial justify-center flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === "security"
                      ? "bg-white  text-indigo-600  shadow-sm"
                      : "text-slate-600  hover:text-slate-900 "
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Security Alerts ({securityLogs.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("audit")}
                  className={`flex-1 sm:flex-initial justify-center flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === "audit"
                      ? "bg-white  text-indigo-600  shadow-sm"
                      : "text-slate-600  hover:text-slate-900 "
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Audit Logs ({auditLogs.length})</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
              {activeTab === "security" ? (
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200  text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pl-2">Severity</th>
                      <th className="pb-3">Event Description</th>
                      <th className="pb-3">Target User</th>
                      <th className="pb-3">Source IP</th>
                      <th className="pb-3 text-right pr-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 ">
                    {securityLogs.map((log) => (
                      <tr key={log.id} className="group hover:bg-slate-50  transition-colors">
                        <td className="py-3.5 pl-2">
                          <SeverityBadge type={log.type} />
                        </td>
                        <td className="py-3.5 font-medium text-slate-800 ">
                          {log.event}
                        </td>
                        <td className="py-3.5 text-slate-600  font-mono text-xs">
                          {log.user}
                        </td>
                        <td className="py-3.5 text-slate-500  font-mono text-xs">
                          {log.ip}
                        </td>
                        <td className="py-3.5 text-right pr-2 text-xs text-slate-400 whitespace-nowrap">
                          {log.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[550px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200  text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pl-2">Module</th>
                      <th className="pb-3">Action Performed</th>
                      <th className="pb-3">Actor Account</th>
                      <th className="pb-3 text-right pr-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 ">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="group hover:bg-slate-50  transition-colors">
                        <td className="py-3.5 pl-2">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-indigo-600  bg-indigo-50  px-2.5 py-1 rounded-md border border-indigo-100 ">
                            {log.module}
                          </span>
                        </td>
                        <td className="py-3.5 font-medium text-slate-800 ">
                          {log.action}
                        </td>
                        <td className="py-3.5 text-slate-600  font-mono text-xs">
                          {log.user}
                        </td>
                        <td className="py-3.5 text-right pr-2 text-xs text-slate-400 whitespace-nowrap">
                          {log.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100  pt-4 text-xs">
            <span className="text-slate-500 ">
              Showing top 4 recent {activeTab === "security" ? "security events" : "audit records"}
            </span>
            <button className="font-semibold text-indigo-600  hover:underline flex items-center gap-1 shrink-0">
              Open comprehensive audit explorer <ArrowUpRight className="h-3 w-3 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: User & Role Distribution Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-inset ring-slate-50 flex flex-col justify-between min-w-0">
          <div className="min-w-0">
            <div className="mb-4 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900  truncate">
                Role Privilege Distribution
              </h3>
              <p className="text-xs text-slate-500  line-clamp-2 sm:line-clamp-1">
                Breakdown of active users across permission tiers
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center w-full overflow-hidden min-w-0">
              <ChartContainer config={roleChartConfig} className="h-56 w-full">
                <PieChart>
                  <Pie data={roleData} dataKey="count" nameKey="name" innerRadius={60} strokeWidth={2} paddingAngle={2}>
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ChartContainer>
            </div>

            {/* Branch Progress Breakdown */}
            <div className="mt-8 space-y-5 border-t border-slate-100 pt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 ">
                Regional Hub Utilization
              </h4>
              <div className="space-y-3">
                {branchUsers.map((branch) => (
                  <div key={branch.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700  truncate pr-2">{branch.name}</span>
                      <span className="font-mono font-semibold text-slate-900  shrink-0">
                        {branch.users} ({branch.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 ">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${branch.percentage}%`, backgroundColor: branch.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100  pt-4 text-xs text-center">
            <span className="text-slate-500 ">Need to modify access matrix? </span>
            <a href="#effective-access" className="font-semibold text-indigo-600  hover:underline">
              Go to Effective Access
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 4: Quick Actions & System Health Matrix
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Quick Actions (2 Cols on xl+) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-inset ring-slate-50 xl:col-span-2 min-w-0 flex flex-col justify-between">
          <div className="mb-6 flex items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900  truncate">
                Administrative Quick Actions
              </h3>
              <p className="text-xs text-slate-500  line-clamp-2 sm:line-clamp-1">
                Direct shortcuts to frequently accessed governance and provisioning tasks
              </p>
            </div>
            <Settings className="h-5 w-5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="group relative flex flex-col items-start justify-between rounded-xl border border-slate-200  bg-slate-50/50  p-4 text-left transition-all hover:border-indigo-500/40 hover:bg-white  hover:shadow-sm min-w-0"
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white  shadow-sm border border-slate-200/60  group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 text-slate-700  transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    {action.badge && (
                      <span className="inline-flex items-center rounded-md bg-indigo-50  px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700  border border-indigo-100  shrink-0">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 min-w-0 w-full">
                    <h4 className="text-sm font-semibold text-slate-900  group-hover:text-indigo-600  transition-colors truncate">
                      {action.label}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500  line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Health & Pending Actions (1 Col) */}
        <div className="space-y-6 min-w-0">
          {/* Pending Actions Card */}
          <div className="rounded-xl border border-amber-200  bg-gradient-to-br from-amber-50/50 to-white   p-4 sm:p-6 shadow-sm min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="h-5 w-5 text-amber-600  shrink-0" />
                <h3 className="text-base font-semibold text-slate-900  truncate">
                  Pending Administrative Action
                </h3>
              </div>
              <span className="rounded-full bg-amber-100  px-2.5 py-0.5 text-xs font-semibold text-amber-800  shrink-0">
                20 items
              </span>
            </div>

            <div className="space-y-3">
              {pendingActions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200/80  bg-white  p-3 shadow-2xs hover:border-amber-400 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          item.severity === "high"
                            ? "bg-rose-500"
                            : item.severity === "medium"
                            ? "bg-amber-400"
                            : "bg-blue-400"
                        }`}
                      />
                      <h4 className="text-xs font-semibold text-slate-900  truncate">
                        {item.label}
                      </h4>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500  pl-4 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <button className="self-start sm:self-center shrink-0 rounded-lg bg-slate-100  px-2.5 py-1 text-xs font-semibold text-slate-700  hover:bg-indigo-600 hover:text-white transition-colors">
                    Resolve ({item.count})
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Health Status Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 ring-1 ring-inset ring-slate-50 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-base font-semibold text-slate-900  flex items-center gap-2 min-w-0">
                <Server className="h-4 w-4 text-indigo-600  shrink-0" />
                <span className="truncate">Infrastructure Health</span>
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600  shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                All Systems Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50  p-3 border border-slate-100  min-w-0">
                <span className="text-slate-400 block mb-1 truncate">Global Uptime</span>
                <span className="text-sm font-semibold text-slate-900  truncate block">99.989%</span>
              </div>
              <div className="rounded-lg bg-slate-50  p-3 border border-slate-100  min-w-0">
                <span className="text-slate-400 block mb-1 truncate">Database Sync</span>
                <span className="text-sm font-semibold text-emerald-600  truncate block">0.02s latency</span>
              </div>
              <div className="rounded-lg bg-slate-50  p-3 border border-slate-100  min-w-0">
                <span className="text-slate-400 block mb-1 truncate">Active Suites</span>
                <span className="text-sm font-semibold text-slate-900  truncate block">8 / 8 Online</span>
              </div>
              <div className="rounded-lg bg-slate-50  p-3 border border-slate-100  min-w-0">
                <span className="text-slate-400 block mb-1 truncate">Last Snapshot</span>
                <span className="text-sm font-semibold text-slate-900  truncate block">2 hrs ago (Encrypted)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenterDashboardPage;
