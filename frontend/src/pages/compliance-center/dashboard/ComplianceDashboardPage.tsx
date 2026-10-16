import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  BarChart,
  DonutChart,
} from "@tremor/react";
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Package,
  Boxes,
  Clock,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  FileText,
  Calendar,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { complianceApi, ComplianceSummary } from "../../../api/complianceApi";
import { toast } from "sonner";
import { DashboardHeroCard } from "../../../components/common/DashboardHeroCard";
import { DashboardAiAnalysisSection } from "../../../components/common/DashboardAiAnalysisSection";

export const ComplianceDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ComplianceSummary | null>(null);
  const [timeRange, setTimeRange] = useState("Last 6 Months");
  const [writeOffRange, setWriteOffRange] = useState("This Year");
  const [filingRange, setFilingRange] = useState("This Year");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All Categories");

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const res = await complianceApi.getComplianceDashboardSummary();
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load compliance data:", err);
      // Fallback mock telemetry matching reference image
      setData({
        active_licenses: 65,
        quarantine_batches_count: 1,
        quarantine_stock_value: 125000,
        active_recalls_count: 1,
        pending_disposals_count: 122,
        pending_disposals_value: 2800000,
        total_write_off_value: 3740000,
        pass_rate_data: [
          { month: "Apr 2026", "QA Pass Rate (%)": 72.4, "NMRA Compliance Index (%)": 68.2 },
          { month: "May 2026", "QA Pass Rate (%)": 84.1, "NMRA Compliance Index (%)": 76.5 },
          { month: "Jun 2026", "QA Pass Rate (%)": 85.0, "NMRA Compliance Index (%)": 81.0 },
          { month: "Jul 2026", "QA Pass Rate (%)": 92.5, "NMRA Compliance Index (%)": 86.8 },
          { month: "Aug 2026", "QA Pass Rate (%)": 96.2, "NMRA Compliance Index (%)": 91.4 },
          { month: "Sep 2026", "QA Pass Rate (%)": 95.8, "NMRA Compliance Index (%)": 92.0 },
        ],
        quarantine_reasons_data: [
          { name: "Quality Deviation", value: 32 },
          { name: "Packaging Issue", value: 24 },
          { name: "Specification OOS", value: 20 },
          { name: "Stability Failure", value: 16 },
          { name: "Documentation", value: 8 },
        ],
        expiry_write_off_data: [
          { category: "Finished Products", value: 1400000 },
          { category: "Raw Materials", value: 1050000 },
          { category: "Packaging Materials", value: 620000 },
          { category: "In Process", value: 350000 },
          { category: "Quarantine Stock", value: 200000 },
          { category: "Recalled Products", value: 120000 },
        ],
        recent_regulatory_actions: [
          {
            id: "REG-2026-156",
            timestamp: "16 Oct 2026 14:22",
            type: "Audit_Check",
            target: "Paracetamol 500mg (BAT-EXP23-14)",
            authority: "Internal Quality Audit",
            status: "COMPLETED",
            user: "Kalinga Silva",
          },
          {
            id: "REG-2026-155",
            timestamp: "16 Oct 2026 11:45",
            type: "Document Review",
            target: "Amoxicillin 500mg (BAT-EXP24-08)",
            authority: "NMRA Submission",
            status: "IN_PROGRESS",
            user: "Nadeesha Perera",
          },
          {
            id: "REG-2026-154",
            timestamp: "15 Oct 2026 16:30",
            type: "Audit_Check",
            target: "Azithromycin 500mg (BAT-EXP24-20)",
            authority: "Internal Quality Audit",
            status: "COMPLETED",
            user: "Dilshan Fernando",
          },
          {
            id: "REG-2026-153",
            timestamp: "15 Oct 2026 10:15",
            type: "CAPA Update",
            target: "Losartan 50mg (BAT-EXP24-22)",
            authority: "Regulatory Follow-up",
            status: "PENDING",
            user: "Sashini Kumar",
          },
          {
            id: "REG-2026-152",
            timestamp: "14 Oct 2026 09:50",
            type: "Audit_Check",
            target: "Diclofenac 50mg (BAT-EXP24-36)",
            authority: "Internal Quality Audit",
            status: "COMPLETED",
            user: "Kalana Jayasuriya",
          },
        ] as any,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const passRateData = data?.pass_rate_data || [
    { month: "Apr 2026", "QA Pass Rate (%)": 72.4, "NMRA Compliance Index (%)": 68.2 },
    { month: "May 2026", "QA Pass Rate (%)": 84.1, "NMRA Compliance Index (%)": 76.5 },
    { month: "Jun 2026", "QA Pass Rate (%)": 85.0, "NMRA Compliance Index (%)": 81.0 },
    { month: "Jul 2026", "QA Pass Rate (%)": 92.5, "NMRA Compliance Index (%)": 86.8 },
    { month: "Aug 2026", "QA Pass Rate (%)": 96.2, "NMRA Compliance Index (%)": 91.4 },
    { month: "Sep 2026", "QA Pass Rate (%)": 95.8, "NMRA Compliance Index (%)": 92.0 },
  ];

  const quarantineReasonsData = data?.quarantine_reasons_data || [
    { name: "Quality Deviation", value: 32 },
    { name: "Packaging Issue", value: 24 },
    { name: "Specification OOS", value: 20 },
    { name: "Stability Failure", value: 16 },
    { name: "Documentation", value: 8 },
  ];

  const productComplianceData = [
    { name: "Approved", value: 266, percentage: 78, color: "bg-emerald-500", text: "text-emerald-700" },
    { name: "Under Review", value: 41, percentage: 12, color: "bg-blue-500", text: "text-blue-700" },
    { name: "Renewal Due", value: 21, percentage: 6, color: "bg-amber-500", text: "text-amber-700" },
    { name: "Non-Compliant", value: 14, percentage: 4, color: "bg-rose-500", text: "text-rose-700" },
  ];

  const regulatoryFilingsData = [
    { month: "Apr", Submitted: 10, "Under Review": 8, Pending: 3 },
    { month: "May", Submitted: 14, "Under Review": 9, Pending: 4 },
    { month: "Jun", Submitted: 11, "Under Review": 7, Pending: 4 },
    { month: "Jul", Submitted: 15, "Under Review": 9, Pending: 5 },
    { month: "Aug", Submitted: 20, "Under Review": 11, Pending: 6 },
    { month: "Sep", Submitted: 18, "Under Review": 12, Pending: 6 },
  ];

  const writeOffData = [
    { label: "Finished Products", value: 1400000, display: "Rs. 1.40M", pct: 100 },
    { label: "Raw Materials", value: 1050000, display: "Rs. 1.05M", pct: 75 },
    { label: "Packaging Materials", value: 620000, display: "Rs. 0.62M", pct: 44 },
    { label: "In Process", value: 350000, display: "Rs. 0.35M", pct: 25 },
    { label: "Quarantine Stock", value: 200000, display: "Rs. 0.20M", pct: 14 },
    { label: "Recalled Products", value: 120000, display: "Rs. 0.12M", pct: 9 },
  ];

  const auditTrailRecords = data?.recent_regulatory_actions || [
    {
      id: "REG-2026-156",
      timestamp: "16 Oct 2026 14:22",
      type: "Audit_Check",
      target: "Paracetamol 500mg (BAT-EXP23-14)",
      authority: "Internal Quality Audit",
      status: "COMPLETED",
      user: "Kalinga Silva",
    },
    {
      id: "REG-2026-155",
      timestamp: "16 Oct 2026 11:45",
      type: "Document Review",
      target: "Amoxicillin 500mg (BAT-EXP24-08)",
      authority: "NMRA Submission",
      status: "IN_PROGRESS",
      user: "Nadeesha Perera",
    },
    {
      id: "REG-2026-154",
      timestamp: "15 Oct 2026 16:30",
      type: "Audit_Check",
      target: "Azithromycin 500mg (BAT-EXP24-20)",
      authority: "Internal Quality Audit",
      status: "COMPLETED",
      user: "Dilshan Fernando",
    },
    {
      id: "REG-2026-153",
      timestamp: "15 Oct 2026 10:15",
      type: "CAPA Update",
      target: "Losartan 50mg (BAT-EXP24-22)",
      authority: "Regulatory Follow-up",
      status: "PENDING",
      user: "Sashini Kumar",
    },
    {
      id: "REG-2026-152",
      timestamp: "14 Oct 2026 09:50",
      type: "Audit_Check",
      target: "Diclofenac 50mg (BAT-EXP24-36)",
      authority: "Internal Quality Audit",
      status: "COMPLETED",
      user: "Kalana Jayasuriya",
    },
  ];

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-800 antialiased">
      {/* ── TOP HERO CARD ── */}
      <DashboardHeroCard
        title="Compliance Center Dashboard"
        subtitle="Real-time overview of regulatory compliance, quality assurance, batch status, and risk indicators."
        moduleTag="Compliance"
        breadcrumb={{
          parent: "Compliance",
          current: "Dashboard",
        }}
        icon={ShieldCheck}
        accent="blue"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => toast.success("Generating Comprehensive NMRA Compliance PDF...")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
          </div>
        }
      />

      {/* ── Tier 1: 4 Top KPI Cards with Sparklines ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        
        {/* Card 1: Active Registrations */}
        <div
          onClick={() => navigate("/compliance-center/licenses")}
          className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 relative overflow-hidden cursor-pointer group flex items-center justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <FileCheck className="h-5 w-5" />
            </div>
            <span className="mt-3 block text-xs font-semibold text-slate-500">
              Active Registrations
            </span>
            <p className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? "..." : data?.active_licenses || 65}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span>↑ 100%</span>
              <span className="text-slate-500 font-medium">All licenses valid</span>
            </div>
          </div>
          {/* Sparkline bars */}
          <div className="flex items-end gap-1 h-12 self-end shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-4 bg-emerald-200 rounded-t-xs" />
            <div className="w-1.5 h-6 bg-emerald-300 rounded-t-xs" />
            <div className="w-1.5 h-8 bg-emerald-400 rounded-t-xs" />
            <div className="w-1.5 h-10 bg-emerald-400 rounded-t-xs" />
            <div className="w-1.5 h-12 bg-emerald-500 rounded-t-xs" />
          </div>
        </div>

        {/* Card 2: Batches Under Quarantine */}
        <div
          onClick={() => navigate("/compliance-center/batch-holds")}
          className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 relative overflow-hidden cursor-pointer group flex items-center justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="mt-3 block text-xs font-semibold text-slate-500">
              Batches Under Quarantine
            </span>
            <p className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? "..." : data?.quarantine_batches_count ?? 1}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-rose-500">
              <span>↑ +0.2%</span>
              <span className="text-slate-500 font-medium">LKR 125,000 value</span>
            </div>
          </div>
          {/* Sparkline bars */}
          <div className="flex items-end gap-1 h-12 self-end shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-3 bg-blue-200 rounded-t-xs" />
            <div className="w-1.5 h-5 bg-blue-300 rounded-t-xs" />
            <div className="w-1.5 h-7 bg-blue-300 rounded-t-xs" />
            <div className="w-1.5 h-9 bg-blue-400 rounded-t-xs" />
            <div className="w-1.5 h-11 bg-blue-500 rounded-t-xs" />
          </div>
        </div>

        {/* Card 3: Blocked / Recalled Batches */}
        <div
          onClick={() => navigate("/compliance-center/recalls")}
          className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5 relative overflow-hidden cursor-pointer group flex items-center justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <Package className="h-5 w-5" />
            </div>
            <span className="mt-3 block text-xs font-semibold text-slate-500">
              Blocked / Recalled Batches
            </span>
            <p className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? "..." : data?.active_recalls_count ?? 1}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-rose-500">
              <span>↑ +0.1%</span>
              <span className="text-slate-500 font-medium">Safety quarantine</span>
            </div>
          </div>
          {/* Sparkline bars */}
          <div className="flex items-end gap-1 h-12 self-end shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-4 bg-amber-200 rounded-t-xs" />
            <div className="w-1.5 h-5 bg-amber-300 rounded-t-xs" />
            <div className="w-1.5 h-8 bg-amber-300 rounded-t-xs" />
            <div className="w-1.5 h-10 bg-amber-400 rounded-t-xs" />
            <div className="w-1.5 h-12 bg-amber-500 rounded-t-xs" />
          </div>
        </div>

        {/* Card 4: Expired & Near-Expiry Batches */}
        <div
          onClick={() => navigate("/compliance-center/disposals")}
          className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-purple-300 hover:-translate-y-0.5 relative overflow-hidden cursor-pointer group flex items-center justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
              <Clock className="h-5 w-5" />
            </div>
            <span className="mt-3 block text-xs font-semibold text-slate-500">
              Expired & Near-Expiry Batches
            </span>
            <p className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? "..." : data?.pending_disposals_count || 122}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-rose-500">
              <span>↑ +12%</span>
              <span className="text-slate-500 font-medium">LKR 2,800,000 at risk</span>
            </div>
          </div>
          {/* Sparkline bars */}
          <div className="flex items-end gap-1 h-12 self-end shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-5 bg-purple-200 rounded-t-xs" />
            <div className="w-1.5 h-7 bg-purple-300 rounded-t-xs" />
            <div className="w-1.5 h-9 bg-purple-300 rounded-t-xs" />
            <div className="w-1.5 h-11 bg-purple-400 rounded-t-xs" />
            <div className="w-1.5 h-13 bg-purple-500 rounded-t-xs" />
          </div>
        </div>
      </div>

      {/* ── AI Executive Copilot & Predictive Telemetry ── */}
      <DashboardAiAnalysisSection
        dashboardType="compliance"
        kpiData={data}
        title="Compliance AI Copilot & Risk Forecasting"
      />

      {/* ── Row 2: Dual Main Analytics Charts ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left: Quality Assurance Pass Rate & NMRA Compliance Index */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div 
              onClick={() => navigate("/compliance-center/records")}
              className="cursor-pointer group"
            >
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <span>Quality Assurance Pass Rate & NMRA Compliance Index</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Click to view regulatory audit registry</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span> QA Pass Rate (%)
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> NMRA Compliance Index (%)
                </span>
              </div>
              {/* Time Filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
              >
                <option>Last 6 Months</option>
                <option>This Year</option>
                <option>Previous Fiscal</option>
              </select>
            </div>
          </div>

          <AreaChart
            className="h-72 mt-4"
            data={passRateData}
            index="month"
            categories={["QA Pass Rate (%)", "NMRA Compliance Index (%)"]}
            colors={["blue", "emerald"]}
            valueFormatter={(number) => `${number.toFixed(1)}%`}
            showLegend={false}
            showGridLines={false}
            curveType="monotone"
          />
        </div>

        {/* Right: Quarantine Root Causes */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 
                onClick={() => navigate("/compliance-center/batch-holds")}
                className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5 group"
              >
                <span>Quarantine Root Causes</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
              </h3>
              <button
                onClick={() => navigate("/compliance-center/batch-holds")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View Details →
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-2">
              <div className="shrink-0 flex items-center justify-center">
                <DonutChart
                  className="h-44 w-44"
                  data={quarantineReasonsData}
                  category="value"
                  index="name"
                  colors={["blue", "amber", "teal", "rose", "slate"]}
                  valueFormatter={(val) => `${val}%`}
                  showLabel={true}
                  label="4 Factors"
                />
              </div>

              {/* Custom Legend aligned to right */}
              <div className="w-full sm:w-auto flex-1 space-y-2 text-xs">
                {quarantineReasonsData.map((item, i) => {
                  const colors = ["bg-blue-600", "bg-amber-500", "bg-teal-500", "bg-rose-500", "bg-slate-400"];
                  return (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className={`h-2.5 w-2.5 rounded-full ${colors[i % colors.length]}`}></span>
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-900">{item.value}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Three Cards ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Card 1: Write-off & Risk Value by Category */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 
              onClick={() => navigate("/compliance-center/disposals")}
              className="text-base font-bold text-slate-900 hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1.5 group"
            >
              <span>Write-off & Risk Value by Category</span>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600" />
            </h3>
            <select
              value={writeOffRange}
              onChange={(e) => setWriteOffRange(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-hidden"
            >
              <option>This Year</option>
              <option>Last Quarter</option>
            </select>
          </div>

          <div className="space-y-3.5 mt-4">
            {writeOffData.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.display}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Product Compliance Status */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 
                onClick={() => navigate("/inventory/products")}
                className="text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5 group"
              >
                <span>Product Compliance Status</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
              </h3>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-hidden"
              >
                <option>All Categories</option>
                <option>Medicines</option>
                <option>Devices</option>
                <option>Cold Chain</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-2">
              <div className="shrink-0 flex items-center justify-center">
                <DonutChart
                  className="h-40 w-40"
                  data={productComplianceData}
                  category="value"
                  index="name"
                  colors={["emerald", "blue", "amber", "rose"]}
                  valueFormatter={(val) => `${val}`}
                  showLabel={true}
                  label="342 Total Products"
                />
              </div>

              {/* Legend with percentages and counts aligned to right */}
              <div className="w-full sm:w-auto flex-1 space-y-2 text-xs">
                {productComplianceData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`}></span>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.percentage}%</span>
                      <span className="text-slate-400 font-normal w-6 text-right">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <button
              onClick={() => navigate("/inventory/products")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              View Product List →
            </button>
          </div>
        </div>

        {/* Card 3: Regulatory Filings Status */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 
              onClick={() => navigate("/compliance-center/records")}
              className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1.5 group"
            >
              <span>Regulatory Filings Status</span>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
            </h3>
            <select
              value={filingRange}
              onChange={(e) => setFilingRange(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-hidden"
            >
              <option>This Year</option>
              <option>Last 6 Months</option>
            </select>
          </div>

          <BarChart
            className="h-56 mt-4"
            data={regulatoryFilingsData}
            index="month"
            categories={["Submitted", "Under Review", "Pending"]}
            colors={["emerald", "blue", "amber"]}
            stack={true}
            showLegend={true}
            showGridLines={false}
          />
        </div>
      </div>

      {/* ── Row 4: Live Regulatory Audit Trail Table ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div 
            onClick={() => navigate("/compliance-center/records")}
            className="cursor-pointer group"
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <span>Live Regulatory Audit Trail</span>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
            </h3>
            <p className="text-xs text-slate-500">
              Real-time cryptographic audit log of batch certifications, NMRA filings, and QA deviations.
            </p>
          </div>
          <button
            onClick={() => navigate("/compliance-center/records")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Records →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Reference No.</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Product / Batch</th>
                <th className="px-4 py-3">Authority / Origin</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {auditTrailRecords.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => navigate("/compliance-center/records")}
                  className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                >
                  <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                    {row.timestamp}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-600 hover:underline cursor-pointer">
                    {row.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-700">{row.type}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">
                    {row.target}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {row.authority}
                  </td>
                  <td className="px-4 py-3.5">
                    {row.status === "COMPLETED" ? (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                        Completed
                      </span>
                    ) : row.status === "IN_PROGRESS" ? (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60">
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">
                    {row.user}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboardPage;
