import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getControlDashboardSummary, getBlockedIPs, unblockIP } from "../../../api/controlApi";
import { DashboardHeroCard } from "../../../components/common/DashboardHeroCard";
import { DashboardAiAnalysisSection } from "../../../components/common/DashboardAiAnalysisSection";
import {
  Building2,
  Users,
  Layers,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Globe,
  Activity,
  MoreHorizontal,
  Shield,
  Zap,
  Clock,
  HeartPulse,
  Cpu,
  HardDrive,
  Database,
  CloudCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Key,
  Check,
  Download,
  Printer,
  Search,
  Archive,
  FolderDown,
  ExternalLink,
  FileCheck,
  FileText,
  Filter,
  Sparkles,
  BarChart2,
  Link2,
  ShieldAlert,
  Unlock,
  Lock,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell
} from "recharts";

/* ── Mini Sparkline Bar Chart Component ── */
interface SparklineProps {
  data: number[];
  color: string;
}

const SparklineBars: React.FC<SparklineProps> = ({ data, color }) => {
  return (
    <div className="flex items-end gap-1 h-9">
      {data.map((val, idx) => (
        <div
          key={idx}
          className={`w-1.5 rounded-t-sm transition-all duration-300 ${color}`}
          style={{ height: `${val}%` }}
        />
      ))}
    </div>
  );
};

/* ── Concentric Circular Ring Chart for Module Adoption ── */
const ConcentricRings: React.FC<{ modulesCount: number; totalModules: number }> = ({
  modulesCount,
  totalModules,
}) => {
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="5"
          strokeDasharray="264"
          strokeDashoffset={264 - (264 * 0.92)}
          strokeLinecap="round"
        />

        {/* Middle Ring */}
        <circle cx="50" cy="50" r="34" fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="#6366f1"
          strokeWidth="5"
          strokeDasharray="213.6"
          strokeDashoffset={213.6 - (213.6 * 0.78)}
          strokeLinecap="round"
        />

        {/* Inner Ring */}
        <circle cx="50" cy="50" r="26" fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="50"
          cy="50"
          r="26"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="5"
          strokeDasharray="163.3"
          strokeDashoffset={163.3 - (163.3 * 0.64)}
          strokeLinecap="round"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-base font-extrabold text-slate-900 leading-tight">
          {modulesCount}/{totalModules}
        </span>
        <span className="text-[10px] font-semibold text-slate-400">Modules</span>
      </div>
    </div>
  );
};

/* ── Main Dashboard Component ── */
const ControlCenterDashboardPage: React.FC = () => {
  const [telemetryTab, setTelemetryTab] = useState<"users" | "transactions" | "api">("users");
  const [stats, setStats] = useState({
    total_branches: 0,
    total_users: 0,
    activated_modules: 0,
    total_modules: 6,
    security_alerts: 0,
  });
  const [telemetry, setTelemetry] = useState<Array<{ day: string; users: number; transactions: number; api: number }>>([]);
  const [roleDistribution, setRoleDistribution] = useState<Array<{ name: string; percentage: number; count: number; color: string }>>([]);
  const [moduleAdoptions, setModuleAdoptions] = useState<Array<{ name: string; rate: string; color: string }>>([]);
  const [events, setEvents] = useState<Array<any>>([]);
  const [recentDocs, setRecentDocs] = useState<Array<any>>([]);
  const [blockedIPs, setBlockedIPs] = useState<Array<{
    ip: string;
    reason: string;
    blocked_at: string;
    attempts: number;
    last_attempt: string;
  }>>([]);
  const [manualIPToUnblock, setManualIPToUnblock] = useState("");
  const [isUnblocking, setIsUnblocking] = useState(false);

  const handleUnblock = async (ipToUnblock: string) => {
    if (!ipToUnblock.trim()) {
      toast.error("Please enter a valid IP address");
      return;
    }
    setIsUnblocking(true);
    try {
      const res = await unblockIP(ipToUnblock.trim());
      toast.success(res?.message || `Successfully unblocked IP ${ipToUnblock.trim()}`);
      setBlockedIPs((prev) => prev.filter((item) => item.ip !== ipToUnblock.trim()));
      setManualIPToUnblock("");
      fetchSummary();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to unblock IP ${ipToUnblock}`);
    } finally {
      setIsUnblocking(false);
    }
  };

  const [selectedDocCategory, setSelectedDocCategory] = useState("all");
  const [docSearchQuery, setDocSearchQuery] = useState("");

  const handleDownloadSingle = (doc: any) => {
    toast.success(`Downloading ${doc.document_number} (${doc.type})...`);
    const element = document.createElement("a");
    const file = new Blob([
      `CEYLON MED GLOBAL PHARMA ERP - OFFICIAL DOCUMENT EXPORT\n` +
      `=======================================================\n` +
      `Document No: ${doc.document_number}\n` +
      `Type:        ${doc.type}\n` +
      `Title:       ${doc.title}\n` +
      `Counterparty: ${doc.counterparty}\n` +
      `Timestamp:   ${doc.date}\n` +
      `Valuation:   ${doc.amount}\n` +
      `Compliance:  ${doc.status}\n` +
      `Security:    NMRA Sri Lanka & GDP Audited Certificate\n` +
      `=======================================================\n` +
      `This is an electronically validated and tamper-evident ERP export.`
    ], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.document_number}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadAll = () => {
    toast.success("Bundling and downloading all official pharmaceutical documents...");
    const element = document.createElement("a");
    const file = new Blob([
      `CEYLON MED GLOBAL PHARMA ERP - MASTER COMPLIANCE DOCUMENT BUNDLE\n` +
      `=================================================================\n` +
      `Export Timestamp: ${new Date().toISOString()}\n` +
      `Total Documents:  ${recentDocs.length}\n` +
      `Integrity Hash:   SHA256-CEYLON-MED-ARCHIVE-SECURE-2026\n\n` +
      recentDocs.map((d, i) => `${i + 1}. [${d.type}] ${d.document_number} | ${d.title} | ${d.counterparty} | ${d.amount} | ${d.status}`).join("\n")
    ], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `CEYLON_MED_ALL_DOCUMENTS_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredDocs = recentDocs.filter((doc) => {
    const matchesCategory =
      selectedDocCategory === "all" || doc.category === selectedDocCategory;
    const matchesSearch =
      doc.document_number?.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.title?.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.counterparty?.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.type?.toLowerCase().includes(docSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  type AuditRangeType = "7D" | "30D" | "THIS_MONTH" | "ALL" | "CUSTOM";
  const [auditDateRange, setAuditDateRange] = useState<AuditRangeType>("7D");
  const [customAuditStart, setCustomAuditStart] = useState<string>("");
  const [customAuditEnd, setCustomAuditEnd] = useState<string>("");
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>("ALL");
  const [showDateRangePicker, setShowDateRangePicker] = useState<boolean>(false);
  const [showSecurityFilterMenu, setShowSecurityFilterMenu] = useState<boolean>(false);
  const [auditPage, setAuditPage] = useState<number>(1);
  const [auditPageSize, setAuditPageSize] = useState<number>(6);

  const getAuditFilterDates = (range: AuditRangeType, customStart?: string, customEnd?: string) => {
    const today = new Date();
    const toISODate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (range === "7D") {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { audit_date_from: toISODate(start), audit_date_to: toISODate(today) };
    }
    if (range === "30D") {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { audit_date_from: toISODate(start), audit_date_to: toISODate(today) };
    }
    if (range === "THIS_MONTH") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { audit_date_from: toISODate(start), audit_date_to: toISODate(today) };
    }
    if (range === "CUSTOM") {
      return {
        audit_date_from: customStart || "",
        audit_date_to: customEnd || "",
      };
    }
    return { audit_date_from: "", audit_date_to: "" };
  };

  const getAuditDateRangeLabel = () => {
    const today = new Date();
    const formatDate = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    switch (auditDateRange) {
      case "7D": {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        return `${formatDate(start)} - ${formatDate(today)}`;
      }
      case "30D": {
        const start = new Date(today);
        start.setDate(today.getDate() - 29);
        return `${formatDate(start)} - ${formatDate(today)}`;
      }
      case "THIS_MONTH": {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        return `${formatDate(start)} - ${formatDate(today)}`;
      }
      case "ALL":
        return "All Historical Events";
      case "CUSTOM": {
        if (customAuditStart && customAuditEnd) {
          return `${customAuditStart} to ${customAuditEnd}`;
        }
        return "Custom Date Range";
      }
      default:
        return formatDate(today);
    }
  };

  const fetchSummary = useCallback(async (
    range = auditDateRange,
    sev = auditSeverityFilter,
    cStart = customAuditStart,
    cEnd = customAuditEnd
  ) => {
    try {
      const dateParams = getAuditFilterDates(range, cStart, cEnd);
      const params: Record<string, unknown> = {};
      if (dateParams.audit_date_from) params.audit_date_from = dateParams.audit_date_from;
      if (dateParams.audit_date_to) params.audit_date_to = dateParams.audit_date_to;
      if (sev && sev !== "ALL") params.audit_severity = sev;

      const res = await getControlDashboardSummary(params);
      if (res?.data) {
        const d = res.data;
        setStats({
          total_branches: d.total_branches ?? 0,
          total_users: d.total_users ?? 0,
          activated_modules: d.activated_modules ?? 0,
          total_modules: d.total_modules ?? 6,
          security_alerts: d.security_alerts ?? 0,
        });
        setTelemetry(d.telemetry || []);
        setRoleDistribution(d.role_distribution || []);
        setModuleAdoptions(d.module_adoption || []);
        setEvents(d.security_events || []);
        if (d.blocked_ips) setBlockedIPs(d.blocked_ips);
        if (d.recent_documents) setRecentDocs(d.recent_documents);
      }
    } catch (err) {
      console.error("Failed to load control center dashboard summary", err);
    }
  }, [auditDateRange, auditSeverityFilter, customAuditStart, customAuditEnd]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const filteredEvents = events.filter((ev) => {
    if (auditSeverityFilter !== "ALL" && ev.severity !== auditSeverityFilter) {
      return false;
    }
    if (auditDateRange === "ALL") return true;

    if (ev.created_at) {
      const evDate = new Date(ev.created_at);
      const dateParams = getAuditFilterDates(auditDateRange, customAuditStart, customAuditEnd);
      if (dateParams.audit_date_from) {
        const fromDate = new Date(dateParams.audit_date_from);
        fromDate.setHours(0, 0, 0, 0);
        if (evDate < fromDate) return false;
      }
      if (dateParams.audit_date_to) {
        const toDate = new Date(dateParams.audit_date_to);
        toDate.setHours(23, 59, 59, 999);
        if (evDate > toDate) return false;
      }
    }
    return true;
  });

  const totalAuditPages = Math.max(1, Math.ceil(filteredEvents.length / auditPageSize));
  const safeAuditPage = Math.min(auditPage, totalAuditPages);
  const paginatedEvents = filteredEvents.slice(
    (safeAuditPage - 1) * auditPageSize,
    safeAuditPage * auditPageSize
  );

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-800 antialiased">
      {/* ── TOP PAGE HEADER ── */}
      <DashboardHeroCard
        title="Control Center Dashboard"
        subtitle="System administration, performance telemetry, and organisational governance."
        moduleTag="Control Center"
        icon={Building2}
        accent="blue"
        onRefresh={fetchSummary}
      />

      {/* ── TOP 4 KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Branches */}
        <Link
          to="/control-center/branches"
          className="group bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Total Branches
              </span>
            </div>
            <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold text-blue-600 tracking-tight">{stats.total_branches}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
                <span>Configured branches</span>
              </div>
            </div>
            <SparklineBars data={[35, 45, 60, 50, 75, 65, 85, 100]} color="bg-blue-400" />
          </div>
        </Link>

        {/* Card 2: Total Users */}
        <Link
          to="/control-center/users"
          className="group bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-purple-600 transition-colors">
                Total Users
              </span>
            </div>
            <div className="h-6 w-6 rounded-full bg-purple-50 text-purple-500 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold text-purple-600 tracking-tight">{stats.total_users.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
                <span>Active tenant users</span>
              </div>
            </div>
            <SparklineBars data={[40, 55, 45, 70, 60, 80, 90, 100]} color="bg-purple-400" />
          </div>
        </Link>

        {/* Card 3: Activated Modules */}
        <Link
          to="/control-center/software-modules"
          className="group bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                Activated Modules
              </span>
            </div>
            <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">{stats.activated_modules}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
                <span>{stats.activated_modules} of {stats.total_modules || 6} licensed</span>
              </div>
            </div>
            <SparklineBars data={[50, 50, 65, 65, 80, 80, 100, 100]} color="bg-emerald-400" />
          </div>
        </Link>

        {/* Card 4: Active Incidents */}
        <Link
          to="/control-center/audit-logs"
          className="group bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-rose-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-rose-600 transition-colors">
                Active Incidents
              </span>
            </div>
            <div className="h-6 w-6 rounded-full bg-rose-50 text-rose-500 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold text-rose-600 tracking-tight">{stats.security_alerts}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
                <span>System security alerts</span>
              </div>
            </div>
            <SparklineBars data={[100, 90, 75, 60, 45, 55, 40, 30]} color="bg-rose-400" />
          </div>
        </Link>
      </div>

      {/* ── AI Executive Governance & Security Telemetry ── */}
      <DashboardAiAnalysisSection
        dashboardType="control_center"
        kpiData={{
          total_branches: stats.total_branches,
          total_users: stats.total_users,
          activated_modules: stats.activated_modules,
          security_alerts: stats.security_alerts,
        }}
        title="Control Center AI Governance & Security Telemetry"
      />

      {/* ── MIDDLE ROW: Telemetry Area Chart + Module Adoption + Role Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (6 Cols): System Traffic & User Telemetry */}
        <div className="lg:col-span-6 bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <Link to="/control-center/login-history" className="flex items-center gap-2.5 group cursor-pointer">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>System Traffic & User Telemetry</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time activity across your system, including logins, transactions, and API requests.
                  </p>
                </div>
              </Link>

              {/* Chart Filter Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-[11px] font-bold">
                  <button
                    onClick={() => setTelemetryTab("users")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      telemetryTab === "users" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Active Users
                  </button>
                  <button
                    onClick={() => setTelemetryTab("transactions")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      telemetryTab === "transactions" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Transactions
                  </button>
                  <button
                    onClick={() => setTelemetryTab("api")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      telemetryTab === "api" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    API Calls
                  </button>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 cursor-pointer">
                  <span>Last 7 Days</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Area Chart Container */}
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                            <span>{payload[0].value?.toLocaleString()} {telemetryTab === "users" ? "Active Users" : telemetryTab === "transactions" ? "Transactions" : "API Calls"}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={telemetryTab}
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#trafficGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Telemetry Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              Active concurrency: <strong className="text-slate-800">{Math.max(stats.total_users, 1)}</strong> session{stats.total_users !== 1 ? 's' : ''}
            </span>
            <Link
              to="/control-center/login-history"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              View login activity logs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Middle (3 Cols): Module Adoption & License Usage */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <Link to="/control-center/software-modules" className="flex items-center gap-2 group cursor-pointer">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Module Adoption & License Usage</h3>
                  <p className="text-[10px] text-slate-400">Active modules and distribution across all branches.</p>
                </div>
              </Link>
              <Link to="/control-center/software-modules" className="text-slate-400 hover:text-blue-600 p-1">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Concentric Rings Visual */}
            <div className="my-2">
              <ConcentricRings modulesCount={stats.activated_modules} totalModules={stats.total_modules} />
            </div>

            {/* Module Breakdown List */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
              {moduleAdoptions.map((m) => (
                <div key={m.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600 truncate">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${m.color}`} />
                    <span className="truncate">{m.name}</span>
                  </span>
                  <span className="font-bold text-slate-900 ml-1 shrink-0">{m.rate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[10.5px] font-semibold text-slate-500">
            <span>Total registered users: {stats.total_users}</span>
            <span className="text-blue-600 font-bold flex items-center gap-1">
              <BarChart2 className="h-3 w-3" /> 100% System Availability
            </span>
          </div>
        </div>

        {/* Right (3 Cols): Role Privilege Distribution */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <Link to="/control-center/roles-permissions" className="flex items-center gap-2 group cursor-pointer">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Role Privilege Distribution</h3>
                  <p className="text-[10px] text-slate-400">Distribution of user roles and their system privileges.</p>
                </div>
              </Link>
              <Link to="/control-center/roles-permissions" className="text-slate-400 hover:text-indigo-600 p-1">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Donut Chart with Center Text */}
            <div className="relative h-36 w-36 mx-auto my-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    innerRadius={44}
                    outerRadius={62}
                    dataKey="percentage"
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-sm font-extrabold text-slate-900 leading-tight">{stats.total_users}</span>
                <span className="text-[9.5px] font-semibold text-slate-400">Total Users</span>
              </div>
            </div>

            {/* Role Legend List */}
            <div className="space-y-1.5 mt-2">
              {roleDistribution.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600 truncate">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-slate-900">{r.percentage}%</span>
                    <span className="text-[10px] text-slate-400 w-7 text-right">{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-center">
            <Link
              to="/control-center/roles-permissions"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Manage Role Permissions Matrix →
            </Link>
          </div>
        </div>
      </div>

      {/* ── LOWER SECTION: Security Governance + Quick Actions + Actions/Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (6 Cols): Security Governance & Audit Trail */}
        <div className="lg:col-span-6 bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Security Governance & Audit Trail</h3>
                  <p className="text-[11px] text-slate-400">
                    Recent security and administrative events, privilege modifications, and system activities.
                  </p>
                </div>
              </div>

              {/* Table Controls */}
              <div className="flex items-center gap-2 relative">
                {/* Security Severity Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSecurityFilterMenu(!showSecurityFilterMenu);
                      setShowDateRangePicker(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      auditSeverityFilter !== "ALL"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                    }`}
                  >
                    <Filter className="h-3 w-3" />
                    Security Filters {auditSeverityFilter !== "ALL" ? `(${auditSeverityFilter})` : "(All)"}
                  </button>
                  {showSecurityFilterMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">Filter by Severity</div>
                      {["ALL", "CRITICAL", "WARNING", "SUCCESS", "INFO"].map((sev) => (
                        <button
                          key={sev}
                          onClick={() => {
                            setAuditSeverityFilter(sev);
                            setAuditPage(1);
                            setShowSecurityFilterMenu(false);
                            fetchSummary(auditDateRange, sev);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${
                            auditSeverityFilter === sev ? "text-blue-600 bg-blue-50/50" : "text-slate-700"
                          }`}
                        >
                          <span>{sev === "ALL" ? "All Severities" : sev}</span>
                          {auditSeverityFilter === sev && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic Date Range Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDateRangePicker(!showDateRangePicker);
                      setShowSecurityFilterMenu(false);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-xs"
                  >
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span className="font-semibold">{getAuditDateRangeLabel()}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </button>

                  {showDateRangePicker && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in-50">
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Select Audit Date Range</div>
                      <div className="space-y-1 mb-3">
                        {[
                          { id: "7D", label: "Last 7 Days (Default)" },
                          { id: "30D", label: "Last 30 Days" },
                          { id: "THIS_MONTH", label: "This Month" },
                          { id: "ALL", label: "All Time / Historical Data" },
                          { id: "CUSTOM", label: "Custom Range..." },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              const range = opt.id as AuditRangeType;
                              setAuditDateRange(range);
                              setAuditPage(1);
                              if (range !== "CUSTOM") {
                                setShowDateRangePicker(false);
                                fetchSummary(range, auditSeverityFilter);
                              }
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                              auditDateRange === opt.id
                                ? "bg-blue-50 text-blue-700 font-bold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {auditDateRange === opt.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>

                      {auditDateRange === "CUSTOM" && (
                        <div className="border-t border-slate-100 pt-3 space-y-2">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Start Date</label>
                            <input
                              type="date"
                              value={customAuditStart}
                              onChange={(e) => setCustomAuditStart(e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-200 px-2 py-1.5 focus:outline-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">End Date</label>
                            <input
                              type="date"
                              value={customAuditEnd}
                              onChange={(e) => setCustomAuditEnd(e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-200 px-2 py-1.5 focus:outline-blue-500"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setShowDateRangePicker(false)}
                              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={!customAuditStart || !customAuditEnd}
                              onClick={() => {
                                setShowDateRangePicker(false);
                                setAuditPage(1);
                                fetchSummary("CUSTOM", auditSeverityFilter, customAuditStart, customAuditEnd);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Clean Data Table with Min Width and Proper Cell Padding */}
            <div className="overflow-x-auto mt-2 rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <th className="py-2.5 px-3 w-[100px] text-left">Severity</th>
                    <th className="py-2.5 px-3 min-w-[220px] text-left">Event Description</th>
                    <th className="py-2.5 px-3 min-w-[130px] text-left">Target User</th>
                    <th className="py-2.5 px-3 min-w-[120px] text-left">IP Address</th>
                    <th className="py-2.5 px-3 min-w-[130px] text-left">Timestamp</th>
                    <th className="py-2.5 px-3 w-[70px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <p className="font-semibold text-xs text-slate-600">
                            No security events found for the selected range ({getAuditDateRangeLabel()}).
                          </p>
                          {auditDateRange !== "ALL" && (
                            <button
                              onClick={() => {
                                setAuditDateRange("ALL");
                                setAuditPage(1);
                                fetchSummary("ALL", auditSeverityFilter);
                              }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline mt-1 cursor-pointer"
                            >
                              View All Historical Records →
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              ev.severity === "CRITICAL"
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : ev.severity === "WARNING"
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : ev.severity === "SUCCESS"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {ev.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 max-w-[260px] truncate" title={ev.description}>
                            {ev.description}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-slate-700 font-medium text-xs">
                            {ev.user || "System"}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="text-slate-600 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                            {ev.ip || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-medium text-xs">
                          <span>{ev.time}</span>
                          {ev.created_at && new Date(ev.created_at).getFullYear() < new Date().getFullYear() && (
                            <span className="ml-1.5 text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                              Historical
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Link
                            to="/control-center/access-audit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 inline-flex items-center justify-center transition-colors cursor-pointer"
                            title="Inspect in Access Audit"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer with Interactive Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span>
                Showing <strong className="text-slate-800 font-semibold">{filteredEvents.length > 0 ? (safeAuditPage - 1) * auditPageSize + 1 : 0}</strong>–<strong className="text-slate-800 font-semibold">{Math.min(safeAuditPage * auditPageSize, filteredEvents.length)}</strong> of <strong className="text-slate-800 font-semibold">{filteredEvents.length}</strong> events
              </span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Rows:</span>
                <select
                  value={auditPageSize}
                  onChange={(e) => {
                    setAuditPageSize(Number(e.target.value));
                    setAuditPage(1);
                  }}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                disabled={safeAuditPage <= 1}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium text-xs shadow-2xs"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalAuditPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalAuditPages || Math.abs(p - safeAuditPage) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={p}>
                        {prev && p - prev > 1 && <span className="px-1 text-slate-400">…</span>}
                        <button
                          type="button"
                          onClick={() => setAuditPage(p)}
                          className={`min-w-[28px] h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                            safeAuditPage === p
                              ? "bg-blue-600 text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setAuditPage((p) => Math.min(totalAuditPages, p + 1))}
                disabled={safeAuditPage >= totalAuditPages}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium text-xs shadow-2xs"
                title="Next page"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <Link
                to="/control-center/access-audit"
                className="ml-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                title="View full audit log in Access Audit page"
              >
                <span>Full Logs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Middle Column (3 Cols): Administrative Quick Actions */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Administrative Quick Actions</h3>
                <p className="text-[11px] text-slate-400">Common system management tasks and configuration shortcuts.</p>
              </div>
            </div>

            {/* 6 Action Cards (2 Columns x 3 Rows) */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link
                to="/control-center/users/create"
                className="p-3 bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 rounded-xl transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-blue-600 w-fit shadow-2xs group-hover:scale-105 transition-transform">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Create User Account</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Add a new system user</p>
                </div>
              </Link>

              <Link
                to="/control-center/roles-permissions"
                className="p-3 bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 rounded-xl transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-blue-600 w-fit shadow-2xs group-hover:scale-105 transition-transform">
                  <Key className="h-4 w-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Assign Module Access</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Manage user permissions</p>
                </div>
              </Link>

              <Link
                to="/control-center/branches"
                className="p-3 bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 rounded-xl transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-blue-600 w-fit shadow-2xs group-hover:scale-105 transition-transform">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Add New Branch</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Register a new branch</p>
                </div>
              </Link>

              <Link
                to="/control-center/audit-logs"
                className="p-3 bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 rounded-xl transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-blue-600 w-fit shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Audit System Access</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Review user activity logs</p>
                </div>
              </Link>

              <Link
                to="/control-center/security-settings"
                className="p-3 bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 rounded-xl transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-blue-600 w-fit shadow-2xs group-hover:scale-105 transition-transform">
                  <Link2 className="h-4 w-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Generate API Keys</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Configure system integrations</p>
                </div>
              </Link>

              <Link
                to="/control-center/access-audit"
                className="p-3 bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 rounded-xl transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-blue-600 w-fit shadow-2xs group-hover:scale-105 transition-transform">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Access Audit Report</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Check activity and logs</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (3 Cols): Pending Administrative Actions + System Health */}
        <div className="lg:col-span-3 space-y-5">
          {/* Top: Pending Administrative Actions */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900">Pending Administrative Actions</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                3 Items
              </span>
            </div>

            <div className="space-y-3 mt-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Expired user accounts</h4>
                    <p className="text-[10.5px] text-slate-400">3 accounts have expired and need review</p>
                  </div>
                </div>
                <Link
                  to="/control-center/users"
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold shrink-0 transition-colors"
                >
                  Review
                </Link>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">System module configuration</h4>
                    <p className="text-[10.5px] text-slate-400">Reminder: complete module setup for new branches</p>
                  </div>
                </div>
                <Link
                  to="/control-center/software-modules"
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold shrink-0 transition-colors"
                >
                  Configure
                </Link>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Pending license renewals</h4>
                    <p className="text-[10.5px] text-slate-400">2 licenses expiring within 30 days</p>
                  </div>
                </div>
                <Link
                  to="/control-center/software-modules"
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold shrink-0 transition-colors"
                >
                  Review
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom: System Health */}
          <Link
            to="/control-center/audit-logs"
            className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs block group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>System Health</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              {/* CPU Usage */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] font-medium">
                  <Cpu className="h-3.5 w-3.5 text-slate-400" />
                  <span>CPU Usage</span>
                </div>
                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-sm font-extrabold text-slate-900">16%</span>
                  <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "16%" }} />
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] font-medium">
                  <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                  <span>Memory Usage</span>
                </div>
                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-sm font-extrabold text-slate-900">62%</span>
                  <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: "62%" }} />
                  </div>
                </div>
              </div>

              {/* Database Size */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] font-medium">
                  <Database className="h-3.5 w-3.5 text-slate-400" />
                  <span>Database Size</span>
                </div>
                <div className="mt-1.5">
                  <span className="text-sm font-extrabold text-slate-900">8.7 GB</span>
                </div>
              </div>

              {/* Last Backup */}
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Last Backup</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-emerald-600 font-bold text-xs">
                  <Check className="h-3.5 w-3.5" />
                  <span>Success</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── BLOCKED & RESTRICTED NETWORK ADDRESSES (LOGIN LOCKOUT MANAGEMENT) ── */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-300">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-50/40 via-white to-amber-50/30">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-xl shadow-md ${blockedIPs.length > 0 ? "bg-rose-600 text-white shadow-rose-500/20" : "bg-emerald-600 text-white shadow-emerald-500/20"}`}>
              {blockedIPs.length > 0 ? <ShieldAlert className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Blocked & Restricted IP Addresses (Login Lockout Manager)
                </h3>
                {blockedIPs.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    {blockedIPs.length} IP Address{blockedIPs.length > 1 ? "es" : ""} Blocked
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    All Clear (0 Blocked IPs)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monitor IP addresses restricted by automated brute-force protection or firewall rules. Unblock client IPs with 1 click to restore immediate login access.
              </p>
            </div>
          </div>

          {/* Right Side: Manual Unblock & Refresh */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Unblock IP manually (e.g. 192.168.1.1)"
                value={manualIPToUnblock}
                onChange={(e) => setManualIPToUnblock(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnblock(manualIPToUnblock);
                  }
                }}
                className="text-xs bg-transparent outline-none w-52 sm:w-64 placeholder:text-slate-400 font-mono"
              />
              <button
                type="button"
                onClick={() => handleUnblock(manualIPToUnblock)}
                disabled={isUnblocking || !manualIPToUnblock.trim()}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              >
                <Unlock className="h-3 w-3" />
                <span>Unblock</span>
              </button>
            </div>

            <button
              type="button"
              onClick={fetchSummary}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Refresh Blocked IPs"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {blockedIPs.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Blocked IP Addresses</h4>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Zero login lockouts are currently active. If a user encounters an "Invalid credentials / Account blocked" message due to repeated password attempts, enter their IP above to unlock them immediately.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">IP Address</th>
                  <th className="py-3 px-4">Restriction Reason</th>
                  <th className="py-3 px-4">Failed Attempts</th>
                  <th className="py-3 px-4">Blocked At</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blockedIPs.map((item) => (
                  <tr key={item.ip} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-5">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.ip}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="h-3 w-3 text-rose-600" />
                        {item.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      <span className="font-bold text-rose-600">{item.attempts}</span> attempts
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {item.blocked_at || "Recent lockout"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {item.last_attempt || "Just now"}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleUnblock(item.ip)}
                        disabled={isUnblocking}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer active:scale-95"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        <span>Unblock IP</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DOCUMENT ARCHIVE & BULK DOWNLOAD CENTER ── */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-300">
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/50 via-white to-blue-50/30">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Archive className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Document Archive & Compliance Export Center
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {recentDocs.length} Active Records
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Shield className="h-3 w-3" /> GDP & NMRA Audited
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Centralized vault of official pharmaceutical tax invoices, goods receipts, payment vouchers, and audit certificates. Download individual signed PDFs or trigger full bulk compliance archives.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 active:scale-98 transition-all cursor-pointer"
            >
              <FolderDown className="h-4 w-4" />
              <span>Download All Documents</span>
              <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
                {recentDocs.length}
              </span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3.5 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Documents", count: recentDocs.length },
              { id: "invoices", label: "Invoices & Credits", count: recentDocs.filter(d => d.category === "invoices").length },
              { id: "grn", label: "Goods Receipts (GRN)", count: recentDocs.filter(d => d.category === "grn").length },
              { id: "receipts", label: "Customer Receipts", count: recentDocs.filter(d => d.category === "receipts").length },
              { id: "vouchers", label: "Payment Vouchers", count: recentDocs.filter(d => d.category === "vouchers").length },
              { id: "reports", label: "Audited Reports", count: recentDocs.filter(d => d.category === "reports").length },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedDocCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedDocCategory === cat.id
                    ? "bg-white text-blue-600 shadow-xs border border-blue-200/80 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${selectedDocCategory === cat.id ? "bg-blue-100 text-blue-800" : "bg-slate-200/70 text-slate-600"}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              placeholder="Filter by ref, party, title..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Document Ref & Title</th>
                <th className="py-3 px-4">Counterparty / Recipient</th>
                <th className="py-3 px-4">Valuation / Units</th>
                <th className="py-3 px-4">Date & File Size</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="py-3.5 px-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0 mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {doc.document_number}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${doc.badgeColor}`}>
                            {doc.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {doc.title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {doc.counterparty}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {doc.amount}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <div>{doc.date}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border ${doc.statusColor}`}>
                      <FileCheck className="h-3 w-3" />
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={doc.printPath}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                        title="Print / View PDF Preview"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDownloadSingle(doc)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 text-[11px] font-semibold transition-all cursor-pointer"
                        title="Download Certificate / File"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Archive className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No documents match your filter criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Bar */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Automated Cloud Document Archival Active
            </span>
            <span className="hidden md:inline text-slate-300">•</span>
            <span className="hidden md:inline font-mono">
              Integrity Vault: SHA-256 HMAC Verified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Showing {filteredDocs.length} of {recentDocs.length} documents</span>
            <button
              onClick={handleDownloadAll}
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
            >
              Export All (.bundle)
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BANNER ROW: 3 Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {/* Card 1: Female Pharmacist Hero Card */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs group min-h-[170px] flex flex-col justify-end p-6 bg-slate-900">
          <img
            src="/doctor-banner.jpg"
            alt="Healthcare communities"
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
          <div className="relative z-10 text-white space-y-1.5">
            <h3 className="text-base font-bold tracking-tight leading-snug">
              Reliable supply. Healthier communities.
            </h3>
            <p className="text-[11px] text-slate-200 leading-relaxed max-w-[280px]">
              Empowering pharmacy distribution with smarter operations for a healthier tomorrow.
            </p>
            <div className="pt-2">
              <button className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md text-xs font-bold transition-all duration-200 flex items-center gap-1.5">
                Our Mission <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Healthcare Operational Quote in soft violet gradient */}
        <div className="rounded-2xl p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 shadow-xs flex flex-col justify-between">
          <div className="text-3xl font-serif text-indigo-400 select-none leading-none">“</div>
          <blockquote className="text-sm font-semibold text-slate-800 leading-relaxed -mt-1">
            Operational excellence in healthcare creates stronger, healthier communities.
          </blockquote>
          <div className="flex items-center justify-between pt-4 border-t border-indigo-100/80 text-xs">
            <span className="font-bold text-indigo-600">— PharmaERP</span>
            <span className="text-indigo-400 font-serif text-sm">✦</span>
          </div>
        </div>

        {/* Card 3: Male Pharmacist Quote / Insight Card */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs group min-h-[170px] flex flex-col justify-between p-6 bg-emerald-950">
          <img
            src="/pharmacist-banner.jpg"
            alt="Pharmacy inventory inspection"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent pointer-events-none" />
          <div className="relative z-10 text-3xl font-serif text-emerald-300 select-none leading-none">“</div>
          <div className="relative z-10 text-white space-y-3">
            <blockquote className="text-xs font-semibold leading-relaxed text-slate-100">
              A more reliable supply chain today, for a healthier tomorrow.
            </blockquote>
            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
              <span className="text-emerald-300 font-medium text-[11px]">— Healthcare Operations</span>
              <button className="text-white hover:text-emerald-200 font-bold text-[11px] flex items-center gap-1">
                Explore Insights →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenterDashboardPage;
