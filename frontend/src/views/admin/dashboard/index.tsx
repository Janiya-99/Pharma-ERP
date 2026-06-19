import React from "react";
import {
  MdOutlineReceiptLong,
  MdOutlineAttachMoney,
  MdOutlineInventory2,
  MdOutlineWarning,
  MdOutlineHourglass,
  MdOutlineCheckCircle,
  MdOutlineBarChart,
  MdOutlinePeople,
  MdTrendingUp,
} from "react-icons/md";
import { dashboardKPIs, recentActivities } from "variables/mockData";

const statusColor: Record<string, string> = {
  Posted: "bg-green-100 text-green-700",
  Draft: "bg-gray-100 text-gray-600",
  Approved: "bg-blue-100 text-blue-700",
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

type KPICardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
  alert?: boolean;
};

function KPICard({ title, value, subtitle, icon, iconBg, trend, trendUp, alert }: KPICardProps) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border ${alert ? "border-amber-200" : "border-gray-100"} flex flex-col gap-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
          <p className={`mt-1 text-2xl font-bold ${alert ? "text-amber-600" : "text-navy-700 dark:text-white"}`}>
            {value}
          </p>
          {subtitle && <p className="mt-0.5 text-[12px] text-gray-400">{subtitle}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[12px] font-medium ${trendUp ? "text-green-600" : "text-red-500"}`}>
          <MdTrendingUp className={`h-4 w-4 ${!trendUp ? "rotate-180" : ""}`} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const f = (n: number) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-navy-700 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-400">Overview of today's operations — {new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* KPI Grid Row 1 — Financial */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Financial Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <KPICard
            title="Total Sales Today"
            value={f(dashboardKPIs.totalSalesToday)}
            icon={<MdOutlineAttachMoney className="h-6 w-6 text-brand-500" />}
            iconBg="bg-brand-50"
            trend="+12.4% vs yesterday"
            trendUp={true}
          />
          <KPICard
            title="Total Invoices"
            value={dashboardKPIs.totalInvoices}
            subtitle="This month"
            icon={<MdOutlineReceiptLong className="h-6 w-6 text-indigo-500" />}
            iconBg="bg-indigo-50"
            trend="+8 new today"
            trendUp={true}
          />
          <KPICard
            title="Outstanding Payments"
            value={f(dashboardKPIs.totalOutstanding)}
            subtitle="Across all customers"
            icon={<MdOutlineBarChart className="h-6 w-6 text-amber-500" />}
            iconBg="bg-amber-50"
            alert={true}
          />
        </div>
      </div>

      {/* KPI Grid Row 2 — Inventory */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Inventory Alerts</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            title="Total Products"
            value={dashboardKPIs.totalProducts}
            icon={<MdOutlineInventory2 className="h-6 w-6 text-teal-500" />}
            iconBg="bg-teal-50"
          />
          <KPICard
            title="Near Expiry"
            value={dashboardKPIs.nearExpiryProducts}
            subtitle="Within 60 days"
            icon={<MdOutlineWarning className="h-6 w-6 text-orange-500" />}
            iconBg="bg-orange-50"
            alert={true}
          />
          <KPICard
            title="Low Stock"
            value={dashboardKPIs.lowStockProducts}
            subtitle="Below reorder level"
            icon={<MdOutlineWarning className="h-6 w-6 text-red-500" />}
            iconBg="bg-red-50"
            alert={true}
          />
          <KPICard
            title="Pending GRNs"
            value={dashboardKPIs.pendingGRNs}
            subtitle="Awaiting posting"
            icon={<MdOutlineHourglass className="h-6 w-6 text-blue-500" />}
            iconBg="bg-blue-50"
          />
        </div>
      </div>

      {/* KPI Grid Row 3 — Approvals */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Pending Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <KPICard
            title="Pending Approvals"
            value={dashboardKPIs.pendingApprovals}
            subtitle="Across all modules"
            icon={<MdOutlineCheckCircle className="h-6 w-6 text-purple-500" />}
            iconBg="bg-purple-50"
          />
          <KPICard
            title="Active Users"
            value="18"
            subtitle="Online right now"
            icon={<MdOutlinePeople className="h-6 w-6 text-cyan-500" />}
            iconBg="bg-cyan-50"
          />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-navy-700 dark:text-white">Recent Activity</h2>
            <p className="text-[12px] text-gray-400">Latest actions across all modules</p>
          </div>
          <button className="text-[12px] font-semibold text-brand-500 hover:underline">View Audit Log →</button>
        </div>
        <div className="divide-y divide-gray-50">
          {recentActivities.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-[11px] font-bold">
                {item.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-navy-700 dark:text-white truncate">
                  {item.user} <span className="font-normal text-gray-400">{item.action}</span>
                </p>
                <p className="text-[11px] text-gray-400">{item.document} · {item.module}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusColor[item.status] || "bg-gray-100 text-gray-500"}`}>
                {item.status}
              </span>
              <span className="shrink-0 text-[11px] text-gray-400 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
