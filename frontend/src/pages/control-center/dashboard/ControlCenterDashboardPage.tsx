import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  MdOutlineCorporateFare,
  MdOutlineSecurity,
  MdOutlineSupervisedUserCircle,
  MdOutlineVerifiedUser,
  MdApps,
  MdWarningAmber,
  MdSearch,
  MdRefresh,
  MdDownload,
  MdPersonAdd,
  MdDomainAdd,
  MdVpnKey,
  MdOutlinePolicy,
  MdGavel,
  MdCheckCircle,
  MdCloudDone,
} from "react-icons/md";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const activityData = [
  { name: "Mon", users: 120 },
  { name: "Tue", users: 200 },
  { name: "Wed", users: 150 },
  { name: "Thu", users: 280 },
  { name: "Fri", users: 250 },
  { name: "Sat", users: 90 },
  { name: "Sun", users: 60 },
];

const moduleData = [
  { name: "Inventory", value: 400 },
  { name: "Finance", value: 300 },
  { name: "HR", value: 300 },
  { name: "Compliance", value: 200 },
];

const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"];

const ControlCenterDashboardPage = () => {
  const [dateFilter, setDateFilter] = useState("This Week");

  return (
    <div className="page-content text-slate-800 min-h-full font-sans">
      {/* Top Area */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-slate-500 mb-1 text-sm font-medium tracking-wide">
            Home / Admin / Control Center
          </div>
          <h1 className="text-slate-900 text-3xl font-bold tracking-tight">
            Control Center Overview
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            System administration, security monitoring, organization overview,
            and access control
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MdSearch className="text-slate-400 absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users or modules..."
              className="border-slate-200 text-slate-700 placeholder-slate-400 h-10 rounded-full border bg-white/60 pl-10 pr-4 text-sm shadow-sm backdrop-blur-md transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="border-slate-200 text-slate-700 h-10 w-[150px] rounded-full border bg-white/60 px-4 text-sm shadow-sm backdrop-blur-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 rounded-xl border bg-white/90 shadow-lg backdrop-blur-md">
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="hq">Headquarters</SelectItem>
              <SelectItem value="ny">NY Branch</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="border-slate-200 text-slate-700 h-10 w-[130px] rounded-full border bg-white/60 px-4 text-sm shadow-sm backdrop-blur-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 rounded-xl border bg-white/90 shadow-lg backdrop-blur-md">
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <button className="border-slate-200 hover:bg-slate-50 flex h-10 w-10 items-center justify-center rounded-full border bg-white/60 shadow-sm backdrop-blur-md transition-colors">
            <MdRefresh className="text-slate-600 h-5 w-5" />
          </button>
          <button className="flex h-10 items-center gap-2 rounded-full border border-blue-600 bg-blue-600 px-4 font-medium text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700">
            <MdDownload className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Row 1 - KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Total Companies",
            value: "4",
            icon: MdOutlineCorporateFare,
            trend: "+1 this year",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Total Branches",
            value: "24",
            icon: MdOutlineCorporateFare,
            trend: "+3 this quarter",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Total Users",
            value: "1,248",
            icon: MdOutlineSupervisedUserCircle,
            trend: "+12% vs last month",
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Active Users",
            value: "942",
            icon: MdOutlineVerifiedUser,
            trend: "75% engagement",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Software Modules",
            value: "8",
            icon: MdApps,
            trend: "All systems operational",
            color: "text-cyan-600",
            bg: "bg-cyan-50",
          },
          {
            label: "Security Alerts",
            value: "3",
            icon: MdWarningAmber,
            trend: "Requires attention",
            color: "text-rose-600",
            bg: "bg-rose-50",
            alert: true,
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className="shadow-embossed shadow-embossed-hover relative overflow-hidden rounded-2xl p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-slate-500 text-sm font-semibold">
                {kpi.label}
              </span>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}
              >
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-slate-800 mb-1 text-3xl font-bold">
              {kpi.value}
            </div>
            <div
              className={`text-xs font-medium ${
                kpi.alert ? "text-rose-500" : "text-slate-400"
              }`}
            >
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 - Analytics */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="shadow-embossed col-span-1 rounded-2xl p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-slate-800 text-lg font-bold">
              User Activity Trend
            </h2>
            <div className="bg-slate-100 text-slate-600 border-slate-200 rounded-full border px-3 py-1 text-xs font-medium">
              {dateFilter}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityData}
                margin={{ top: 5, right: 20, bottom: 5, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "12px",
                    color: "#1e293b",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="shadow-embossed rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-slate-800 text-lg font-bold">
              Users by Module
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={moduleData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "12px",
                    color: "#1e293b",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {moduleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 - Operations */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Security Logs */}
        <div className="shadow-embossed flex flex-col rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-slate-800 flex items-center gap-2 text-lg font-bold">
              <MdOutlineSecurity className="h-5 w-5 text-blue-600" />
              Recent Security Logs
            </h2>
            <button className="text-xs font-medium text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div className="flex-1 space-y-3">
            {[
              {
                time: "10 mins ago",
                event: "Failed login attempt",
                user: "admin@ny.corp",
                type: "warning",
              },
              {
                time: "1 hour ago",
                event: "Role permissions changed",
                user: "System Admin",
                type: "info",
              },
              {
                time: "3 hours ago",
                event: "Multiple failed logins",
                user: "Unknown IP",
                type: "critical",
              },
              {
                time: "Yesterday",
                event: "New API key generated",
                user: "dev@hq.corp",
                type: "info",
              },
            ].map((log, i) => (
              <div
                key={i}
                className="border-slate-100 flex items-start gap-3 rounded-xl border bg-white/50 p-3 transition-colors hover:bg-white"
              >
                <div
                  className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                    log.type === "critical"
                      ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                      : log.type === "warning"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                />
                <div>
                  <p className="text-slate-700 text-sm font-semibold">
                    {log.event}
                  </p>
                  <p className="text-slate-500 mt-0.5 text-xs">
                    {log.user} • {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="shadow-embossed flex flex-col rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-slate-800 flex items-center gap-2 text-lg font-bold">
              <MdOutlinePolicy className="h-5 w-5 text-indigo-600" />
              Recent Audit Logs
            </h2>
            <button className="text-xs font-medium text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div className="flex-1 space-y-3">
            {[
              {
                time: "2 mins ago",
                action: "Created new user account",
                module: "User Management",
              },
              {
                time: "15 mins ago",
                action: "Updated branch settings",
                module: "Organization",
              },
              {
                time: "2 hours ago",
                action: "Assigned Inventory module",
                module: "Access Control",
              },
              {
                time: "4 hours ago",
                action: "Modified financial year",
                module: "Finance",
              },
            ].map((log, i) => (
              <div
                key={i}
                className="border-slate-100 flex items-start gap-3 rounded-xl border bg-white/50 p-3 transition-colors hover:bg-white"
              >
                <div className="bg-slate-300 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                <div>
                  <p className="text-slate-700 text-sm font-semibold">
                    {log.action}
                  </p>
                  <p className="text-slate-500 mt-0.5 text-xs">
                    {log.module} • {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="shadow-embossed rounded-2xl p-6">
          <h2 className="text-slate-800 mb-4 text-lg font-bold">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Create User",
                icon: MdPersonAdd,
                color: "text-blue-600",
                bg: "group-hover:bg-blue-50",
              },
              {
                label: "Add Branch",
                icon: MdDomainAdd,
                color: "text-indigo-600",
                bg: "group-hover:bg-indigo-50",
              },
              {
                label: "Assign Access",
                icon: MdVpnKey,
                color: "text-purple-600",
                bg: "group-hover:bg-purple-50",
              },
              {
                label: "Create Role",
                icon: MdOutlineVerifiedUser,
                color: "text-emerald-600",
                bg: "group-hover:bg-emerald-50",
              },
              {
                label: "User Access",
                icon: MdApps,
                color: "text-cyan-600",
                bg: "group-hover:bg-cyan-50",
              },
              {
                label: "View Audit",
                icon: MdGavel,
                color: "text-slate-600",
                bg: "group-hover:bg-slate-50",
              },
            ].map((action, i) => (
              <button
                key={i}
                className="border-slate-100 hover:border-slate-200 group flex flex-col items-center justify-center gap-2 rounded-xl border bg-white/50 p-4 text-center transition-all hover:shadow-sm"
              >
                <div
                  className={`bg-slate-50 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${action.bg}`}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-slate-700 text-xs font-semibold">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4 - Admin Insights & System Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Branch-wise Distribution */}
        <div className="shadow-embossed rounded-2xl p-6">
          <h2 className="text-slate-800 mb-4 text-lg font-bold">
            Branch Users
          </h2>
          <div className="space-y-4">
            {[
              {
                name: "Headquarters",
                users: 542,
                percentage: 65,
                color: "bg-blue-500",
              },
              {
                name: "NY Branch",
                users: 210,
                percentage: 25,
                color: "bg-indigo-400",
              },
              {
                name: "LA Branch",
                users: 84,
                percentage: 10,
                color: "bg-slate-300",
              },
            ].map((branch, i) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700 font-semibold">
                    {branch.name}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {branch.users}
                  </span>
                </div>
                <div className="bg-slate-100 h-2 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${branch.color}`}
                    style={{ width: `${branch.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="shadow-embossed rounded-2xl p-6">
          <h2 className="text-slate-800 mb-4 text-lg font-bold">
            Role Distribution
          </h2>
          <div className="space-y-3">
            {[
              { name: "Regular Users", count: 850 },
              { name: "Managers", count: 124 },
              { name: "System Admins", count: 12 },
              { name: "Auditors", count: 8 },
            ].map((role, i) => (
              <div
                key={i}
                className="border-slate-100 flex items-center justify-between rounded-lg border bg-white/50 p-3"
              >
                <span className="text-slate-700 text-sm font-semibold">
                  {role.name}
                </span>
                <span className="bg-slate-100 text-slate-600 border-slate-200 rounded-md border px-2 py-1 text-xs font-bold">
                  {role.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks / Alerts */}
        <div className="border-rose-100 bg-rose-50/50 shadow-embossed rounded-2xl border p-6">
          <h2 className="text-slate-850 mb-4 text-lg font-bold">
            Pending Actions
          </h2>
          <div className="space-y-3">
            <div className="border-rose-200 flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
              <span className="text-rose-750 text-sm font-semibold">
                Locked Users
              </span>
              <span className="bg-rose-100 text-rose-700 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                3
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-3 shadow-sm">
              <span className="text-amber-750 text-sm font-semibold">
                Users w/o Roles
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                12
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-3 shadow-sm">
              <span className="text-blue-750 text-sm font-semibold">
                Pending Approvals
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                5
              </span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="shadow-embossed relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/80 to-white/80 p-6">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-200 opacity-20 blur-2xl"></div>
          <h2 className="text-slate-900 relative z-10 mb-4 flex items-center gap-2 text-lg font-bold">
            <MdCloudDone className="h-5 w-5 text-blue-500" />
            System Health
          </h2>
          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-500 mb-1 text-xs font-medium">Status</p>
              <div className="text-slate-700 flex items-center gap-1.5 text-sm font-bold">
                <MdCheckCircle className="text-emerald-500 h-4 w-4" />{" "}
                Operational
              </div>
            </div>
            <div>
              <p className="text-slate-500 mb-1 text-xs font-medium">Uptime</p>
              <p className="text-slate-700 text-sm font-bold">99.98%</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1 text-xs font-medium">
                Active Modules
              </p>
              <p className="text-slate-700 text-sm font-bold">8 / 8</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1 text-xs font-medium">
                Last Backup
              </p>
              <p className="text-slate-700 text-sm font-bold">2 hrs ago</p>
            </div>
          </div>
          <div className="border-slate-200 relative z-10 mt-5 flex items-center justify-between border-t pt-4">
            <span className="text-slate-500 text-xs font-medium">DB Sync</span>
            <span className="text-emerald-600 bg-emerald-50 rounded px-2 py-0.5 text-xs font-bold">
              Synced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenterDashboardPage;
