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
export default PlatformLoginLogsPage;
