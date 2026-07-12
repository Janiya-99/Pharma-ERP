import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  User,
  Calendar,
  Globe,
  Terminal,
  Download,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  role: string;
  action: string;
  module: string;
  target: string;
  ipAddress: string;
  location: string;
  status: "SUCCESS" | "DENIED" | "FLAGGED";
  details: string;
}

const mockEvents: AuditEvent[] = [
  {
    id: "AUD-8801",
    timestamp: "2026-07-04 16:15:22",
    user: "Kasun Silva",
    email: "kasun.s@omacx.lk",
    role: "Senior Accountant",
    action: "PERMISSION_CHECK",
    module: "Finance & Ledger",
    target: "FIN_PAYMENT_OVERRIDE (Payment Voucher #PV-2026-0188)",
    ipAddress: "192.168.1.104",
    location: "Colombo HQ",
    status: "SUCCESS",
    details: "Authorized via branch override grant by CFO.",
  },
  {
    id: "AUD-8802",
    timestamp: "2026-07-04 15:42:10",
    user: "Dinesh Kumar",
    email: "dinesh.k@omacx.lk",
    role: "Billing Supervisor",
    action: "PERMISSION_CHECK",
    module: "Invoice Center",
    target: "INVOICE_CREDIT_OVERRIDE (Customer #CUST-0095)",
    ipAddress: "192.168.2.45",
    location: "Regional Depot NY",
    status: "DENIED",
    details: "Attempted to bill customer exceeding 100% credit limit without override grant.",
  },
  {
    id: "AUD-8803",
    timestamp: "2026-07-04 14:18:05",
    user: "Dr. Amara Dias",
    email: "amara.d@omacx.lk",
    role: "Chief Pharmacist",
    action: "ROLE_ASSIGNMENT",
    module: "Control Center",
    target: "Assigned 'Quarantine Inspector' role to Nimali Perera",
    ipAddress: "10.0.0.12",
    location: "Colombo HQ",
    status: "SUCCESS",
    details: "Role assignment approved by Compliance Committee.",
  },
  {
    id: "AUD-8804",
    timestamp: "2026-07-04 11:30:44",
    user: "Unknown IP / System",
    email: "external.bot@unknown.net",
    role: "Unauthenticated",
    action: "LOGIN_ATTEMPT",
    module: "Auth Gateway",
    target: "Admin Portal Login Attempt",
    ipAddress: "45.133.1.89",
    location: "External / VPN",
    status: "FLAGGED",
    details: "Multiple failed login attempts detected. IP blocked for 30 minutes.",
  },
  {
    id: "AUD-8805",
    timestamp: "2026-07-04 09:12:18",
    user: "Nimali Perera",
    email: "nimali.p@omacx.lk",
    role: "Inventory Manager",
    action: "SECURITY_POLICY_CHANGE",
    module: "Inventory",
    target: "Modified Reorder Thresholds for Amoxicillin 500mg",
    ipAddress: "192.168.1.115",
    location: "Central Warehouse",
    status: "SUCCESS",
    details: "Threshold updated from 1,000 to 2,500 units.",
  },
];

const AccessAuditPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("24H");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const filteredEvents = mockEvents.filter((item) => {
    const matchesAction = selectedAction === "ALL" || item.action === selectedAction;
    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
    const matchesSearch =
      item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesStatus && matchesSearch;
  });

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
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 ">
                Control Center • Compliance & Governance
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900  sm:text-3xl">
                Access Audit & Authorization Logs
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500  pl-12">
            Immutable security telemetry tracking permission checks, privilege assignments, and authentication anomalies
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200  bg-white  px-4 text-sm font-semibold text-slate-700  hover:bg-slate-50  transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Syncing Logs..." : "Refresh Telemetry"}
          </button>
          <button className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
            <Download className="h-4 w-4" />
            Export Audit Trail (CSV)
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
              Total Logged Events
            </span>
            <div className="rounded-lg bg-indigo-50  p-2 text-indigo-600 ">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">14,280</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">+340 events today</p>
        </div>

        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
              Authorized Checks
            </span>
            <div className="rounded-lg bg-emerald-50  p-2 text-emerald-600 ">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">98.4%</p>
          <p className="mt-1 text-xs text-emerald-600  font-medium">14,050 successful verifications</p>
        </div>

        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
              Denied / Blocked Actions
            </span>
            <div className="rounded-lg bg-rose-50  p-2 text-rose-600 ">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">194</p>
          <p className="mt-1 text-xs text-rose-600  font-medium">1.4% unauthorized attempts</p>
        </div>

        <div className="rounded-xl border border-slate-200  bg-white  p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 ">
              Security Anomaly Alerts
            </span>
            <div className="rounded-lg bg-amber-50  p-2 text-amber-600 ">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 ">36</p>
          <p className="mt-1 text-xs text-amber-600  font-medium">Flagged IP anomalies / brute force</p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200  bg-white  p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by User, Event ID, Target, or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200  bg-slate-50/50  pl-10 pr-4 text-sm text-slate-900  placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3 text-xs font-semibold text-slate-700  focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Event Types</option>
            <option value="PERMISSION_CHECK">Permission Check</option>
            <option value="ROLE_ASSIGNMENT">Role Assignment</option>
            <option value="LOGIN_ATTEMPT">Login Attempt</option>
            <option value="SECURITY_POLICY_CHANGE">Policy Change</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3 text-xs font-semibold text-slate-700  focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Authorized / Success</option>
            <option value="DENIED">Denied / Blocked</option>
            <option value="FLAGGED">Flagged / Anomaly</option>
          </select>

          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="h-10 rounded-xl border border-slate-200  bg-white  px-3 text-xs font-semibold text-slate-700  focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="24H">Last 24 Hours</option>
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* ── Audit Logs Table ── */}
      <div className="rounded-xl border border-slate-200  bg-white  shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200  bg-slate-50/50  text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Event ID & Time</th>
                <th className="px-4 py-3.5">User & Role</th>
                <th className="px-4 py-3.5">Action & Module</th>
                <th className="px-4 py-3.5">Target & Context</th>
                <th className="px-4 py-3.5">IP & Location</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right pr-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 ">
                    No audit logs matching the selected filters and search query.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50  transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-xs text-indigo-600 ">{row.id}</p>
                      <span className="text-[11px] text-slate-400 font-mono">{row.timestamp}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800 ">{row.user}</p>
                      <span className="text-[11px] text-slate-400 font-medium">{row.role}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100  px-2 py-0.5 text-xs font-bold text-slate-700 ">
                        {row.action}
                      </span>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">{row.module}</p>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="font-medium text-slate-800  text-xs line-clamp-2" title={row.target}>
                        {row.target}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs font-medium text-slate-700 ">{row.ipAddress}</p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {row.location}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {row.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700   border border-emerald-200/60  px-2.5 py-0.5 text-[11px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> SUCCESS
                        </span>
                      ) : row.status === "DENIED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700   border border-rose-200/60  px-2.5 py-0.5 text-[11px] font-bold">
                          <XCircle className="h-3 w-3" /> DENIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700   border border-amber-200/60  px-2.5 py-0.5 text-[11px] font-bold animate-pulse">
                          <AlertTriangle className="h-3 w-3" /> FLAGGED
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right pr-4">
                      <button
                        onClick={() => setSelectedEvent(row)}
                        className="rounded-lg border border-slate-200  px-2.5 py-1.5 text-xs font-semibold text-slate-700  hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Inspector Modal / Drawer ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in-50">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200  bg-white  p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100  pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-indigo-50  p-2 text-indigo-600 ">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 ">
                    Audit Event Payload Inspector
                  </h3>
                  <p className="text-xs font-mono text-slate-400">{selectedEvent.id} • {selectedEvent.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100  hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50  p-4">
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Actor Account</span>
                  <span className="font-semibold text-slate-900 ">{selectedEvent.user}</span>
                  <span className="block text-xs text-slate-500">{selectedEvent.email} ({selectedEvent.role})</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Network & Origin</span>
                  <span className="font-mono font-medium text-slate-900 ">{selectedEvent.ipAddress}</span>
                  <span className="block text-xs text-slate-500">{selectedEvent.location}</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Action Telemetry</span>
                <div className="rounded-xl border border-slate-200  p-3.5">
                  <p className="font-bold text-slate-800 ">
                    [{selectedEvent.action}] → {selectedEvent.module}
                  </p>
                  <p className="mt-1 font-mono text-xs text-indigo-600 ">
                    Target: {selectedEvent.target}
                  </p>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Resolution Details</span>
                <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400">
                  <p>{`{`}</p>
                  <p className="pl-4">{`"status": "${selectedEvent.status}",`}</p>
                  <p className="pl-4">{`"verification_engine": "OMACX_RBAC_V2",`}</p>
                  <p className="pl-4">{`"audit_reason": "${selectedEvent.details}",`}</p>
                  <p className="pl-4">{`"timestamp_utc": "${selectedEvent.timestamp}"`}</p>
                  <p>{`}`}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100  pt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl bg-slate-100  px-5 py-2 text-xs font-semibold text-slate-700  hover:bg-slate-200 transition-colors"
              >
                Close Inspector
              </button>
              <button className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
                Download JSON Payload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessAuditPage;
