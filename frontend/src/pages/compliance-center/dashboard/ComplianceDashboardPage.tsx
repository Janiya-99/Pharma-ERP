import React, { useState } from "react";
import {
  AreaChart,
  BarChart,
  DonutChart,
  ProgressBar,
} from "@tremor/react";
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Pill,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Award,
  Building2,
} from "lucide-react";

const passRateData = [
  { month: "Jan 2026", "QC Pass Rate (%)": 98.2, "NMRA Compliance Index": 99.0 },
  { month: "Feb 2026", "QC Pass Rate (%)": 97.5, "NMRA Compliance Index": 98.5 },
  { month: "Mar 2026", "QC Pass Rate (%)": 98.8, "NMRA Compliance Index": 99.2 },
  { month: "Apr 2026", "QC Pass Rate (%)": 99.1, "NMRA Compliance Index": 99.5 },
  { month: "May 2026", "QC Pass Rate (%)": 98.4, "NMRA Compliance Index": 98.9 },
  { month: "Jun 2026", "QC Pass Rate (%)": 99.4, "NMRA Compliance Index": 99.8 },
];

const quarantineReasonsData = [
  { name: "Temperature Excursion (Cold Chain)", value: 45 },
  { name: "Failed QC Assay / Potency", value: 28 },
  { name: "Damaged Packaging / Seal", value: 18 },
  { name: "Supplier Voluntary Recall", value: 9 },
];

const expiryWriteOffData = [
  { category: "Antibiotics & Anti-infectives", "Write-off Value (LKR)": 1450000 },
  { category: "Vaccines & Biologicals", "Write-off Value (LKR)": 890000 },
  { category: "Cardiovascular & Chronic", "Write-off Value (LKR)": 620000 },
  { category: "Analgesics & Antipyretics", "Write-off Value (LKR)": 410000 },
  { category: "Oncology & Speciality", "Write-off Value (LKR)": 1820000 },
];

const recentRegulatoryActions = [
  {
    id: "REG-2026-089",
    timestamp: "Today, 14:30",
    type: "BATCH_HOLD",
    target: "Amoxicillin 500mg (Batch #AMX-9021)",
    action: "Quarantine Hold Triggered",
    authority: "Internal QC Lab",
    status: "UNDER_INVESTIGATION",
    notes: "Dissolution test variation detected in routine sampling.",
  },
  {
    id: "REG-2026-088",
    timestamp: "Yesterday, 16:15",
    type: "LICENSE_RENEWAL",
    target: "NMRA Wholesale Import License #WHL-4402",
    action: "Annual Renewal Approved",
    authority: "NMRA Sri Lanka",
    status: "COMPLETED",
    notes: "Valid through June 30, 2027. Certificate archived.",
  },
  {
    id: "REG-2026-087",
    timestamp: "02 Jul 2026",
    type: "RECALL_NOTICE",
    target: "Paracetamol Syrup 120mg (Batch #PCM-1102)",
    action: "Class II Voluntary Recall",
    authority: "Manufacturer Alert",
    status: "IN_PROGRESS",
    notes: "82% of distributed bottles recovered and moved to quarantine.",
  },
  {
    id: "REG-2026-086",
    timestamp: "28 Jun 2026",
    type: "DISPOSAL_WITNESS",
    target: "Expired Insulin Glargine (1,400 Vials)",
    action: "Incineration Completed",
    authority: "NMRA & PHI Inspector",
    status: "COMPLETED",
    notes: "Witness certificate #DISP-8809 signed and filed in archives.",
  },
];

const ComplianceDashboardPage = () => {
  const [selectedFacility, setSelectedFacility] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80  pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 ">
                Compliance Center • Regulatory Governance
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900  sm:text-3xl">
                Regulatory Compliance & Quality Dashboard
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500  pl-12">
            Real-time telemetry on NMRA licensing, quality holds, drug recalls, and pharmaceutical expiry disposals
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3.5 text-xs font-semibold text-slate-700  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
          >
            <option value="ALL">All Facilities & Warehouses</option>
            <option value="HQ">Colombo Central Warehouse</option>
            <option value="COLD">Cold Storage Depot (Kelaniya)</option>
            <option value="NY">Regional Distribution Center</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200  bg-white  px-4 text-sm font-semibold text-slate-700  hover:bg-slate-50  transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Syncing NMRA..." : "Refresh Status"}
          </button>
          <button className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
            <Download className="h-4 w-4" />
            Export Compliance Report
          </button>
        </div>
      </div>

      {/* ── Tier 1: KPI Summary Cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Active Licenses */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
              Active NMRA & IRAS Licenses
            </span>
            <div className="rounded-lg bg-indigo-50  p-2 text-indigo-600 ">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">24</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-emerald-600  font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Compliant
            </span>
            <span className="rounded bg-amber-100  text-amber-800  font-bold px-1.5 py-0.5 text-[10px]">
              2 Expiring in 30D
            </span>
          </div>
        </div>

        {/* Batches Under Quarantine */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
              Batches Under Quarantine
            </span>
            <div className="rounded-lg bg-amber-50  p-2 text-amber-600 ">
              <Pill className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">14</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-amber-600  font-semibold">
              4.2M LKR Stock Value Held
            </span>
            <span className="text-slate-400 font-medium">Pending QC Assay</span>
          </div>
        </div>

        {/* Active Product Recalls */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
              Active Product Recalls
            </span>
            <div className="rounded-lg bg-rose-50  p-2 text-rose-600 ">
              <RotateCcw className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-rose-600 ">3</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-rose-600  font-bold flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Class II Safety Alert
            </span>
            <span className="text-slate-400 font-medium">82% Recovered</span>
          </div>
        </div>

        {/* Pending Expiry Disposals */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
              Pending Expiry Disposals
            </span>
            <div className="rounded-lg bg-purple-50  p-2 text-purple-600 ">
              <Trash2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">8</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-purple-600  font-semibold">
              5.19M LKR Write-off Value
            </span>
            <span className="text-slate-400 font-medium">Awaiting Witness</span>
          </div>
        </div>
      </div>

      {/* ── Tier 2: Tremor Analytics Charts ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pass Rate Area Chart */}
        <div className="rounded-2xl border border-slate-200  bg-white  p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 ">
                Quality Assurance Pass Rate & NMRA Compliance Index
              </h3>
              <p className="text-xs text-slate-500 ">
                Monthly trajectory of batch QC approvals vs regulatory inspection scores
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50  px-3 py-1 text-xs font-bold text-emerald-700  border border-emerald-200/60 ">
              <TrendingUp className="h-3.5 w-3.5" /> +1.2% vs H2 2025
            </span>
          </div>
          <AreaChart
            className="h-72 mt-4"
            data={passRateData}
            index="month"
            categories={["QC Pass Rate (%)", "NMRA Compliance Index"]}
            colors={["indigo", "emerald"]}
            valueFormatter={(number) => `${number.toFixed(1)}%`}
            showLegend={true}
            showGridLines={false}
            curveType="monotone"
          />
        </div>

        {/* Quarantine Reasons Donut Chart */}
        <div className="rounded-2xl border border-slate-200  bg-white  p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 ">
              Quarantine Root Causes
            </h3>
            <p className="text-xs text-slate-500 ">
              Breakdown of 14 active batch holds
            </p>
            <DonutChart
              className="h-56 mt-6"
              data={quarantineReasonsData}
              category="value"
              index="name"
              colors={["indigo", "amber", "rose", "purple"]}
              valueFormatter={(val) => `${val}% of held batches`}
              showLabel={true}
              label="14 Batches"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100  text-xs text-slate-500  flex items-center justify-between">
            <span>Primary driver: Cold chain excursion</span>
            <span className="font-bold text-indigo-600 ">45%</span>
          </div>
        </div>
      </div>

      {/* ── Tier 3: Bar Chart & Recent Activity Table ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Expiry Write-Off Bar Chart */}
        <div className="rounded-2xl border border-slate-200  bg-white  p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 ">
            Expiry Write-off Value by Category
          </h3>
          <p className="text-xs text-slate-500  mb-4">
            Total pending disposal value: <b>5,190,000 LKR</b>
          </p>
          <BarChart
            className="h-64 mt-4"
            data={expiryWriteOffData}
            index="category"
            categories={["Write-off Value (LKR)"]}
            colors={["purple"]}
            valueFormatter={(val) => `₨ ${(val / 1000000).toFixed(2)}M`}
            layout="vertical"
            showGridLines={false}
            showLegend={false}
          />
        </div>

        {/* Recent Regulatory Actions Table */}
        <div className="rounded-2xl border border-slate-200  bg-white  p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 ">
                  Live Regulatory Audit Trail
                </h3>
                <p className="text-xs text-slate-500 ">
                  Recent licensing actions, quality quarantine triggers, and incineration witnessing
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600  hover:underline cursor-pointer">
                View All Records →
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200  bg-slate-50/50  text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">ID & Timestamp</th>
                    <th className="px-4 py-3">Action Type</th>
                    <th className="px-4 py-3">Target Subject</th>
                    <th className="px-4 py-3">Authority / Origin</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 ">
                  {recentRegulatoryActions.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50  transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-mono font-bold text-xs text-indigo-600 ">{row.id}</p>
                        <span className="text-[11px] text-slate-400 font-medium">{row.timestamp}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100  px-2 py-0.5 text-xs font-bold text-slate-700 ">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="font-bold text-slate-800  text-xs line-clamp-1">{row.target}</p>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{row.notes}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-600 ">
                        {row.authority}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {row.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700   border border-emerald-200/60  px-2.5 py-0.5 text-[11px] font-bold">
                            <CheckCircle2 className="h-3 w-3" /> COMPLETED
                          </span>
                        ) : row.status === "IN_PROGRESS" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700   border border-amber-200/60  px-2.5 py-0.5 text-[11px] font-bold">
                            <Clock className="h-3 w-3" /> IN PROGRESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700   border border-rose-200/60  px-2.5 py-0.5 text-[11px] font-bold animate-pulse">
                            <AlertTriangle className="h-3 w-3" /> INVESTIGATION
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100  flex items-center justify-between text-xs text-slate-500 ">
            <span>All regulatory records are cryptographically timestamped and immutable.</span>
            <span className="font-semibold text-indigo-600 ">OMACX Compliance Engine v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboardPage;
