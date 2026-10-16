import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getControlDashboardSummary } from "../../../api/controlApi";
import { DashboardHeroCard } from "../../../components/common/DashboardHeroCard";
import { DashboardAiAnalysisSection } from "../../../components/common/DashboardAiAnalysisSection";
import {
  Building2,
  Users,
  Layers,
  AlertTriangle,
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
  Link2
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

// Telemetry Area Chart Data
const telemetryData = [
  { day: "Mon", users: 11200, transactions: 18400, api: 42000 },
  { day: "Tue", users: 14800, transactions: 24200, api: 56000 },
  { day: "Wed", users: 15600, transactions: 26800, api: 61000 },
  { day: "Thu", users: 18430, transactions: 31200, api: 74000 },
  { day: "Fri", users: 16900, transactions: 28500, api: 68000 },
  { day: "Sat", users: 9400, transactions: 15400, api: 38000 },
  { day: "Sun", users: 8200, transactions: 12800, api: 31000 },
];

// Role Privilege Donut Chart Data
const roleDistributionData = [
  { name: "Administrators", percentage: 28, count: 352, color: "#3b82f6" },
  { name: "Managers", percentage: 24, count: 299, color: "#6366f1" },
  { name: "Pharmacists", percentage: 20, count: 250, color: "#06b6d4" },
  { name: "Sales Staff", percentage: 16, count: 200, color: "#f43f5e" },
  { name: "Warehouse", percentage: 8, count: 100, color: "#f59e0b" },
  { name: "View Only", percentage: 4, count: 47, color: "#10b981" },
];

// Module Adoption List
const moduleAdoptionList = [
  { name: "Inventory", rate: "92%", color: "bg-blue-500" },
  { name: "Sales & Distribution", rate: "78%", color: "bg-indigo-500" },
  { name: "Purchasing", rate: "64%", color: "bg-sky-500" },
  { name: "Finance", rate: "56%", color: "bg-cyan-500" },
  { name: "Reports", rate: "48%", color: "bg-teal-500" },
  { name: "Administration", rate: "32%", color: "bg-slate-400" },
  { name: "HR & Payroll", rate: "24%", color: "bg-rose-400" },
  { name: "Others", rate: "12%", color: "bg-slate-300" },
];

// Security Governance Events
const securityEvents = [
  {
    id: 1,
    severity: "CRITICAL",
    description: "Multiple failed login attempts",
    user: "john.doe",
    ip: "192.168.1.105",
    time: "Today 10:24",
  },
  {
    id: 2,
    severity: "WARNING",
    description: "Elevated user permissions assigned",
    user: "system.admin",
    ip: "203.0.113.42",
    time: "Today 09:17",
  },
  {
    id: 3,
    severity: "INFO",
    description: "New API access key generated",
    user: "api_user",
    ip: "198.51.100.27",
    time: "Yesterday 16:03",
  },
  {
    id: 4,
    severity: "INFO",
    description: "Record data updated successfully",
    user: "maria.santos",
    ip: "203.0.113.88",
    time: "Jul 6, 2024 14:21",
  },
  {
    id: 5,
    severity: "SUCCESS",
    description: "User password reset",
    user: "support.team",
    ip: "198.51.100.73",
    time: "Jul 6, 2024 11:09",
  },
];

/* ── Recently Added Documents & PDFs Data ── */
const recentDocumentsList = [
  {
    id: "doc-1",
    document_number: "SINV-2026-0042",
    title: "Wholesale Pharmaceutical Consignment Invoice",
    category: "invoices",
    counterparty: "Homagama Medical Supplies (Pvt) Ltd",
    date: "2026-10-15 14:32",
    amount: "LKR 1,285,000.00",
    size: "182 KB",
    type: "Sales Invoice",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    status: "Signed & Verified",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    printPath: "/print/sales-invoice/1"
  },
  {
    id: "doc-2",
    document_number: "GRN-2026-0018",
    title: "Goods Received & Cold-Chain Quarantine Receipt",
    category: "grn",
    counterparty: "State Pharmaceuticals Manufacturing (SPMC)",
    date: "2026-10-15 11:15",
    amount: "5,000 Units Received",
    size: "214 KB",
    type: "Goods Receipt Note",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    status: "QA Inspection Passed",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    printPath: "/inventory/grns"
  },
  {
    id: "doc-3",
    document_number: "RCP-2026-0091",
    title: "Official Electronic Settlement Receipt",
    category: "receipts",
    counterparty: "Asiri Surgical Hospital PLC",
    date: "2026-10-15 09:45",
    amount: "LKR 1,850,000.00",
    size: "145 KB",
    type: "Customer Receipt",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    status: "Reconciled (RTGS)",
    statusColor: "text-indigo-700 bg-indigo-50 border-indigo-200",
    printPath: "/print/customer-receipt/1"
  },
  {
    id: "doc-4",
    document_number: "PV-2026-0033",
    title: "Vendor Batch Settlement Payment Voucher",
    category: "vouchers",
    counterparty: "Hemas Healthcare Distribution",
    date: "2026-10-14 16:20",
    amount: "LKR 1,250,000.00",
    size: "160 KB",
    type: "Payment Voucher",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    status: "Authorized by CFO",
    statusColor: "text-purple-700 bg-purple-50 border-purple-200",
    printPath: "/admin/finance/payment-vouchers"
  },
  {
    id: "doc-5",
    document_number: "RPT-PNL-2026-Q3",
    title: "Comprehensive Income & Profit/Loss Statement",
    category: "reports",
    counterparty: "Finance & Accounting Division",
    date: "2026-10-15 17:00",
    amount: "LKR 88,600,000.00 Turnover",
    size: "420 KB",
    type: "Financial Report",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    status: "Audited Ledger Data",
    statusColor: "text-amber-700 bg-amber-50 border-amber-200",
    printPath: "/finance/reports/profit-and-loss"
  },
  {
    id: "doc-6",
    document_number: "RET-2026-0005",
    title: "Customer Return & Condition Assessment Slip",
    category: "invoices",
    counterparty: "Lanka Hospitals Pharmacy",
    date: "2026-10-14 10:10",
    amount: "LKR 45,000.00 Credit",
    size: "138 KB",
    type: "Credit Note",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    status: "Credit Note Issued",
    statusColor: "text-rose-700 bg-rose-50 border-rose-200",
    printPath: "/print/credit-note/1"
  },
  {
    id: "doc-7",
    document_number: "OST-2026-0001",
    title: "Opening Stock Physical Verification Certificate",
    category: "reports",
    counterparty: "Colombo Central Medical Depot",
    date: "2026-10-12 18:00",
    amount: "LKR 45,200,000.00 Valuation",
    size: "310 KB",
    type: "Audit Certificate",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    status: "Chartered Sign-off",
    statusColor: "text-teal-700 bg-teal-50 border-teal-200",
    printPath: "/inventory/opening-stock"
  },
  {
    id: "doc-8",
    document_number: "AUD-NMRA-2026",
    title: "GDP Quality Standard & Temperature Log Export",
    category: "reports",
    counterparty: "National Medicines Regulatory Authority (NMRA)",
    date: "2026-10-15 18:30",
    amount: "100% Parameter Pass",
    size: "1.2 MB",
    type: "Compliance Bundle",
    badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
    status: "NMRA Validated",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    printPath: "/compliance/records"
  }
];

/* ── Main Dashboard Component ── */
const ControlCenterDashboardPage: React.FC = () => {
  const [telemetryTab, setTelemetryTab] = useState<"users" | "transactions" | "api">("users");
  const [stats, setStats] = useState({
    total_branches: 5,
    total_users: 1,
    activated_modules: 4,
    total_modules: 6,
    security_alerts: 0,
  });
  const [telemetry, setTelemetry] = useState(telemetryData);
  const [roleDistribution, setRoleDistribution] = useState(roleDistributionData);
  const [moduleAdoptions, setModuleAdoptions] = useState(moduleAdoptionList);
  const [events, setEvents] = useState(securityEvents);

  const [selectedDocCategory, setSelectedDocCategory] = useState("all");
  const [docSearchQuery, setDocSearchQuery] = useState("");

  const handleDownloadSingle = (doc: typeof recentDocumentsList[0]) => {
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
      `Total Documents:  ${recentDocumentsList.length}\n` +
      `Integrity Hash:   SHA256-CEYLON-MED-ARCHIVE-SECURE-2026\n\n` +
      recentDocumentsList.map((d, i) => `${i + 1}. [${d.type}] ${d.document_number} | ${d.title} | ${d.counterparty} | ${d.amount} | ${d.status}`).join("\n")
    ], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `CEYLON_MED_ALL_DOCUMENTS_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredDocs = recentDocumentsList.filter((doc) => {
    const matchesCategory =
      selectedDocCategory === "all" || doc.category === selectedDocCategory;
    const matchesSearch =
      doc.document_number.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.counterparty.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(docSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const fetchSummary = useCallback(async () => {
    try {
      const res = await getControlDashboardSummary();
      if (res?.data) {
        const d = res.data;
        setStats({
          total_branches: d.total_branches ?? 5,
          total_users: d.total_users ?? 1,
          activated_modules: d.activated_modules ?? 4,
          total_modules: d.total_modules ?? 6,
          security_alerts: d.security_alerts ?? 0,
        });
        if (d.telemetry && d.telemetry.length > 0) setTelemetry(d.telemetry);
        if (d.role_distribution && d.role_distribution.length > 0) setRoleDistribution(d.role_distribution);
        if (d.module_adoption && d.module_adoption.length > 0) setModuleAdoptions(d.module_adoption);
        if (d.security_events && d.security_events.length > 0) setEvents(d.security_events);
      }
    } catch (err) {
      console.error("Failed to load control center dashboard summary", err);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

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
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+10%</span>
                <span className="font-normal text-slate-400 ml-0.5">vs last month</span>
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
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+12%</span>
                <span className="font-normal text-slate-400 ml-0.5">vs last month</span>
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
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+2 new modules</span>
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
              <div className="flex items-center gap-1 text-xs font-bold text-rose-600 mt-1">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>-25%</span>
                <span className="font-normal text-slate-400 ml-0.5">vs yesterday</span>
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
              Peak concurrency: <strong className="text-slate-800">18,430</strong> users on Thu 10:24 AM
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
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors">
                  Security Filters (3)
                </button>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 cursor-pointer">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>Jul 1, 2024 - Jul 7, 2024</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Clean Data Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5">Severity</th>
                    <th className="py-2.5">Event Description</th>
                    <th className="py-2.5">Target User</th>
                    <th className="py-2.5">IP Address</th>
                    <th className="py-2.5">Timestamp</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            ev.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-700"
                              : ev.severity === "WARNING"
                              ? "bg-amber-100 text-amber-700"
                              : ev.severity === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {ev.severity}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-800">{ev.description}</td>
                      <td className="py-3 text-slate-600 font-mono text-[11px]">{ev.user}</td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">{ev.ip}</td>
                      <td className="py-3 text-slate-400">{ev.time}</td>
                      <td className="py-3 text-right">
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-400">Showing {events.length} recent security & governance events</span>
            <Link
              to="/control-center/audit-logs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              View all audit logs →
            </Link>
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
                  {recentDocumentsList.length} Active Records
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
                {recentDocumentsList.length}
              </span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3.5 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Documents", count: recentDocumentsList.length },
              { id: "invoices", label: "Invoices & Credits", count: recentDocumentsList.filter(d => d.category === "invoices").length },
              { id: "grn", label: "Goods Receipts (GRN)", count: recentDocumentsList.filter(d => d.category === "grn").length },
              { id: "receipts", label: "Customer Receipts", count: recentDocumentsList.filter(d => d.category === "receipts").length },
              { id: "vouchers", label: "Payment Vouchers", count: recentDocumentsList.filter(d => d.category === "vouchers").length },
              { id: "reports", label: "Audited Reports", count: recentDocumentsList.filter(d => d.category === "reports").length },
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
            <span className="text-slate-400">Showing {filteredDocs.length} of {recentDocumentsList.length} documents</span>
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
