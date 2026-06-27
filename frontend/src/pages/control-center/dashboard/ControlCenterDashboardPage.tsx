import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
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
  MdCloudDone
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
  Cell
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
    <div className="page-content text-slate-800 font-sans min-h-full">
      {/* Top Area */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-1 text-sm text-slate-500 font-medium tracking-wide">
            Home / Admin / Control Center
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Control Center Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            System administration, security monitoring, organization overview, and access control
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search users or modules..." 
              className="h-10 rounded-full border border-slate-200 bg-white/60 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 backdrop-blur-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="h-10 rounded-full border border-slate-200 bg-white/60 px-4 text-sm text-slate-700 backdrop-blur-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm w-[150px]">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg">
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="hq">Headquarters</SelectItem>
              <SelectItem value="ny">NY Branch</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="h-10 rounded-full border border-slate-200 bg-white/60 px-4 text-sm text-slate-700 backdrop-blur-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm w-[130px]">
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg">
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/60 backdrop-blur-md hover:bg-slate-50 transition-colors shadow-sm">
            <MdRefresh className="h-5 w-5 text-slate-600" />
          </button>
          <button className="flex h-10 items-center gap-2 rounded-full border border-blue-600 bg-blue-600 px-4 hover:bg-blue-700 transition-colors text-white font-medium shadow-sm shadow-blue-200">
            <MdDownload className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Row 1 - KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Total Companies", value: "4", icon: MdOutlineCorporateFare, trend: "+1 this year", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Branches", value: "24", icon: MdOutlineCorporateFare, trend: "+3 this quarter", color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total Users", value: "1,248", icon: MdOutlineSupervisedUserCircle, trend: "+12% vs last month", color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active Users", value: "942", icon: MdOutlineVerifiedUser, trend: "75% engagement", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Software Modules", value: "8", icon: MdApps, trend: "All systems operational", color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Security Alerts", value: "3", icon: MdWarningAmber, trend: "Requires attention", color: "text-rose-600", bg: "bg-rose-50", alert: true },
        ].map((kpi, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl p-5 shadow-embossed shadow-embossed-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500">{kpi.label}</span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-800">{kpi.value}</div>
            <div className={`text-xs font-medium ${kpi.alert ? 'text-rose-500' : 'text-slate-400'}`}>{kpi.trend}</div>
          </div>
        ))}
      </div>

      {/* Row 2 - Analytics */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 rounded-2xl p-6 shadow-embossed">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">User Activity Trend</h2>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">
              {dateFilter}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-embossed">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Users by Module</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {moduleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
        <div className="rounded-2xl p-6 shadow-embossed flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MdOutlineSecurity className="h-5 w-5 text-blue-600" />
              Recent Security Logs
            </h2>
            <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="flex-1 space-y-3">
            {[
              { time: "10 mins ago", event: "Failed login attempt", user: "admin@ny.corp", type: "warning" },
              { time: "1 hour ago", event: "Role permissions changed", user: "System Admin", type: "info" },
              { time: "3 hours ago", event: "Multiple failed logins", user: "Unknown IP", type: "critical" },
              { time: "Yesterday", event: "New API key generated", user: "dev@hq.corp", type: "info" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-white/50 p-3 border border-slate-100 hover:bg-white transition-colors">
                <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${log.type === 'critical' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{log.event}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{log.user} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="rounded-2xl p-6 shadow-embossed flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MdOutlinePolicy className="h-5 w-5 text-indigo-600" />
              Recent Audit Logs
            </h2>
            <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="flex-1 space-y-3">
            {[
              { time: "2 mins ago", action: "Created new user account", module: "User Management" },
              { time: "15 mins ago", action: "Updated branch settings", module: "Organization" },
              { time: "2 hours ago", action: "Assigned Inventory module", module: "Access Control" },
              { time: "4 hours ago", action: "Modified financial year", module: "Finance" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-white/50 p-3 border border-slate-100 hover:bg-white transition-colors">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{log.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{log.module} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-6 shadow-embossed">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Create User", icon: MdPersonAdd, color: "text-blue-600", bg: "group-hover:bg-blue-50" },
              { label: "Add Branch", icon: MdDomainAdd, color: "text-indigo-600", bg: "group-hover:bg-indigo-50" },
              { label: "Assign Access", icon: MdVpnKey, color: "text-purple-600", bg: "group-hover:bg-purple-50" },
              { label: "Create Role", icon: MdOutlineVerifiedUser, color: "text-emerald-600", bg: "group-hover:bg-emerald-50" },
              { label: "Access Matrix", icon: MdApps, color: "text-cyan-600", bg: "group-hover:bg-cyan-50" },
              { label: "View Audit", icon: MdGavel, color: "text-slate-600", bg: "group-hover:bg-slate-50" },
            ].map((action, i) => (
              <button key={i} className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white/50 p-4 text-center transition-all hover:border-slate-200 hover:shadow-sm">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 transition-colors ${action.bg}`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-xs font-semibold text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4 - Admin Insights & System Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Branch-wise Distribution */}
        <div className="rounded-2xl p-6 shadow-embossed">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Branch Users</h2>
          <div className="space-y-4">
            {[
              { name: "Headquarters", users: 542, percentage: 65, color: "bg-blue-500" },
              { name: "NY Branch", users: 210, percentage: 25, color: "bg-indigo-400" },
              { name: "LA Branch", users: 84, percentage: 10, color: "bg-slate-300" },
            ].map((branch, i) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700 font-semibold">{branch.name}</span>
                  <span className="text-slate-500 font-medium">{branch.users}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
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
        <div className="rounded-2xl p-6 shadow-embossed">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Role Distribution</h2>
          <div className="space-y-3">
            {[
              { name: "Regular Users", count: 850 },
              { name: "Managers", count: 124 },
              { name: "System Admins", count: 12 },
              { name: "Auditors", count: 8 },
            ].map((role, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/50 p-3">
                <span className="text-sm font-semibold text-slate-700">{role.name}</span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                  {role.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks / Alerts */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 shadow-embossed">
          <h2 className="mb-4 text-lg font-bold text-slate-850">Pending Actions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-white p-3 shadow-sm">
              <span className="text-sm font-semibold text-rose-750">Locked Users</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">3</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-3 shadow-sm">
              <span className="text-sm font-semibold text-amber-750">Users w/o Roles</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">12</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-3 shadow-sm">
              <span className="text-sm font-semibold text-blue-750">Pending Approvals</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">5</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/80 to-white/80 p-6 shadow-embossed relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-200 opacity-20 blur-2xl"></div>
          <h2 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2 relative z-10">
            <MdCloudDone className="h-5 w-5 text-blue-500" />
            System Health
          </h2>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Status</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <MdCheckCircle className="h-4 w-4 text-emerald-500" /> Operational
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Uptime</p>
              <p className="text-sm font-bold text-slate-700">99.98%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Active Modules</p>
              <p className="text-sm font-bold text-slate-700">8 / 8</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Last Backup</p>
              <p className="text-sm font-bold text-slate-700">2 hrs ago</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between items-center relative z-10">
             <span className="text-xs text-slate-500 font-medium">DB Sync</span>
             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenterDashboardPage;

