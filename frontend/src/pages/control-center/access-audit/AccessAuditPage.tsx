import { useState, useEffect, useCallback, useMemo } from "react";
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
  Archive,
  Clock,
} from "lucide-react";
import { getAuditLogs } from "../../../api/controlApi";

interface AuditEvent {
  id: string;
  timestamp: string;
  rawDate: Date | null;
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
  isHistorical?: boolean;
}

const AccessAuditPage = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("24H");
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const getTimeframeParams = (timeframe: string, customFrom?: string, customTo?: string) => {
    const today = new Date();
    const toISODate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (timeframe === "24H") {
      const start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { date_from: toISODate(start), date_to: toISODate(today) };
    }
    if (timeframe === "7D") {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      return { date_from: toISODate(start), date_to: toISODate(today) };
    }
    if (timeframe === "30D") {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      return { date_from: toISODate(start), date_to: toISODate(today) };
    }
    if (timeframe === "CUSTOM") {
      return {
        date_from: customFrom || "",
        date_to: customTo || "",
      };
    }
    // "ALL" or historical
    return {};
  };

  const fetchLogs = useCallback(async (
    timeframe = selectedTimeframe,
    customFrom = customDateFrom,
    customTo = customDateTo
  ) => {
    try {
      const dateParams = getTimeframeParams(timeframe, customFrom, customTo);
      const queryParams: Record<string, unknown> = { limit: 100 };
      if (dateParams.date_from) queryParams.date_from = dateParams.date_from;
      if (dateParams.date_to) queryParams.date_to = dateParams.date_to;

      const res = await getAuditLogs(queryParams);
      const rawItems = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
      const total = res?.data?.pagination?.total || rawItems.length || 0;
      setTotalCount(total);

      const nowTime = new Date().getTime();
      const mapped: AuditEvent[] = rawItems.map((item: any) => {
        const actionStr = String(item.action || "ACCESS").toUpperCase();
        let status: "SUCCESS" | "DENIED" | "FLAGGED" = "SUCCESS";
        if (actionStr.includes("DENIED") || actionStr.includes("BLOCKED") || actionStr.includes("FAIL")) {
          status = "DENIED";
        } else if (actionStr.includes("FLAGGED") || actionStr.includes("ANOMALY") || actionStr.includes("SUSPICIOUS")) {
          status = "FLAGGED";
        }

        const rawDate = item.created_at ? new Date(item.created_at) : null;
        const isValidDate = rawDate && !isNaN(rawDate.getTime());
        const dateStr = isValidDate
          ? rawDate.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })
          : "Recently";

        // Mark as historical if older than 30 days from current date
        const isHistorical = isValidDate && nowTime - rawDate.getTime() > 30 * 24 * 60 * 60 * 1000;

        return {
          id: item.id ? `AUD-${item.id}` : `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: dateStr,
          rawDate: isValidDate ? rawDate : null,
          user: item.user_name || "System User",
          email: item.email || item.user_email || "system@ceylonmed.lk",
          role: item.role_name || "Authorized Operator",
          action: item.action || "PERMISSION_CHECK",
          module: item.software_name || item.software_code || "Control Center",
          target: item.entity_name ? `${item.entity_name} ${item.entity_id ? `(#${item.entity_id})` : ""}` : "System Operation",
          ipAddress: item.ip_address || "127.0.0.1",
          location: item.branch_name || "HQ / System",
          status,
          details: item.new_values || item.old_values || item.description || "Activity logged securely via audit trail.",
          isHistorical,
        };
      });

      // Strict chronological ordering descending (newest first)
      mapped.sort((a, b) => (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0));

      setEvents(mapped);
    } catch {
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTimeframe, customDateFrom, customDateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredEvents = useMemo(() => {
    const nowTime = new Date().getTime();

    return events
      .filter((item) => {
        const matchesAction = selectedAction === "ALL" || item.action === selectedAction;
        const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
        const matchesSearch =
          item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesAction || !matchesStatus || !matchesSearch) return false;

        // Apply strict client-side timeframe filtering to guarantee older events (e.g. July 4, 2026) never leak into "24H"
        if (item.rawDate) {
          const eventTime = item.rawDate.getTime();
          if (selectedTimeframe === "24H") {
            const cutoff24h = nowTime - 24 * 60 * 60 * 1000;
            if (eventTime < cutoff24h) return false;
          } else if (selectedTimeframe === "7D") {
            const cutoff7d = nowTime - 7 * 24 * 60 * 60 * 1000;
            if (eventTime < cutoff7d) return false;
          } else if (selectedTimeframe === "30D") {
            const cutoff30d = nowTime - 30 * 24 * 60 * 60 * 1000;
            if (eventTime < cutoff30d) return false;
          } else if (selectedTimeframe === "CUSTOM") {
            if (customDateFrom) {
              const fromTime = new Date(customDateFrom).setHours(0, 0, 0, 0);
              if (eventTime < fromTime) return false;
            }
            if (customDateTo) {
              const toTime = new Date(customDateTo).setHours(23, 59, 59, 999);
              if (eventTime > toTime) return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0));
  }, [events, selectedAction, selectedStatus, searchQuery, selectedTimeframe, customDateFrom, customDateTo]);

  const successCount = filteredEvents.filter((e) => e.status === "SUCCESS").length;
  const deniedCount = filteredEvents.filter((e) => e.status === "DENIED").length;
  const flaggedCount = filteredEvents.filter((e) => e.status === "FLAGGED").length;
  const passRate = filteredEvents.length > 0 ? ((successCount / filteredEvents.length) * 100).toFixed(1) : "0.0";

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs();
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
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">
            {loading ? "..." : totalCount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Logged security telemetry</p>
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
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">
            {loading ? "..." : events.length > 0 ? `${passRate}%` : "100%"}
          </p>
          <p className="mt-1 text-xs text-emerald-600  font-medium">{successCount} successful verifications</p>
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
          <p className="mt-2 text-3xl font-extrabold text-slate-900 ">
            {loading ? "..." : deniedCount}
          </p>
          <p className="mt-1 text-xs text-rose-600  font-medium">
            {deniedCount > 0 ? `${((deniedCount / (events.length || 1)) * 100).toFixed(1)}% unauthorized attempts` : "Zero unauthorized attempts"}
          </p>
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
          <p className="mt-2 text-3xl font-extrabold text-amber-600 ">
            {loading ? "..." : flaggedCount}
          </p>
          <p className="mt-1 text-xs text-amber-600  font-medium">
            {flaggedCount > 0 ? "Flagged anomalies detected" : "Zero security anomalies"}
          </p>
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

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTimeframe(val);
                if (val !== "CUSTOM") {
                  fetchLogs(val);
                }
              }}
              className="h-10 rounded-xl border border-slate-200  bg-white  px-3 text-xs font-semibold text-slate-700  focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="24H">Last 24 Hours (Current)</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="ALL">All Time (Historical Archive)</option>
              <option value="CUSTOM">Custom Date Range...</option>
            </select>

            {selectedTimeframe === "CUSTOM" && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={() => fetchLogs("CUSTOM", customDateFrom, customDateTo)}
                  disabled={!customDateFrom || !customDateTo}
                  className="h-10 px-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
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
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="h-8 w-8 text-slate-300 mb-1" />
                      <p className="font-semibold text-sm text-slate-800">
                        No audit events found for {selectedTimeframe === "24H" ? "the last 24 hours" : selectedTimeframe === "7D" ? "the last 7 days" : selectedTimeframe === "30D" ? "the last 30 days" : "the selected criteria"}.
                      </p>
                      <p className="text-xs text-slate-400 max-w-md">
                        Prior and seeded activities (such as July 2026 events) are preserved in the historical archive.
                      </p>
                      {selectedTimeframe !== "ALL" && (
                        <button
                          onClick={() => {
                            setSelectedTimeframe("ALL");
                            fetchLogs("ALL");
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          View All Historical Logs Archive →
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50  transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-mono font-bold text-xs text-indigo-600 ">{row.id}</p>
                        {row.isHistorical && (
                          <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                            Historical Log
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{row.timestamp}</span>
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
                  <p className="pl-4">{`"verification_engine": "CEYLONMED_RBAC_V2",`}</p>
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
