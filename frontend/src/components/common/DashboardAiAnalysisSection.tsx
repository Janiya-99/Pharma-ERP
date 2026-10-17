import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Bot,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAiCopilot } from "../../context/AiCopilotContext";
import {
  generateAiDashboardAnalysis,
  AiDashboardAnalysisResult,
} from "../../services/geminiService";
import { toast } from "sonner";

interface DashboardAiAnalysisSectionProps {
  dashboardType: "compliance" | "finance" | "inventory" | "invoice_center";
  kpiData: any;
  title?: string;
  className?: string;
}

const PRESET_DASHBOARD_PROMPTS: Record<string, string[]> = {
  compliance: [
    "Audit 122 near-expiry batches and quantify financial write-off exposure",
    "Investigate root causes behind current batch quarantine holds",
    "Forecast NMRA license renewals due in next 90 days",
    "Analyze QA pass rate vs NMRA compliance index correlation",
  ],
  finance: [
    "Stress test 90-day cash flow against supplier payment obligations",
    "Identify top 5 highest credit risk customers with overdue AR balances",
    "Analyze operating expense variance and margin erosion drivers",
    "Recommend treasury rebalancing across Bank of Ceylon & Commercial Bank",
  ],
  inventory: [
    "Identify stockout risk on fast-moving antibiotics and cardiovascular lines",
    "Formulate warehouse rebalancing plan for Kandy & Galle regional depots",
    "Audit slow-moving formulations and recommend FEFO clearance strategy",
    "Verify cold-chain compliance and temperature excursions",
  ],
  invoice_center: [
    "Forecast weekly invoice collection velocity for active hospital accounts",
    "Audit sales return frequency and credit note margin deductions",
    "Identify credit limit breach candidates among wholesale pharmacies",
  ],
};

export const DashboardAiAnalysisSection: React.FC<DashboardAiAnalysisSectionProps> = ({
  dashboardType,
  kpiData,
  title = "AI Executive Copilot & Predictive Telemetry",
  className = "",
}) => {
  const { openCopilot } = useAiCopilot();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiDashboardAnalysisResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const presets = PRESET_DASHBOARD_PROMPTS[dashboardType] || PRESET_DASHBOARD_PROMPTS.compliance;

  const handleAnalyze = async (queryText?: string) => {
    const q = (queryText || prompt).trim();
    setLoading(true);
    try {
      const res = await generateAiDashboardAnalysis(dashboardType, kpiData, q || undefined);
      setResult(res);
      setIsExpanded(true);
      if (q) setPrompt("");
    } catch (err: any) {
      console.error("Dashboard analysis error:", err);
      toast.error("Failed to generate AI analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 p-5 sm:p-6 shadow-xs backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live executive reasoning, operational risk scoring, and prescriptive pharmaceutical decisions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => openCopilot("chat", prompt || `Deep dive into ${dashboardType} analytics`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/90 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Bot className="h-3.5 w-3.5 text-indigo-600" />
            <span>Launch Chatbot</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Prompt input bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAnalyze();
                  }
                }}
                placeholder={`Ask AI to analyze this dashboard (or select a preset below)...`}
                disabled={loading}
                className="w-full rounded-xl border border-indigo-200/80 bg-white/90 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>{loading ? "Analyzing Telemetry..." : "Run AI Analysis"}</span>
            </button>
          </div>

          {/* Preset Prompts Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Suggested:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnalyze(p)}
                disabled={loading}
                className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-white/80 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-lg px-2.5 py-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer truncate max-w-xs sm:max-w-md"
                title={p}
              >
                <Sparkles className="h-2.5 w-2.5 text-indigo-500 shrink-0" />
                <span className="truncate">{p}</span>
              </button>
            ))}
          </div>

          {/* AI Analysis Result Card */}
          {result && (
            <div className="mt-4 rounded-2xl border border-indigo-100 bg-white/95 p-5 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                    Synthesized Executive Intelligence
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                    {result.headline}
                  </h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Health Index</span>
                    <span className="text-sm font-extrabold text-emerald-800">{result.healthScore}%</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {result.executiveSummary}
              </p>

              {/* Risks & Opportunities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Risks */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Identified Risks & Exposures</span>
                  </div>
                  <div className="space-y-2">
                    {result.risks.map((risk, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{risk.title}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                            risk.severity === "high" ? "bg-rose-200 text-rose-800" :
                            risk.severity === "medium" ? "bg-amber-200 text-amber-800" : "bg-slate-200 text-slate-700"
                          }`}>
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{risk.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opportunities */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Margin & Operational Opportunities</span>
                  </div>
                  <div className="space-y-2">
                    {result.opportunities.map((opp, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <span className="font-bold text-slate-900 block">{opp.title}</span>
                        <p className="text-[11px] text-slate-600">{opp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" /> Prescribed Action Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60 text-xs text-slate-700 shadow-2xs">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[11px] leading-tight">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default DashboardAiAnalysisSection;
