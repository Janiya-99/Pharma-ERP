import { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Database,
  ShieldAlert,
  Archive,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";

/* ─────────────────────────────────────────────────
   Type Declarations
───────────────────────────────────────────────── */

interface InventoryStats {
  total_products: number;
  active_products: number;
  total_stock_value: number;
  total_warehouses: number;
  low_stock_products: number;
  total_batches: number;
  near_expiry_batches: number;
  expired_batches: number;
  blocked_batches: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  tone: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
}

/* ─────────────────────────────────────────────────
   Fallback Mock Data
───────────────────────────────────────────────── */

const fallbackStats: InventoryStats = {
  total_products: 1240,
  active_products: 1180,
  total_stock_value: 48500000,
  total_warehouses: 4,
  low_stock_products: 18,
  total_batches: 3420,
  near_expiry_batches: 12,
  expired_batches: 3,
  blocked_batches: 5,
};

const stockTrendData = [
  { month: "Jan", "Stock Value": 42000000, "Inbound Value": 12500000, "Outbound Value": 11000000 },
  { month: "Feb", "Stock Value": 43500000, "Inbound Value": 14000000, "Outbound Value": 12500000 },
  { month: "Mar", "Stock Value": 45000000, "Inbound Value": 15200000, "Outbound Value": 13700000 },
  { month: "Apr", "Stock Value": 44200000, "Inbound Value": 11800000, "Outbound Value": 12600000 },
  { month: "May", "Stock Value": 46800000, "Inbound Value": 16500000, "Outbound Value": 13900000 },
  { month: "Jun", "Stock Value": 48500000, "Inbound Value": 18200000, "Outbound Value": 16500000 },
];

const warehouseData = [
  { name: "Central HQ", value: 28500000 },
  { name: "Cold Storage", value: 12400000 },
  { name: "Regional Depot", value: 5800000 },
  { name: "Quarantine", value: 1800000 },
];
const COLORS = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B"];

const batchAlerts = [
  { id: "BAT-01", batch: "B-2026-0881", product: "Amoxicillin 500mg Cap", expiry: "2026-07-15", qty: "4,500 units", warehouse: "Central HQ", status: "Near Expiry" },
  { id: "BAT-02", batch: "B-2026-0412", product: "Paracetamol 650mg Tab", expiry: "2026-06-30", qty: "1,200 units", warehouse: "Regional NY", status: "Expired" },
  { id: "BAT-03", batch: "B-2026-0904", product: "Insulin Glargine 100IU", expiry: "2026-08-10", qty: "350 vials", warehouse: "Cold Storage", status: "Near Expiry" },
  { id: "BAT-04", batch: "B-2025-1102", product: "Azithromycin 250mg Tab", expiry: "2026-05-20", qty: "800 units", warehouse: "Quarantine", status: "Blocked" },
];

const topMovingProducts = [
  { name: "Atorvastatin 20mg Tab", unitsSold: 24500, turnover: 94, stock: "Optimal" },
  { name: "Metformin 500mg Tab", unitsSold: 19800, turnover: 88, stock: "Optimal" },
  { name: "Omeprazole 20mg Cap", unitsSold: 15400, turnover: 82, stock: "Low Stock" },
  { name: "Cetirizine 10mg Tab", unitsSold: 14200, turnover: 79, stock: "Optimal" },
];

const money = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatYAxis = (value: number) => {
  if (value >= 1000000) return `Rs.${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs.${(value / 1000).toFixed(1)}K`;
  return `Rs.${value}`;
};

export default function InventoryDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<InventoryStats>(fallbackStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking an API call
    const fetchStats = async () => {
      try {
        const response = await inventoryApi.getDashboardStats();
        if (response?.data?.data) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch inventory stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, tone, subtitle, trend, trendUp }: StatCardProps) => {
    const toneMap: Record<string, { bg: string; text: string; iconBg: string }> = {
      blue: { bg: "bg-blue-50/50", text: "text-blue-700", iconBg: "bg-blue-100" },
      emerald: { bg: "bg-emerald-50/50", text: "text-emerald-700", iconBg: "bg-emerald-100" },
      indigo: { bg: "bg-indigo-50/50", text: "text-indigo-700", iconBg: "bg-indigo-100" },
      amber: { bg: "bg-amber-50/50", text: "text-amber-700", iconBg: "bg-amber-100" },
      rose: { bg: "bg-rose-50/50", text: "text-rose-700", iconBg: "bg-rose-100" },
      slate: { bg: "bg-slate-50/50", text: "text-slate-700", iconBg: "bg-slate-100" },
    };
    const t = toneMap[tone] || toneMap.blue;

    return (
      <div className={`relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-slate-900/5`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {title}
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </h3>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${t.iconBg} shadow-sm transition-transform duration-300 hover:scale-110`}>
            <Icon className={`h-6 w-6 ${t.text}`} />
          </div>
        </div>
        {(subtitle || trend) && (
          <div className="mt-4 flex items-center justify-between text-[13px]">
            {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
            {trend && (
              <span className={`flex items-center font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trendUp ? <TrendingUp className="mr-1 h-3.5 w-3.5" /> : <TrendingDown className="mr-1 h-3.5 w-3.5" />}
                {trend}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 pt-6 px-4 sm:px-6 lg:px-8 font-sans">
      {/* ══════════════════════════════════════════════
          HEADER SECTION
      ══════════════════════════════════════════════ */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-brand-600" />
            Inventory Command Center
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Real-time tracking of multi-warehouse stock, batches, and valuations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Receive Stock</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 1: Core KPI Cards
      ══════════════════════════════════════════════ */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Stock Value"
          value={money(stats.total_stock_value)}
          icon={DollarSign}
          tone="emerald"
          subtitle="Across all warehouses"
          trend="+4.2% vs last month"
          trendUp={true}
        />
        <StatCard
          title="Active SKUs"
          value={stats.active_products.toLocaleString()}
          icon={Database}
          tone="indigo"
          subtitle={`Out of ${stats.total_products} total`}
          trend="+12 new this week"
          trendUp={true}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.low_stock_products}
          icon={AlertTriangle}
          tone="amber"
          subtitle="Requires reordering"
          trend="-2 from yesterday"
          trendUp={true}
        />
        <StatCard
          title="Blocked/Quarantine"
          value={stats.blocked_batches + stats.expired_batches}
          icon={ShieldAlert}
          tone="rose"
          subtitle="Non-sellable batches"
          trend="Action required"
          trendUp={false}
        />
      </div>

      {/* ══════════════════════════════════════════════
          TIER 2: Main Charts
      ══════════════════════════════════════════════ */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Stock Value Trend Area Chart (2/3 width) */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-slate-900/5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Stock Valuation & Supply Movement
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Total inventory asset value vs inbound receipts and outbound dispatches
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 shadow-sm">
                Turnover Rate: 4.2x / Year
              </span>
            </div>

            <div className="h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stockTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={formatYAxis} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: number) => [money(value), undefined]} />
                  <Area type="monotone" dataKey="Stock Value" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorStock)" />
                  <Area type="monotone" dataKey="Inbound Value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorInbound)" />
                  <Area type="monotone" dataKey="Outbound Value" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorOutbound)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 font-medium">
            <span>Peak Inventory Asset Value: {money(48500000)} (June)</span>
            <span className="font-semibold text-brand-600 cursor-pointer hover:text-brand-700 flex items-center gap-1 transition-colors">
              View warehouse ledger <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Right: Warehouse Distribution Donut Chart (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-slate-900/5 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Warehouse Asset Distribution
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Stock valuation share by storage facility
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: number) => [money(value), "Value"]} />
                  <Pie data={warehouseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {warehouseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-xs">
              {warehouseData.map((item, idx) => {
                const total = warehouseData.reduce((acc, curr) => acc + curr.value, 0);
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="font-medium text-slate-600 truncate max-w-[180px]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-center text-slate-500 font-medium">
            <span>All storage zones climate-controlled & synced</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 3: Batch Expiration Table & Stock Health
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Critical Batch Expiration Alerts */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-slate-900/5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Critical Batch Expiration & Quarantine Monitor
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Batches requiring immediate quality inspection, discount allocation, or disposal quarantine
                </p>
              </div>
              <button className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all shadow-sm shrink-0">
                View All 20 Alerts
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 bg-slate-50/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 rounded-tl-lg">Batch No.</th>
                    <th scope="col" className="px-4 py-3">Product</th>
                    <th scope="col" className="px-4 py-3">Expiry Date</th>
                    <th scope="col" className="px-4 py-3">Quantity</th>
                    <th scope="col" className="px-4 py-3 rounded-tr-lg">Status / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-slate-900">
                        {alert.batch}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                        {alert.product}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs font-medium">
                        <span className={alert.status === "Expired" ? "text-rose-600 font-bold" : "text-amber-600 font-semibold"}>
                          {alert.expiry}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs font-medium text-slate-600">
                        {alert.qty} <span className="text-slate-400">({alert.warehouse})</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              alert.status === "Expired"
                                ? "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-600/20"
                                : alert.status === "Blocked"
                                ? "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20"
                                : "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                            }`}
                          >
                            {alert.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing top 4 critical alerts</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-brand-600 transition-colors font-semibold">
              <Archive className="h-3.5 w-3.5" /> Open Quarantine Bay
            </span>
          </div>
        </div>

        {/* Right Col: High-Velocity Products (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-slate-900/5 flex flex-col justify-between">
          <div>
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                High-Velocity Movers
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Top products by sales volume & turnover
              </p>
            </div>

            <div className="space-y-5">
              {topMovingProducts.map((product, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                      {product.name}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {product.unitsSold.toLocaleString()} units
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${product.turnover > 90 ? 'bg-emerald-500' : product.turnover > 80 ? 'bg-brand-500' : 'bg-amber-500'}`} 
                        style={{ width: `${product.turnover}%` }} 
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 w-8 text-right">
                      {product.turnover}%
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 font-semibold ${product.stock === 'Low Stock' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {product.stock}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center justify-center gap-1 w-full">
              Analyze Sales Velocity <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
