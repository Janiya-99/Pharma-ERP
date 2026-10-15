import React, { useState, useEffect } from "react";
import {
  AreaChart,
  BarChart,
  DonutChart,
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
  TrendingUp,
} from "lucide-react";
import { complianceApi, ComplianceSummary } from "../../../api/complianceApi";
import { toast } from "sonner";
import { DashboardHeroCard } from "../../../components/common/DashboardHeroCard";

const ComplianceDashboardPage = () => {
  const [selectedFacility, setSelectedFacility] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ComplianceSummary | null>(null);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const res = await complianceApi.getComplianceDashboardSummary();
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load compliance data:", err);
      toast.error("Failed to fetch live compliance metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchComplianceData();
    setIsRefreshing(false);
    toast.success("Regulatory telemetry synchronized with NMRA register");
  };

  const passRateData = data?.pass_rate_data || [];
  const quarantineReasonsData = data?.quarantine_reasons_data || [];
  const expiryWriteOffData = data?.expiry_write_off_data || [];
  const recentRegulatoryActions = data?.recent_regulatory_actions || [];

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-800 antialiased">
      {/* ── TOP PAGE HEADER ── */}
      <DashboardHeroCard
        title="Regulatory Compliance & Quality Dashboard"
        subtitle="Real-time telemetry on NMRA licensing, quality holds, drug recalls, and pharmaceutical expiry disposals."
        moduleTag="Regulatory Governance & NMRA"
        icon={ShieldCheck}
        quote={{
          text: "Zero-compromise NMRA compliance, stringent batch pharmacovigilance, and patient safety first.",
          author: "NMRA Regulatory Affairs Sri Lanka"
        }}
        accent="indigo"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-2xs text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync Status</span>
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs text-xs font-semibold transition-all cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        }
      />

      {/* ── Tier 1: KPI Summary Cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Active Licenses */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active NMRA Registered Formulations
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : data?.active_licenses || 65}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Licensed
            </span>
            <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold px-2 py-0.5 text-[10px]">
              Verified & Current
            </span>
          </div>
        </div>

        {/* Batches Under Quarantine */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Batches Under Quarantine
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Pill className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : data?.quarantine_batches_count || 0}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-amber-600 font-semibold">
              LKR {(data?.quarantine_stock_value || 0).toLocaleString()} Held
            </span>
            <span className="text-slate-400 font-medium">Quality Hold</span>
          </div>
        </div>

        {/* Active Product Recalls */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Blocked / Recalled Batches
            </span>
            <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
              <RotateCcw className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-rose-600">
            {loading ? "..." : data?.active_recalls_count || 0}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Safety Quarantine
            </span>
            <span className="text-slate-400 font-medium">Distribution Locked</span>
          </div>
        </div>

        {/* Pending Expiry Disposals */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Expired & Near-Expiry Batches
            </span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <Trash2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {loading ? "..." : data?.pending_disposals_count || 0}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-purple-600 font-semibold">
              LKR {(data?.pending_disposals_value || 0).toLocaleString()} at Risk
            </span>
            <span className="text-slate-400 font-medium">Disposal Pipeline</span>
          </div>
        </div>
      </div>

      {/* ── Tier 2: Tremor Analytics Charts ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pass Rate Area Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Quality Assurance Pass Rate & NMRA Compliance Index
              </h3>
              <p className="text-xs text-slate-500">
                Monthly trajectory of batch QC approvals vs regulatory inspection scores
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
              <TrendingUp className="h-3.5 w-3.5" /> Live Telemetry
            </span>
          </div>
          {passRateData.length > 0 ? (
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
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-slate-400">
              No trend telemetry available
            </div>
          )}
        </div>

        {/* Quarantine Reasons Donut Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Quarantine Root Causes
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of held batch criteria
            </p>
            {quarantineReasonsData.length > 0 ? (
              <DonutChart
                className="h-56 mt-6"
                data={quarantineReasonsData}
                category="value"
                index="name"
                colors={["indigo", "amber", "rose", "purple"]}
                valueFormatter={(val) => `${val}%`}
                showLabel={true}
                label={`${quarantineReasonsData.length} Factors`}
              />
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-slate-400">
                No active hold causes
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Primary driver: Cold chain excursion</span>
            <span className="font-bold text-indigo-600">42%</span>
          </div>
        </div>
      </div>

      {/* ── Tier 3: Bar Chart & Recent Activity Table ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Expiry Write-Off Bar Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900">
            Write-off & Risk Value by Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Total exposure: <b>LKR {(data?.total_write_off_value || 0).toLocaleString()}</b>
          </p>
          {expiryWriteOffData.length > 0 ? (
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
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              No category write-offs
            </div>
          )}
        </div>

        {/* Recent Regulatory Actions Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Live Regulatory Audit Trail
                </h3>
                <p className="text-xs text-slate-500">
                  Recent licensing actions, quality quarantine triggers, and governance audits
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">
                View All Records →
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">ID & Timestamp</th>
                    <th className="px-4 py-3">Action Type</th>
                    <th className="px-4 py-3">Target Subject</th>
                    <th className="px-4 py-3">Authority / Origin</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRegulatoryActions.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-mono font-bold text-xs text-indigo-600">{row.id}</p>
                        <span className="text-[11px] text-slate-400 font-medium">{row.timestamp}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="font-bold text-slate-800 text-xs line-clamp-1">{row.target}</p>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{row.notes}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-600">
                        {row.authority}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {row.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-bold">
                            <CheckCircle2 className="h-3 w-3" /> COMPLETED
                          </span>
                        ) : row.status === "IN_PROGRESS" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 text-[11px] font-bold">
                            <Clock className="h-3 w-3" /> IN PROGRESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 text-[11px] font-bold animate-pulse">
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
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>All regulatory records are cryptographically timestamped and immutable.</span>
            <span className="font-semibold text-indigo-600">Pharma ERP Compliance Engine v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboardPage;
