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
  MdLogout,
  MdLocalPharmacy,
  MdNotificationsActive,
  MdTrendingUp,
  MdGavel,
  MdArrowForward,
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
  badgeColor?: string;
  colSpan?: number;
};

const modules: ModuleCard[] = [
  {
    id: "control-center",
    title: "Control Center",
    description: "Centralized command for enterprise configuration. Manage organizational hierarchies, configure global routing parameters, and monitor real-time system health metrics across all integrated microservices.",
    icon: <MdOutlineAdminPanelSettings className="h-6 w-6" />,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    path: "/admin/control-center/dashboard",
    badge: "CORE SYSTEM",
    badgeColor: "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500",
    colSpan: 2,
  },
  {
    id: "inventory",
    title: "Inventory Management",
    description: "Track stock levels, manage multi-warehouse logistics, and automate replenishment workflows.",
    icon: <MdInventory2 className="h-6 w-6" />,
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-400",
    path: "/admin/inventory/dashboard",
    colSpan: 1,
  },
  {
    id: "finance",
    title: "Finance Hub",
    description: "Access general ledgers, reconcile accounts, and generate high-level financial forecasts.",
    icon: <MdOutlineAccountBalance className="h-6 w-6" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    path: "/admin/finance/dashboard",
    colSpan: 1,
  },
  {
    id: "invoice-center",
    title: "Invoice Center",
    description: "Process AP/AR documentation, manage vendor billing cycles, and automate payment approvals.",
    icon: <MdOutlineReceiptLong className="h-6 w-6" />,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-400",
    path: "/admin/invoice-center/dashboard",
    colSpan: 1,
  },
  {
    id: "compliance",
    title: "Compliance Center",
    description: "Review audit trails, manage regulatory documentation, and ensure operational standard adherence.",
    icon: <MdGavel className="h-6 w-6" />,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    path: "/admin/compliance/dashboard",
    colSpan: 1,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s: unknown) => s.user);
  const logout = useAuthStore((s: unknown) => s.logout);

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
    <div className="h-screen overflow-hidden bg-[#0b1437] flex flex-col relative font-sans">
      {/* Background Glow Effects (contained to prevent horizontal scroll) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-40 bg-navy-900/50 backdrop-blur-md border-b border-white/5">
        <div className="w-full mx-auto px-4 lg:px-8 xl:px-12">
          <div className="flex h-16 items-center justify-between">
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
      <main className="flex-1 flex flex-col relative z-10 py-4 min-h-0 overflow-hidden">
        <div className="w-full mx-auto px-4 lg:px-8 xl:px-12 flex flex-col flex-1 min-h-0">
          {/* Greeting Section */}
          <div className="mb-4 flex flex-col xl:flex-row xl:items-end justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">{user?.name?.split(" ")[0] || "Kamali"}</span> 👋
              </h1>
              <p className="mt-1 text-[14px] text-gray-400 max-w-xl leading-relaxed">
                Welcome to your command center. Select a module below to manage your daily operations.
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

          <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
            
            {/* Left Column - Modules Grid */}
            <div className="flex-1 w-full min-w-0 flex flex-col">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2 shrink-0">
                <MdDashboard className="text-brand-400" /> Core Modules
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-3 xl:gap-4 flex-1 min-h-0 pb-1">
                {modules.map((mod: unknown) => (
                  <div
                    key={mod.id}
                    onClick={() => navigate(mod.path)}
                    className={`group relative flex flex-col justify-between rounded-2xl bg-navy-800/60 backdrop-blur-sm p-4 border border-white/5 shadow-lg hover:border-white/10 cursor-pointer transition-all duration-300 text-left ${mod.colSpan === 2 ? "md:col-span-2" : "md:col-span-1"} overflow-hidden min-h-0`}
                  >
                    <div className="flex flex-col min-h-0">
                      <div className="flex justify-between items-start mb-2 xl:mb-3 shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${mod.iconBg} ${mod.iconColor}`}
                        >
                          {mod.icon}
                        </div>
                        {mod.badge && (
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${mod.badgeColor}`}
                          >
                            {mod.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base xl:text-lg font-bold text-white mb-1 shrink-0">
                        {mod.title}
                      </h3>
                      <p className="text-[12px] xl:text-[13px] text-gray-400 leading-snug font-medium mb-3 xl:mb-4 line-clamp-2 xl:line-clamp-3 overflow-hidden flex-1 min-h-0">
                        {mod.description}
                      </p>
                    </div>

                    <div
                      className={
                        mod.colSpan === 2
                          ? "w-[160px] xl:w-[180px] py-2 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white font-semibold text-[12px] xl:text-[13px] transition-colors flex items-center justify-center gap-2 shrink-0 mt-auto"
                          : "w-full py-2 rounded-lg bg-white/5 group-hover:bg-white/10 border border-white/5 text-gray-300 group-hover:text-white font-semibold text-[12px] xl:text-[13px] transition-colors flex items-center justify-center shrink-0 mt-auto"
                      }
                    >
                      Launch Module
                      {mod.colSpan === 2 && <MdArrowForward className="h-4 w-4" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full xl:w-[320px] 2xl:w-[360px] shrink-0 flex flex-col gap-4 min-h-0">
              
              {/* Quick Stats Panel */}
              <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/5 shadow-lg shrink-0">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <MdTrendingUp className="text-brand-400" /> Daily Snapshot
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Active Users", value: "18", color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Invoices", value: "24", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Pending", value: "12", color: "text-amber-400", bg: "bg-amber-500/10" },
                    { label: "Alerts", value: "3", color: "text-rose-400", bg: "bg-rose-500/10" },
                  ].map((stat: unknown) => (
                    <div key={stat.label} className={`p-3 rounded-xl ${stat.bg} border border-white/5`}>
                      <p className={`text-xl font-extrabold ${stat.color} mb-0.5`}>{stat.value}</p>
                      <p className="text-[11px] font-semibold text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed Panel */}
              <div className="bg-navy-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/5 shadow-lg flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <MdNotificationsActive className="text-brand-400" /> Recent Activity
                  </h2>
                  <button className="text-[12px] font-bold text-brand-400 hover:text-brand-300">View All</button>
                </div>
                
                <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0">
                  {activities.map((activity: unknown, idx: unknown) => (
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
      <footer className="relative z-10 py-3 border-t border-white/5 bg-navy-900/50 backdrop-blur-md mt-auto shrink-0">
        <div className="w-full mx-auto px-4 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[12px] font-medium text-gray-500">
            © {now.getFullYear()} PharmaDist Lanka Pvt Ltd. All rights reserved. <span className="hidden sm:inline">|</span> Developed by <span className="text-brand-400 font-bold">PIXANDCO</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              System Online
            </span>
            <p className="text-[12px] font-bold text-gray-600">v1.0.0-beta</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
