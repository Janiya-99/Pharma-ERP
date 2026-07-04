import { useState } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  Building2,
  Layers,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  HelpCircle,
  ArrowUpRight,
} from "lucide-react";

interface PermissionRow {
  id: string;
  code: string;
  module: string;
  feature: string;
  roleInherited: "GRANTED" | "DENIED" | "NONE";
  roleName: string;
  branchOverride: "GRANTED" | "DENIED" | "NONE";
  effectiveStatus: "GRANTED" | "DENIED";
  reason: string;
}

const mockUsers = [
  { id: "usr-1", name: "Kasun Silva", email: "kasun.s@omacx.lk", role: "Senior Accountant", branch: "Headquarters (HQ)", avatar: "KS" },
  { id: "usr-2", name: "Nimali Perera", email: "nimali.p@omacx.lk", role: "Inventory Manager", branch: "Central Warehouse", avatar: "NP" },
  { id: "usr-3", name: "Dr. Amara Dias", email: "amara.d@omacx.lk", role: "Chief Pharmacist", branch: "Headquarters (HQ)", avatar: "AD" },
  { id: "usr-4", name: "Dinesh Kumar", email: "dinesh.k@omacx.lk", role: "Billing Supervisor", branch: "Regional Depot (NY)", avatar: "DK" },
];

const mockPermissions: Record<string, PermissionRow[]> = {
  "usr-1": [
    { id: "perm-101", code: "FIN_JOURNAL_CREATE", module: "Finance & Ledger", feature: "Journal Entries", roleInherited: "GRANTED", roleName: "Senior Accountant", branchOverride: "NONE", effectiveStatus: "GRANTED", reason: "Inherited from role Senior Accountant" },
    { id: "perm-102", code: "FIN_JOURNAL_APPROVE", module: "Finance & Ledger", feature: "Journal Entries", roleInherited: "GRANTED", roleName: "Senior Accountant", branchOverride: "NONE", effectiveStatus: "GRANTED", reason: "Inherited from role Senior Accountant" },
    { id: "perm-103", code: "FIN_PAYMENT_OVERRIDE", module: "Finance & Ledger", feature: "Payment Vouchers", roleInherited: "DENIED", roleName: "Senior Accountant", branchOverride: "GRANTED", effectiveStatus: "GRANTED", reason: "Explicit branch override granted by CFO on 2026-06-15" },
    { id: "perm-104", code: "INV_STOCK_ADJUST", module: "Inventory", feature: "Stock Adjustment", roleInherited: "NONE", roleName: "-", branchOverride: "NONE", effectiveStatus: "DENIED", reason: "No role or direct grant exists" },
    { id: "perm-105", code: "INV_BATCH_QUARANTINE", module: "Inventory", feature: "Batch Control", roleInherited: "NONE", roleName: "-", branchOverride: "NONE", effectiveStatus: "DENIED", reason: "No role or direct grant exists" },
    { id: "perm-106", code: "INVOICE_CREDIT_OVERRIDE", module: "Invoice Center", feature: "Credit Limits", roleInherited: "GRANTED", roleName: "Senior Accountant", branchOverride: "DENIED", effectiveStatus: "DENIED", reason: "Branch override explicitly denied for Headquarters" },
    { id: "perm-107", code: "COMP_REPORT_EXPORT", module: "Compliance", feature: "Regulatory Reports", roleInherited: "GRANTED", roleName: "Senior Accountant", branchOverride: "NONE", effectiveStatus: "GRANTED", reason: "Inherited from role Senior Accountant" },
  ],
  "usr-2": [
    { id: "perm-201", code: "INV_STOCK_ADJUST", module: "Inventory", feature: "Stock Adjustment", roleInherited: "GRANTED", roleName: "Inventory Manager", branchOverride: "NONE", effectiveStatus: "GRANTED", reason: "Inherited from role Inventory Manager" },
    { id: "perm-202", code: "INV_BATCH_QUARANTINE", module: "Inventory", feature: "Batch Control", roleInherited: "GRANTED", roleName: "Inventory Manager", branchOverride: "NONE", effectiveStatus: "GRANTED", reason: "Inherited from role Inventory Manager" },
    { id: "perm-203", code: "INV_WAREHOUSE_CONFIG", module: "Inventory", feature: "Warehouse Setup", roleInherited: "GRANTED", roleName: "Inventory Manager", branchOverride: "NONE", effectiveStatus: "GRANTED", reason: "Inherited from role Inventory Manager" },
    { id: "perm-204", code: "FIN_JOURNAL_CREATE", module: "Finance & Ledger", feature: "Journal Entries", roleInherited: "NONE", roleName: "-", branchOverride: "NONE", effectiveStatus: "DENIED", reason: "No role or direct grant exists" },
    { id: "perm-205", code: "INVOICE_CREATE", module: "Invoice Center", feature: "Billing", roleInherited: "NONE", roleName: "-", branchOverride: "GRANTED", effectiveStatus: "GRANTED", reason: "Direct cross-training grant for warehouse dispatch billing" },
  ],
};

const EffectiveAccessPage = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>("usr-1");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId) || mockUsers[0];
  const userPermissions = mockPermissions[selectedUserId] || mockPermissions["usr-1"];

  const filteredPermissions = userPermissions.filter((item) => {
    const matchesModule = selectedModule === "ALL" || item.module === selectedModule;
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.module.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const totalGranted = userPermissions.filter((p) => p.effectiveStatus === "GRANTED").length;
  const totalDenied = userPermissions.filter((p) => p.effectiveStatus === "DENIED").length;
  const totalOverrides = userPermissions.filter((p) => p.branchOverride !== "NONE").length;

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 600);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Control Center • Security & Authorization
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Effective Access & Permission Matrix
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 pl-12">
            Inspect cumulative user permissions resulting from role inheritance, branch policies, and direct overrides
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-600 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? "Recalculating Matrix..." : "Recalculate Effective Access"}
          </button>
          <button className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
            <Download className="h-4 w-4" />
            Export Audit Report
          </button>
        </div>
      </div>

      {/* ── User & Scope Selector Bar ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-center">
          {/* User Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Select Target User
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
            >
              {mockUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role} ({u.branch})
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              2. Filter by Software Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
            >
              <option value="ALL">All Software Modules</option>
              <option value="Finance & Ledger">Finance & Ledger</option>
              <option value="Inventory">Inventory & Warehouse</option>
              <option value="Invoice Center">Invoice Center</option>
              <option value="Compliance">Compliance Center</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              3. Search Permission Code
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. FIN_JOURNAL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all"
              />
            </div>
          </div>
        </div>

        {/* Selected User Summary Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800 pt-5 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 font-bold text-indigo-700 dark:text-indigo-300">
              {selectedUser.avatar}
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedUser.name}</p>
              <p className="text-slate-500 dark:text-slate-400">{selectedUser.email} • <span className="text-indigo-600 dark:text-indigo-400 font-medium">{selectedUser.role}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Assigned Branch: <b>{selectedUser.branch}</b></span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Active Policy: <b>Strict Inheritance</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Effective Rights Granted
            </span>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{totalGranted}</p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Authorized operations across selected scope</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Effective Denials / Restrictions
            </span>
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 p-2 text-rose-600 dark:text-rose-400">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{totalDenied}</p>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">Blocked due to lack of grant or explicit denial</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Explicit Branch Overrides
            </span>
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/50 p-2 text-indigo-600 dark:text-indigo-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{totalOverrides}</p>
          <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">Custom grants/denials overriding role defaults</p>
        </div>
      </div>

      {/* ── Effective Access Matrix Table ── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 p-5 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Authorization Matrix & Resolution Logic
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Effective status is resolved by applying Branch Overrides over Role-Inherited defaults
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-600 dark:text-slate-300">
              Showing {filteredPermissions.length} of {userPermissions.length} permissions
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Permission Code</th>
                <th className="px-4 py-3.5">Module & Feature</th>
                <th className="px-4 py-3.5">Role Inheritance</th>
                <th className="px-4 py-3.5">Branch Override</th>
                <th className="px-4 py-3.5 text-center">Effective Status</th>
                <th className="px-5 py-3.5">Resolution Rationale & Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No permission codes matching the selected scope and search criteria.
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {row.code}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{row.feature}</p>
                      <span className="text-[11px] text-slate-400 font-medium">{row.module}</span>
                    </td>
                    <td className="px-4 py-4">
                      {row.roleInherited === "GRANTED" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                          <CheckCircle2 className="h-3 w-3" /> Granted ({row.roleName})
                        </span>
                      ) : row.roleInherited === "DENIED" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                          <XCircle className="h-3 w-3" /> Denied ({row.roleName})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">— No Role Grant</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {row.branchOverride === "GRANTED" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          <Unlock className="h-3 w-3" /> Override Grant
                        </span>
                      ) : row.branchOverride === "DENIED" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                          <Lock className="h-3 w-3" /> Override Denial
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">— Default</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {row.effectiveStatus === "GRANTED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-white px-3 py-1 text-xs font-bold shadow-2xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> AUTHORIZED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 text-white px-3 py-1 text-xs font-bold shadow-2xs">
                          <XCircle className="h-3.5 w-3.5" /> BLOCKED
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400">
                      <p className="line-clamp-2 leading-relaxed">{row.reason}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EffectiveAccessPage;
