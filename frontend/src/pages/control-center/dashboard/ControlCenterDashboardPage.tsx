import { useState } from "react";
import { 
  PageShell, 
  PageHeader, 
  KPICard, 
  DashboardGrid, 
  SectionCard 
} from "@/components/erp";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  TrendingUp,
  Activity,
  HeartPulse,
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
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

const COLORS = ["#4f46e5", "#0ea5e9", "#1d4ed8", "#334155"];
const BAR_GRADIENTS = ["url(#barGrad0)", "url(#barGrad1)", "url(#barGrad2)", "url(#barGrad3)"];
const glassBlueBg = "bg-white border border-slate-100 shadow-sm rounded-xl transition-all duration-300 hover:shadow-md";

const ControlCenterDashboardPage = () => {
  const [dateFilter, setDateFilter] = useState("This Week");

  return (
    <PageShell className="relative">
      {/* Page Header */}
      <PageHeader
        title="Control Center Overview"
        description="System administration, security monitoring, organization overview, and access control"
        actions={
          <>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            {/* Branch Switcher Select */}
            <Select defaultValue="all">
              <SelectTrigger className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm w-[140px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-100 rounded-xl shadow-lg">
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="hq">Headquarters</SelectItem>
                <SelectItem value="ny">NY Branch</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter Select */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm w-[120px]">
                <SelectValue placeholder="This Week" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-100 rounded-xl shadow-lg">
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button variant="filter" size="icon" aria-label="Refresh Dashboard" className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Export Button */}
            <Button variant="export" size="sm" className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      {/* Row 1 - KPI Cards */}
      <DashboardGrid columns={4} className="lg:grid-cols-6">
        <KPICard
          title="Total Companies"
          value="4"
          icon={<Building2 className="h-5 w-5 text-indigo-600" />}
          trend="up"
          trendValue="+1 this year"
          className={glassBlueBg}
          iconBg="bg-indigo-50"
        />
        <KPICard
          title="Total Branches"
          value="24"
          icon={<Building2 className="h-5 w-5 text-sky-600" />}
          trend="up"
          trendValue="+3 this quarter"
          className={glassBlueBg}
          iconBg="bg-sky-50"
        />
        <KPICard
          title="Total Users"
          value="1,248"
          icon={<Users className="h-5 w-5 text-blue-700" />}
          trend="up"
          trendValue="+12% vs last month"
          className={glassBlueBg}
          iconBg="bg-blue-50"
        />
        <KPICard
          title="Active Users"
          value="942"
          icon={<UserCheck className="h-5 w-5 text-emerald-600" />}
          trend="neutral"
          trendValue="75% engagement"
          className={glassBlueBg}
          iconBg="bg-emerald-50"
        />
        <KPICard
          title="Software Modules"
          value="8"
          icon={<Blocks className="h-5 w-5 text-slate-700" />}
          trend="neutral"
          trendValue="All active"
          className={glassBlueBg}
          iconBg="bg-slate-100"
        />
        <KPICard
          title="Security Alerts"
          value="3"
          icon={<AlertTriangle className="h-5 w-5 text-rose-500" />}
          trend="down"
          trendValue="Needs attention"
          className="bg-rose-50/30 border border-rose-100 shadow-sm rounded-xl transition-all duration-300 hover:shadow-md"
          iconBg="bg-rose-50"
        />
      </DashboardGrid>

      {/* Row 2 - Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="User Activity Trend" actions={<span className="text-xs font-semibold text-slate-500">{dateFilter}</span>} className={`lg:col-span-2 ${glassBlueBg}`}>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="currentColor" className="text-slate-400" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-slate-400" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#f1f5f9', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 500 }}
                  labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="url(#lineGrad)" 
                  strokeWidth={2.5} 
                  fill="url(#colorUsers)" 
                  dot={{ r: 4, fill: '#ffffff', stroke: '#4f46e5', strokeWidth: 2 }} 
                  activeDot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Users by Module" className={glassBlueBg}>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGrad0" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                  <linearGradient id="barGrad1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <linearGradient id="barGrad2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="barGrad3" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="currentColor" className="text-slate-400" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="currentColor" className="text-slate-400" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 4 }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#f1f5f9', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ fontWeight: 500 }}
                  labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                  {moduleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_GRADIENTS[index % BAR_GRADIENTS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Row 3 - Operations & Security Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Security Logs */}
        <SectionCard 
          title="Recent Security Logs" 
          actions={<Button variant="link" size="xs" className="text-indigo-600 hover:text-indigo-700">View All</Button>}
          className={glassBlueBg}
        >
          <div className="space-y-3 pt-2">
            {[
              { time: "10 mins ago", event: "Failed login attempt", user: "admin@ny.corp", type: "warning" },
              { time: "1 hour ago", event: "Role permissions changed", user: "System Admin", type: "info" },
              { time: "3 hours ago", event: "Multiple failed logins", user: "Unknown IP", type: "critical" },
              { time: "Yesterday", event: "New API key generated", user: "dev@hq.corp", type: "info" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50/50 p-3 border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${log.type === 'critical' ? 'bg-rose-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{log.event}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{log.user} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Audit Logs */}
        <SectionCard 
          title="Recent Audit Logs" 
          actions={<Button variant="link" size="xs" className="text-indigo-600 hover:text-indigo-700">View All</Button>}
          className={glassBlueBg}
        >
          <div className="space-y-3 pt-2">
            {[
              { time: "2 mins ago", action: "Created new user account", module: "User Management" },
              { time: "15 mins ago", action: "Updated branch settings", module: "Organization" },
              { time: "2 hours ago", action: "Assigned Inventory module", module: "Access Control" },
              { time: "4 hours ago", action: "Modified financial year", module: "Finance" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50/50 p-3 border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{log.module} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Quick Actions */}
        <SectionCard title="Quick Actions" className={glassBlueBg}>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: "Create User", icon: Plus },
              { label: "Add Branch", icon: Plus },
              { label: "Assign Access", icon: ShieldAlert },
              { label: "Create Role", icon: UserCheck },
              { label: "User Access", icon: Activity },
              { label: "System Uptime", icon: HeartPulse },
            ].map((action, i) => (
              <button 
                key={i} 
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 text-center transition-all hover:bg-slate-50/50 hover:border-slate-200 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                  <action.icon className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-slate-600">{action.label}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Row 4 - System Distribution & Health */}
      <DashboardGrid columns={4}>
        <SectionCard title="Branch Users" className={glassBlueBg}>
          <div className="space-y-4 pt-2">
            {[
              { name: "Headquarters", users: 542, percentage: 65, color: "bg-indigo-600" },
              { name: "NY Branch", users: 210, percentage: 25, color: "bg-sky-600" },
              { name: "LA Branch", users: 84, percentage: 10, color: "bg-slate-700" },
            ].map((branch, i) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-800 font-semibold">{branch.name}</span>
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
        </SectionCard>

        <SectionCard title="Role Distribution" className={glassBlueBg}>
          <div className="space-y-3 pt-2">
            {[
              { name: "Regular Users", count: 850 },
              { name: "Managers", count: 124 },
              { name: "System Admins", count: 12 },
              { name: "Auditors", count: 8 },
            ].map((role, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-sm font-semibold text-slate-700">{role.name}</span>
                <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200 shadow-sm">
                  {role.count}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Pending Actions" className="bg-white border border-slate-100 shadow-sm rounded-xl transition-all duration-300 hover:shadow-md">
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/20 p-3">
              <span className="text-sm font-semibold text-slate-700">Locked Users</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">3</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/20 p-3">
              <span className="text-sm font-semibold text-slate-700">Users w/o Roles</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">12</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/20 p-3">
              <span className="text-sm font-semibold text-slate-700">Pending Approvals</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">5</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="System Health" className={`${glassBlueBg} relative overflow-hidden`}>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Status</p>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Uptime</p>
              <p className="text-sm font-semibold text-slate-800">99.98%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Active Modules</p>
              <p className="text-sm font-semibold text-slate-800">8 / 8</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Last Backup</p>
              <p className="text-sm font-semibold text-slate-800">2 hrs ago</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
             <span className="text-xs text-slate-500 font-medium">DB Sync</span>
             <span className="text-xs font-semibold text-emerald-600">Synced</span>
          </div>
        </SectionCard>
      </DashboardGrid>
    </PageShell>
  );
};

export default ControlCenterDashboardPage;
