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
  MdGavel,
  MdArrowForward,
} from "react-icons/md";

// Dummy data for activity feed
const activities = [
  {
    id: 1,
    title: "New user Kamali Fernando created",
    time: "10 mins ago",
    type: "admin",
  },
  {
    id: 2,
    title: "Invoice #INV-2026-001 approved",
    time: "1 hour ago",
    type: "invoice",
  },
  {
    id: 3,
    title: "Stock received for Batch #B4002",
    time: "3 hours ago",
    type: "inventory",
  },
  {
    id: 4,
    title: "System backup completed successfully",
    time: "5 hours ago",
    type: "system",
  },
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
    description:
      "Centralized command for enterprise configuration. Manage organizational hierarchies, configure global routing parameters, and monitor real-time system health metrics across all integrated microservices.",
    icon: <MdOutlineAdminPanelSettings className="h-6 w-6" />,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    path: "/admin/control-center/dashboard",
    badge: "CORE SYSTEM",
    badgeColor:
      "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500",
    colSpan: 2,
  },
  {
    id: "inventory",
    title: "Inventory Management",
    description:
      "Track stock levels, manage multi-warehouse logistics, and automate replenishment workflows.",
    icon: <MdInventory2 className="h-6 w-6" />,
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-400",
    path: "/admin/inventory/dashboard",
    colSpan: 1,
  },
  {
    id: "finance",
    title: "Finance Hub",
    description:
      "Access general ledgers, reconcile accounts, and generate high-level financial forecasts.",
    icon: <MdOutlineAccountBalance className="h-6 w-6" />,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    path: "/admin/finance/dashboard",
    colSpan: 1,
  },
  {
    id: "invoice-center",
    title: "Invoice Center",
    description:
      "Process AP/AR documentation, manage vendor billing cycles, and automate payment approvals.",
    icon: <MdOutlineReceiptLong className="h-6 w-6" />,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-400",
    path: "/admin/invoice-center/dashboard",
    colSpan: 1,
  },
  {
    id: "compliance",
    title: "Compliance Center",
    description:
      "Review audit trails, manage regulatory documentation, and ensure operational standard adherence.",
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
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#0b1437] font-sans">
      {/* Background Glow Effects (contained to prevent horizontal scroll) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[30%] w-[30%] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-40 border-b border-white/5 bg-navy-900/50 backdrop-blur-md">
        <div className="mx-auto w-full px-4 lg:px-8 xl:px-12">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
                <MdLocalPharmacy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[18px] font-extrabold tracking-wide text-white">
                  PharmaDist
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300">
                  ERP System
                </p>
              </div>
            </div>

            {/* User Info + Logout */}
            <div className="flex items-center gap-5">
              <div className="hidden text-right md:block">
                <p className="text-[15px] font-bold text-white">
                  {user?.name || "Kamali Fernando"}
                </p>
                <p className="text-[12px] font-medium text-gray-400">
                  {user?.role || "System Admin"} •{" "}
                  {user?.branch || "Head Office"}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-navy-800 bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-500/20">
                {(user?.name || "K").charAt(0)}
              </div>
              <div className="mx-1 h-8 w-px bg-white/10" />
              <button
                onClick={handleLogout}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all duration-300 hover:bg-red-500/80 hover:text-white hover:shadow-lg hover:shadow-red-500/20"
                title="Logout"
              >
                <MdLogout className="ml-1 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden py-4">
        <div className="mx-auto flex min-h-0 w-full flex-1 flex-col px-4 lg:px-8 xl:px-12">
          {/* Greeting Section */}
          <div className="mb-4 flex shrink-0 flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {greeting},{" "}
                <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
                  {user?.name?.split(" ")[0] || "Kamali"}
                </span>{" "}
                👋
              </h1>
              <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-gray-400">
                Welcome to your command center. Select a module below to manage
                your daily operations.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-navy-800/80 px-5 py-3 shadow-xl backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
                <MdTrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-gray-400">
                  Today's Date
                </p>
                <p className="text-[14px] font-bold text-white">
                  {now.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
            {/* Left Column - Modules Grid */}
            <div className="flex w-full min-w-0 flex-1 flex-col">
              <h2 className="mb-3 flex shrink-0 items-center gap-2 text-base font-bold text-white">
                <MdDashboard className="text-brand-400" /> Core Modules
              </h2>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 pb-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 xl:gap-4">
                {modules.map((mod: unknown) => (
                  <div
                    key={mod.id}
                    onClick={() => navigate(mod.path)}
                    className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-white/5 bg-navy-800/60 p-4 text-left shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-white/10 ${
                      mod.colSpan === 2 ? "md:col-span-2" : "md:col-span-1"
                    } min-h-0 overflow-hidden`}
                  >
                    <div className="flex min-h-0 flex-col">
                      <div className="mb-2 flex shrink-0 items-start justify-between xl:mb-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${mod.iconBg} ${mod.iconColor}`}
                        >
                          {mod.icon}
                        </div>
                        {mod.badge && (
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${mod.badgeColor}`}
                          >
                            {mod.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="mb-1 shrink-0 text-base font-bold text-white xl:text-lg">
                        {mod.title}
                      </h3>
                      <p className="mb-3 line-clamp-2 min-h-0 flex-1 overflow-hidden text-[12px] font-medium leading-snug text-gray-400 xl:mb-4 xl:line-clamp-3 xl:text-[13px]">
                        {mod.description}
                      </p>
                    </div>

                    <div
                      className={
                        mod.colSpan === 2
                          ? "mt-auto flex w-[160px] shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-[12px] font-semibold text-white transition-colors group-hover:bg-indigo-500 xl:w-[180px] xl:text-[13px]"
                          : "mt-auto flex w-full shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 py-2 text-[12px] font-semibold text-gray-300 transition-colors group-hover:bg-white/10 group-hover:text-white xl:text-[13px]"
                      }
                    >
                      Launch Module
                      {mod.colSpan === 2 && (
                        <MdArrowForward className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex min-h-0 w-full shrink-0 flex-col gap-4 xl:w-[320px] 2xl:w-[360px]">
              {/* Quick Stats Panel */}
              <div className="shrink-0 rounded-2xl border border-white/5 bg-navy-800/60 p-4 shadow-lg backdrop-blur-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                  <MdTrendingUp className="text-brand-400" /> Daily Snapshot
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Active Users",
                      value: "18",
                      color: "text-blue-400",
                      bg: "bg-blue-500/10",
                    },
                    {
                      label: "Invoices",
                      value: "24",
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      label: "Pending",
                      value: "12",
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                    },
                    {
                      label: "Alerts",
                      value: "3",
                      color: "text-rose-400",
                      bg: "bg-rose-500/10",
                    },
                  ].map((stat: unknown) => (
                    <div
                      key={stat.label}
                      className={`rounded-xl p-3 ${stat.bg} border border-white/5`}
                    >
                      <p
                        className={`text-xl font-extrabold ${stat.color} mb-0.5`}
                      >
                        {stat.value}
                      </p>
                      <p className="text-[11px] font-semibold text-gray-400">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed Panel */}
              <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/5 bg-navy-800/60 p-4 shadow-lg backdrop-blur-sm">
                <div className="mb-4 flex shrink-0 items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold text-white">
                    <MdNotificationsActive className="text-brand-400" /> Recent
                    Activity
                  </h2>
                  <button className="text-[12px] font-bold text-brand-400 hover:text-brand-300">
                    View All
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
                  {activities.map((activity: unknown, idx: unknown) => (
                    <div key={activity.id} className="relative pl-4">
                      {/* Timeline Line */}
                      {idx !== activities.length - 1 && (
                        <div className="absolute bottom-[-24px] left-[7px] top-6 w-[2px] bg-white/5" />
                      )}
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-[3px] border-navy-800 bg-brand-400 shadow-sm" />

                      <p className="text-[13px] font-semibold leading-snug text-gray-200">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto shrink-0 border-t border-white/5 bg-navy-900/50 py-3 backdrop-blur-md">
        <div className="mx-auto flex w-full flex-col items-center justify-between gap-2 px-4 sm:flex-row lg:px-8 xl:px-12">
          <p className="text-[12px] font-medium text-gray-500">
            © {now.getFullYear()} PharmaDist Lanka Pvt Ltd. All rights reserved.{" "}
            <span className="hidden sm:inline">|</span> Developed by{" "}
            <span className="font-bold text-brand-400">PIXANDCO</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[11px] font-bold text-green-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              System Online
            </span>
            <p className="text-[12px] font-bold text-gray-600">v1.0.0-beta</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
