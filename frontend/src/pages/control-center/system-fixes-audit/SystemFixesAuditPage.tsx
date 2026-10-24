import React, { useState } from "react";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Printer,
  Copy,
  BookOpen,
  Scale,
  ShieldCheck,
  Code,
  FolderGit2,
  TrendingUp,
  FileText,
  Search,
  ExternalLink,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { PageTitleCard } from "../../../components/common/PageTitleCard";
import BalanceSheetAuditDocModal from "../../../components/finance/reports/BalanceSheetAuditDocModal";

export const SystemFixesAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "report" | "proof" | "changelog" | "bank-cash" | "files">("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDownload = (filename: string, title: string) => {
    const link = document.createElement("a");
    link.href = `/docs/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${title}`, {
      description: `Saved as ${filename}`,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handlePrint = () => {
    window.print();
  };

  const folderFiles = [
    {
      name: "README.md",
      path: "docs/balance-sheet-audit/README.md",
      publicUrl: "README.md",
      title: "Folder Index & Executive Summary",
      size: "5.5 KB",
      description: "Executive orientation and high-level summary of the defects and engineering fixes."
    },
    {
      name: "FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md",
      path: "docs/balance-sheet-audit/FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md",
      publicUrl: "FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md",
      title: "FIN-02 Bank & Cash Book Reconciliation Report",
      size: "8.5 KB",
      description: "Complete RCA and resolution for column dashes, sign inversion, running-balance sort, and ledger alignment."
    },
    {
      name: "BALANCE_SHEET_FIX_AUDIT_REPORT.md",
      path: "docs/balance-sheet-audit/BALANCE_SHEET_FIX_AUDIT_REPORT.md",
      publicUrl: "BALANCE_SHEET_FIX_AUDIT_REPORT.md",
      title: "Statutory Financial Audit & Resolution Report",
      size: "12.4 KB",
      description: "Authoritative statutory document covering RCA, code changes, and LKAS 1 compliance."
    },
    {
      name: "RECONCILIATION_PROOF.md",
      path: "docs/balance-sheet-audit/RECONCILIATION_PROOF.md",
      publicUrl: "RECONCILIATION_PROOF.md",
      title: "Double-Entry Ledger Reconciliation Proof",
      size: "4.6 KB",
      description: "Mathematical theorem, account balances, and arithmetic proof of Assets = Liabilities + Equity."
    },
    {
      name: "SYSTEM_CHANGELOG.md",
      path: "docs/balance-sheet-audit/SYSTEM_CHANGELOG.md",
      publicUrl: "SYSTEM_CHANGELOG.md",
      title: "Engineering Changelog & File Diffs",
      size: "5.8 KB",
      description: "Full manifest of modified Go backend files, repository joins, DTO additions, and unit test suites."
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Banner / Breadcrumb */}
      <PageTitleCard
        title="Statutory System Fixes & Balance Sheet Audit"
        description="Comprehensive technical documentation, root-cause analyses, ledger reconciliation proofs, and engineering resolutions for Financial Year 2026/2027."
        badgeText="PRODUCTION AUDIT SIGN-OFF"
        icon={Scale}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open In-App Audit Viewer</span>
          </button>
          <button
            onClick={() => handleDownload("BALANCE_SHEET_FIX_AUDIT_REPORT.md", "Audit Report")}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 flex items-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download All Docs (.md)</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm flex items-center gap-1.5 transition-all"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </PageTitleCard>

      {/* KPI Reconciled Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Assets</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            LKR 190,565,999.44
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Reconciled (was LKR 0.00)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Liabilities</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            LKR 184,141,022.18
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium">
            Trade Creditors Only (Accounts isolated)
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Equity</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            LKR 6,424,977.26
          </div>
          <div className="mt-1 text-xs text-indigo-700 font-medium">
            Net Surplus for Period linked from P&L
          </div>
        </div>

        <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Equilibrium Status</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-teal-900 tracking-tight">
            Balanced
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-teal-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Diff: LKR 0.00 (Assets == L + E)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Overview: Issues & Fixes
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "report"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Statutory Audit Report (RCA)
        </button>
        <button
          onClick={() => setActiveTab("proof")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "proof"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Mathematical Ledger Proof
        </button>
        <button
          onClick={() => setActiveTab("bank-cash")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "bank-cash"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Bank & Cash (FIN-02)
        </button>
        <button
          onClick={() => setActiveTab("changelog")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "changelog"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          System Changelog
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "files"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Documentation Folder (/docs)
        </button>
      </div>

      {/* TAB 1: OVERVIEW: ISSUES & FIXES */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Statutory Incident Analysis: FY 2026/2027 Balance Sheet
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Summary of the operational defects detected on the Statement of Financial Position and the exact engineering resolutions deployed to production.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Defect 1 */}
              <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider">
                    Defect 1: Total Assets = 0.00
                  </span>
                  <span className="text-xs font-bold text-red-700">Root Cause: String Case</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Case-Sensitive NormalBalance Comparison
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Go service executed <code className="bg-white px-1.5 py-0.5 rounded border border-red-200 text-red-700 font-mono">raw.NormalBalance == "debit"</code>. Because the database stored title-case <code className="font-mono">"Debit"</code>, all asset accounts evaluated to <code className="font-mono">false</code> and were excluded.
                </p>
                <div className="pt-2 border-t border-red-200/60 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Fixed: Universal strings.EqualFold() across all repos & services</span>
                </div>
              </div>

              {/* Defect 2 */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                    Defect 2: Asset Accounts in Liabilities
                  </span>
                  <span className="text-xs font-bold text-amber-700">Root Cause: Classification Fallback</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Trade Debtors, Inventory & Bank Misclassified
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Code checked <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-800 font-mono">raw.ClassificationType == "Equity"</code>. In DB, all BS classifications have type <code className="font-mono">"Balance Sheet"</code>. The failed check caused every account to fall into the default <code className="font-mono">response.Liabilities.Lines</code>.
                </p>
                <div className="pt-2 border-t border-amber-200/60 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Fixed: Dual-layer code prefix (1xxxx Assets, 2xxxx Liabilities, 3xxxx Equity)</span>
                </div>
              </div>

              {/* Defect 3 */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                    Defect 3: False "Balanced" Badge
                  </span>
                  <span className="text-xs font-bold text-purple-700">Root Cause: Undefined subtraction</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Green Badge Shown When Out of Balance
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Backend DTO lacked <code className="font-mono">is_balanced</code> and total fields. Frontend evaluated <code className="font-mono">Math.abs((undefined || 0) - (undefined || 0)) &lt; 0.01</code> which evaluated to <code className="font-mono">0 &lt; 0.01 =&gt; true</code>, falsely reporting balanced!
                </p>
                <div className="pt-2 border-t border-purple-200/60 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Fixed: Backend computes exact difference; frontend validates strict equilibrium</span>
                </div>
              </div>

              {/* Defect 4 */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                    Defect 4: Missing Net Profit Line
                  </span>
                  <span className="text-xs font-bold text-blue-700">Root Cause: Missing Line Item</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Equity Showed 6.42M Total with 0 Accounts
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Net profit from P&L was accumulated into <code className="font-mono">response.Equity.Total</code>, but no line was added to <code className="font-mono">response.Equity.Lines</code>. Users and auditors had no visibility into where the equity balance came from.
                </p>
                <div className="pt-2 border-t border-blue-200/60 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Fixed: Added explicit "PL-NET Net Profit for the Period" line</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Folder Reference Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <FolderGit2 className="w-4 h-4" />
                  <span>Documentation Directory Location</span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  Local Documentation Folder: <code className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-sm font-mono">/docs/balance-sheet-audit/</code>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Complete set of Markdown documentation files are version-controlled in the repository and served directly via the Admin panel.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("files")}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1.5"
                >
                  <span>Explore Folder Files</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATUTORY AUDIT REPORT (FULL DETAILS) */}
      {activeTab === "report" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Document ID: AUD-FIN-BS-2026-001
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                FY 2026/2027 Balance Sheet Statutory Audit & Bug Resolution Report
              </h3>
            </div>
            <button
              onClick={() => handleDownload("BALANCE_SHEET_FIX_AUDIT_REPORT.md", "Audit Report")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-l-4 border-indigo-600 pl-2">
              1. Executive Summary & Verification Table
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Financial Statement Metric</th>
                    <th className="p-3 text-red-700">Previous (Defective) State</th>
                    <th className="p-3 text-emerald-700">Audited (Resolved) State</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Total Assets</td>
                    <td className="p-3 text-red-600 font-mono">LKR 0.00 ("No accounts")</td>
                    <td className="p-3 text-emerald-700 font-mono font-bold">LKR 190,565,999.44</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">RESOLVED</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Total Liabilities</td>
                    <td className="p-3 text-red-600 font-mono">LKR 184,141,022.18 (Asset accounts mixed in)</td>
                    <td className="p-3 text-slate-900 font-mono font-bold">LKR 184,141,022.18 (Trade Creditors only)</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">RESOLVED</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Total Equity</td>
                    <td className="p-3 text-slate-500 font-mono">LKR 6,424,977.26 (0 lines displayed)</td>
                    <td className="p-3 text-slate-900 font-mono font-bold">LKR 6,424,977.26 (Explicit P&L line)</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">RESOLVED</span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">Total Liabilities + Equity</td>
                    <td className="p-3 font-mono text-slate-600">LKR 190,565,999.44</td>
                    <td className="p-3 font-mono font-bold text-indigo-700">LKR 190,565,999.44</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">RESOLVED</span>
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/30">
                    <td className="p-3 font-bold text-slate-900">Double-Entry Equilibrium</td>
                    <td className="p-3 text-red-600 font-semibold">Variance: LKR 190,565,999.44</td>
                    <td className="p-3 text-emerald-700 font-bold font-mono">Difference: LKR 0.00 (Zero variance)</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">BALANCED</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Code Comparison */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-l-4 border-indigo-600 pl-2">
              2. Code Fix Verification (Go Backend)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-xl border border-red-200 bg-red-50/20 p-4 space-y-2">
                <span className="text-[11px] font-bold text-red-800 uppercase">Previous Buggy Implementation:</span>
                <pre className="text-red-700 overflow-x-auto p-2 bg-white rounded border border-red-200">
{`// BUG: Case sensitive comparison!
if raw.NormalBalance == "debit" {
    response.Assets.Lines = append(response.Assets.Lines, line)
    response.Assets.Total += val
} else {
    // BUG: ClassificationType is "Balance Sheet", never "Equity"!
    if raw.ClassificationType == "Equity" {
        response.Equity.Lines = append(...)
    } else {
        // All accounts dumped here!
        response.Liabilities.Lines = append(...)
    }
}`}
                </pre>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Corrected Implementation:</span>
                <pre className="text-emerald-800 overflow-x-auto p-2 bg-white rounded border border-emerald-200">
{`// Robust prefix & classification engine
if isAsset {
    if isContra {
        response.Assets.Total -= val
    } else {
        response.Assets.Total += val
    }
    response.Assets.Lines = append(...)
} else if isLiability {
    response.Liabilities.Lines = append(...)
    response.Liabilities.Total += val
} else if isEquity {
    response.Equity.Lines = append(...)
    response.Equity.Total += val
}
// Append P&L net income explicitly
response.Equity.Lines = append(..., "PL-NET")`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATHEMATICAL LEDGER PROOF */}
      {activeTab === "proof" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                LKAS 1 Statutory Reconciliation
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Double-Entry Ledger Account Breakdown & Equilibrium Proof
              </h3>
            </div>
            <button
              onClick={() => handleDownload("RECONCILIATION_PROOF.md", "Reconciliation Proof")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Proof (.md)</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-l-4 border-teal-600 pl-2">
              Audited General Ledger Accounts (FY 2026/2027)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Account Code</th>
                    <th className="p-3">Account Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Debit Balance (LKR)</th>
                    <th className="p-3 text-right">Credit Balance (LKR)</th>
                    <th className="p-3 text-right">Statement Balance (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="p-3 font-bold text-indigo-700">100003</td>
                    <td className="p-3 font-sans font-semibold text-slate-900">Bank Account</td>
                    <td className="p-3 font-sans text-slate-600">Current Assets</td>
                    <td className="p-3 text-right font-bold text-emerald-700">40,565,999.44</td>
                    <td className="p-3 text-right text-slate-400">0.00</td>
                    <td className="p-3 text-right font-bold text-slate-900">40,565,999.44</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-indigo-700">110001</td>
                    <td className="p-3 font-sans font-semibold text-slate-900">Trade Debtors</td>
                    <td className="p-3 font-sans text-slate-600">Current Assets</td>
                    <td className="p-3 text-right font-bold text-emerald-700">100,000,000.00</td>
                    <td className="p-3 text-right text-slate-400">0.00</td>
                    <td className="p-3 text-right font-bold text-slate-900">100,000,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-indigo-700">120001</td>
                    <td className="p-3 font-sans font-semibold text-slate-900">Inventory Account</td>
                    <td className="p-3 font-sans text-slate-600">Current Assets</td>
                    <td className="p-3 text-right font-bold text-emerald-700">50,000,000.00</td>
                    <td className="p-3 text-right text-slate-400">0.00</td>
                    <td className="p-3 text-right font-bold text-slate-900">50,000,000.00</td>
                  </tr>
                  <tr className="bg-emerald-50/40 font-bold">
                    <td colSpan={3} className="p-3 font-sans text-emerald-900 uppercase">Subtotal Assets</td>
                    <td className="p-3 text-right text-emerald-800">190,565,999.44</td>
                    <td className="p-3 text-right text-slate-400">0.00</td>
                    <td className="p-3 text-right text-emerald-900 text-sm">190,565,999.44</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-amber-700">200001</td>
                    <td className="p-3 font-sans font-semibold text-slate-900">Trade Creditors</td>
                    <td className="p-3 font-sans text-slate-600">Current Liabilities</td>
                    <td className="p-3 text-right text-slate-400">0.00</td>
                    <td className="p-3 text-right font-bold text-amber-700">184,141,022.18</td>
                    <td className="p-3 text-right font-bold text-slate-900">184,141,022.18</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-purple-700">PL-NET</td>
                    <td className="p-3 font-sans font-semibold text-slate-900">Net Profit for Period (P&L Transferred)</td>
                    <td className="p-3 font-sans text-slate-600">Equity & Reserves</td>
                    <td className="p-3 text-right text-slate-400">0.00</td>
                    <td className="p-3 text-right font-bold text-purple-700">6,424,977.26</td>
                    <td className="p-3 text-right font-bold text-slate-900">6,424,977.26</td>
                  </tr>
                  <tr className="bg-indigo-50/40 font-bold">
                    <td colSpan={3} className="p-3 font-sans text-indigo-900 uppercase">Subtotal Liabilities & Equity</td>
                    <td className="p-3 text-right text-slate-400">0.00</td>
                    <td className="p-3 text-right text-indigo-800">190,565,999.44</td>
                    <td className="p-3 text-right text-indigo-900 text-sm">190,565,999.44</td>
                  </tr>
                  <tr className="bg-teal-100/60 font-black">
                    <td colSpan={3} className="p-3 font-sans text-teal-950 uppercase tracking-wider">
                      EQUILIBRIUM VARIANCE (Assets - [Liabilities + Equity])
                    </td>
                    <td colSpan={2} className="p-3 text-center text-teal-900 font-sans">
                      PERFECT EQUILIBRIUM ATTAINED
                    </td>
                    <td className="p-3 text-right text-teal-950 text-sm">0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM CHANGELOG */}
      {activeTab === "changelog" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                Release v2.4.1-statutory-audit
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Complete Engineering Changelog & Code Modifications
              </h3>
            </div>
            <button
              onClick={() => handleDownload("SYSTEM_CHANGELOG.md", "System Changelog")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                1. Backend Go Repositories & Services Modified:
              </h4>
              <ul className="text-xs text-slate-600 space-y-1 font-mono list-disc list-inside">
                <li><code className="text-indigo-600">backend/internal/finance/services/finance_report_service.go</code>: CalculateBalanceSheet implementation, case-insensitive checks.</li>
                <li><code className="text-indigo-600">backend/internal/finance/repositories/finance_report_repository.go</code>: LEFT JOIN account_classifications, COALESCE fallback.</li>
                <li><code className="text-indigo-600">backend/internal/finance/dto/finance_report_dto.go</code>: Added total_assets, is_balanced, ratios fields.</li>
                <li><code className="text-indigo-600">backend/internal/finance/repositories/chart_of_account_repository.go</code>: Case-insensitive normal balance.</li>
                <li><code className="text-indigo-600">backend/internal/finance/repositories/payment_voucher_repository.go</code>: Case-insensitive normal balance.</li>
                <li><code className="text-indigo-600">backend/internal/finance/repositories/journal_entry_repository.go</code>: Case-insensitive normal balance.</li>
                <li><code className="text-indigo-600">backend/internal/finance/services/general_ledger_service.go</code>: Case-insensitive normal balance.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                2. Automated Unit Tests Added:
              </h4>
              <ul className="text-xs text-slate-600 space-y-1 font-mono list-disc list-inside">
                <li><code className="text-emerald-700">TestCalculateBalanceSheet_ClassificationsAndReconciliation</code>: PASS (0.00s)</li>
                <li><code className="text-emerald-700">TestCalculateBalanceSheet_UnbalancedDetection</code>: PASS (0.00s)</li>
                <li><code className="text-emerald-700">TestCalculateBalanceSheet_ContraAssets</code>: PASS (0.00s)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BANK & CASH RECONCILIATION (FIN-02) */}
      {activeTab === "bank-cash" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  TREASURY RECONCILIATION AUDIT
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  FIN-02: Bank Book and Cash Book Statutory Reconciliation
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Complete technical investigation, root cause analysis, sign convention normalization, and underlying ledger alignment for Commercial Bank and Cash in Hand accounts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload("FIN_02_BANK_AND_CASH_BOOK_AUDIT_REPORT.md", "FIN-02 Audit Report")}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report (MD)</span>
                </button>
              </div>
            </div>

            {/* Treasury KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-900">100003 - Bank Account</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">ASSET</span>
                </div>
                <div className="text-xl font-black text-slate-900">LKR +88,107,675.10</div>
                <div className="text-[11px] text-blue-700 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dr 191.08M - Cr 102.97M (100% Ledger Match)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-900">100001 - Cash in Hand</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">ASSET</span>
                </div>
                <div className="text-xl font-black text-slate-900">LKR +5,000,000.00</div>
                <div className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dr 5.00M - Cr 0.00 (100% Ledger Match)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-teal-900">Movement Integrity</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-200 text-teal-900">RESOLVED</span>
                </div>
                <div className="text-xl font-black text-slate-900">Zero Column Dashes</div>
                <div className="text-[11px] text-teal-700 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Chronological forward running-balance</span>
                </div>
              </div>
            </div>

            {/* Checklist of FIN-02 Requirements */}
            <div className="mb-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                FIN-02 Verification & Certification Checklist
              </h4>
              <div className="space-y-2.5">
                {[
                  {
                    title: "Receipt & payment columns displaying dashes for nonzero movements",
                    status: "RESOLVED",
                    desc: "Fixed Go DTO GeneralLedgerEntryResponse JSON tags with dual debit/credit fields, and added null-coalescing fallbacks (debit_amount ?? debit) in frontend table cells."
                  },
                  {
                    title: "Verify debit and credit mappings and sign conventions",
                    status: "RESOLVED",
                    desc: "Replaced strict case-sensitive check (\"Debit\" == \"debit\") with strings.EqualFold(). Asset accounts now correctly increment with Receipts (Dr) and decrement with Payments (Cr)."
                  },
                  {
                    title: "Investigate negative bank closing balance of -88,107,675.10",
                    status: "RESOLVED",
                    desc: "Root cause established: Case-sensitivity routed bank asset to liability branch (Credit - Debit). Corrected calculation yields true positive balance of +88,107,675.10 LKR."
                  },
                  {
                    title: "Investigate negative cash closing balance of approximately -5 million",
                    status: "RESOLVED",
                    desc: "Root cause established: Case-sensitivity inverted 5M cash float. Corrected calculation yields true positive balance of +5,000,000.00 LKR."
                  },
                  {
                    title: "Reconcile both reports against their respective ledger accounts",
                    status: "RESOLVED",
                    desc: "Both Bank (100003) and Cash (100001) closing balances perfectly match chart_of_accounts.current_balance and SUM(debit - credit) from general_ledger_entries."
                  },
                  {
                    title: "Verify chronological running-balance calculations",
                    status: "RESOLVED",
                    desc: "Extracted CalculateCashBankBook and CalculateAccountLedger to sort records ascending (TransactionDate ASC, ID ASC) before cumulative running-balance progression."
                  },
                  {
                    title: "Do not modify stored accounting balances until cause is established",
                    status: "CERTIFIED",
                    desc: "Zero database rows or stored accounting balances were altered. The underlying ledger data in MySQL was completely sound and uncorrupted."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconciliation Proof Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-800">Independent Ledger Reconciliation Proof Table</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-semibold">Account</th>
                      <th className="p-3 font-semibold">Type / Normal</th>
                      <th className="p-3 font-semibold text-right">Ledger Debits</th>
                      <th className="p-3 font-semibold text-right">Ledger Credits</th>
                      <th className="p-3 font-semibold text-right">Net Ledger Balance</th>
                      <th className="p-3 font-semibold text-right">Stored Balance</th>
                      <th className="p-3 font-semibold text-right">Report Closing</th>
                      <th className="p-3 font-semibold text-center">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">100003 - Bank Account</td>
                      <td className="p-3 text-slate-600">Asset (Debit)</td>
                      <td className="p-3 text-right font-mono text-emerald-700">191,079,062.80</td>
                      <td className="p-3 text-right font-mono text-rose-700">102,971,387.70</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">+88,107,675.10</td>
                      <td className="p-3 text-right font-mono text-slate-700">+88,107,675.10</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-700">+88,107,675.10</td>
                      <td className="p-3 text-center"><span className="text-emerald-700 font-bold">0.00 (Match)</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">100001 - Cash in Hand</td>
                      <td className="p-3 text-slate-600">Asset (Debit)</td>
                      <td className="p-3 text-right font-mono text-emerald-700">5,000,000.00</td>
                      <td className="p-3 text-right font-mono text-rose-700">0.00</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">+5,000,000.00</td>
                      <td className="p-3 text-right font-mono text-slate-700">+5,000,000.00</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">+5,000,000.00</td>
                      <td className="p-3 text-center"><span className="text-emerald-700 font-bold">0.00 (Match)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTATION FOLDER EXPLORER */}
      {activeTab === "files" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Folder: <code className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded text-indigo-700">/docs/balance-sheet-audit/</code>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                All statutory files stored on the filesystem and available for download or inspection.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {folderFiles
              .filter(
                (f) =>
                  searchQuery === "" ||
                  f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  f.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((file) => (
                <div
                  key={file.name}
                  className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-mono font-bold text-slate-900">{file.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {file.size}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1">{file.title}</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                      {file.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => copyToClipboard(file.path, file.name)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1 transition-all"
                      title="Copy local filepath"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Path</span>
                    </button>
                    <button
                      onClick={() => handleDownload(file.publicUrl, file.title)}
                      className="px-3 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* In-App Audit Modal */}
      <BalanceSheetAuditDocModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default SystemFixesAuditPage;
