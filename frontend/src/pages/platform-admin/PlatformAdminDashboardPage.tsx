import React, { useState, useEffect } from "react";
import {
  getPlatformCompanies,
  getPlatformSubscriptions,
  getPlatformInvoices,
  getPlatformSupportTickets,
  suspendPlatformCompany,
  activatePlatformCompany,
  extendPlatformCompanyLicense,
  getPlatformBlockedIPs,
  unblockPlatformIP,
} from "../../api/platformAdminApi";
import {
  Building2,
  Landmark,
  ShieldCheck,
  Activity,
  Ticket,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  Flame,
  TrendingUp,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AICompanyEvaluationModal from "../../components/platform-admin/AICompanyEvaluationModal";
import { evaluateCompanyAI } from "../../services/aiCompanyEvaluation";

const PlatformAdminDashboardPage = () => {
  const [metrics, setMetrics] = useState({
    totalCompanies: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    pendingTickets: 0,
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);
  const [unblockingIP, setUnblockingIP] = useState<string | null>(null);
  const [quickUnblockInput, setQuickUnblockInput] = useState("");

  // AI Evaluation Modal State
  const [selectedAICompany, setSelectedAICompany] = useState<any | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, subRes, invRes, ticketRes, blockedRes] = await Promise.all([
        getPlatformCompanies(),
        getPlatformSubscriptions(),
        getPlatformInvoices(),
        getPlatformSupportTickets(),
        getPlatformBlockedIPs().catch(() => ({ data: [] })),
      ]);

      const companyList = compRes.data || [];
      const invoiceList = invRes.data || [];
      const ticketList = ticketRes.data || [];
      const blockedList = blockedRes.data || [];

      const activeCount = companyList.filter((c: any) => c.status === "active").length;

      let revenue = 0;
      invoiceList.forEach((i: any) => {
        if (i.invoice_status === "paid") {
          revenue += Number(i.total_amount) || 0;
        }
      });

      const pendingTicketsCount = ticketList.filter(
        (t: any) => t.status === "open" || t.status === "in_progress"
      ).length;

      setMetrics({
        totalCompanies: companyList.length,
        activeSubscribers: activeCount,
        totalRevenue: revenue,
        pendingTickets: pendingTicketsCount,
      });

      setCompanies(companyList);
      setInvoices(invoiceList);
      setTickets(ticketList);
      setBlockedIPs(blockedList);
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockIP = async (ipToUnblock: string) => {
    try {
      setUnblockingIP(ipToUnblock);
      const res = await unblockPlatformIP(ipToUnblock);
      toast.success(res.message || `IP ${ipToUnblock} successfully unblocked`);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unblock IP address");
    } finally {
      setUnblockingIP(null);
    }
  };

  const handleManualQuickUnblock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUnblockInput.trim()) return;
    await handleUnblockIP(quickUnblockInput.trim());
    setQuickUnblockInput("");
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute companies with subscription expiry or lock status
  const atRiskCompanies = companies.filter((c) => {
    if (c.status === "suspended") return true;
    if (c.license_end_date) {
      const days = Math.ceil(
        (new Date(c.license_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return days <= 30;
    }
    return false;
  });

  const cards = [
    {
      name: "Total Tenants",
      value: metrics.totalCompanies,
      icon: Building2,
      color: "text-indigo-400 bg-indigo-500/10",
      path: "/platform-admin/companies",
    },
    {
      name: "Active Licenses",
      value: metrics.activeSubscribers,
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-500/10",
      path: "/platform-admin/subscriptions/licenses",
    },
    {
      name: "SaaS Revenue (LKR)",
      value: metrics.totalRevenue.toLocaleString(),
      icon: Landmark,
      color: "text-indigo-400 bg-indigo-500/10",
      path: "/platform-admin/billing/invoices",
    },
    {
      name: "Pending Tickets",
      value: metrics.pendingTickets,
      icon: Ticket,
      color: "text-amber-400 bg-amber-500/10",
      path: "/platform-admin/support/tickets",
    },
  ];

  const handleToggleLock = async (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (company.status === "suspended") {
        await activatePlatformCompany(company.id);
        toast.success(`Tenant ${company.company_name} activated.`);
      } else {
        await suspendPlatformCompany(company.id);
        toast.warning(`Tenant ${company.company_name} locked & suspended.`);
      }
      loadData();
    } catch (err) {
      toast.error("Failed to toggle company status");
    }
  };

  const openAIEval = (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAICompany(company);
    setIsAIModalOpen(true);
  };

  // Fleet health calculation
  const fleetScore =
    companies.length > 0
      ? Math.round(
          companies.reduce((acc, c) => {
            const ev = evaluateCompanyAI(c, tickets, [], invoices);
            return acc + ev.healthScore;
          }, 0) / companies.length
        )
      : 95;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Administration Dashboard</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live SaaS Central
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time control center for SaaS operations, subscription terms, customer support, and AI evaluation.
          </p>
        </div>

        {/* Global Documentation Quick Link */}
        <Link
          to="/platform-admin/documentation"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs font-semibold text-slate-300 transition-colors shadow-sm self-start sm:self-auto"
        >
          <span>Download Manuals & Docs</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-indigo-400" />
        </Link>
      </div>

      {/* ── STATUTORY AUDIT & SYSTEM FIXES BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-5 text-white shadow-xl border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Statutory Verified
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">System Documentation & Audit Trail</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              System Fixes & Statutory Financial Audit Report
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Full root cause analyses, mathematical proofs, and engineering resolutions for Balance Sheet, Bank Book, Cash Book, Finance Dashboard KPIs, and Tax Settings.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Link
            to="/platform-admin/system-fixes-audit"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            <span>View Full Audit Report</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Subscription Expiration & Locking Alert Banner (when at-risk companies exist) */}
      {atRiskCompanies.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Subscription Expiration & Access Alerts</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    {atRiskCompanies.length} Action Needed
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tenants with upcoming expiration terms (under 30 days) or currently clocked/suspended.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {atRiskCompanies.map((c) => {
                    const days = c.license_end_date
                      ? Math.ceil(
                          (new Date(c.license_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                        )
                      : 0;
                    return (
                      <button
                        key={c.id}
                        onClick={(e) => openAIEval(c, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 hover:border-indigo-500/50 transition-colors"
                      >
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span className="font-semibold">{c.company_code}:</span>
                        <span className={c.status === "suspended" ? "text-rose-400 font-bold" : "text-amber-400"}>
                          {c.status === "suspended"
                            ? "Locked / Clocked"
                            : days <= 0
                            ? "Expired"
                            : `${days}d left`}
                        </span>
                        <span className="text-[10px] text-indigo-400 underline ml-1">AI Eval &rarr;</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <Link
              to="/platform-admin/subscriptions/licenses"
              className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold whitespace-nowrap self-start sm:self-center transition-colors"
            >
              Review All Licenses
            </Link>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.name}
            to={card.path}
            className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-inset ring-slate-800 hover:ring-indigo-500/40 cursor-pointer block"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block group-hover:text-indigo-300 transition-colors">
                {card.name}
              </span>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${card.color}`}
              >
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-white block">
                {card.value}
              </span>
              <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold flex items-center gap-0.5">
                View &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Fleet Radar & Overview Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-950 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Fleet Intelligence Radar</h3>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  Fleet Score: {fleetScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Autonomous diagnostics continuously audit client tenant health, churn propensity, support friction, and subscription expiration clocks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (companies.length > 0) {
                  openAIEval(companies[0], {} as any);
                } else {
                  toast.info("No registered companies to evaluate");
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch AI Tenant Evaluation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Companies Table & System Telemetry */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Companies */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-950 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Tenant Directory & Licensing Status</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time subscription clocks and quick lock controls.</p>
            </div>
            <Link
              to="/platform-admin/companies"
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Querying database registry...</div>
          ) : companies.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">No companies registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="pb-3">Code / Name</th>
                    <th className="pb-3">License Expiry</th>
                    <th className="pb-3 text-center">AI Health</th>
                    <th className="pb-3 text-right">Status / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {companies.slice(0, 6).map((company) => {
                    const evalResult = evaluateCompanyAI(company, tickets, [], invoices);
                    const days = evalResult.daysRemaining;

                    return (
                      <tr
                        key={company.id}
                        className="hover:bg-slate-900/60 transition-all cursor-pointer group"
                        onClick={(e) => openAIEval(company, e)}
                      >
                        <td className="py-3.5">
                          <Link
                            to={`/platform-admin/companies/${company.id}`}
                            className="font-bold text-white group-hover:text-indigo-400 transition-colors block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {company.company_code}
                          </Link>
                          <span className="text-xs text-slate-400 block truncate max-w-[180px]">
                            {company.company_name}
                          </span>
                        </td>

                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              evalResult.isLocked
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : days <= 0
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : days <= 30
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {evalResult.isLocked
                              ? "Locked"
                              : days <= 0
                              ? "Expired"
                              : `${days}d left`}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                            {company.license_end_date
                              ? new Date(company.license_end_date).toLocaleDateString()
                              : "Perpetual"}
                          </span>
                        </td>

                        <td className="py-3.5 text-center">
                          <button
                            onClick={(e) => openAIEval(company, e)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-bold transition-colors"
                          >
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                            <span>{evalResult.healthScore}</span>
                            <span className="text-[10px] text-slate-500">({evalResult.healthGrade})</span>
                          </button>
                        </td>

                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={(e) => handleToggleLock(company, e)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                              company.status === "suspended"
                                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50"
                                : "bg-rose-950/40 text-rose-400 border-rose-500/30 hover:bg-rose-900/50"
                            }`}
                            title={
                              company.status === "suspended"
                                ? "Unlock / Reactivate Company"
                                : "Clock / Lock Company Access"
                            }
                          >
                            {company.status === "suspended" ? (
                              <>
                                <Unlock className="h-3 w-3" />
                                <span>Unlock</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3" />
                                <span>Clock/Lock</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System telemetry */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">System Databases</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Healthy</span>
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Central database</p>
                <p className="text-sm font-bold text-slate-200 mt-1">erp_phrma (Production DB)</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/10">
                <Activity className="h-4 w-4 text-indigo-400" />
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SaaS Version</p>
                <p className="text-sm font-bold text-slate-200 mt-1">v2.0.0 (Enterprise Stable)</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Redis Session Pool</p>
                <p className="text-sm font-bold text-slate-200 mt-1">Active Cluster (Port 6379)</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/10">
                <Activity className="h-4 w-4 text-indigo-400" />
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Multi-Tenant Routing</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">Dynamic Resolver Enabled</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Blocked IP Security & Resolution Manager ── */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl space-y-4 ring-1 ring-inset ring-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Lock className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-white">Firewall & Blocked IP Management</h3>
              <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                {blockedIPs.length} Blocked / Restricted
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time security shield protecting tenant and platform endpoints against brute-force attacks and rate limits. Release access in one click.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/platform-admin/blocked-ips"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 text-xs font-semibold transition-colors"
            >
              <span>Security Center</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Unblock Input */}
        <form onSubmit={handleManualQuickUnblock} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            placeholder="Quick Unblock IP (e.g. 192.168.1.100 or 123.45.67.89)"
            value={quickUnblockInput}
            onChange={(e) => setQuickUnblockInput(e.target.value)}
            className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
          />
          <button
            type="submit"
            disabled={!quickUnblockInput.trim() || unblockingIP === quickUnblockInput.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer whitespace-nowrap"
          >
            {unblockingIP === quickUnblockInput.trim() ? "Unblocking..." : "Release & Unblock IP"}
          </button>
        </form>

        {blockedIPs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 border border-slate-900 rounded-2xl bg-slate-900/20">
            <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-200">Zero Active IP Blocks</p>
            <p className="text-xs text-slate-500 mt-0.5">All incoming client requests are healthy and operating normally.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-900/40">
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Failure Count</th>
                  <th className="p-3.5">Last Attempt</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {blockedIPs.map((it) => (
                  <tr key={it.ip} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white">{it.ip}</td>
                    <td className="p-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                        {it.failed_count} attempts
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{it.last_attempt}</td>
                    <td className="p-3.5 max-w-xs text-slate-300 truncate" title={it.reason}>
                      {it.reason}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-bold uppercase ${
                          it.status === "BLOCKED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {it.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleUnblockIP(it.ip)}
                        disabled={unblockingIP === it.ip}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs shadow-emerald-600/20 cursor-pointer"
                      >
                        {unblockingIP === it.ip ? "Unblocking..." : "Unblock IP"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Company Evaluation Modal */}
      {selectedAICompany && (
        <AICompanyEvaluationModal
          company={selectedAICompany}
          tickets={tickets}
          invoices={invoices}
          isOpen={isAIModalOpen}
          onClose={() => {
            setIsAIModalOpen(false);
            setSelectedAICompany(null);
          }}
          onCompanyUpdated={loadData}
        />
      )}
    </div>
  );
};

export default PlatformAdminDashboardPage;
