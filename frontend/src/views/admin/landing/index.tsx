/**
 * Landing Page — Module Selection Hub
 * After login, users see this page with all ERP modules as clickable cards.
 * Each card navigates to the first sub-page of the respective module.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "store/authStore";
import {
  MdDashboard,
  MdOutlineAdminPanelSettings,
  MdOutlineAccountBalance,
  MdInventory2,
  MdOutlineReceiptLong,
  MdOutlineVerifiedUser,
  MdOutlineAssessment,
  MdOutlineSettings,
  MdLogout,
  MdLocalPharmacy,
  MdNotificationsActive,
  MdTrendingUp,
} from "react-icons/md";

// Dummy data for activity feed
const activities = [
  { id: 1, title: "New user Kamali Fernando created", time: "10 mins ago", type: "admin" },
  { id: 2, title: "Invoice #INV-2026-001 approved", time: "1 hour ago", type: "invoice" },
  { id: 3, title: "Stock received for Batch #B4002", time: "3 hours ago", type: "inventory" },
  { id: 4, title: "System backup completed successfully", time: "5 hours ago", type: "system" },
];

type ModuleCard = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  path: string;
  badge?: string;
  badgeColor?: string;
  gradient: string;
};

const modules: ModuleCard[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Overview of operations, KPIs, and real-time activity feed",
    icon: <MdDashboard className="h-7 w-7" />,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    path: "/admin/dashboard",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    id: "control-center",
    title: "Control Center",
    description: "Company, branches, users, roles, permissions & audit logs",
    icon: <MdOutlineAdminPanelSettings className="h-7 w-7" />,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    path: "/admin/control-center/dashboard",
    badge: "Admin",
    badgeColor: "bg-indigo-500/20 text-indigo-300",
    gradient: "from-indigo-500/20 to-indigo-600/5",
  },
  {
    id: "finance",
    title: "Finance",
    description: "Chart of accounts, journals, ledger, payments & tax",
    icon: <MdOutlineAccountBalance className="h-7 w-7" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    path: "/admin/finance/dashboard",
    badge: "Accounting",
    badgeColor: "bg-emerald-500/20 text-emerald-300",
    gradient: "from-emerald-500/20 to-emerald-600/5",
  },
  {
    id: "inventory",
    title: "Inventory",
    description: "Products, batches, warehouses, GRN, transfers & stock ledger",
    icon: <MdInventory2 className="h-7 w-7" />,
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-500",
    path: "/admin/inventory/dashboard",
    badge: "Stock",
    badgeColor: "bg-teal-500/20 text-teal-300",
    gradient: "from-teal-500/20 to-teal-600/5",
  },
  {
    id: "invoice-center",
    title: "Invoice Center",
    description: "Sales orders, invoices, credit/debit notes & receipts",
    icon: <MdOutlineReceiptLong className="h-7 w-7" />,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    path: "/admin/invoice-center/dashboard",
    badge: "Billing",
    badgeColor: "bg-amber-500/20 text-amber-300",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    id: "compliance",
    title: "Compliance Center",
    description: "License documents, batch recall/hold, expiry disposal & regulatory",
    icon: <MdOutlineVerifiedUser className="h-7 w-7" />,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
    path: "/admin/compliance/dashboard",
    badge: "Regulatory",
    badgeColor: "bg-rose-500/20 text-rose-300",
    gradient: "from-rose-500/20 to-rose-600/5",
  },
  {
    id: "reports",
    title: "Reports",
    description: "Financial reports, inventory reports, and compliance analytics",
    icon: <MdOutlineAssessment className="h-7 w-7" />,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    path: "/admin/finance/reports",
    gradient: "from-purple-500/20 to-purple-600/5",
  },
  {
    id: "settings",
    title: "Settings",
    description: "System configuration, currency, prefixes & approval rules",
    icon: <MdOutlineSettings className="h-7 w-7" />,
    iconBg: "bg-slate-500/10",
    iconColor: "text-slate-400",
    path: "/admin/control-center/settings",
    gradient: "from-slate-500/20 to-slate-600/5",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/auth/sign-in", { replace: true });
  };

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="min-h-screen bg-[#0b1437] flex flex-col relative overflow-hidden font-sans">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-40 bg-navy-900/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
                <MdLocalPharmacy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[18px] font-extrabold text-white tracking-wide">PharmaDist</p>
                <p className="text-[11px] font-semibold text-brand-300 uppercase tracking-[0.2em]">ERP System</p>
              </div>
            </div>

            {/* User Info + Logout */}
            <div className="flex items-center gap-5">
              <div className="hidden md:block text-right">
                <p className="text-[15px] font-bold text-white">{user?.name || "Kamali Fernando"}</p>
                <p className="text-[12px] font-medium text-gray-400">
                  {user?.role || "System Admin"} • {user?.branch || "Head Office"}
                </p>
              </div>
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20 border-2 border-navy-800">
                {(user?.name || "K").charAt(0)}
              </div>
              <div className="h-8 w-px bg-white/10 mx-1" />
              <button
                onClick={handleLogout}
                className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-red-500/80 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                title="Logout"
              >
                <MdLogout className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 py-10 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          {/* Greeting Section */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">{user?.name?.split(" ")[0] || "Kamali"}</span> 👋
              </h1>
              <p className="mt-3 text-[15px] text-gray-400 max-w-xl leading-relaxed">
                Welcome to your command center. Select a module below to manage your daily operations or review the latest activity in the system.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-navy-800/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 shadow-xl">
              <div className="h-10 w-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
                <MdTrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-gray-400">Today's Date</p>
                <p className="text-[14px] font-bold text-white">
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column - Modules Grid (Takes up 8/12 space on large screens) */}
            <div className="xl:col-span-8 2xl:col-span-9">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MdDashboard className="text-brand-400" /> Core Modules
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {modules.map((mod, i) => (
                  <button
                    key={mod.id}
                    onClick={() => navigate(mod.path)}
                    className="group relative flex flex-col items-start rounded-3xl bg-navy-800/60 backdrop-blur-sm p-6 border border-white/5 shadow-xl hover:shadow-2xl hover:shadow-brand-500/10 hover:border-brand-500/30 transition-all duration-300 text-left overflow-hidden"
                  >
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mod.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="relative z-10 w-full">
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${mod.iconBg} ${mod.iconColor} group-hover:scale-110 transition-transform duration-300 shadow-inner`}
                        >
                          {mod.icon}
                        </div>
                        {mod.badge && (
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-white/5 shadow-sm ${mod.badgeColor}`}
                          >
                            {mod.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-[17px] font-bold text-white group-hover:text-brand-300 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="mt-2 text-[13px] text-gray-400 leading-relaxed font-medium">
                        {mod.description}
                      </p>
                    </div>

                    {/* Arrow Indicator */}
                    <div className="absolute bottom-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-500 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Side Panels (Takes up 4/12 space) */}
            <div className="xl:col-span-4 2xl:col-span-3 space-y-8">
              
              {/* Quick Stats Panel */}
              <div className="bg-navy-800/60 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <MdTrendingUp className="text-brand-400" /> Daily Snapshot
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Active Users", value: "18", color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Invoices", value: "24", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Pending", value: "12", color: "text-amber-400", bg: "bg-amber-500/10" },
                    { label: "Alerts", value: "3", color: "text-rose-400", bg: "bg-rose-500/10" },
                  ].map((stat) => (
                    <div key={stat.label} className={`p-4 rounded-2xl ${stat.bg} border border-white/5`}>
                      <p className={`text-2xl font-extrabold ${stat.color} mb-1`}>{stat.value}</p>
                      <p className="text-[12px] font-semibold text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed Panel */}
              <div className="bg-navy-800/60 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MdNotificationsActive className="text-brand-400" /> Recent Activity
                  </h2>
                  <button className="text-[12px] font-bold text-brand-400 hover:text-brand-300">View All</button>
                </div>
                
                <div className="space-y-6">
                  {activities.map((activity, idx) => (
                    <div key={activity.id} className="relative pl-4">
                      {/* Timeline Line */}
                      {idx !== activities.length - 1 && (
                        <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-white/5" />
                      )}
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-[3px] border-navy-800 bg-brand-400 shadow-sm" />
                      
                      <p className="text-[13px] font-semibold text-gray-200 leading-snug">{activity.title}</p>
                      <p className="text-[11px] font-medium text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/5 bg-navy-900/50 backdrop-blur-md mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] font-medium text-gray-500">
            © {now.getFullYear()} PharmaDist Lanka Pvt Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
            <p className="text-[12px] font-bold text-gray-600">v1.0.0-beta</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
