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
import { AreaChart, DonutChart, BarChart, ProgressBar } from "@tremor/react";
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
  { name: "Central Warehouse (HQ)", value: 28500000 },
  { name: "Cold Storage Unit A", value: 12400000 },
  { name: "Regional Depot (NY)", value: 5800000 },
  { name: "Quarantine & Inspection", value: 1800000 },
];

const batchAlerts = [
  { id: "BAT-01", batch: "B-2026-0881", product: "Amoxicillin 500mg Cap", expiry: "2026-07-15", qty: "4,500 units", warehouse: "Central HQ", status: "Near Expiry" },
  { id: "BAT-02", batch: "B-2026-0412", product: "Paracetamol 650mg Tab", expiry: "2026-06-30", qty: "1,200 units", warehouse: "Regional NY", status: "Expired" },
  { id: "BAT-03", batch: "B-2026-0904", product: "Insulin Glargine 100IU", expiry: "2026-08-10", qty: "350 vials", warehouse: "Cold Storage", status: "Near Expiry" },
  { id: "BAT-04", batch: "B-2025-1102", product: "Azithromycin 250mg Tab", expiry: "2026-05-20", qty: "800 units", warehouse: "Quarantine", status: "Blocked" },
];

const topMovingProducts = [
  { name: "Atorvastatin 20mg Tab", unitsSold: 24500, turnover: "94%", stock: "Optimal" },
  { name: "Metformin 500mg Tab", unitsSold: 19800, turnover: "88%", stock: "Optimal" },
  { name: "Omeprazole 20mg Cap", unitsSold: 15400, turnover: "82%", stock: "Low Stock" },
  { name: "Cetirizine 10mg Tab", unitsSold: 14200, turnover: "79%", stock: "Optimal" },
];

const money = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);

const StatCard = ({ title, value, icon: Icon, tone, subtitle, trend, trendUp }: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-inset ring-slate-50 hover:ring-indigo-50 hover:border-indigo-500/30">
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
        {title}
      </span>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone} transition-transform group-hover:scale-105`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mt-3 flex items-baseline justify-between">
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 ">{value}</h3>
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-slate-100  pt-3">
      {trend ? (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${trendUp ? "text-emerald-600 " : "text-rose-600 "}`}>
          {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend}
        </span>
      ) : (
        <span className="text-xs font-medium text-slate-400">Current Status</span>
      )}
      {subtitle && <span className="text-[11px] text-slate-400 truncate max-w-[120px]" title={subtitle}>{subtitle}</span>}
    </div>
  </div>
);

const InventoryDashboard = () => {
  const { user, activeSoftware, activeBranch } = useAuth();
  const [stats, setStats] = useState<InventoryStats>(fallbackStats);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await inventoryApi.getInventoryDashboard();
        if (response.data?.success && response.data.data) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.warn("Using fallback inventory dashboard telemetry:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80  pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 ">
                {activeBranch?.branch_name || "Headquarters (HQ)"} • {activeSoftware?.software_name || "Pharma ERP"}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900  sm:text-3xl">
                Inventory & Supply Chain Dashboard
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500  pl-12">
            Real-time stock valuation, warehouse distribution, batch expiration monitoring, and supply health
          </p>
        </div>

        {/* Header Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU or Batch..."
              className="h-10 w-52 rounded-xl border border-slate-200  bg-white  pl-10 pr-4 text-sm text-slate-900  placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
          </div>

          <button
            onClick={handleRefresh}
            title="Refresh stock telemetry"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200  bg-white  text-slate-600  hover:bg-slate-50  hover:text-slate-900  transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          <button className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" />
            Stock Intake Voucher
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 1: 8-Up Inventory Health KPI Cards
      ══════════════════════════════════════════════ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 ">
            Stock Health & Batch Metrics
          </h2>
          <span className="text-xs text-slate-400">Live warehouse sync</span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Products (SKUs)"
            value={stats.total_products.toLocaleString()}
            icon={Package}
            tone="bg-indigo-50 text-indigo-600  "
            subtitle={`${stats.active_products} active SKUs`}
            trend="+24 SKUs this month"
            trendUp={true}
          />
          <StatCard
            title="Total Stock Valuation"
            value={money(Number(stats.total_stock_value || 0))}
            icon={DollarSign}
            tone="bg-emerald-50 text-emerald-600  "
            subtitle="Across all warehouses"
            trend="+5.8% vs last month"
            trendUp={true}
          />
          <StatCard
            title="Active Warehouses"
            value={stats.total_warehouses}
            icon={Database}
            tone="bg-blue-50 text-blue-600  "
            subtitle="Central & Regional"
            trend="100% capacity online"
            trendUp={true}
          />
          <StatCard
            title="Low Stock Warning"
            value={stats.low_stock_products}
            icon={TrendingDown}
            tone="bg-amber-50 text-amber-600  "
            subtitle="Below reorder threshold"
            trend="Requires restock"
            trendUp={false}
          />
          <StatCard
            title="Total Tracked Batches"
            value={stats.total_batches.toLocaleString()}
            icon={Archive}
            tone="bg-slate-100 text-slate-600  "
            subtitle="Lot numbers logged"
            trend="+140 new batches"
            trendUp={true}
          />
          <StatCard
            title="Near Expiry Batches"
            value={stats.near_expiry_batches}
            icon={AlertTriangle}
            tone="bg-amber-50 text-amber-600  "
            subtitle="Expiring ≤ 90 days"
            trend="Inspect soon"
            trendUp={false}
          />
          <StatCard
            title="Expired Batches"
            value={stats.expired_batches}
            icon={AlertCircle}
            tone="bg-rose-50 text-rose-600  "
            subtitle="Past expiration date"
            trend="Quarantine required"
            trendUp={false}
          />
          <StatCard
            title="Blocked / Quarantined"
            value={stats.blocked_batches}
            icon={ShieldAlert}
            tone="bg-purple-50 text-purple-600  "
            subtitle="Quality hold / Recall"
            trend="Under review"
            trendUp={false}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 2: Stock Valuation & Warehouse Distribution
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Stock Valuation Trajectory (2/3 width) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 ">
                  Stock Valuation & Supply Movement
                </h3>
                <p className="text-xs text-slate-500 ">
                  Total inventory asset value vs inbound receipts and outbound dispatches
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50  px-3 py-1 text-xs font-semibold text-emerald-700  border border-emerald-200/60 ">
                Turnover Rate: 4.2x / Year
              </span>
            </div>

            <div className="mt-4">
              <AreaChart
                className="h-72 w-full"
                data={stockTrendData}
                index="month"
                categories={["Stock Value", "Inbound Value", "Outbound Value"]}
                colors={["indigo", "emerald", "blue"]}
                valueFormatter={(val: number) => money(val)}
                showLegend={true}
                showGridLines={true}
                curveType="monotone"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100  pt-4 text-xs text-slate-500 ">
            <span>Peak Inventory Asset Value: {money(48500000)} (June)</span>
            <span className="font-semibold text-indigo-600  cursor-pointer hover:underline flex items-center gap-1">
              View warehouse ledger <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Right: Warehouse Distribution Donut Chart (1/3 width) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 ">
                Warehouse Asset Distribution
              </h3>
              <p className="text-xs text-slate-500 ">
                Stock valuation share by storage facility
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <DonutChart
                className="h-52 w-full"
                data={warehouseData}
                category="value"
                index="name"
                valueFormatter={(val: number) => money(val)}
                colors={["indigo", "blue", "emerald", "amber"]}
              />
            </div>

            <div className="mt-6 space-y-2 border-t border-slate-100  pt-4 text-xs">
              {warehouseData.map((item, idx) => {
                const total = warehouseData.reduce((acc, curr) => acc + curr.value, 0);
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="font-medium text-slate-600  truncate max-w-[180px]">{item.name}</span>
                    <span className="font-mono font-bold text-slate-900 ">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100  pt-4 text-xs text-center text-slate-500 ">
            <span>All storage zones climate-controlled & synced</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 3: Batch Expiration Table & Stock Health
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Critical Batch Expiration Alerts */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-100  pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900  flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Critical Batch Expiration & Quarantine Monitor
                </h3>
                <p className="text-xs text-slate-500  mt-1">
                  Batches requiring immediate quality inspection, discount allocation, or disposal quarantine
                </p>
              </div>
              <button className="rounded-lg bg-slate-100  px-3 py-1.5 text-xs font-semibold text-slate-700  hover:bg-indigo-600 hover:text-white transition-colors shrink-0">
                View All 20 Alerts
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200  text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Batch No</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Expiry Date</th>
                    <th className="pb-3">Stock Qty</th>
                    <th className="pb-3">Warehouse</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 ">
                  {batchAlerts.map((row) => (
                    <tr key={row.id} className="group hover:bg-slate-50  transition-colors">
                      <td className="py-3.5 pl-2 font-mono font-bold text-xs text-indigo-600 ">{row.batch}</td>
                      <td className="py-3.5 font-semibold text-slate-800 ">{row.product}</td>
                      <td className="py-3.5 font-mono text-xs text-slate-600 ">{row.expiry}</td>
                      <td className="py-3.5 font-mono text-xs text-slate-900 ">{row.qty}</td>
                      <td className="py-3.5 text-xs text-slate-500 ">{row.warehouse}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          row.status === "Expired"
                            ? "bg-rose-50 text-rose-700 border-rose-200   "
                            : row.status === "Near Expiry"
                            ? "bg-amber-50 text-amber-700 border-amber-200   "
                            : "bg-purple-50 text-purple-700 border-purple-200   "
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button className="rounded-md border border-slate-200  px-2.5 py-1 text-xs font-semibold text-slate-700  hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors">
                          Quarantine
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100  pt-4 text-xs text-slate-500 ">
            <span>Automated FEFO (First Expired, First Out) picking active</span>
            <span className="font-semibold text-indigo-600  hover:underline cursor-pointer flex items-center gap-1">
              Configure expiry rules <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Right 1 Col: Stock Health Index & Top Movers */}
        <div className="space-y-6">
          {/* Stock Health Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 ">
                Overall Stock Health Index
              </h3>
              <span className="rounded-full bg-emerald-100  px-2.5 py-0.5 text-xs font-bold text-emerald-800 ">
                94.2% Optimal
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 ">
                  <span>Stock Availability Ratio</span>
                  <span>1,180 / 1,240 SKUs</span>
                </div>
                <ProgressBar value={95.1} color="indigo" className="h-2.5" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 ">
                  <span>Batch Quality Compliance</span>
                  <span>98.6% Passed</span>
                </div>
                <ProgressBar value={98.6} color="emerald" className="h-2.5" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 ">
                  <span>Reorder Level Buffer</span>
                  <span>85.4% Above Minimum</span>
                </div>
                <ProgressBar value={85.4} color="blue" className="h-2.5" />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100  pt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500 ">18 products below safety stock</span>
              <button className="font-bold text-indigo-600  hover:underline">
                Generate Purchase Orders →
              </button>
            </div>
          </div>

          {/* Top Movers Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50">
            <h3 className="text-base font-bold text-slate-900  mb-4">
              Top Moving Pharmaceuticals
            </h3>
            <div className="space-y-3">
              {topMovingProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-100  p-2.5 hover:bg-slate-50  transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 ">{prod.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{prod.unitsSold.toLocaleString()} units sold</span>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    prod.stock === "Optimal"
                      ? "bg-emerald-50 text-emerald-700   border border-emerald-200/60 "
                      : "bg-amber-50 text-amber-700   border border-amber-200/60 "
                  }`}>
                    {prod.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
