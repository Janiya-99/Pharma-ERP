import React, { useState, useEffect } from "react";
import { getPlatformLoginLogs, getPlatformAuditLogs } from "../../api/platformAdminApi";
import { toast } from "sonner";
import { Lock, FileText } from "lucide-react";

// 1. PlatformLoginLogsPage
export const PlatformLoginLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const res = await getPlatformLoginLogs();
        if (res.success) {
          setLogs(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load login security logs");
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Platform Login Security Logs</h2>
        <p className="text-sm text-slate-400">Review log logs, IP addresses, client software details and error messages of admin accesses.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Fetching logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No logins recorded yet.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Email</th>
                <th className="p-4">Login Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">User Agent</th>
                <th className="p-4 text-right">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-semibold text-white">{l.email}</td>
                  <td className="p-4 text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full font-semibold uppercase ${
                        l.status === "success"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{l.ip_address}</td>
                  <td className="p-4 max-w-xs truncate">{l.user_agent}</td>
                  <td className="p-4 text-right text-red-400">{l.error_message || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 2. PlatformAuditLogsPage
export const PlatformAuditLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const res = await getPlatformAuditLogs();
        if (res.success) {
          setLogs(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Platform Audit Trails</h2>
        <p className="text-sm text-slate-400">Detailed compliance history of company registrations, suspensions, and database setup commands.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-center py-8">Fetching audit history...</div>
      ) : logs.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No administrator logs recorded.</div>
      ) : (
        <div className="overflow-x-auto bg-slate-950/20 rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-950/40 p-4">
                <th className="p-4">Action</th>
                <th className="p-4">Target Type</th>
                <th className="p-4">Target ID</th>
                <th className="p-4">Operator ID</th>
                <th className="p-4">Log Details</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-mono font-bold text-indigo-400">{l.action}</td>
                  <td className="p-4 font-mono">{l.target_type}</td>
                  <td className="p-4 font-mono">{l.target_id}</td>
                  <td className="p-4">User ID: {l.user_id}</td>
                  <td className="p-4 text-slate-300 max-w-sm whitespace-normal">{l.details}</td>
                  <td className="p-4 text-right text-slate-550">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 3. PlatformBlockedIPsPage
export const PlatformBlockedIPsPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualIP, setManualIP] = useState("");
  const [unblockingIP, setUnblockingIP] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await (await import("../../api/platformAdminApi")).getPlatformBlockedIPs();
      setItems(res.data || []);
    } catch (err) {
      toast.error("Failed to load blocked IP addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnblock = async (ipToUnblock: string) => {
    try {
      setUnblockingIP(ipToUnblock);
      const res = await (await import("../../api/platformAdminApi")).unblockPlatformIP(ipToUnblock);
      toast.success(res.message || `IP ${ipToUnblock} successfully unblocked!`);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unblock IP address");
    } finally {
      setUnblockingIP(null);
    }
  };

  const handleManualUnblock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIP.trim()) return;
    await handleUnblock(manualIP.trim());
    setManualIP("");
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Lock className="h-5 w-5" />
            </span>
            <span>Firewall & Blocked IP Management</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Review IPs restricted due to failed authentication attempts, brute-force defenses, or firewall rules, and release blocks instantly.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
        >
          Refresh Security List
        </button>
      </div>

      {/* Manual Unblock Quick Form */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
        <h3 className="text-sm font-bold text-white mb-1">Manual IP Address Release</h3>
        <p className="text-xs text-slate-400 mb-3">
          Enter an IPv4 or IPv6 address to immediately clear its failure counter and remove any access blocks.
        </p>
        <form onSubmit={handleManualUnblock} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            placeholder="e.g. 192.168.1.100 or 123.45.67.89"
            value={manualIP}
            onChange={(e) => setManualIP(e.target.value)}
            className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            required
          />
          <button
            type="submit"
            disabled={!manualIP.trim() || unblockingIP === manualIP.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            {unblockingIP === manualIP.trim() ? "Unblocking..." : "Release & Unblock IP"}
          </button>
        </form>
      </div>

      {/* Blocked IP Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Restricted IP Addresses
            </span>
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
              {items.length} Tracked
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-500 text-center py-10 text-sm">Inspecting security audit logs...</div>
        ) : items.length === 0 ? (
          <div className="text-slate-400 text-center py-12 px-4 space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
              <Lock className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">No Restricted or Blocked IPs Detected</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All client connections and login attempts are within healthy operational thresholds. Any suspicious attempts will appear here with one-click unblocking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider bg-slate-900/40">
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Failed Attempts</th>
                  <th className="p-4">Last Detected</th>
                  <th className="p-4">Trigger Reason</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4 text-right">Security Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {items.map((it) => (
                  <tr key={it.ip} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">{it.ip}</td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                        {it.failed_count} failures
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{it.last_attempt}</td>
                    <td className="p-4 max-w-xs text-slate-300 truncate" title={it.reason}>
                      {it.reason}
                    </td>
                    <td className="p-4">
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
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleUnblock(it.ip)}
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
    </div>
  );
};

export default PlatformLoginLogsPage;

