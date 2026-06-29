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

const COLORS = ["#0077B6", "#005F95", "#023E8A", "#002137"];

const ControlCenterDashboardPage = () => {
  const [dateFilter, setDateFilter] = useState("This Week");

  return (
    <PageShell>
      {/* Page Header */}
      <PageHeader
        title="Control Center Overview"
        description="System administration, security monitoring, organization overview, and access control"
        actions={
          <>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="h-9 rounded-xl border border-slate-300 bg-background pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0077B6]/20 transition-all shadow-sm"
              />
            </div>

            {/* Branch Switcher Select */}
            <Select defaultValue="all">
              <SelectTrigger className="h-9 rounded-xl border border-slate-300 bg-background px-4 text-sm text-foreground focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0077B6]/20 shadow-sm w-[140px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-slate-200/80 rounded-xl shadow-lg">
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="hq">Headquarters</SelectItem>
                <SelectItem value="ny">NY Branch</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter Select */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9 rounded-xl border border-slate-300 bg-background px-4 text-sm text-foreground focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0077B6]/20 shadow-sm w-[120px]">
                <SelectValue placeholder="This Week" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-slate-200/80 rounded-xl shadow-lg">
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button variant="filter" size="icon" aria-label="Refresh Dashboard">
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Export Button */}
            <Button variant="export" size="sm">
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
          icon={<Building2 className="h-5 w-5 text-[#0077B6]" />}
          trend="up"
          trendValue="+1 this year"
        />
        <KPICard
          title="Total Branches"
          value="24"
          icon={<Building2 className="h-5 w-5 text-[#0096C7]" />}
          trend="up"
          trendValue="+3 this quarter"
        />
        <KPICard
          title="Total Users"
          value="1,248"
          icon={<Users className="h-5 w-5 text-[#005F95]" />}
          trend="up"
          trendValue="+12% vs last month"
        />
        <KPICard
          title="Active Users"
          value="942"
          icon={<UserCheck className="h-5 w-5 text-green-500" />}
          trend="neutral"
          trendValue="75% engagement"
        />
        <KPICard
          title="Software Modules"
          value="8"
          icon={<Blocks className="h-5 w-5 text-[#002137]" />}
          trend="neutral"
          trendValue="All active"
        />
        <KPICard
          title="Security Alerts"
          value="3"
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          trend="down"
          trendValue="Needs attention"
          className="border-red-200/50 dark:border-red-900/30"
          iconBg="bg-red-50 dark:bg-red-950/20"
        />
      </DashboardGrid>

      {/* Row 2 - Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="User Activity Trend" actions={<span className="text-xs font-semibold text-muted-foreground">{dateFilter}</span>} className="lg:col-span-2">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/30" vertical={false} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                  itemStyle={{ color: '#0077B6' }}
                />
                <Line type="monotone" dataKey="users" stroke="#0077B6" strokeWidth={3} dot={{ r: 4, fill: '#ffffff', stroke: '#0077B6', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#0077B6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Users by Module">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/30" horizontal={false} />
                <XAxis type="number" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'var(--muted)'}}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {moduleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          actions={<Button variant="link" size="xs">View All</Button>}
        >
          <div className="space-y-3 pt-2">
            {[
              { time: "10 mins ago", event: "Failed login attempt", user: "admin@ny.corp", type: "warning" },
              { time: "1 hour ago", event: "Role permissions changed", user: "System Admin", type: "info" },
              { time: "3 hours ago", event: "Multiple failed logins", user: "Unknown IP", type: "critical" },
              { time: "Yesterday", event: "New API key generated", user: "dev@hq.corp", type: "info" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/20 p-3 border border-slate-200/80 hover:bg-muted/40 transition-colors">
                <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${log.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : log.type === 'warning' ? 'bg-amber-500' : 'bg-[#0077B6]'}`} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{log.event}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.user} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Audit Logs */}
        <SectionCard 
          title="Recent Audit Logs" 
          actions={<Button variant="link" size="xs">View All</Button>}
        >
          <div className="space-y-3 pt-2">
            {[
              { time: "2 mins ago", action: "Created new user account", module: "User Management" },
              { time: "15 mins ago", action: "Updated branch settings", module: "Organization" },
              { time: "2 hours ago", action: "Assigned Inventory module", module: "Access Control" },
              { time: "4 hours ago", action: "Modified financial year", module: "Finance" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/20 p-3 border border-slate-200/80 hover:bg-muted/40 transition-colors">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.module} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Quick Actions */}
        <SectionCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: "Create User", icon: Plus, variant: "default" },
              { label: "Add Branch", icon: Plus, variant: "secondary" },
              { label: "Assign Access", icon: ShieldAlert, variant: "outline" },
              { label: "Create Role", icon: UserCheck, variant: "edit" },
              { label: "User Access", icon: Activity, variant: "view" },
              { label: "System Uptime", icon: HeartPulse, variant: "print" },
            ].map((action, i) => (
              <button 
                key={i} 
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-card/45 p-4 text-center transition-all hover:bg-muted/20 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:bg-card transition-colors">
                  <action.icon className="h-4.5 w-4.5 text-erp-primary" />
                </div>
                <span className="text-xs font-semibold text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Row 4 - System Distribution & Health */}
      <DashboardGrid columns={4}>
        <SectionCard title="Branch Users">
          <div className="space-y-4 pt-2">
            {[
              { name: "Headquarters", users: 542, percentage: 65, color: "bg-[#0077B6]" },
              { name: "NY Branch", users: 210, percentage: 25, color: "bg-[#005F95]" },
              { name: "LA Branch", users: 84, percentage: 10, color: "bg-[#002137]" },
            ].map((branch, i) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-foreground font-semibold">{branch.name}</span>
                  <span className="text-muted-foreground font-medium">{branch.users}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div 
                    className={`h-full rounded-full ${branch.color}`} 
                    style={{ width: `${branch.percentage}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Role Distribution">
          <div className="space-y-3 pt-2">
            {[
              { name: "Regular Users", count: 850 },
              { name: "Managers", count: 124 },
              { name: "System Admins", count: 12 },
              { name: "Auditors", count: 8 },
            ].map((role, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-muted/20 p-3">
                <span className="text-sm font-semibold text-foreground">{role.name}</span>
                <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-foreground border border-slate-200/80">
                  {role.count}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Pending Actions" className="border-red-200/50 dark:border-red-900/30">
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900/30 bg-muted/20 p-3">
              <span className="text-sm font-semibold text-foreground">Locked Users</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 text-xs font-bold text-red-600 dark:text-red-400">3</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-900/30 bg-muted/20 p-3">
              <span className="text-sm font-semibold text-foreground">Users w/o Roles</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-xs font-bold text-amber-600 dark:text-amber-400">12</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-erp-primary/30 bg-muted/20 p-3">
              <span className="text-sm font-semibold text-foreground">Pending Approvals</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-erp-200 dark:bg-erp-900/50 text-xs font-bold text-erp-800 dark:text-erp-400">5</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="System Health" className="relative overflow-hidden">
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Status</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-green-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Active
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Uptime</p>
              <p className="text-sm font-bold text-foreground">99.98%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Active Modules</p>
              <p className="text-sm font-bold text-foreground">8 / 8</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">Last Backup</p>
              <p className="text-sm font-bold text-foreground">2 hrs ago</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-erp-border-soft flex justify-between items-center">
             <span className="text-xs text-muted-foreground font-medium">DB Sync</span>
             <span className="text-xs font-bold text-green-600 dark:text-green-400">Synced</span>
          </div>
        </SectionCard>
      </DashboardGrid>
    </PageShell>
  );
};

export default ControlCenterDashboardPage;
