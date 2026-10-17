import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getPlatformCompanies,
  getPlatformCompany,
  updatePlatformCompany,
  suspendPlatformCompany,
  activatePlatformCompany,
  extendPlatformCompanyLicense,
  getPlatformDatabases,
  getPlatformSupportTickets,
} from "../../api/platformAdminApi";
import { toast } from "sonner";
import {
  Building,
  ShieldCheck,
  Database,
  Pencil,
  FileText,
  Activity,
  Sparkles,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
} from "lucide-react";
import AICompanyEvaluationModal from "../../components/platform-admin/AICompanyEvaluationModal";
import { evaluateCompanyAI } from "../../services/aiCompanyEvaluation";

// 1. CompaniesPage — Lists all tenant companies with expiration countdown & AI triggers
export const CompaniesPage = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // AI Modal
  const [selectedAICompany, setSelectedAICompany] = useState<any | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const [compRes, ticketRes] = await Promise.all([
        getPlatformCompanies(),
        getPlatformSupportTickets().catch(() => ({ data: [] })),
      ]);
      if (compRes.success) {
        setCompanies(compRes.data || []);
      }
      setTickets(ticketRes.data || []);
    } catch (err) {
      toast.error("Failed to load company registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleToggleStatus = async (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (company.status === "active") {
        await suspendPlatformCompany(company.id);
        toast.warning(`Company ${company.company_code} clocked & suspended`);
      } else {
        await activatePlatformCompany(company.id);
        toast.success(`Company ${company.company_code} unlocked & activated`);
      }
      loadCompanies();
    } catch (err) {
      toast.error("Status toggle request failed");
    }
  };

  const openAIEval = (company: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAICompany(company);
    setIsAIModalOpen(true);
  };

  const filtered = companies.filter((c) => {
    if (filter === "active") return c.status === "active";
    if (filter === "suspended") return c.status === "suspended";
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Client Tenant Registry</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {companies.length} Registered
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage multi-tenant client companies, subscription expiration clocks, and AI health evaluations.
          </p>
        </div>
        <Link
          to="/platform-admin/companies/create"
          className="py-2.5 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs shadow-md transition-all self-start sm:self-auto"
        >
          + Create New Tenant
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {["all", "active", "suspended"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === tab ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8 text-sm">Querying database registry...</div>
      ) : filtered.length === 0 ? (
        <div className="text-slate-500 text-center py-8 text-sm">No companies match this filter.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-2xl border border-slate-800 shadow-md">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40">
                <th className="p-4">Tenant Identity</th>
                <th className="p-4">Database Node</th>
                <th className="p-4">Owner Email</th>
                <th className="p-4">License Expiry</th>
                <th className="p-4 text-center">AI Health</th>
                <th className="p-4 text-right">Actions & Clocking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filtered.map((c) => {
                const evalResult = evaluateCompanyAI(c, tickets, []);
                const days = evalResult.daysRemaining;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-900/30 transition-colors cursor-pointer group"
                    onClick={(e) => openAIEval(c, e)}
                  >
                    <td className="p-4">
                      <Link
                        to={`/platform-admin/companies/${c.id}`}
                        className="font-bold text-white tracking-wide group-hover:text-indigo-400 block transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.company_code}
                      </Link>
                      <span className="text-xs text-slate-400">{c.company_name}</span>
                    </td>

                    <td className="p-4 font-mono text-xs text-slate-300">
                      {c.database_name}
                    </td>

                    <td className="p-4 text-xs text-slate-400">{c.company_email}</td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                        {c.license_end_date ? new Date(c.license_end_date).toLocaleDateString() : "Perpetual"}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={(e) => openAIEval(c, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-bold transition-colors"
                      >
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                        <span>{evalResult.healthScore}</span>
                        <span className="text-[10px] text-slate-500">({evalResult.healthGrade})</span>
                      </button>
                    </td>

                    <td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/platform-admin/companies/${c.id}`}
                        className="inline-flex p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Company Details"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/platform-admin/companies/${c.id}/edit`}
                        className="inline-flex p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Edit Profile"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={(e) => handleToggleStatus(c, e)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          c.status === "suspended"
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50"
                            : "bg-rose-950/40 text-rose-400 border-rose-500/30 hover:bg-rose-900/50"
                        }`}
                        title={c.status === "active" ? "Clock & Lock Tenant" : "Unlock & Reactivate"}
                      >
                        {c.status === "suspended" ? (
                          <>
                            <Unlock className="h-3.5 w-3.5" />
                            <span>Unlock</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5" />
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

      {/* AI Evaluation Modal */}
      {selectedAICompany && (
        <AICompanyEvaluationModal
          company={selectedAICompany}
          tickets={tickets}
          isOpen={isAIModalOpen}
          onClose={() => {
            setIsAIModalOpen(false);
            setSelectedAICompany(null);
          }}
          onCompanyUpdated={loadCompanies}
        />
      )}
    </div>
  );
};

// 2. CompanyDetailsPage — Detailed overview of subscription mapping, clocking & AI diagnostics
export const CompanyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // AI Modal
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const [compRes, ticketRes] = await Promise.all([
        getPlatformCompany(id),
        getPlatformSupportTickets().catch(() => ({ data: [] })),
      ]);
      if (compRes.success) {
        setData(compRes.data);
      }
      setTickets(ticketRes.data || []);
    } catch (err) {
      toast.error("Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, [id]);

  if (loading) return <div className="text-slate-500 text-center py-8">Querying database catalog...</div>;
  if (!data) return <div className="text-red-400 text-center py-8">Company profile not found</div>;

  const { company, billing_profile, subscription, modules, database: dbDetails } = data;
  const evalResult = evaluateCompanyAI(company, tickets, modules);
  const days = evalResult.daysRemaining;

  const handleToggleLock = async () => {
    try {
      setActionLoading(true);
      if (company.status === "suspended") {
        await activatePlatformCompany(company.id);
        toast.success(`Tenant ${company.company_name} is now unlocked and active.`);
      } else {
        await suspendPlatformCompany(company.id);
        toast.warning(`Tenant ${company.company_name} is now locked and suspended.`);
      }
      loadCompany();
    } catch (err) {
      toast.error("Failed to toggle company status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async (daysToAdd: number) => {
    try {
      setActionLoading(true);
      const res = await extendPlatformCompanyLicense(company.id, daysToAdd);
      if (res.success) {
        toast.success(res.message || `License extended by ${daysToAdd} days`);
        loadCompany();
      }
    } catch (err) {
      toast.error("Failed to extend company license");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/platform-admin/companies")}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{company.company_name}</span>
            <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
              {company.company_code}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered: {new Date(company.created_at).toLocaleDateString()} &bull; Primary Email: {company.company_email}
          </p>
        </div>
      </div>

      {/* Subscription Expiration & Clocking Action Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                evalResult.isLocked
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : days <= 0
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : days <= 30
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold text-white">
                  {evalResult.isLocked
                    ? "Tenant Clocked / Locked"
                    : days <= 0
                    ? "Subscription Lapsed / Expired"
                    : days <= 30
                    ? `Expiring Soon (${days} Days Left)`
                    : `Active License (${days} Days Left)`}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    evalResult.isLocked
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : days <= 0
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {company.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                License Validity:{" "}
                <span className="font-semibold text-slate-200">
                  {company.license_start_date ? new Date(company.license_start_date).toLocaleDateString() : "N/A"}
                </span>{" "}
                &rarr;{" "}
                <span className="font-semibold text-indigo-400">
                  {company.license_end_date ? new Date(company.license_end_date).toLocaleDateString() : "N/A"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Evaluation ({evalResult.healthScore}/100)</span>
            </button>

            <button
              onClick={handleToggleLock}
              disabled={actionLoading}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                evalResult.isLocked
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                  : "bg-rose-600 hover:bg-rose-500 text-white border-rose-500"
              }`}
            >
              {evalResult.isLocked ? (
                <>
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlock Tenant</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Clock / Lock Tenant</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Extend License Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Quick Renewal & Extension:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExtend(30)}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 transition-colors"
            >
              +30 Days
            </button>
            <button
              onClick={() => handleExtend(90)}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 transition-colors"
            >
              +90 Days
            </button>
            <button
              onClick={() => handleExtend(365)}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-xs font-semibold text-white transition-colors"
            >
              +1 Year (Annual Renewal)
            </button>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Identity */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 shadow-md space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-400" />
            <span>Corporate Identity</span>
          </h3>
          <div className="grid grid-cols-2 gap-y-3.5 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Legal Entity</span>
            <span className="text-slate-200">{company.legal_name || "N/A"}</span>

            <span className="text-slate-500 font-semibold uppercase">Registration #</span>
            <span className="text-slate-200">{company.registration_number || "N/A"}</span>

            <span className="text-slate-500 font-semibold uppercase">Tax ID / TIN</span>
            <span className="text-slate-200">{company.tax_number || "N/A"}</span>

            <span className="text-slate-500 font-semibold uppercase">Industry</span>
            <span className="text-slate-200">{company.industry || "Pharmaceutical Distribution"}</span>

            <span className="text-slate-500 font-semibold uppercase">Contact Person</span>
            <span className="text-slate-200">{company.contact_person || "Operations Manager"}</span>

            <span className="text-slate-500 font-semibold uppercase">Phone</span>
            <span className="text-slate-200">{company.company_phone || "N/A"}</span>
          </div>
        </div>

        {/* Database Properties */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 shadow-md space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <span>Database Node Architecture</span>
          </h3>
          <div className="grid grid-cols-2 gap-y-3.5 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Database Name</span>
            <span className="text-slate-200 font-mono font-bold">{dbDetails?.database_name || company.database_name}</span>

            <span className="text-slate-500 font-semibold uppercase">Database Host</span>
            <span className="text-slate-200 font-mono">{dbDetails?.database_host || "shared-mysql"}</span>

            <span className="text-slate-500 font-semibold uppercase">Database Port</span>
            <span className="text-slate-200 font-mono">3306</span>

            <span className="text-slate-500 font-semibold uppercase">Tenant Isolation</span>
            <span className="text-emerald-400 font-bold uppercase">Dedicated Database</span>

            <span className="text-slate-500 font-semibold uppercase">Provision Status</span>
            <span className="text-emerald-400 font-bold uppercase">{dbDetails?.database_status || "created"}</span>
          </div>
        </div>

        {/* Subscriptions & Modules */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 shadow-md space-y-4 md:col-span-2">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" />
            <span>Active Modules & SaaS Entitlements ({modules?.length || 0})</span>
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {modules && modules.length > 0 ? (
              modules.map((m: any) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{m.module_code}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">Core ERP Suite Enabled</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Evaluation Modal */}
      <AICompanyEvaluationModal
        company={company}
        tickets={tickets}
        modules={modules}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onCompanyUpdated={loadCompany}
      />
    </div>
  );
};

// 3. CompanyEditPage — Modify company fields
export const CompanyEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [company, setCompany] = useState<any>({
    company_name: "",
    company_email: "",
    company_phone: "",
    status: "active",
  });

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        const res = await getPlatformCompany(id);
        if (res.success) {
          setCompany(res.data.company);
        }
      } catch (err) {
        toast.error("Failed to load company details");
      } finally {
        setLoading(false);
      }
    };
    loadCompany();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updatePlatformCompany(id, company);
      toast.success("Company profile updated successfully");
      navigate(`/platform-admin/companies/${id}`);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-slate-500 text-center py-8">Querying database catalog...</div>;

  return (
    <div className="space-y-6 font-sans max-w-xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Edit Company Profile</h2>
        <p className="text-sm text-slate-400">Modify contact information and core system activation status.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Name</label>
          <input
            type="text"
            value={company.company_name}
            onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Owner Email</label>
          <input
            type="email"
            value={company.company_email}
            onChange={(e) => setCompany({ ...company, company_email: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company Phone</label>
          <input
            type="text"
            value={company.company_phone}
            onChange={(e) => setCompany({ ...company, company_phone: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Subscription / Account Status</label>
          <select
            value={company.status}
            onChange={(e) => setCompany({ ...company, status: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="active">Active (Access Allowed)</option>
            <option value="suspended">Suspended / Clocked (Access Blocked)</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

// 4. CompanyDatabasePage — View databases and migration status
export const CompanyDatabasePage = () => {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDbs = async () => {
      try {
        setLoading(true);
        const res = await getPlatformDatabases();
        if (res.success) {
          setDatabases(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load databases list");
      } finally {
        setLoading(false);
      }
    };
    loadDbs();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Database Catalog Overview</h2>
        <p className="text-sm text-slate-400">Monitor multi-tenant GORM schema migration progress, server targets, and connection statuses.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Fetching database schema...</div>
      ) : databases.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No databases provisioned yet.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Database Name</th>
                <th className="p-4">Database Host</th>
                <th className="p-4">Status</th>
                <th className="p-4">Schema Migrations</th>
                <th className="p-4">Last Migrated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {databases.map((db) => (
                <tr key={db.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-mono font-bold text-white text-xs">{db.database_name}</td>
                  <td className="p-4 font-mono text-xs">{db.database_host}</td>
                  <td className="p-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {db.database_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {db.migration_status || "completed"}
                    </span>
                  </td>
                  <td className="p-4 text-xs">
                    {db.last_migrated_at ? new Date(db.last_migrated_at).toLocaleString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
