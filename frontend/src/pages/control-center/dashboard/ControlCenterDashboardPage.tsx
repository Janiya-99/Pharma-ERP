import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getControlDashboardSummary } from "../../../api/controlApi";
import { DashboardHeroCard } from "../../../components/common/DashboardHeroCard";
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
  FileText,
  Link2,
  BarChart2,
  Check
} from "lucide-react";
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

  useEffect(() => {
    const fetchSummary = async () => {
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
    };
    fetchSummary();
  }, []);

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-800 antialiased">
      {/* ── TOP PAGE HEADER ── */}
      <DashboardHeroCard
        title="Control Center"
        subtitle="System administration, performance telemetry, and organisational governance."
        moduleTag="Enterprise Administration"
        icon={Building2}
        quote={{
          text: "Integrity in enterprise operations, excellence in healthcare delivery across Sri Lanka.",
          author: "Ceylon Med Global Governance"
        }}
        accent="blue"
      />

      {/* ── TOP 4 KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Branches */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Branches
              </span>
            </div>
            <Link
              to="/control-center/branches"
              className="h-6 w-6 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
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
        </div>

        {/* Card 2: Total Users */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Users
              </span>
            </div>
            <Link
              to="/control-center/users"
              className="h-6 w-6 rounded-full bg-purple-50 text-purple-500 hover:bg-purple-100 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
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
        </div>

        {/* Card 3: Activated Modules */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Activated Modules
              </span>
            </div>
            <Link
              to="/modules"
              className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-100 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
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
        </div>

        {/* Card 4: Active Incidents */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Incidents
              </span>
            </div>
            <div className="h-6 w-6 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center cursor-pointer transition-colors">
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
        </div>
      </div>

      {/* ── MIDDLE ROW: Telemetry Area Chart + Module Adoption + Role Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (6 Cols): System Traffic & User Telemetry */}
        <div className="lg:col-span-6 bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">System Traffic & User Telemetry</h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time activity across your system, including logins, transactions, and API requests.
                  </p>
                </div>
              </div>

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
              to="/control-center/analytics"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              View detailed analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Middle (3 Cols): Module Adoption & License Usage */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Module Adoption & License Usage</h3>
                  <p className="text-[10px] text-slate-400">Active modules and distribution across all branches.</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal className="h-4 w-4" />
              </button>
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
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Role Privilege Distribution</h3>
                  <p className="text-[10px] text-slate-400">Distribution of user roles and their system privileges.</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal className="h-4 w-4" />
              </button>
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
                to="/control-center/analytics"
                className="p-3 bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 rounded-xl transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200/60 text-blue-600 w-fit shadow-2xs group-hover:scale-105 transition-transform">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700">System Health Report</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">Check performance and logs</p>
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
                  to="/modules"
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
                  to="/control-center/subscriptions"
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold shrink-0 transition-colors"
                >
                  Review
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom: System Health */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900">System Health</h3>
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
