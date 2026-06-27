import React from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import JsonViewer from "../../../components/common/JsonViewer";

const AuditLogDetailModal = ({ isOpen, onClose, log }: { isOpen?: boolean; onClose?: unknown; log?: unknown }) => {
  if (!log) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Log Details"
      size="3xl"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Action</p>
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                {log.action || "UNKNOWN"}
              </span>
              <div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Entity</p>
                <p className="text-sm font-semibold text-slate-900">
                  {log.entity_name || "-"}{" "}
                  <span className="font-mono text-slate-500">#{log.entity_id || "N/A"}</span>
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Date / Time</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{new Date(log.created_at).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">User</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{log.user?.full_name || log.user_name || "System"}</p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Branch</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{log.branch?.branch_name || log.branch_name || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Software</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{log.software?.software_name || log.software_module?.software_name || log.software_name || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">IP Address</p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-700">{log.ip_address || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/70 bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">User Agent</p>
                <p className="mt-1 truncate text-xs font-medium text-slate-600" title={log.user_agent}>
                  {log.user_agent || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h3 className="flex items-center text-sm font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                Before (Old Values)
              </h3>
            </div>
            <div className="max-h-96 flex-1 overflow-auto bg-slate-50/60 p-4">
              <JsonViewer data={log.old_values} />
            </div>
          </div>

          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h3 className="flex items-center text-sm font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                After (New Values)
              </h3>
            </div>
            <div className="max-h-96 flex-1 overflow-auto bg-slate-50/60 p-4">
              <JsonViewer data={log.new_values} />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditLogDetailModal;
